// RAPPEL DE LA PROCHAINE ÉLECTION sur l'accueil, dans un navigateur (V37, bloc 6, 31/10/2026).
// Usage : node apps/mobile/tests/elections-web.mjs http://localhost:8811   (depuis mono/)
// L'horloge du navigateur est fixée (page.clock) : la carte doit apparaître à 180 jours ou moins, avec
// le compte exact, et disparaître au-delà. Le compte attendu est calculé ici, pas recopié d'un rendu.
import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/");
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:8811").replace(/\/$/, "");
const SCRUTIN = Date.UTC(2027, 3, 18); /* 18 avril 2027, premier tour (lib/elections.ts) */
const jours = (y, m, d) => Math.round((SCRUTIN - Date.UTC(y, m - 1, d)) / 86_400_000);
let echecs = 0;
const verifier = (ok, message) => {
  console.log((ok ? "ok    " : "ECHEC ") + message);
  if (!ok) echecs++;
};

/* Une commune retenue (sinon l'accueil est l'écran de premier lancement, où la carte ne s'affiche pas). */
const PROFIL = { niveauZoom: "france", tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false,
  animationsReduites: false, modeDaltonien: false, masquerImages: false, mode: "auto", themes: [] };
const DEPARTEMENT = { d: "77", c: "77288" };

async function accueilA(navigateur, [annee, mois, jour]) {
  const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await contexte.addInitScript(([profil, dep]) => {
    if (!sessionStorage.getItem("amorce")) {
      sessionStorage.setItem("amorce", "1");
      localStorage.setItem("repere.profil", JSON.stringify(profil));
      localStorage.setItem("repere.departement", JSON.stringify(dep));
    }
  }, [PROFIL, DEPARTEMENT]);
  const page = await contexte.newPage();
  await page.clock.setFixedTime(new Date(annee, mois - 1, jour, 12, 0, 0));
  const erreurs = [];
  page.on("pageerror", e => erreurs.push(e.message));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  const texte = await page.locator("body").innerText();
  return { contexte, texte, erreurs };
}

const navigateur = await chromium.launch();
try {
  /* 31 octobre 2026 : 169 jours. */
  const a = await accueilA(navigateur, [2026, 10, 31]);
  const n = jours(2026, 10, 31);
  verifier(n === 169, `calcul attendu : ${n} jours entre le 31/10/2026 et le 18/04/2027`);
  verifier(a.texte.includes("Élections présidentielles"), "31/10/2026 : la carte « Élections présidentielles » s'affiche");
  verifier(a.texte.includes(`dans ${n} jours (18 avril 2027)`), `31/10/2026 : « dans ${n} jours (18 avril 2027) »`);
  verifier(a.texte.includes("Comment voter ?"), "31/10/2026 : le lien « Comment voter ? » est présent");
  verifier(a.erreurs.length === 0, "31/10/2026 : aucune erreur JavaScript");
  await a.contexte.close();

  /* 1er octobre 2026 : 199 jours, au-delà des 180 : la carte est masquée. */
  const b = await accueilA(navigateur, [2026, 10, 1]);
  verifier(jours(2026, 10, 1) > 180, "calcul : 1er octobre 2026 est au-delà de 180 jours");
  verifier(!b.texte.includes("Élections présidentielles"), "01/10/2026 (au-delà de 180 jours) : la carte est masquée");
  await b.contexte.close();

  /* 18 avril 2027 : le jour du scrutin. */
  const c = await accueilA(navigateur, [2027, 4, 18]);
  verifier(c.texte.includes("aujourd'hui (18 avril 2027)"), "18/04/2027 : « aujourd'hui (18 avril 2027) »");
  await c.contexte.close();
} catch (e) {
  verifier(false, "parcours interrompu : " + e.message.split("\n")[0]);
} finally {
  await navigateur.close();
}
console.log(echecs === 0 ? "elections : zéro échec" : `elections : ${echecs} échec(s)`);
process.exit(echecs === 0 ? 0 : 1);
