// PWA en vrai : le service worker s'installe, puis l'interface s'ouvre SANS réseau (serveur coupé),
// et /data/ n'est jamais rangé dans le cache du service worker.
// Usage : node tests/pwa-web.mjs http://localhost:8812   (dossier dist traité par scripts/pwa.mjs)
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8812";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const erreurs = []; page.on("pageerror", e => erreurs.push(String(e)));
await page.goto(BASE, { waitUntil: "networkidle" });
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForTimeout(1500);
const etat = await page.evaluate(async () => {
  const noms = await caches.keys();
  const coq = noms.find(n => n.startsWith("repere-coquille-"));
  const cles = coq ? (await (await caches.open(coq)).keys()).map(r => new URL(r.url).pathname) : [];
  return { actif: !!(await navigator.serviceWorker.getRegistration())?.active, noms, cles };
});
ok(etat.actif, "le service worker est actif");
ok(etat.cles.includes("/index.html") && etat.cles.some(c => c.startsWith("/_expo/static/js/")), `la coquille est en cache (${etat.cles.length} fichiers)`);
ok(!etat.cles.some(c => c.startsWith("/data/")), "aucune donnée dans le cache du service worker");
ok(await page.evaluate(() => document.querySelector('link[rel="manifest"]') && document.querySelector('meta[name="apple-mobile-web-app-capable"]') ? true : false), "manifeste et balise iOS présents");

await ctx.setOffline(true);
await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(3000);
const texte = (await page.locator("body").innerText()).trim();
ok(texte.length > 40, `hors ligne : l'interface s'affiche (${texte.length} caractères)`);
await page.goto(BASE + "/recherche", { waitUntil: "domcontentloaded" }).catch(() => {});
await page.waitForTimeout(2500);
ok((await page.locator("body").innerText()).trim().length > 40, "hors ligne : une adresse interne s'ouvre aussi");
ok(!erreurs.length, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `pwa : ${echecs} échec(s)` : "pwa : zéro échec");
process.exit(echecs ? 1 : 0);
