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

/* Le libelle d'accessibilite d'un groupe de scrutin annonce ce qui est publie.
   Un total calcule avec « || 0 » compte une position absente comme zero, et
   annonce « N positions publiees » pour une somme partielle. */
test("absences — le libellé d'un groupe de scrutin n'additionne pas une position absente comme zéro", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const src = fs.readFileSync(path.join(import.meta.dirname, "..", "src", "app", "scrutins.tsx"), "utf8");
  const debut = src.indexOf("function GroupeRow");
  assert.ok(debut > 0, "GroupeRow introuvable");
  const corps = src.slice(debut, src.indexOf("\n}\n", debut));
  assert.doesNotMatch(corps, /\|\|\s*0\b/, "GroupeRow additionne une position absente comme zéro (|| 0)");
  assert.doesNotMatch(corps, /positions publiées/, "le libellé annonce une somme au lieu de ce qui est publié");
});
