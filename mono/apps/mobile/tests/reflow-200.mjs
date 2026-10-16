/* MESURE DU TEXTE AGRANDI (15/10/2026) — a lancer sur une export web servie.
 *
 * Usage : node tests/reflow-200.mjs http://127.0.0.1:PORT 320 2
 *   largeur : largeur de l ecran en px (320 = repere WCAG de reflow)
 *   facteur : multiplie la taille de chaque texte (2 = « 200 % »)
 * Mesure : debordement horizontal, textes coupes (overflow cache ou numberOfLines).
 * Ne mesure PAS : l agrandissement natif iOS/Android (Dynamic Type, police systeme).
 * Aucun plafond : chaque texte, libelles de la barre basse compris, est multiplie par
 * le facteur (consigne du 15/10/2026 : pas de plafond artificiel). Ecrit en Playwright (Chromium). */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const [base, largeur = "320", facteur = "2"] = process.argv.slice(2);
const F = Number(facteur);
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: Number(largeur), height: 740 }, isMobile: true, hasTouch: true, reducedMotion: "reduce", deviceScaleFactor: 1 });
const p = await c.newPage();
const agrandir = () => p.evaluate(F => {
  const ONGLETS = ["Aujourd'hui","Chez vous","Calendrier"];
  const els = [...document.querySelectorAll("body *")].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()));
  const tailles = els.map(e => { const cs = getComputedStyle(e); return [e, parseFloat(cs.fontSize), parseFloat(cs.lineHeight)]; });
  for (const [e, f, lh] of tailles) { e.style.setProperty("font-size", (f * F) + "px", "important"); if (lh > 0) e.style.setProperty("line-height", (lh * F) + "px", "important"); }
  return els.length;
}, F);
const mesurer = async nom => {
  const r = await p.evaluate(() => {
    const d = document.documentElement;
    const debord = d.scrollWidth - window.innerWidth;
    const coupes = [];
    for (const e of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(e);
      if (!e.offsetParent && cs.position !== "fixed") continue;
      if (!e.textContent || !e.textContent.trim()) continue;
      if (e.children.length === 0 && e.scrollWidth > e.clientWidth + 2 && cs.overflowX === "hidden") coupes.push("largeur:" + e.textContent.trim().slice(0, 50));
      if (e.scrollHeight > e.clientHeight + 2 && (cs.overflow === "hidden" || cs.webkitLineClamp !== "none") && e.clientHeight > 0) coupes.push("hauteur:" + e.textContent.trim().slice(0, 60));
    }
    return { debord, coupes: [...new Set(coupes)].slice(0, 12) };
  });
  console.log(nom, JSON.stringify({ debordementHorizontal: r.debord, texteCoupe: r.coupes }));
};
await p.goto(base, { waitUntil: "networkidle" });
await p.getByLabel(/Où habitez-vous/).fill("Meaux"); await p.waitForTimeout(400);
await p.screenshot({ path: `${process.env.S_OUT}/accueil-${largeur}.png` }).catch(() => {});
await mesurer("accueil(avant)");
await p.getByRole("button", { name: /^Meaux,/ }).first().click();
await p.getByText(/Où va cet argent/).first().waitFor({ timeout: 20000 }); await p.waitForLoadState("networkidle");
const n0 = await agrandir(); await p.waitForTimeout(300);
await mesurer(`accueil-liste(${F}x,${n0} textes)`);
await p.screenshot({ path: `${process.env.S_OUT}/aujourdhui-${largeur}-${F}x.png`, fullPage: true });
await mesurer("Aujourd'hui");
const etapes = [
  /* 16/10/2026 : « Qui décide » s'ouvre par le bloc sombre, « Le calendrier » par la carte de la semaine. */
  ["Qui décide", () => p.getByRole("button", { name: /^Voir la chaîne complète/ }).first().click()],
  ["Où va cet argent", () => p.getByRole("button", { name: /Où va cet argent/ }).first().click()],
  ["Calendrier", () => p.getByRole("button", { name: "Le calendrier", exact: true }).first().click()],
  ["Sources", () => p.getByRole("button", { name: "Sources", exact: true }).first().click()], ["Comprendre ce vote", () => p.getByRole("button", { name: /Comprendre ce vote/ }).first().click()],
];
for (const [nom, clic] of etapes) {
  await p.goto(base, { waitUntil: "networkidle" }).catch(() => {});
  await p.getByLabel(/Où habitez-vous/).fill("Meaux"); await p.waitForTimeout(300);
  await p.getByRole("button", { name: /^Meaux,/ }).first().click();
  await p.getByText(/Où va cet argent/).first().waitFor({ timeout: 20000 }); await p.waitForLoadState("networkidle");
  await clic().catch(e => console.log("clic KO", nom, e.message.split("\n")[0]));
  await p.waitForTimeout(900);
  await agrandir(); await p.waitForTimeout(300);
  await mesurer(nom + " (" + F + "x)");
}
await b.close();
