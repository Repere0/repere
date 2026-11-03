#!/usr/bin/env node
/* PHOTOS DES ÉLUS, SOUS LICENCE LIBRE — 30/10/2026 (D27, ADR 0004).
 *
 * Usage : node scripts/collecte-photos-elus.mjs ./data
 *
 * Ecrit data/photos-elus/{departement}.json :
 *   { v, genere_le, source, photos: { "PA722432": { data, auteur, licence, licence_url, page } ,
 *                                     "M77288":   { ... } } }
 * - deputes : cle = identifiant de l'Assemblee (deputes.json) ;
 * - maires d'Ile-de-France : cle = « M » + code INSEE de la commune.
 * `data` est une vignette JPEG de 160 px en data: URI. L'application ne demande JAMAIS
 * une image a Wikimedia : charger la photo d'un depute a l'affichage dirait a un tiers
 * quel elu le lecteur regarde, donc ou il habite (invariant 2). Le fichier est servi par
 * departement, comme les comptes et les votes.
 *
 * RAPPROCHEMENT SUR, OU PAS DE PHOTO. Une photo d'homonyme serait une fausse information.
 * - Depute : item Wikidata portant l'identifiant de l'Assemblee (propriete P4123), ET
 *   dont le libelle contient le nom de famille publie par l'Assemblee.
 * - Maire : chef de l'executif en cours (P6 sans date de fin) de la commune (P374 = code
 *   INSEE), ET dont le libelle contient le nom de famille du Repertoire national des elus.
 * Licence lue dans les metadonnees de Commons (extmetadata) : CC BY, CC BY-SA, CC0 ou
 * domaine public. Toute autre licence, ou une licence absente : pas de photo.
 *
 * NON VERIFIE DANS LA SESSION QUI L'A ECRIT : Wikidata et Commons etaient injoignables
 * (proxy). En particulier, la propriete P4123 n'a pas ete confirmee comme identifiant
 * de l'Assemblee : si elle ne l'est pas, aucun depute ne sera rapproche (la double
 * condition l'empeche de rapprocher n'importe qui), et le compte final le dira. */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const UA = "Repere/1.0 (application civique ; donnees publiques ; https://repereapp.netlify.app)";
