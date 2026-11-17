/* PARIS PAR ARRONDISSEMENT : DÉPUTÉS ET MAIRES D'ARRONDISSEMENT — 17/11/2026 (docs/paris-arrondissements.md).
 *
 * Écrit <sortie>/paris-arrondissements.json :
 *   { v, genere_le,
 *     circonscriptions: { source, methode, par_arrondissement: { "11": ["75-6", "75-7"] } } | null,
 *     maires:           { source, par_arrondissement: { "11": { maire, fonction, debut } } } | null }
 *
 * CIRCONSCRIPTIONS. Source : la table des bureaux de vote déjà collectée (data/circos_bureaux_de_vote.csv,
 * docs/schema_circos_bv.md). Paris y est une seule commune (75056) : l'arrondissement d'un bureau est lu dans les
 * DEUX PREMIERS CHIFFRES de son numéro (« 1104 » = 11e arrondissement, bureau 4). C'est une lecture de Repère, pas un
 * champ de la source : le fichier le dit (« methode »), et le script REFUSE d'écrire si un seul bureau parisien ne se
 * lit pas ainsi, ou si un des 20 arrondissements manque. Un arrondissement partagé garde TOUTES ses circonscriptions :
 * l'adresse reste nécessaire, l'arrondissement réduit seulement la liste.
 *
 * MAIRES D'ARRONDISSEMENT. Source : le Répertoire national des élus (data.gouv.fr), sur le runner seulement (le
 * conteneur ne joint pas data.gouv.fr). Ressource lue sur le runner le 17/11/2026 : elus-conseillers-darrondissements-ca.csv,
 * 503 lignes a Paris, 17 « Maire d'arrondissement », un par secteur. Le script continue de la décrire dans le journal
 * (« décrire avant de deviner »), reconnaît les colonnes par mots-clés comme outils/rne.py,
 * et n'écrit les maires que si au moins 16 arrondissements ont exactement un maire. Sinon : rien, et l'écran garde sa
 * phrase « pas encore publié ». Seuls le nom, la fonction et la date de début sont gardés (invariant 8).
 *
 * Aucune des deux parties ne bloque l'autre ; aucune ne fabrique de donnée. Fichier précédent : jamais écrasé par
 * moins (une partie illisible aujourd'hui garde celle d'hier, avec sa date).
 *
 * Usage (depuis mono/) : node scripts/collecte-paris-arrondissements.mjs ./data ../data/circos_bureaux_de_vote.csv */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const JEU_RNE = "https://www.data.gouv.fr/api/1/datasets/repertoire-national-des-elus-1/";
const UA = { "user-agent": "Repere/collecte-paris-arrondissements (application civique, donnees publiques)" };
const ARR = Array.from({ length: 20 }, (_, i) => String(i + 1));

/* Un CSV simple, guillemets compris (« Paris 11e, Mairie » ne doit pas couper la ligne). */
export function lireCsv(texte) {
  const t = texte.replace(/^﻿/, "");
  const sep = (t.slice(0, 3000).match(/;/g) || []).length > (t.slice(0, 3000).match(/,/g) || []).length ? ";" : ",";
  const lignes = [];
  let ligne = [], champ = "", dedans = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (dedans) {
      if (c === '"' && t[i + 1] === '"') { champ += '"'; i++; } else if (c === '"') dedans = false; else champ += c;
    } else if (c === '"') dedans = true;
    else if (c === sep) { ligne.push(champ); champ = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      ligne.push(champ); champ = "";
      if (ligne.length > 1 || ligne[0] !== "") lignes.push(ligne);
      ligne = [];
    } else champ += c;
  }
  if (champ !== "" || ligne.length) { ligne.push(champ); lignes.push(ligne); }
  return { entete: lignes[0] || [], lignes: lignes.slice(1) };
}

