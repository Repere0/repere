#!/usr/bin/env node
/* SITES OFFICIELS DES MAIRIES D'ÎLE-DE-FRANCE — 30/10/2026 (D28, ADR 0005).
 *
 * Usage : node scripts/collecte-sites-mairies.mjs ./data
 *
 * Source : Annuaire de l'administration (DILA, Service-Public), Licence Ouverte 2.0,
 * API Explore v2.1 :
 *   https://api-lannuaire.service-public.gouv.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration
 * Ecrit data/mairies-idf.json : { v, genere_le, source, communes: { "77288": { nom, site } } }.
 * Seulement les communes de la beta (data/communes-beta.json).
 *
 * CE QUE LE SCRIPT NE FAIT JAMAIS : deviner une adresse (« ville-xxx.fr »), ouvrir le
 * site de la mairie, en lire le contenu. Il recopie l'adresse declaree dans l'annuaire.
 *
 * CHAMPS (verification par lecture, V18, 30/10/2026 ; l'API reste injoignable depuis la
 * session de travail, le script n'a tourne que hors ligne) :
 * - code_insee_commune : confirme par la note DILA du 17/07/2024 (« Info nouvelle API
 *   annuaire local »), exemple "31496" ;
 * - site_internet : confirme par le porteur (documentation DILA, aout 2024) ;
 * - type de service : la note DILA parle de « code_type_service_local » (le « code-pivot ») ;
 *   le script lit aussi « type_service_local » et « type_organisme », dans « pivot » ou a la
 *   racine de la fiche, parce que la forme exacte n'a pas ete vue sur une vraie reponse.
 * Si les champs manquent, le script S'ARRETE en listant les champs recus (journal de la CI),
 * et n'ecrit rien plutot que d'ecrire faux.
 * PAGINATION : le point d'export (/exports/json) rend tout sans limite ; s'il est refuse,
 * repli sur /records par pages de 100 (limite de l'API), offset jusqu'a 9 900. */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const API = "https://api-lannuaire.service-public.gouv.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration";
const DEPS_IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];

const beta = JSON.parse(fs.readFileSync(path.join(SORTIE, "communes-beta.json"), "utf8")).communes || {};
const json = v => { if (v === null || v === undefined || v === "") return null; if (typeof v !== "string") return v; try { return JSON.parse(v); } catch { return v; } };
const CLES_TYPE = ["code_type_service_local", "type_service_local", "type_organisme"];
const typesDe = rec => {
  const pivot = json(rec.pivot);
  const depuisPivot = (Array.isArray(pivot) ? pivot : pivot ? [pivot] : []).flatMap(p => CLES_TYPE.map(k => p && p[k]));
  const racine = CLES_TYPE.map(k => json(rec[k])).flat();
  return [...depuisPivot, ...racine].filter(x => typeof x === "string").map(x => x.toLowerCase());
};
export const aUnType = rec => "pivot" in rec || CLES_TYPE.some(k => k in rec);
export const estMairie = rec => {
  const types = typesDe(rec);
  const nom = String(rec.nom || "").toLowerCase();
  /* La mairie principale, pas une annexe ni une mairie deleguee. */
  return types.includes("mairie") && !/annexe|d[ée]l[ée]gu[ée]e|arrondissement/.test(nom);
};
export const siteDe = rec => {
  const s = json(rec.site_internet);
  const liste = Array.isArray(s) ? s : s ? [s] : [];
  for (const x of liste) {
    const v = typeof x === "string" ? x : x && (x.valeur || x.url);
    if (typeof v === "string" && /^https?:\/\/[^\s]+\.[a-z]{2,}/i.test(v.trim())) return v.trim();
  }
  return null;
};

/* Toutes les fiches d'un departement : export d'abord, sinon /records page par page. */
async function fichesDe(dep) {
  const where = encodeURIComponent(`startswith(code_insee_commune, "${dep}")`);
  const r = await fetch(`${API}/exports/json?where=${where}`, { headers: { accept: "application/json" } });
  if (r.ok) { const l = await r.json(); if (Array.isArray(l)) return l; }
  console.log(`DILA ${dep} : export indisponible (HTTP ${r.status}), repli sur /records pagine`);
  const toutes = [];
  for (let offset = 0; offset <= 9900; offset += 100) {
    const p = await fetch(`${API}/records?where=${where}&limit=100&offset=${offset}`, { headers: { accept: "application/json" } });
    if (!p.ok) throw new Error(`DILA ${dep} : /records HTTP ${p.status} (offset ${offset})`);
    const page = (await p.json()).results || [];
    toutes.push(...page);
    if (page.length < 100) return toutes;
  }
  console.warn(`DILA ${dep} : plus de 10 000 fiches, limite de /records atteinte : liste tronquee`);
  return toutes;
}

const communes = {};
let lus = 0;
export async function principal() {
for (const dep of DEPS_IDF) {
  let recs;
  try { recs = await fichesDe(dep); } catch (e) { console.error(e.message); process.exit(2); }
  if (recs.length && !("code_insee_commune" in recs[0] && "site_internet" in recs[0] && aUnType(recs[0]))) {
    console.error(`DILA ${dep} : champs attendus absents (code_insee_commune, site_internet, et pivot ou ${CLES_TYPE.join(" / ")}) ; champs recus : ${Object.keys(recs[0]).join(", ")}`);
    process.exit(3);
  }
  lus += recs.length;
  for (const rec of recs) {
    const insee = String(rec.code_insee_commune || "");
    if (!beta[insee] || communes[insee] || !estMairie(rec)) continue;
    const site = siteDe(rec);
    if (site) communes[insee] = { nom: beta[insee], site };
  }
}
const sortie = {
  v: 1,
  genere_le: new Date().toISOString().slice(0, 10),
  source: { producteur: "DILA — Annuaire de l'administration (Service-Public)", licence: "Licence Ouverte 2.0", url: API, releve_le: new Date().toISOString().slice(0, 10) },
  couverture: { communes_beta: Object.keys(beta).length, avec_site: Object.keys(communes).length },
  communes,
};
fs.writeFileSync(path.join(SORTIE, "mairies-idf.json"), JSON.stringify(sortie));
console.log(`mairies-idf.json : ${lus} fiches lues, ${Object.keys(communes).length} sites sur ${Object.keys(beta).length} communes de la beta`);
if (lus && !Object.keys(communes).length) console.warn("AUCUN site retenu alors que des fiches ont ete lues : verifier les noms de champs (voir docs/data/sites-mairies.md).");
}
if (import.meta.url === `file://${process.argv[1]}`) principal();
