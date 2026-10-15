/* Garde d'USAGE : les couleurs d'echelon (ville, agglo, dept, region, france) ne
 * servent jamais de couleur de TEXTE, sauf la marque « Repère » (grand texte,
 * 22 pt, sur le sol : 3:1 suffit). Raison : sur leur propre teinte elles tombent
 * sous 4,5:1 (theme.ts, decision « palette B partiel » du 30/09/2026). Le test
 * attrape un ajout futur (ex. un libelle d'echelon en couleur d'echelon).
 * Lit tous les fichiers de src/. Usage : node --test tests/usage-echelons.test.mjs
 * SRC_DOSSIER=<chemin> teste une autre copie de src/ (preuve de la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = process.env.SRC_DOSSIER || path.join(here, "..", "src");
const ECHELONS = ["ville", "agglo", "dept", "region", "france"];

function fichiers(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? fichiers(p) : /\.(tsx?|jsx?)$/.test(e.name) ? [p] : [];
  });
}

/* Chaque occurrence « color: couleurs.<echelon> » ou « color: couleurs["<echelon>"] ».
 * Une occurrence est tolérée seulement si son objet de style annonce fontSize >= 22. */
const motif = new RegExp(`color:\\s*couleurs(\\.(${ECHELONS.join("|")})\\b|\\[["'](${ECHELONS.join("|")})["']\\])`, "g");

test("aucune couleur d'echelon en couleur de texte (hors marque 22 pt)", () => {
  const fautes = [];
  for (const f of fichiers(src)) {
    const texte = fs.readFileSync(f, "utf8");
    for (const m of texte.matchAll(motif)) {
      const avant = texte.slice(Math.max(0, m.index - 300), m.index);
      const bloc = texte.slice(m.index, m.index + 200);
      const grand = /fontSize:\s*(2[2-9]|[3-9]\d)\b/.test(avant + bloc);
      if (!grand) fautes.push(`${path.relative(src, f)} : ${m[0]}`);
    }
  }
  assert.deepEqual(fautes, [], "couleur d'echelon en texte : " + fautes.join(" ; "));
});

test("la marque « Repère » reste la seule exception, en 22 pt", () => {
  const ex = [];
  for (const f of fichiers(src)) {
    const texte = fs.readFileSync(f, "utf8");
    for (const m of texte.matchAll(motif)) ex.push(`${path.relative(src, f)}`);
  }
  assert.ok(ex.length <= 1, `exceptions trouvees : ${ex.join(", ")}`);
});
