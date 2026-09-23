/* SMOKE TEST DE PRODUCTION — mesure ce qui est REELLEMENT servi a une adresse
 * publique, apres un vrai deploiement. Ne remplace pas le banc (qui mesure
 * l'artefact avant publication) : celui-ci mesure APRES, sur le reseau reel,
 * avec le cache reel. Ecrit pour tourner apres CHAQUE publication future, pas
 * seulement la premiere.
 *
 * CE QUE "AVANT" NE PROUVE PAS, ET QUE CE SCRIPT VERIFIE : que l'URL publique
 * serve bien l'artefact attendu (pas une copie en cache, pas l'ancienne
 * version), que les JSON de donnees soient reellement atteignables depuis
 * l'exterieur (chemins relatifs, CDN, en-tetes), que rien de l'ancienne
 * version (fichier autonome, 16 Mo, window.REPERE_COMPLET) ne transparaisse,
 * et que la provenance (commit) corresponde a ce qui a ete publie.
 *
 * Usage : node scripts/smoke-prod.mjs <url> [commit-attendu]
 *   node scripts/smoke-prod.mjs https://repereapp.netlify.app
 *   node scripts/smoke-prod.mjs https://repereapp.netlify.app 8a5256d
 *
 * Sortie : 0 si tout passe, 1 sinon — utilisable comme etape bloquante d'une
 * chaine, ou lance a la main juste apres avoir clique "publier".
 */
import { chromium } from "playwright";

const URL_BASE = process.argv[2];
if (!URL_BASE) {
  console.error("usage : node scripts/smoke-prod.mjs <url> [commit-attendu]");
  process.exit(2);
}
const COMMIT_ATTENDU = process.argv[3] || null;
/* Anti-cache : le CDN sert des copies. Sans parametre neuf, on mesurerait le
   cache, pas le deploiement — erreur deja commise deux fois sur ce projet. */
const CASSE_CACHE = "smoke=" + Date.now();
const url = (chemin = "/") => {
  const u = new URL(chemin, URL_BASE);
  u.searchParams.set("verif", CASSE_CACHE);
  return u.toString();
};

const resultats = [];
function verif(nom, condition, detail) {
  resultats.push({ nom, ok: !!condition, detail: condition ? "" : (detail || "") });
  console.log((condition ? "  ok  " : " ECHEC") + " | " + nom + (condition ? "" : "  -> " + (detail || "")));
}

console.log("== smoke test production : " + URL_BASE + " ==");
console.log("   parametre anti-cache : " + CASSE_CACHE);

console.log("\n--- reponse HTTP brute -----------------------------------------");
const reponsePage = await fetch(url("/"));
verif("HTTP 200 sur la page d'accueil", reponsePage.status === 200, "statut " + reponsePage.status);
const html = await reponsePage.text();
const poidsHtml = new TextEncoder().encode(html).length;
verif("HTML plausible : contient <html> et une balise racine",
  /<html/i.test(html) && /id="root"|id="app"/i.test(html), "poids " + poidsHtml + " o");
/* LE MARQUEUR DE L'ANCIENNE VERSION. Le fichier autonome embarque tout : s'il
   est encore servi, cette page pese des Mo et porte ce drapeau. */
verif("aucune trace de l'ancien build autonome (16 Mo, REPERE_COMPLET)",
  !/window\.REPERE_COMPLET/.test(html) && poidsHtml < 500 * 1024,
  "poids " + Math.round(poidsHtml / 1024) + " Ko" + (/REPERE_COMPLET/.test(html) ? ", marqueur trouve" : ""));

console.log("\n--- donnees atteignables depuis l'exterieur --------------------");
const reponseIndex = await fetch(url("/data/index.json"));
verif("HTTP 200 sur /data/index.json", reponseIndex.status === 200, "statut " + reponseIndex.status);
let index = null;
if (reponseIndex.ok) {
  index = await reponseIndex.json();
  verif("provenance presente dans l'artefact servi",
    !!(index.build && index.build.commit_court), JSON.stringify(index.build));
  if (COMMIT_ATTENDU) {
    verif("le commit servi est bien celui attendu",
      index.build && index.build.commit_court === COMMIT_ATTENDU,
      "servi=" + (index.build && index.build.commit_court) + " attendu=" + COMMIT_ATTENDU);
  }
  const sante = index.build && index.build.sante;
  verif("sante : aucune source CRITIQUE manquante",
    !!(sante && sante.elus && sante.comptes),
    JSON.stringify(sante));
}

