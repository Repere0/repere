/* POLISSAGE DU 12/11/2026 : quatre écrans, des contrôles.
 *   - Qui décide : le préfet est une carte comme les autres élus ; la source est repliée (accordéon).
 *   - Hémicycle : un point par député, ombre et reflet ; le groupe touché est mis en avant.
 *   - Questions au Gouvernement : l'essentiel d'abord (calcul Repère), « Lire la réponse complète » ;
 *     question absente : « Question non disponible dans les données ouvertes ».
 *   - Présidentielle : les règles AVANT les candidats ; chaque candidature déclarée porte son badge ; la note dit la vérité.
 * Les fichiers de l'hémicycle et des questions sont des DONNÉES D'ESSAI injectées ici (page.route), jamais réelles.
 * Usage : node apps/mobile/tests/final-polish-web.mjs http://localhost:8811 [dossier de captures] */
import { createRequire } from "node:module";
import fs from "node:fs";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };

const REPARTITION = { RN: 123, LFI: 71, EPR: 91, SOC: 66, LR: 49, DEM: 36, HOR: 34, "LÉ": 38, GDR: 17, LIOT: 22, NI: 28 };
const groupes = {}; let k = 0;
for (const [g, n] of Object.entries(REPARTITION)) for (let i = 0; i < n; i++) groupes["PA" + String(++k).padStart(5, "0")] = { groupe: g };
const SOURCE = { producteur: "Assemblée nationale (ESSAI)", licence: "Licence Ouverte 2.0", url: "https://data.assemblee-nationale.fr/", producteur_affiche: "Assemblée nationale — Questions au Gouvernement (ESSAI)", releve_le: "2026-11-12" };
const REPONSE = "Monsieur le député, merci pour votre question. Le Gouvernement a décidé de porter à 1 200 euros par an l'aide à la rénovation des logements anciens. " +
  "Cette aide s'adresse aux ménages modestes et aux propriétaires occupants, selon le décret n° 2026-12. " +
  "Elle sera versée par l'Agence nationale de l'habitat, sans avance de frais pour les ménages modestes. " +
  "Le ministre a rappelé ce calendrier devant la commission. Nous poursuivrons le dialogue avec les collectivités. " +
  "Les dossiers déposés avant le 1er janvier seront instruits en priorité par l'Agence nationale de l'habitat.";
const q = (uid, n, question) => ({ uid, n, d: "2026-11-10", auteur: { ref: null, nom: "Député d'essai" }, groupe: { nom: "Groupe d'essai", abrege: null, couleur: "#6B7280" }, ministere: "Ministère d'essai", url: "https://www.assemblee-nationale.fr/dyn/17/questions/" + uid, lot: 0 });
const QS = [q("QAG1", "1"), q("QAG2", "2")];

const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await contexte.route("**/data/deputes-groupes.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
  source: { producteur: "Assemblée nationale (ESSAI)", licence: "Licence Ouverte 2.0", url: "https://data.assemblee-nationale.fr/" }, genere_le: "2026-11-12", groupes }) }));
await contexte.route("**/data/questions-gouvernement-index.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ v: 1, source: SOURCE, total: 2, taille_lot: 64, questions: QS }) }));
await contexte.route("**/data/questions-gouvernement/0000.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ v: 1, source: SOURCE, lot: 0, questions: [
  { ...QS[0], question: null, reponse: "Le Gouvernement est favorable. Un décret suivra." },
  { ...QS[1], question: "ESSAI — Quelles aides sont prévues pour la rénovation des logements anciens ?", reponse: REPONSE, reponsePublieeLe: "2026-11-11" }] }) }));
/* Présidentielle : les fichiers PUBLIÉS du dépôt (data/presidentielle-2027), servis par le test, car en CI les données
   viennent du fichier autonome, sans eux. Lire le vrai fichier garde aussi ses règles (deux sources par candidature). */
