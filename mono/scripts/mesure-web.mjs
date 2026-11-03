// Mesures sur le build web (V42, blocs 3 et 4) : clavier et performance, dans Chromium.
// Usage : node scripts/mesure-web.mjs <url-de-base> clavier|perf [sortie.json]
// Le build doit être servi avec un repli sur index.html (application monopage).
// Ce script ne mesure pas un iPhone ni un lecteur d'écran : il mesure le web.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
// PLAYWRIGHT_MODULE : chemin d'un Playwright dont les navigateurs sont installés (le dépôt épingle une version sans navigateur ici).
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");

const [base, mode = "clavier", sortie] = process.argv.slice(2);
if (!base) { console.error("usage: mesure-web.mjs <url> clavier|perf [sortie.json]"); process.exit(2); }

// Écrans navigables sans paramètre. annuaire-fiche et elu exigent un identifiant : testés à part.
const ROUTES = ["/", "/a-venir", "/chez-vous", "/elus", "/qui-decide", "/actus", "/a-propos", "/argent",
  "/bienvenue", "/confidentialite", "/confort-lecture", "/dictionnaire", "/faq", "/mes-elus", "/partager",
  "/pour-vous", "/procedure", "/recherche", "/scrutins", "/sources", "/vote", "/voter"];
const TOUCHES_MAX = 80;

// Lit, pour chaque élément qui reçoit le focus : son nom, s'il a un indicateur visible, s'il est masqué.
const INSPECTER = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return { nom: "(corps)" };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const vw = innerWidth, vh = innerHeight;
  const dansEcran = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  let masque = false;
  if (dansEcran) {
    const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2));
    const cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
    const dessus = document.elementFromPoint(cx, cy);
    masque = !!dessus && !(el === dessus || el.contains(dessus) || dessus.contains(el));
  }
  const contour = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
  const ombre = cs.boxShadow !== "none";
  return {
    nom: (el.getAttribute("aria-label") || el.innerText || el.tagName).replace(/\s+/g, " ").trim().slice(0, 60),
    role: el.getAttribute("role") || el.tagName.toLowerCase(),
    indicateur: contour ? `contour ${cs.outlineWidth} ${cs.outlineColor}` : ombre ? `ombre ${cs.boxShadow.slice(0, 90)}` : null,
    dansEcran, masque, x: Math.round(r.left), y: Math.round(r.top),
  };
};

// Une feuille (Modal React Native) est ouverte si un calque plein écran et fixe est présent.
const FEUILLE_OUVERTE = () => {
  const modale = document.querySelector('[aria-modal="true"]');
  if (modale) return true;
  return [...document.querySelectorAll("div")].some(d => {
    const cs = getComputedStyle(d);
    const r = d.getBoundingClientRect();
    return cs.position === "fixed" && r.width >= innerWidth - 1 && r.height >= innerHeight - 1 && d.innerText.trim().length > 20;
  });
};