const SPARQL = "https://query.wikidata.org/sparql";
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const DEPS_IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];
export const LICENCE_OK = /^(cc[ -]by(-sa)?[ -]\d(\.\d)?( [a-z]{2,})?|cc0( 1\.0)?|public domain|domaine public|pd[ -].*)$/i;
const pause = ms => new Promise(r => setTimeout(r, ms));
export const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]+/g, " ").trim();
/* Le libelle contient-il le nom de famille, mot pour mot (« Breton » dans « Xavier Breton ») ? */
export const concorde = (libelle, famille) => { const f = norm(famille); return !!f && (" " + norm(libelle) + " ").includes(" " + f + " "); };
/* Nom de famille d'un maire du RNE : les mots en capitales (« Kadir MEBAREK » -> « MEBAREK »). */
export const familleRNE = nom => String(nom || "").split(/\s+/).filter(m => m.length > 1 && m === m.toUpperCase() && /[A-Z]/.test(m)).join(" ");
const sansHtml = s => String(s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

async function sparql(q) {
  const r = await fetch(SPARQL + "?format=json&query=" + encodeURIComponent(q), { headers: { "user-agent": UA, accept: "application/sparql-results+json" } });
  if (!r.ok) throw new Error("SPARQL HTTP " + r.status);
  return (await r.json()).results.bindings;
}
const fichier = url => decodeURIComponent(String(url).split("/").pop()).replace(/_/g, " ");

async function main() {
  const deputes = JSON.parse(fs.readFileSync(path.join(SORTIE, "deputes.json"), "utf8")).deputes || {};
  const candidats = [];   /* { cle, dep, famille, image, libelle } */
  /* RETRAIT SUR DEMANDE (V18) : une cle listee ici n'est jamais reprise, collecte apres
     collecte. Supprimer l'entree des donnees ne suffirait pas : la chaine la recreerait. */
  const retirees = new Set(JSON.parse(fs.readFileSync(new URL("./photos-retirees.json", import.meta.url), "utf8")).retirees || []);

  /* 1. Deputes : identifiant de l'Assemblee -> image. */
  const parRef = new Map(Object.entries(deputes).map(([k, d]) => [String(d.acteurRef || "").replace(/^PA/, ""), { k, d }]));
  const rd = await sparql(`SELECT ?id ?img ?label WHERE { ?p wdt:P4123 ?id ; wdt:P18 ?img . OPTIONAL { ?p rdfs:label ?label FILTER(LANG(?label) = "fr") } }`);
  for (const b of rd) {
    const id = String(b.id.value).replace(/^PA/, "");
    const m = parRef.get(id);
    if (!m || !b.label || !concorde(b.label.value, m.d.nom)) continue;
    candidats.push({ cle: m.d.acteurRef, dep: m.k.split("-")[0], famille: m.d.nom, image: b.img.value, libelle: b.label.value });
  }
  await pause(1000);

  /* 2. Maires d'Ile-de-France : commune (INSEE) -> chef de l'executif en cours -> image. */
  const filtre = DEPS_IDF.map(d => `STRSTARTS(?insee, "${d}")`).join(" || ");
  const rm = await sparql(`SELECT ?insee ?img ?label WHERE { ?c wdt:P374 ?insee . FILTER(${filtre}) ?c p:P6 ?st . ?st ps:P6 ?m . FILTER NOT EXISTS { ?st pq:P582 ?fin } ?m wdt:P18 ?img . OPTIONAL { ?m rdfs:label ?label FILTER(LANG(?label) = "fr") } }`);
  for (const dep of DEPS_IDF) {
    const f = path.join(SORTIE, "departments", dep + ".json");
    if (!fs.existsSync(f)) continue;
    const communes = JSON.parse(fs.readFileSync(f, "utf8")).communes || {};
    for (const b of rm) {
      const insee = b.insee.value;
      const c = communes[insee];
      if (!c || !c.maire || !b.label) continue;
      const famille = familleRNE(c.maire.nom);
      if (!concorde(b.label.value, famille)) continue;
      candidats.push({ cle: "M" + insee, dep, famille, image: b.img.value, libelle: b.label.value });
    }
  }

  /* 3. Licence et vignette, par lots de 40 fichiers Commons. */
  const parDep = {};
  let refusees = 0;
  const avantRetrait = candidats.length;
  for (let i = candidats.length - 1; i >= 0; i--) if (retirees.has(candidats[i].cle)) candidats.splice(i, 1);
  if (avantRetrait !== candidats.length) console.log(`photos-elus : ${avantRetrait - candidats.length} photo(s) retiree(s) sur demande, non reprises`);
  for (let i = 0; i < candidats.length; i += 40) {
    const lot = candidats.slice(i, i + 40);
    const titres = lot.map(c => "File:" + fichier(c.image)).join("|");
    const r = await fetch(`${COMMONS}?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=160&titles=${encodeURIComponent(titres)}`, { headers: { "user-agent": UA } });
    if (!r.ok) throw new Error("Commons HTTP " + r.status);
    const pages = Object.values((await r.json()).query?.pages || {});
    for (const c of lot) {
      const pg = pages.find(p => norm(p.title) === norm("File:" + fichier(c.image)));
      const ii = pg && pg.imageinfo && pg.imageinfo[0];
      const md = ii && ii.extmetadata;
      const licence = md && md.LicenseShortName ? sansHtml(md.LicenseShortName.value) : "";
      const auteur = md && md.Artist ? sansHtml(md.Artist.value) : "";
      if (!ii || !ii.thumburl || !LICENCE_OK.test(licence) || !auteur) { refusees++; continue; }
      const img = await fetch(ii.thumburl, { headers: { "user-agent": UA } });
      if (!img.ok) { refusees++; continue; }
      const octets = Buffer.from(await img.arrayBuffer());
      if (octets.length > 25000) { refusees++; continue; }   /* une vignette, pas une photo pleine taille */
      const type = img.headers.get("content-type") || "image/jpeg";
      (parDep[c.dep] ||= {})[c.cle] = {
        data: `data:${type};base64,${octets.toString("base64")}`,
        auteur: auteur.slice(0, 120), licence, licence_url: md.LicenseUrl ? sansHtml(md.LicenseUrl.value) : null,
        page: ii.descriptionurl || null,
      };
      await pause(200);
    }
    await pause(1000);
  }

  const dir = path.join(SORTIE, "photos-elus");
  fs.mkdirSync(dir, { recursive: true });
  const jour = new Date().toISOString().slice(0, 10);
  let total = 0;
  for (const [dep, photos] of Object.entries(parDep)) {
    total += Object.keys(photos).length;
    fs.writeFileSync(path.join(dir, dep + ".json"), JSON.stringify({
      v: 1, genere_le: jour,
      source: { producteur: "Wikimedia Commons (images) et Wikidata (rapprochement)", licence: "licence propre a chaque image (voir chaque entree)", releve_le: jour, url: "https://commons.wikimedia.org" },
      photos,
    }));
  }
  const nbDeputes = Object.keys(deputes).length;
  const nbDep = candidats.filter(c => c.cle.startsWith("PA")).length;
  console.log(`photos-elus : ${total} photos retenues (${refusees} refusees : licence, auteur, taille) ; deputes rapproches ${nbDep}/${nbDeputes} ; maires rapproches ${candidats.length - nbDep}`);
}
if (import.meta.url === `file://${process.argv[1]}`) main().catch(e => { console.error("photos-elus : " + e.message); process.exit(2); });
