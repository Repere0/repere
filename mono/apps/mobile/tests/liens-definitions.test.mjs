/* GARDE : les liens « Ce que veut dire » pointent vers une vraie definition (17/10/2026).
 * Trois ecrans portent un lien vers le glossaire (@repere/core, mots.js) :
 *  - « Où va l'argent » : la carte « Sa dette » -> « encours de dette » ;
 *  - « Qui décide » : l'adjoint au maire -> « adjoint au maire » ;
 *  - « Qui décide » : un conseil départemental sans élu nommé -> « conseil départemental ».
 * Controle : chaque cle est bien posee dans l'ecran ET existe dans le glossaire.
 * Lancer : node --test tests/liens-definitions.test.mjs (MOBILE_SRC pour prouver la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ici = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MOBILE_SRC || join(ici, "..", "src");
const GLOSSAIRE_SRC = readFileSync(join(ici, "..", "..", "..", "packages", "core", "src", "mots.js"), "utf8");
const lire = p => readFileSync(join(SRC, p), "utf8");

const LIENS = [
  ["app/argent.tsx", "encours de dette"],
  ["app/(onglets)/qui-decide.tsx", "adjoint au maire"],
  ["app/(onglets)/qui-decide.tsx", "conseil départemental"],
];

for (const [fichier, cle] of LIENS) {
  test(`« ${cle} » : un lien dans ${fichier}`, () => {
    assert.match(lire(fichier), new RegExp(`<LienDefinition cle="${cle}"`), `lien « ${cle} » absent de ${fichier}`);
  });
  test(`« ${cle} » existe dans le glossaire (mots.js)`, () => {
    assert.ok(GLOSSAIRE_SRC.includes(`"${cle}": {`), `« ${cle} » n'est pas une entree du glossaire`);
  });
}
