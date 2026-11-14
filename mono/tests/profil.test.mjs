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
test("D67 : le mode vaut auto, clair ou sombre ; une autre valeur revient au défaut, clair (Stitch, 09/11/2026)", () => {
  assert.deepEqual(MODES, ["auto", "clair", "sombre"]);
  for (const m of MODES) assert.equal(valideProfil({ mode: m }).mode, m);
  assert.equal(valideProfil({ mode: "noir" }).mode, "clair");
  assert.equal(valideProfil({}).mode, "clair");
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

/* 13/11/2026 (ADR 0009) : le prénom, facultatif, gardé dans repere.profil. La règle est pure : ce qui n'est pas un
   prénom (chiffres, balises, texte trop long) n'est jamais gardé, et rien n'est « réparé » en silence. */
test("prénom : gardé nettoyé (espaces, apostrophe typographique), 24 caractères au plus", async () => {
  const { nettoyerPrenom, PRENOM_MAX } = await import("../packages/core/src/profil.js");
  assert.equal(nettoyerPrenom("  Léa  "), "Léa");
  assert.equal(nettoyerPrenom("Jean   Pierre"), "Jean Pierre");
  assert.equal(nettoyerPrenom("Marie-Hélène"), "Marie-Hélène");
  assert.equal(nettoyerPrenom("N’Golo"), "N'Golo");
  assert.equal(nettoyerPrenom("A".repeat(PRENOM_MAX)), "A".repeat(PRENOM_MAX));
  assert.equal(nettoyerPrenom("A".repeat(PRENOM_MAX + 1)), "");
});
test("prénom : chiffres, signes, balises, vide ou autre chose qu'un texte ne sont pas gardés", async () => {
  const { nettoyerPrenom } = await import("../packages/core/src/profil.js");
  for (const v of ["", "   ", "R2D2", "<b>Léa</b>", "léa@exemple.fr", "-Léa", "Léa!", 12, null, undefined, { prenom: "Léa" }]) assert.equal(nettoyerPrenom(v), "", JSON.stringify(v));
});
test("prénom : valideProfil le garde, et un profil sans prénom vaut le défaut (vide)", () => {
  assert.equal(PROFIL_DEFAUT.prenom, "");
  assert.equal(valideProfil({ prenom: " Inès " }).prenom, "Inès");
  assert.equal(valideProfil({ prenom: "<script>" }).prenom, "");
  assert.equal(valideProfil({ tailleTexte: 18 }).prenom, "");
});

/* 13/11/2026 (ADR 0010) : les points et les rangs du quiz civique, dans repere.profil. */
test("quiz : un total illisible ou négatif revient à zéro, jamais réparé vers le haut", async () => {
  const { nettoyerPoints, POINTS_MAX } = await import("../packages/core/src/profil.js");
  for (const v of [-1, -1000, "abc", null, undefined, NaN, Infinity, {}]) assert.equal(nettoyerPoints(v), 0, JSON.stringify(v));
  assert.equal(nettoyerPoints(10.7), 10, "un total est entier");
  assert.equal(nettoyerPoints("250"), 250, "un total écrit en texte est lu");
  assert.equal(nettoyerPoints(POINTS_MAX + 5), POINTS_MAX, "un total aberrant est borné");
});
test("quiz : les quatre rangs du porteur, bornes comprises, et le reste avant le suivant", async () => {
  const { rangPour, pointsAvantRangSuivant, RANGS } = await import("../packages/core/src/profil.js");
  assert.deepEqual(RANGS.map(r => r.nom), ["Néo-citoyen", "Citoyen", "Super Citoyen", "Sage"]);
  for (const [p, nom] of [[0, "Néo-citoyen"], [50, "Néo-citoyen"], [51, "Citoyen"], [200, "Citoyen"],
    [201, "Super Citoyen"], [500, "Super Citoyen"], [501, "Sage"], [99999, "Sage"]]) {
    assert.equal(rangPour(p).nom, nom, `${p} points`);
  }
  assert.equal(rangPour(-5).nom, "Néo-citoyen", "un total refusé donne quand même un rang");
  assert.equal(pointsAvantRangSuivant(0), 51);
  assert.equal(pointsAvantRangSuivant(200), 1);
  assert.equal(pointsAvantRangSuivant(501), null, "au dernier rang, il n'y a plus de suivant");
});
test("quiz : les points sont gardés dans repere.profil, pas dans une clé de plus (invariant 2)", () => {
  assert.equal(PROFIL_DEFAUT.points, 0);
  assert.equal(valideProfil({ points: 320 }).points, 320);
  assert.equal(valideProfil({ points: "beaucoup" }).points, 0);
  assert.equal(valideProfil({}).points, 0);
});

/* 14/11/2026 (porteur, ADR 0011) : `onboardingVu` dit si la bienvenue a été terminée sur cet appareil. Un profil
   gardé avant ce jour ne porte pas la clé : c'est « pas encore vu », et la bienvenue passe une fois. */
test("onboarding : onboardingVu est un booléen de repere.profil, faux tant que la bienvenue n'est pas terminée", () => {
  assert.equal(PROFIL_DEFAUT.onboardingVu, false);
  assert.equal(valideProfil({ tailleTexte: 22, prenom: "Inès", points: 40 }).onboardingVu, false, "profil d'avant : pas encore vu");
  assert.equal(valideProfil({ onboardingVu: true }).onboardingVu, true);
  for (const v of ["true", 1, "oui", null, {}]) assert.equal(valideProfil({ onboardingVu: v }).onboardingVu, false, JSON.stringify(v));
  /* les réglages d'un profil d'avant sont lus tels quels : rien n'est remis à zéro par la lecture */
  const avant = valideProfil({ tailleTexte: 22, espacement: 1.8, prenom: "Inès", points: 40, themes: [] });
  assert.deepEqual([avant.tailleTexte, avant.espacement, avant.prenom, avant.points], [22, 1.8, "Inès", 40]);
});
