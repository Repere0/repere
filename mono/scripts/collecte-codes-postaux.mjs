#!/usr/bin/env node
/* CODES POSTAUX -> COMMUNES D'ILE-DE-FRANCE — 12/11/2026 (decision du porteur, roadmap beta).
 *
 * Usage :
 *   node scripts/collecte-codes-postaux.mjs ./data                    (runner : telecharge)
 *   node scripts/collecte-codes-postaux.mjs ./data --fichier base.csv (poste du porteur : fichier deja telecharge)
 *
 * Ecrit data/codes-postaux.json : { v, genere_le, source, codes: { "77000": ["77288"], ... }, couverture }.
 * C'est le fichier que lit deja l'application (chargerCodesPostaux, chercherCommunes dans @repere/core).
 * Un seul fichier pour la region ; le code postal tape ne quitte jamais l'appareil (invariant 2).
 *
 * SOURCE : « Base officielle des codes postaux », La Poste, publiee sur data.gouv.fr.
 *   fiche    https://www.data.gouv.fr/datasets/base-officielle-des-codes-postaux
 *   API      https://www.data.gouv.fr/api/1/datasets/base-officielle-des-codes-postaux/
 *   fichier  https://datanova.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/metadata-attachments/base-officielle-codes-postaux.csv
 *
 * NON VERIFIE DANS LA SESSION QUI L'A ECRIT (le conteneur ne joint ni data.gouv.fr ni La Poste) : la licence,
 * l'adresse du fichier et le nom des colonnes. Le script ne les SUPPOSE donc pas, il les LIT :
 *   - la licence et l'adresse du CSV dans la fiche de data.gouv.fr (API) ; licence autre que la Licence Ouverte :
 *     rien n'est ecrit ;
 *   - les colonnes dans l'en-tete du CSV (un nom contenant « insee », un nom contenant « postal ») ; en-tete
 *     inattendu : rien n'est ecrit, et l'en-tete lu est affiche pour corriger.
 * Il refuse d'ecrire du vide : moins de 90 % des communes de la beta couvertes = aucune sortie. */
import fs from "node:fs";
import path from "node:path";

const UA = "Repere/1.0 (application civique ; donnees publiques ; https://repereapp.netlify.app)";
export const FICHE = "https://www.data.gouv.fr/datasets/base-officielle-des-codes-postaux";
const API = "https://www.data.gouv.fr/api/1/datasets/base-officielle-des-codes-postaux/";
const CSV_CONNU = "https://datanova.laposte.fr/data-fair/api/v1/datasets/laposte-hexasmal/metadata-attachments/base-officielle-codes-postaux.csv";
const LICENCES_OUVERTES = { "lov2": "Licence Ouverte 2.0", "fr-lo": "Licence Ouverte 1.0" };
export const COUVERTURE_MIN = 0.9;
const DEPS_IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];