const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");
export function colonne(entete, mots, sauf = []) {
  return entete.findIndex(h => mots.every(m => norm(h).includes(norm(m))) && !sauf.some(x => norm(h).includes(norm(x))));
}

/* CIRCONSCRIPTIONS PAR ARRONDISSEMENT, depuis les bureaux de vote. Retourne { par, raison }. */
export function circonscriptionsParArrondissement({ entete, lignes }) {
  const cCom = entete.indexOf("codeCommune"), cCirc = entete.indexOf("codeCirconscription"), cNum = entete.indexOf("numeroBureauVote");
  if (cCom < 0 || cCirc < 0 || cNum < 0) return { par: null, raison: "colonnes attendues absentes : " + JSON.stringify(entete) };
  const par = {}, illisibles = [];
  let n = 0;
  for (const l of lignes) {
    const com = (l[cCom] || "").trim();
    if (com !== "75056" && !/^751(0[1-9]|1\d|20)$/.test(com)) continue;
    n++;
    const num = (l[cNum] || "").trim(), circ = (l[cCirc] || "").trim();
    const a = /^751/.test(com) ? String(Number(com.slice(3))) : /^\d{4}$/.test(num) ? String(Number(num.slice(0, 2))) : null;
    const nc = /^75(0[1-9]|1[0-8])$/.test(circ) ? Number(circ.slice(2)) : null;
    if (!a || !ARR.includes(a) || !nc) { illisibles.push(`${com}/${num}/${circ}`); continue; }
    (par[a] ||= new Set()).add(`75-${nc}`);
  }
  if (!n) return { par: null, raison: "aucun bureau de vote parisien dans la table" };
  if (illisibles.length) return { par: null, raison: `${illisibles.length} bureau(x) parisien(s) illisible(s), ex. ${illisibles.slice(0, 5).join(", ")} : la lecture du numéro de bureau n'est pas sûre, rien n'est écrit` };
  const manquants = ARR.filter(a => !par[a]);
  if (manquants.length) return { par: null, raison: `arrondissement(s) sans bureau : ${manquants.join(", ")}` };
  return { par: Object.fromEntries(ARR.map(a => [a, [...par[a]].sort((x, y) => Number(x.slice(3)) - Number(y.slice(3)))])), raison: null, bureaux: n };
}

/* L'arrondissement d'une ligne du RNE : code INSEE 75101 à 75120, ou libellé « Paris 11e », « Paris 1er », ou
   « Paris Centre » (secteur des 1er à 4e). null si la ligne n'est pas un arrondissement de Paris. */
export function arrondissementsDe(code, libelle) {
  const c = String(code || "").trim();
  if (/^751(0[1-9]|1\d|20)$/.test(c)) return [String(Number(c.slice(3)))];
  const l = String(libelle || "");
  if (/paris\s*centre/i.test(l)) return ["1", "2", "3", "4"];
  /* Libelles lus sur le runner le 17/11/2026 (elus-conseillers-darrondissements-ca.csv) : « Paris 11Eme Secteur »,
     « Paris 1Er Secteur ». Il n'y a que 17 secteurs (1er, puis 5e a 20e) : le 1er secteur est Paris Centre, qui
     reunit les 1er a 4e arrondissements depuis juillet 2020. */
  const m = /paris\s+(\d{1,2})\s*(?:er|eme|ème|e)?\b(\s*secteur)?/i.exec(l);
  if (!m || !ARR.includes(String(Number(m[1])))) return null;
  return m[2] && Number(m[1]) === 1 ? ["1", "2", "3", "4"] : [String(Number(m[1]))];
}

