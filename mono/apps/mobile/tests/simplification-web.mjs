/* SIMPLIFICATION UX DU 12/11/2026 : cinq contrôles dans un navigateur.
 *   - Accueil : une rangée de thèmes ; un thème ouvre la recherche filtrée (scrutins, questions au Gouvernement).
 *   - Quiz du dictionnaire : quatre propositions, une juste ; retour écrit (« Juste. » / « Pas tout à fait. ») ;
 *     la série monte puis retombe à la première erreur ; rien n'est enregistré ; l'ordre change d'une ouverture à l'autre.
 *   - Fiche d'élu : la barre des derniers votes ; sans position, le bouton « Demander à cet élu » (mailto sans destinataire).
 *   - Questions au Gouvernement : le compteur du mois, calculé sur le relevé.
 * Les questions au Gouvernement sont des DONNÉES D'ESSAI injectées ici (page.route), jamais réelles.
 * Usage : node apps/mobile/tests/simplification-web.mjs http://localhost:8811 [dossier de captures] */
import { createRequire } from "node:module";
import { GLOSSAIRE } from "../../../packages/core/src/index.js";
import { definitionCourte } from "../src/lib/quiz.js";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };

const jourParis = d => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const AUJ = jourParis(new Date());
const SOURCE = { producteur: "Assemblée nationale (ESSAI)", licence: "Licence Ouverte 2.0", url: "https://data.assemblee-nationale.fr/", producteur_affiche: "Assemblée nationale — Questions au Gouvernement (ESSAI)", releve_le: AUJ };
const ministeres = ["Ministère de la Santé (ESSAI)", "Ministère de l'Éducation nationale (ESSAI)", "Ministère des Transports (ESSAI)", "Ministère de la Santé (ESSAI)", "Ministère de la Santé (ESSAI)"];
const QS = ministeres.map((m, i) => ({ uid: "QAG" + i, n: String(i + 1), d: AUJ, auteur: { ref: null, nom: "Député d'essai" }, groupe: { nom: "Groupe d'essai", abrege: null, couleur: null }, ministere: m, url: "https://www.assemblee-nationale.fr/dyn/17/questions/QAG" + i, lot: 0 }));

const navigateur = await chromium.launch();
const nouveau = async (positionsVides = false) => {
  const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await contexte.route("**/data/questions-gouvernement-index.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ v: 1, source: SOURCE, total: QS.length, taille_lot: 64, questions: QS }) }));
  await contexte.route("**/data/questions-gouvernement/0000.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ v: 1, source: SOURCE, lot: 0, questions: QS.map(q => ({ ...q, question: "ESSAI — question", reponse: "ESSAI — réponse." })) }) }));
  if (positionsVides) {
    /* Aucune position de député : le vide est réel, le bouton d'action doit apparaître. */
    await contexte.route("**/data/scrutins/*.json", async r => {
      const rep = await r.fetch(); const j = await rep.json();
      return r.fulfill({ response: rep, body: JSON.stringify({ ...j, positions: {} }) });
    });
  }
  const page = await contexte.newPage();
  const erreurs = [];
  page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));
  return { contexte, page, erreurs };
};
const choisirCommune = async (page, nom) => {
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  if (!(await page.getByLabel(/Où habitez-vous/).isVisible().catch(() => false))) await page.getByRole("button", { name: "Chercher une commune" }).first().click();
  await page.getByLabel(/Où habitez-vous/).fill(nom);
  await page.getByRole("button", { name: new RegExp("^" + nom + ",") }).first().click();
  await page.getByText("Question 4 sur 4", { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: /^Passer/ }).click();
  await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });
};
const photo = async (page, nom) => { if (CAP) await page.screenshot({ path: `${CAP}/${nom}.png` }); };

