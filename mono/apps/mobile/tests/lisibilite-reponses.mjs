/* MESURE DE LISIBILITE DES REPONSES — 20/10/2026 (demande du porteur : « chaque
 * information recrachee et comprehensible en moins de 5 secondes »).
 *
 * CE QUE CE CONTROLE MESURE, ET CE QU'IL NE MESURE PAS.
 *   - Mesure : pour chaque ecran atteint comme un lecteur (onglets, argent, une
 *     fiche d'element), les phrases de REPONSE (taille de TYPO.reponse, 22 px) et
 *     leur nombre de mots. Une lecture courante fait environ 4 a 5 mots par
 *     seconde : une reponse de 20 mots ou moins se lit en 5 secondes.
 *   - Ne mesure PAS la comprehension. Seul un testeur la mesure.
 *
 * Echec si une reponse depasse LIMITE mots. Le garde se prouve en baissant LIMITE
 * (REPERE_LIMITE_MOTS=3) : il doit alors echouer.
 *
 * Usage : node tests/lisibilite-reponses.mjs http://localhost:8811 */
import { createRequire } from "node:module";
import path from "node:path";

let chromium;
for (const racine of ["../package.json", "../../../package.json"]) {
  try { ({ chromium } = createRequire(path.resolve(import.meta.dirname, racine))("playwright")); break; } catch { /* suivant */ }
}
if (!chromium) { console.error("playwright introuvable"); process.exit(2); }

const BASE = process.argv[2] || "http://localhost:8811";
const LIMITE = Number(process.env.REPERE_LIMITE_MOTS || 20);
const TAILLE_REPONSE = 22;
const mots = s => s.split(/\s+/).filter(Boolean).length;

const navigateur = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const page = await (await navigateur.newContext({ viewport: { width: 390, height: 844 } })).newPage();

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.getByLabel(/Où habitez-vous/).fill("meaux");
await page.getByRole("button", { name: /^Meaux,/ }).first().click();
await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
await page.waitForTimeout(800);

async function reponses() {
  await page.waitForTimeout(500);
  return page.evaluate(TAILLE => {
    const out = [];
    for (const el of document.querySelectorAll("div, span, p")) {
      if (el.children.length) continue;
      if (parseFloat(getComputedStyle(el).fontSize) !== TAILLE) continue;
      const t = (el.textContent || "").trim();
      const r = el.getBoundingClientRect();
      if (t && r.width > 0 && r.height > 0) out.push(t);
    }
    return [...new Set(out)];
  }, TAILLE_REPONSE);
}

const lignes = [];
let echecs = 0;
async function mesurer(nom) {
  const textes = await reponses();
  const longues = textes.filter(t => mots(t) > LIMITE);
  echecs += longues.length;
  const max = textes.reduce((m, t) => Math.max(m, mots(t)), 0);
  lignes.push(`${nom} : ${textes.length} reponse(s), la plus longue ${max} mots` +
    (longues.length ? ` — TROP LONGUES : ${longues.map(t => `« ${t.slice(0, 70)}… » (${mots(t)})`).join(" ; ")}` : ""));
}

/* Les onglets, un par un : chacun est un ecran du lecteur. */
const onglets = await page.getByRole("tab").allInnerTexts();
const noms = [...new Set(onglets.map(t => t.trim()).filter(Boolean))];
for (const nom of noms) {
  await page.getByRole("tab", { name: nom, exact: true }).first().click().catch(() => {});
  await mesurer("onglet « " + nom + " »");
}

/* L'argent de la commune, puis retour. */
await page.getByRole("button", { name: "Où va cet argent ?" }).first().click().catch(() => {});
await mesurer("« Où va l'argent »");
await page.goBack();
await page.waitForTimeout(600);

/* Une fiche d'element (la premiere qui s'ouvre depuis « Qui décide »). */
const tab = page.getByRole("tab", { name: /Qui décide/ }).first();
await tab.click().catch(() => {});
const fiche = page.getByRole("button", { name: /^Voir la fiche de/ }).first();
if (await fiche.count()) { await fiche.click(); await mesurer("fiche d'un élu"); }
else lignes.push("fiche d'un élu : aucun nom ouvrable sur l'écran « Qui décide » (non mesuré)");

await navigateur.close();
for (const l of lignes) console.log(l);
if (echecs) { console.log(`\n${echecs} reponse(s) au-dela de ${LIMITE} mots`); process.exit(1); }
console.log(`\nToutes les reponses mesurees font ${LIMITE} mots ou moins.`);
