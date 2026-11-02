/* Garde : les commandes du dictionnaire citoyen (« Tous », chaque lettre, « Effacer »)
 * ont une cible tactile au moins egale a CIBLE (theme.ts, 48 pt).
 * Avant : 40 pt de haut, lettres de 40 pt de large, « Effacer » de 40 pt.
 * Mesure le 15/10/2026 sur l'export web (390 px) : 8 commandes sous 48 pt.
 * Usage : node --test tests/cibles-dictionnaire.test.mjs
 * DICO_FICHIER=<chemin> teste une autre copie de dictionnaire.tsx (preuve de la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dicoFichier = process.env.DICO_FICHIER
  || path.join(here, "..", "src", "app", "dictionnaire.tsx");
const theme = fs.readFileSync(path.join(here, "..", "src", "lib", "theme.ts"), "utf8");
const dico = fs.readFileSync(dicoFichier, "utf8");
const CIBLE = Number(theme.match(/export const CIBLE = (\d+)/)?.[1]);

const valeur = (v) => (v === "CIBLE" ? CIBLE : Number(v));

test("CIBLE du theme est lue", () => assert.ok(CIBLE >= 44, `CIBLE = ${CIBLE}`));

test("commandes « Tous » et lettres : hauteur minimale >= CIBLE", () => {
  const m = dico.match(/const chip = \(actif: boolean\) => \(\{\s*minHeight: (\d+|CIBLE)/);
  assert.ok(m, "definition de chip() introuvable");
  assert.ok(valeur(m[1]) >= CIBLE, `chip : ${valeur(m[1])} pt de haut (minimum ${CIBLE})`);
});

test("lettres : largeur minimale >= CIBLE", () => {
  const m = dico.match(/\{ width: (\d+|CIBLE), paddingHorizontal: 0 \}/);
  assert.ok(m, "largeur des lettres introuvable");
  assert.ok(valeur(m[1]) >= CIBLE, `lettre : ${valeur(m[1])} pt de large (minimum ${CIBLE})`);
});

test("« Effacer » : cible au moins CIBLE (hauteur ou bords sur toute la hauteur du champ)", () => {
  const debut = dico.indexOf(">Effacer<");
  const bloc = dico.slice(Math.max(0, dico.lastIndexOf("accessibilityLabel=\"Effacer la recherche\"")), debut);
  assert.ok(debut > 0 && bloc.length, "bouton « Effacer » introuvable");
  const haut = bloc.match(/minHeight: (\d+|CIBLE)/);
  const pleineHauteur = /top: 0, bottom: 0/.test(bloc);
  const ok = (haut && valeur(haut[1]) >= CIBLE) || pleineHauteur;
  assert.ok(ok, `« Effacer » : ni minHeight >= ${CIBLE} ni bords haut/bas sur le champ`);
});