const PUB = import.meta.dirname + "/../../../../data/presidentielle-2027/";
const lire = f => fs.readFileSync(PUB + f + ".json", "utf8");
await contexte.route("**/data/presidentielle-2027/*.json", r => {
  const nom = r.request().url().split("/").pop().split("?")[0].replace(".json", "");
  return r.fulfill({ status: 200, contentType: "application/json", body: ["candidats", "debats", "meetings", "meta"].includes(nom) ? lire(nom) : "{}" });
});
const page = await contexte.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));
const photo = async nom => { if (CAP) await page.screenshot({ path: `${CAP}/${nom}.png` }); };

/* La commune se choisit comme un lecteur : aucune clé de stockage écrite ici. */
await page.goto(BASE + "/", { waitUntil: "networkidle" });
if (!(await page.getByLabel(/Où habitez-vous/).isVisible().catch(() => false))) await page.getByRole("button", { name: "Chercher une commune" }).first().click();
await page.getByLabel(/Où habitez-vous/).fill("Paris");
await page.getByRole("button", { name: /^Paris,/ }).first().click();
await page.getByText("Question 4 sur 4", { exact: false }).first().waitFor({ timeout: 15000 });
await page.getByRole("button", { name: /^Passer/ }).click();
await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });

/* 1. Qui décide : le préfet en carte */
await page.getByText("Qui décide", { exact: true }).last().click();
await page.getByText("Qui décide pour", { exact: false }).first().waitFor({ timeout: 15000 });
const carte = page.getByRole("link", { name: /Voir la fiche de .*, préfet de la région/ });
verifier(await carte.count() === 1, "qui décide : le préfet est une carte cliquable");
await carte.scrollIntoViewIfNeeded();
verifier(await page.getByText("Préfet de région", { exact: true }).count() >= 1, "qui décide : le titre « Préfet de région » est écrit");
verifier(await page.getByText("Ce n'est pas le préfet de votre département", { exact: false }).count() === 1, "qui décide : la précision « pas le préfet de votre département » reste visible");
verifier(await page.getByText("Dernier contrôle réussi", { exact: false }).count() === 0, "qui décide : la source est repliée");
await page.getByRole("button", { name: "Source et contrôle" }).click();
verifier(await page.getByText("Dernier contrôle réussi", { exact: false }).count() === 1, "qui décide : l'accordéon ouvre la source");
verifier(await page.getByRole("link", { name: /préfecture de région \(site officiel\)/ }).count() === 1, "qui décide : le lien de la source reste cliquable");
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(300);
await photo("1-prefet");

