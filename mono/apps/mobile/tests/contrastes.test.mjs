/* Garde de contraste (WCAG 2.x), sur les jetons REELS du theme mobile.
 * Lit theme.ts (couleurs, TEINTES) et les cinq couleurs d'echelon de data-utils.
 * Regles :
 *  - texte courant (encre, sourd, lien) : >= 4,5:1 sur chaque fond d'ecran et teinte ;
 *  - marque en couleur « ville » sur le sol : >= 3:1 (texte de 22 px, grand corps) ;
 *  - libelle blanc sur le bouton « ville » (17 px gras) : >= 4,5:1.
 * Ce que le test NE couvre PAS : les couleurs d'echelon sur leur teinte (3,24 a 4,34 :
 * documente dans theme.ts, qui interdit ce texte) et tout rendu reel sur appareil.
 * Usage : node --test tests/contrastes.test.mjs
 * THEME=<chemin> teste une autre copie de theme.ts (preuve de la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const theme = fs.readFileSync(process.env.THEME || path.join(here, "..", "src", "lib", "theme.ts"), "utf8");
const dataUtils = fs.readFileSync(path.join(here, "..", "..", "..", "packages", "data-utils", "src", "invariants.js"), "utf8");

const hex = (src, nom) => {
  const m = src.match(new RegExp(`\\b${nom}:\\s*"(#[0-9a-fA-F]{6})"`));
  assert.ok(m, `jeton « ${nom} » introuvable`);
  return m[1];
};
const bloc = (src, nom) => {
  const m = src.match(new RegExp(`export const ${nom}[^{]*\\{([\\s\\S]*?)\\}`));
  assert.ok(m, `bloc « ${nom} » introuvable`);
  return m[1];
};

const ECHELON = Object.fromEntries(["ville", "agglo", "dept", "region", "france"].map(k => [k, hex(bloc(dataUtils, "ECHELONS"), k)]));
const TEINTES = Object.fromEntries(["ville", "agglo", "dept", "region", "france"].map(k => [k, hex(bloc(theme, "TEINTES"), k)]));
const COUL = bloc(theme, "couleurs");
const J = Object.fromEntries(["sol", "carte", "voile", "encre", "sourd", "lien"].map(k => [k, hex(COUL, k)]));

const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = h => { const n = parseInt(h.slice(1), 16); return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const fonds = { "sol": J.sol, "carte": J.carte, "voile": J.voile, ...Object.fromEntries(Object.entries(TEINTES).map(([k, v]) => ["teinte " + k, v])) };

test("texte courant : encre, sourd et lien >= 4,5:1 sur chaque fond", () => {
  for (const t of ["encre", "sourd", "lien"]) for (const [f, b] of Object.entries(fonds)) {
    const r = ratio(J[t], b);
    assert.ok(r >= 4.5, `${t} sur ${f} : ${r.toFixed(2)}:1 (minimum 4,5)`);
  }
});

test("marque couleur « ville » sur le sol >= 3:1 (grand texte)", () => {
  const r = ratio(ECHELON.ville, J.sol);
  assert.ok(r >= 3, `ville sur sol : ${r.toFixed(2)}:1 (minimum 3)`);
});

test("libelle blanc sur le bouton « ville » >= 4,5:1", () => {
  const r = ratio("#ffffff", ECHELON.ville);
  assert.ok(r >= 4.5, `blanc sur ville : ${r.toFixed(2)}:1 (minimum 4,5)`);
});
