import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";
const base = process.argv[2], sortie = process.argv[3];
const n = await chromium.launch();
const c = await n.newContext({ viewport: { width: 390, height: 844 }, colorScheme: process.argv[4] || "light", deviceScaleFactor: 2 });
const p = await c.newPage();
const d = sortie; mkdirSync(d, { recursive: true });
const cap = async nom => { await p.waitForTimeout(1500); await p.screenshot({ path: path.join(d, nom + ".png"), fullPage: true }); console.log("  ->", nom); };
const clic = async t => { try { await p.getByText(t, { exact: false }).first().click({ timeout: 3500 }); return true; } catch { console.log("  (rate)", t); return false; } };
await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(800);
if (await clic("Vous avez moins de 18 ans")) await cap("avant-18");
await p.goBack(); await p.waitForTimeout(1000);
await p.getByLabel(/Où habitez-vous/).fill("meaux"); await p.waitForTimeout(700);
await p.getByText("Meaux", { exact: false }).first().click(); await p.waitForTimeout(2000);
if (await clic("Comprendre ce vote")) await cap("vote");
if (await clic("Scrutins publics")) await cap("scrutins");
await p.goBack(); await p.waitForTimeout(1000); await p.goBack(); await p.waitForTimeout(1200);
if (await clic("Chez vous")) await cap("chez-vous-onglet");
if (await clic("Voir la chaîne complète")) { await cap("qui-decide"); if (await clic("Jean-François")) await cap("elu"); }
await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
await p.getByLabel(/Où habitez-vous/).fill("meaux"); await p.waitForTimeout(700);
await p.getByText("Meaux", { exact: false }).first().click(); await p.waitForTimeout(2000);
if (await clic("Calendrier")) { await cap("calendrier"); if (await clic("Dictionnaire citoyen")) await cap("dictionnaire"); }
await p.goBack(); await p.waitForTimeout(1200);
if (await clic("Comment une loi devient loi")) await cap("procedure");
await n.close();