/* Une ligne CSV, guillemets compris (« "SAINT, MARTIN" »). */
export function champs(ligne, sep) {
  const out = []; let cur = "", dansGuillemets = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (dansGuillemets) { if (c === '"' && ligne[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') dansGuillemets = false; else cur += c; }
    else if (c === '"') dansGuillemets = true;
    else if (c === sep) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map(x => x.trim());
}
const plat = s => String(s || "").replace(/^﻿/, "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* REGLE PURE : le texte du CSV + les codes INSEE de la beta -> { codes, couverture }. Jette une erreur lisible.
   Paris : La Poste range les codes postaux sous les arrondissements (75101 a 75120) ; Repere ne connait que
   la commune (75056). */
export function lireBase(csv, inseeBeta) {
  const lignes = String(csv).split(/\r?\n/).filter(l => l.trim());
  if (lignes.length < 2) throw new Error("fichier vide");
  const sep = (lignes[0].match(/;/g) || []).length >= (lignes[0].match(/,/g) || []).length ? ";" : ",";
  const entete = champs(lignes[0], sep).map(plat);
  const iInsee = entete.findIndex(c => c.includes("insee"));
  const iCp = entete.findIndex(c => c.includes("postal"));
  if (iInsee < 0 || iCp < 0) throw new Error("en-tete inattendu, colonnes INSEE et code postal introuvables : " + lignes[0].slice(0, 200));
  const beta = new Set(inseeBeta);
  const parCode = new Map();
  for (const l of lignes.slice(1)) {
    const c = champs(l, sep);
    let insee = String(c[iInsee] || "").toUpperCase().padStart(5, "0");
    const cp = String(c[iCp] || "").padStart(5, "0");
    if (!/^\d{5}$/.test(cp) || !/^(\d{5}|2[AB]\d{3})$/.test(insee)) continue;
    if (/^751[0-2]\d$/.test(insee)) insee = "75056";
    if (!DEPS_IDF.includes(insee.slice(0, 2)) || !beta.has(insee)) continue;
    if (!parCode.has(cp)) parCode.set(cp, new Set());
    parCode.get(cp).add(insee);
  }
  const codes = {};
  for (const cp of [...parCode.keys()].sort()) codes[cp] = [...parCode.get(cp)].sort();
  const couvertes = new Set(Object.values(codes).flat());
  const sans = [...beta].filter(i => !couvertes.has(i)).sort();
  return { codes, couverture: { communes: beta.size, avec_code: couvertes.size, sans_code: sans } };
}

async function lire(url, type) {
  const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} sur ${url}`);
  return type === "json" ? r.json() : r.text();
}

async function main() {
  const sortie = process.argv[2] || "./data";
  const iF = process.argv.indexOf("--fichier");
  const local = iF > 0 ? process.argv[iF + 1] : null;
  const fb = path.join(sortie, "communes-beta.json");
  if (!fs.existsSync(fb)) throw new Error("communes-beta.json absent de " + sortie + " : rien a croiser");
  const beta = Object.keys(JSON.parse(fs.readFileSync(fb, "utf8")).communes || {});
  const jour = new Date().toISOString().slice(0, 10);

  /* 1. La fiche : licence, adresse du CSV, date de la source. Injoignable avec --fichier : on le dit dans la sortie. */
  let licence = null, url = CSV_CONNU, maj = null;
  try {
    const fiche = await lire(API, "json");
    licence = LICENCES_OUVERTES[fiche.license] || null;
    if (!licence) throw Object.assign(new Error(`licence « ${fiche.license} » : ce n'est pas la Licence Ouverte, rien n'est ecrit`), { fatale: true });
    const res = (fiche.resources || []).find(x => /csv/i.test(x.format || "") && /^https:\/\//.test(x.url || ""));
    if (res) { url = res.url; maj = String(res.last_modified || fiche.last_modified || "").slice(0, 10) || null; }
    console.log(`codes-postaux : fiche lue, licence ${licence}, fichier ${url}, mis a jour le ${maj || "date non lue"}`);
  } catch (e) {
    if (e.fatale || !local) throw e;
    console.log("codes-postaux : fiche de data.gouv.fr injoignable (" + e.message + ") ; licence non relue");
  }

  /* 2. Le CSV. */
  const csv = local ? fs.readFileSync(local, "utf8") : await lire(url, "texte");
  console.log("codes-postaux : en-tete lu : " + csv.split(/\r?\n/)[0].slice(0, 200));
  const { codes, couverture } = lireBase(csv, beta);
  const part = couverture.communes ? couverture.avec_code / couverture.communes : 0;
  if (part < COUVERTURE_MIN) throw new Error(`seulement ${couverture.avec_code} communes sur ${couverture.communes} ont un code postal : rien n'est ecrit`);

  fs.writeFileSync(path.join(sortie, "codes-postaux.json"), JSON.stringify({
    v: 1, genere_le: jour,
    source: { producteur: "La Poste, Base officielle des codes postaux", licence: licence || "non relue (fichier fourni a la main)", maj, releve_le: jour, url: FICHE },
    couverture: { communes: couverture.communes, avec_code: couverture.avec_code, sans_code: couverture.sans_code.slice(0, 50) },
    codes,
  }));
  console.log(`codes-postaux : ${Object.keys(codes).length} codes postaux, ${couverture.avec_code}/${couverture.communes} communes couvertes` + (couverture.sans_code.length ? ` ; sans code : ${couverture.sans_code.slice(0, 10).join(", ")}` : ""));
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error("codes-postaux : " + e.message); process.exit(2); });
