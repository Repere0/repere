/* LE BANC VISUEL — 21/10/2026.
 *
 * Il photographie les ecrans de l'application mobile, toujours dans les MEMES
 * conditions, pour qu'un avant et un apres soient comparables. Il ne juge rien :
 * il prouve. Les mesures de conformite (cibles tactiles, contraste, debordement)
 * restent dans tests/parcours-web.mjs ; ici on ne fait que des images.
 *
 * CE QUE CE BANC N'EST PAS : une validation iOS. Il rend le code React Native
 * par react-native-web dans Chromium. Les polices, les ombres et le defilement
 * natifs peuvent differer. Il sert a voir un ecart de maquette et a prouver un
 * changement, pas a declarer qu'un ecran est bon sur iPhone.
 *
 * Usage :
 *   EXPO_PUBLIC_REPERE_DONNEES=/data npx expo export --platform web --output-dir dist-web
 *   cp -r ../../data dist-web/data
 *   node ../../scripts/serveur-statique.mjs dist-web 8811 &
 *   node tests/captures.mjs http://localhost:8811 ../../../docs/captures/2026-10-21-avant
 *
 * L'attente de 2 500 ms apres l'arrivee sur un ecran n'est pas decorative : les
 * barres de preuve sont animees (useApparition), et une capture prise trop tot
 * les montre VIDES. On l'a cru un bug ; c'etait la capture qui etait en avance.
 */
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

let chromium;
for (const racine of ["../package.json", "../../../package.json"]) {
  try { ({ chromium } = createRequire(path.resolve(import.meta.dirname, racine))("playwright")); break; } catch { /* suivant */ }
}
if (!chromium) { console.error("playwright introuvable"); process.exit(2); }

const BASE = process.argv[2] || "http://localhost:8811";
const SORTIE = path.resolve(process.argv[3] || "captures");
fs.mkdirSync(SORTIE, { recursive: true });

const COMMUNE = { saisie: "meaux", nom: "Meaux" };
const LARGEUR = 390, HAUTEUR = 844;   /* iPhone 14/15, la cible du porteur */
const REPOS = 2500;                   /* les barres animees ont fini */

/* Les onglets de la barre basse, par leur nom accessible. */
const ONGLETS = ["Aujourd'hui", "Chez vous", "Calendrier", "Qui décide"];

async function ecran(page, nom, theme) {
  await page.waitForTimeout(REPOS);
  const fichier = path.join(SORTIE, `${nom}-${theme}.png`);
  await page.screenshot({ path: fichier });
  console.log("capture  " + path.relative(process.cwd(), fichier));
}

const navigateur = await chromium.launch();
for (const theme of ["light", "dark"]) {
  const ctx = await navigateur.newContext({
    viewport: { width: LARGEUR, height: HAUTEUR }, deviceScaleFactor: 2,
    isMobile: true, hasTouch: true, colorScheme: theme,
  });
  const page = await ctx.newPage();

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await ecran(page, "01-accueil-vide", theme);

  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  const resultat = page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first();
  await resultat.waitFor({ timeout: 15000 });
  await ecran(page, "02-accueil-recherche", theme);
  await resultat.click();

  await page.getByText("Aller plus loin").first().waitFor({ timeout: 20000 });
  await page.waitForLoadState("networkidle");
  await ecran(page, "03-aujourdhui", theme);

  /* le bas de « Aujourd'hui » : ce que la premiere capture ne montre pas */
  await page.evaluate(() => {
    const el = [...document.querySelectorAll("div")]
      .filter(e => e.scrollHeight > e.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))
      .sort((x, y) => y.scrollHeight - x.scrollHeight)[0];
    if (el) el.scrollTop = el.scrollHeight;
  });
  await ecran(page, "04-aujourdhui-bas", theme);

  /* Les trois autres onglets. Le nom vient de `tabBarAccessibilityLabel`
     (src/app/(onglets)/_layout.tsx) : on le cherche donc par l'etiquette
     accessible, et non par un role devine — react-native-web ne donne pas le
     meme role a tous les onglets, et chercher « button » en ratait deux. */
  for (let i = 1; i < ONGLETS.length; i++) {
    let onglet = page.getByLabel(ONGLETS[i], { exact: true }).last();
    if (!(await onglet.count())) onglet = page.getByText(ONGLETS[i], { exact: true }).last();
    if (!(await onglet.count())) { console.log("ABSENT   onglet « " + ONGLETS[i] + " » — capture manquante"); continue; }
    await onglet.click();
    await ecran(page, `0${4 + i}-${ONGLETS[i].toLowerCase().replace(/[^a-z]+/g, "-")}`, theme);
  }

  await ctx.close();
}
await navigateur.close();
console.log("banc visuel : " + fs.readdirSync(SORTIE).filter(f => f.endsWith(".png")).length + " capture(s) dans " + SORTIE);