console.log("\n--- l'application, dans un vrai navigateur ---------------------");
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const erreursConsole = [];
page.on("pageerror", e => erreursConsole.push("pageerror: " + e.message));
page.on("console", m => { if (m.type() === "error") erreursConsole.push("console: " + m.text().slice(0, 160)); });
const reponsesReseau = [];
page.on("response", r => reponsesReseau.push({ url: r.url(), status: r.status() }));

let poidsTransfere = 0;
const compteur = async r => { try { const b = await r.body(); poidsTransfere += b.length; } catch {} };
page.on("response", compteur);
await page.goto(url("/"), { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
page.off("response", compteur);

verif("l'application démarre sans erreur JavaScript critique",
  erreursConsole.length === 0, erreursConsole.slice(0, 3).join(" | "));

const echecsReseau = reponsesReseau.filter(r => r.status >= 400);
verif("aucune requête réseau en échec au démarrage",
  echecsReseau.length === 0,
  echecsReseau.slice(0, 5).map(r => r.status + " " + r.url).join(" | "));

verif("poids transfere au premier ecran raisonnable (< 300 Ko)",
  poidsTransfere <= 300 * 1024, Math.round(poidsTransfere / 1024) + " Ko");

console.log("\n--- cas connu : Ustaritz (64) --------------------------------");
await page.getByLabel(/Où habitez-vous/i).fill("64").catch(() => {});
await page.waitForTimeout(300);
await page.getByRole("button", { name: /^64\b/ }).click().catch(() => {});
await page.waitForTimeout(300);
await page.getByLabel(/Votre commune/i).fill("Ustaritz").catch(() => {});
await page.waitForTimeout(300);
const boutonUstaritz = page.getByRole("button", { name: "Ustaritz", exact: true }).first();
const trouve = await boutonUstaritz.count() > 0;
verif("la recherche trouve la commune de reference", trouve, "aucun resultat pour 'Ustaritz' dans le departement 64");
if (trouve) {
  await boutonUstaritz.click();
  await page.waitForTimeout(1200);
  const texte = await page.evaluate(() => document.body.innerText);
  verif("le maire de la commune de reference s'affiche",
    /Piero ROUGET/.test(texte), texte.slice(0, 140).replace(/\n+/g, " / "));
  verif("la circonscription s'affiche, sans nommer de depute inconnu",
    /6e circonscription législative/.test(texte) && !/votre députée? est/i.test(texte),
    texte.slice(0, 200).replace(/\n+/g, " / "));
  verif("les sources sont citees (producteur ou date visible)",
    /Ministère de l.Intérieur|Répertoire national des élus|RNE/i.test(texte)
    || /\b20\d{2}\b/.test(texte),
    texte.slice(0, 200).replace(/\n+/g, " / "));
}

console.log("\n--- accessibilite critique : zoom 200% (regression fermee le 22/09) ---");
await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
await page.waitForTimeout(200);
const debordement = await page.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
verif("aucun debordement horizontal a 200% de zoom",
  debordement <= 1, "debordement de " + debordement + " px");
await page.evaluate(() => { document.documentElement.style.fontSize = ""; });

console.log("\n--- responsive de base ----------------------------------------");
await ctx.close();
const ctxLarge = await nav.newContext({ viewport: { width: 1280, height: 800 } });
const pageLarge = await ctxLarge.newPage();
await pageLarge.goto(url("/"), { waitUntil: "networkidle" });
const debordementLarge = await pageLarge.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);
verif("aucun debordement horizontal en largeur bureau",
  debordementLarge <= 1, "debordement de " + debordementLarge + " px");
await ctxLarge.close();

await nav.close();

console.log("\n-----------------------------------------------------------------");
const echecs = resultats.filter(r => !r.ok);
console.log(resultats.length + " controles, " + echecs.length + " echec(s).");
if (echecs.length) {
  console.log("\nA CORRIGER :");
  for (const e of echecs) console.log("  - " + e.nom + "  -> " + e.detail);
  process.exit(1);
}
console.log("\nVERDICT : la production repond a ce qu'on attend d'elle.");
