/* NIVEAU DE ZOOM dans le navigateur (V26, bloc 2) : « Ma rue » cache le national,
   « Tout » montre tout. Lit le rendu réel (deux profils, même commune).
   Usage : node apps/mobile/tests/zoom-web.mjs http://localhost:8811 */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };
const profil = niveau => ({ niveauZoom: niveau, tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: false, modeDaltonien: false, masquerImages: false });

const navigateur = await chromium.launch();
async function ouvrir(niveau, chemin) {
  const page = await (await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await page.addInitScript(([cle, valeur]) => {
    if (!localStorage.getItem("repere.departement")) localStorage.setItem("repere.departement", JSON.stringify({ d: "77", c: "77284" }));
    localStorage.setItem(cle, valeur);
  }, ["repere.profil", JSON.stringify(profil(niveau))]);
  /* La commune retenue n'est choisie qu'en passant par l'accueil (comme un lecteur). */
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Voir ce qui se passe à Meaux" }).click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  if (chemin === "/qui-decide") await page.getByRole("button", { name: "Qui décide", exact: true }).first().click();
  if (chemin === "/actus") await page.getByText("Voir les actualités").first().click();
  await page.waitForTimeout(1200);
  return page;
}

/* 1. Qui décide, vue « Ma rue » : pas d'échelon régional ni national. */
{
  const p = await ouvrir("rue", "/qui-decide");
  const t = (await p.locator("body").innerText()).toLowerCase();
  verifier(t.includes("vue : ma rue"), "zoom : le badge indique « Vue : Ma rue »");
  verifier(!t.includes("assemblée nationale") && !t.includes("région"), "zoom « rue » : Qui décide ne montre ni l'échelon national ni la région");
  verifier(t.includes("commune") && t.includes("département"), "zoom « rue » : la commune et le département restent");
  await p.close();
}
/* 2. Qui décide, vue « Tout » : tous les échelons. */
{
  const p = await ouvrir("tout", "/qui-decide");
  const t = (await p.locator("body").innerText()).toLowerCase();
  verifier(t.includes("assemblée nationale") && t.includes("région"), "zoom « tout » : Qui décide montre tous les échelons");
  await p.close();
}
/* 3. Actualités, vue « Ma rue » : le message dit que c'est national, et rien n'est listé. */
{
  const p = await ouvrir("rue", "/actus");
  const t = (await p.locator("body").innerText()).toLowerCase();
  verifier(t.includes("ces actualités sont nationales"), "zoom « rue » : les actualités disent qu'elles sont nationales");
  await p.close();
}
/* 4. Changer la vue depuis le badge : « Tout » ramène les échelons. */
{
  const p = await ouvrir("rue", "/qui-decide");
  await p.getByRole("button", { name: /Vue : Ma rue/ }).click();
  await p.getByRole("radio", { name: /Vue Tout/ }).click();
  await p.waitForTimeout(800);
  const t = (await p.locator("body").innerText()).toLowerCase();
  verifier(t.includes("vue : tout") && t.includes("assemblée nationale"), "zoom : « Changer » puis « Tout » remontre le national");
  await p.close();
}
/* 5. Confort de lecture : un réglage se garde, se voit, et se retrouve au rechargement. */
{
  const p = await (await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await p.addInitScript(() => {
    if (!localStorage.getItem("repere.departement")) localStorage.setItem("repere.departement", JSON.stringify({ d: "77", c: "77284" }));
    if (!localStorage.getItem("repere.profil")) localStorage.setItem("repere.profil", JSON.stringify({ niveauZoom: "tout", tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: false, modeDaltonien: false, masquerImages: false }));
  });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.getByRole("link", { name: "Confort de lecture ›" }).click();
  await p.getByRole("radio", { name: /Texte de 22 points/ }).click();
  await p.waitForTimeout(600);
  const gardé = await p.evaluate(() => JSON.parse(localStorage.getItem("repere.profil") || "{}").tailleTexte);
  verifier(gardé === 22, "confort : la taille 22 est gardée dans repere.profil");
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.getByRole("link", { name: "Confort de lecture ›" }).click();
  await p.getByRole("radio", { name: /Texte de 22 points, choisi/ }).first().waitFor({ timeout: 10000 });
  verifier(true, "confort : la taille choisie est retrouvée après rechargement");
  await p.close();
}
await navigateur.close();
console.log(echecs === 0 ? "zoom : zéro échec" : `zoom : ${echecs} échec(s)`);
process.exit(echecs === 0 ? 0 : 1);
