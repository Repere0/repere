/* COLLECTE DE LA PRÉSIDENTIELLE 2027 — contrôle (09/11/2026) et collecte automatique (10/11/2026).
 *
 * DEUX ÉTAPES, dans cet ordre, appelées chaque matin par outils/pipeline.sh :
 *   1. node scripts/collecte-presidentielle.mjs --collecter
 *      lit les sources DÉCLARÉES dans data/presidentielle-2027/sources.json et met à jour les fichiers
 *      versionnés. Ne plante jamais : une source injoignable, changée ou mal formée laisse le fichier
 *      PRÉCÉDENT intact, et l'erreur est écrite dans le journal (décision 1 du porteur, 10/11/2026).
 *   2. node scripts/collecte-presidentielle.mjs <dossier de sortie> [dossier source]
 *      contrôle les quatre fichiers avec la règle de @repere/core et les recopie dans les données
 *      publiées. Une entrée mal formée fait ÉCHOUER cette étape : rien n'est publié à moitié.
 *
 * AUJOURD'HUI : sources.json est VIDE. Aucune source officielle n'est publiée (la liste des candidats
 * est arrêtée par le Conseil constitutionnel en mars 2027), donc aucun format n'a pu être relu.
 * Brancher une source = ajouter une ligne à sources.json après avoir lu sa vraie réponse (skill
 * ingerer-une-source). Aucune adresse n'est écrite dans ce script.
 *
 * UNE SOURCE (type PresidentialCollectSource, types/elections.ts) :
 *   { id, type: "candidats" | "debats" | "meetings", format: "json" | "rss", url, producteur,
 *     publier: true | false, liste?: "chemin.du.tableau", champs?: { champCible: "cléSource" | { fixe } } }
 *
 * CE QUE LE SCRIPT NE FAIT JAMAIS :
 * - inventer ou compléter : un champ que la source ne donne pas reste absent (décision 2) ; une entrée
 *   refusée par la règle de @repere/core fait refuser TOUTE la source, jamais une partie ;
 * - publier un flux RSS : un flux donne la date de l'annonce, pas celle de l'événement. Ses entrées
 *   partent dans data/auto/presidentielle-brouillon.md, à relire (même règle que D82) ;
 * - publier une source dont `publier` n'est pas exactement true : brouillon aussi ;
 * - lire du HTML : aucune page réelle n'existe pour écrire un sélecteur, et un sélecteur cassé
 *   publierait un mauvais nom sans relecture. shortcut: pas de lecteur HTML, à revoir quand une source
 *   officielle sans JSON ni flux sera publiée ;
 * - réécrire un type dont une source a échoué : tout ou rien par fichier.
 *
 * Essai à blanc (aucun réseau, aucune écriture) :
 *   node scripts/collecte-presidentielle.mjs --collecter --dry-run --fixtures tests/fixtures/presidentielle */
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import { candidatValide, debatValide, lirePresidentielle, meetingValide } from "../packages/core/src/presidentielle.js";
import { lireFlux } from "./collecte-rss-mairies.mjs";

export const FICHIERS = ["candidats", "debats", "meetings", "meta"];

export function controler(dossierSource) {
  const brut = {};
  for (const f of FICHIERS) {
    const p = path.join(dossierSource, f + ".json");
    if (!fs.existsSync(p)) throw new Error(`fichier absent : ${p}`);
    brut[f] = JSON.parse(fs.readFileSync(p, "utf8"));
  }
  const lu = lirePresidentielle(brut);
  for (const f of ["candidats", "debats", "meetings"]) if (!lu.lus[f]) throw new Error(`${f}.json ne porte pas la liste « ${f} »`);
  if (!lu.meta) throw new Error("meta.json : lastUpdate (AAAA-MM-JJ) et source (producteur, url https) sont obligatoires");
  if (lu.ecartes > 0) throw new Error(`${lu.ecartes} entrée(s) mal formée(s) ou sans source : rien n'est publié`);
  return { brut, lu };
}

