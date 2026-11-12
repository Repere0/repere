// La recherche d'une commune à l'accueil : abréviation (« st denis »), faute de frappe (« melum » ->
// « Vouliez-vous dire… »), code postal (dit honnêtement qu'il n'est pas encore disponible tant que le fichier
// n'est pas publié). Usage : node apps/mobile/tests/recherche-tolerante-web.mjs http://localhost:8811
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const erreurs = []; page.on("pageerror", e => erreurs.push(String(e)));
await page.goto(BASE, { waitUntil: "networkidle" }); await page.waitForTimeout(1200);
await page.getByRole("button", { name: /Chercher une commune/ }).first().click().catch(() => {});
const champ = page.getByPlaceholder(/Tapez votre ville/);
const taper = async t => { await champ.fill(t); await page.waitForTimeout(900); return (await page.locator("body").innerText()).replace(/\s+/g, " "); };

let t = await taper("st denis");
ok(/Saint-Denis/.test(t), "« st denis » trouve Saint-Denis");
t = await taper("melum");
ok(/Vouliez-vous dire/.test(t) && /Melun/.test(t), "« melum » propose Melun");
ok(!/Aucune commune d'Île-de-France ne correspond/.test(t), "pas de « aucune commune » quand une suggestion existe");
await page.getByRole("button", { name: /^Melun$/ }).first().click(); await page.waitForTimeout(900);
ok((await champ.inputValue()) === "Melun", "toucher la suggestion la met dans le champ, sans choisir la commune à la place du lecteur");
t = await taper("xqzvw");
ok(/Aucune commune d'Île-de-France ne correspond/.test(t) && !/Vouliez-vous dire/.test(t), "un texte sans rapport ne propose rien");
t = await taper("77000");
ok(/code postal/.test(t) && !/ne correspond/.test(t), "un code postal sans fichier le dit, sans prétendre qu'aucune commune n'existe");
ok(!erreurs.length, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `recherche tolérante : ${echecs} échec(s)` : "recherche tolérante : zéro échec");
process.exit(echecs ? 1 : 0);
