/* LA GRILLE DES GROUPES (13/11/2026, retour d'un test sur iPhone : « on doit scroller pendant 3 minutes »).
 *
 * Le conteneur ne joint pas les sources : le scrutin et ses groupes sont SERVIS PAR LE TEST, et n'existent
 * nulle part ailleurs. Ce que le test prouve : les groupes tiennent en DEUX COLONNES, la liste est bien plus
 * courte qu'avant, les positions individuelles s'ouvrent sous la grille en pleine largeur, un seul groupe à
 * la fois, et le décompte reste écrit en toutes lettres dans chaque cellule (invariant 7 : la couleur ne dit
 * jamais le vote).
 * Usage : node apps/mobile/tests/groupes-grille-web.mjs http://localhost:8811 [dossier de captures] */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

/* Douze groupes, dont des noms longs : c'est le cas qui débordait sur iPhone. */
const GROUPES = [
  ["RN", "Rassemblement National", 123, 4, 1], ["EPR", "Ensemble pour la République", 92, 3, 2],
  ["LFI-NFP", "La France insoumise - Nouveau Front Populaire", 71, 0, 1], ["SOC", "Socialistes et apparentés", 66, 2, 3],
  ["DR", "Droite Républicaine", 47, 1, 0], ["EcoS", "Écologiste et Social", 38, 0, 2],
  ["DEM", "Les Démocrates", 36, 1, 1], ["HOR", "Horizons & Indépendants", 34, 0, 1],
  ["LIOT", "Libertés, Indépendants, Outre-mer et Territoires", 23, 1, 0], ["GDR", "Gauche Démocrate et Républicaine", 17, 0, 0],
  ["UDR", "UDR", 16, 0, 1], ["NI", "Non inscrits", 5, 1, 1],
];
const SOURCE = { producteur_affiche: "Assemblée nationale (essai)", licence: "Licence Ouverte 2.0", url: "https://exemple.invalid", releve_le: "2026-11-13" };
const resume = { n: "VTS1", d: "2026-11-10", t: "Projet de loi de finances pour 2027", ty: "ordinaire", s: "adopté",
  dec: { pour: 568, contre: 13, abstentions: 13 }, url: "https://exemple.invalid/scrutin/1", lot: 0 };
