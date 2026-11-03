/* LE DÉCOUPAGE IDF (V59, bloc 1.1) — contrôle du fichier produit par scripts/construire-decoupage-idf.mjs.
 * Garde : 1 266 communes actuelles, huit départements, un EPCI pour chaque commune, population
 * renseignée, pas de doublon, source et date présentes. Meaux et Montreuil servent de contrôle. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const d = JSON.parse(fs.readFileSync(path.join(RACINE, "data/decoupage-idf.json"), "utf8"));

test("découpage IDF — source, date et périmètre", () => {
  assert.ok(d.source.producteur && d.source.licence && d.source.url, "source incomplète");
  assert.match(d.source.publie_le, /^\d{4}-\d{2}-\d{2}$/, "date de publication absente");
  assert.equal(Object.keys(d.departements).sort().join(","), "75,77,78,91,92,93,94,95");
});

test("découpage IDF — 1 266 communes actuelles, sans doublon", () => {
  assert.equal(d.communes.length, 1266);
  assert.equal(d.nombre_communes, d.communes.length);
  assert.equal(new Set(d.communes.map(c => c.codeInsee)).size, d.communes.length, "code INSEE en double");
  for (const c of d.communes) assert.ok(["75", "77", "78", "91", "92", "93", "94", "95"].includes(c.departement), c.nom);
});

test("découpage IDF — chaque commune a un EPCI et une population (pas de valeur devinée)", () => {
  assert.equal(d.communes.filter(c => !c.epci).length, 0, "commune sans EPCI");
  assert.equal(d.communes.filter(c => typeof c.population !== "number").length, 0, "commune sans population");
});

test("découpage IDF — contrôles par commune", () => {
  const meaux = d.communes.find(c => c.codeInsee === "77284");
  assert.equal(meaux.nom, "Meaux");
  assert.equal(meaux.departement, "77");
  assert.equal(meaux.epci.type, "CA");
  const montreuil = d.communes.find(c => c.codeInsee === "93048");
  assert.equal(montreuil.epci.nom, "Métropole du Grand Paris");
  assert.equal(montreuil.ept.nom, "Est Ensemble");
});
