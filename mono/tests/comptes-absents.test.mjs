/* GARDE : une commune sans comptes publies ne montre ni montant ni zero (15/10/2026).
 * Un exercice sans aucun montant n'est pas un exercice : dernierExercice l'ecarte,
 * et l'ecran « Ou va l'argent » dit « ses comptes ne figurent pas dans le fichier
 * officiel », sans chiffre. Un zero PUBLIE reste un montant : il n'est jamais
 * ecarte. Lancer : node --test tests/comptes-absents.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";

const { dernierExercice, valeur, comptesAbsents, rapports } = await import("../packages/core/src/index.js");

/* Six agregats, comme dans la donnee : un couple (montant, par habitant) chacun. */
const AGREGATS = [{}, {}, {}, {}, {}, {}];
const vide = pop => [pop, null, null, null, null, null, null, null, null, null, null, null, null];
const complet = [2129, 9964288, 4680, 9566565, 4493, 11360441, 5335, 2102893, 988, 2844072, 1336, 6424911, 3017];

test("aucun exercice publie : pas d'exercice, donc pas de chiffre", () => {
  assert.equal(dernierExercice({ nom: "Vide", comptes: {} }, AGREGATS), null);
  assert.equal(dernierExercice({ nom: "Sans comptes" }, AGREGATS), null);
  assert.equal(dernierExercice(null, AGREGATS), null);
});

test("un exercice qui ne porte que la population n'est pas un exercice", () => {
  const c = { comptes: { 2025: vide(2129) } };
  assert.equal(dernierExercice(c, AGREGATS), null);
});

test("une commune complete garde son dernier exercice", () => {
  const c = { comptes: { 2024: vide(2100), 2025: complet } };
  assert.equal(dernierExercice(c, AGREGATS).an, "2025");
});

test("un zero publie est un montant : l'exercice n'est pas ecarte", () => {
  const zero = [1500, 0, 0, null, null, null, null, null, null, null, null, null, null];
  const c = { comptes: { 2025: zero } };
  const e = dernierExercice(c, AGREGATS);
  assert.ok(e, "un exercice dont le seul montant est 0 doit rester");
  assert.equal(valeur(e.ex, 0).zero, true);
});

test("l'absence est dite sans chiffre", () => {
  const phrase = comptesAbsents("Vide");
  assert.match(phrase.titre, /ne figurent pas dans le fichier officiel/);
  assert.doesNotMatch(phrase.titre + phrase.corps, /\d/, "aucun chiffre dans la phrase d'absence");
  assert.match(phrase.corps, /pas un montant nul/);
  assert.ok(phrase.lien && phrase.lien.url, "un lien vers la source");
});

test("sans exercice, aucun rapport n'est calcule (pas de pourcentage invente)", () => {
  assert.deepEqual(rapports(undefined), []);
});