/* ───────────── collecte automatique (10/11/2026) ───────────── */

const TYPES = { candidats: candidatValide, debats: debatValide, meetings: meetingValide };
const DELAI_MS = 8000;
const TAILLE_MAX = 2_000_000;
const https = x => typeof x === "string" && /^https:\/\/[^\s]+$/.test(x);
const parseur = new Parser();

export function sourceValide(s) {
  return !!s && typeof s.id === "string" && s.id !== "" && s.type in TYPES && (s.format === "json" || s.format === "rss")
    && https(s.url) && typeof s.producteur === "string" && s.producteur.trim() !== "";
}

const suivre = (objet, chemin) => String(chemin).split(".").reduce((o, k) => (o == null ? undefined : o[k]), objet);

/* Une entrée lue : seuls les champs déclarés, et seulement ceux que la source donne. Jamais de valeur
   par défaut, sauf `sourceUrl` : l'adresse où l'entrée a été lue, ce qui est vrai par construction. */
export function composer(element, source) {
  const e = {};
  for (const [cible, regle] of Object.entries(source.champs || {})) {
    const v = typeof regle === "string" ? suivre(element, regle) : regle && regle.fixe;
    if (v !== undefined) e[cible] = v;
  }
  if (source.type !== "candidats" && e.sourceUrl === undefined) e.sourceUrl = source.url;
  return e;
}

async function lireJson(url, fetchImpl) {
  const ctrl = new AbortController();
  const minuterie = setTimeout(() => ctrl.abort(), DELAI_MS);
  try {
    const r = await fetchImpl(url, { signal: ctrl.signal, redirect: "follow", headers: { Accept: "application/json", "User-Agent": "Repere-collecte-presidentielle" } });
    if (r.status !== 200) throw new Error(`HTTP ${r.status}`);
    const texte = await r.text();
    if (texte.length > TAILLE_MAX) throw new Error("réponse trop volumineuse");
    try { return JSON.parse(texte); } catch { throw new Error("la réponse n'est pas du JSON (la source a peut-être changé de format)"); }
  } catch (e) {
    throw new Error(e.name === "AbortError" ? "délai dépassé" : e.message);
  } finally {
    clearTimeout(minuterie);
  }
}

/* Lit UNE source. Rend { entrees } ou lève une erreur lisible ; l'appelant ne laisse rien remonter. */
export async function lireSource(source, fetchImpl) {
  if (source.format === "rss") {
    const r = await lireFlux(source.url, { fetchImpl });
    if (!r.ok) throw new Error(r.raison);
    const flux = await parseur.parseString(r.texte);
    return { brouillon: (flux.items || []).filter(i => i.title && https(i.link)).map(i => ({ titre: i.title.trim(), publie_le: (i.isoDate || "").slice(0, 10), lien: i.link })) };
  }
  const corps = await lireJson(source.url, fetchImpl);
  const tableau = source.liste ? suivre(corps, source.liste) : corps;
  if (!Array.isArray(tableau)) throw new Error(`pas de tableau à « ${source.liste || "racine"} » (la source a peut-être changé de format)`);
  const entrees = tableau.map(x => composer(x, source));
  const refusees = entrees.filter(e => !TYPES[source.type](e)).length;
  if (refusees) throw new Error(`${refusees} entrée(s) sur ${entrees.length} refusée(s) par la règle de @repere/core : source écartée en entier`);
  const ids = entrees.map(e => e.id);
  if (new Set(ids).size !== ids.length) throw new Error("deux entrées portent le même identifiant");
  return { entrees };
}

const lireFichier = (dossier, f) => { try { return JSON.parse(fs.readFileSync(path.join(dossier, f + ".json"), "utf8")); } catch { return null; } };

/* Toute la collecte. Ne lève jamais : tout échec devient une ligne du journal, et le fichier concerné
   garde sa version précédente. Rend ce qui serait écrit (`ecrits`), le brouillon et le journal. */
