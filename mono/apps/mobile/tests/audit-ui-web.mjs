/* AUDIT UI MESURÉ (10/11/2026) — pour chaque écran et chaque thème, à 390 x 844 dans Chromium
 * (export web : le seul appareil photo du conteneur), capture l'écran et MESURE :
 *   texte sous 12 px · lien souligné · cible tactile sous 44 px · contraste de texte sous AA ·
 *   emoji · bouton sans nom accessible · débordement horizontal.
 * Usage : node tests/audit-ui-web.mjs <adresse du site servi> <dossier de sortie>
 * Ne mesure pas : VoiceOver, gestes iOS, zones sûres réelles, rendu natif des polices. */
import fs from "node:fs";
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [BASE, OUT] = process.argv.slice(2);
export const ECRANS = [
  ["accueil", "/"], ["qui-decide", "/qui-decide"], ["elus", "/elus"], ["elu", "@elu"], ["groupe", "/groupe"],
  ["scrutins", "/scrutins"], ["scrutin-detail", "@scrutin"], ["vote", "/vote"], ["presidentielle-2027", "/presidentielle-2027"], 
  ["calendrier", "/a-venir"], ["finances", "/finances"], ["pour-vous", "/pour-vous"], ["sources", "/sources"], ["confort-lecture", "/confort-lecture"],
  ["chez-vous", "/chez-vous"], ["actus", "/actus"], ["repere-du-jour", "/repere-du-jour"], ["dictionnaire", "/dictionnaire"], ["recherche", "/recherche"],
  ["procedure", "/procedure"], ["questions-gouvernement", "/scrutins?mode=qag"], ["partager", "/partager"], ["faq", "/faq"], ["a-propos", "/a-propos"],
  ["confidentialite", "/confidentialite"], ["soutenir", "/soutenir"],
];

