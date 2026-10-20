#!/usr/bin/env node
/* PHOTOS INSTITUTIONNELLES DES DEPUTES — outil a lancer sur votre PC (20/10/2026).
 *
 * Ce qu'il fait :
 *   1. lit les identifiants officiels des deputes (data/deputes.json, Assemblee nationale) ;
 *   2. ouvre la fiche officielle de chaque depute sur www2.assemblee-nationale.fr ;
 *   3. y reconnait la photo (et seulement elle) et la telecharge ;
 *   4. ecrit un manifeste : d'ou vient chaque photo, quand, sa taille, son empreinte.
 *
 * Ce qu'il ne fait PAS :
 *   - il ne devine aucune adresse : une fiche sans photo reconnue est notee et ignoree ;
 *   - il ne publie rien : les photos restent dans un dossier local (photos-institutionnelles/) ;
 *   - l'application n'embarque une photo qu'apres que le porteur a mis licence_validee: true
 *     dans le manifeste, puis lance l'option --indexer.
 *
 * Usage, depuis mono/ :
 *   node scripts/photos-institutionnelles.mjs               telecharge (reprise possible)
 *   node scripts/photos-institutionnelles.mjs --limite 5    essai sur cinq deputes
 *   node scripts/photos-institutionnelles.mjs --indexer     copie les photos validees dans l'application
 *
 * La fiche officielle a l'adresse OMC_<identifiant> : a verifier au premier essai (le script
 * le signale si la page ne repond pas comme prevu). */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DOSSIER_BRUT = path.join(RACINE, "photos-institutionnelles");
export const DOSSIER_APP = path.join(RACINE, "apps/mobile/assets/photos");
export const INDEX_APP = path.join(RACINE, "apps/mobile/src/lib/photos-index.ts");
export const FICHE = ref => `https://www2.assemblee-nationale.fr/deputes/fiche/OMC_${ref}`;
const AGENT = "Repere-photos/1.0 (outil local, usage non commercial ; contact : porteur du projet)";
const OCTETS_MINI = 2000;

/* Les identifiants uniques des deputes, dans l'ordre des donnees. */
export function lireRefs(deputes) {
  const refs = new Set();
  for (const d of Object.values(deputes.deputes || {})) if (d && d.acteurRef) refs.add(d.acteurRef);
  return [...refs].sort();
}

/* La photo d'une fiche : la premiere image dont l'adresse dit « photo », hors logos et pictos.
   Renvoie une adresse absolue, ou null. Ne devine jamais une adresse absente de la page. */
export function extraireImage(html, urlPage) {
  for (const balise of html.match(/<img\b[^>]*>/gi) || []) {
    const m = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(balise);
    if (!m) continue;
    const src = m[1];
    if (!/photo/i.test(src) || /logo|picto|icone|icon/i.test(src)) continue;
    try { return new URL(src, urlPage).href; } catch { continue; }
  }
  return null;
}

/* Une reponse n'est une photo que si elle est une image et qu'elle n'est pas vide. */
export function typeImageValide(contentType, octets) {
  return /^image\/(jpeg|png|webp)\b/i.test(contentType || "") && octets >= OCTETS_MINI;
}
export const extensionPour = contentType =>
  /png/i.test(contentType) ? "png" : /webp/i.test(contentType) ? "webp" : "jpg";

function lireManifeste(dossier) {
  const f = path.join(dossier, "manifest.json");
  if (!fs.existsSync(f)) return { avertissement: AVERTISSEMENT, licence: LICENCE, entrees: {} };
  return JSON.parse(fs.readFileSync(f, "utf8"));
}
const AVERTISSEMENT = "Photos telechargees depuis les fiches officielles de l'Assemblee nationale. Droits non verifies : ne rien publier sans avoir lu les conditions d'usage.";
const LICENCE = "non verifiee — licence_validee doit passer a true par le porteur, fiche par fiche, avant --indexer";

