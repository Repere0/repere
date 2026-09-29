/* LE PARCOURS DE LA TRANCHE VERTICALE, MESURE DANS UN NAVIGATEUR — 29/09/2026.
 *
 * Sur l'export web de l'application mobile (meme code React Native, rendu par
 * react-native-web), a trois largeurs de telephone : 360, 390, 430 px.
 * Ce n'est pas un telephone : ni VoiceOver, ni TalkBack, ni le clavier natif
 * ne sont eprouves ici. Ce que ce controle mesure vraiment :
 *   1. le parcours accueil -> recherche -> commune -> retour aboutit ;
 *   2. aucune adresse demandee ne porte un code de commune (invariant 2) ;
 *   3. aucun debordement horizontal ;
 *   4. toute cible tactile fait au moins 44 px de haut ;
 *   5. chaque bouton et lien a un nom accessible ;
 *   5b. aucun mot de MOTS_A_ACCENTS n'est affiche sans ses accents ;
 *   6. l'ecran de commune affiche un maire, une source datee et une phrase
 *      pour chaque absence — jamais une carte vide.
 *
 * Usage :
 *   EXPO_PUBLIC_REPERE_DONNEES=/data npx expo export --platform web --output-dir dist-web
 *   cp -r ../../data dist-web/data
 *   node ../../scripts/serveur-statique.mjs dist-web 8811 &
 *   node tests/parcours-web.mjs http://localhost:8811 [dossier-captures]
 */
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

/* Playwright : celui de l'application si elle l'a (CI mobile), sinon celui de
   mono/ (poste de developpement ou il est deja installe par pnpm). */
let chromium;
for (const racine of ["../package.json", "../../../package.json"]) {
  try { ({ chromium } = createRequire(path.resolve(import.meta.dirname, racine))("playwright")); break; } catch { /* suivant */ }
}
if (!chromium) { console.error("playwright introuvable"); process.exit(2); }
const { adresseFautive, MOTS_A_ACCENTS } = await import("../../../packages/data-utils/src/invariants.js");

const BASE = process.argv[2] || "http://localhost:8811";
const CAPTURES = process.argv[3] || null;
if (CAPTURES) fs.mkdirSync(CAPTURES, { recursive: true });
const COMMUNE = { saisie: "meaux", nom: "Meaux" };
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok   " : "ECHEC") + " " + texte); if (!ok) echecs++; };

