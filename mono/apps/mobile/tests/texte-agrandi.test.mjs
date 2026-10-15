/* GARDE : le texte agrandi reste lisible sans desactiver l'accessibilite (15/10/2026).
 * Verifications statiques sur src/ :
 *  1. aucun allowFontScaling={false} (on ne coupe jamais l'agrandissement) ;
 *  2. aucun plafond inferieur a 1.4 (maxFontSizeMultiplier) ;
 *  3. la barre basse grandit avec son texte (minHeight, pas height fixe) ;
 *  4. les noms et titres qui portent un sens ne sont pas tronques a une ligne
 *     (le nom du depute, les titres de scrutins).
 * Lancer : node --test tests/texte-agrandi.test.mjs (MOBILE_SRC pour prouver la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ici = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MOBILE_SRC || join(ici, "..", "src");
function fichiers(d) {
  return readdirSync(d).flatMap(n => { const p = join(d, n); return statSync(p).isDirectory() ? fichiers(p) : /\.(tsx?|jsx?)$/.test(n) ? [p] : []; });
}
const tous = fichiers(SRC).map(p => [p, readFileSync(p, "utf8")]);

test("aucun composant ne desactive l'agrandissement du texte", () => {
  const fautes = tous.filter(([, s]) => /allowFontScaling\s*=\s*\{\s*false\s*\}/.test(s)).map(([p]) => p);
  assert.deepEqual(fautes, []);
});

test("aucun plafond d'agrandissement trop bas", () => {
  const valeurs = tous.flatMap(([p, s]) => [...s.matchAll(/maxFontSizeMultiplier=\{([\d.]+)\}/g)].map(m => [p, Number(m[1])]));
  assert.ok(valeurs.length >= 1, "les plafonds attendus ont disparu ?");
  assert.deepEqual(valeurs.filter(([, v]) => v < 1.4), []);
});

test("la barre basse grandit avec son texte", () => {
  const layout = tous.find(([p]) => /_layout\.tsx$/.test(p) && /\(onglets\)/.test(p));
  assert.ok(layout, "_layout des onglets introuvable");
  assert.doesNotMatch(layout[1], /tabBarStyle:[^}]*\bheight:\s*\d+/, "hauteur fixe de la barre basse");
  assert.match(layout[1], /minHeight:\s*72/);
});

test("le nom du depute et les titres de scrutins ne sont pas tronques a une ligne", () => {
  const visuels = tous.find(([p]) => /ui\/visuels\.tsx$/.test(p))[1];
  assert.doesNotMatch(visuels, /numberOfLines=\{1\}>\{qui\}/, "le nom du depute est tronque");
  const scrutins = tous.find(([p]) => /app\/scrutins\.tsx$/.test(p))[1];
  assert.doesNotMatch(scrutins, /numberOfLines=\{\d\} style=\{s\.selectionTitre\}/, "titre de scrutin tronque");
});
