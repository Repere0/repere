// Le quiz a son propre écran, atteignable depuis l'accueil (12/11/2026). Usage : node apps/mobile/tests/quiz-ecran-web.mjs http://localhost:8811
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };
const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false })));
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.getByRole("link", { name: /Testez votre culture civique/ }).first().click();
await page.getByRole("radio").first().waitFor({ timeout: 15000 });
ok(/\/quiz$/.test(page.url()), "la carte de l'accueil ouvre /quiz (" + page.url() + ")");
ok(await page.getByRole("radio").count() === 4, "quatre propositions");
ok(await page.getByRole("progressbar").count() === 1, "une barre de progression");
/* ─── 13/11/2026 (ADR 0010) : points et rangs, dans repere.profil et nulle part ailleurs ─── */
ok((await page.getByTestId("quiz-rang-nom").innerText()).trim() === "Néo-citoyen", "on commence Néo-citoyen");
ok((await page.getByTestId("quiz-points").innerText()).trim() === "0 pts", "on commence à zéro point");
ok((await page.getByTestId("quiz-serie").innerText()).trim() === "0", "la série part de zéro, en mémoire");
ok((await page.getByTestId("quiz-rang").innerText()).trim() === "1/5", "progression : 1/5");
/* Tout sur un écran : la dernière carte et la place du bouton finissent dans les 844 px, et rien ne défile. */
const defile = await page.evaluate(() => Math.max(...[...document.querySelectorAll("*")].map(e => e.scrollHeight - e.clientHeight)));
ok(defile <= 1, "un seul écran : rien ne défile (dépassement " + defile + " px)");
ok(await page.getByRole("button", { name: /Question suivante|Voir le résultat/ }).count() === 0, "« Question suivante » n'existe pas avant la réponse");
const boites = []; for (let i = 0; i < 4; i++) boites.push(await page.getByRole("radio").nth(i).boundingBox());
ok(boites.every((b, i) => b.height >= 44 && (i === 0 || b.y > boites[i - 1].y) && Math.abs(b.x - boites[0].x) < 1), "quatre cartes empilées, de 44 px au moins");
await page.getByRole("radio").first().click();
const suite = page.getByRole("button", { name: "Question suivante" });
await suite.waitFor({ timeout: 5000 });
const bs = await suite.boundingBox();
ok(bs.y + bs.height <= 844, "après la réponse : « Question suivante » est à l'écran sans défiler (bas à " + Math.round(bs.y + bs.height) + " px)");
const vert = await page.getByTestId("quiz-carte-juste").evaluate(e => getComputedStyle(e).backgroundColor);
ok(vert === "rgb(74, 124, 89)", "la bonne réponse passe au vert du quiz (" + vert + ")");
const rouges = page.getByTestId("quiz-carte-faux");
if (await rouges.count()) ok(await rouges.first().evaluate(e => getComputedStyle(e).backgroundColor) === "rgb(170, 74, 74)", "la réponse fausse passe au rouge du quiz");
ok(await page.getByTestId("quiz-carte-juste").getByText("Juste", { exact: true }).count() === 1, "la couleur n'est pas seule : « Juste » est écrit sur la carte");
if (process.argv[3]) await page.screenshot({ path: process.argv[3] + "/quiz-repondu.png" });
/* Une manche de cinq questions, puis le résultat, qui ne quitte pas l'écran. */
for (let i = 0; i < 4; i++) { await page.getByRole("button", { name: "Question suivante" }).click(); await page.getByRole("radio").first().click(); }
await page.getByRole("button", { name: "Voir le résultat" }).click();
await page.getByText("Manche terminée").first().waitFor({ timeout: 5000 });
ok(await page.getByRole("heading", { name: /^\d réponses? justes? sur 5$/ }).count() === 1, "fin de manche : le nombre de réponses justes sur 5");
ok(await page.getByRole("button", { name: "Nouvelle manche" }).count() === 1, "fin de manche : « Nouvelle manche »");
const bilan = (await page.getByTestId("quiz-bilan").innerText()).replace(/\s+/g, " ");
ok(/\d+ points gagnés/.test(bilan) && /Vous êtes (Néo-citoyen|Citoyen|Super Citoyen|Sage)/.test(bilan), "fin de manche : les points et le rang (« " + bilan.trim() + " »)");
/* Le test répond au hasard (première carte) : on compare donc les points au nombre de justes annoncé. */
const justes = Number((await page.getByRole("heading", { name: /réponses? justes? sur 5/ }).innerText()).match(/^(\d+)/)[1]);
const profil = await page.evaluate(() => JSON.parse(localStorage.getItem("repere.profil") || "null"));
ok(profil && profil.points === justes * 10, `${justes} réponse(s) juste(s) = ${justes * 10} points dans repere.profil (${profil && profil.points})`);
const apres = await page.evaluate(() => Object.keys(localStorage).concat(Object.keys(sessionStorage)));
ok(apres.every(k => ["repere.departement", "repere.profil"].includes(k)), "aucune clé de stockage en plus pour les points (invariant 2) : " + apres.join(","));
ok(await page.getByRole("button", { name: /^Partager mon rang/ }).count() === 1, "fin de manche : le partage du rang");
/* La gamification ne doit JAMAIS déborder sur un vote, un élu, un parti ou une commune. */
const texte = (await page.locator("body").innerText()).toLowerCase();
for (const mot of ["classement", "palmarès", "meilleur", "score de vote", "bonne réponse", "mauvaise réponse", "tu as gagné"]) {
  ok(!texte.includes(mot), `aucun mot de classement ni de récompense à l'écran : « ${mot} »`);
}

const cles = await page.evaluate(() => Object.keys(localStorage));
ok(cles.every(k => ["repere.departement", "repere.profil"].includes(k)), "aucune clé de stockage en plus (" + cles.join(",") + ")");
await page.goto(BASE + "/dictionnaire", { waitUntil: "networkidle" });
await page.getByLabel("Rechercher un mot du dictionnaire").first().waitFor({ timeout: 15000 });
ok(await page.getByRole("radio").count() === 0, "le dictionnaire ne contient plus le quiz");
await nav.close();
console.log(echecs ? `quiz : ${echecs} échec(s)` : "quiz : zéro échec");
process.exit(echecs ? 1 : 0);
