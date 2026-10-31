#!/usr/bin/env node
/* AGRÉGATS RÉGIONAUX PRÉ-CALCULÉS — 30/10/2026 (V15, bloc 4 ; D23 et A1).
 *
 * Usage : node scripts/agregats-regionaux.mjs ./data
 *
 * Lit index.json et les fichiers departments/*.json deja produits par extract-html.js,
 * et ecrit data/agregats-regionaux.json : pour chaque region et chaque exercice, la
 * mediane (et la moyenne, pour les statistiques internes) des depenses par habitant
 * publiees par l'OFGL, avec le nombre de communes. Le calcul est celui de l'application
 * (@repere/core, medianeParHabitant) : meme regle, meme garde de couverture.
 *
 * POURQUOI ICI ET PAS EN DUR DANS LE CODE : une valeur ecrite dans le code se fige
 * (le « 2 495 € » de l'accueil, corrige par D18). Ce fichier est refait a chaque
 * publication, avec les comptes du jour, et porte la date de l'index et la source.
 *
 * POURQUOI : l'application telechargeait les 8 departements d'Ile-de-France
 * (843 Ko bruts, 238 Ko compresses) pour calculer une seule valeur. */
import fs from "node:fs";
import path from "node:path";
import { medianeParHabitant } from "../packages/core/src/index.js";

const SORTIE = process.argv[2] || "./data";
const lire = f => JSON.parse(fs.readFileSync(path.join(SORTIE, f), "utf8"));
const index = lire("index.json");
const regions = new Map();
for (const d of index.departements || []) {
  if (!d.region_code) continue;
  if (!regions.has(d.region_code)) regions.set(d.region_code, { nom: d.region, deps: [] });
  regions.get(d.region_code).deps.push(d.code);
}
const sortie = {
  v: 1,
  genere_le: index.genere_le || null,
  agregat: "Dépenses totales par habitant",
  methode: "médiane des communes qui publient le montant pour l'exercice ; rien sous 80 % de couverture",
  source: index.sources && index.sources.comptes ? index.sources.comptes : null,
  regions: {},
};
for (const [code, r] of regions) {
  const paquets = [];
  for (const dep of r.deps) {
    const f = path.join(SORTIE, "departments", dep + ".json");
    if (!fs.existsSync(f)) { paquets.length = 0; break; }   /* une region incomplete n'a pas d'agregat */
    paquets.push(JSON.parse(fs.readFileSync(f, "utf8")));
  }
  if (!paquets.length) continue;
  const ans = new Set();
  for (const p of paquets) for (const c of Object.values(p.communes || {})) for (const a of Object.keys((c && c.comptes) || {})) if (/^\d{4}$/.test(a)) ans.add(a);
  const exercices = {};
  for (const an of [...ans].sort()) {
    const m = medianeParHabitant(paquets, 1, an);
    if (m) exercices[an] = { mediane: m.mediane, moyenne: m.moyenne, n: m.n, total: m.total };
  }
  if (Object.keys(exercices).length) sortie.regions[code] = { nom: r.nom, exercices };
}
const texte = JSON.stringify(sortie);
fs.writeFileSync(path.join(SORTIE, "agregats-regionaux.json"), texte);
console.log(`agregats-regionaux.json : ${Object.keys(sortie.regions).length} regions, ${texte.length} octets`);
