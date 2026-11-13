/* « COUP DE FRAÎCHEUR » DU 11/11/2026 : ce que le mouvement et la typographie ne doivent pas casser.
 *   - Repère du jour : la bordure « fraîche » n'existe QUE si la publication affichée est la courante
 *     (invariant 9). Avec l'index injoignable et la copie gardée sur l'appareil, elle disparaît.
 *   - Le chiffre héros du budget compte, mais finit exactement sur la valeur publiée (aussi pour le lecteur d'écran).
 *   - Un bouton s'enfonce sous le doigt (échelle 0,97).
 *   - Présidentielle : l'illustration d'attente remplace les lignes grises, la phrase vraie reste.
 *   - Texte secondaire : 14 px.
 * Usage : node apps/mobile/tests/fraicheur-mouvement-web.mjs http://localhost:8811 */
import { createRequire } from "node:module";
import { passerBienvenue } from "./_premier-lancement.mjs";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };

const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await contexte.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));

/* La commune se choisit comme un lecteur : aucune clé de stockage écrite ici. */
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await passerBienvenue(page);
if (!(await page.getByLabel(/Où habitez-vous/).isVisible().catch(() => false))) await page.getByRole("button", { name: "Chercher une commune" }).first().click();
await page.getByLabel(/Où habitez-vous/).fill("Paris");
await page.getByRole("button", { name: /^Paris,/ }).first().click();
await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });

/* Retour d'appui : une souris (contexte non tactile) tient « C'est parti » enfoncé */
{
  const ctxSouris = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctxSouris.newPage();
  await p2.goto(BASE + "/bienvenue", { waitUntil: "networkidle" });
  /* Les trois écrans de bienvenue, puis le retour d'appui sur le dernier bouton. */
  await p2.getByTestId("continuer-0").click();
  await p2.getByRole("button", { name: /^Passer, sans/ }).click();
  const note = p2.getByText("Zéro traceur", { exact: false }).first();
  await note.waitFor({ timeout: 10000 });
  verifier(await note.evaluate(e => getComputedStyle(e).fontSize) === "15px", "texte de l'écran des valeurs : 15 px");
  const terminer = p2.getByTestId("continuer-2");
  await terminer.scrollIntoViewIfNeeded();
  const boite = await terminer.boundingBox();
  await p2.mouse.move(boite.x + boite.width / 2, boite.y + boite.height / 2);
  await p2.mouse.down();
  await p2.waitForTimeout(200);
  const pressee = await terminer.evaluate(e => getComputedStyle(e).transform);
  await p2.mouse.up();
  verifier(/matrix\(0\.97/.test(pressee), "bouton : s'enfonce sous le doigt (" + pressee + ")");
  await ctxSouris.close();
}

/* Chiffre héros : finit exactement sur la valeur publiée */
await page.waitForTimeout(1500);
const chiffre = page.locator('[aria-label$=" euros"]').first();
verifier(await chiffre.count() === 1, "accueil : le chiffre héros du budget est présent");
const vu = await chiffre.evaluate(e => e.textContent.replace(/[\s  €]/g, ""));
const dit = await chiffre.getAttribute("aria-label");
verifier(vu === dit.replace(/[\s  ]/g, "").replace("euros", ""), "accueil : le chiffre affiché finit sur la valeur lue (" + vu + " = " + dit + ")");

/* Repère du jour : bordure fraîche seulement si la publication est la courante */
verifier(await page.getByTestId("repere-frais").count() === 1, "repère du jour : bordure « fraîche » quand la publication est la courante");

/* Index injoignable, copie gardée sur l'appareil : « publication précédente », donc plus d'effet « frais » */
await contexte.route("**/data/index.json", r => r.abort());
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await passerBienvenue(page);
if (!(await page.getByLabel(/Où habitez-vous/).isVisible().catch(() => false))) await page.getByRole("button", { name: "Chercher une commune" }).first().click();
await page.getByLabel(/Où habitez-vous/).fill("Paris");
await page.getByRole("button", { name: /^Paris,/ }).first().click();
await page.getByText("Aller plus loin").first().waitFor({ timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1500);
const avecBandeau = await page.getByRole("button", { name: "Ouvrir le Repère du jour" }).count();
verifier(avecBandeau === 1, "repère du jour : le bandeau est affiché depuis la copie gardée");
verifier(await page.getByTestId("fraicheur").count() >= 1, "fraîcheur : l'écran dit que la publication n'est pas la courante");
verifier(await page.getByTestId("repere-frais").count() === 0, "repère du jour : aucune bordure « fraîche » en publication précédente");
await contexte.unroute("**/data/index.json");

/* Présidentielle : illustration d'attente, phrase vraie conservée.
   Les quatre fichiers sont servis par le test, tels que publiés (listes vides) : en CI les données
   viennent du fichier autonome, sans ces fichiers, et l'écran afficherait « pas arrivé ». */
const publie = { candidats: { candidats: [] }, debats: { debats: [] }, meetings: { meetings: [] },
  meta: { lastUpdate: "2026-11-09", source: { producteur: "Conseil constitutionnel", url: "https://www.conseil-constitutionnel.fr/" }, note: "Aucune liste officielle de candidats n'est publiée à cette date." } };
await contexte.route("**/data/presidentielle-2027/*.json", r => {
  const nom = r.request().url().split("/").pop().replace(".json", "").split("?")[0];
  return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(publie[nom] ?? {}) });
});
await page.goto(BASE + "/presidentielle-2027", { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Candidats", exact: true }).click();   /* 13/11/2026 : la page est rangée en onglets */
await page.getByText("Bientôt", { exact: true }).first().waitFor({ timeout: 15000 }).catch(() => {});
verifier(await page.getByText("Bientôt", { exact: true }).count() >= 1, "présidentielle : l'illustration d'attente est là");
verifier(await page.getByText("Aucun nom n'est affiché avant la liste officielle", { exact: false }).count() >= 1, "présidentielle : la phrase vraie reste sous l'illustration");

verifier(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await navigateur.close();
console.log(echecs ? `fraîcheur-mouvement : ${echecs} échec(s)` : "fraîcheur-mouvement : zéro échec");
process.exit(echecs ? 1 : 0);