async function telecharger(ref, dossier, manifeste) {
  const page = FICHE(ref);
  const entree = { page, statut: "echec", licence_validee: false };
  try {
    const r = await fetch(page, { headers: { "User-Agent": AGENT } });
    if (!r.ok) return { ...entree, motif: `fiche : HTTP ${r.status}` };
    const image = extraireImage(await r.text(), page);
    if (!image) return { ...entree, motif: "fiche : aucune photo reconnue (la page a peut-etre change)" };
    const ri = await fetch(image, { headers: { "User-Agent": AGENT } });
    if (!ri.ok) return { ...entree, image, motif: `photo : HTTP ${ri.status}` };
    const type = ri.headers.get("content-type") || "";
    const octets = Buffer.from(await ri.arrayBuffer());
    if (!typeImageValide(type, octets.length)) return { ...entree, image, motif: `photo refusee : type ${type || "absent"}, ${octets.length} octets` };
    const fichier = `${ref}.${extensionPour(type)}`;
    fs.writeFileSync(path.join(dossier, fichier), octets);
    return { ...entree, statut: "ok", image, fichier, type, octets: octets.length,
      sha256: crypto.createHash("sha256").update(octets).digest("hex"), telecharge_le: new Date().toISOString().slice(0, 10) };
  } catch (e) {
    return { ...entree, motif: `reseau : ${e.message}` };
  }
}

async function principal(argv) {
  if (argv.includes("--indexer")) return indexer();
  const i = argv.indexOf("--limite");
  const limite = i >= 0 ? Number(argv[i + 1]) : Infinity;
  const deputes = JSON.parse(fs.readFileSync(path.join(RACINE, "data/deputes.json"), "utf8"));
  const refs = lireRefs(deputes).slice(0, limite);
  fs.mkdirSync(DOSSIER_BRUT, { recursive: true });
  const manifeste = lireManifeste(DOSSIER_BRUT);
  let ok = 0, echecs = 0, passes = 0;
  for (const ref of refs) {
    const deja = manifeste.entrees[ref];
    if (deja && deja.statut === "ok" && fs.existsSync(path.join(DOSSIER_BRUT, deja.fichier))) { passes++; continue; }
    const resultat = await telecharger(ref, DOSSIER_BRUT, manifeste);
    manifeste.entrees[ref] = resultat;
    if (resultat.statut === "ok") ok++; else echecs++;
    console.log(`${ref} : ${resultat.statut === "ok" ? "photo enregistree" : resultat.motif}`);
    fs.writeFileSync(path.join(DOSSIER_BRUT, "manifest.json"), JSON.stringify(manifeste, null, 2) + "\n");
    await new Promise(r => setTimeout(r, 400));
  }
  console.log(`\nbilan : ${ok} photo(s) enregistree(s), ${echecs} echec(s), ${passes} deja presente(s), sur ${refs.length} depute(s).`);
  console.log(`manifeste : ${path.join(DOSSIER_BRUT, "manifest.json")}`);
}

/* Copie dans l'application les seules photos dont le porteur a valide la licence,
   puis ecrit la liste que l'application lit. */
export function indexer() {
  const m = lireManifeste(DOSSIER_BRUT);
  fs.mkdirSync(DOSSIER_APP, { recursive: true });
  const retenues = [];
  for (const [ref, e] of Object.entries(m.entrees)) {
    if (e.statut !== "ok" || e.licence_validee !== true) continue;
    const src = path.join(DOSSIER_BRUT, e.fichier);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(DOSSIER_APP, e.fichier));
    retenues.push({ ref, fichier: e.fichier });
  }
  const lignes = retenues.sort((a, b) => a.ref.localeCompare(b.ref))
    .map(r => `  "${r.ref}": require("../../assets/photos/${r.fichier}"),`);
  fs.writeFileSync(INDEX_APP, [
    "/* Genere par mono/scripts/photos-institutionnelles.mjs --indexer. Ne pas editer a la main.",
    " * Seules les photos dont la licence a ete validee par le porteur figurent ici. */",
    "export const PHOTOS: Record<string, number> = {",
    ...lignes,
    "};", ""].join("\n"));
  console.log(`${retenues.length} photo(s) validee(s) copiee(s) dans l'application et indexee(s).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  principal(process.argv.slice(2)).catch(e => { console.error(e); process.exit(1); });
}
