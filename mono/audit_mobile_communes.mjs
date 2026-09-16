/* Audit mobile reel, six communes, demande dans la reprise du 16/09/2026.
 * Ouvre l'application construite (dist), viewport 390x844 (iPhone 12/13/14),
 * une commune a la fois, capture "Qui decide" et "Ou va l'argent", note les
 * erreurs console et les dimensions mesurees des elements cles.
 *
 * Usage : node audit_mobile_communes.mjs apps/web/dist
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { chromium } from "playwright";

const DIST = path.resolve(process.argv[2] || "apps/web/dist");
const OUT = path.resolve("../Claude outputs/audit_mobile_16_09_2026");
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json" };
const serveur = http.createServer((req, rep) => {
  const p0 = decodeURIComponent(req.url.split("?")[0]);
  const f = path.join(DIST, p0 === "/" ? "index.html" : p0);
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    rep.writeHead(404, { "content-type": "application/json" });
    return rep.end('{"erreur":"introuvable"}');
  }
  const corps = fs.readFileSync(f);
  rep.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream",
    "content-length": corps.length });
  rep.end(corps);
});
await new Promise(r => serveur.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + serveur.address().port + "/";

const nav = await chromium.launch();

const cibles = [
  { id: "petite", dep: "77", depMatch: /^77\b/, commune: "La Tombe" },
  { id: "moyenne", dep: "77", depMatch: /^77\b/, commune: "Fontainebleau" },
  { id: "grande", dep: "92", depMatch: /^92\b/, commune: "Boulogne-Billancourt" },
  { id: "paris", dep: "75", depMatch: /^75\b/, commune: "Paris" },
  { id: "epci_complexe", dep: "94", depMatch: /^94\b/, commune: "Créteil" },
  { id: "absente", dep: "92", depMatch: /^92\b/, commune: "Ville-d'Avray" },
];

const rapport = [];

for (const cible of cibles) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on("pageerror", e => erreurs.push("pageerror: " + e.message));
  page.on("console", m => { if (m.type() === "error") erreurs.push("console: " + m.text().slice(0, 200)); });

  const entree = { id: cible.id, commune: cible.commune, dep: cible.dep, erreurs: [], notes: [] };
  try {
    await page.goto(base, { waitUntil: "networkidle", timeout: 20000 });
    await page.getByLabel(/Où habitez-vous/).fill(cible.dep);
    await page.getByRole("button", { name: cible.depMatch }).first().click();
    await page.getByLabel(/Votre commune/).fill(cible.commune);
    await page.waitForTimeout(300);
    const bouton = page.getByRole("button", { name: cible.commune, exact: false }).first();
    const trouve = await bouton.count();
    entree.trouve_dans_recherche = trouve > 0;
    if (trouve > 0) {
      await bouton.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(OUT, cible.id + "_qui-decide.png") });

      // hauteur de la page, position du nom de maire / du titre
      const hauteurPage = await page.evaluate(() => document.body.scrollHeight);
      entree.notes.push("hauteur de l'ecran Qui decide : " + hauteurPage + " px");

      const argentBtn = page.getByRole("button", { name: "Où va l'argent" });
      if (await argentBtn.count() > 0) {
        await argentBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(OUT, cible.id + "_argent.png") });
      } else {
        entree.notes.push("bouton 'Où va l'argent' absent");
      }

      const sourcesBtn = page.getByRole("button", { name: "Sources" });
      if (await sourcesBtn.count() > 0) {
        await sourcesBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(OUT, cible.id + "_sources.png") });
      }
    } else {
      await page.screenshot({ path: path.join(OUT, cible.id + "_recherche-vide.png") });
      const texteVide = await page.locator("body").innerText();
      entree.notes.push("recherche sans resultat, extrait: " + texteVide.slice(0, 300).replace(/\n+/g, " | "));
    }
  } catch (e) {
    entree.notes.push("EXCEPTION: " + e.message.slice(0, 300));
    try { await page.screenshot({ path: path.join(OUT, cible.id + "_exception.png") }); } catch {}
  }
  entree.erreurs = erreurs;
  rapport.push(entree);
  await ctx.close();
}

await nav.close();
serveur.close();

fs.writeFileSync(path.join(OUT, "rapport.json"), JSON.stringify(rapport, null, 2));
console.log(JSON.stringify(rapport, null, 2));
