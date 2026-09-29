/* LE PARCOURS TESTEUR DE DECEMBRE, JOUE POUR DE VRAI (29/09/2026).
 *
 * Deux minutes, neuf etapes, de vraies donnees, aucun contenu fictif. Ce script
 * joue le parcours qu'un testeur fera en decembre, dans un vrai navigateur, sur
 * une commune choisie DANS LA DONNEE PUBLIEE (elle a un projet finance, un
 * depute nommable et un vote publie) — jamais ecrite a la main. Il dit pour
 * chaque etape si elle aboutit, ce que le testeur voit, et combien de gestes
 * (clics, saisies) il lui a fallu. Il garde une capture par etape.
 *
 *   1. choisir une commune            6. comprendre au moins un vote
 *   2. comprendre son territoire      7. voir ce qui arrive prochainement
 *   3. voir ce qui se passe           8. trouver la source
 *   4. voir un projet concret         9. revenir sur l'accueil et comprendre
 *   5. comprendre le role du depute      immediatement ou il est
 *
 * Usage : node scripts/serveur-statique.mjs apps/web/dist 4174 &
 *         node scripts/parcours-decembre.mjs [url] [dossier-captures]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const base = process.argv[2] || "http://127.0.0.1:4174/";
const CAPT = process.argv[3] || null;
const DATA = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../apps/web/dist/data");
const lire = f => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));

/* La commune du parcours : Seine-Saint-Denis, un projet finance, une seule
   circonscription (pour que « votre depute » soit vrai), un nom sans homonyme. */
const pr = lire("projets/93.json").communes, pq = lire("departments/93.json").communes;
const [insee, fiche] = Object.entries(pq).find(([c, f]) => pr[c] && typeof f.circo === "number" && f.maire) || [];
if (!insee) { console.log("ECHEC : aucune commune du 93 ne reunit projet, circonscription unique et maire"); process.exit(1); }

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const p = await ctx.newPage();
let gestes = 0;
const etapes = [];
const texte = () => p.evaluate(() => document.body.innerText);
async function etape(n, titre, fn) {
  let ok = false, vu = "";
  try { [ok, vu] = await fn(); } catch (e) { vu = "exception : " + e.message.split("\n")[0]; }
  if (CAPT) await p.screenshot({ path: path.join(CAPT, `parcours-${n}.png`) });
  etapes.push({ n, titre, ok, gestes, vu: String(vu).replace(/\s+/g, " ").slice(0, 160) });
}

await p.goto(base, { waitUntil: "networkidle" }); await p.waitForTimeout(500);

await etape(1, "choisir une commune", async () => {
  await p.getByLabel(/Où habitez-vous/).fill(fiche.nom); gestes++;
  await p.waitForTimeout(400);
  await p.getByRole("button", { name: new RegExp("^" + fiche.nom) }).first().click(); gestes++;
  await p.waitForTimeout(1500);
  const t = await texte();
  return [t.includes(fiche.nom), fiche.nom];
});
await etape(2, "comprendre son territoire", async () => {
  const t = await texte();
  return [/Maire/.test(t) && t.includes(fiche.maire.nom) && /Ce que décide votre commune/.test(t), fiche.maire.nom];
});
await etape(3, "voir ce qui se passe", async () => {
  await p.getByRole("button", { name: /Voir aujourd.hui/ }).click(); gestes++;
  await p.waitForTimeout(1500);
  const t = await texte();
  return [/Que s'est-il décidé près de chez vous/.test(t), t.split("Que s'est-il décidé près de chez vous ?")[1] || ""];
});
await etape(4, "voir un projet concret", async () => {
  const t = await texte();
  const m = t.match(/L'État a engagé [\d\s  ]+ €[^\n]*/);
  return [!!m, m ? m[0] : "aucun montant a l'ecran"];
});
await etape(5, "comprendre le role du depute", async () => {
  const t = await texte();
  const m = t.match(/Vote du député élu dans votre circonscription[^\n]*/);
  return [!!m, m ? m[0] : "aucune phrase sur le depute"];
});
await etape(6, "comprendre au moins un vote", async () => {
  const t = await texte();
  const m = t.match(/a voté [^\n]*[\s\S]{0,120}?\d+ pour, \d+ contre[^\n]*/i);
  const lien = await p.locator("a", { hasText: /Scrutin n°/ }).count();
  return [!!m && lien > 0, (m ? m[0] : "aucun vote") + (lien ? " + lien vers le scrutin" : " (sans lien)")];
});
await etape(7, "voir ce qui arrive prochainement", async () => {
  const t = await texte();
  const m = t.match(/Qu'est-ce qui arrive[^\n]*[\s\S]{0,400}?((lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) \d[^\n]*)/);
  return [!!m, m ? m[1] : "aucun rendez-vous a venir"];
});
await etape(8, "trouver la source", async () => {
  const sources = await p.locator(".source").count();
  const liens = await p.locator(".source a[href^='http']").count();
  return [sources > 0, `${sources} lignes de source, ${liens} liens vers la source`];
});
await etape(9, "revenir sur l'accueil et comprendre ou il est", async () => {
  await p.goto(base, { waitUntil: "networkidle" }); gestes++;
  await p.waitForTimeout(1500);
  const t = await texte();
  const situe = await p.evaluate(() => (document.querySelector(".situe") || {}).innerText || "");
  const commune = situe.includes(fiche.nom);
  return [commune, commune ? "la commune est nommee au retour" :
    "au retour, seule le departement est rappele : la commune doit etre choisie a nouveau (" + (t.match(/Département[^\n]*/) || [""])[0] + ")"];
});
await nav.close();

const reussies = etapes.filter(e => e.ok).length;
console.log(`\nParcours decembre — ${fiche.nom} (${insee}), 390 x 844 — ${reussies}/9 etapes, ${gestes} gestes\n`);
for (const e of etapes) console.log(`${e.ok ? " ok  " : "ECHEC"} ${e.n}. ${e.titre.padEnd(46)} ${e.vu}`);
process.exit(reussies === 9 ? 0 : 1);
