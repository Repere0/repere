/* Doctrine du vide, cote application mobile (invariant 5 de CLAUDE.md) :
 * une donnée absente ne devient jamais un zéro, y compris dans un libellé
 * lu par un lecteur d'écran. Défaut trouvé le 13/10/2026 : le libellé
 * « 0 positions publiées » était calculé avec `|| 0` pour un groupe sans chiffres.
 *
 * Contrôle statique : aucun libellé d'accessibilité ne contient un repli à zéro
 * (`|| 0` ou `?? 0`) dans ses expressions.
 *
 * PROUVER LE GARDE-FOU EN LE CASSANT : pointer vers la version d'origine de
 * scrutins.tsx doit faire échouer le test.
 *   MOBILE_SRC=<dossier contenant app/> node --test tests/doctrine-vide-mobile.test.mjs
 *
 * Usage : node --test tests/doctrine-vide-mobile.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MOBILE_SRC
  || join(HERE, "..", "apps", "mobile", "src");

function fichiers(dossier) {
  const out = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) {
      if (nom !== "node_modules") out.push(...fichiers(chemin));
    } else if ([".tsx", ".ts"].includes(extname(nom))) {
      out.push(chemin);
    }
  }
  return out;
}

test("doctrine du vide — aucun libellé d'accessibilité ne fabrique un zéro", () => {
  const fautes = [];
  for (const f of fichiers(SRC)) {
    const lignes = readFileSync(f, "utf8").split(/\r?\n/);
    const libelles = lignes.filter((l) => /accessibilityLabel/.test(l));
    lignes.forEach((ligne, i) => {
      // Une variable calculée avec un repli à zéro (const x = ... || 0)...
      const m = ligne.match(/const\s+(\w+)\s*=.*(\|\||\?\?)\s*0\b/);
      if (!m) return;
      // ...dont la valeur entre dans un libellé d'accessibilité.
      const entreDansLibelle = libelles.some((l) => l.includes("${" + m[1]));
      if (entreDansLibelle) fautes.push(`${f}:${i + 1} : ${ligne.trim()}`);
    });
  }
  assert.deepEqual(fautes, [], "libellés d'accessibilité avec repli à zéro :\n" + fautes.join("\n"));
});
