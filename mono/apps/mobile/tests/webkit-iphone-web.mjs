/* DIAGNOSTIC SAFARI iOS — WebKit, profil iPhone 14 Pro (13/11/2026, demande du porteur).
 *
 * POURQUOI CE FICHIER. Trois bugs ont ete corriges trois fois sans jamais etre reproduits : le porteur
 * les voit sur Safari iOS, le banc tourne sur Chromium. Ce test tourne sur WEBKIT, le moteur de Safari,
 * avec le profil iPhone 14 Pro de Playwright. Le conteneur de developpement ne peut PAS l'executer :
 * WebKit n'y est pas installe (/opt/pw-browsers n'a que Chromium) et le CDN de Playwright n'y est pas
 * joignable. Il tourne donc sur le runner GitHub, ou le reseau fonctionne.
 *
 * IL MESURE AVANT DE JUGER. Chaque controle imprime le NOMBRE qu'il a lu, pas seulement un verdict :
 * c'est ce qui manquait aux trois passes precedentes.
 *
 * LE DEFILEMENT SE TESTE AU DOIGT, PAS EN ECRIVANT scrollTop. Les tests Chromium ecrivaient
 * `element.scrollTop = 0`, ce qui marche meme quand le defilement tactile est casse : ils ne pouvaient
 * donc pas reproduire le bug du porteur. Ici, on envoie de vrais gestes (molette et doigt).
 *
 * Usage : node apps/mobile/tests/webkit-iphone-web.mjs http://localhost:8811 [dossier de captures] */
import { createRequire } from "node:module";
const require_ = createRequire(process.cwd() + "/");
const { webkit, devices } = require_("playwright");

const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
const IPHONE = devices["iPhone 14 Pro"];
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };
const dit = m => console.log("      " + m);

console.log(`== DIAGNOSTIC WEBKIT (Safari) — ${IPHONE.viewport.width}x${IPHONE.viewport.height}, tactile ${IPHONE.hasTouch} ==`);

const nav = await webkit.launch();
const PROFIL = { tailleTexte: 16, onboardingVu: true, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: false, modeDaltonien: false, masquerImages: false, themes: [], mode: "clair", prenom: "", points: 0 };
const neuf = async (init) => {
  const ctx = await nav.newContext({ ...IPHONE });
  const page = await ctx.newPage();
  const erreurs = [];
  page.on("pageerror", e => erreurs.push(String(e.message || e).slice(0, 200)));
  if (init) await page.addInitScript(init);
  return { ctx, page, erreurs };
};