const index = { v: 1, source: SOURCE, total_source: 1, total_publics: 1, taille_lot: 100, scrutins: [resume] };
const detail = {
  ...resume, u: "https://exemple.invalid/scrutin/1",
  groupes: GROUPES.map(([ref, nom, pour, contre, abst]) => ({
    ref, nom, couleur: "", pour, contre, abstentions: abst,
    positions: Array.from({ length: Math.min(pour, 6) }, (_, i) => ({ a: `${ref}-${i}`, n: `Député ${ref} ${i + 1}`, p: "p" })),
  })),
};
const paquet = { v: 1, source: SOURCE, scrutins: [detail] };

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const erreurs = []; page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));
await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false, themes: [], mode: "clair", prenom: "" })));
await page.route("**/scrutins-index.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(index) }));
await page.route("**/scrutins-details/0000.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(paquet) }));
await page.goto(BASE + "/scrutins", { waitUntil: "networkidle" });

/* Le dernier scrutin s'ouvre tout seul : la grille est la, sans un geste de plus. */
const cellules = page.getByTestId("groupe-cellule");
await cellules.first().waitFor({ timeout: 20000 });
ok(await cellules.count() === GROUPES.length, `les ${GROUPES.length} groupes sont dans la grille (${await cellules.count()})`);

const boites = await cellules.evaluateAll(n => n.map(e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; }));
const lignes = new Map();
for (const b of boites) lignes.set(b.y, (lignes.get(b.y) || 0) + 1);
ok([...lignes.values()].every(v => v <= 2), "jamais plus de deux groupes par ligne (" + [...lignes.values()].join(",") + ")");
ok([...lignes.values()].filter(v => v === 2).length >= 5, "les groupes se rangent bien deux par deux");
ok(boites.every(b => b.h >= 44), "chaque cellule fait au moins 44 px de haut (cible tactile) : " + Math.min(...boites.map(b => b.h)) + " px");
ok(boites.every(b => b.w < 390 * 0.55), "chaque cellule occupe une demi-largeur : " + Math.max(...boites.map(b => b.w)) + " px");

/* La hauteur totale : c'est ce que le porteur a vu déborder. Douze groupes en liste faisaient 68 px chacun,
   soit plus de 810 px ; en deux colonnes, six lignes. */
const haut = Math.min(...boites.map(b => b.y)), bas = Math.max(...boites.map(b => b.y + b.h));
/* Mesure du 13/11/2026 : 496 px pour douze groupes (six lignes de 76 px, le decompte passant sur une
   deuxieme ligne quand il est long). La liste verticale faisait 68 px par groupe, soit plus de 810 px. */
ok(bas - haut <= 560, `la grille des douze groupes tient en ${bas - haut} px (la liste en faisait plus de 810)`);
if (CAP) { await cellules.first().scrollIntoViewIfNeeded(); await page.waitForTimeout(400); await page.screenshot({ path: `${CAP}/groupes-grille.png` }); }

/* Le décompte est écrit, pas seulement coloré (invariant 7). */
const premiere = (await cellules.first().innerText()).replace(/\s+/g, " ");
ok(/\d+ pour/.test(premiere) && /\d+ contre/.test(premiere), "le décompte est écrit en toutes lettres dans la cellule : « " + premiere.trim() + " »");
/* Le sigle plutot qu'un nom tronque : « RN » en dit plus que « Rassemblemen… ». */
const noms = (await cellules.allInnerTexts()).map(t => t.trim().split("\n")[0]);
ok(noms.slice(0, 4).join(" ") === "RN EPR LFI SOC", "les cellules portent le sigle du groupe : " + noms.slice(0, 4).join(" "));
ok(!noms.some(n => /…|\.\.\./.test(n)), "aucun nom n'est tronqué dans la grille : " + noms.join(" "));
ok(!noms.includes("Inconnu"), "un groupe sans sigle connu garde son nom, jamais « Inconnu »");
const etiquette = await cellules.first().getAttribute("aria-label");
ok(/Rassemblement National/.test(etiquette || ""), "le nom entier reste lu par un lecteur d'écran (« " + etiquette + " »)");

/* Les positions individuelles s'ouvrent SOUS la grille, en pleine largeur, une seule à la fois. */
await cellules.first().click();
const panneau = page.getByRole("button", { name: /^Fermer les positions du groupe/ });
await panneau.waitFor({ timeout: 10000 });
const bp = await panneau.boundingBox();
/* « Sous la grille » se verifie dans l'ordre du document : les positions a l'ecran dependent du defilement. */
const apres = await page.evaluate(() => {
  const cells = [...document.querySelectorAll('[data-testid="groupe-cellule"]')];
  const fermer = [...document.querySelectorAll('[role="button"]')].find(e => /^Fermer les positions du groupe/.test(e.getAttribute("aria-label") || ""));
  if (!cells.length || !fermer) return null;
  /* DOCUMENT_POSITION_FOLLOWING (4) : le panneau vient apres la derniere cellule. */
  return (cells[cells.length - 1].compareDocumentPosition(fermer) & 4) === 4;
});
ok(apres === true, "le panneau s'ouvre SOUS la grille, pas dans une cellule");
ok(bp.width > 390 * 0.8, "le panneau prend la pleine largeur (" + Math.round(bp.width) + " px)");
ok(await page.getByText("Député RN 1", { exact: false }).count() === 1, "les députés du groupe ouvert sont listés");
await cellules.nth(1).click();
await page.waitForTimeout(400);
ok(await page.getByRole("button", { name: /^Fermer les positions du groupe/ }).count() === 1, "un seul groupe ouvert à la fois");
ok(await page.getByText("Député RN 1", { exact: false }).count() === 0, "ouvrir un autre groupe referme le précédent");
if (CAP) { await page.getByRole("button", { name: /^Fermer les positions du groupe/ }).scrollIntoViewIfNeeded(); await page.waitForTimeout(400); await page.screenshot({ path: `${CAP}/groupes-ouvert.png` }); }
ok(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));

await nav.close();
console.log(echecs ? `grille des groupes : ${echecs} échec(s)` : "grille des groupes : zéro échec");
process.exit(echecs ? 1 : 0);
