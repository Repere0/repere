/* GARDE SUR LA DONNEE PUBLIEE (15/10/2026) : une commune dont les comptes ne sont pas
 * publies (comptes: null) n'a aucun exercice, donc aucun montant et aucun zero.
 * Cas reels : 67 communes (Saint-Pierre-et-Miquelon, Polynesie, Nouvelle-Caledonie),
 * aucune en Ile-de-France : le cas existe dans la donnee nationale, pas dans le
 * perimetre bêta. Lit les fiches reelles (data/departments).
 * Lancer : node --test tests/comptes-reels.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DONNEES = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "departments");
const { dernierExercice } = await import("../packages/core/src/index.js");

const AGREGATS = [{}, {}, {}, {}, {}, {}];
const communes = [];
for (const f of readdirSync(DONNEES).filter(n => n.endsWith(".json")).sort()) {
  const dep = JSON.parse(readFileSync(join(DONNEES, f), "utf8"));
  for (const [code, fiche] of Object.entries(dep.communes)) communes.push({ code, dep: dep.d, fiche });
}
const sansComptes = communes.filter(c => c.fiche.comptes === null);

test("cas reels presents : des communes sans comptes publies existent dans la donnee", () => {
  assert.ok(sansComptes.length > 0, "aucune commune sans comptes dans la donnee : le cas n'est plus teste");
});

test("une commune sans comptes publies n'a aucun exercice : pas de montant, pas de zero", () => {
  for (const c of sansComptes) {
    assert.equal(dernierExercice(c.fiche, AGREGATS), null, `${c.fiche.nom} (${c.code}) : un exercice est affiche`);
  }
});
