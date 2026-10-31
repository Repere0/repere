#!/usr/bin/env node
/* FLUX RSS OFFICIELS DES MAIRIES D'ILE-DE-FRANCE — 31/10/2026 (D81, ADR 0007).
 *
 * Usage : node scripts/collecte-rss-mairies.mjs ./data      (depuis mono/)
 * Lit   : ./data/mairies-idf.json   (sites, produits par collecte-sites-mairies.mjs)
 * Ecrit : ./data/actuelles-rss.json (au plus 3 entrees par commune, plus recente d'abord)
 *
 * CE QUE LE SCRIPT NE FAIT JAMAIS :
 * - lire le HTML d'un site de mairie, ni en extraire un lien, ni suivre une page ;
 * - deviner une adresse autre que les quatre candidats de CANDIDATS ;
 * - reprendre un article entier : titre, date, lien, deux phrases au plus.
 * Une reponse qui n'est pas un flux est refusee sans etre analysee.
 * Un lien qui ne pointe pas vers le domaine de la mairie est ecarte. Une date absente
 * ou future aussi (invariant 4 : une date ; invariant 9 : pas de fausse fraicheur). */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import Parser from "rss-parser";

export const CANDIDATS = ["/feed/", "/rss", "/flux-rss", "/955.htm"];
export const MAX_PAR_COMMUNE = 3;
const DELAI_MS = 8000;
const SIMULTANES = 12;
const TAILLE_MAX = 2_000_000;
const SOURCE = "Flux RSS publiés par les mairies (ADR 0007, D81) ; sites : annuaire DILA, Licence Ouverte 2.0";

/* Lit une adresse candidate. Renvoie le texte seulement si la reponse est un flux. */
export async function lireFlux(url, { fetchImpl = fetch, delai = DELAI_MS } = {}) {
  const ctrl = new AbortController();
  const minuterie = setTimeout(() => ctrl.abort(), delai);
  try {
    const r = await fetchImpl(url, {
      signal: ctrl.signal, redirect: "follow",
      headers: { Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9", "User-Agent": "Repere-collecte-flux" },
    });
    if (r.status !== 200) return { ok: false, raison: `HTTP ${r.status}` };
    const texte = await r.text();
    if (texte.length > TAILLE_MAX) return { ok: false, raison: "trop volumineux" };
    const tete = texte.slice(0, 5000);
    if (/<html[\s>]/i.test(tete)) return { ok: false, raison: "HTML, pas un flux" };
    if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(tete)) return { ok: false, raison: "ni RSS ni Atom" };
    return { ok: true, texte };
  } catch (e) {
    return { ok: false, raison: e.name === "AbortError" ? "délai dépassé" : e.message };
  } finally {
    clearTimeout(minuterie);
  }
}

/* Deux phrases au plus, sans balise ni entite. Jamais l'article entier. */
export function deuxPhrases(texte) {
  const propre = String(texte || "")
    .replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const phrases = propre.match(/[^.!?]+[.!?]+(?=\s|$)/g) || (propre ? [propre] : []);
  let r = phrases.slice(0, 2).map(p => p.trim()).join(" ");
  if (r.length > 300) r = r.slice(0, 297).replace(/\s+\S*$/, "") + "…";
  return r;
}

/* Meme domaine que la mairie (www. ignore), en https. */
export function lienDuDomaine(lien, site) {
  try {
    const u = new URL(lien, site);
    const d = (h) => h.replace(/^www\./, "");
    return u.protocol === "https:" && (d(u.hostname) === d(new URL(site).hostname) || d(u.hostname).endsWith("." + d(new URL(site).hostname))) ? u.href : null;
  } catch {
    return null;
  }
}

const parseur = new Parser({ timeout: DELAI_MS });

/* Transforme les entrees d'un flux en entrees publiables. Renvoie celles qui passent les gardes. */
export async function entreesPubliables(texteFlux, site, aujourdhui) {
  const flux = await parseur.parseString(texteFlux);
  const sorties = [];
  for (const it of flux.items || []) {
    const lien = lienDuDomaine(it.link || "", site);
    const iso = it.isoDate || (it.pubDate ? new Date(it.pubDate).toISOString() : "");
    const date = iso ? iso.slice(0, 10) : "";
    if (!lien || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date > aujourdhui || !it.title) continue;
    sorties.push({ titre: it.title.trim(), date, lien, resume: deuxPhrases(it.contentSnippet || it.content || it.summary || it.description || "") });
  }
  return sorties.sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_PAR_COMMUNE);
}

/* Pour une commune : le premier candidat qui est un flux, puis ses entrees. */
export async function collecterCommune(insee, { nom, site }, { fetchImpl, aujourdhui }) {
  const raisons = [];
  for (const c of CANDIDATS) {
    const url = new URL(c, site).href;
    const r = await lireFlux(url, { fetchImpl });
    if (!r.ok) { raisons.push(`${c} : ${r.raison}`); continue; }
    try {
      const items = await entreesPubliables(r.texte, site, aujourdhui);
      return { insee, flux: url, items, raisons };
    } catch (e) {
      raisons.push(`${c} : analyse impossible (${e.message.split("\n")[0]})`);
    }
  }
  return { insee, flux: null, items: [], raisons };
}

/* Toutes les communes, par lots de SIMULTANES. */
export async function collecter(communes, { fetchImpl = fetch, aujourdhui = new Date().toISOString().slice(0, 10), generation = new Date().toISOString() } = {}) {
  const cibles = Object.entries(communes || {}).filter(([, c]) => c && /^https:\/\//.test(c.site || ""));
  const resultats = [];
  for (let i = 0; i < cibles.length; i += SIMULTANES) {
    const lot = cibles.slice(i, i + SIMULTANES);
    resultats.push(...await Promise.all(lot.map(([insee, c]) => collecterCommune(insee, c, { fetchImpl, aujourdhui }))));
  }
  const sortie = { v: 1, genere_le: generation, source: SOURCE, licence: "non vérifiée par commune (ADR 0007)", communes: {} };
  let avecFlux = 0, avecActu = 0;
  for (const r of resultats) {
    if (r.flux) avecFlux++;
    if (r.items.length) {
      avecActu++;
      sortie.communes[r.insee] = { nom: communes[r.insee].nom || "", flux: r.flux, items: r.items };
    }
  }
  sortie.bilan = { communes_testees: cibles.length, avec_flux: avecFlux, avec_actu: avecActu, sans_flux: cibles.length - avecFlux };
  return sortie;
}

async function main() {
  const dossier = process.argv[2] || "./data";
  const fichier = path.join(dossier, "mairies-idf.json");
  if (!fs.existsSync(fichier)) {
    console.error(`${fichier} absent : lancer collecte-sites-mairies.mjs d'abord. Rien n'est écrit.`);
    process.exit(1);
  }
  const mai = JSON.parse(fs.readFileSync(fichier, "utf8"));
  const sortie = await collecter(mai.communes, {});
  fs.writeFileSync(path.join(dossier, "actuelles-rss.json"), JSON.stringify(sortie, null, 2) + "\n");
  const b = sortie.bilan;
  console.log(`actuelles-rss.json : ${b.communes_testees} sites testés, ${b.avec_flux} avec flux, ${b.avec_actu} avec au moins une entrée`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e); process.exit(1); });
}