/* 2. Hémicycle */
await page.goto(BASE + "/scrutins", { waitUntil: "networkidle" });
await page.getByText("La composition de l'Assemblée").first().waitFor({ timeout: 15000 });
await page.waitForTimeout(900);
verifier(await page.getByRole("button", { name: /^RN, 123 députés/ }).count() === 1, "hémicycle : la légende porte les groupes et leurs sièges");
const points = await page.evaluate(() => [...document.querySelectorAll("div")].filter(d => d.style.position === "absolute" && d.style.width && d.style.width === d.style.height && parseFloat(d.style.width) < 20 && d.style.borderRadius).length);
verifier(points >= 570, `hémicycle : un point par député (${points})`);
const ombres = await page.evaluate(() => [...document.querySelectorAll("div")].filter(d => d.style.position === "absolute" && d.style.borderRadius && parseFloat(d.style.width) < 20 && /rgba?\(/.test(getComputedStyle(d).boxShadow || "")).length);
verifier(ombres >= 500, `hémicycle : les points portent une ombre (${ombres})`);
await page.getByText("La composition de l'Assemblée").first().scrollIntoViewIfNeeded();
await photo("2-hemicycle");
await page.getByRole("button", { name: /^LFI, 71 députés/ }).click();
await page.waitForTimeout(250);
verifier(await page.getByRole("link", { name: /Voir la liste des députés du groupe LFI/ }).count() === 1, "hémicycle : toucher un groupe le met en avant");
await page.getByText("La composition de l'Assemblée").first().scrollIntoViewIfNeeded();
await photo("2b-hemicycle-groupe");

/* 3. Questions au Gouvernement (la dernière question est choisie d'office : la n° 2, avec sa longue réponse) */
await page.goto(BASE + "/scrutins?mode=qag", { waitUntil: "networkidle" });
await page.getByText("Réponse du Gouvernement").first().waitFor({ timeout: 15000 });
verifier(await page.getByText("résumé automatique", { exact: false }).count() >= 1, "questions : l'essentiel est annoncé comme un résumé automatique");
verifier(await page.getByText("Calcul Repère", { exact: false }).count() >= 1, "questions : le résumé s'annonce comme un calcul (invariant 4)");
verifier(await page.getByText("1 200 euros par an", { exact: false }).count() >= 1, "questions : la phrase au chiffre est retenue, recopiée");
verifier(await page.getByText("Monsieur le député, merci", { exact: false }).count() === 0, "questions : la politesse n'est pas dans le résumé");
await page.getByText("Réponse du Gouvernement").first().scrollIntoViewIfNeeded();
await photo("3-questions");
await page.getByRole("button", { name: "Lire la réponse complète" }).click();
verifier(await page.getByText("Monsieur le député, merci", { exact: false }).count() >= 1, "questions : « Lire la réponse complète » montre tout le texte");
await page.getByRole("button", { name: /n° 1/ }).first().click();
await page.waitForTimeout(300);
verifier(await page.getByText("Question non disponible dans les données ouvertes", { exact: true }).count() >= 1, "questions : question absente = « Question non disponible dans les données ouvertes »");

/* 4. Présidentielle */
await page.goto(BASE + "/presidentielle-2027", { waitUntil: "networkidle" });
await page.getByText("Les règles du scrutin", { exact: true }).first().waitFor({ timeout: 15000 });
const haut = async t => page.getByText(t, { exact: true }).first().evaluate(e => e.getBoundingClientRect().top + window.scrollY);
verifier(await haut("Les règles du scrutin") < await haut("Candidats, débats, réunions"), "présidentielle : les règles viennent avant les candidats");
const badges = await page.getByText("Déclaration de candidature", { exact: true }).count();
verifier(badges >= 20, `présidentielle : chaque candidature déclarée porte le badge (${badges})`);
verifier(await page.getByText("Liste des candidatures déclarées. La liste officielle sera arrêtée par le Conseil constitutionnel en 2027.", { exact: false }).count() === 1, "présidentielle : la note dit que la liste n'est pas officielle");
verifier(await page.getByText("a publié la liste", { exact: false }).count() === 0, "présidentielle : l'étape ne prétend pas que la liste officielle est publiée");
const noms = await page.evaluate(() => [...document.querySelectorAll("[role=link],div")].map(e => e.textContent).filter(t => /^(Nathalie Arthaud|Éric Zemmour)/.test(t || "")).length);
verifier(noms >= 2, "présidentielle : les candidats déclarés sont affichés");
await page.getByRole("button", { name: /Sources de la candidature de Nathalie Arthaud/ }).click();
verifier(await page.getByRole("link", { name: /Source : LCP/ }).count() >= 1 && await page.getByRole("link", { name: /Source : Toute l'Europe/ }).count() >= 1, "présidentielle : les deux sources d'une candidature sont à un geste");
await page.getByText("Candidats, débats, réunions", { exact: true }).first().scrollIntoViewIfNeeded();
await photo("4-presidentielle");
await page.evaluate(() => window.scrollTo(0, 0));

verifier(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await navigateur.close();
console.log(echecs ? `polissage : ${echecs} échec(s)` : "polissage : zéro échec");
process.exit(echecs ? 1 : 0);
