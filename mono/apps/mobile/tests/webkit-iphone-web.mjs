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
const PROFIL = { tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: false, modeDaltonien: false, masquerImages: false, themes: [], mode: "clair", prenom: "", points: 0 };
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
    }
  }
  if (CAP) await page.screenshot({ path: `${CAP}/webkit-onboarding.png` });
  ok(erreurs.length === 0, "onboarding : aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));
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
  ok(d && d.max > 800, `defilement : la liste depasse l'ecran de ${d ? d.max : 0} px`);
  /* `body { overflow: hidden }` est pose par l'export web d'Expo : l'application possede la fenetre, et
     le defilement vit DANS son conteneur. Ce n'est donc pas un defaut en soi — on le RELEVE, et c'est le
     geste au doigt, juste en dessous, qui dit si le defilement marche vraiment. */
  dit("parents qui coupent : " + (d && d.coupants.length ? d.coupants.join(" ; ") : "aucun"));

  /* DESCENDRE AU DOIGT : un vrai balayage, comme le porteur. */
  const centre = { x: Math.round(IPHONE.viewport.width / 2), y: Math.round(IPHONE.viewport.height / 2) };
  /* LE DOIGT, POUR DE VRAI. `mouse.wheel` n'existe pas sur WebKit mobile (« Mouse wheel is not supported
     in mobile WebKit », releve par cette sonde le 13/11/2026) et `touchscreen` ne sait que taper. On
     synthetise donc touchstart / touchmove / touchend sur le conteneur, comme un pouce qui glisse. */
  const balayer = async (dy, n = 6) => {
    for (let i = 0; i < n; i++) {
      await page.evaluate(({ dy, x, y }) => {
        const cible = [...document.querySelectorAll("*")].find(e => {
          const c = getComputedStyle(e);
          return /auto|scroll/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 40;
        }) || document.body;
        const touche = (type, cy) => {
          const t = new Touch({ identifier: 1, target: cible, clientX: x, clientY: cy, pageX: x, pageY: cy });
          cible.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: type === "touchend" ? [] : [t], targetTouches: type === "touchend" ? [] : [t], changedTouches: [t] }));
        };
        /* Le doigt part de `y` et glisse de -dy (vers le haut pour descendre dans la liste). */
        touche("touchstart", y);
        for (let k = 1; k <= 8; k++) touche("touchmove", y - (dy * k) / 8);
        touche("touchend", y - dy);
      }, { dy, x: centre.x, y: centre.y });
      await page.waitForTimeout(180);
    }
    await page.waitForTimeout(700);
  };
  await balayer(400);
  const bas = await etat();
  dit("apres balayage vers le bas : " + JSON.stringify(bas && { haut: bas.haut, max: bas.max }));
  if (bas && bas.haut === 0) dit("ATTENTION : le geste synthetise n'a rien bouge — WebKit peut ignorer un TouchEvent fabrique ; dans ce cas ce controle ne prouve rien, ni dans un sens ni dans l'autre.");
  ok(bas && bas.haut > 300, `defilement : on descend au doigt (lu : ${bas ? bas.haut : 0} px sur ${bas ? bas.max : 0})`);

  /* LE BUG DU PORTEUR : en bas, on ne remonte plus. */
  await balayer(-400, 14);
  const retour = await etat();
  dit("apres balayage vers le haut : " + JSON.stringify(retour && { haut: retour.haut }));
  ok(retour && retour.haut === 0, `defilement : ON REMONTE au doigt jusqu'en haut (lu : ${retour ? retour.haut : "?"} px)`);
  if (CAP) await page.screenshot({ path: `${CAP}/webkit-defilement.png` });
  ok(erreurs.length === 0, "defilement : aucune erreur JavaScript" + (erreurs[0] ? " (" + erreurs[0] + ")" : ""));
  await ctx.close();
}

await nav.close();
console.log(echecs ? `== DIAGNOSTIC WEBKIT : ${echecs} echec(s) ==` : "== DIAGNOSTIC WEBKIT : zero echec ==");
process.exit(echecs ? 1 : 0);