/* ───── 1. LE LOGO : combien d'elements concentriques, et de quelle couleur ───── */
{
  const { ctx, page, erreurs } = await neuf();
  await page.goto(BASE + "/bienvenue", { waitUntil: "load" });
  await page.getByRole("heading", { name: "Repère" }).waitFor({ timeout: 30000 });
  await page.waitForTimeout(1200);
  if (CAP) await page.screenshot({ path: `${CAP}/webkit-logo.png` });
  const vu = await page.evaluate(() => {
    const h = [...document.querySelectorAll("h1,h2,[role=heading]")].find(e => /Repère/.test(e.textContent || ""));
    const bloc = h && h.parentElement;
    if (!bloc) return null;
    const ronds = [...bloc.querySelectorAll("div")].map(e => {
      const c = getComputedStyle(e), r = e.getBoundingClientRect();
      return { l: Math.round(r.width), h: Math.round(r.height), rayon: c.borderRadius,
        bord: c.borderTopWidth, couleurBord: c.borderTopColor, fond: c.backgroundColor, visible: c.visibility, opacite: c.opacity };
    }).filter(e => e.l > 4 && parseFloat(e.rayon) >= e.l / 2 - 1);
    return ronds;
  });
  dit("elements ronds lus : " + JSON.stringify(vu));
  ok(vu && vu.length === 3, `logo : TROIS elements concentriques (lu : ${vu ? vu.length : "bloc introuvable"})`);
  if (vu && vu.length === 3) {
    const teintes = vu.map(e => (e.couleurBord !== "rgba(0, 0, 0, 0)" && parseFloat(e.bord) > 0 ? e.couleurBord : e.fond));
    dit("teintes : " + teintes.join(" / "));
    ok(teintes.some(t => /156,\s*154,\s*146/.test(t)), "logo : l'anneau intermediaire est gris #9C9A92");
    ok(teintes.filter(t => /245,\s*244,\s*240/.test(t)).length >= 2, "logo : le cercle exterieur et le point sont ivoire #F5F4F0");
    ok(vu.every(e => e.visible === "visible" && parseFloat(e.opacite) > 0.9), "logo : les trois elements sont peints (ni invisibles, ni transparents)");
    ok(vu.every(e => e.l > 4 && e.h > 4), "logo : aucun element ecrase a zero");
  }
  ok(erreurs.length === 0, "logo : aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));
  await ctx.close();
}

/* ───── 2. L'ONBOARDING : la question du prenom s'affiche-t-elle ? ───── */
{
  const { ctx, page, erreurs } = await neuf();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(4000);
  const url = page.url();
  dit("adresse apres 4 s : " + url);
  const voile = await page.getByTestId("demarrage").count();
  dit("voile de demarrage encore present : " + voile);
  ok(url.includes("/bienvenue"), `onboarding : l'application s'ouvre sur la bienvenue (lu : ${url.replace(BASE, "") || "/"})`);
  const bouton = page.getByTestId("continuer-0");
  ok(await bouton.count() === 1, "onboarding : le bouton de l'ecran 1 est present");
  if (await bouton.count()) {
    dit("libelle du bouton : « " + (await bouton.innerText()).trim() + " »");
    const b = await bouton.boundingBox();
    dit("bouton : " + JSON.stringify(b && { x: Math.round(b.x), y: Math.round(b.y), l: Math.round(b.width), h: Math.round(b.height) }));
    ok(b && b.y + b.height <= IPHONE.viewport.height, "onboarding : le bouton est dans l'ecran, sans defiler");
    await bouton.tap();
    await page.waitForTimeout(1200);
    const champ = page.getByLabel(/Votre prénom/);
    ok(await champ.count() === 1, "onboarding : le clic sur « Commencer » amene la question du prenom");
    if (await champ.count()) {
      await champ.fill("Inès");
      await page.getByTestId("continuer-1").tap();
      await page.waitForTimeout(900);
      ok(await page.getByRole("heading", { name: "Ce que Repère ne fait pas" }).count() === 1, "onboarding : l'ecran des valeurs suit");
      await page.getByTestId("continuer-2").tap();
      await page.waitForTimeout(2000);
      const prenom = await page.evaluate(() => (JSON.parse(localStorage.getItem("repere.profil") || "null") || {}).prenom);
      dit("prenom garde : " + JSON.stringify(prenom));
      ok(prenom === "Inès", "onboarding : le prenom est garde sur l'appareil");
      ok(await page.getByTestId("bonjour").count() === 1, "onboarding : l'accueil dit bonjour");
      const vu = await page.evaluate(() => (JSON.parse(localStorage.getItem("repere.profil") || "null") || {}).onboardingVu);
      ok(vu === true, "onboarding : la bienvenue terminee est marquee vue (onboardingVu = " + JSON.stringify(vu) + ")");
    }
  }
  if (CAP) await page.screenshot({ path: `${CAP}/webkit-onboarding.png` });
  ok(erreurs.length === 0, "onboarding : aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));
  await ctx.close();
}

/* ───── 2 bis. UN IPHONE QUI GARDE DEJA UN PROFIL (14/11/2026, ADR 0011) : le cas du porteur ─────
   Un profil d'avant, sans `onboardingVu` : la bienvenue doit s'ouvrir quand meme, une fois. */
{
  const { ctx, page, erreurs } = await neuf();
  await page.addInitScript(() => { if (!localStorage.getItem("repere.profil")) localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 18, espacement: 1.5,
    contraste: "normal", policeDyslexie: false, animationsReduites: false, modeDaltonien: false, masquerImages: false, themes: [], mode: "clair", prenom: "", points: 30 })); });
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(4000);
  dit("profil deja garde, adresse apres 4 s : " + page.url());
  ok(page.url().includes("/bienvenue"), "profil deja garde : la bienvenue s'ouvre (lu : " + (page.url().replace(BASE, "") || "/") + ")");
  if (page.url().includes("/bienvenue")) {
    await page.getByTestId("continuer-0").tap();
    await page.getByLabel(/Votre prénom/).fill("Inès");
    await page.getByTestId("continuer-1").tap();
    await page.getByTestId("continuer-2").tap();
    await page.waitForTimeout(2000);
    const p = await page.evaluate(() => JSON.parse(localStorage.getItem("repere.profil") || "null"));
    dit("profil apres la bienvenue : " + JSON.stringify(p && { prenom: p.prenom, tailleTexte: p.tailleTexte, points: p.points, onboardingVu: p.onboardingVu }));
    ok(p && p.prenom === "Inès" && p.onboardingVu === true, "profil deja garde : prenom garde, bienvenue marquee vue");
    ok(p && p.tailleTexte === 18 && p.points === 30, "profil deja garde : la taille du texte et les points ne sont pas remis a zero");
  }
  if (CAP) await page.screenshot({ path: `${CAP}/webkit-onboarding-profil-garde.png` });
  ok(erreurs.length === 0, "profil deja garde : aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));
  await ctx.close();
}

