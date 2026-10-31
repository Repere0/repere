/* NIVEAUX D'ECHELON DANS LES CARTES — 29/10/2026 (D17).
 *
 * Une carte d'echelon dit son niveau par un TEXTE (« Commune », « Région »…),
 * pas seulement par la couleur de son point. Le point qui reste sous 3:1 sur la
 * carte (sombre : la Région, 2,37:1) recoit un contour de l'encre ; la couleur,
 * elle, reste gelee (invariant 7).
 *
 * Controle sans appareil : les noms reprennent ceux de packages/core, les deux
 * briques de carte les affichent, et l'ensemble des points sous le seuil est fige
 * sur les vraies valeurs de palette.ts. Ne prouve pas l'aspect a l'ecran. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ECHELONS } from "@repere/data-utils";
import { ECHELONS_PAR_MODE, NEUTRES_PAR_MODE, rapportContraste, SEUIL_POINT } from "../src/lib/palette.ts";

const RACINE = path.resolve(import.meta.dirname, "..");
const lire = p => fs.readFileSync(path.join(RACINE, p), "utf8");
const composants = lire("src/lib/composants.tsx");
const niveaux = lire("src/lib/niveaux.ts");

const nomsCore = Object.fromEntries(
  [...lire("../../packages/core/src/visuels.js").matchAll(/echelon: "(\w+)", niveau: "([^"]+)"/g)].map(m => [m[1], m[2]]),
);

test("niveaux — chaque echelon a un nom affiche, identique a celui de packages/core", () => {
  const bloc = niveaux.match(/export const NIVEAU_NOM[^=]*=\s*\{([\s\S]*?)\};/);
  assert.ok(bloc, "NIVEAU_NOM introuvable dans src/lib/niveaux.ts");
  const noms = Object.fromEntries([...bloc[1].matchAll(/(\w+):\s*"([^"]+)"/g)].map(m => [m[1], m[2]]));
  assert.deepEqual(Object.keys(noms).sort(), Object.keys(ECHELONS).sort(), "un nom par echelon, et seulement ceux-la");
  for (const k of Object.keys(ECHELONS)) {
    assert.equal(noms[k], nomsCore[k], `echelon ${k} : « ${noms[k]} » attendu « ${nomsCore[k]} » (packages/core)`);
  }
});

test("niveaux — Carte et CarteQuestion affichent le nom de leur echelon", () => {
  const corps = name => composants.slice(composants.indexOf(`export function ${name}`), composants.indexOf("\n}\n", composants.indexOf(`export function ${name}`)));
  assert.match(corps("Carte"), /NIVEAU_NOM\[echelon\]/, "Carte doit ecrire le niveau");
  assert.match(corps("CarteQuestion"), /NIVEAU_NOM\[echelon\]/, "CarteQuestion doit ecrire le niveau");
});

test("niveaux — le point d'echelon recoit un contour quand il est sous le seuil de 3:1", () => {
  assert.match(niveaux, /rapportContraste\(couleurs\[echelon\], couleurs\.carte\) < SEUIL_POINT/);
  assert.match(niveaux, /borderColor: couleurs\.encre/, "le contour est l'encre, pas une couleur nouvelle");
  assert.equal(SEUIL_POINT, 3, "seuil WCAG 1.4.11 : 3:1");
});

for (const m of ["clair", "sombre"]) {
  test(`niveaux ${m} — ensemble des points sous 3:1 sur la carte, fige sur les vraies valeurs`, () => {
    const carte = NEUTRES_PAR_MODE[m].carte;
    const sous = Object.keys(ECHELONS_PAR_MODE[m]).filter(k => rapportContraste(ECHELONS_PAR_MODE[m][k], carte) < SEUIL_POINT);
    const attendu = m === "sombre" ? ["region"] : [];
    assert.deepEqual(sous, attendu, `points sous 3:1 (${m}) : ${sous.join(", ") || "aucun"} ; relire la decision si cela change`);
  });
}