/* MAIRES D'ARRONDISSEMENT, depuis une table du RNE. Retourne { par, raison }. */
export function mairesParArrondissement({ entete, lignes }) {
  const cCode = colonne(entete, ["code", "commune"]), cLib = colonne(entete, ["libelle", "commune"]);
  const cSect = colonne(entete, ["arrondissement"]) >= 0 ? colonne(entete, ["arrondissement"]) : colonne(entete, ["secteur"]);
  const cNom = colonne(entete, ["nom", "elu"], ["prenom"]), cPre = colonne(entete, ["prenom"]);
  const cFon = colonne(entete, ["libelle", "fonction"]), cDeb = colonne(entete, ["debut", "fonction"]);
  if (cNom < 0 || cPre < 0 || cFon < 0 || (cCode < 0 && cLib < 0 && cSect < 0)) return { par: null, raison: "colonnes non reconnues : " + JSON.stringify(entete) };
  const par = {}, doublons = new Set();
  for (const l of lignes) {
    const fonction = (l[cFon] || "").trim();
    if (!/^maire\b/i.test(fonction)) continue;                       /* « Maire d'arrondissement », « Maire de secteur » ; jamais « adjoint » */
    const arr = arrondissementsDe(cCode >= 0 ? l[cCode] : "", [cSect >= 0 ? l[cSect] : "", cLib >= 0 ? l[cLib] : ""].join(" "));
    if (!arr) continue;
    const fiche = { maire: `${(l[cPre] || "").trim()} ${(l[cNom] || "").trim()}`.trim(), fonction, debut: cDeb >= 0 ? (l[cDeb] || "").trim() || null : null };
    for (const a of arr) { if (par[a] && par[a].maire !== fiche.maire) doublons.add(a); par[a] = fiche; }
  }
  for (const a of doublons) delete par[a];
  const n = Object.keys(par).length;
  if (n < 16) return { par: null, raison: `${n} arrondissement(s) avec un seul maire lu (${doublons.size} en double) : moins de 16, rien n'est écrit` };
  return { par, raison: null };
}

/* DECRIRE AVANT DE DEVINER : les lignes de Paris d'une table du RNE, en comptes (secteurs, fonctions), sans
   aucun nom d'elu dans le journal. */
export function resumeParis({ entete, lignes }) {
  const cDep = colonne(entete, ["code", "departement"]), cCom = colonne(entete, ["code", "commune"]);
  const cSect = colonne(entete, ["secteur"]), cFon = colonne(entete, ["libelle", "fonction"]);
  const paris = lignes.filter(l => (cDep >= 0 && String(l[cDep]).trim() === "75") || (cCom >= 0 && /^75/.test(String(l[cCom]).trim())));
  const compter = i => { const m = {}; if (i >= 0) for (const l of paris) { const v = String(l[i] || "").trim() || "(vide)"; m[v] = (m[v] || 0) + 1; } return m; };
  return { lignes: paris.length, communes: compter(cCom), secteurs: compter(cSect), fonctions: compter(cFon) };
}
function decrireParis(titre, table) {
  const r = resumeParis(table);
  console.log(`::notice title=paris-rne::${titre} : ${r.lignes} ligne(s) a Paris ; codes commune ${JSON.stringify(r.communes)} ; secteurs ${JSON.stringify(r.secteurs)} ; fonctions ${JSON.stringify(r.fonctions)}`);
}

