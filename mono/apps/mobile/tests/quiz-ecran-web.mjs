// Le quiz a son propre écran, atteignable depuis l'accueil (12/11/2026). Usage : node apps/mobile/tests/quiz-ecran-web.mjs http://localhost:8811
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };
const nav = await chromium.launch();
const page = await (await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false , points: 0})));
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
await page.getByTestId("quiz-score").waitFor({ timeout: 8000 });
ok(await page.getByRole("button", { name: "Nouvelle manche" }).count() === 1, "fin de manche : « Nouvelle manche »");
/* 13/11/2026 : l'écran de fin refondu — le score en très gros, une phrase courte, la jauge. */
const score = (await page.getByTestId("quiz-score").innerText()).trim();
ok(/^\d+ \/ 5$/.test(score), "fin de manche : le score en grand (« " + score + " »)");
const tailleScore = await page.getByTestId("quiz-score").evaluate(e => parseFloat(getComputedStyle(e).fontSize));
ok(tailleScore >= 56, "fin de manche : le score est vraiment grand (" + tailleScore + " px)");
const justesLues = Number(score.split("/")[0].trim());
const teinte = await page.getByTestId("quiz-score").evaluate(e => getComputedStyle(e).color);
const attendue = justesLues >= 4 ? "rgb(74, 124, 89)" : justesLues <= 1 ? "rgb(170, 74, 74)" : null;
ok(attendue === null || teinte === attendue, `fin de manche : la couleur du score suit le résultat (${justesLues}/5 -> ${teinte})`);
ok((await page.getByTestId("quiz-phrase").innerText()).trim().length > 0, "fin de manche : une phrase courte, pas un paragraphe");
ok((await page.getByTestId("quiz-local").innerText()).trim() === "100 % local, aucune donnée collectée.", "fin de manche : la mention discrète remplace le paragraphe");
/* Le test répond au hasard (première carte) : on compare donc les points au nombre de justes annoncé. */
const justes = Number((await page.getByTestId("quiz-score").innerText()).trim().split("/")[0].trim());
const profil = await page.evaluate(() => JSON.parse(localStorage.getItem("repere.profil") || "null"));
ok(profil && profil.points === justes * 10, `${justes} réponse(s) juste(s) = ${justes * 10} points dans repere.profil (${profil && profil.points})`);
const apres = await page.evaluate(() => Object.keys(localStorage).concat(Object.keys(sessionStorage)));
ok(apres.every(k => ["repere.departement", "repere.profil"].includes(k)), "aucune clé de stockage en plus pour les points (invariant 2) : " + apres.join(","));
ok(await page.getByRole("button", { name: /^Partager mon rang/ }).count() === 1, "fin de manche : le partage du rang");
/* ─── 13/11/2026 (porteur) : la progression vers le rang suivant, et la liste des rangs ─── */
const prog = (await page.getByTestId("quiz-progression").innerText()).replace(/\s+/g, " ").trim();
ok(/^\d+ pts \/ 51 pts pour Citoyen \d+ %$/.test(prog), "fin de manche : la jauge vers le rang suivant (« " + prog + " »)");
const barre = await page.getByTestId("quiz-progression").evaluate(e => {
  /* Le fond de la jauge : le seul div qui contient un div et fait 14 px de haut. */
  const fond = [...e.querySelectorAll("div")].find(d => d.querySelector("div") && Math.round(d.getBoundingClientRect().height) === 14);
  const plein = fond && fond.querySelector("div");
  return fond && plein ? Math.round((plein.getBoundingClientRect().width / fond.getBoundingClientRect().width) * 100) : -1;
});
ok(barre >= 0 && barre <= 100, "fin de manche : la barre est remplie à " + barre + " %");
await page.getByTestId("voir-rangs").click();
await page.getByRole("heading", { name: "Les rangs" }).waitFor({ timeout: 10000 });
const lignes = await page.getByTestId("rang-ligne").allInnerTexts();
ok(lignes.length === 4, "la modale montre les quatre rangs (" + lignes.length + ")");
const joint = lignes.join(" | ").replace(/\s+/g, " ");
for (const [nom, points] of [["Néo-citoyen", "de 0 à 50 points"], ["Citoyen", "de 51 à 200 points"], ["Super Citoyen", "de 201 à 500 points"], ["Sage", "501 points et plus"]]) {
  ok(joint.includes(nom) && joint.includes(points), `la modale dit « ${nom} » et « ${points} »`);
}
ok(/votre rang/.test(joint), "la roadmap marque le rang atteint");
/* La roadmap : les rangs à venir sont grisés, le rang atteint ne l'est pas. */
const opacites = await page.getByTestId("rang-ligne").evaluateAll(n => n.map(e => {
  const t = [...e.querySelectorAll("div")].find(d => parseFloat(getComputedStyle(d).opacity) < 1);
  return t ? parseFloat(getComputedStyle(t).opacity) : 1;
}));
ok(opacites[0] === 1 && opacites.slice(1).every(o => o < 1), "la roadmap grise les rangs à venir (" + opacites.join(", ") + ")");
/* 14/11/2026 (porteur, iPhone) : les cercles et le trait de la frise se chevauchaient. Le trait est maintenant UN fil
   posé DERRIÈRE les jalons : il traverse chaque cercle, et c'est le cercle, opaque, qu'on voit au-dessus. */
