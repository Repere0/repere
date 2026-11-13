#!/usr/bin/env node
/* RESUMES « EN CLAIR » DES TEXTES VOTES — 12/11/2026 (roadmap beta ; note de conception du 12/11/2026, voie 1).
 *
 * HORS LIGNE, SANS RESEAU, SANS IA : ce script n'ecrit AUCUN resume. Le resume est redige en session a partir du
 * texte officiel que fournit le porteur ; le script le CONTROLE, le range en brouillon, et ne publie que ce que
 * le porteur a valide. Il ne pose jamais « valide: true » : seul le porteur le fait, a la main, dans le fichier.
 *
 * TROIS GESTES (depuis mono/) :
 *   1. Brouillon :  node scripts/resumes-clairs.mjs --brouillon DLR5L17N51670 --texte officiel.txt --resume resume.txt \
 *                        --url https://www.assemblee-nationale.fr/dyn/17/dossiers/DLR5L17N51670 [--titre "..."] [--scrutin 9759]
 *      controle le resume contre le texte officiel ; refuse d'ecrire s'il contient un nombre ou un nom propre absent
 *      du texte, ou un mot de jugement ; sinon ecrit ../data/resumes/<dossier>.json (valide: false) et garde le
 *      texte officiel a cote (../data/resumes/textes/<dossier>.txt, jamais publie) pour pouvoir recontroler.
 *   2. Verifier :   node scripts/resumes-clairs.mjs --verifier
 *      relit tous les fichiers ; sort en erreur si un resume VALIDE ne passe plus les controles ou si son texte
 *      officiel a change depuis la validation (empreinte sha256).
 *   3. Publier :    node scripts/resumes-clairs.mjs --publier ./data
 *      ecrit data/resumes-clairs.json avec les seuls resumes valides, controles, dont le texte n'a pas change.
 *      Un resume qui ne passe plus n'est pas publie : l'application dit « Pas encore de resume pour ce texte ».
 *
 * LIMITES ECRITES : le controle des faits est LITTERAL (nombres et noms propres). Il ne voit ni un contresens ni une
 * omission, et il ne juge pas un mot en debut de phrase (sa majuscule ne dit rien). La relecture du porteur reste
 * le garde-fou qui compte. Aucun des cinq garde-fous ne suffit seul. */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resumeAffichable } from "../packages/core/src/resumes.js";
import { JUGEMENT_RESUME } from "../packages/data-utils/src/invariants.js";

const ICI = path.dirname(fileURLToPath(import.meta.url));
export const DOSSIER = path.join(ICI, "..", "..", "data", "resumes");
export const REF = /^DLR5L\d+N\d+$/;
/* Mots de jugement ou de comparaison de valeur (invariant 3, garde-fou 4) : la liste vit dans invariants.js, seul
   fichier autorise a les citer (tests/invariants.test.mjs). */
