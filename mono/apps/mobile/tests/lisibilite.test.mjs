/* LISIBILITE — LE TEXTE QUI EXPLIQUE UN MOT N'EST PAS LE PLUS PETIT DE L'ECRAN — 29/10/2026.
 *
 * Sur la liste des votes, la phrase qui dit ce que « solennel » veut dire était
 * en TYPO.micro (13 px, gris). Le mot est nouveau pour la plupart des lecteurs ;
 * sa phrase d'explication passe en TYPO.note (15 px, même gris, contraste déjà
 * vérifié sur le thème). Garde statique : elle lit le source, sans appareil. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");
const vote = fs.readFileSync(path.join(RACINE, "src", "app", "vote.tsx"), "utf8");

test("lisibilité — la phrase qui explique « solennel » sur la liste des votes n'est pas en TYPO.micro", () => {
  assert.doesNotMatch(vote, /TYPO\.micro\}>(Scrutins|Derniers votes) solennels/, "la phrase d'explication reste en 13 px");
  assert.match(vote, /TYPO\.note\}>(Scrutins|Derniers votes) solennels/, "la phrase d'explication passe en TYPO.note (15 px)");
});