async function lireRne(fetchFn = fetch) {
  const meta = await (await fetchFn(JEU_RNE, { headers: UA })).json();
  const ress = (meta.resources || []).map(r => ({ titre: r.title || "", url: r.url, maj: r.last_modified || null }));
  console.log(`::notice title=paris-rne::ressources du RNE : ${ress.map(r => r.titre).join(" | ")}`);
  const r = ress.find(x => /arrondissement/i.test(x.titre));
  if (!r) return { par: null, raison: "aucune ressource « arrondissement » dans le RNE (titres ci-dessus)" };
  const table = lireCsv(await (await fetchFn(r.url, { headers: UA })).text());
  console.log(`::notice title=paris-rne::${r.titre}, modifiée ${r.maj}, entête = ${JSON.stringify(table.entete)} ; 1re ligne = ${JSON.stringify(table.lignes[0] || [])}`);
  decrireParis(r.titre, table);
  /* 17/11/2026, premier passage sur le runner : le fichier des conseillers d'arrondissement ne donne qu'un
     arrondissement avec un maire. Les maires d'arrondissement de Paris sont aussi conseillers de Paris : le
     fichier des conseillers municipaux est DECRIT ici (rien n'en est lu) pour choisir sur pieces. */
  const cm = ress.find(x => /municipaux/i.test(x.titre));
  if (cm) { try { decrireParis(cm.titre, lireCsv(await (await fetchFn(cm.url, { headers: UA })).text())); } catch (e) { console.log(`::notice title=paris-rne::${cm.titre} illisible (${e.message})`); } }
  const res = mairesParArrondissement(table);
  return { ...res, source: { producteur: "Ministère de l'Intérieur — Répertoire national des élus", licence: "Licence Ouverte 2.0", url: "https://www.data.gouv.fr/fr/datasets/repertoire-national-des-elus-1/", ressource: r.titre, mis_a_jour_le: r.maj ? String(r.maj).slice(0, 10) : null } };
}

async function main() {
  const [sortie, csvBureaux] = process.argv.slice(2);
  if (!sortie) { console.error("usage : collecte-paris-arrondissements.mjs <sortie> <circos_bureaux_de_vote.csv>"); process.exit(2); }
  const dest = path.join(sortie, "paris-arrondissements.json");
  const avant = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, "utf8")) : {};
  const jour = new Date().toISOString().slice(0, 10);
  let circonscriptions = avant.circonscriptions || null, maires = avant.maires || null;

  try {
    const r = circonscriptionsParArrondissement(lireCsv(fs.readFileSync(csvBureaux, "utf8")));
    if (r.par) {
      circonscriptions = {
        source: { producteur: "Bureaux de vote et circonscriptions législatives (données officielles des élections législatives 2024, republiées sur data.gouv.fr)", licence: "Licence Ouverte", url: "https://www.data.gouv.fr/api/1/datasets/r/ed6c2f24-2b83-4a26-a1a2-14c928b58b0b", releve_le: jour },
        methode: "Calcul Repère : l'arrondissement d'un bureau de vote est lu dans les deux premiers chiffres de son numéro. Un arrondissement partagé garde toutes ses circonscriptions.",
        par_arrondissement: r.par,
      };
      console.log(`paris-arrondissements : circonscriptions lues sur ${r.bureaux} bureaux, ${Object.values(r.par).filter(c => c.length > 1).length} arrondissement(s) partagé(s)`);
      /* 17/11/2026 : le detail, pour le comparer a la carte officielle (donnee publique, aucun nom). */
      for (const [a, c] of Object.entries(r.par)) console.log(`  ${a}${a === "1" ? "er" : "e"} arrondissement : ${c.join(", ")}`);
    } else console.log(`::warning::paris-arrondissements : circonscriptions non écrites — ${r.raison}`);
  } catch (e) { console.log(`::warning::paris-arrondissements : table des bureaux illisible (${e.message})`); }

  try {
    const r = await lireRne();
    if (r.par) { maires = { source: { ...r.source, releve_le: jour }, par_arrondissement: r.par }; console.log(`paris-arrondissements : ${Object.keys(r.par).length} maire(s) d'arrondissement`); }
    else console.log(`::warning::paris-arrondissements : maires non écrits — ${r.raison}`);
  } catch (e) { console.log(`::warning::paris-arrondissements : RNE injoignable (${e.message})`); }

  if (!circonscriptions && !maires) { console.log("paris-arrondissements : rien de lu, aucun fichier écrit"); process.exitCode = 1; return; }
  fs.writeFileSync(dest, JSON.stringify({ v: 1, genere_le: jour, circonscriptions, maires }));
  console.log(`paris-arrondissements.json : circonscriptions ${circonscriptions ? "oui" : "non"}, maires ${maires ? "oui" : "non"}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main();