export async function collecter({ dossier, sources, fetchImpl = fetch, aujourdhui = new Date().toISOString().slice(0, 10), ecrire = true, brouillonVers = null }) {
  const journal = [];
  const note = (niveau, source, message) => journal.push({ niveau, source, message });
  const ecrits = {};
  const aRelire = [];
  const declarees = Array.isArray(sources) ? sources : [];
  const lues = new Map();
  for (const s of declarees) {
    if (!sourceValide(s)) { note("erreur", (s && s.id) || "?", "déclaration de source mal formée : ignorée"); continue; }
    try {
      lues.set(s, await lireSource(s, fetchImpl));
    } catch (e) {
      lues.set(s, { erreur: e.message });
      note("erreur", s.id, `${s.url} : ${e.message}`);
    }
  }
  /* Les candidats d'abord : une réunion ne vaut que pour un candidat de la liste. */
  let candidatsCourants = ((lireFichier(dossier, "candidats") || {}).candidats || []).map(c => c.id);
  for (const type of ["candidats", "debats", "meetings"]) {
    const duType = [...lues].filter(([s]) => s.type === type);
    for (const [s, r] of duType) {
      if (r.erreur) continue;
      if (r.brouillon) { aRelire.push({ source: s, entrees: r.brouillon }); note("info", s.id, `${r.brouillon.length} entrée(s) de flux mises au brouillon (un flux n'est jamais publié)`); }
      else if (s.publier !== true) { aRelire.push({ source: s, entrees: r.entrees }); note("info", s.id, `${r.entrees.length} entrée(s) mises au brouillon (publier n'est pas true)`); }
    }
    const publiantes = duType.filter(([s]) => s.format === "json" && s.publier === true);
    if (!publiantes.length) continue;
    const enEchec = publiantes.filter(([, r]) => r.erreur).map(([s]) => s.id);
    if (enEchec.length) { note("erreur", type, `${type}.json CONSERVÉ tel quel : source(s) en échec (${enEchec.join(", ")})`); continue; }
    const liste = publiantes.flatMap(([, r]) => r.entrees);
    if (new Set(liste.map(e => e.id)).size !== liste.length) { note("erreur", type, `${type}.json CONSERVÉ : deux sources donnent le même identifiant`); continue; }
    if (type === "meetings") {
      const inconnus = liste.filter(m => !candidatsCourants.includes(m.candidatId)).length;
      if (inconnus) { note("erreur", type, `meetings.json CONSERVÉ : ${inconnus} réunion(s) pour un candidat absent de la liste`); continue; }
    }
    const avant = lireFichier(dossier, type);
    if (JSON.stringify(avant && avant[type]) !== JSON.stringify(liste)) ecrits[type] = { [type]: liste };
    note("info", type, `${liste.length} entrée(s) lue(s)${ecrits[type] ? "" : ", fichier inchangé"}`);
    if (type === "candidats") {
      candidatsCourants = liste.map(c => c.id);
      /* La date de vérification n'avance que si la source des candidats a répondu (invariant 9). */
      const [s] = publiantes[0];
      const meta = { lastUpdate: aujourdhui, source: { producteur: s.producteur, url: s.url } };
      const ancienne = lireFichier(dossier, "meta");
      if (!liste.length && ancienne && ancienne.note) meta.note = ancienne.note;
      if (JSON.stringify(ancienne) !== JSON.stringify(meta)) ecrits.meta = meta;
    }
  }
  const brouillon = aRelire.length || journal.some(j => j.niveau === "erreur") ? versBrouillon(aRelire, journal, aujourdhui) : null;
  if (ecrire) {
    for (const [f, contenu] of Object.entries(ecrits)) fs.writeFileSync(path.join(dossier, f + ".json"), JSON.stringify(contenu, null, 2) + "\n");
    if (brouillon !== null && brouillonVers) { fs.mkdirSync(path.dirname(brouillonVers), { recursive: true }); fs.writeFileSync(brouillonVers, brouillon); }
  }
  return { ecrits, brouillon, journal, sources: declarees.length };
}

