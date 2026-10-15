/* Garde : l'ecran « Questions au Gouvernement » ne dit « Chargement » que tant que
 * le chargement est EN COURS. Avant : le texte « Chargement des questions au
 * Gouvernement » s'affichait pour TOUT etat sans donnee (fichier absent, echec,
 * hors ligne) : un chargement qui ne finit jamais, presente comme normal.
 * Mesure le 15/10/2026 : la copie locale des donnees n'a pas le fichier, et
 * l'ecran restait sur « Chargement » sans fin.
 * Lit src/app/scrutins.tsx. Usage : node --test tests/vide-qag.test.mjs
 * SCRUTINS_FICHIER=<chemin> teste une autre copie (preuve de la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const fichier = process.env.SCRUTINS_FICHIER || path.join(here, "..", "src", "app", "scrutins.tsx");
const s = fs.readFileSync(fichier, "utf8");

test("l'etat du chargement des QAG est retenu", () => {
  assert.match(s, /setQagEtat\(r\.etat\)/, "setQagEtat(r.etat) introuvable");
});

test("« Chargement des questions » seulement pendant EN_COURS", () => {
  const occurrences = s.match(/Chargement des questions au Gouvernement/g) || [];
  assert.equal(occurrences.length, 1, `texte de chargement present ${occurrences.length} fois`);
  assert.match(s, /qagEtat === ETATS\.EN_COURS \? "Chargement des questions au Gouvernement\."/,
    "le texte « Chargement » n'est pas conditionne par EN_COURS");
});

test("sans donnee hors chargement : une phrase vraie, pas un chargement", () => {
  assert.match(s, /Les questions au Gouvernement ne sont pas disponibles\./,
    "phrase d'absence introuvable");
});
