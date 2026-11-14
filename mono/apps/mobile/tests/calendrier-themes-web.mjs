/* CALENDRIER : FILTRES THÉMATIQUES (14/11/2026, porteur). Agenda d'ESSAI injecté (page.route), jamais une donnée réelle.
 * Aucun thème par défaut ; « Santé » ne montre que la santé ; « Budget » que le budget ; un second toucher retire le filtre ;
 * le rangement est dit calcul Repère (les sources ne publient pas de thème).
 * Usage : node apps/mobile/tests/calendrier-themes-web.mjs http://localhost:8811 [dossier-captures] */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };
const jourParis = d => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const J = k => jourParis(new Date(Date.now() + k * 864e5));

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
await ctx.route("**/data/agenda-an.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
  source: { producteur: "Assemblée nationale (ESSAI)", licence: "Licence ouverte", url: "https://www.assemblee-nationale.fr/dyn/agenda", releve_le: J(0) },
  evenements: [
    { debut: `${J(1)}T09:30`, titre: "ESSAI Suite PLFSS Financement de la sécurité sociale pour 2027", categorie: "Séance publique" },
    { debut: `${J(1)}T15:00`, titre: "ESSAI Projet de loi de finances pour 2027", categorie: "Séance publique" },
    { debut: `${J(2)}T15:00`, titre: "ESSAI Proposition de loi sur le logement", categorie: "Séance publique" },
    { debut: `${J(2)}T21:30`, titre: "ESSAI Séance publique, ordre du jour non encore publié", categorie: "Séance publique" },
  ] }) }));
await ctx.route("**/data/calendrier-senat.json", r => r.abort());
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));
await page.addInitScript(() => {
  localStorage.setItem("repere.profil", JSON.stringify({ prenom: "Test", animationsReduites: true }));
  localStorage.setItem("repere.departement", JSON.stringify({ d: "77", c: "77284" }));
});
await page.goto(BASE + "/a-venir", { waitUntil: "networkidle" });
await page.getByText("ESSAI Projet de loi de finances", { exact: false }).first().waitFor({ timeout: 20000 });
const voit = async t => (await page.getByText(t, { exact: false }).filter({ visible: true }).count()) > 0;
const TOUS = ["Suite PLFSS", "Projet de loi de finances", "logement", "ordre du jour non encore publié"];

verifier(await page.getByRole("button", { name: /^Thème / }).count() === 7, "sept thèmes proposés, dans l'ordre demandé");
verifier(await page.getByRole("button", { name: /choisi/ }).count() === 0, "aucun thème par défaut");
verifier((await Promise.all(TOUS.map(voit))).every(Boolean), "à l'arrivée, tous les rendez-vous s'affichent");

await page.getByRole("button", { name: "Thème Santé" }).click();
await page.waitForTimeout(500);
verifier(await voit("Suite PLFSS") && !(await voit("Projet de loi de finances")) && !(await voit("logement")) && !(await voit("ordre du jour non encore publié")), "« Santé » : seul le PLFSS reste");
verifier(await page.getByTestId("calendrier-note-theme").count() === 1 && /calcul|rangement fait par Repère/.test(await page.getByTestId("calendrier-note-theme").innerText()), "le rangement est dit : fait par Repère, pas par la source");
if (CAP) await page.screenshot({ path: `${CAP}/calendrier-sante.png` });

await page.getByRole("button", { name: /^Thème Budget/ }).click();
await page.waitForTimeout(500);
verifier(await voit("Projet de loi de finances") && !(await voit("Suite PLFSS")) && !(await voit("logement")), "« Budget » : seule la loi de finances reste");

await page.getByRole("button", { name: /^Thème Budget/ }).click();
await page.waitForTimeout(500);
verifier((await Promise.all(TOUS.map(voit))).every(Boolean), "un second toucher retire le filtre : tout revient");

await page.getByRole("button", { name: "Thème Écologie" }).click();
await page.waitForTimeout(500);
verifier(await page.getByText("Rien de publié", { exact: false }).count() >= 1, "un thème sans rendez-vous le dit, sans rien inventer");
verifier(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs[0] ? " : " + erreurs[0] : ""));
await nav.close();
console.log(echecs ? `calendrier thèmes : ${echecs} échec(s)` : "calendrier thèmes : zéro échec");
process.exit(echecs ? 1 : 0);
