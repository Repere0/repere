/* Garde : chaque onglet du filtre « Tout / Assemblée / Sénat » du calendrier a une
 * cible tactile au moins egale a CIBLE (theme.ts, 48 pt). Avant : 40 pt, mesure
 * le 15/10/2026 sur l'export web (390 px, onglet Calendrier, vue semaine).
 * Lit le source de a-venir.tsx et la valeur de CIBLE dans theme.ts.
 * Usage : node --test tests/cibles-filtre.test.mjs
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

test("onglets du filtre institution : minHeight >= CIBLE", () => {
  const debut = app.indexOf('accessibilityRole="tab"');
  assert.ok(debut >= 0, "onglets du filtre introuvables (accessibilityRole=\"tab\")");
  const bloc = app.slice(debut, debut + 600);
  const m = bloc.match(/minHeight: (\d+|CIBLE)/);
  assert.ok(m, "minHeight de l'onglet du filtre introuvable");
  const pt = m[1] === "CIBLE" ? CIBLE : Number(m[1]);
  assert.ok(pt >= CIBLE, `onglet du filtre : ${pt} pt (minimum ${CIBLE})`);
});
