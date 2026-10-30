// RECHERCHE TOLERANTE DE L'ANNUAIRE DES ELUS (30/10/2026). Une faute de frappe ne fait
// pas disparaître un élu ; un sigle court n'est jamais rapproché d'un autre mot.
import { test } from "node:test";
import assert from "node:assert/strict";
import * as core from "../../../packages/core/src/index.js";

const cible = (t) => core.motsCible(t);

test("distanceFrappe : une lettre en trop, oubliée, changée ou inversée compte pour une faute", () => {
  assert.equal(core.distanceFrappe("delacroix", "delacroix"), 0);
  assert.equal(core.distanceFrappe("dellacroix", "delacroix"), 1);
  assert.equal(core.distanceFrappe("delacrox", "delacroix"), 1);
  assert.equal(core.distanceFrappe("delacroax", "delacroix"), 1);
  assert.equal(core.distanceFrappe("lamhar", "lahmar"), 1, "deux lettres inversées : une faute");
});

test("correspondFlou : trouve un élu malgré une faute de frappe", () => {
  const nom = cible("Abdelkader Lahmar Député Rhône 7e circonscription");
  assert.ok(core.correspondFlou(["lamhar"], nom), "inversion dans le nom de famille");
  assert.ok(core.correspondFlou(["abdelkadr"], nom), "lettre oubliée dans le prénom");
  assert.ok(core.correspondFlou(["lahmar"], nom), "forme exacte");
  assert.ok(core.correspondFlou(["rhone"], nom), "département sans accent");
});

test("correspondFlou : les mots courts ne sont jamais rapprochés", () => {
  const texte = cible("Rhône, Auvergne-Rhône-Alpes");
  assert.equal(core.correspondFlou(["rn"], texte), false, "« rn » ne doit pas trouver « rhône »");
  assert.equal(core.correspondFlou(["rhon"], texte), true, "début de mot : toujours accepté");
});

test("correspondFlou : un mot qui n'existe pas ne trouve rien, et tous les mots doivent correspondre", () => {
  const nom = cible("Agnès Firmin Le Bodo Député Seine-Maritime");
  assert.equal(core.correspondFlou(["zzzzzzzz"], nom), false);
  assert.equal(core.correspondFlou(["firmin", "zzzzzzzz"], nom), false, "un mot sans correspondance écarte l'élu");
  assert.equal(core.correspondFlou(["firmin", "maritime"], nom), true);
});
