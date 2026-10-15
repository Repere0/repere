/* Garde d'accessibilite : le libelle d'une case de jour porte le BON mois.
 * Avant : « 1 octobre » pour le 1er novembre (libelle code en dur dans a-venir.tsx).
 * Lancer : node --test tests/libelle-case.test.mjs
 * LIBELLE_CASE=<chemin> permet de tester une autre implementation (preuve de la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const cible = process.env.LIBELLE_CASE || path.join(here, "..", "src", "lib", "libelle-case.ts");
const { libelleCase } = await import(pathToFileURL(cible).href);

test("libelle de case : le mois suit la date (1er novembre n'est pas « octobre »)", () => {
  assert.equal(libelleCase("2026-11-01", 0), "1 novembre, 0 élément");
});
test("libelle de case : octobre reste octobre, pluriel correct", () => {
  assert.equal(libelleCase("2026-10-13", 2), "13 octobre, 2 éléments");
});
test("libelle de case : fin d'année et accents", () => {
  assert.equal(libelleCase("2026-12-31", 1), "31 décembre, 1 élément");
  assert.equal(libelleCase("2026-02-08", 0), "8 février, 0 élément");
});
