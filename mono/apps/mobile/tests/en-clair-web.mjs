// « Copier le lien » et le bloc « En clair » (12/11/2026). Usage : node apps/mobile/tests/en-clair-web.mjs http://localhost:8811
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await ctx.newPage();
/* 14/11/2026 : sans prénom, la barrière couvre l'application. */
await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ prenom: "Test" })));
const erreurs = []; page.on("pageerror", e => erreurs.push(String(e)));

await page.goto(BASE + "/actus#melun", { waitUntil: "networkidle" });
await page.waitForTimeout(1800);
await page.getByRole("button", { name: "Copier le lien de cette page" }).first().click();
await page.getByText("Lien copié").first().waitFor({ timeout: 5000 });
const presse = await page.evaluate(() => navigator.clipboard.readText());
ok(presse === BASE + "/actus#melun", `le lien copié porte la commune après le « # » (${presse})`);

await page.goto(BASE + "/faq", { waitUntil: "networkidle" });
/* 13/11/2026 : la FAQ est en accordéons ; la réponse s'ouvre d'un geste. */
await page.getByRole("button", { name: /Comment seront écrits les résumés/ }).click();
await page.getByText("En clair", { exact: true }).first().waitFor({ timeout: 10000 });
const t = await page.locator("body").innerText();
ok(/503 députés ont voté pour, aucun contre, et 67 se sont abstenus/.test(t), "le résumé d'exemple s'affiche");
ok(t.includes("Résumé généré avec l'aide de l'IA à partir des données officielles de l'Assemblée nationale."), "la mention d'assistance IA est écrite en toutes lettres");
ok(await page.getByRole("link", { name: /Lire le texte officiel/ }).count() === 1, "le lien vers la source est là");
const debut = t.search(/Ce texte est la première partie/);
const bloc = debut < 0 ? "" : t.slice(debut, t.indexOf("Lire le texte officiel", debut));
ok(bloc.length > 20 && !/Sénat|large majorité/.test(bloc), "rien qui ne soit dans la source (ni étape à venir, ni jugement)");
/* 12/11/2026 (roadmap bêta) : l'écran du vote lit le fichier publié des résumés validés. Sans fichier : « Pas encore
   de résumé ». Avec un résumé pour CE scrutin (donnée d'essai, servie à la place du fichier absent) : il s'affiche. */
await page.goto(BASE + "/vote#melun", { waitUntil: "networkidle" }); await page.waitForTimeout(2500);
let tv = (await page.locator("body").innerText()).replace(/\s+/g, " ");
ok(/Pas encore de résumé pour ce texte/.test(tv), "sans fichier de résumés : « Pas encore de résumé pour ce texte »");
{
  /* L'écran n'écrit pas le numéro du scrutin : la donnée d'essai couvre tous ceux du catalogue publié. */
  const numeros = [...new Set([...(await (await fetch(BASE + "/data/scrutins.json")).text()).matchAll(/"n":\s*"?(\d+)/g)].map(m => m[1]))];
  ok(numeros.length > 0, `le catalogue des scrutins est lisible (${numeros.length} numéros)`);
  const essai = "DONNÉE D'ESSAI : ce texte crée une aide pour les communes.";
  const fiche = valide => ({ resume: valide ? essai : "BROUILLON À NE JAMAIS VOIR", valide, source: { producteur: "Assemblée nationale", url: "https://www.assemblee-nationale.fr/dyn/17/dossiers/essai", releve_le: "2026-11-12" } });
  await page.route("**/data/resumes-clairs.json", r => r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ v: 1, genere_le: "2026-11-12", resumes: Object.fromEntries(numeros.map(n => ["scrutin:" + n, fiche(true)])) }) }));
  await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  tv = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  ok(tv.includes(essai) && tv.includes("Résumé généré avec l'aide de l'IA"), "avec un résumé validé pour ce scrutin : il s'affiche, avec la mention IA");
  ok(!/Pas encore de résumé pour ce texte/.test(tv), "et la phrase d'absence a disparu");
  /* Un fichier qui ne porterait qu'un brouillon (valide: false) n'affiche rien : la garde est dans l'application aussi. */
  await page.unroute("**/data/resumes-clairs.json");
  await page.route("**/data/resumes-clairs.json", r => r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ v: 1, genere_le: "2026-11-12", resumes: Object.fromEntries(numeros.map(n => ["scrutin:" + n, fiche(false)])) }) }));
  await page.evaluate(() => { try { indexedDB.databases && indexedDB.databases().then(l => l.forEach(d => indexedDB.deleteDatabase(d.name))); } catch {} });
  await page.reload({ waitUntil: "networkidle" }); await page.waitForTimeout(2500);
  tv = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  ok(!tv.includes("BROUILLON") , "un brouillon (valide: false) ne s'affiche jamais, même s'il arrivait dans le fichier");
}
ok(!erreurs.length, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `en clair : ${echecs} échec(s)` : "en clair : zéro échec");
process.exit(echecs ? 1 : 0);
