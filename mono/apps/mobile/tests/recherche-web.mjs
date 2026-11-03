// RECHERCHE GLOBALE, dans un navigateur (V37, bloc 3, 31/10/2026).
// Usage : node apps/mobile/tests/recherche-web.mjs http://localhost:8811   (depuis mono/)
// Vérifie : la loupe de l'accueil ouvre /recherche ; une saisie donne les trois sections ;
// l'état vide dit la phrase et propose « Voir toutes les communes » ; chaque résultat ouvre
// sa fiche (commune, élu, scrutin) ; aucune erreur JavaScript.
// Données : un député (Xavier Breton, 01-1) et le scrutin n° 8706 de data/ (copiés dans dist-web/data).
import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/");
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:8811").replace(/\/$/, "");
let echecs = 0;
const verifier = (ok, message) => {
  console.log((ok ? "ok    " : "ECHEC ") + message);
  if (!ok) echecs++;
};

const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await contexte.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push(e.message));
const texte = async () => page.locator("body").innerText();
/* Les listes se chargent à l'ouverture (communes, élus, scrutins) : on attend le texte attendu, pas un délai. */
const attendre = async (morceau, ms = 12000) => {
  const fin = Date.now() + ms;
  while (Date.now() < fin) {
    if ((await texte()).includes(morceau)) return true;
    await page.waitForTimeout(250);
  }
  return false;
};
const CHAMP = "Rechercher une commune, un élu ou un scrutin";

try {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  const loupe = page.getByRole("button", { name: "Ouvrir la recherche : communes, élus, scrutins" });
  verifier((await loupe.count()) > 0, "accueil : la loupe de recherche est présente");
  await loupe.first().click();
  await page.waitForTimeout(1200);
  verifier(page.url().includes("/recherche"), "loupe → écran /recherche");
  const champ = page.getByLabel(CHAMP);
  verifier((await champ.count()) === 1, "recherche : un seul champ de saisie");
  verifier((await texte()).includes("Tapez le nom d'une commune"), "recherche : aide affichée avant la saisie");

  await champ.fill("Melun");
  await attendre("Communes");
  let t = await texte();
  /* Les intitulés de section sont en capitales à l'écran : innerText les rend en majuscules, on compare en minuscules. */
  verifier(t.toLocaleLowerCase("fr").includes("communes") && t.includes("Melun"), "« Melun » → section Communes avec Melun");
  verifier(t.includes("Seine-et-Marne"), "« Melun » → le département (Seine-et-Marne) est écrit à côté");

  await champ.fill("zzqxw");
  await page.waitForTimeout(800);
  t = await texte();
  verifier(t.includes("Aucun résultat pour « zzqxw ».") && t.includes("Voir toutes les communes"), "état vide : phrase exacte + « Voir toutes les communes »");

  await champ.fill("Breton");
  await attendre("Xavier Breton");
  t = await texte();
  verifier(t.toLocaleLowerCase("fr").includes("élus") && t.includes("Xavier Breton"), "« Breton » → section Élus : Xavier Breton");
  await page.getByRole("button", { name: /^Xavier Breton, / }).first().click();
  await page.waitForTimeout(1500);
  verifier(page.url().includes("/annuaire-fiche"), "élu → fiche élu (annuaire-fiche)");
  verifier((await texte()).includes("Xavier Breton"), "fiche élu : le nom est affiché");

  await page.goto(BASE + "/recherche", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.getByLabel(CHAMP).fill("violences sexuelles");
  await attendre("8706");
  t = await texte();
  /* L'index des scrutins (scrutins-index.json) n'existe pas dans le jeu de données local : le même message
     que l'écran Scrutins. La section ne peut alors pas être vérifiée ici ; on le dit au lieu de passer. */
  if (t.includes("Le serveur a répondu, mais pas avec les données attendues.")) {
    console.log("note  scrutins : scrutins-index.json absent du jeu de données local, section non vérifiée ici");
  } else {
    verifier(t.toLocaleLowerCase("fr").includes("scrutins") && t.includes("8706"), "« violences sexuelles » → section Scrutins, n° 8706");
    await page.getByRole("button", { name: /Scrutin n°8706/ }).first().click();
    await page.waitForTimeout(1800);
    verifier(page.url().includes("/scrutins") && page.url().includes("n=8706"), "scrutin → écran Scrutins sur le n° 8706");
  }

  await page.goto(BASE + "/recherche", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.getByLabel(CHAMP).fill("Melun");
  await attendre("Communes");
  await page.getByRole("button", { name: /^Commune : Melun,/ }).first().click();
  await page.waitForTimeout(1500);
  verifier(!page.url().includes("/recherche"), "commune → quitte la recherche (profil absent : accueil de bienvenue)");

  await page.goto(BASE + "/recherche", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.getByLabel(CHAMP).fill("zzqxw");
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: "Voir toutes les communes" }).click();
  await page.waitForTimeout(1500);
  verifier(!page.url().includes("/recherche"), "« Voir toutes les communes » quitte la recherche");
  /* La liste est triée de A à Z et virtualisée : seul son début est dans le texte rendu. */
  verifier(await attendre("Abbéville-la-Rivière"), "« Voir toutes les communes » : la liste complète est affichée (A → Z)");
} catch (e) {
  verifier(false, "parcours interrompu : " + e.message.split("\n")[0]);
}

verifier(erreurs.length === 0, "recherche : aucune erreur JavaScript" + (erreurs.length ? " (" + erreurs.join(" | ") + ")" : ""));
await navigateur.close();
console.log(echecs === 0 ? "recherche : zéro échec" : `recherche : ${echecs} échec(s)`);
process.exit(echecs === 0 ? 0 : 1);
