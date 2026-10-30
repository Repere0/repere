/* Profil de lecture et niveau de zoom (V26, ADR 0006) : la logique pure, sans stockage. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { valideProfil, visibleAuNiveau, PROFIL_DEFAUT, NIVEAUX_ZOOM, TAILLES_TEXTE, ESPACEMENTS, CONTRASTES } from "../packages/core/src/profil.js";

test("profil : un profil vide donne exactement les défauts", () => {
  assert.deepEqual(valideProfil(null), PROFIL_DEFAUT);
  assert.deepEqual(valideProfil({}), PROFIL_DEFAUT);
  assert.deepEqual(valideProfil("texte"), PROFIL_DEFAUT);
});

test("profil : une valeur hors liste revient au défaut de son seul champ", () => {
  const p = valideProfil({ tailleTexte: 999, niveauZoom: "rue", masquerImages: "oui", espacement: 1.8 });
  assert.equal(p.tailleTexte, PROFIL_DEFAUT.tailleTexte);
  assert.equal(p.masquerImages, PROFIL_DEFAUT.masquerImages);
  assert.equal(p.niveauZoom, "rue");
  assert.equal(p.espacement, 1.8);
});

test("profil : aucun champ inconnu n'est gardé", () => {
  const p = valideProfil({ commune: "77288", email: "x@y", tailleTexte: 22 });
  assert.deepEqual(Object.keys(p).sort(), Object.keys(PROFIL_DEFAUT).sort());
  assert.equal(p.tailleTexte, 22);
});

test("profil : toutes les valeurs listées sont acceptées", () => {
  for (const n of NIVEAUX_ZOOM) assert.equal(valideProfil({ niveauZoom: n }).niveauZoom, n);
  for (const t of TAILLES_TEXTE) assert.equal(valideProfil({ tailleTexte: t }).tailleTexte, t);
  for (const e of ESPACEMENTS) assert.equal(valideProfil({ espacement: e }).espacement, e);
  for (const c of CONTRASTES) assert.equal(valideProfil({ contraste: c }).contraste, c);
});

test("zoom : « rue » ne garde que le local, « region » cache le national, « france » et « tout » gardent tout", () => {
  const echelons = ["ville", "agglo", "dept", "region", "france"];
  assert.deepEqual(echelons.filter(e => visibleAuNiveau("rue", e)), ["ville", "agglo", "dept"]);
  assert.deepEqual(echelons.filter(e => visibleAuNiveau("region", e)), ["ville", "agglo", "dept", "region"]);
  assert.deepEqual(echelons.filter(e => visibleAuNiveau("france", e)), echelons);
  assert.deepEqual(echelons.filter(e => visibleAuNiveau("tout", e)), echelons);
});

test("zoom : un échelon inconnu est caché en vue « rue » (jamais affiché par défaut)", () => {
  assert.equal(visibleAuNiveau("rue", "inconnu"), false);
});
