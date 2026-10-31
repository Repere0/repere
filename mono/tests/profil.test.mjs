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

test("zoom : « rue » ne garde que le local, « region » cache le national, « france » garde tout", () => {
  const echelons = ["ville", "agglo", "dept", "region", "france"];
  assert.deepEqual(echelons.filter(e => visibleAuNiveau("rue", e)), ["ville", "agglo", "dept"]);
  assert.deepEqual(echelons.filter(e => visibleAuNiveau("region", e)), ["ville", "agglo", "dept", "region"]);
  assert.deepEqual(echelons.filter(e => visibleAuNiveau("france", e)), echelons);
});

test("zoom : un échelon inconnu est caché en vue « rue » (jamais affiché par défaut)", () => {
  assert.equal(visibleAuNiveau("rue", "inconnu"), false);
});

test("D47 : « tout » n'existe plus ; un profil gardé avec « tout » devient « france »", () => {
  assert.equal(valideProfil({ niveauZoom: "tout" }).niveauZoom, "france");
  assert.deepEqual(NIVEAUX_ZOOM, ["rue", "region", "france"]);
  assert.equal(PROFIL_DEFAUT.niveauZoom, "france");
});

test("D45 : le profil par défaut est exactement celui du « Passer »", () => {
  assert.deepEqual(valideProfil({}), PROFIL_DEFAUT);
});

/* V35, bloc 1 (D67) : le mode d'affichage est gardé dans le même profil, sans nouvelle clé. */
import { MODES } from "../packages/core/src/profil.js";
test("D67 : le mode vaut auto, clair ou sombre ; une autre valeur revient à auto", () => {
  assert.deepEqual(MODES, ["auto", "clair", "sombre"]);
  for (const m of MODES) assert.equal(valideProfil({ mode: m }).mode, m);
  assert.equal(valideProfil({ mode: "noir" }).mode, "auto");
  assert.equal(valideProfil({}).mode, "auto");
  assert.equal(valideProfil({ mode: "sombre", tailleTexte: 22 }).tailleTexte, 22, "un champ voisin reste gardé");
});

/* V31, bloc 1 (D57) : thèmes d'intérêt. */
import { THEMES, themesDuTexte } from "../packages/core/src/themes.js";
test("thèmes : seules les valeurs de THEMES sont gardées, sans doublon", () => {
  assert.deepEqual(valideProfil({ themes: ["Santé", "inconnu", "Santé", "École"] }).themes, ["Santé", "École"]);
  assert.deepEqual(valideProfil({ themes: "Santé" }).themes, []);
  assert.deepEqual(valideProfil(null).themes, []);
  assert.equal(THEMES.length, 7);
});
test("thèmes : un titre se range par mots-clés, sans accents, en début de mot", () => {
  assert.deepEqual(themesDuTexte("Projet de loi sur les écoles et la santé"), ["Santé", "École"]);
  assert.deepEqual(themesDuTexte("Le budget de la commune"), ["Budget"]);
  assert.deepEqual(themesDuTexte("Une loi sans rapport"), []);
  assert.deepEqual(themesDuTexte("entraînement sportif"), [], "« train » ne doit pas être trouvé au milieu d'un mot");
});
