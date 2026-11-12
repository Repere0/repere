// « Copier le lien » et le bloc « En clair » (12/11/2026). Usage : node apps/mobile/tests/en-clair-web.mjs http://localhost:8811
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await ctx.newPage();
const erreurs = []; page.on("pageerror", e => erreurs.push(String(e)));

await page.goto(BASE + "/actus#melun", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await page.getByRole("button", { name: "Copier le lien de cette page" }).first().click();
await page.getByText("Lien copié").first().waitFor({ timeout: 5000 });
const presse = await page.evaluate(() => navigator.clipboard.readText());
ok(presse === BASE + "/actus#melun", `le lien copié porte la commune après le « # » (${presse})`);

await page.goto(BASE + "/apercu-en-clair", { waitUntil: "networkidle" });
await page.getByText("En clair", { exact: true }).first().waitFor({ timeout: 10000 });
const t = await page.locator("body").innerText();
ok(/503 députés ont voté pour, aucun contre, et 67 se sont abstenus/.test(t), "le résumé d'exemple s'affiche");
ok(t.includes("Résumé généré avec l'aide de l'IA à partir des données officielles de l'Assemblée nationale."), "la mention d'assistance IA est écrite en toutes lettres");
ok(await page.getByRole("link", { name: /Lire le texte officiel/ }).count() === 1, "le lien vers la source est là");
ok(!/Sénat|large majorité/.test(t), "rien qui ne soit dans la source (ni étape à venir, ni jugement)");
ok(!erreurs.length, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `en clair : ${echecs} échec(s)` : "en clair : zéro échec");
process.exit(echecs ? 1 : 0);
