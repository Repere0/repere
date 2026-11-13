/* PREMIER LANCEMENT : l'écran de démarrage, puis la question du prénom (13/11/2026, ADR 0009).
 * Sans profil, l'accueil laisse la place à « Bienvenue sur Repère ». On vérifie : le voile de démarrage disparaît en
 * 1,5 s au plus et ne capte aucun geste ; tout tient sur un écran d'iPhone sans défiler ; un prénom refusé (chiffres)
 * n'est pas gardé ; un prénom donné est gardé, nettoyé, et l'accueil dit bonjour ; « Passer » n'en garde aucun ;
 * le prénom n'apparaît dans aucune adresse demandée (invariant 2) ; un lien profond n'est pas détourné.
 * Usage : node apps/mobile/tests/onboarding-web.mjs http://localhost:8811 */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const verifier = (ok, texte) => { console.log((ok ? "ok    " : "ECHEC ") + texte); if (!ok) echecs++; };
const navigateur = await chromium.launch();
const nouveau = async () => {
  const contexte = await navigateur.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await contexte.newPage();
  const erreurs = [], demandees = [];
  page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 160)));
  page.on("request", r => demandees.push(r.url()));
  return { contexte, page, erreurs, demandees };
};
const lireProfil = page => page.evaluate(() => JSON.parse(localStorage.getItem("repere.profil") || "null"));

/* 1. Démarrage, puis prénom donné */
{
  const { contexte, page, erreurs, demandees } = await nouveau();
  await page.goto(BASE + "/", { waitUntil: "commit" });
  /* 13/11/2026 (porteur) : AU PREMIER LANCEMENT, AUCUN VOILE. L'écran 1 de la bienvenue montre déjà le
     logo, avec un bouton : deux logos à la suite se lisaient comme un blocage. */
  await page.waitForTimeout(1800);
  verifier(await page.getByTestId("demarrage").count() === 0, "premier lancement : pas de voile de démarrage, l'écran 1 de la bienvenue le remplace");

  await page.waitForURL(/\/bienvenue/, { timeout: 10000 });
  /* ÉCRAN 1 : le logo et un bouton. Rien ici ne dépend d'une animation : un lecteur bloqué est impossible. */
  await page.getByTestId("continuer-0").waitFor({ timeout: 10000 });
  verifier(await page.getByRole("heading", { name: "Repère" }).count() === 1, "écran 1 : le logo et le nom");
  /* LE LOGO OFFICIEL : trois éléments concentriques (cercle ivoire, anneau gris, point ivoire). Une
     teinte sans gris réduisait le logo à un cercle et un point — défaut vu par le porteur le 13/11. */
  const ronds = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h1,h2,[role=heading]")].find(e => /Repère/.test(e.textContent || ""));
    const bloc = h && h.parentElement;
    if (!bloc) return { n: -1, couleurs: [] };
    const cercles = [...bloc.querySelectorAll("div")].filter(e => {
      const c = getComputedStyle(e); const r = e.getBoundingClientRect();
      return r.width > 8 && parseFloat(c.borderRadius) >= r.width / 2 - 1;
    });
    return { n: cercles.length, couleurs: cercles.map(e => { const c = getComputedStyle(e); return c.borderTopColor !== "rgba(0, 0, 0, 0)" ? c.borderTopColor : c.backgroundColor; }) };
  });
  verifier(ronds.n === 3, "écran 1 : le logo a ses TROIS éléments concentriques (" + ronds.n + ")");
  verifier(ronds.couleurs.includes("rgb(156, 154, 146)"), "écran 1 : l'anneau intermédiaire est bien gris (" + ronds.couleurs.join(" / ") + ")");
  verifier((await page.getByTestId("continuer-0").innerText()).trim() === "Commencer", "écran 1 : le bouton dit « Commencer »");
  if (CAP) await page.screenshot({ path: `${CAP}/bienvenue-0.png` });
  await page.getByTestId("continuer-0").click();
  /* ÉCRAN 2 : le prénom. */
  await page.waitForTimeout(500);
  if (CAP) await page.screenshot({ path: `${CAP}/bienvenue.png` });
  verifier(await page.getByText("Comment souhaitez-vous qu'on vous appelle ?").count() === 1, "écran 2 : la question est posée");
  const bas = await page.getByRole("button", { name: /^Passer, sans/ }).boundingBox();
  verifier(bas && bas.y + bas.height <= 844, "bienvenue : tout tient sur l'écran sans défiler (« Passer » finit à " + (bas && Math.round(bas.y + bas.height)) + " px sur 844)");
  for (const nom of [/^Continuer$/, /^Passer, sans/]) {
    const b = await page.getByRole("button", { name: nom }).boundingBox();
    verifier(b && b.height >= 44, `bienvenue : cible tactile de 44 px au moins (${String(nom)} : ${b && Math.round(b.height)} px)`);
  }
  const champ = page.getByLabel(/Votre prénom/);
  await champ.fill("R2-D2 <script>");
  verifier(await page.getByText("Un prénom : des lettres", { exact: false }).count() === 1, "bienvenue : une saisie refusée est dite au lecteur");
  await champ.fill("  marie-Hélène  ");
  await page.getByTestId("continuer-1").click();
  /* ÉCRAN 3 : ce que Repère ne fait pas. */
  await page.waitForTimeout(500);
  verifier(await page.getByRole("heading", { name: "Ce que Repère ne fait pas" }).count() === 1, "écran 3 : les valeurs sont annoncées");
  for (const t of ["Zéro traceur", "Pas de compte", "Des faits, leurs sources"]) verifier(await page.getByText(t, { exact: false }).count() >= 1, `écran 3 : « ${t} »`);
  if (CAP) await page.screenshot({ path: `${CAP}/bienvenue-2.png` });
  verifier(await page.getByTestId("continuer-2").innerText() === "C'est parti, marie-Hélène", "écran 3 : le bouton reprend le prénom donné");
  await page.getByTestId("continuer-2").click();
  await page.getByTestId("bonjour").waitFor({ timeout: 10000 });
  const profil = await lireProfil(page);
  verifier(profil && profil.prenom === "marie-Hélène", "« C'est parti » garde le prénom, nettoyé, dans repere.profil (" + JSON.stringify(profil && profil.prenom) + ")");
  verifier((await page.getByTestId("bonjour").innerText()).trim() === "Bonjour marie-Hélène", "accueil : « Bonjour marie-Hélène »");
  const cles = await page.evaluate(() => Object.keys(localStorage));
  verifier(cles.every(k => k === "repere.profil" || k === "repere.departement"), "aucune autre clé de stockage (" + cles.join(", ") + ")");
  verifier(!demandees.some(u => /marie|H%C3%A9l/i.test(u)), "le prénom n'apparaît dans aucune adresse demandée (" + demandees.length + " requêtes)");
  /* AU LANCEMENT SUIVANT, le voile reprend son rôle : il n'y a plus d'onboarding à afficher. */
  await page.goto(BASE + "/", { waitUntil: "commit" });
  const voile = page.getByTestId("demarrage");
  await voile.waitFor({ state: "attached", timeout: 10000 });
  const pointeur = await voile.evaluate(e => getComputedStyle(e).pointerEvents);
  const fond = await voile.evaluate(e => getComputedStyle(e).backgroundColor);
  const vu = Date.now();
  await voile.waitFor({ state: "detached", timeout: 5000 });
  const duree = Date.now() - vu;
  verifier(pointeur === "none", "lancement suivant : le voile ne capte aucun geste (pointer-events " + pointeur + ")");
  verifier(fond === "rgb(20, 19, 17)", "lancement suivant : fond #141311 (" + fond + ")");
  verifier(duree <= 1500, "lancement suivant : le voile part en 1,5 s au plus (" + duree + " ms)");
  await page.waitForTimeout(1200);
  verifier(!page.url().includes("/bienvenue") && await page.getByTestId("bonjour").count() === 1, "au lancement suivant : pas de question, le bonjour est là");
  verifier(erreurs.length === 0, "aucune erreur JavaScript" + (erreurs.length ? " (" + erreurs[0] + ")" : ""));
  await contexte.close();
}

