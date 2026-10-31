/* ONBOARDING : « Aucune préférence » à chaque question (V34, bloc 3).
 * Première visite sans profil : on choisit une commune, puis on règle les questions 2 à 4
 * et on remet chacune à sa valeur par défaut avec « Aucune préférence ». « Terminer » garde
 * les valeurs par défaut : vue France, texte de 16 points, aucun sujet.
 * Usage : node apps/mobile/tests/onboarding-web.mjs http://localhost:8811 */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };

const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await contexte.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));

await page.goto(BASE + "/", { waitUntil: "networkidle" });
if (!(await page.getByLabel(/Où habitez-vous/).isVisible().catch(() => false))) await page.getByRole("button", { name: "Chercher une commune" }).first().click();
await page.getByLabel(/Où habitez-vous/).fill("Paris");
await page.getByRole("button", { name: /^Paris,/ }).first().click();
await page.getByText("QUESTION 4 SUR 4", { exact: false }).first().waitFor({ timeout: 15000 });

await page.getByRole("radio", { name: /Ma rue/ }).first().click();
await page.getByRole("button", { name: "Aucune préférence : vue France" }).click();
verifier(await page.getByText("La France  (choisi)").count() > 0, "question 2 : « Aucune préférence » remet la vue France");

await page.getByRole("radio", { name: /Texte de 22 points/ }).first().click();
await page.getByRole("button", { name: "Aucune préférence : texte de 16 points" }).click();
await page.waitForTimeout(300);

await page.getByRole("checkbox", { name: /^Santé/ }).click();
await page.getByRole("button", { name: "Aucune préférence : aucun sujet" }).click();
verifier(await page.getByRole("checkbox", { checked: true }).count() === 0, "question 4 : « Aucune préférence » décoche tous les sujets");

await page.getByRole("button", { name: "Terminer" }).click();
await page.waitForTimeout(2000);
const profil = await page.evaluate(() => JSON.parse(localStorage.getItem("repere.profil") || "null"));
verifier(profil && profil.niveauZoom === "france" && profil.tailleTexte === 16 && Array.isArray(profil.themes) && profil.themes.length === 0,
  `« Terminer » garde les valeurs par défaut (${JSON.stringify(profil && { niveauZoom: profil.niveauZoom, tailleTexte: profil.tailleTexte, themes: profil.themes })})`);
verifier(erreurs.length === 0, "onboarding : aucune erreur JavaScript" + (erreurs.length ? " (" + erreurs[0] + ")" : ""));

await navigateur.close();
console.log(echecs === 0 ? "onboarding : zéro échec" : `onboarding : ${echecs} échec(s)`);
process.exit(echecs === 0 ? 0 : 1);
