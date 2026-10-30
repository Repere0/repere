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
 * NON VERIFIE DANS LA SESSION QUI L'A ECRIT : l'API etait injoignable depuis
 * l'environnement de travail (proxy). Les noms de champs (pivot, code_insee_commune,
 * site_internet, nom) sont ceux attendus de ce jeu ; s'ils manquent, le script
 * S'ARRETE avec un message, et n'ecrit rien plutot que d'ecrire faux. */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const API = "https://api-lannuaire.service-public.gouv.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration";
const DEPS_IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];

const beta = JSON.parse(fs.readFileSync(path.join(SORTIE, "communes-beta.json"), "utf8")).communes || {};
const json = v => { if (v === null || v === undefined || v === "") return null; if (typeof v !== "string") return v; try { return JSON.parse(v); } catch { return v; } };
const estMairie = rec => {
  const pivot = json(rec.pivot);
  const types = Array.isArray(pivot) ? pivot.map(p => p && p.type_service_local).filter(Boolean) : [];
  const nom = String(rec.nom || "").toLowerCase();
  /* La mairie principale, pas une annexe ni une mairie deleguee. */
  return types.includes("mairie") && !/annexe|d[ée]l[ée]gu[ée]e|arrondissement/.test(nom);
};
const siteDe = rec => {
  const s = json(rec.site_internet);
  const liste = Array.isArray(s) ? s : s ? [s] : [];
  for (const x of liste) {
    const v = typeof x === "string" ? x : x && (x.valeur || x.url);
    if (typeof v === "string" && /^https?:\/\/[^\s]+\.[a-z]{2,}/i.test(v.trim())) return v.trim();
  }
  return null;
};

const communes = {};
let lus = 0;
for (const dep of DEPS_IDF) {
  const where = encodeURIComponent(`startswith(code_insee_commune, "${dep}")`);
  const url = `${API}/exports/json?where=${where}&select=nom,code_insee_commune,pivot,site_internet`;
  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (!r.ok) { console.error(`DILA ${dep} : HTTP ${r.status}`); process.exit(2); }
  const recs = await r.json();
  if (!Array.isArray(recs)) { console.error(`DILA ${dep} : reponse inattendue (pas une liste)`); process.exit(2); }
  if (recs.length && !("pivot" in recs[0] && "code_insee_commune" in recs[0] && "site_internet" in recs[0])) {
    console.error(`DILA ${dep} : champs attendus absents ; champs recus : ${Object.keys(recs[0]).join(", ")}`);
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
