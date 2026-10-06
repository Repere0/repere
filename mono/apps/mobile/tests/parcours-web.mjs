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

  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
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
      /* CONTRASTE AA MESURE SUR LE RENDU (spike du 30/09/2026) : chaque texte
         visible contre le premier fond opaque de ses parents. 4,5:1, ou 3:1 pour
         le grand texte (24 px, ou 18,66 px gras). Il a trouve, au premier tour,
         les libelles d'echelon de la chaine : l'intercommunalite a 3,21:1. */
      contrastes: (() => {
        const rgb = x => (x.match(/[\d.]+/g) || []).map(Number);
        const lum = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
          .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
        const fond = e => { for (; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.length >= 3 && (c.length < 4 || c[3] > 0.5)) return c; } return [255, 255, 255]; };
        const out = new Set();
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        for (let n; (n = w.nextNode());) {
          const t = n.textContent.trim(), e = n.parentElement;
          if (!t || !e || e.offsetParent === null) continue;
          const st = getComputedStyle(e), c = rgb(st.color);
          if (c.length >= 4 && c[3] < 1) continue;
          const [a, b] = [lum(c), lum(fond(e))].sort((x, y) => y - x);
          const r = (a + 0.05) / (b + 0.05), px = parseFloat(st.fontSize);
          const seuil = px >= 24 || (Number(st.fontWeight) >= 700 && px >= 18.66) ? 3 : 4.5;
          if (r < seuil) out.add(`${r.toFixed(2)}:1 « ${t.slice(0, 30)} »`);
        }
        return [...out];
      })(),
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
    verifier(m.contrastes.length === 0, `${largeur}px · ${ecran} : tout texte visible atteint le contraste AA ${JSON.stringify(m.contrastes)}`);
    const sansAccents = MOTS_A_ACCENTS.filter(x => new RegExp("(^|[^\\p{L}])" + x + "($|[^\\p{L}])", "u").test(m.brut));
    verifier(sansAccents.length === 0, `${largeur}px · ${ecran} : aucun mot affiché sans ses accents ${JSON.stringify(sansAccents)}`);
    /* VOCABULAIRE (06/10/2026) : formulations internes relevees a l'audit et
       retirees ; elles ne doivent pas revenir. Un sigle d'aide peut rester dans
       une explication, jamais seul dans un titre. */
    const jargon = (m.brut.match(/non portée par le relevé|scrutins solennels relevés|années relevées|· aide (DPV|DSIL|DETR|DSID|FNADT)\b/gi) || []);
    verifier(jargon.length === 0, `${largeur}px · ${ecran} : aucune formulation interne ${JSON.stringify(jargon)}`);
  };

  /* L'ACCUEIL « CHEZ VOUS » : cinq questions, chacune avec sa source */
  const mesure = await mesurer();
  communs(mesure, "Chez vous");
  verifier(new RegExp(MAIRE).test(mesure.texte), `${largeur}px : le maire est nommé (${MAIRE})`);
  verifier(/Publication Repère du \d/.test(mesure.texte), `${largeur}px : la date de la publication affichée est dite`);
  verifier((mesure.etiquettes.match(/D'où vient cette information/g) || []).length >= 3, `${largeur}px : chaque réponse de l'accueil porte sa source`);
  /* 06/10/2026 : la barre sans legende a quitte ce premier ecran (elle reste,
     legendee, dans « Comprendre ce vote ») ; la repartition s'y lit desormais en
     toutes lettres, pour tous les lecteurs et pas seulement au lecteur d'ecran. */
  verifier(/a voté (pour|contre|l'abstention)/.test(mesure.texte) && /\d+ pour, \d+ contre, \d+ abstentions?/.test(mesure.texte),
    `${largeur}px : le vote du député s'affiche, et sa répartition se lit aussi en phrase`);
  verifier(/a dépensé [\d\s]+€ par habitant/.test(mesure.texte), `${largeur}px : l'argent de la commune se dit en une phrase`);
  /* 06/10/2026, vu sur capture a 360 px : « soit 47 » en fin de ligne, « % du
     coût » au debut de la suivante. Aucune espace secable devant % € ? ! : ; */
  const coupables = await page.evaluate(() => [...document.querySelectorAll('[data-testid="reponse"] [role="heading"]')]
    .map(e => e.textContent || "").filter(t => / [%€?!:;]/.test(t)));
  verifier(coupables.length === 0, `${largeur}px : aucun signe ne tombe seul en début de ligne ${JSON.stringify(coupables)}`);
  /* « Réponses d'abord » (30/09/2026) : une reponse, pas une rubrique ; jamais
     une donnee de presence, jamais « dernier ». */
  verifier(!/a participé|n'a pas participé|dernier vote/i.test(mesure.brut), `${largeur}px : aucune donnée de présence, aucun « dernier vote »`);
  /* Spike du 30/09/2026 : la source devient discrete, mais un calcul se dit
     calcul A L'OEIL (invariant 4), pas seulement dans la feuille. */
  verifier(/Calcul Repère/.test(mesure.texte), `${largeur}px : un chiffre calculé se dit calculé sans ouvrir la feuille`);
  verifier(/Ce qui arrive au Parlement/i.test(mesure.brut), `${largeur}px : la carte « ce qui arrive » est présente (ou sa phrase d'absence)`);
  const fautives = demandees.filter(u => adresseFautive(u));
  verifier(fautives.length === 0, `${largeur}px : aucune adresse ne porte un code de commune ${JSON.stringify(fautives)}`);
  verifier(!/77284/.test(page.url()), `${largeur}px : l'adresse de la page ne porte pas le code de la commune`);

  /* LA FEUILLE DE SOURCE (niveau 4) */
  await page.getByRole("button", { name: /D'où vient cette information/ }).first().click();
  await page.getByText("Comment Repère l'utilise").first().waitFor({ timeout: 5000 });
  const feuille = await page.evaluate(() => document.body.innerText);
  verifier(/Données publiées le \d/.test(feuille) && /↗/.test(feuille),
    `${largeur}px : une pastille ouvre la feuille de source : producteur, date, usage et lien vers la donnée originale`);
  verifier(/Traitées par Repère le \d/.test(feuille), `${largeur}px : la feuille distingue la date de la source de celle du traitement par Repère`);
  await page.getByRole("button", { name: "Fermer" }).first().click();
  await page.waitForTimeout(400);

  /* LES QUESTIONS SUIVANTES : trois depuis les reponses, deux depuis « Aller plus loin » */
  for (const [action, question, preuve] of [
    ["Où va cet argent ?", /Où va l'argent de Meaux/, /Sur 100 € dépensés, \d+ € vont aux salaires/],
    ["Comprendre ce vote", /Qu'a voté votre député/, /Le parcours d'une loi|Où en est ce texte/],
    ["Qui décide de quoi", /Qui décide pour Meaux/, /Décide : /],
    ["Ce qui arrive au Parlement", /Qu'est-ce qui arrive/, /concernent tout le pays/],
    ["D'où viennent ces informations", /Repère a traité ces fichiers/, /Repère a traité ces fichiers le \d.*Données publiées le \d.*Données relevées le \d/s],
  ]) {
    await page.getByRole("button", { name: action }).first().click();
    await page.getByText(question).first().waitFor({ timeout: 10000 });
    await page.waitForTimeout(800);
    const m = await mesurer();
    communs(m, action);
    verifier(preuve.test(m.brut), `${largeur}px · ${action} : l'écran répond à sa question`);
    if (!/informations/.test(action)) verifier(/D'où vient cette information/.test(m.etiquettes) || /Le calendrier n'est arrivé/.test(m.texte), `${largeur}px · ${action} : la source est à portée de doigt`);
    if (/argent/.test(action)) {
      verifier(/Calculé par Repère · source/.test(m.texte), `${largeur}px · ${action} : les parts calculées se disent calculées`);
      /* L'EXERCICE PRES DE CHAQUE CHIFFRE (06/10/2026) : sur telephone, un bloc
         financier se lit seul, loin du titre de l'ecran. Tout titre de bloc qui
         parle d'argent porte son annee ; la question de l'ecran (« … ? ») non. */
      const titres = await page.getByRole("heading").allInnerTexts();
      const sansAnnee = titres.map(t => t.trim()).filter(t => /dépens|argent|dette|jour|100 €|changé/i.test(t) && !/\?$/.test(t) && !/^l'argent de la commune$/i.test(t) && !/\b20\d\d\b/.test(t));
      verifier(sansAnnee.length === 0 && titres.some(t => /dette/i.test(t)), `${largeur}px · ${action} : chaque bloc financier porte son exercice ${JSON.stringify(sansAnnee)}`);
      await page.getByRole("button", { name: "Détails du calcul" }).first().click();
      await page.getByText(/ce n'est pas un chiffre publié/).first().waitFor({ timeout: 5000 });
      verifier(true, `${largeur}px · ${action} : le détail du calcul s'ouvre`);
    }
    await page.getByRole("button", { name: "Revenir à l'écran Chez vous" }).last().click();
    await page.getByText("Aller plus loin").first().waitFor({ timeout: 5000 });
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
  /* Depuis le spike du 30/09/2026, le compteur anime vit sur l'ecran « Où va l'argent ». */
  await page.getByRole("button", { name: "Où va cet argent ?" }).first().click();
  const cible = page.locator('[aria-label$="€ par jour"]').first();
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
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
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
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
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

/* RÉPONSES D'ABORD — 30/09/2026, etendu le 06/10/2026. Mesure sur les donnees
   de production avant cette extension : a 390 x 844, la troisieme reponse de
   Meaux finissait a 872 px (Creteil : 956) ; a 360 x 800, jusqu'a 1 098. Ce
   controle ne portait que sur Meaux a 390 px, et la CI le joue sur les donnees
   figees du depot : il etait vert pendant que la production echouait. Il porte
   maintenant sur trois ecrans et cinq profils de commune : projet a intitule
   long (Creteil), plusieurs circonscriptions (Paris), aucun projet
   (Amponville), maire au nom long, departements differents. */
{
  const ECRANS = [[360, 800], [390, 844], [430, 932]];
  const PROFILS = [["meaux", "Meaux"], ["creteil", "Créteil"], ["paris", "Paris"], ["amponville", "Amponville"], ["bagnolet", "Bagnolet"]];
  for (const [largeur, hauteur] of ECRANS) {
    const page = await navigateur.newPage({ viewport: { width: largeur, height: hauteur }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
    const hors = [];
    for (const [saisie, nom] of PROFILS) {
      await page.goto(BASE + "/", { waitUntil: "networkidle" });
      await page.getByLabel(/Où habitez-vous/).fill(saisie);
      await page.getByRole("button", { name: new RegExp("^" + nom + ",") }).first().click();
      await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
      await page.waitForTimeout(600);
      const bas = await page.evaluate(() => [...document.querySelectorAll('[data-testid="reponse"]')].filter(e => e.offsetParent).map(e => Math.round(e.getBoundingClientRect().bottom)));
      if (!(bas.length === 3 && bas.every(b => b <= hauteur))) hors.push(`${nom} ${JSON.stringify(bas)}`);
    }
    verifier(hors.length === 0, `${largeur} x ${hauteur} : les trois réponses tiennent dans le premier écran, pour ${PROFILS.length} communes ${JSON.stringify(hors)}`);
    await page.close();
  }
}

/* LE PARTAGE (06/10/2026) : un seul bouton, sous les reponses. Le message
   reprend les reponses avec leurs liens officiels ; il ne porte ni code de
   commune, ni identifiant, ni parametre de suivi, ni adresse de Repere. Le
   partage natif est remplace par un releve du message (navigateur de test). */
{
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  await ctx.addInitScript(() => { navigator.share = async d => { window.__partage = d; }; });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  verifier(await page.getByRole("button", { name: /^Partager/ }).count() === 1, "partage : un seul bouton sur l'écran de la commune");
  await page.getByRole("button", { name: `Partager ce qui se passe à ${COMMUNE.nom}` }).click();
  await page.waitForTimeout(300);
  const d = await page.evaluate(() => window.__partage || null);
  const texte = d ? [d.title, d.text, d.url].filter(Boolean).join("\n") : "";
  const liens = texte.match(/https?:\/\/\S+/g) || [];
  verifier(new RegExp(COMMUNE.nom).test(texte) && liens.length >= 2, `partage : la commune et ${liens.length} sources officielles`);
  verifier(!/77284|\b(?:\d{5}|2[AB]\d{3})\b/.test(texte.replace(/\d[\d   ]*\d\s?€/g, "")), "partage : aucun code de commune");
  verifier(!/utm_|[?&](ref|src|id)=|repereapp|netlify/i.test(texte), "partage : ni paramètre de suivi, ni adresse de Repère");
  verifier(liens.every(u => /^https:\/\/(www\.)?(data\.gouv\.fr|data\.ofgl\.fr|assemblee-nationale\.fr|data\.assemblee-nationale\.fr|www\.assemblee-nationale\.fr)\//.test(u)),
    `partage : chaque lien est celui d'une source officielle ${JSON.stringify(liens)}`);
  await ctx.close();
}

/* INVARIANT 9 — FRAICHEUR (30/09/2026). Serveur injoignable apres une premiere
   lecture : la donnee gardee reste lisible, mais l'ecran ne pretend pas qu'elle
   est a jour. En ligne, aucun bandeau : rien a signaler. */
{
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const ouvrir = async () => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
    await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
    await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(600);
    return { texte: await page.evaluate(() => document.body.innerText), bandeau: await page.getByTestId("fraicheur").count() };
  };
  const enLigne = await ouvrir();
  verifier(enLigne.bandeau === 0, "fraîcheur : en ligne, publication vérifiée, aucun bandeau");
  await ctx.route("**/data/**", r => r.abort("internetdisconnected"));
  const coupe = await ouvrir();
  verifier(coupe.bandeau === 1 && /n'a pas pu vérifier s'il existe une publication plus récente/.test(coupe.texte),
    "fraîcheur : serveur injoignable, l'écran dit que la publication n'a pas pu être vérifiée");
  verifier(new RegExp(MAIRE).test(coupe.texte), "fraîcheur : serveur injoignable, la donnée gardée reste lisible");
  verifier(!/Mis à jour/.test(coupe.texte), "fraîcheur : aucun « mis à jour » affiché quand rien n'a pu être vérifié");
  await ctx.close();
}

/* PLUSIEURS CIRCONSCRIPTIONS (06/10/2026). Mesure avant ce controle : a Paris
   (18 circonscriptions), « Comprendre ce vote » affirmait que le depute de la
   1re etait « votre député », et « Qui décide » le disait « pour votre
   circonscription ». Repere ne connait pas l'adresse du lecteur : il doit le
   dire, et laisser choisir. Les noms attendus sont lus dans les donnees. */
{
  const deputes = await (async () => { try { return (await (await fetch(BASE + "/data/deputes.json")).json()).deputes; } catch { return {}; } })();
  const nomDepute = k => deputes[k] ? [deputes[k].prenom, deputes[k].nom].filter(Boolean).join(" ") : null;
  const page = await navigateur.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill("paris");
  await page.getByRole("button", { name: /^Paris, Paris$/ }).click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Comprendre ce vote" }).first().click();
  await page.getByText(/Qu'a voté votre député/).first().waitFor({ timeout: 10000 });
  await page.waitForTimeout(500);
  let t = await page.evaluate(() => document.body.innerText);
  verifier(/que Repère ne connaît pas/.test(t) && !/Pourquoi c'est votre député/i.test(t) && /Comment trouver votre député/i.test(t),
    "plusieurs circonscriptions : l'écran du vote ne prétend pas connaître « votre » député");
  verifier(!/Élu par les électeurs/.test(t), "plusieurs circonscriptions : aucune formule accordée au masculin par défaut");
  const cinquieme = nomDepute("75-5");
  await page.getByRole("button", { name: "5e circonscription", exact: true }).click();
  await page.waitForTimeout(500);
  t = await page.evaluate(() => document.body.innerText);
  verifier(!!cinquieme && new RegExp(cinquieme.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(t) && /élu dans la 5e/.test(t),
    `plusieurs circonscriptions : choisir la 5e montre son député (${cinquieme})`);
  verifier(await page.getByRole("link", { name: /Trouver sa circonscription/ }).count() === 1, "plusieurs circonscriptions : un lien vers l'outil officiel pour trouver la sienne");
  await page.getByRole("button", { name: "Revenir à l'écran Chez vous" }).last().click();
  await page.getByRole("button", { name: "Qui décide de quoi" }).first().click();
  await page.getByText(/Qui décide pour Paris/).first().waitFor({ timeout: 10000 });
  t = await page.evaluate(() => document.body.innerText);
  verifier(/18 circonscriptions/i.test(t) && /circonscription \(exemple\)/.test(t) && !/pour votre circonscription/.test(t),
    "plusieurs circonscriptions : « Qui décide » dit que le député nommé est un exemple");
  /* une seule circonscription : la phrase « votre » reste juste */
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
  await page.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Comprendre ce vote" }).first().click();
  await page.getByText(/Pourquoi c'est votre député/i).first().waitFor({ timeout: 10000 });
  verifier(await page.getByRole("button", { name: /circonscription$/ }).count() === 0, "une seule circonscription : pas de sélecteur, « votre député » est juste");
  await page.close();
}

/* LE RESTE DE LA FRANCE (06/10/2026). Mesure en production avant ce controle :
   « ustaritz » repondait « Rien ne correspond », alors que son departement est
   publie (maire, comptes, circonscription, votes). Le controle refait le
   chemin d'un lecteur du Pays basque et d'un lecteur de Guadeloupe, et verifie
   les trois phrases qu'il ne faut pas confondre : les projets que Repere ne
   publie pas pour ce departement ne sont ni « pas arrivés » (panne) ni
   « aucun » (la source ne porte rien). Les noms attendus sont lus dans les
   donnees servies, jamais recopies ici. */
{
  const lireMaire = async (dep, insee) => {
    try { const j = await (await fetch(`${BASE}/data/departments/${dep}.json`)).json(); return j.communes[insee].maire.nom; } catch { return null; }
  };
  const echapper = t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const demandees = [];
  page.on("request", r => demandees.push(r.url()));
  await page.goto(BASE + "/", { waitUntil: "networkidle" });

  await page.getByLabel(/Où habitez-vous/).fill("st denis");
  verifier(await page.getByRole("button", { name: /^Saint-Denis, Seine-Saint-Denis$/ }).count() === 1, "national : « st denis » trouve Saint-Denis");

  await page.getByLabel(/Où habitez-vous/).fill("ustaritz");
  const texteRien = await page.evaluate(() => document.body.innerText);
  verifier(/Aucune commune d'Île-de-France ne correspond à « ustaritz »/.test(texteRien) && !/Rien ne correspond/.test(texteRien),
    "national : hors Île-de-France, la phrase dit où l'on a cherché");
  await page.getByRole("button", { name: "Choisir mon département" }).click();
  await page.getByLabel(/Dans quel département/).fill("pyrenees at");
  await page.getByRole("button", { name: /^Pyrénées-Atlantiques, 64$/ }).click();
  await page.getByLabel(/Quelle commune, dans Pyrénées-Atlantiques/).fill("ustaritz");
  await page.getByRole("button", { name: /^Ustaritz, Pyrénées-Atlantiques$/ }).waitFor({ timeout: 10000 });
  await page.getByRole("button", { name: /^Ustaritz, Pyrénées-Atlantiques$/ }).click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(600);
  const ustaritz = await page.evaluate(() => document.body.innerText);
  if (CAPTURES) await page.screenshot({ path: path.join(CAPTURES, "national-ustaritz.png"), fullPage: true });
  const maireU = await lireMaire("64", "64547");
  verifier(!!maireU && new RegExp(echapper(maireU)).test(ustaritz), `national : Ustaritz s'ouvre avec son maire (${maireU})`);
  verifier(/Les projets financés par l'État ne sont pas encore disponibles dans la bêta pour Pyrénées-Atlantiques/.test(ustaritz),
    "national : projets non publiés dits comme tels, département nommé");
  verifier(!/pas arrivés/.test(ustaritz) && !/Réessayer/.test(ustaritz) && !/Aucun projet financé/.test(ustaritz),
    "national : ni « pas arrivés », ni « Réessayer », ni « aucun projet » pour une donnée non publiée");
  verifier(/circonscription/.test(ustaritz) && /par habitant/.test(ustaritz), "national : le vote et les comptes s'affichent");
  const ordre = await page.evaluate(() => {
    const reps = [...document.querySelectorAll('[data-testid="reponse"]')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().top);
    const vide = [...document.querySelectorAll("div")].find(e => e.children.length === 0 && /^Les projets financés par l'État ne sont pas encore disponibles/.test(e.textContent || ""));
    return { reps, vide: vide ? vide.getBoundingClientRect().top : null };
  });
  verifier(ordre.vide !== null && ordre.reps.length >= 2 && ordre.reps.every(t => t < ordre.vide),
    `national : les réponses passent avant « non publié » ${JSON.stringify(ordre)}`);

  /* La memoire, hors Ile-de-France : le nom vient du fichier du departement. */
  await page.getByRole("button", { name: "Retenir Ustaritz sur ce téléphone" }).click();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const reprendre = page.getByRole("button", { name: "Voir ce qui se passe à Ustaritz" });
  await reprendre.waitFor({ timeout: 10000 }).catch(() => {});
  verifier(await reprendre.count() === 1, "national : Ustaritz retenue est reproposée à la réouverture");
  await page.getByRole("button", { name: "Oublier Ustaritz" }).click().catch(() => {});
  verifier(await page.evaluate(() => Object.keys(localStorage).length) === 0, "national : « Oublier » efface Ustaritz");

  /* Outre-mer : le departement a trois chiffres (97120 -> 971, pas 97). */
  await page.getByLabel(/Où habitez-vous/).fill("pointe a pitre");
  await page.getByRole("button", { name: "Choisir mon département" }).click();
  await page.getByLabel(/Dans quel département/).fill("971");
  await page.getByRole("button", { name: /, 971$/ }).click();
  await page.getByLabel(/Quelle commune, dans/).fill("pointe a pitre");
  await page.getByRole("button", { name: /^Pointe-à-Pitre,/ }).click();
  /* Avec un departement « 97 », le fichier n'existe pas : l'ecran n'arrive
     jamais. Le controle le nomme au lieu de tomber sur un delai depasse. */
  const ouverte = await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 }).then(() => true, () => false);
  verifier(ouverte, "national : Pointe-à-Pitre (971) ouvre son écran de commune");
  const pap = await page.evaluate(() => document.body.innerText);
  const maireP = await lireMaire("971", "97120");
  verifier(!!maireP && new RegExp(echapper(maireP)).test(pap), `national : Pointe-à-Pitre (971) s'ouvre avec son maire (${maireP})`);
  /* outre-mer : departement et region portent souvent le meme nom */
  verifier(!/Guadeloupe · Guadeloupe/.test(pap), "national : « Guadeloupe » n'est pas écrit deux fois dans l'en-tête");
  verifier(demandees.some(u => /\/departments\/971\.json/.test(u)) && !demandees.some(u => /\/departments\/97\.json/.test(u)),
    "national : l'outre-mer lit le fichier 971, jamais 97");
  const fautives = demandees.filter(u => adresseFautive(u) || /64547|97120/.test(u));
  verifier(fautives.length === 0, `national : aucune requête ne porte le code de la commune ${JSON.stringify(fautives)}`);
  await ctx.close();
}

/* DEPUIS VOTRE DERNIERE VISITE (06/10/2026). « Nouveau » = absent de la version
   que le telephone avait gardee. Le controle publie une « nouvelle generation »
   en reecrivant a la volee les fichiers servis (un vote solennel, les comptes
   2026, un projet) et verifie : premiere visite -> rien d'affirme ; meme
   publication -> « rien de nouveau » ; nouvelle publication -> exactement ces
   trois changements ; ensuite -> « rien de nouveau » ; donnees locales
   effacees -> rien d'affirme ; commune non retenue -> rien. Les fixtures sont
   des donnees de test, jamais publiees. */
{
  const brut = async f => (await fetch(BASE + "/data/" + f)).json();
  const pq77 = await brut("departments/77.json"), dep = await brut("deputes.json"), cat0 = await brut("scrutins.json");
  const circo = pq77.communes["77284"].circo;
  const ref = dep.deputes["77-" + circo].acteurRef;
  const nomDep = [dep.deputes["77-" + circo].prenom, dep.deputes["77-" + circo].nom].join(" ");
  const ctx = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const bloc = async () => {
    const n = await page.getByTestId("depuis-visite").count();
    return n ? (await page.getByTestId("depuis-visite").first().innerText()).replace(/[  ]/g, " ") : null;
  };
  const ouvrirMeaux = async (retenue) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    if (retenue) await page.getByRole("button", { name: "Voir ce qui se passe à Meaux" }).click();
    else { await page.getByLabel(/Où habitez-vous/).fill("meaux"); await page.getByRole("button", { name: /^Meaux,/ }).first().click(); }
    await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(600);
  };
  await ouvrirMeaux(false);
  verifier(await bloc() === null, "depuis la visite : non retenue, première visite -> rien n'est affirmé");
  await page.getByRole("button", { name: "Retenir Meaux sur ce téléphone" }).click();
  await ouvrirMeaux(true);
  verifier(/^Rien de nouveau depuis votre dernière visite\.$/.test(await bloc() || ""), "depuis la visite : même publication -> « Rien de nouveau depuis votre dernière visite »");

  /* NOUVELLE PUBLICATION */
  const scrutinNeuf = { ...cat0.scrutins[cat0.scrutins.length - 1], u: "VTANR5L17V99001", n: "99001", d: "2026-10-14", t: "l'ensemble du projet de loi de finances pour 2027 (première lecture)." };
  const projetNeuf = { annee: 2026, dispositif: "DSIL", intitule: "Fixture de test : rénovation d'une école", subvention: 123456, cout: 246912 };
  await ctx.route("**/data/**", async route => {
    const url = route.request().url();
    const rep = await route.fetch();
    let j; try { j = await rep.json(); } catch { return route.fulfill({ response: rep }); }
    if (/\/index\.json/.test(url) && j.build) j.build = { ...j.build, construit_le: "2099-01-01T00:00:00.000Z" };
    if (/\/scrutins\.json/.test(url)) j.scrutins = [...j.scrutins, scrutinNeuf];
    if (/\/scrutins\/77\.json/.test(url)) j.positions = { ...j.positions, 99001: { [ref]: "p" } };
    if (/\/departments\/77\.json/.test(url)) { const m = j.communes["77284"]; j.communes["77284"] = { ...m, comptes: { ...m.comptes, 2026: m.comptes[Object.keys(m.comptes).sort().pop()] } }; }
    if (/\/projets\/77\.json/.test(url)) j.communes = { ...j.communes, "77284": [...(j.communes["77284"] || []), projetNeuf] };
    return route.fulfill({ response: rep, json: j });
  });
  await ouvrirMeaux(true);
  const apres = await bloc() || "";
  if (CAPTURES) await page.screenshot({ path: path.join(CAPTURES, "depuis-visite-390.png"), fullPage: true });
  verifier(/^3 choses ont changé depuis votre dernière visite/.test(apres), `depuis la visite : nouvelle publication -> exactement 3 changements ${JSON.stringify(apres.slice(0, 60))}`);
  verifier(apres.includes("Le 14 octobre 2026, " + nomDep + " a voté pour") && /projet de loi de finances pour 2027/i.test(apres), `depuis la visite : le nouveau vote, daté, avec le député (${nomDep})`);
  verifier(/Les comptes 2026 de Meaux sont publiés/.test(apres) && /123 456 € pour « Fixture de test/.test(apres), "depuis la visite : les comptes 2026 et le nouveau projet");
  verifier(await page.getByTestId("depuis-visite").getByRole("button", { name: /D'où vient cette information/ }).count() >= 3,
    "depuis la visite : chaque changement porte sa source");
  await ouvrirMeaux(true);
  verifier(/^Rien de nouveau depuis votre dernière visite\.$/.test(await bloc() || ""), "depuis la visite : rouverte ensuite -> plus rien de « nouveau »");
  /* donnees locales effacees (le systeme a vide le cache) : la commune reste retenue, rien n'est affirme */
  await page.evaluate(() => new Promise(r => { const q = indexedDB.deleteDatabase("repere-donnees"); q.onsuccess = q.onerror = q.onblocked = () => r(); }));
  await ouvrirMeaux(true);
  verifier(await bloc() === null, "depuis la visite : données locales effacées -> ni « nouveau » ni « rien de nouveau »");
  /* une autre commune du meme departement, non retenue : rien */
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  /* une commune est retenue : la question affichee (et son libelle) devient « Une autre commune ? » */
  await page.getByLabel(/Une autre commune/).fill("chelles");
  await page.getByRole("button", { name: /^Chelles,/ }).first().click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  verifier(await bloc() === null, "depuis la visite : commune non retenue -> jamais « depuis votre dernière visite »");
  await ctx.close();
}

/* UN CALENDRIER QUI N'EST PLUS RELEVE (06/10/2026) : au-dela de deux jours, la
   date du releve est dite sur l'ecran. Attendu calcule sur la donnee servie
   (sur les donnees figees de la CI, le releve peut vraiment dater), puis force
   a dix jours. */
{
  const age = async ctx => {
    const p = await ctx.newPage();
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    await p.getByLabel(/Où habitez-vous/).fill(COMMUNE.saisie);
    await p.getByRole("button", { name: new RegExp("^" + COMMUNE.nom + ",") }).first().click();
    await p.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
    await p.getByRole("button", { name: "Ce qui arrive au Parlement" }).first().click();
    await p.getByText(/Qu'est-ce qui arrive/).first().waitFor({ timeout: 10000 });
    await p.waitForTimeout(600);
    const note = await p.getByTestId("releve-ancien").count() ? await p.getByTestId("releve-ancien").innerText() : null;
    await p.close();
    return note;
  };
  const releves = [];
  for (const f of ["agenda-an.json", "calendrier-senat.json"]) {
    try { const j = await (await fetch(BASE + "/data/" + f)).json(); if (j.source && j.source.releve_le) releves.push(j.source.releve_le.slice(0, 10)); } catch { /* absent */ }
  }
  const vieux = releves.length > 0 && releves.every(r => (Date.now() - Date.parse(r + "T00:00:00Z")) / 864e5 > 3);
  const frais = releves.some(r => (Date.now() - Date.parse(r + "T00:00:00Z")) / 864e5 < 2);
  const ctx1 = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const n1 = await age(ctx1); await ctx1.close();
  if (frais) verifier(n1 === null, `fraîcheur du calendrier : relevé récent (${releves.join(", ")}) -> aucune mise en garde`);
  else if (vieux) verifier(n1 !== null, `fraîcheur du calendrier : relevé ancien (${releves.join(", ")}) -> la date est dite`);
  /* Sans aucun calendrier servi (donnees figees de la CI : l'extraction ne les
     produit pas), il n'y a pas de releve a dater : l'ecran dit l'absence. */
  if (!releves.length) verifier(n1 === null, "fraîcheur du calendrier : aucun calendrier servi -> aucune date inventée");
  else {
  const ctx2 = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const dix = new Date(Date.now() - 10 * 864e5).toISOString().slice(0, 10);
  await ctx2.route(/\/data\/(agenda-an|calendrier-senat)\.json/, async route => {
    const rep = await route.fetch(); const j = await rep.json();
    return route.fulfill({ response: rep, json: { ...j, source: { ...(j.source || {}), releve_le: dix } } });
  });
  const n2 = await age(ctx2); await ctx2.close();
  verifier(!!n2 && /^Calendrier relevé le .* : des séances ont pu être ajoutées, déplacées ou annulées depuis\.$/.test(n2),
    `fraîcheur du calendrier : relevé vieux de dix jours -> la date est dite (${n2})`);
  }
}

/* TEXTE A 200 % (06/10/2026). Le rendu web ignore l'agrandissement du texte
   du systeme ; on l'approche en doublant la taille et l'interligne calcules de
   chaque element, puis on mesure : aucun debordement horizontal, aucun texte
   coupe par son conteneur (hors troncature voulue et hors zones de
   defilement, pleine largeur). Ce n'est pas un telephone : la verification
   sur appareil reste a faire (docs/mobile, checklist). */
{
  const page = await navigateur.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const agrandir = () => page.evaluate(() => {
    const mes = [...document.querySelectorAll("body *")].map(e => { const c = getComputedStyle(e); return [e, parseFloat(c.fontSize), c.lineHeight]; });
    for (const [e, fs, lh] of mes) { if (!fs) continue; e.style.fontSize = fs * 2 + "px"; if (lh && lh !== "normal") e.style.lineHeight = parseFloat(lh) * 2 + "px"; }
  });
  const mesurer = () => page.evaluate(() => {
    const coupes = [];
    for (const e of document.querySelectorAll("body *")) {
      const c = getComputedStyle(e);
      if (!e.innerText || !e.innerText.trim() || e.clientWidth >= window.innerWidth - 2) continue;
      if (c.webkitLineClamp && c.webkitLineClamp !== "none") continue;
      const cache = c.overflow === "hidden" || c.overflowX === "hidden" || c.overflowY === "hidden";
      if (cache && (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2) && !(c.textOverflow === "ellipsis" && e.innerText.trim().length > 60))
        coupes.push(e.innerText.trim().slice(0, 40));
    }
    return { deborde: document.documentElement.scrollWidth > window.innerWidth + 1, coupes: [...new Set(coupes)] };
  });
  for (const [saisie, nom] of [["creteil", "Créteil"], ["meaux", "Meaux"]]) {
    for (const ecran of [null, "Où va cet argent ?", "Comprendre ce vote", "Qui décide de quoi", "Ce qui arrive au Parlement", "D'où viennent ces informations"]) {
      await page.goto(BASE + "/", { waitUntil: "networkidle" });
      await page.getByLabel(/Où habitez-vous/).fill(saisie);
      await page.getByRole("button", { name: new RegExp("^" + nom + ",") }).first().click();
      await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
      if (ecran) { await page.getByRole("button", { name: ecran }).first().click(); await page.waitForTimeout(1200); }
      await page.waitForTimeout(400);
      await agrandir();
      const m = await mesurer();
      verifier(!m.deborde && m.coupes.length === 0, `texte à 200 % · ${nom} · ${ecran || "Chez vous"} : rien ne déborde, rien n'est coupé ${JSON.stringify(m.coupes)}`);
    }
  }
  await page.close();
}

/* LES ABSENCES REELLES (06/10/2026) : une commune par cause, choisie dans les
   donnees (releve du jour), et la phrase attendue lue dans @repere/core ou
   dans l'application, jamais recopiee. Mesure avant ce controle : a
   Saint-Pierre (975, comptes absents du fichier), « Chez vous » disait « ses
   comptes ne permettent pas de dire… » et « Où va l'argent » « ses comptes ne
   figurent pas dans le fichier officiel » — une cause, deux phrases. */
{
  const core = await import("../../../packages/core/src/index.js");
  const page = await navigateur.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  /* espaces insecables (typographie des reponses) ramenees a des espaces */
  const texte = async () => (await page.evaluate(() => document.body.innerText)).replace(/[  ]/g, " ");
  const parDepartement = async (dep, saisie, nom) => {
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.getByLabel(/Où habitez-vous/).fill(saisie);
    /* resultats franciliens ou non : le chemin vers le departement est toujours la */
    await page.getByRole("button", { name: /Choisir (mon|votre) département/ }).first().click();
    await page.getByLabel(/Dans quel département/).fill(dep);
    await page.getByRole("button", { name: new RegExp(", " + dep + "$") }).click();
    await page.getByLabel(/Quelle commune/).fill(saisie);
    if (!nom) { await page.waitForTimeout(1500); return; }
    await page.getByRole("button", { name: new RegExp("^" + nom + ",") }).first().click();
    await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(500);
  };
  /* comptes absents du fichier : la meme phrase sur les deux ecrans */
  await parDepartement("975", "saint pierre", "Saint-Pierre");
  const attendu = core.comptesAbsents("Saint-Pierre").titre;
  const chez = await texte();
  await page.getByRole("button", { name: "Pourquoi ?" }).first().click();
  await page.getByText(/Où va l'argent de Saint-Pierre/).first().waitFor({ timeout: 10000 });
  const argent = await texte();
  verifier(chez.includes(attendu) && argent.includes(attendu) && !/ne permettent pas de dire/.test(chez),
    `absences : comptes absents, une seule phrase sur « Chez vous » et « Où va l'argent » (« ${attendu} »)`);
  verifier(!/\b0 € par habitant/.test(chez + argent), "absences : un montant absent n'est jamais affiché comme zéro");
  /* commune absente de la table des circonscriptions : Repere ne devine pas */
  await parDepartement("12", "conques", "Conques-en-Rouergue");
  const conques = await texte();
  verifier(/Repère ne connaît pas la circonscription de Conques-en-Rouergue/.test(conques) && !/Votre commune est dans la/.test(conques),
    "absences : sans circonscription connue, Repère le dit et ne nomme aucun député");
  /* commune qui existe sans fiche dans le Repertoire */
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill("ville d'avray");
  await page.waitForTimeout(500);
  verifier(/Ville-d'Avray existe bien en Île-de-France : c'est nous qui n'avons pas encore sa fiche/.test(await texte()),
    "absences : une commune sans fiche existe bien, et l'écran le dit");
  await parDepartement("01", "arbent", null);
  verifier(/Arbent existe bien dans ce département : c'est nous qui n'avons pas encore sa fiche/.test(await texte()),
    "absences : hors Île-de-France aussi, une commune sans fiche n'est pas dite inexistante");
  /* intercommunalite absente du Repertoire : la source est incomplete, pas la commune */
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByLabel(/Où habitez-vous/).fill("amponville");
  await page.getByRole("button", { name: /^Amponville,/ }).first().click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Qui décide de quoi" }).first().click();
  await page.getByText(/Qui décide pour Amponville/).first().waitFor({ timeout: 10000 });
  verifier(/ne porte pas de délégué pour cette commune/.test(await texte()), "absences : intercommunalité absente du Répertoire, dite comme telle");
  await page.close();
}

await navigateur.close();
if (CAPTURES) console.log("captures : " + fs.readdirSync(CAPTURES).filter(f => f.endsWith(".png")).join(", "));
console.log(echecs ? `${echecs} échec(s)` : "parcours complet, zéro échec");
process.exit(echecs ? 1 : 0);
