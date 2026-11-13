// PWA en vrai : le service worker s'installe, puis l'interface s'ouvre SANS réseau (serveur coupé),
// et /data/ n'est jamais rangé dans le cache du service worker.
// Usage : node tests/pwa-web.mjs http://localhost:8812   (dossier dist traité par scripts/pwa.mjs)
import { createRequire } from "node:module";
import { passerBienvenue } from "./_premier-lancement.mjs";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8812";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
let coupe = false;
const erreurs = []; page.on("pageerror", e => { const m = String(e); if (!(coupe && /NetworkError|Failed to fetch|Load failed/.test(m))) erreurs.push(m); }); // une requete en vol coupee par la coupure simulee n'est pas un defaut
// Les hebergeurs (Vercel) n'envoient jamais un dossier node_modules : polices et icones y repondaient 404.
const assets = []; page.on("response", r => { if (r.url().includes("/assets/")) assets.push({ u: r.url(), s: r.status() }); });
await page.goto(BASE, { waitUntil: "networkidle" });
await passerBienvenue(page);
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForTimeout(1500);
const etat = await page.evaluate(async () => {
  const noms = await caches.keys();
  const coq = noms.find(n => n.startsWith("repere-coquille-"));
  const cles = coq ? (await (await caches.open(coq)).keys()).map(r => new URL(r.url).pathname) : [];
  return { actif: !!(await navigator.serviceWorker.getRegistration())?.active, noms, cles };
});
const polices = await page.evaluate(() => [...document.fonts].filter(f => f.status === "loaded").map(f => f.family.replace(/["']/g, "")));
ok(!assets.some(a => a.u.includes("node_modules")), "aucune adresse ne passe par node_modules");
ok(assets.length > 0 && assets.every(a => a.s < 400), `polices et icônes : toutes les réponses sont valides (${assets.length})`);
ok(["Manrope_800ExtraBold", "DMSans_400Regular"].every(f => polices.includes(f)), "Manrope et DM Sans sont chargées : " + polices.join(", "));
ok(polices.some(f => /ionicons/i.test(f)), "la police d'icônes Ionicons est chargée");
ok(etat.actif, "le service worker est actif");
ok(etat.cles.includes("/index.html") && etat.cles.some(c => c.startsWith("/_expo/static/js/")), `la coquille est en cache (${etat.cles.length} fichiers)`);
ok(!etat.cles.some(c => c.startsWith("/data/")), "aucune donnée dans le cache du service worker");
ok(await page.evaluate(() => document.querySelector('link[rel="manifest"]') && document.querySelector('meta[name="apple-mobile-web-app-capable"]') ? true : false), "manifeste et balise iOS présents");

coupe = true;
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
