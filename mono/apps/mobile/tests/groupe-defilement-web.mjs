/* LA LISTE DES DÉPUTÉS D'UN GROUPE : ON DOIT POUVOIR REMONTER (13/11/2026, test sur iPhone du porteur :
 * « on ne peut pas remonter quand on est en bas »).
 *
 * La cause était une FlatList IMBRIQUÉE dans le ScrollView de `Page` : deux conteneurs de défilement
 * l'un dans l'autre, et sur le web le défilement se bloque. La liste est maintenant l'écran.
 * Ce que ce test prouve : un seul conteneur qui défile, on descend, on remonte, et on revient à zéro.
 * Le fichier des groupes est SERVI PAR LE TEST (le conteneur ne joint pas l'Assemblée).
 * Usage : node apps/mobile/tests/groupe-defilement-web.mjs http://localhost:8811 */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

const N = 90;
const groupes = {};
for (let i = 0; i < N; i++) groupes["PA" + (i + 1)] = { groupe: "RN", nom: `Prénom Nom${String(i).padStart(3, "0")}` };
const fichier = { v: 1, genere_le: "2026-11-13", source: { producteur: "Assemblée nationale (essai)", licence: "Licence Ouverte 2.0" }, groupes };

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const erreurs = []; page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));
await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false, themes: [], mode: "clair", prenom: "Test", points: 0 })));
await page.route("**/deputes-groupes.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fichier) }));
await page.goto(BASE + "/groupe?g=RN", { waitUntil: "networkidle" });
await page.getByText("Ordre alphabétique des noms de famille.").waitFor({ timeout: 20000 });

/* UN SEUL conteneur qui défile : deux imbriqués, c'est le défaut d'hier. */
const scrollers = await page.evaluate(() => [...document.querySelectorAll("*")]
  .filter(e => { const c = getComputedStyle(e); return /auto|scroll/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 40; }).length);
ok(scrollers === 1, "un seul conteneur qui défile (" + scrollers + ")");

const mesure = () => page.evaluate(() => {
  const e = [...document.querySelectorAll("*")].find(x => { const c = getComputedStyle(x); return /auto|scroll/.test(c.overflowY) && x.scrollHeight > x.clientHeight + 40; });
  return e ? { haut: Math.round(e.scrollTop), max: Math.round(e.scrollHeight - e.clientHeight) } : null;
});
const bouger = (y) => page.evaluate(({ y }) => {
  const e = [...document.querySelectorAll("*")].find(x => { const c = getComputedStyle(x); return /auto|scroll/.test(c.overflowY) && x.scrollHeight > x.clientHeight + 40; });
  if (e) e.scrollTop = y;
}, { y });

const depart = await mesure();
ok(depart && depart.max > 800, "la liste est bien plus haute que l'écran (" + (depart && depart.max) + " px à parcourir)");
await bouger(depart.max);
await page.waitForTimeout(800);
const bas = await mesure();
ok(bas.haut > depart.max * 0.5, "on descend jusqu'en bas (" + bas.haut + " px)");
/* LE DÉFAUT : en bas, on ne remontait plus. */
await bouger(0);
await page.waitForTimeout(800);
const retour = await mesure();
ok(retour.haut === 0, "on remonte jusqu'en haut depuis le bas (" + retour.haut + " px)");
await bouger(Math.round(depart.max / 2));
await page.waitForTimeout(500);
const milieu = await mesure();
ok(milieu.haut > 0 && milieu.haut < milieu.max, "on s'arrête où l'on veut au milieu (" + milieu.haut + " px)");
ok(await page.getByText("Ordre alphabétique des noms de famille.").count() === 1, "l'en-tête défile avec la liste, il n'est pas perdu");
ok(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));

await nav.close();
console.log(echecs ? `défilement du groupe : ${echecs} échec(s)` : "défilement du groupe : zéro échec");
process.exit(echecs ? 1 : 0);