/* ───── 1. Accueil : les thèmes ───── */
{
  const { contexte, page, erreurs } = await nouveau();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Thème Santé/ }).waitFor({ timeout: 15000 });
  const themes = await page.getByRole("button", { name: /^Thème / }).count();
  verifier(themes >= 7, `accueil : une rangée de thèmes (${themes})`);
  await photo(page, "1-accueil-themes");
  await page.getByRole("button", { name: /^Thème Santé/ }).click();
  await page.getByText("Thème « Santé »", { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByText("Questions au Gouvernement", { exact: false }).first().waitFor({ timeout: 15000 });
  verifier(await page.getByRole("button", { name: /Thème Santé, choisi/ }).count() === 1, "recherche : le thème choisi est marqué");
  verifier(await page.getByText("Ministère de la Santé (ESSAI)", { exact: false }).count() >= 1, "recherche : les questions du thème sont listées");
  verifier(await page.getByText("Ministère de l'Éducation nationale (ESSAI)", { exact: false }).count() === 0, "recherche : les questions d'un autre thème sont filtrées");
  verifier(await page.getByText("Les communes et les élus ne sont pas rangés par thème", { exact: false }).count() === 1, "recherche : le thème dit ce qu'il ne range pas");
  await photo(page, "1b-recherche-theme");
  await page.getByRole("button", { name: /Thème Santé, choisi/ }).click();
  verifier(await page.getByText("Tapez le nom d'une commune", { exact: false }).count() === 1, "recherche : retirer le thème rend la recherche libre");
  verifier(erreurs.length === 0, "accueil : aucune erreur JavaScript" + (erreurs[0] ? " : " + erreurs[0] : ""));
  await contexte.close();
}

/* ───── 2. Quiz du dictionnaire ───── */
{
  const { contexte, page, erreurs } = await nouveau();
  const titres = Object.values(GLOSSAIRE).map(m => m.titre);
  const bonneDe = enonce => { const m = enonce.match(/« (.+) »/); const e = Object.values(GLOSSAIRE).find(x => x.titre === m[1]); return definitionCourte(e.corps); };
  const premiereQuestion = async () => {
    await page.goto(BASE + "/dictionnaire", { waitUntil: "networkidle" });
    await page.getByRole("radio").first().waitFor({ timeout: 15000 });
    return (await page.getByRole("heading").filter({ hasText: /^Qu'est-ce que/ }).first().innerText()).trim();
  };
  const ordres = new Set();
  for (let i = 0; i < 4; i++) ordres.add(await premiereQuestion());
  verifier(ordres.size >= 2, `quiz : l'ordre change d'une ouverture à l'autre (${ordres.size} questions différentes sur 4 ouvertures)`);
  const enonce = await premiereQuestion();
  verifier(await page.getByRole("radio").count() === 4, "quiz : quatre propositions");
  verifier(await page.getByText("Série : à vous de jouer").count() === 1, "quiz : la série part de zéro");
  await photo(page, "2-quiz-question");
  const bonne = bonneDe(enonce);
  const radios = page.getByRole("radio");
  let iBonne = -1;
  for (let i = 0; i < 4; i++) if ((await radios.nth(i).getAttribute("aria-label"))?.includes(bonne)) iBonne = i;
  verifier(iBonne >= 0, "quiz : la définition du dictionnaire est l'une des quatre");
  await radios.nth(iBonne).click();
  await page.getByText("Juste.", { exact: true }).waitFor({ timeout: 5000 });
  verifier(await page.getByText("1 réponse juste d'affilée").count() >= 1, "quiz : une réponse juste, la série passe à 1");
  verifier(await page.getByRole("link", { name: "Les sources de Repère" }).count() === 1, "quiz : le retour renvoie aux sources");
  verifier(await page.getByText("Définition rédigée par Repère", { exact: false }).count() === 1, "quiz : le retour dit d'où vient la définition");
  await photo(page, "2b-quiz-juste");
  await page.getByRole("button", { name: "Question suivante" }).click();
  await page.getByText("Une seule définition est la bonne.").waitFor({ timeout: 5000 });
  const enonce2 = (await page.getByRole("heading").filter({ hasText: /^Qu'est-ce que/ }).first().innerText()).trim();
  verifier(enonce2 !== enonce, "quiz : la question suivante est une autre");
  const b2 = bonneDe(enonce2);
  let iFausse = -1;
  for (let i = 0; i < 4; i++) if (!(await radios.nth(i).getAttribute("aria-label"))?.includes(b2)) { iFausse = i; break; }
  await radios.nth(iFausse).click();
  await page.getByText("Pas tout à fait.", { exact: true }).waitFor({ timeout: 5000 });
  verifier(await page.getByText("Ce que vous avez choisi définit", { exact: false }).count() === 1, "quiz : une erreur reçoit une explication neutre");
  verifier(await page.getByText("Série : à vous de jouer").count() >= 1, "quiz : la série retombe à zéro à la première erreur");
  await photo(page, "2c-quiz-erreur");
  const cles = await page.evaluate(() => Object.keys(localStorage).concat(Object.keys(sessionStorage)));
  verifier(!cles.some(k => /quiz|serie|série|streak|score/i.test(k)), "quiz : rien n'est enregistré sur l'appareil (invariant 2)");
  verifier(await page.getByText(/bonne réponse|mauvaise réponse|bravo|score/i).count() === 0, "quiz : aucun vocabulaire de récompense ni de score");
  await page.getByRole("tab", { name: "Les mots" }).click();
  verifier(await page.getByLabel("Rechercher un mot du dictionnaire").first().isVisible(), "dictionnaire : la liste des mots reste à un geste");
  verifier(erreurs.length === 0, "quiz : aucune erreur JavaScript" + (erreurs[0] ? " : " + erreurs[0] : ""));
  await contexte.close();
}

/* ───── 3. Fiche d'élu : la barre des derniers votes ───── */
{
  const { contexte, page, erreurs } = await nouveau();
  await choisirCommune(page, "Melun");
  await page.getByText("Qui décide", { exact: true }).last().click();
  await page.getByText("Qui décide pour", { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByRole("link", { name: /^Voir la fiche de .*, À l'Assemblée nationale/ }).first().click();
  await page.getByText("derniers votes publiés", { exact: false }).first().waitFor({ timeout: 15000 });
  const barre = await page.getByLabel(/derniers votes publiés\. Calcul Repère/).count();
  verifier(barre >= 1, "fiche d'élu : la barre des derniers votes est là, annoncée comme un calcul Repère");
  verifier(await page.getByText("Repère ne retrouve pas", { exact: false }).count() === 0, "fiche d'élu : plus de « Repère ne retrouve pas »");
  await page.getByText("derniers votes publiés", { exact: false }).first().scrollIntoViewIfNeeded();
  await photo(page, "3-fiche-votes");
  verifier(erreurs.length === 0, "fiche d'élu : aucune erreur JavaScript" + (erreurs[0] ? " : " + erreurs[0] : ""));
  await contexte.close();
}

/* ───── 4. Fiche d'élu sans position : l'action citoyenne ───── */
{
  const { contexte, page, erreurs } = await nouveau(true);
  await choisirCommune(page, "Melun");
  await page.getByText("Qui décide", { exact: true }).last().click();
  await page.getByText("Qui décide pour", { exact: false }).first().waitFor({ timeout: 15000 });
  await page.getByRole("link", { name: /^Voir la fiche de .*, À l'Assemblée nationale/ }).first().click();
  const bouton = page.getByRole("button", { name: /^Demander à .* de publier ses votes/ });
  await bouton.waitFor({ timeout: 15000 });
  verifier(await bouton.count() === 1, "fiche d'élu sans position : le bouton « Demander à cet élu de publier ses votes »");
  verifier(await page.getByText("Repère n'envoie rien et ne garde rien", { exact: false }).count() === 1, "fiche d'élu sans position : le bouton dit que Repère n'envoie rien");
  await bouton.scrollIntoViewIfNeeded();
  await photo(page, "4-fiche-demande");
  await contexte.close();
  verifier(erreurs.length === 0, "action citoyenne : aucune erreur JavaScript" + (erreurs[0] ? " : " + erreurs[0] : ""));
}

/* ───── 5. Questions au Gouvernement : le compteur ───── */
{
  const { contexte, page, erreurs } = await nouveau();
  await page.goto(BASE + "/scrutins?mode=qag", { waitUntil: "networkidle" });
  await page.getByText("Questions récentes").waitFor({ timeout: 15000 });
  await page.waitForTimeout(900);
  verifier(await page.getByLabel(/^5 questions posées au Gouvernement en .*Calcul Repère/).count() === 1, "questions : le compteur du mois, calculé sur le relevé (5 questions d'essai)");
  verifier(await page.getByText("Calcul Repère sur le relevé de l'Assemblée nationale.", { exact: true }).count() >= 1, "questions : le compteur s'annonce comme un calcul");
  await page.getByText("Questions récentes").scrollIntoViewIfNeeded();
  await photo(page, "5-questions-compteur");
  verifier(erreurs.length === 0, "questions : aucune erreur JavaScript" + (erreurs[0] ? " : " + erreurs[0] : ""));
  await contexte.close();
}

await navigateur.close();
console.log(echecs ? `simplification : ${echecs} échec(s)` : "simplification : zéro échec");
process.exit(echecs ? 1 : 0);
