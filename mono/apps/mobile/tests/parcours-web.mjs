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
      /* Le texte SANS les capitales de style : sous textTransform, « DEPUTE »
         echappait a la recherche de « depute » (mesure le 29/09/2026, titre de
         carte casse expres). textContent ne convient pas non plus : il colle
         les blocs voisins (« RepereQui »), et le mot entier n'est plus trouve. */
      brut: (() => {
        const st = document.createElement("style");
        st.textContent = "*{text-transform:none!important}";
        document.head.appendChild(st);
        const t = document.body.innerText;
        st.remove();
        return t;
      })(),
    };
  });
  verifier(!mesure.deborde, `${largeur}px : aucun débordement horizontal`);
  verifier(mesure.petites.length === 0, `${largeur}px : cibles tactiles >= 44 px ${JSON.stringify(mesure.petites)}`);
  verifier(mesure.sansNom === 0, `${largeur}px : chaque contrôle a un nom accessible (${mesure.sansNom} sans nom)`);
  verifier(/est maire de Meaux/.test(mesure.texte), `${largeur}px : le maire est nommé`);
  verifier(/Source : .*mise à jour du/.test(mesure.texte), `${largeur}px : une source datée est affichée`);
  verifier(/Votre député|député élu/.test(mesure.texte), `${largeur}px : la carte du député est présente`);
  /* Lot M1 (30/09/2026) : la promesse de l'accueil est tenue, et le calcul se dit calcul. */
  verifier(/Où va l'argent de la commune/i.test(mesure.brut) && /mois de recettes/.test(mesure.texte)
    && /Calculé par Repère/.test(mesure.texte) && /ce n'est pas un chiffre publié/.test(mesure.texte),
    `${largeur}px : les comptes de la commune s'affichent, annoncés comme un calcul`);
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

/* SE SOUVENIR DE LA COMMUNE, SEULEMENT SI LE LECTEUR LE DEMANDE — D-M3,
   29/09/2026. Mesure sur la version web de l'application (sur telephone, le
   meme code ecrit un fichier du cache, voir lib/memoire.ts) :
   rien n'est garde avant la demande ; apres, une seule cle, deux codes
   publics ; la commune est proposee au retour ; « Oublier » efface tout ;
   et aucune requete ne porte jamais le code de la commune. */
{
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const demandees = [];
  page.on("request", r => demandees.push(r.url()));
  const stockage = () => page.evaluate(() => ({
    ls: Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])),
    ss: sessionStorage.length, cookies: document.cookie,
  }));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  await page.getByText("Voici ce qui se passe chez vous").waitFor({ timeout: 15000 });
  let st = await stockage();
  verifier(Object.keys(st.ls).length === 0, "mémoire : rien n'est gardé tant que le lecteur ne l'a pas demandé " + JSON.stringify(st.ls));
  await page.getByRole("button", { name: "Retenir Meaux sur ce téléphone" }).click();
  await page.getByText(/Meaux est retenue sur ce téléphone/).waitFor({ timeout: 5000 });
  st = await stockage();
  verifier(JSON.stringify(st.ls) === JSON.stringify({ "repere.departement": '{"d":"77","c":"77284"}' }),
    "mémoire : une seule clé, deux codes publics, rien d'autre " + JSON.stringify(st.ls));
  verifier(st.ss === 0 && st.cookies === "", "mémoire : ni sessionStorage, ni cookie");
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const reprendre = page.getByRole("button", { name: "Voir ce qui se passe à Meaux" });
  await reprendre.waitFor({ timeout: 10000 });
  verifier(true, "mémoire : Meaux est proposée à la réouverture");
  await reprendre.click();
  await page.getByText("Voici ce qui se passe chez vous").waitFor({ timeout: 15000 });
  verifier(true, "mémoire : un geste suffit pour retrouver sa commune");
  await page.getByRole("button", { name: "Oublier Meaux" }).click();
  st = await stockage();
  verifier(Object.keys(st.ls).length === 0, "mémoire : « Oublier » efface tout " + JSON.stringify(st.ls));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByText("Où habitez-vous ?").waitFor({ timeout: 10000 });
  verifier(await page.getByText("Votre commune, sur ce téléphone").count() === 0, "mémoire : oubliée, elle n'est plus proposée");
  /* Une valeur trafiquee n'est jamais affichee : elle est effacee. */
  await page.evaluate(() => localStorage.setItem("repere.departement", '{"d":"77","c":"<script>"}'));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByText("Où habitez-vous ?").waitFor({ timeout: 10000 });
  st = await stockage();
  verifier(Object.keys(st.ls).length === 0 && await page.getByText("Votre commune, sur ce téléphone").count() === 0,
    "mémoire : une valeur mal formée est effacée, jamais affichée");
  const fautives = demandees.filter(u => adresseFautive(u) || /77284/.test(u));
  verifier(fautives.length === 0, "mémoire : aucune requête ne porte le code de la commune " + JSON.stringify(fautives));
  await ctx.close();
}

await navigateur.close();
if (CAPTURES) console.log("captures : " + fs.readdirSync(CAPTURES).filter(f => f.endsWith(".png")).join(", "));
console.log(echecs ? `${echecs} échec(s)` : "parcours complet, zéro échec");
process.exit(echecs ? 1 : 0);
