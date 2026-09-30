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
/* Le nom du maire, lu dans les donnees servies (jamais recopie ici). */
const MAIRE = await (async () => {
  try { const r = await fetch(BASE + "/data/departments/77.json"); const j = await r.json(); return j.communes["77284"].maire.nom.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  catch { return "Maire introuvable dans les données servies"; }
})();
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

  await page.getByText("Ce qui se passe près de chez vous").first().waitFor({ timeout: 15000 });
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

  /* Mesure d'un ecran : debordement, cibles, noms accessibles, texte (avec et
     sans capitales de style). Appliquee a l'accueil ET aux trois ecrans de
     detail depuis la refonte du 30/09/2026. */
  const mesurer = () => page.evaluate(() => {
    const d = document.documentElement;
    const cibles = [...document.querySelectorAll('[role="button"],[role="link"],button,a,input')]
      .filter(e => e.offsetParent !== null);
    return {
      deborde: d.scrollWidth > d.clientWidth + 1,
      petites: cibles.map(e => ({ t: (e.getAttribute("aria-label") || e.textContent || "").trim().slice(0, 40), h: e.getBoundingClientRect().height }))
        .filter(c => c.h < 44),
      sansNom: cibles.filter(e => !(e.getAttribute("aria-label") || e.textContent || "").trim()).length,
      texte: document.body.innerText,
      etiquettes: [...document.querySelectorAll("[aria-label]")].map(e => e.getAttribute("aria-label")).join(" | "),
      /* Le texte SANS les capitales de style : sous textTransform, « DEPUTE »
         echappait a la recherche de « depute » (29/09/2026). */
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
  const communs = (m, ecran) => {
    verifier(!m.deborde, `${largeur}px · ${ecran} : aucun débordement horizontal`);
    verifier(m.petites.length === 0, `${largeur}px · ${ecran} : cibles tactiles >= 44 px ${JSON.stringify(m.petites)}`);
    verifier(m.sansNom === 0, `${largeur}px · ${ecran} : chaque contrôle a un nom accessible (${m.sansNom} sans nom)`);
    const sansAccents = MOTS_A_ACCENTS.filter(x => new RegExp("(^|[^\\p{L}])" + x + "($|[^\\p{L}])", "u").test(m.brut));
    verifier(sansAccents.length === 0, `${largeur}px · ${ecran} : aucun mot affiché sans ses accents ${JSON.stringify(sansAccents)}`);
  };

  /* L'ACCUEIL « CHEZ VOUS » : cinq questions, chacune avec sa source */
  const mesure = await mesurer();
  communs(mesure, "Chez vous");
  verifier(new RegExp(MAIRE).test(mesure.texte), `${largeur}px : le maire est nommé (${MAIRE})`);
  verifier(/Données publiées le \d/.test(mesure.texte), `${largeur}px : la date de publication des données est dite`);
  verifier((mesure.etiquettes.match(/D'où vient cette information/g) || []).length >= 4, `${largeur}px : au moins quatre pastilles de source sur l'accueil`);
  verifier(/a voté (pour|contre|l'abstention)/.test(mesure.texte) && /députés ayant pris part au vote/.test(mesure.etiquettes),
    `${largeur}px : le vote du député s'affiche, et sa répartition se lit aussi en phrase`);
  verifier(/par jour/.test(mesure.texte) && /sur 100 € dépensés/.test(mesure.texte), `${largeur}px : l'argent de la commune s'affiche en visuels`);
  verifier(/Ce qui arrive au Parlement/i.test(mesure.brut), `${largeur}px : la carte « ce qui arrive » est présente (ou sa phrase d'absence)`);
  const fautives = demandees.filter(u => adresseFautive(u));
  verifier(fautives.length === 0, `${largeur}px : aucune adresse ne porte un code de commune ${JSON.stringify(fautives)}`);
  verifier(!/77284/.test(page.url()), `${largeur}px : l'adresse de la page ne porte pas le code de la commune`);

  /* LA FEUILLE DE SOURCE (niveau 4) */
  await page.getByRole("button", { name: /D'où vient cette information/ }).first().click();
  await page.getByText("Voir la source officielle ↗").first().waitFor({ timeout: 5000 });
  verifier(true, `${largeur}px : une pastille ouvre la feuille de source, avec le lien officiel`);
  await page.getByRole("button", { name: "Fermer" }).first().click();
  await page.waitForTimeout(400);

  /* LES TROIS QUESTIONS DE DETAIL */
  for (const [action, question, preuve] of [
    ["Comprendre le budget de la commune", /Où va l'argent de Meaux/, /Calculé par Repère.*ce n'est pas un chiffre publié/s],
    ["Comprendre ce vote", /Qu'a voté votre député/, /Le parcours d'une loi|Où en est ce texte/],
    ["Qui décide de quoi", /Qui décide pour Meaux/, /Décide : /],
  ]) {
    await page.getByRole("button", { name: action }).first().click();
    await page.getByText(question).first().waitFor({ timeout: 10000 });
    await page.waitForTimeout(800);
    const m = await mesurer();
    communs(m, action);
    verifier(preuve.test(m.brut), `${largeur}px · ${action} : l'écran répond à sa question`);
    verifier(/Source : /.test(m.texte), `${largeur}px · ${action} : la source complète est en bas de l'écran`);
    await page.getByRole("button", { name: "Revenir à l'écran Chez vous" }).last().click();
    await page.getByText("Ce qui se passe près de chez vous").first().waitFor({ timeout: 5000 });
  }

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
  verifier(new RegExp(MAIRE).test(t) && /a voté/.test(t), "panne des projets : le reste de l'écran s'affiche");
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

/* MOUVEMENT REDUIT (refonte du 30/09/2026) : quand le systeme demande moins
   d'animations, le montant s'affiche d'emblee a sa valeur finale. Mesure a
   100 ms, bien avant la fin d'une animation (520 ms). Et sans reduction, le
   compteur part bien de plus bas : preuve que le controle voit la difference. */
async function montantA100ms(reduit) {
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true, reducedMotion: reduit ? "reduce" : "no-preference" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  const cible = page.locator('[aria-label$="€ dépensés par jour"]').first();
  await cible.waitFor({ timeout: 15000 });
  await page.waitForTimeout(100);
  const r = await cible.evaluate(e => ({ final: e.getAttribute("aria-label"), vu: e.innerText }));
  await ctx.close();
  const chiffres = t => Number(String(t).replace(/[^\d]/g, "").slice(0, 12));
  return { final: chiffres(r.final), vu: chiffres(r.vu.split("\n")[0]) };
}
{
  const a = await montantA100ms(true);
  verifier(a.vu === a.final, `mouvement réduit : le montant est final d'emblée (${a.vu} / ${a.final})`);
  const b = await montantA100ms(false);
  verifier(b.vu < b.final, `sans réduction, le compteur se révèle (${b.vu} < ${b.final}) : le contrôle ci-dessus mesure bien quelque chose`);
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
  await page.getByText("Ce qui se passe près de chez vous").first().waitFor({ timeout: 15000 });
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
  await page.getByText("Ce qui se passe près de chez vous").first().waitFor({ timeout: 15000 });
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
