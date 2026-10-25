/* GARDE : le texte de la carte de partage reste lisible en messagerie (15/10/2026).
 * La carte est dessinee sur 380 unites de large, puis reduite : une messagerie
 * l'affiche a environ 300 a 340 px. Sous 15 unites, le texte devient illisible
 * (12 unites = 9 px affiches). Le test lit partager.tsx et refuse toute taille
 * sous le seuil, y compris une taille ecrite en dur.
 * Lancer : node --test tests/partager-lisible.test.mjs (MOBILE_SRC pour prouver la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ici = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MOBILE_SRC || join(ici, "..", "src");
const texte = readFileSync(join(SRC, "app", "partager.tsx"), "utf8");
const SEUIL = 15;

test("chaque taille de la carte est d'au moins 15 unites de dessin", () => {
  const tailles = [...texte.matchAll(/fontSize:\s*(\d+(?:\.\d+)?)\s*\*\s*echelle/g)].map(m => Number(m[1]));
  assert.ok(tailles.length >= 10, `peu de tailles trouvees (${tailles.length}) : le motif a change ?`);
  const petites = tailles.filter(t => t < SEUIL);
  assert.deepEqual(petites, [], `tailles sous ${SEUIL} unites : ${JSON.stringify(petites)}`);
});

test("aucune taille de texte en dur dans la carte (tout passe par l'echelle)", () => {
  const debut = texte.indexOf("CARTE 1");
  const fin = texte.indexOf("<View style={{ gap: PAS * 2 }}>", debut);
  const carte = texte.slice(debut, fin);
  assert.doesNotMatch(carte, /fontSize:\s*\d+(?:\.\d+)?\s*(?:,|\}|\n)/, "une taille fixe dans la carte ne suit pas la largeur d'ecran");
});