export function versBrouillon(aRelire, journal, aujourdhui) {
  const l = ["# Présidentielle 2027 : brouillon de collecte", "", `Collecte du ${aujourdhui}. **Rien de ce fichier n'est publié.** Le porteur relit chaque entrée contre sa page, puis la recopie dans data/presidentielle-2027/.`, ""];
  const erreurs = journal.filter(j => j.niveau === "erreur");
  if (erreurs.length) l.push("## Sources en échec", "", ...erreurs.map(j => `- ${j.source} : ${j.message}`), "");
  for (const { source, entrees } of aRelire) {
    l.push(`## ${source.producteur} (${source.type}, ${source.id})`, "", `Lu à : ${source.url}`, "");
    for (const e of entrees) l.push("- " + JSON.stringify(e));
    l.push("");
  }
  return l.join("\n");
}

/* Essai à blanc : les adresses sont servies depuis un dossier (index.json : adresse -> fichier). */
export function fetchDepuisDossier(dossier) {
  const index = JSON.parse(fs.readFileSync(path.join(dossier, "index.json"), "utf8"));
  return async url => {
    if (!(url in index)) throw new Error("adresse injoignable (essai à blanc : absente de index.json)");
    const texte = fs.readFileSync(path.join(dossier, index[url]), "utf8");
    return { status: 200, text: async () => texte };
  };
}

async function principalCollecte(args) {
  const option = nom => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : null; };
  const blanc = args.includes("--dry-run");
  const fixtures = option("--fixtures");
  const dossier = option("--source") || path.resolve(import.meta.dirname, "../../data/presidentielle-2027");
  const declaration = lireFichier(fixtures || dossier, "sources");
  if (!declaration || !Array.isArray(declaration.sources)) { console.log("::warning::présidentielle 2027 : sources.json absent ou illisible, aucune collecte, fichiers conservés"); return; }
  const r = await collecter({
    dossier, sources: declaration.sources, ecrire: !blanc,
    fetchImpl: fixtures ? fetchDepuisDossier(fixtures) : fetch,
    brouillonVers: path.resolve(import.meta.dirname, "../../data/auto/presidentielle-brouillon.md"),
  });
  for (const j of r.journal) console.log(`${j.niveau === "erreur" ? "::warning::" : ""}présidentielle 2027 [${j.source}] ${j.message}`);
  const fichiers = Object.keys(r.ecrits).map(f => f + ".json").join(", ") || "aucun";
  console.log(`présidentielle 2027 : ${r.sources} source(s) déclarée(s) · fichier(s) ${blanc ? "qui seraient écrits" : "écrits"} : ${fichiers}${r.brouillon ? " · brouillon à relire" : ""}${blanc ? " · ESSAI À BLANC, rien n'est écrit" : ""}`);
}

if (import.meta.url === `file://${process.argv[1]}` && process.argv.includes("--collecter")) {
  /* Jamais de sortie non nulle : la collecte ne doit pas arrêter la chaîne (décision 1). */
  await principalCollecte(process.argv.slice(2)).catch(e => console.log(`::warning::présidentielle 2027 : collecte interrompue (${e.message}), fichiers conservés`));
} else if (import.meta.url === `file://${process.argv[1]}`) {
  const sortie = process.argv[2];
  const source = process.argv[3] || path.resolve(import.meta.dirname, "../../data/presidentielle-2027");
  if (!sortie) { console.error("usage : node scripts/collecte-presidentielle.mjs <dossier de sortie> [dossier source]"); process.exit(2); }
  const { brut, lu } = controler(source);
  const cible = path.join(sortie, "presidentielle-2027");
  fs.mkdirSync(cible, { recursive: true });
  for (const f of FICHIERS) fs.writeFileSync(path.join(cible, f + ".json"), JSON.stringify(brut[f]));
  console.log(`présidentielle 2027 : ${lu.candidats.length} candidat(s), ${lu.debats.length} débat(s), ${lu.meetings.length} réunion(s), vérifié le ${lu.meta.lastUpdate}`);
}
