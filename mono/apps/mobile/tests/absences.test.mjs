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

/* Le libellé lu par un lecteur d'écran écrit « abstentions », non l'abréviation « abst. ». */
test("absences — le libellé d'accessibilité d'un groupe écrit « abstentions », non « abst. »", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const src = fs.readFileSync(path.join(import.meta.dirname, "..", "src", "app", "scrutins.tsx"), "utf8");
  const debut = src.indexOf("function GroupeRow");
  const corps = src.slice(debut, src.indexOf("\n}\n", debut));
  const ligne = (corps.match(/accessibilityLabel=\{[^\n]*\}/) || [""])[0];
  assert.match(ligne, /texteAccessible/, "le libellé d'accessibilité doit venir d'un texte réservé à la lecture");
  assert.doesNotMatch(corps.match(/const texteAccessible[\s\S]*?;\n/)?.[0] || "", /abst\./, "le texte lu ne doit pas contenir « abst. »");
});

/* La date de debut d'un mandat est affichee avec sa source, ou le manque est dit. */
test("absences — la fiche dit la date de début de mandat avec sa source, ou qu'elle n'est pas publiée", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const src = fs.readFileSync(path.join(import.meta.dirname, "..", "src", "app", "elu.tsx"), "utf8");
  assert.match(src, /debutDeMandat\(/, "la fiche lit la date de début par le cœur, qui exige la date de relevé");
  assert.match(src, /debutMandat\.etat === "date"/, "la date ne s'affiche que dans l'état « date »");
  assert.match(src, /non publiée par la source/, "la fiche doit dire quand la date n'est pas publiée");
  assert.match(src, /non affichée, la source ne dit pas quand/, "la fiche doit dire quand la date existe sans date de relevé");
});