export { JUGEMENT_RESUME as JUGEMENT };
const propre = s => String(s || "").replace(/[   ]/g, " ").replace(/[’ʼ]/g, "'");
export const empreinte = texte => createHash("sha256").update(propre(texte).replace(/\r\n/g, "\n").trim()).digest("hex");
const plat = s => propre(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* REGLE PURE (garde-fous 3 et 4). Tout nombre et tout nom propre du resume doit se lire dans le texte officiel. */
export function controlerResume(resume, texteOfficiel) {
  const r = propre(resume), source = plat(texteOfficiel);
  /* Les nombres : les espaces entre chiffres ne comptent pas (« 1 500 » = « 1500 »), les bords si (« 45 » n'est pas dans « 1945 »). */
  const chiffresSource = source.replace(/(\d)\s+(?=\d)/g, "$1");
  const nombres = [...new Set((r.match(/\d[\d\s]*(?:[.,]\d+)?/g) || []).map(n => n.replace(/\s+/g, "").replace(/[.,]$/, "")))];
  const nombresAbsents = nombres.filter(n => !new RegExp(`(?<![\\d,.])${n.replace(/[.,]/g, "[.,]")}(?![\\d]|[.,]\\d)`).test(chiffresSource));
  /* Les noms propres : un mot a majuscule qui n'ouvre pas une phrase. */
  const noms = new Set();
  for (const phrase of r.split(/(?<=[.!?:;])\s+|\n+/)) {
    const mots = phrase.trim().split(/\s+/);
    mots.slice(1).forEach(m => { const mot = m.replace(/^[«"'(\[]+|[»"'),.;:!?\]]+$/g, "").replace(/^[ldLD]'/, ""); if (/^\p{Lu}[\p{L}-]+$/u.test(mot)) noms.add(mot); });
  }
  const nomsAbsents = [...noms].filter(n => !new RegExp(`(?<![a-z0-9])${plat(n).replace(/[-]/g, "[- ]")}(?![a-z0-9])`).test(source));
  const jugements = [...new Set((r.match(JUGEMENT_RESUME) || []).map(m => m.toLowerCase()))];
  const longueur = r.trim().length;
  const erreurs = [
    ...nombresAbsents.map(n => `nombre absent du texte officiel : ${n}`),
    ...nomsAbsents.map(n => `nom propre absent du texte officiel : ${n}`),
    ...jugements.map(j => `mot de jugement : ${j}`),
    ...(longueur < 40 ? ["resume trop court (moins de 40 caracteres)"] : []),
    ...(longueur > 700 ? [`resume trop long (${longueur} caracteres, 700 au plus : 3 a 5 phrases)`] : []),
  ];
  return { ok: erreurs.length === 0, erreurs };
}

const lireJson = f => JSON.parse(fs.readFileSync(f, "utf8"));
const fichiers = dossier => (fs.existsSync(dossier) ? fs.readdirSync(dossier).filter(f => f.endsWith(".json")).sort() : []);

/* L'etat d'un fichier de resume : publiable, brouillon, ou en defaut (et pourquoi). */
export function etat(r, texteOfficiel) {
  const defauts = [];
  if (!r || !REF.test(r.dossier || "")) defauts.push("reference de dossier absente ou mal formee");
  if (texteOfficiel == null) defauts.push("texte officiel absent (data/resumes/textes/) : impossible de recontroler");
  else {
    if (empreinte(texteOfficiel) !== (r.source || {}).sha256) defauts.push("le texte officiel a change depuis le brouillon (empreinte differente)");
    defauts.push(...controlerResume(r.resume, texteOfficiel).erreurs);
  }
  if (r && r.valide === true && !resumeAffichable(r)) defauts.push("valide mais non affichable (source https et date de releve obligatoires)");
  return { valide: !!r && r.valide === true, defauts };
}

export function brouillon({ dossier, texte, resume, url, titre = null, scrutins = [], jour, sortie = DOSSIER }) {
  if (!REF.test(dossier)) throw new Error(`reference de dossier mal formee : ${dossier} (attendu : DLR5L17N…)`);
  if (!/^https:\/\//.test(url || "")) throw new Error("--url : l'adresse https du texte officiel est obligatoire (invariant 4)");
  if (!String(texte || "").trim()) throw new Error("texte officiel vide");
  const c = controlerResume(resume, texte);
  if (!c.ok) throw Object.assign(new Error("brouillon refuse :\n  - " + c.erreurs.join("\n  - ")), { erreurs: c.erreurs });
  fs.mkdirSync(path.join(sortie, "textes"), { recursive: true });
  fs.writeFileSync(path.join(sortie, "textes", dossier + ".txt"), propre(texte).replace(/\r\n/g, "\n").trim() + "\n");
  const fiche = {
    dossier, scrutins: scrutins.map(String),
    source: { producteur: "Assemblée nationale", url, releve_le: jour, sha256: empreinte(texte) },
    titre_officiel: titre,
    resume: propre(resume).trim(),
    methode: { voie: "session", controles: ["nombres", "noms", "vocabulaire", "longueur"] },
    valide: false, valide_le: null,
  };
  fs.writeFileSync(path.join(sortie, dossier + ".json"), JSON.stringify(fiche, null, 1) + "\n");
  return fiche;
}

/* Tous les fichiers, avec leur etat. */
export function inventaire(dossier = DOSSIER) {
  return fichiers(dossier).map(f => {
    const r = lireJson(path.join(dossier, f));
    const t = path.join(dossier, "textes", f.replace(/\.json$/, ".txt"));
    return { fichier: f, r, ...etat(r, fs.existsSync(t) ? fs.readFileSync(t, "utf8") : null) };
  });
}

/* Le fichier publie : seulement valide ET sans defaut. Cles : la reference du dossier et « scrutin:<numero> ». */
export function publier(dossierData, { dossier = DOSSIER, jour } = {}) {
  const inv = inventaire(dossier);
  const resumes = {};
  for (const x of inv.filter(x => x.valide && !x.defauts.length)) {
    const fiche = { dossier: x.r.dossier, resume: x.r.resume, source: { producteur: x.r.source.producteur, url: x.r.source.url, releve_le: x.r.source.releve_le }, valide: true, valide_le: x.r.valide_le || null };
    resumes[x.r.dossier] = fiche;
    for (const n of x.r.scrutins || []) resumes["scrutin:" + n] = fiche;
  }
  fs.writeFileSync(path.join(dossierData, "resumes-clairs.json"), JSON.stringify({ v: 1, genere_le: jour, resumes }));
  return { publies: inv.filter(x => x.valide && !x.defauts.length).length, brouillons: inv.filter(x => !x.valide).length, ecartes: inv.filter(x => x.valide && x.defauts.length) };
}

function main() {
  const a = process.argv.slice(2);
  const opt = n => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : null; };
  const tous = n => a.flatMap((x, i) => (x === n ? [a[i + 1]] : []));
  const jour = new Date().toISOString().slice(0, 10);
  if (a[0] === "--brouillon") {
    const f = brouillon({ dossier: a[1], texte: fs.readFileSync(opt("--texte"), "utf8"), resume: fs.readFileSync(opt("--resume"), "utf8"), url: opt("--url"), titre: opt("--titre"), scrutins: tous("--scrutin"), jour });
    console.log(`brouillon ecrit : data/resumes/${f.dossier}.json (valide: false). Au porteur de le relire et de poser « valide: true » et « valide_le ».`);
  } else if (a[0] === "--verifier") {
    const inv = inventaire();
    let rouges = 0;
    for (const x of inv) {
      const grave = x.valide && x.defauts.length;
      if (grave) rouges++;
      console.log(`${grave ? "ECHEC " : x.valide ? "valide" : "brouil"} ${x.fichier}${x.defauts.length ? " : " + x.defauts.join(" ; ") : ""}`);
    }
    console.log(`resumes : ${inv.length} fichier(s), ${inv.filter(x => x.valide).length} valide(s), ${rouges} en defaut`);
    process.exit(rouges ? 1 : 0);
  } else if (a[0] === "--publier") {
    const b = publier(a[1] || "./data", { jour });
    for (const x of b.ecartes) console.log(`::warning::resume valide NON publie (${x.fichier}) : ${x.defauts.join(" ; ")}`);
    console.log(`resumes en clair : ${b.publies} publie(s), ${b.brouillons} brouillon(s), ${b.ecartes.length} ecarte(s)`);
    if (b.ecartes.length) process.exit(1);
  } else {
    console.error("usage : resumes-clairs.mjs --brouillon <dossier> --texte f --resume f --url https://… [--titre t] [--scrutin n] | --verifier | --publier <data>");
    process.exit(2);
  }
}
if (import.meta.url === `file://${process.argv[1]}`) { try { main(); } catch (e) { console.error("resumes : " + e.message); process.exit(2); } }
