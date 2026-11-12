// Version web : sombre par défaut malgré un iPhone en clair, bascule clair/sombre dans l'en-tête,
// barre de recherche dont le focus entoure toute la barre, recherche de Melun qui aboutit.
// Usage : node apps/mobile/tests/fix-web-web.mjs http://localhost:8811 [dossier-captures]
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };
const rgb = s => (s.match(/\d+/g) || []).slice(0, 3).join(",");

const nav = await chromium.launch();
// iPhone réglé en CLAIR : l'app doit quand même s'ouvrir en sombre.
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light" });
const page = await ctx.newPage();
const erreurs = []; page.on("pageerror", e => erreurs.push(String(e)));
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const fond = async () => rgb(await page.evaluate(() => { let e = document.elementFromPoint(4, 420); while (e) { const c = getComputedStyle(e).backgroundColor; if (c && c !== "rgba(0, 0, 0, 0)") return c; e = e.parentElement; } return "0,0,0"; }));
ok((await fond()) === "20,19,17", `sombre par défaut malgré un système en clair (fond ${await fond()})`);
const bascule = page.getByRole("button", { name: "Passer en mode clair" });
ok(await bascule.count() === 1, "la bascule « Passer en mode clair » est dans l'en-tête");
if (CAP) await page.screenshot({ path: CAP + "/web-sombre.png" });
await bascule.click(); await page.waitForTimeout(600);
ok((await fond()) !== "20,19,17", "la bascule passe en clair");
ok(await page.getByRole("button", { name: "Passer en mode sombre" }).count() === 1, "le bouton propose alors le mode sombre");
await page.getByRole("button", { name: "Passer en mode sombre" }).click(); await page.waitForTimeout(600);
ok((await fond()) === "20,19,17", "et revient en sombre");

const champ = page.getByPlaceholder(/Tapez votre ville/);
await champ.click(); await page.waitForTimeout(300);
const r = await champ.evaluate(el => { const p = el.parentElement; return { style: getComputedStyle(el).outlineStyle, bordure: getComputedStyle(p).borderTopColor, repos: null }; });
await page.evaluate(() => document.activeElement.blur()); await page.waitForTimeout(300);
const repos = await champ.evaluate(el => getComputedStyle(el.parentElement).borderTopColor);
ok(r.style === "none", `le trait de focus interne a disparu (outline-style ${r.style})`);
ok(rgb(r.bordure) !== rgb(repos), `au focus, la barre entière change de bordure (${r.bordure} contre ${repos})`);
if (CAP) { await champ.click(); await page.screenshot({ path: CAP + "/web-recherche-focus.png" }); }

await champ.fill("Melun"); await page.waitForTimeout(1500);
const texte = await page.locator("body").innerText();
ok(/Melun/.test(texte) && !/pas avec les données attendues|pas réussi à joindre/.test(texte), "la recherche de Melun aboutit, sans message d'erreur du serveur");
ok(!erreurs.length, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `web : ${echecs} échec(s)` : "web : zéro échec");
process.exit(echecs ? 1 : 0);