await page.waitForTimeout(600); /* la modale glisse : on mesure une fois posée, sinon le point visé est hors écran */
const frise = await page.getByTestId("rang-ligne").evaluateAll(n => n.map(e => {
  const jalon = e.querySelector('[data-testid="rang-jalon"]');
  const fils = [...e.querySelectorAll('[data-testid="rang-fil"]')];
  if (!jalon) return null;
  const j = jalon.getBoundingClientRect(), cx = j.left + j.width / 2, cy = j.top + j.height / 2;
  const dessus = document.elementFromPoint(cx, cy);
  return { fils: fils.length, traverse: fils.some(f => { const r = f.getBoundingClientRect(); return r.top <= cy + 1 && r.bottom >= cy - 1 && Math.abs(r.left + r.width / 2 - cx) <= 1; }),
    cercleDessus: !!dessus && jalon.contains(dessus), opaque: !/rgba\(.*,\s*0\)$|transparent/.test(getComputedStyle(jalon).backgroundColor),
    bas: Math.round(Math.max(...fils.map(f => f.getBoundingClientRect().bottom), 0) - e.getBoundingClientRect().bottom) };
}));
ok(frise.every(f => f && f.traverse), "frise des rangs : le fil passe par le centre de chaque jalon (" + JSON.stringify(frise.map(f => f && f.fils)) + " segments)");
ok(frise.every(f => f && f.cercleDessus && f.opaque), "frise des rangs : chaque jalon est opaque et peint AU-DESSUS du fil (" + JSON.stringify(frise.map(f => f && [f.cercleDessus, f.opaque])) + ")");
ok(frise.slice(0, -1).every(f => f && f.bas === 0), "frise des rangs : le fil descend jusqu'au rang suivant, sans trou (" + frise.map(f => f && f.bas).join(", ") + ")");
if (process.argv[3]) await page.screenshot({ path: process.argv[3] + "/quiz-rangs.png" });
ok(await page.getByTestId("quiz-rejouer").count() === 1, "« Nouvelle manche » est le bouton principal");
const plein = await page.getByTestId("quiz-rejouer").evaluate(e => getComputedStyle(e).backgroundColor);
ok(plein === "rgb(15, 23, 42)" || plein === "rgb(245, 244, 240)", "« Nouvelle manche » est un bouton plein (" + plein + ")");
ok(!/classement|palmarès|meilleur/i.test(joint), "la modale ne compare personne : ce sont des paliers, pas un palmarès");
await page.getByRole("button", { name: "Fermer la liste des rangs" }).click();
await page.waitForTimeout(400);
ok(await page.getByRole("heading", { name: "Les rangs" }).count() === 0, "la modale se ferme");
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