/* ───── 3. LE DEFILEMENT : AU DOIGT, pas en ecrivant scrollTop ───── */
{
  const N = 90;
  const groupes = {};
  for (let i = 0; i < N; i++) groupes["PA" + (i + 1)] = { groupe: "RN", nom: `Prénom Nom${String(i).padStart(3, "0")}` };
  const { ctx, page, erreurs } = await neuf();
  await page.addInitScript(p => localStorage.setItem("repere.profil", JSON.stringify(p)), PROFIL);
  await page.route("**/deputes-groupes.json", r => r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ v: 1, genere_le: "2026-11-13", source: { producteur: "Assemblée nationale (essai)", licence: "Licence Ouverte 2.0" }, groupes }) }));
  await page.goto(BASE + "/groupe?g=RN", { waitUntil: "load" });
  await page.getByText("Ordre alphabétique des noms de famille.").waitFor({ timeout: 30000 });
  await page.waitForTimeout(800);

  const etat = () => page.evaluate(() => {
    const tous = [...document.querySelectorAll("*")].filter(e => {
      const c = getComputedStyle(e);
      return /auto|scroll/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 40;
    });
    const e = tous[0];
    /* Les parents qui coupent : overflow hidden sur un ancetre bloque le defilement. */
    const coupants = [];
    for (let p = e && e.parentElement; p; p = p.parentElement) {
      const c = getComputedStyle(p);
      if (c.overflowY === "hidden" || c.overflowX === "hidden") coupants.push(p.tagName + "." + String(p.className).slice(0, 24) + " overflow:" + c.overflow);
    }
    return e ? {
      scrollers: tous.length, haut: Math.round(e.scrollTop), max: Math.round(e.scrollHeight - e.clientHeight),
      tactile: getComputedStyle(e).webkitOverflowScrolling || "(non expose)",
      rebond: getComputedStyle(e).overscrollBehavior || "(non expose)",
      coupants,
    } : null;
  });

  const d = await etat();
  dit("conteneur : " + JSON.stringify(d));
  ok(d && d.scrollers === 1, `defilement : UN SEUL conteneur qui defile (lu : ${d ? d.scrollers : "aucun"})`);
  /* La liste est virtualisee : au premier rendu, seules ~12 lignes sont montees, et `max` vaut quelques
     centaines de pixels ; il grandit a mesure qu'on descend. Le seuil porte donc sur « ca depasse
     l'ecran », pas sur une hauteur finale — c'est la descente, plus bas, qui donne la vraie mesure. */
  ok(d && d.max > 300, `defilement : la liste depasse deja l'ecran de ${d ? d.max : 0} px (liste virtualisee)`);
  /* `body { overflow: hidden }` est pose par l'export web d'Expo : l'application possede la fenetre, et
     le defilement vit DANS son conteneur. Ce n'est donc pas un defaut en soi — on le RELEVE, et c'est le
     geste au doigt, juste en dessous, qui dit si le defilement marche vraiment. */
  dit("parents qui coupent : " + (d && d.coupants.length ? d.coupants.join(" ; ") : "aucun"));

  /* DESCENDRE AU DOIGT : un vrai balayage, comme le porteur. */
  const centre = { x: Math.round(IPHONE.viewport.width / 2), y: Math.round(IPHONE.viewport.height / 2) };
  /* ───── CE QUE CETTE SONDE NE PEUT PAS PROUVER ─────────────────────────────────────────────────
   * Le defilement AU DOIGT n'est pas simulable sur WebKit mobile. Deux methodes essayees, les deux
   * refusees par le moteur, le 13/11/2026 :
   *   - `page.mouse.wheel` -> « Mouse wheel is not supported in mobile WebKit » ;
   *   - `new Touch(...)` dans la page -> « TypeError: Illegal constructor » (WebKit n'expose pas ce
   *     constructeur ; son API tactile historique, document.createTouch, a une signature qui change
   *     d'une version a l'autre).
   * `page.touchscreen` ne sait que TAPER, pas glisser.
   *
   * Ecrire `element.scrollTop = 0` marcherait — et ne prouverait RIEN : c'est exactement ce que
   * faisaient les tests Chromium, et c'est pourquoi ils n'ont jamais reproduit le bug du porteur.
   * On ne remplace donc pas une mesure par une apparence de mesure : on releve l'etat du conteneur,
   * on le dit, et on s'arrete la. */
  dit("defilement au doigt : NON PROUVABLE ici (ni molette ni Touch sur WebKit mobile) — a verifier sur un vrai iPhone");
  dit("etat releve : -webkit-overflow-scrolling=" + (d ? d.tactile : "?") + ", overscroll-behavior=" + (d ? d.rebond : "?"));
  /* Ce qui reste verifiable sans geste : le conteneur PEUT atteindre le haut et le bas. Si ceci echoue,
     le defaut n'est meme pas tactile. */
  await page.evaluate(() => {
    const e = [...document.querySelectorAll("*")].find(x => { const c = getComputedStyle(x); return /auto|scroll/.test(c.overflowY) && x.scrollHeight > x.clientHeight + 40; });
    if (e) e.scrollTop = e.scrollHeight;
  });
  await page.waitForTimeout(500);
  const bas = await etat();
  ok(bas && bas.haut > 600 && bas.max > 1000, `defilement : le conteneur atteint le bas (${bas ? bas.haut : 0} px sur ${bas ? bas.max : 0}) — mesure SANS geste`);
  await page.evaluate(() => {
    const e = [...document.querySelectorAll("*")].find(x => { const c = getComputedStyle(x); return /auto|scroll/.test(c.overflowY) && x.scrollHeight > x.clientHeight + 40; });
    if (e) e.scrollTop = 0;
  });
  await page.waitForTimeout(500);
  const retour = await etat();
  ok(retour && retour.haut === 0, `defilement : le conteneur revient a zero (${retour ? retour.haut : "?"} px) — mesure SANS geste`);
  if (CAP) await page.screenshot({ path: `${CAP}/webkit-defilement.png` });
  ok(erreurs.length === 0, "defilement : aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));
  await ctx.close();
}

