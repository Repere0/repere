// PARTAGE TEXTE DES ÉCRANS DE DÉTAIL, dans un navigateur (V37, bloc 7, 31/10/2026).
// Usage : node apps/mobile/tests/partage-texte-web.mjs http://localhost:8811   (depuis mono/)
// Pour chaque écran (budget, mes élus, actualités, calendrier) : le bouton « Partager » est dans l'en-tête ;
// le message qui part vers le partage contient le titre de la page, le lien repere://<écran>, sans commune
// dans l'adresse, et la source telle que l'écran la montre. Le partage du navigateur est simulé : on lit
// ce qui lui serait remis.
import { createRequire } from "node:module";
const require = createRequire(process.cwd() + "/");
const { chromium } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:8811").replace(/\/$/, "");
let echecs = 0;
const verifier = (ok, message) => {
  console.log((ok ? "ok    " : "ECHEC ") + message);
  if (!ok) echecs++;
};

const PROFIL = { niveauZoom: "france", tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false,
  animationsReduites: false, modeDaltonien: false, masquerImages: false, mode: "auto", themes: [] };
const DEPARTEMENT = { d: "77", c: "77288" };
/* Chemin, titre attendu contenant, et ce que la source doit contenir (vide = pas de contrôle de source). */
const ECRANS = [
  { chemin: "argent", titre: "Où va l'argent de Melun", source: "Source : " },
  { chemin: "mes-elus", titre: "Mes élus à Melun", source: "Source : " },
  { chemin: "actus", titre: "Actualités", source: "Source : sources officielles" },
  { chemin: "a-venir", titre: "Le calendrier", source: "Source : " },
];

const navigateur = await chromium.launch();
try {
  for (const { chemin, titre, source } of ECRANS) {
    const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await contexte.addInitScript(([profil, dep]) => {
      if (!sessionStorage.getItem("amorce")) {
        sessionStorage.setItem("amorce", "1");
        localStorage.setItem("repere.profil", JSON.stringify(profil));
        localStorage.setItem("repere.departement", JSON.stringify(dep));
      }
      window.__partages = [];
      Object.defineProperty(navigator, "share", { configurable: true, value: async (donnees) => { window.__partages.push(donnees); } });
    }, [PROFIL, DEPARTEMENT]);
    const page = await contexte.newPage();
    const erreurs = [];
    page.on("pageerror", e => erreurs.push(e.message));
    await page.goto(`${BASE}/${chemin}`, { waitUntil: "networkidle" });
    const bouton = page.getByRole("button", { name: /^Partager : / }).first();
    try {
      await bouton.waitFor({ state: "visible", timeout: 15000 });
      verifier(true, `${chemin} : le bouton « Partager » est dans l'en-tête`);
      await bouton.click();
      await page.waitForTimeout(500);
      const recus = await page.evaluate(() => window.__partages);
      verifier(recus.length === 1, `${chemin} : un partage est remis au navigateur`);
      const message = recus.length ? JSON.stringify(recus[0]) : "";
      verifier(message.includes(titre), `${chemin} : le titre de la page est dans le message (« ${titre} »)`);
      verifier(message.includes(`repere://${chemin}`), `${chemin} : le lien est repere://${chemin}`);
      verifier(!/77288|Melun"?\s*$/.test(message.replace(titre, "")) && !message.includes("77288"), `${chemin} : aucun code de commune dans le lien ou le message`);
      /* La source du message est celle que l'écran montre. Le calendrier tire ses sources de l'agenda de
         l'Assemblée et du Sénat, fichiers absents du jeu de données local : sans source à l'écran, rien à citer. */
      const ecran = await page.locator("body").innerText();
      if (chemin === "a-venir" && !ecran.includes("Source :")) {
        console.log("note  a-venir : l'écran ne montre aucune source (agenda absent du jeu local), source non vérifiée ici");
      } else if (source) {
        verifier(message.includes(source), `${chemin} : la source est dans le message (« ${source.trim()} »)`);
      }
    } catch (e) {
      verifier(false, `${chemin} : bouton « Partager » introuvable (${e.message.split("\n")[0]})`);
    }
    verifier(erreurs.length === 0, `${chemin} : aucune erreur JavaScript`);
    await contexte.close();
  }
} finally {
  await navigateur.close();
}
console.log(echecs === 0 ? "partage-texte : zéro échec" : `partage-texte : ${echecs} échec(s)`);
process.exit(echecs === 0 ? 0 : 1);