const navigateur = await chromium.launch();
for (const largeur of [360, 390, 430]) {
  const page = await navigateur.newPage({ viewport: { width: largeur, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const demandees = [];
  page.on("request", r => demandees.push(r.url()));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  const champ = page.getByLabel(/Où habitez-vous/);
  await champ.fill(COMMUNE.saisie);
  const resultat = page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first();
  await resultat.waitFor({ timeout: 10000 });
  if (CAPTURES) await page.screenshot({ path: path.join(CAPTURES, `accueil-${largeur}.png`), fullPage: true });
  await resultat.click();

  await page.getByText("Voici ce qui se passe chez vous").waitFor({ timeout: 15000 });
  await page.waitForLoadState("networkidle");
  /* Le ScrollView de React Native defile a l'interieur de la page : une capture
     « pleine page » n'en montrerait que le haut. On le fait defiler. */
  if (CAPTURES) {
    for (let i = 0; i < 6; i++) {
      await page.screenshot({ path: path.join(CAPTURES, `chez-vous-${largeur}-${i}.png`) });
      const fini = await page.evaluate(() => {
        const el = [...document.querySelectorAll("div")].filter(e => e.scrollHeight > e.clientHeight + 4 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))
          .sort((x, y) => y.scrollHeight - x.scrollHeight)[0];
        if (!el) return true;
        const avant = el.scrollTop; el.scrollTop += el.clientHeight - 120; return el.scrollTop === avant;
      });
      if (fini) break;
      await page.waitForTimeout(150);
    }
  }

  const mesure = await page.evaluate(() => {
    const d = document.documentElement;
    const cibles = [...document.querySelectorAll('[role="button"],[role="link"],button,a,input')]
      .filter(e => e.offsetParent !== null);
    return {
      deborde: d.scrollWidth > d.clientWidth + 1,
      petites: cibles.map(e => ({ t: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 40), h: e.getBoundingClientRect().height }))
        .filter(c => c.h < 44),
      sansNom: cibles.filter(e => !(e.getAttribute("aria-label") || e.textContent || "").trim()).length,
      texte: document.body.innerText,
      /* textContent, pas innerText : un titre en capitales (textTransform)
         cacherait « DEPUTE » a une recherche de « depute ». Mesure le 29/09/2026 :
         le controle ne tirait pas sur un titre de carte casse expres. */
      brut: document.body.textContent,
    };
  });
  verifier(!mesure.deborde, `${largeur}px : aucun débordement horizontal`);
  verifier(mesure.petites.length === 0, `${largeur}px : cibles tactiles >= 44 px ${JSON.stringify(mesure.petites)}`);
  verifier(mesure.sansNom === 0, `${largeur}px : chaque contrôle a un nom accessible (${mesure.sansNom} sans nom)`);
  verifier(/est maire de Meaux/.test(mesure.texte), `${largeur}px : le maire est nommé`);
  verifier(/Source : .*mise à jour du/.test(mesure.texte), `${largeur}px : une source datée est affichée`);
  verifier(/Votre député|député élu/.test(mesure.texte), `${largeur}px : la carte du député est présente`);
  const sansAccents = MOTS_A_ACCENTS.filter(m => new RegExp("(^|[^\\p{L}])" + m + "($|[^\\p{L}])", "u").test(mesure.brut));
  verifier(sansAccents.length === 0, `${largeur}px : aucun mot affiché sans ses accents ${JSON.stringify(sansAccents)}`);
  const fautives = demandees.filter(u => adresseFautive(u));
  verifier(fautives.length === 0, `${largeur}px : aucune adresse ne porte un code de commune ${JSON.stringify(fautives)}`);
  verifier(!/77284/.test(page.url()), `${largeur}px : l'adresse de la page ne porte pas le code de la commune`);

  await page.getByRole("button", { name: "Revenir à l'accueil" }).last().click();
  await page.getByText("Où habitez-vous ?").waitFor({ timeout: 5000 });
  verifier(true, `${largeur}px : retour à l'accueil`);
  await page.close();
}
/* LES PANNES PARTIELLES DISENT « PAS ARRIVE », JAMAIS « ABSENT » — audit de
   #45, 29/09/2026. Avant correction, un fichier de projets ou de votes coupe
   faisait afficher « Aucun projet ... n'est publie » : une phrase fausse. */
async function ouvrirAvecPanne(motif) {
  const page = await navigateur.newPage({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  await page.route(motif, r => r.abort());
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  await page.waitForTimeout(1500);
  await page.waitForLoadState("networkidle");
  const texte = await page.evaluate(() => document.body.textContent);
  await page.close();
  return texte;
}
{
  const t = await ouvrirAvecPanne("**/data/projets/**");
  verifier(/projets financés par l'État ne sont pas arrivés/.test(t) && !/Aucun projet financé/.test(t),
    "panne des projets : « pas arrivés », jamais « aucun projet »");
  verifier(/est maire de Meaux/.test(t), "panne des projets : le reste de l'écran s'affiche");
}
{
  const t = await ouvrirAvecPanne("**/data/scrutins/**");
  verifier(/votes de l'Assemblée ne sont pas arrivés/.test(t) && !/Aucun vote solennel/.test(t),
    "panne des votes : « pas arrivés », jamais « aucun vote »");
}
{
  const t = await ouvrirAvecPanne("**/data/departments/**");
  verifier(/n'a pas réussi à joindre le serveur/.test(t) && /Réessayer/.test(t),
    "panne du département : phrase d'échec et bouton Réessayer");
}

await navigateur.close();
if (CAPTURES) console.log("captures : " + fs.readdirSync(CAPTURES).filter(f => f.endsWith(".png")).join(", "));
console.log(echecs ? `${echecs} échec(s)` : "parcours complet, zéro échec");
process.exit(echecs ? 1 : 0);
