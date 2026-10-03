#!/usr/bin/env node
/* DETAIL DES SCRUTINS — positions individuelles + groupes, sans hiérarchie.
 *
 * La source officielle de l'Assemblée contient, pour chaque scrutin, une
 * ventilation par groupe puis les références d'acteurs dans chaque sens.
 * Ce script transforme cette structure en un paquet mobile consultable à la
 * demande. Les non-votants et les mises au point ne sont jamais republies.
 *
 * Portée V1 bêta : scrutins publics solennels + motions de censure de la
 * XVIIe législature. C'est le même filtre que scrutins_an.py et
 * scrutins-solennels.mjs, pour éviter trois définitions du mot « vote ».
 *
 * Usage : node scripts/scrutins-details.mjs [./data] [../data/brut_Scrutins]
 */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const ENTREE = process.argv[3] || "../data/brut_Scrutins";
const AMO = path.resolve(SORTIE, "../../data/brut_AMO30/json/acteur");
const TYPES = new Set(["scrutin public solennel", "motion de censure"]);
const URL_SOURCE = "https://data.assemblee-nationale.fr/travaux-parlementaires/votes";
const URL_SCRUTIN = "https://www.assemblee-nationale.fr/dyn/17/scrutins/";

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
  for (const f of fichiersJson(path.resolve(SORTIE, "../../data/brut_AMO30/json/organe"))) {
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

for (const f of fichiersJson(ENTREE)) {
  let d;
  try { d = JSON.parse(fs.readFileSync(f, "utf8")).scrutin; } catch { continue; }
  if (!d || !d.dateScrutin) continue;
  const type = txt(d, "typeVote", "libelleTypeVote");
  if (!TYPES.has(type)) continue;

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
      pour: voix.pour != null ? Number(voix.pour) : null,
      contre: voix.contre != null ? Number(voix.contre) : null,
      abstentions: voix.abstentions != null ? Number(voix.abstentions) : null,
      positions,
    });
  }

  retenus.push({
    n: String(d.numero || ""),
    u: String(d.uid || ""),
    d: String(d.dateScrutin).slice(0, 10),
    t: d.titre || d.objet?.libelle || "",
    ty: type === "motion de censure" ? "censure" : "solennel",
    s: txt(d, "sort", "libelle"),
    dec: {
      pour: txt(d, "syntheseVote", "decompte", "pour"),
      contre: txt(d, "syntheseVote", "decompte", "contre"),
      abstentions: txt(d, "syntheseVote", "decompte", "abstentions"),
    },
    url: URL_SCRUTIN + String(d.numero || ""),
    groupes,
  });
}

retenus.sort((a, b) => a.d.localeCompare(b.d) || a.n.localeCompare(b.n, "fr", { numeric: true }));
const vus = new Set();
for (const sc of retenus) {
  if (vus.has(sc.n)) throw new Error("scrutin duplique : " + sc.n);
  vus.add(sc.n);
  const refs = new Set();
  for (const g of sc.groupes) {
    for (const p of g.positions) {
      if (refs.has(p.a)) throw new Error("acteur vote deux fois au scrutin " + sc.n + " : " + p.a);
      refs.add(p.a);
      if (!p.n) throw new Error("acteur sans nom dans le référentiel AMO30 : " + p.a);
    }
  }
}

if (!retenus.length) {
  console.error("aucun scrutin solennel/censure : sortie refusée");
  process.exit(1);
}

const paquet = {
  v: 1,
  source: {
    producteur: "Assemblée nationale — Scrutins publics",
    producteur_affiche: "Assemblée nationale",
    licence: "Licence Ouverte 2.0",
    url: URL_SOURCE,
    legislature: 17,
    portee: "positions individuelles des scrutins publics solennels et motions de censure",
    releve_le: new Date().toISOString().slice(0, 10),
  },
  scrutins: retenus,
};

fs.mkdirSync(SORTIE, { recursive: true });
const dest = path.join(SORTIE, "scrutins-details.json");
fs.writeFileSync(dest, JSON.stringify(paquet));
console.log(`scrutins-details.json : ${retenus.length} scrutins, ${Buffer.byteLength(JSON.stringify(paquet))} octets`);