/* ───── 4. LA FRISE DES RANGS (14/11/2026) : le porteur voit, sur iPhone, les cercles et le trait se chevaucher ─────
   Chromium ne montrait AUCUN défaut, avant comme après le correctif : seul WebKit peut dire quelque chose. On imprime
   la géométrie lue (cercles, segments), puis on juge : le fil passe au centre de chaque jalon, le jalon est au-dessus,
   deux jalons ne se touchent pas. La capture webkit-rangs.png est la pièce à regarder. */
{
  const { ctx, page, erreurs } = await neuf();
  await page.addInitScript(p => localStorage.setItem("repere.profil", JSON.stringify(p)), { ...PROFIL, animationsReduites: true });
  await page.goto(BASE + "/quiz", { waitUntil: "load" });
  await page.getByRole("radio").first().waitFor({ timeout: 30000 });
  await page.getByRole("radio").first().click();
  for (let i = 0; i < 4; i++) { await page.getByRole("button", { name: "Question suivante" }).click(); await page.getByRole("radio").first().click(); }
  await page.getByRole("button", { name: "Voir le résultat" }).click();
  await page.getByTestId("voir-rangs").waitFor({ timeout: 10000 });
  await page.getByTestId("voir-rangs").click();
  await page.getByRole("heading", { name: "Les rangs" }).waitFor({ timeout: 10000 });
  await page.waitForTimeout(900);
  if (CAP) await page.screenshot({ path: `${CAP}/webkit-rangs.png` });
  const frise = await page.getByTestId("rang-ligne").evaluateAll(n => n.map(e => {
    const jalon = e.querySelector('[data-testid="rang-jalon"]');
    const fils = [...e.querySelectorAll('[data-testid="rang-fil"]')].map(f => f.getBoundingClientRect());
    if (!jalon) return null;
    const j = jalon.getBoundingClientRect(), cx = j.left + j.width / 2, cy = j.top + j.height / 2;
    const dessus = document.elementFromPoint(cx, cy);
    return { haut: Math.round(j.top), bas: Math.round(j.bottom), l: Math.round(j.width), h: Math.round(j.height),
      fils: fils.map(r => [Math.round(r.top), Math.round(r.bottom), Math.round(r.left + r.width / 2 - cx)]),
      traverse: fils.some(r => r.top <= cy + 1 && r.bottom >= cy - 1 && Math.abs(r.left + r.width / 2 - cx) <= 1),
      dessus: !!dessus && jalon.contains(dessus) };
  }));
  dit("frise lue (jalon haut/bas/l/h, segments [haut, bas, écart au centre]) : " + JSON.stringify(frise));
  ok(frise.length === 4 && frise.every(f => f && f.l === 40 && f.h === 40), "rangs : quatre jalons de 40 px, aucun écrasé ni étiré");
  ok(frise.every(f => f && f.traverse), "rangs : le fil passe par le centre de chaque jalon");
  ok(frise.every(f => f && f.dessus), "rangs : chaque jalon est peint au-dessus du fil");
  ok(frise.every((f, i) => i === 0 || (f && frise[i - 1] && f.haut - frise[i - 1].bas >= 8)), "rangs : deux jalons ne se touchent jamais (écarts : " + frise.slice(1).map((f, i) => f && frise[i] ? f.haut - frise[i].bas : "?").join(", ") + " px)");
  ok(erreurs.length === 0, "rangs : aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));
  await ctx.close();
}

await nav.close();
console.log(echecs ? `== DIAGNOSTIC WEBKIT : ${echecs} echec(s) ==` : "== DIAGNOSTIC WEBKIT : zero echec ==");
process.exit(echecs ? 1 : 0);
