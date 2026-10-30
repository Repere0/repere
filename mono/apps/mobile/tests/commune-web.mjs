/* COMMUNE GARDÉE RESTAURÉE PARTOUT (V32, bloc 1 — régression du défaut de V30) .
   Démarrage à froid sur un écran qui a besoin d'une commune, sans passer par l'accueil :
   - commune gardée dans le stockage → l'écran affiche la commune, jamais « Aucune commune n'est choisie » ;
   - sans commune gardée → l'écran affiche « Aucune commune n'est choisie ».
   Usage : node apps/mobile/tests/commune-web.mjs http://localhost:8811 */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
const COMMUNE = { d: "77", c: "77288", nom: "Melun" };
const PHRASE_VIDE = "Aucune commune n'est choisie";
/* « nom » : l'écran affiche la commune. /elus est l'annuaire national : il n'utilise pas la commune,
   on vérifie seulement qu'il ne dit pas « Aucune commune n'est choisie ». */
const ECRANS = [
  { chemin: "/qui-decide", nom: true },
  { chemin: "/elus", nom: false },
  { chemin: "/mes-elus", nom: true },
  { chemin: "/chez-vous", nom: true },
];
const PROFIL = { niveauZoom: "france", tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false, themes: [] };

let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };

const navigateur = await chromium.launch();

async function ouvrirAFroid(chemin, { gardee }) {
  const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await contexte.addInitScript(([profil, departement]) => {
    localStorage.clear();
    localStorage.setItem("repere.profil", JSON.stringify(profil));
    if (departement) localStorage.setItem("repere.departement", JSON.stringify(departement));
  }, [PROFIL, gardee ? { d: COMMUNE.d, c: COMMUNE.c } : null]);
  const page = await contexte.newPage();
  const erreurs = [];
  page.on("pageerror", e => erreurs.push(String(e.message || e)));
  /* Pas de passage par l'accueil : c'est le cas du lien direct et du redémarrage. */
  await page.goto(BASE + chemin, { waitUntil: "networkidle" });
  /* La liste des communes se charge après le premier rendu : on attend qu'elle ait répondu. */
  await page.waitForTimeout(2500);
  const texte = await page.locator("body").innerText();
  await contexte.close();
  return { texte, erreurs };
}

for (const { chemin, nom } of ECRANS) {
  const { texte, erreurs } = await ouvrirAFroid(chemin, { gardee: true });
  verifier(!texte.includes(PHRASE_VIDE), `${chemin} : commune gardée → pas de « ${PHRASE_VIDE} »`);
  if (nom) verifier(texte.includes(COMMUNE.nom), `${chemin} : commune gardée → « ${COMMUNE.nom} » affichée`);
  verifier(erreurs.length === 0, `${chemin} : commune gardée → aucune erreur JavaScript${erreurs.length ? " (" + erreurs[0].slice(0, 120) + ")" : ""}`);
}

for (const chemin of ["/qui-decide", "/mes-elus"]) {
  const { texte, erreurs } = await ouvrirAFroid(chemin, { gardee: false });
  verifier(texte.includes(PHRASE_VIDE), `${chemin} : sans commune → « ${PHRASE_VIDE} »`);
  verifier(erreurs.length === 0, `${chemin} : sans commune → aucune erreur JavaScript`);
}

await navigateur.close();
console.log(echecs === 0 ? "commune gardée : zéro échec" : `commune gardée : ${echecs} échec(s)`);
process.exit(echecs === 0 ? 0 : 1);
