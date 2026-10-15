/* Garde : chaque case du calendrier (vue semaine ET vue mois) a une cible tactile
 * au moins egale a CIBLE (theme.ts, 48 pt). Avant : la case du mois etait a 42 pt.
 * Lit le source de a-venir.tsx et la valeur de CIBLE dans theme.ts.
 * Usage : node --test tests/cibles-calendrier.test.mjs
 * CIBLE_FICHIER=<chemin> teste une autre copie de a-venir.tsx (preuve de la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appFichier = process.env.CIBLE_FICHIER
  || path.join(here, "..", "src", "app", "(onglets)", "a-venir.tsx");
const theme = fs.readFileSync(path.join(here, "..", "src", "lib", "theme.ts"), "utf8");
const app = fs.readFileSync(appFichier, "utf8");

const CIBLE = Number(theme.match(/export const CIBLE = (\d+)/)?.[1]);
test("CIBLE du theme est lue", () => assert.ok(CIBLE >= 44, `CIBLE = ${CIBLE}`));

test("case de la vue mois : minHeight >= CIBLE", () => {
  const m = app.match(/minHeight: grand \? (\d+) : (\w+)/);
  assert.ok(m, "expression minHeight de la case introuvable");
  const mois = m[2] === "CIBLE" ? CIBLE : Number(m[2]);
  assert.ok(mois >= CIBLE, `case du mois : ${mois} pt (minimum ${CIBLE})`);
});

test("case de la vue semaine : minHeight >= CIBLE", () => {
  const m = app.match(/minHeight: grand \? (\d+) : (\w+)/);
  assert.ok(Number(m[1]) >= CIBLE, `case de la semaine : ${m[1]} pt (minimum ${CIBLE})`);
});
