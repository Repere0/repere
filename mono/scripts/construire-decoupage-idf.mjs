/* Produit data/decoupage-idf.json à partir du paquet officiel @etalab/decoupage-administratif
 * (version 6.0.0, publiée sur npm le 09/03/2026 ; données DGCL, INSEE, La Poste ; licence
 * Licence Ouverte selon le README du paquet).
 *
 * Usage : node scripts/construire-decoupage-idf.mjs <dossier data du paquet> <sortie>
 *   ex. node scripts/construire-decoupage-idf.mjs <paquet>/data scripts/decoupage-idf.json
 *
 * Périmètre : les 8 départements d'Île-de-France (75, 77, 78, 91, 92, 93, 94, 95), communes
 * actuelles seulement (les arrondissements municipaux, communes déléguées et associées sont
 * exclus de la liste). Aucune donnée n'est inventée : un champ absent reste null. */
import fs from "node:fs";
import path from "node:path";

const [, , dossier, sortie] = process.argv;
if (!dossier || !sortie) { console.error("usage : node scripts/construire-decoupage-idf.mjs <dossier data> <sortie>"); process.exit(2); }
const lire = f => JSON.parse(fs.readFileSync(path.join(dossier, f), "utf8"));
const IDF = ["75", "77", "78", "91", "92", "93", "94", "95"];

const communes = lire("communes.json");
const epci = lire("epci.json");
const ept = lire("ept.json");
const departements = lire("departements.json");
const regions = lire("regions.json");

const parCommuneEpci = new Map();
for (const e of epci) for (const m of e.membres || []) parCommuneEpci.set(m.code, { code: e.code, nom: e.nom, type: e.type });
const parCommuneEpt = new Map();
for (const e of ept) for (const m of e.membres || []) parCommuneEpt.set(m.code, { code: e.code, nom: e.nom });
const nomDep = Object.fromEntries(departements.map(d => [d.code, d.nom]));
const nomReg = Object.fromEntries(regions.map(r => [r.code, r.nom]));

const retenues = communes
  .filter(c => IDF.includes(c.departement) && c.type === "commune-actuelle")
  .sort((a, b) => a.code.localeCompare(b.code));
const vus = new Set();
const liste = [];
for (const c of retenues) {
  if (vus.has(c.code)) continue;
  vus.add(c.code);
  liste.push({
    codeInsee: c.code,
    nom: c.nom,
    departement: c.departement,
    region: c.region,
    epci: parCommuneEpci.get(c.code) || null,
    ept: parCommuneEpt.get(c.code) || null,
    population: typeof c.population === "number" ? c.population : null,
  });
}

const sortie_ = {
  v: 1,
  genere_le: new Date().toISOString().slice(0, 10),
  source: {
    producteur: "Etalab / DGCL / INSEE — découpage administratif (paquet npm @etalab/decoupage-administratif 6.0.0)",
    licence: "Licence Ouverte (selon le README du paquet)",
    url: "https://github.com/etalab/decoupage-administratif",
    paquet: "@etalab/decoupage-administratif@6.0.0",
    publie_le: "2026-03-09",
    portee: "communes actuelles des 8 départements d'Île-de-France",
  },
  departements: Object.fromEntries(IDF.map(d => [d, nomDep[d] ?? null])),
  regions: { "11": nomReg["11"] ?? null },
  nombre_communes: liste.length,
  communes: liste,
};
fs.writeFileSync(sortie, JSON.stringify(sortie_) + "\n");
console.log(`communes IDF : ${liste.length} ; sans EPCI : ${liste.filter(c => !c.epci).length} ; sans population : ${liste.filter(c => c.population === null).length}`);
