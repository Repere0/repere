/* RÉSEAU LENT : UNE COMMUNE GARDÉE N'EST JAMAIS DITE ABSENTE (audit UI du 16/11/2026, P0 n° 1).
   Mesuré à l'audit : avec 1,5 à 4 s de latence par fichier, Qui décide, Finances et le Calendrier
   disaient « Aucune commune n'est choisie » pendant 7 à 17 s, avec un bouton pour partir, alors que la
   commune était gardée. Ce banc ralentit chaque fichier /data/ et regarde l'écran toutes les 250 ms
   jusqu'à ce que la commune paraisse :
   - « Aucune commune n'est choisie » ne doit jamais apparaître ;
   - l'écran doit finir par s'afficher (Melun, ou le Calendrier) ;
   - liste des communes coupée : une phrase vraie et « Réessayer », jamais « Aucune commune ».
   Usage : node apps/mobile/tests/reseau-lent-web.mjs http://localhost:8811 */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
const LATENCE = 2000;
const PROFIL = { prenom: "Test", onboardingVu: true, niveauZoom: "france", tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false, themes: [] };
/* La marque d'un écran prêt : la commune pour Qui décide et Finances ; le Calendrier est national. */
const ECRANS = [["/qui-decide", /Melun/], ["/finances", /Melun/], ["/a-venir", /Comment une loi devient loi/]];

let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };
const navigateur = await chromium.launch();

async function ouvrir(chemin, coupe) {
  const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await contexte.addInitScript(profil => {
    localStorage.clear();
    localStorage.setItem("repere.profil", JSON.stringify(profil));
    localStorage.setItem("repere.departement", JSON.stringify({ d: "77", c: "77288" }));
  }, PROFIL);
  await contexte.route(/\/data\//, async r => {
    if (coupe && /communes-beta\.json/.test(r.request().url())) return r.abort();
    await new Promise(x => setTimeout(x, LATENCE));
    return r.continue();
  });
  const page = await contexte.newPage();
  await page.goto(BASE + chemin, { waitUntil: "domcontentloaded" });
  return { contexte, page };
}

for (const [chemin, pret] of ECRANS) {
  const { contexte, page } = await ouvrir(chemin, false);
  let faux = false, vu = false;
  const t0 = Date.now();
  while (Date.now() - t0 < 45000) {
    const texte = await page.evaluate(() => document.body.innerText);
    if (/Aucune commune n'est choisie/.test(texte)) faux = true;
    if (pret.test(texte)) { vu = true; break; }
    await page.waitForTimeout(250);
  }
  verifier(!faux, `${chemin} : « Aucune commune n'est choisie » jamais affiché (${LATENCE} ms par fichier)`);
  verifier(vu, `${chemin} : l'écran s'affiche ${vu ? `après ${Math.round((Date.now() - t0) / 100) / 10} s` : "— jamais en 45 s"}`);
  await contexte.close();
}

{
  const { contexte, page } = await ouvrir("/qui-decide", true);
  await page.getByText("Repère n'a pas pu retrouver votre commune.").first().waitFor({ timeout: 45000 }).catch(() => {});
  const texte = await page.evaluate(() => document.body.innerText);
  verifier(/Repère n'a pas pu retrouver votre commune\./.test(texte), "liste des communes coupée : la phrase vraie s'affiche");
  verifier(!/Aucune commune n'est choisie/.test(texte), "liste des communes coupée : jamais « Aucune commune n'est choisie »");
  verifier(await page.getByRole("button", { name: "Réessayer" }).count() > 0, "liste des communes coupée : « Réessayer » est proposé");
  await contexte.close();
}

await navigateur.close();
console.log(echecs ? `réseau lent : ${echecs} échec(s)` : "réseau lent : zéro échec");
process.exitCode = echecs ? 1 : 0;
