/* ABSENCES — LE TEXTE NE FAIT PAS PLUS QUE LA SOURCE — 29/10/2026.
 *
 * Une intercommunalité absente du fichier n'est pas une commune sans délégué.
 * Le site le dit (« c'est la source qui est incomplète ») ; l'application doit
 * dire la même chose. Garde statique : le texte et la branche null existent. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");
const qui = fs.readFileSync(path.join(RACINE, "src", "app", "(onglets)", "qui-decide.tsx"), "utf8");

test("absences — l'intercommunalité absente de la source est dite incomplète, jamais « sans délégué »", () => {
  assert.match(qui, /n\.delegues === null/, "la branche « inconnu » (null) doit exister");
  assert.match(qui, /C'est la source qui est incomplète, pas la commune qui n'en a pas\./, "même formulation que le site");
});