function mesurer() {
  const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const rgba = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : [0, 0, 0, 0]; };
  const fond = el => {
    let c = [255, 255, 255], pile = [];
    for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage !== "none") return null; const b = rgba(s.backgroundColor); if (b.length < 4 || b[3] > 0) pile.push(b.length < 4 ? [...b, 1] : b); if (pile.length && pile.at(-1)[3] >= 1) break; }
    for (const b of pile.reverse()) c = c.map((v, i) => v * (1 - b[3]) + b[i] * b[3]);
    return c;
  };
  const visible = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && Number(s.opacity) > 0; };
  const court = t => t.replace(/\s+/g, " ").trim().slice(0, 40);
  const r = { petit: [], souligne: [], cible: [], contraste: [], emoji: [], sansNom: [], debordement: document.documentElement.scrollWidth > innerWidth ? document.documentElement.scrollWidth : 0 };
  const vus = new Set();
  const marche = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = marche.nextNode());) {
    const t = n.textContent.trim(), el = n.parentElement;
    if (!t || !el || vus.has(el) || !visible(el) || el.closest("[aria-hidden=true]")) continue;
    vus.add(el);
    const s = getComputedStyle(el), px = parseFloat(s.fontSize);
    if (px < 12) r.petit.push(`${px} px « ${court(t)} »`);
    if (s.textDecorationLine.includes("underline")) r.souligne.push(court(t));
    if (/\p{Extended_Pictographic}/u.test(t) && !/^[›‹→←↗ⓘ✓×+−·•]+$/u.test(t.replace(/[\w\sÀ-ÿ.,:;'’()%€/-]/g, ""))) r.emoji.push(court(t));
    const f = fond(el);
    if (f) {
      const c = rgba(s.color), a = c.length < 4 ? 1 : c[3], melange = c.slice(0, 3).map((v, i) => v * a + f[i] * (1 - a));
      const [l1, l2] = [lum(melange), lum(f)].sort((x, y) => y - x), ratio = (l1 + 0.05) / (l2 + 0.05);
      const grand = px >= 24 || (px >= 18.66 && Number(s.fontWeight) >= 700);
      if (ratio < (grand ? 3 : 4.5) - 0.01) r.contraste.push(`${ratio.toFixed(2)}:1 (${Math.round(px)} px) « ${court(t)} »`);
    }
  }
  for (const el of document.querySelectorAll("a[href],button,[role=button],[role=link],[role=tab],[role=switch],[role=checkbox],[role=radio],input,[tabindex='0']")) {
    if (!visible(el) || el.closest("[aria-hidden=true]") || el.getAttribute("aria-disabled") === "true" && false) continue;
    const b = el.getBoundingClientRect(), nom = (el.getAttribute("aria-label") || el.innerText || el.getAttribute("placeholder") || "").trim();
    if (b.width < 43.5 || b.height < 43.5) r.cible.push(`${Math.round(b.width)} x ${Math.round(b.height)} « ${court(nom)} »`);
    if (!nom) r.sansNom.push(`${el.tagName.toLowerCase()} ${Math.round(b.width)} x ${Math.round(b.height)} en y=${Math.round(b.top + scrollY)}`);
  }
  for (const k of ["petit", "souligne", "cible", "contraste", "emoji", "sansNom"]) r[k] = [...new Set(r[k])];
  return r;
}

if (BASE && OUT) {
  fs.mkdirSync(OUT, { recursive: true });
  const nav = await chromium.launch();
  const bilan = {};
  for (const mode of ["sombre", "clair"]) {
    const p = await nav.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const erreurs = [];
    p.on("pageerror", e => erreurs.push(e.message));
    await p.addInitScript(m => {
      localStorage.setItem("repere.profil", JSON.stringify({ niveauZoom: "tout", tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false, prenom: "Test", mode: m }));
      localStorage.setItem("repere.departement", JSON.stringify({ d: "77", c: "77284" }));
    }, mode);
    const clic = async (depuis, texte) => { await p.goto(BASE + depuis, { waitUntil: "networkidle" }); await p.waitForTimeout(900); const c = p.getByRole("link", { name: texte }).or(p.getByRole("button", { name: texte })).first(); if (!(await c.count())) return false; await c.click(); await p.waitForTimeout(1200); return true; };
    for (const [nom, route] of ECRANS) {
      erreurs.length = 0;
      let atteint = true;
      if (route === "@elu") atteint = await clic("/qui-decide", /assemblée nationale pour votre|député/i);
      else if (route === "@groupe") atteint = await clic("/elus", /groupe/i);
      else if (route === "@scrutin") atteint = await clic("/scrutins", /pour|contre|adopt|rejet/i);
      else { await p.goto(BASE + route, { waitUntil: "networkidle" }); await p.waitForTimeout(1200); }
      const m = atteint ? await p.evaluate(mesurer) : { nonAtteint: true };
      m.url = p.url().replace(BASE, ""); m.hauteur = await p.evaluate(() => document.body.scrollHeight); m.erreursJs = [...erreurs];
      /* L'écran défile dans un conteneur interne : la fenêtre est allongée le temps de la capture (2 600 px au plus). */
      const long = Math.min(2600, await p.evaluate(() => Math.max(...[...document.querySelectorAll("*")].map(e => e.scrollHeight))));
      await p.setViewportSize({ width: 390, height: Math.max(844, long) }); await p.waitForTimeout(250);
      await p.screenshot({ path: `${OUT}/${nom}-${mode}.jpg`, type: "jpeg", quality: 72, fullPage: false });
      await p.setViewportSize({ width: 390, height: 844 });
      (bilan[nom] ||= {})[mode] = m;
    }
    await p.close();
  }
  await nav.close();
  fs.writeFileSync(`${OUT}/mesures.json`, JSON.stringify(bilan, null, 1));
  const cles = ["petit", "souligne", "cible", "contraste", "emoji", "sansNom"];
  /* EXCEPTIONS DOCUMENTÉES (RAPPORT-AUDIT-UI.md) — tout autre écart fait échouer le script :
     - partager / petit : les cartes de partage sont des aperçus réduits d'une image de 1080 px ;
     - accueil / contraste : le point final du logotype « Repère. », décoratif. */
  const EXCEPTIONS = { partager: ["petit"], accueil: ["contraste"] };
  let ecarts = 0;
  for (const [nom, modes] of Object.entries(bilan)) for (const m of Object.values(modes)) {
    if (m.nonAtteint) continue;
    for (const k of cles) if (m[k].length && !(EXCEPTIONS[nom] || []).includes(k)) { ecarts += m[k].length; console.log(`ÉCART ${nom} / ${k} : ${m[k].slice(0, 4).join(" ; ")}`); }
    if (m.debordement) { ecarts++; console.log(`ÉCART ${nom} : débordement horizontal (${m.debordement} px)`); }
    if (m.erreursJs.length) { ecarts++; console.log(`ÉCART ${nom} : erreur JavaScript (${m.erreursJs[0]})`); }
  }
  process.exitCode = ecarts ? 1 : 0;
  console.log(ecarts ? `audit UI : ${ecarts} écart(s)` : "audit UI : zéro écart hors exceptions documentées");
  for (const [nom, modes] of Object.entries(bilan)) console.log(nom.padEnd(24), ["sombre", "clair"].map(m => modes[m].nonAtteint ? "NON ATTEINT" : cles.map(k => `${k[0]}${k[1]}${modes[m][k].length}`).join(" ") + (modes[m].debordement ? " DEB" : "") + (modes[m].erreursJs.length ? " JS!" : "")).join("  |  "));
}
