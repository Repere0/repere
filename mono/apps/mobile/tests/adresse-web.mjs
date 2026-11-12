// L'adresse partageable : « /finances#melun ». La commune vit après le « # » et n'est jamais envoyée au serveur
// (invariant 2). Usage : node apps/mobile/tests/adresse-web.mjs http://localhost:8811
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const requetes = [], erreurs = [];
page.on("request", r => requetes.push(r.url())); page.on("pageerror", e => erreurs.push(String(e)));
const aller = async url => { await page.goto(BASE + url, { waitUntil: "networkidle" }); await page.waitForTimeout(1800); };
const chemin = () => page.url().replace(BASE, "");

await aller("/finances#melun");
ok((await page.title()) === "Finances de Melun - Repère", `un lien « #melun » choisit Melun, titre de l'onglet : « ${await page.title()} »`);
ok(/Melun/.test(await page.locator("body").innerText()), "l'écran parle de Melun");
ok(chemin() === "/finances#melun", `le « # » est conservé (${chemin()})`);
ok(!requetes.some(u => /melun|77288/i.test(u)), "aucune requête réseau ne porte la commune");

const onglet = page.getByRole("tab").filter({ hasText: /Qui décide/i }).first();
if (await onglet.count()) {
  await onglet.click(); await page.waitForTimeout(1200);
  ok(chemin() === "/qui-decide#melun", `le « # » suit la navigation (${chemin()})`);
  ok((await page.title()) === "Qui décide à Melun - Repère", `le titre suit l'écran : « ${await page.title()} »`);
} else ok(false, "onglet « Qui décide » introuvable");

await aller("/qui-decide#blandy-91");
ok((await page.title()) === "Qui décide à Blandy - Repère" && chemin() === "/qui-decide#blandy-91", "un homonyme se distingue par son département");
await aller("/finances#blandy");
ok(chemin() === "/finances", "un nom ambigu ne choisit rien et le « # » est retiré");
await aller("/finances#nimportequoi");
ok(chemin() === "/finances" && (await page.title()) === "Finances - Repère", "un nom inconnu ne choisit rien");
ok(!erreurs.length, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `adresse : ${echecs} échec(s)` : "adresse : zéro échec");
process.exit(echecs ? 1 : 0);
