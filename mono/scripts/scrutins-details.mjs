#!/usr/bin/env node
/* SCRUTINS PUBLICS — catalogue complet + details nominatifs, par lots.
 *
 * La source officielle de l'Assemblee rassemble les positions de vote des deputes
 * pour les scrutins publics de la legislature courante. Repere republie tous les
 * scrutins publics de la XVIIe legislature, sans non-votants, sans mises au point
 * et sans agregat de performance individuelle.
 *
 * ARCHITECTURE : un index leger (tous les scrutins) + des lots de 64 scrutins.
 * L'app charge l'index puis uniquement le lot ouvert. Aucun code de commune ou de
 * depute n'entre dans une URL.
 *
 * Les couleurs de groupe sont des marqueurs d'identite visuelle uniquement. Elles
 * ne codent jamais la position du vote et ne produisent aucun score, classement
 * ou jugement. Les positions restent toujours textuelles : Pour / Contre /
 * Abstention.
 */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const ENTREE = process.argv[3] || "../data/brut_Scrutins";
const AMO = path.resolve(SORTIE, "../../data/brut_AMO30/json/acteur");
const ORG = path.resolve(SORTIE, "../../data/brut_AMO30/json/organe");
const URL_SOURCE = "https://data.assemblee-nationale.fr/travaux-parlementaires/votes";
const URL_SCRUTIN = "https://www.assemblee-nationale.fr/dyn/17/scrutins/";
const LOT = 64;

/* Palette d'identite des groupes : usage descriptif uniquement.
 * Fallback volontairement neutre pour un groupe nouveau/non reconnu. */
const COULEURS_GROUPES = Object.freeze({
  "Rassemblement National": "#60758a",
  "Ensemble pour la République": "#6f7880",
  "La France insoumise - Nouveau Front Populaire": "#806d73",
  "Socialistes et apparentés": "#806f76",
  "Droite Républicaine": "#727b84",
  "Écologiste et Social": "#6f7e72",
  "Les Démocrates": "#80786b",
  "Horizons & Indépendants": "#687b84",
  "Libertés, Indépendants, Outre-mer et Territoires": "#737a7d",
  "Gauche Démocrate et Républicaine": "#7b7075",
  "Union des droites pour la République": "#77727f",
  "Députés non inscrits": "#747474",
});
const COULEUR_DEFAUT = "#747474";

function liste(x) {
  if (x == null || x === "") return [];
  return Array.isArray(x) ? x : [x];
}
function txt(d, ...keys) {
  for (const k of keys) {
    if (!d || typeof d !== "object") return "";
    d = d[k];
  }
  return d == null ? "" : d;
}
function fichiersJson(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...fichiersJson(p));
    else if (e.name.endsWith(".json")) out.push(p);
  }
  return out;
}
function couleurGroupe(nom) {
  return COULEURS_GROUPES[nom] || COULEUR_DEFAUT;
}

function lireActeurs() {
  const noms = new Map();
  for (const f of fichiersJson(AMO)) {
    try {
      const a = JSON.parse(fs.readFileSync(f, "utf8")).acteur;
      const ref = txt(a, "uid", "#text");
      if (!ref) continue;
      const ident = txt(a, "etatCivil", "ident");
      const nom = [ident.prenom, ident.nom].filter(Boolean).join(" ").trim();
      if (nom) noms.set(ref, nom);
    } catch {}
  }
  return noms;
}

function lireGroupes() {
  const groupes = new Map();
  for (const f of fichiersJson(ORG)) {
    try {
      const o = JSON.parse(fs.readFileSync(f, "utf8")).organe;
      const ref = o && o.uid;
      if (!ref) continue;
      const code = o.codeType || "";
      if (!/^GP$/i.test(code) && !/groupe/i.test(String(o.libelle || ""))) continue;
      const nom = String(o.libelle || o.libelleAbrege || "").trim();
      if (nom) groupes.set(ref, nom);
    } catch {}
  }
  return groupes;
}

function positionsDuBloc(g, noms) {
  const nomin = txt(g, "vote", "decompteNominatif");
  const res = [];
  if (!nomin || typeof nomin !== "object") return res;
  for (const [cle, position] of [["pours", "p"], ["contres", "c"], ["abstentions", "a"]]) {
    for (const v of liste(txt(nomin, cle, "votant"))) {
      const ref = txt(v, "acteurRef");
      if (!ref) continue;
      res.push({ a: ref, n: noms.get(ref) || null, p: position });
    }
  }
  return res;
}