/* 2. « Passer » : aucun prénom ; une saisie refusée n'est pas gardée */
{
  const { contexte, page } = await nouveau();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForURL(/\/bienvenue/, { timeout: 10000 });
  await page.getByTestId("continuer-0").click();
  await page.getByLabel(/Votre prénom/).fill("12345");
  await page.getByTestId("continuer-1").click();
  await page.getByTestId("continuer-2").click();
  await page.waitForURL(u => !String(u).includes("/bienvenue"), { timeout: 10000 });
  await page.waitForTimeout(800);
  let profil = await lireProfil(page);
  verifier(profil && profil.prenom === "" && profil.tailleTexte === 16, "une saisie refusée n'est pas gardée ; les réglages par défaut le sont");
  verifier(await page.getByTestId("bonjour").count() === 0, "sans prénom : pas de « Bonjour » à moitié vide");
  await contexte.close();
}
{
  const { contexte, page } = await nouveau();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.waitForURL(/\/bienvenue/, { timeout: 10000 });
  await page.getByTestId("continuer-0").click();
  await page.getByRole("button", { name: /^Passer, sans/ }).click();
  await page.getByTestId("continuer-2").click();
  await page.waitForURL(u => !String(u).includes("/bienvenue"), { timeout: 10000 });
  const profil = await lireProfil(page);
  verifier(profil && profil.prenom === "", "« Passer » ne garde aucun prénom");
  await contexte.close();
}

/* 3. Un lien ouvert sur une page précise n'est pas détourné vers la question */
{
  const { contexte, page } = await nouveau();
  await page.goto(BASE + "/faq", { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  verifier(page.url().includes("/faq"), "lien profond sans profil : la page demandée reste affichée");
  await contexte.close();
}

await navigateur.close();
console.log(echecs === 0 ? "onboarding : zéro échec" : `onboarding : ${echecs} échec(s)`);
process.exit(echecs === 0 ? 0 : 1);