async function clavier(navigateur) {
  const rapport = [];
  for (const route of ROUTES) {
    // THEME=sombre : le système annonce le mode sombre, l'application le suit (réglage « systeme »).
    const page = await navigateur.newPage({ viewport: { width: 390, height: 844 }, colorScheme: process.env.THEME === "sombre" ? "dark" : "light" });
    const erreurs = [];
    page.on("pageerror", e => erreurs.push(e.message.slice(0, 120)));
    await page.goto(base + route, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(400);
    const arrets = [];
    let premier = null;
    for (let i = 0; i < TOUCHES_MAX; i++) {
      await page.keyboard.press("Tab");
      const s = await page.evaluate(INSPECTER);
      const cle = `${s.nom}|${s.x}|${s.y}`;
      if (premier === null) premier = cle;
      else if (cle === premier) break;        // retour au premier arrêt : la boucle est fermée
      arrets.push(s);
    }
    // Échap sur une feuille : on tente chaque déclencheur plausible de la page, un par un.
    const declencheurs = await page.locator('[aria-label]').evaluateAll(els => els
      .map(e => e.getAttribute("aria-label"))
      .filter(t => /réglage|source|pourquoi|d'où|exhaustif|affichage|lecture/i.test(t || "")).slice(0, 2));
    const feuilles = [];
    for (const etiquette of declencheurs) {
      await page.goto(base + route, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
      const cible = page.locator(`[aria-label="${etiquette.replace(/"/g, '\\"')}"]`).first();
      await cible.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(500);
      const ouverte = await page.evaluate(FEUILLE_OUVERTE);
      if (!ouverte) { feuilles.push({ declencheur: etiquette, ouverte: false }); continue; }
      await page.keyboard.press("Escape");
      await page.waitForTimeout(500);
      const encore = await page.evaluate(FEUILLE_OUVERTE);
      feuilles.push({ declencheur: etiquette, ouverte: true, fermeeParEchap: !encore });
    }
    // La sortie de la page (retour au navigateur) n'est pas un arrêt de focus : elle est exclue des comptes.
    const arretsReels = arrets.filter(a => a.nom !== "(corps)");
    rapport.push({
      route,
      arrets: arretsReels.length,
      indicateurs: [...new Set(arretsReels.map(a => a.indicateur).filter(Boolean))],
      sansIndicateur: arretsReels.filter(a => !a.indicateur).length,
      masques: arretsReels.filter(a => a.masque).length,
      horsEcran: arretsReels.filter(a => a.dansEcran === false).length,
      parcours: arrets.map(a => `${a.nom} [${a.indicateur ? "vu" : "AUCUN"}${a.masque ? ", masqué" : ""}]`),
      feuilles,
      erreursJs: erreurs,
    });
    await page.close();
  }
  return rapport;
}

// Une page, une session CDP sur cette même page : la limitation s'applique à ce qui est chargé.
async function perf(navigateur, reseau) {
  const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 } });
  const page = await contexte.newPage();
  const session = await contexte.newCDPSession(page);
  await session.send("Network.enable");
  if (reseau === "4G simulé") {
    await session.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8 });
    await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  let octets = 0, requetes = 0;
  session.on("Network.loadingFinished", e => { octets += e.encodedDataLength; requetes++; });
  const mesurerUneFois = async url => {
    octets = 0; requetes = 0;
    await page.goto("about:blank");
    const t0 = Date.now();
    await page.goto(base + url, { waitUntil: "load", timeout: 60000 });
    const charge = Date.now() - t0;
    await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 40, null, { timeout: 30000 }).catch(() => {});
    const premierTexte = Date.now() - t0;
    await page.waitForLoadState("networkidle").catch(() => {});
    return { chargeMs: charge, premierTexteMs: premierTexte, requetes, octetsKo: Math.round(octets / 1024) };
  };
  // Trois essais par écran, médiane : une mesure isolée ne compte pas.
  const mediane = xs => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  const mesurer = async url => {
    const essais = [];
    for (let i = 0; i < 3; i++) essais.push(await mesurerUneFois(url));
    return { url, essais: 3, chargeMs: mediane(essais.map(e => e.chargeMs)), premierTexteMs: mediane(essais.map(e => e.premierTexteMs)), requetes: essais[0].requetes, octetsKo: essais[0].octetsKo, minPremierTexteMs: Math.min(...essais.map(e => e.premierTexteMs)), maxPremierTexteMs: Math.max(...essais.map(e => e.premierTexteMs)) };
  };
  const ecrans = [];
  for (const r of ROUTES) ecrans.push(await mesurer(r));
  // ELU_QUERY : paramètres de la fiche élu (nom, echelon, role, lieu, niveau), tirés des données.
  const requeteElu = process.env.ELU_QUERY;
  const parcours = [];
  if (requeteElu) {
    parcours.push(await mesurer("/"));
    parcours.push(await mesurer(`/elu?${requeteElu}`));
    parcours.push(await mesurer("/argent"));
  }
  await contexte.close();
  return { reseau, ecrans, parcours };
}

const navigateur = await chromium.launch();
let resultat;
try {
  if (mode === "clavier") resultat = await clavier(navigateur);
  else if (mode === "perf") resultat = [await perf(navigateur, "local"), await perf(navigateur, "4G simulé")];
  else throw new Error("mode inconnu : " + mode);
} finally {
  await navigateur.close();
}
const texte = JSON.stringify(resultat, null, 2);
if (sortie) writeFileSync(sortie, texte);
console.log(texte);
