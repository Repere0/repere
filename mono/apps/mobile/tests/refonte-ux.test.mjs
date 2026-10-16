/* GARDE : la refonte UX ne revient pas aux libelles techniques (16/10/2026).
 *  1. le calendrier n'affiche jamais « fin non publiée » : il dit « heure de fin non précisée » ;
 *  2. les etiquettes ne sont plus en capitales de style (theme.ts, TYPO.etiquette) ;
 *  3. « Chez vous » garde ses deux rubriques de circonscription pliables, et ne redit pas la chaine des elus.
 * Lancer : node --test tests/refonte-ux.test.mjs (MOBILE_SRC pour prouver la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ici = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MOBILE_SRC || join(ici, "..", "src");
const lire = p => readFileSync(join(SRC, p), "utf8");

test("le calendrier ne dit jamais « fin non publiée » : une formulation naturelle", () => {
  const cal = lire("app/(onglets)/a-venir.tsx");
  assert.doesNotMatch(cal, /fin non publiée/, "le calendrier affiche encore « fin non publiée »");
  assert.match(cal, /heure de fin non précisée/);
});

test("les etiquettes ne sont plus en capitales de style", () => {
  assert.doesNotMatch(lire("lib/theme.ts"), /textTransform/, "les etiquettes repassent en capitales de style");
});

test("« Chez vous » : circonscription pliable, et pas de chaine des elus", () => {
  const t = lire("app/(onglets)/territoire.tsx");
  assert.match(t, /<Depli titre="(Pourquoi|C'est quoi)/, "la circonscription n'a plus son explication pliable");
  assert.doesNotMatch(t, /\bChaine\b|chaineDecision/, "« Chez vous » reprend la chaine des elus");
});
