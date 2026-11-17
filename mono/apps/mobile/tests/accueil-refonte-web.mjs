/* ACCUEIL SANS COMMUNE (17/11/2026, porteur) : recherche, quatre cartes, « Soutenir Repère ». Avant : (14/11/2026).
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
verifier(await champ.getAttribute("placeholder") === "Votre ville ou code postal", "le champ de recherche dit « Votre ville ou code postal » (plus d'exemple Melun)");
/* 17/11/2026 (porteur) : sans commune, l'accueil ne contient QUE la recherche, quatre cartes et « Soutenir Repère ». */
const cartes = ["Présidentielle 2027", "Le Parlement", "Mes élus", "Quiz civique"].map(t => page.getByRole("link", { name: new RegExp("^" + t) }));
const soutenir = page.getByTestId("soutenir-accueil");
const ys = [await y(bonjour), await y(sous), await y(champ), await y(cartes[0]), await y(soutenir)];
verifier(ys.every((v, i) => i === 0 || v > ys[i - 1]), "ordre : Bonjour, sous-titre, recherche, cartes, Soutenir (" + ys.map(Math.round).join(" < ") + ")");
verifier((await champ.boundingBox()).y + 60 < 844 / 2 + 100, "la recherche est dans le haut de l'écran");
const b = await Promise.all(cartes.map(a => a.boundingBox()));
verifier(b.every(Boolean) && Math.abs(b[0].y - b[1].y) < 2 && Math.abs(b[2].y - b[3].y) < 2 && b[2].y > b[0].y + 20, "quatre cartes en grille 2 x 2");
verifier(b.every(r => r.height >= 44 && r.width >= 44) && (await soutenir.boundingBox()).height >= 44, "cartes et Soutenir : 44 px au moins");
const texte = await page.locator("body").innerText();
for (const absent of ["Dernières publications", "Melun", "Un exemple", "Thème ", "Testez votre culture civique", "Aucun compte"])
  verifier(!texte.includes(absent), `« ${absent} » n'est plus sur l'accueil sans commune`);
verifier(await page.getByRole("button", { name: /^Thème / }).count() === 0, "plus de thèmes sur l'accueil sans commune");
await soutenir.click();
await page.waitForTimeout(300);
verifier((await page.getByTestId("message-dons").innerText()).includes("Les dons arrivent très bientôt") , "Soutenir : « Les dons arrivent très bientôt ! Merci pour votre soutien. »");
verifier(/\/$/.test(new URL(page.url()).pathname), "Soutenir n'ouvre aucune page de paiement");
if (CAP) await page.screenshot({ path: `${CAP}/accueil-refonte.png` });
await champ.fill("Mel");
await page.waitForTimeout(800);
verifier(await cartes[0].count() === 0 && await soutenir.count() === 0, "en cherchant, cartes et Soutenir s'effacent");
verifier(await page.getByRole("button", { name: /^Melun,/ }).count() >= 1, "les résultats viennent sous le champ");
await champ.fill("");
await page.waitForTimeout(500);
verifier(await cartes[3].count() === 1, "champ vidé : l'accueil revient");
await cartes[3].click();
await page.getByRole("radio").first().waitFor({ timeout: 15000 });
verifier(/\/quiz$/.test(page.url()), "la carte « Quiz civique » ouvre le quiz");
verifier(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs[0] ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `accueil : ${echecs} échec(s)` : "accueil : zéro échec");
process.exit(echecs ? 1 : 0);