const noms = lireActeurs();
const groupesNoms = lireGroupes();
const retenus = [];
let totalSource = 0;

for (const f of fichiersJson(ENTREE)) {
  let d;
  try { d = JSON.parse(fs.readFileSync(f, "utf8")).scrutin; } catch { continue; }
  if (!d || !d.dateScrutin) continue;
  totalSource++;

  const groupes = [];
  for (const g of liste(txt(d, "ventilationVotes", "organe", "groupes", "groupe"))) {
    const ref = txt(g, "organeRef");
    if (!ref) continue;
    const voix = txt(g, "vote", "decompteVoix") || {};
    const positions = positionsDuBloc(g, noms);
    const nom = groupesNoms.get(ref) || ref;
    groupes.push({
      ref,
      nom,
      couleur: couleurGroupe(nom),
      pour: voix.pour != null ? Number(voix.pour) : null,
      contre: voix.contre != null ? Number(voix.contre) : null,
      abstentions: voix.abstentions != null ? Number(voix.abstentions) : null,
      positions,
    });
  }

  const numero = String(d.numero || "");
  retenus.push({
    n: numero,
    u: String(d.uid || ""),
    d: String(d.dateScrutin).slice(0, 10),
    t: d.titre || d.objet?.libelle || "",
    ty: txt(d, "typeVote", "libelleTypeVote"),
    s: txt(d, "sort", "libelle"),
    dec: {
      pour: txt(d, "syntheseVote", "decompte", "pour"),
      contre: txt(d, "syntheseVote", "decompte", "contre"),
      abstentions: txt(d, "syntheseVote", "decompte", "abstentions"),
    },
    nv: txt(d, "syntheseVote", "nombreVotants"),
    url: URL_SCRUTIN + numero,
    groupes,
  });
}

retenus.sort((a, b) => a.d.localeCompare(b.d) || a.n.localeCompare(b.n, "fr", { numeric: true }));
const vus = new Set();
for (const sc of retenus) {
  if (!sc.n || vus.has(sc.n)) throw new Error("scrutin duplique ou sans numero : " + sc.n);
  vus.add(sc.n);
  const refs = new Set();
  for (const g of sc.groupes) {
    for (const p of g.positions) {
      if (refs.has(p.a)) throw new Error("acteur vote deux fois au scrutin " + sc.n + " : " + p.a);
      refs.add(p.a);
      if (!p.n) throw new Error("acteur sans nom dans le referentiel AMO30 : " + p.a);
    }
  }
}

if (!retenus.length) {
  console.error("aucun scrutin public : sortie refusee");
  process.exit(1);
}

const source = {
  producteur: "Assemblée nationale — Scrutins publics",
  producteur_affiche: "Assemblée nationale",
  licence: "Licence Ouverte 2.0",
  url: URL_SOURCE,
  legislature: 17,
  portee: "positions individuelles des scrutins publics de la XVIIe législature ; non-votants et mises au point non republies",
  releve_le: new Date().toISOString().slice(0, 10),
};

fs.mkdirSync(SORTIE, { recursive: true });
const index = {
  v: 2,
  source,
  total_source: totalSource,
  total_publics: retenus.length,
  taille_lot: LOT,
  scrutins: retenus.map((sc, i) => ({
    n: sc.n, d: sc.d, t: sc.t, ty: sc.ty, s: sc.s, dec: sc.dec, nv: sc.nv,
    url: sc.url, lot: Math.floor(i / LOT),
  })),
};

const dirLots = path.join(SORTIE, "scrutins-details");
fs.rmSync(dirLots, { recursive: true, force: true });
fs.mkdirSync(dirLots, { recursive: true });

for (let debut = 0, lot = 0; debut < retenus.length; debut += LOT, lot++) {
  const scrutins = retenus.slice(debut, debut + LOT);
  const paquet = { v: 2, source, lot, scrutins };
  fs.writeFileSync(path.join(dirLots, String(lot).padStart(4, "0") + ".json"), JSON.stringify(paquet));
}

fs.writeFileSync(path.join(SORTIE, "scrutins-index.json"), JSON.stringify(index));
console.log("scrutins publics : " + retenus.length + " / " + totalSource
  + " ; " + Math.ceil(retenus.length / LOT) + " lots ; "
  + Buffer.byteLength(JSON.stringify(index)) + " octets d'index");
