/* ACCUEIL : NOUVELLE HIÉRARCHIE (14/11/2026, porteur, après le test iPhone).
 * De haut en bas : Bonjour (34 px), sous-titre, RECHERCHE, quiz, quatre accès 2x2, six thèmes. Plus de « Décideurs du quotidien ».
 * Pendant une recherche, l'accueil se retire : les résultats viennent sous le champ.
 * Usage : node apps/mobile/tests/accueil-refonte-web.mjs http://localhost:8811 [dossier-captures] */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));
await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ prenom: "Zoé", animationsReduites: true })));
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.getByTestId("bonjour").waitFor({ timeout: 15000 });
const y = async loc => (await loc.first().boundingBox()).y;
const bonjour = page.getByTestId("bonjour");
verifier((await bonjour.innerText()).trim() === "Bonjour Zoé", "« Bonjour Zoé »");
verifier(await bonjour.evaluate(e => getComputedStyle(e).fontSize) === "34px", "« Bonjour » fait 34 px");
const sous = page.getByText("Ce qui se passe chez vous, expliqué simplement.");
verifier(await sous.evaluate(e => getComputedStyle(e).fontSize) === "20px", "le sous-titre fait 20 px");
const champ = page.getByLabel(/Où habitez-vous/);
verifier(await champ.getAttribute("placeholder") === "Tapez votre ville (ex: Melun...)", "le champ de recherche dit « Tapez votre ville (ex: Melun...) »");
const quiz = page.getByRole("link", { name: /Testez votre culture civique/ });
const accès = ["Présidentielle 2027", "Pour vous", "Le Parlement", "Mes élus"].map(t => page.getByRole("link", { name: new RegExp("^" + t) }));
const chips = page.getByRole("button", { name: /^Thème / });
const ys = [await y(bonjour), await y(sous), await y(champ), await y(quiz), await y(accès[0]), await y(chips)];
verifier(ys.every((v, i) => i === 0 || v > ys[i - 1]), "ordre de haut en bas : Bonjour, sous-titre, recherche, quiz, accès, thèmes (" + ys.map(Math.round).join(" < ") + ")");
verifier((await champ.boundingBox()).y + 60 < 844 / 2 + 100, "la recherche est dans le haut de l'écran");
const b = await Promise.all(accès.map(a => a.boundingBox()));
verifier(b.every(Boolean) && Math.abs(b[0].y - b[1].y) < 2 && Math.abs(b[2].y - b[3].y) < 2 && b[2].y > b[0].y + 20, "quatre accès en grille 2 x 2");
verifier(await chips.count() === 6, "six thèmes : " + (await chips.evaluateAll(n => n.map(e => e.getAttribute("aria-label").replace(/^Thème | : .*/g, "")))).join(", "));
verifier(await page.getByText("Décideurs du quotidien", { exact: false }).count() === 0 && await page.getByText("Décideurs de votre quotidien", { exact: false }).count() === 0, "« Décideurs du quotidien » a disparu de l'accueil");
verifier((await quiz.innerText()).includes("Quatre définitions, une seule juste.") && (await quiz.innerText()).includes("Jouer"), "le quiz : sous-titre et bouton « Jouer »");
if (CAP) await page.screenshot({ path: `${CAP}/accueil-refonte.png` });
await champ.fill("Mel");
await page.waitForTimeout(800);
verifier(await quiz.count() === 0 && await chips.count() === 0, "en cherchant, quiz et thèmes s'effacent");
verifier(await page.getByRole("button", { name: /^Melun,/ }).count() >= 1, "les résultats viennent sous le champ");
await champ.fill("");
await page.waitForTimeout(500);
verifier(await quiz.count() === 1, "champ vidé : l'accueil revient");
verifier(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs[0] ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `accueil : ${echecs} échec(s)` : "accueil : zéro échec");
process.exit(echecs ? 1 : 0);
