/* RETOUR IPHONE DU 11/11/2026 : trois écrans, trois contrôles.
 *   - Qui décide, Paris : 18 circonscriptions → un sélecteur, UN député à la fois, aucun de désigné d'office.
 *   - Calendrier : les séances d'un jour rangées par moment (Matin, Après-midi, Soir), dans cet ordre.
 *     L'agenda est une DONNÉE D'ESSAI injectée par ce test (page.route), jamais une donnée réelle.
 *   - Finances, Évolution : une flèche, « hausse » ou « baisse », le pourcentage, « calcul Repère ».
 *     Jamais de vert ni de rouge (invariant 7) : vérifié sur les couleurs réellement calculées.
 * Usage : node apps/mobile/tests/fix-iphone-web.mjs http://localhost:8811 */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };

const jourParis = d => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const J = k => jourParis(new Date(Date.now() + k * 864e5));

const navigateur = await chromium.launch();
const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await contexte.route("**/data/agenda-an.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
  source: { producteur: "Assemblée nationale (ESSAI)", licence: "Licence ouverte", url: "https://www.assemblee-nationale.fr/dyn/agenda", releve_le: J(0) },
  evenements: [
    { debut: `${J(1)}T21:30`, titre: "ESSAI — séance du soir", categorie: "Séance publique" },
    { debut: `${J(1)}T09:30`, titre: "ESSAI — réunion du matin", categorie: "Commission" },
    { debut: `${J(1)}T15:00`, titre: "ESSAI — séance de l'après-midi", categorie: "Séance publique" },
  ] }) }));
await contexte.route("**/data/calendrier-senat.json", r => r.abort());
const page = await contexte.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));

/* La commune se choisit comme un lecteur : aucune clé de stockage écrite ici. */
await page.goto(BASE + "/", { waitUntil: "networkidle" });
if (!(await page.getByLabel(/Où habitez-vous/).isVisible().catch(() => false))) await page.getByRole("button", { name: "Chercher une commune" }).first().click();
await page.getByLabel(/Où habitez-vous/).fill("Paris");
await page.getByRole("button", { name: /^Paris,/ }).first().click();
await page.getByText("Question 4 sur 4", { exact: false }).first().waitFor({ timeout: 15000 });
await page.getByRole("button", { name: /^Passer/ }).click();
await page.getByText("Aller plus loin").first().waitFor({ timeout: 15000 });

/* 1. Qui décide, Paris */
await page.getByRole("tab", { name: /Qui décide/ }).first().click();
const niveauAN = page.getByRole("button", { name: /Assemblée nationale.*(déplier|replier)/ }).first();
await niveauAN.waitFor({ timeout: 15000 });
await niveauAN.scrollIntoViewIfNeeded();
await niveauAN.click();
const selecteur = page.getByRole("button", { name: /^Choisir une circonscription/ });
verifier(await selecteur.count() === 1, "Paris : un sélecteur « Choisir une circonscription »");
verifier(await page.getByRole("link", { name: /député de la/ }).count() === 0, "Paris : aucun député n'est désigné avant le choix du lecteur");
await selecteur.click();
verifier(await page.getByRole("button", { name: /^\d+(re|e) circonscription$/ }).count() === 18, "Paris : 18 circonscriptions proposées en puces");
await page.getByRole("button", { name: /^5e circonscription$/ }).click();
verifier(await page.getByRole("link", { name: /député de la 5e circonscription/ }).count() === 1, "Paris : après le choix, un seul député, celui de la 5e");

/* 2. Calendrier : Matin, Après-midi, Soir, dans cet ordre */
await page.getByRole("tab", { name: /Le calendrier/ }).first().click();
await page.getByText("ESSAI — réunion du matin").first().waitFor({ timeout: 15000 });
const ordre = await page.evaluate(() => {
  const corps = document.body.innerText;
  return ["MATIN", "APRÈS-MIDI", "SOIR"].map(m => corps.indexOf(m));
});
verifier(ordre.every(i => i >= 0) && ordre[0] < ordre[1] && ordre[1] < ordre[2], "calendrier : Matin, Après-midi, Soir, dans cet ordre (" + ordre.join(", ") + ")");
const avant = await page.evaluate(() => { const t = document.body.innerText; return t.indexOf("ESSAI — séance du soir") > t.indexOf("ESSAI — réunion du matin"); });
verifier(avant, "calendrier : la séance du soir vient après celle du matin, même publiée avant");
const tailles = await page.evaluate(() => {
  const el = t => [...document.querySelectorAll("*")].find(e => e.children.length === 0 && e.textContent === t);
  const cs = e => e ? getComputedStyle(e).fontSize : null;
  return { titre: cs(el("ESSAI — réunion du matin")), heure: cs([...document.querySelectorAll("*")].find(e => e.children.length === 0 && /^9 h 30$/.test((e.textContent || "").replace(/ /g, " ")))) };
});
verifier(tailles.titre === "17px" && tailles.heure === "13px", "calendrier : titre en 17 px, heure en 13 px (" + JSON.stringify(tailles) + ")");

/* 3. Finances, Évolution */
await page.getByRole("tab", { name: /Finances/ }).first().click();
await page.getByText("Évolution", { exact: true }).first().waitFor({ timeout: 15000 });
await page.getByText("Évolution", { exact: true }).first().click();
const variation = page.getByLabel(/: (hausse|baisse|stable), .*Calcul Repère/).first();
await variation.waitFor({ timeout: 15000 });
verifier(await page.getByLabel(/: (hausse|baisse|stable), .*Calcul Repère/).count() >= 1, "finances : une variation avec son sens, son pourcentage et « Calcul Repère »");
const couleurs = await variation.evaluate(e => [...e.querySelectorAll("*")].map(x => getComputedStyle(x).color));
const teinte = c => { const m = /rgb\((\d+), (\d+), (\d+)/.exec(c); if (!m) return false; const [r, g, b] = m.slice(1).map(Number); return Math.max(r, g, b) - Math.min(r, g, b) > 40; };
verifier(!couleurs.some(teinte), "finances : aucune couleur vive (ni vert ni rouge) sur la variation");

verifier(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs.length ? " : " + erreurs[0] : ""));
await navigateur.close();
console.log(echecs ? `fix-iphone : ${echecs} échec(s)` : "fix-iphone : zéro échec");
process.exit(echecs ? 1 : 0);
