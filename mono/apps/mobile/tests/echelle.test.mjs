/* GARDE — LE DESIGN SYSTEM, PAS DES VALEURS EN DUR (audit UI, vague 2, 16/11/2026).
 * Mesuré à l'audit : 20 tailles de texte écrites en dur pour une échelle de 7, et 47 espacements
 * sur 106 hors de la grille de 4. Cette garde lit le code de src/ :
 *   - une taille de texte écrite en dur doit appartenir à ECHELLE_TYPO (lib/theme.ts) ;
 *   - un espacement écrit en dur (padding, margin, gap) est un multiple de 4, ou 1 ou 2 (filets),
 *     ou porte le commentaire « alignement optique » (centrer un point sur une ligne de texte) ;
 *   - une exception assumée porte « hors échelle : » suivi de sa raison (décision datée) ;
 *   - PAS * x : x entier, ou 0,5.
 * Exclus : les cartes de partage, images de 1 080 px avec leur propre échelle. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(import.meta.dirname, "..", "src");
const EXCLUS = [/[\\/]ui[\\/]partage[\\/]/, /partage-repere-du-jour\.tsx$/, /[\\/]app[\\/]partager\.tsx$/];
const fichiers = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? fichiers(path.join(d, e.name)) : /\.tsx?$/.test(e.name) ? [path.join(d, e.name)] : []);
const theme = fs.readFileSync(path.join(SRC, "lib", "theme.ts"), "utf8");
const ECHELLE = new Set(JSON.parse(theme.match(/ECHELLE_TYPO = (\[[^\]]+\])/)[1]));

export function ecarts(source) {
  const sortie = [];
  source.split("\n").forEach((l, i) => {
    if (/alignement optique|hors échelle :/.test(l)) return;
    for (const m of l.matchAll(/fontSize:\s*(?:[^,}\n?]+\?\s*)?(\d+(?:\.\d+)?)(?:\s*:\s*(\d+(?:\.\d+)?))?/g))
      for (const v of [m[1], m[2]].filter(Boolean)) if (!ECHELLE.has(Number(v))) sortie.push(`l.${i + 1} taille ${v}`);
    for (const m of l.matchAll(/\b(?:padding|margin)(?:Top|Bottom|Left|Right|Horizontal|Vertical)?:\s*(\d+(?:\.\d+)?)\b|\b(?:gap|rowGap|columnGap):\s*(\d+(?:\.\d+)?)\b/g)) {
      const v = Number(m[1] ?? m[2]);
      if (v % 4 !== 0 && v !== 1 && v !== 2) sortie.push(`l.${i + 1} espacement ${v}`);
    }
    for (const m of l.matchAll(/\bPAS \* (\d+\.\d+)/g)) if (Number(m[1]) !== 0.5) sortie.push(`l.${i + 1} PAS * ${m[1]}`);
  });
  return sortie;
}

test("garde — tailles de texte et espacements écrits en dur suivent le design system", () => {
  const fautes = fichiers(SRC).filter(f => !EXCLUS.some(r => r.test(f)))
    .flatMap(f => ecarts(fs.readFileSync(f, "utf8")).map(e => `${path.relative(SRC, f)} ${e}`));
  assert.deepEqual(fautes, [], `hors du design system :\n${fautes.join("\n")}`);
});

test("la garde voit bien une taille, un espacement et un pas hors échelle", () => {
  assert.equal(ecarts("{ fontSize: 18, padding: 6, gap: PAS * 1.5 }").length, 3);
  assert.equal(ecarts("{ fontSize: grand ? 18 : 15 }").length, 1);
  assert.equal(ecarts("{ fontSize: 17, padding: 8, gap: PAS * 2, marginTop: 2 }").length, 0);
  assert.equal(ecarts("{ marginTop: 6 /* alignement optique */ }").length, 0);
});
