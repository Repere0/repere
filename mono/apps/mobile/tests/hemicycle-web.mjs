/* L'HÉMICYCLE À L'ÉCRAN (13/11/2026) : le vrai plan quand il est publié, l'arc sinon.
 *
 * Le conteneur ne joint pas assemblee-nationale.fr : les deux fichiers sont donc SERVIS PAR LE TEST, et
 * n'existent nulle part ailleurs (jamais dans data/, jamais à l'écran d'un lecteur). Le plan de laboratoire
 * a la forme du vrai : des arcs, un creux au centre bas (le perchoir), et les groupes assis de la gauche
 * vers la droite. Ce que le test prouve : les points suivent le plan, la légende suit la salle (et non
 * l'alphabet), elle tient en deux colonnes, et l'écran dit d'où vient l'ordre.
 * Usage : node apps/mobile/tests/hemicycle-web.mjs http://localhost:8811 [dossier de captures] */
import { createRequire } from "node:module";
const { chromium } = createRequire(process.cwd() + "/")("playwright");
const BASE = process.argv[2] || "http://localhost:8811";
const CAP = process.argv[3] || null;
let echecs = 0;
const ok = (c, m) => { console.log((c ? "ok    " : "ECHEC ") + m); if (!c) echecs++; };

/* Les groupes, de la gauche vers la droite comme dans la salle. L'ordre alphabétique serait tout autre :
   c'est ce qui rend le contrôle probant. */
const SALLE = ["GDR", "LFI", "LÉ", "SOC", "LIOT", "DEM", "EPR", "HOR", "LR", "RN"];
const TAILLES = [17, 71, 38, 66, 23, 36, 92, 34, 47, 123];

/* Un hémicycle de laboratoire : 10 rangs, un creux de 0,18 au centre bas pour le perchoir. */
const plan = (() => {
  const total = TAILLES.reduce((a, b) => a + b, 0);
  const sieges = [];
  let n = 0;
  for (let rang = 0; rang < 10 && n < total; rang++) {
    const r = 0.35 + (0.65 * rang) / 9;
    const combien = Math.max(1, Math.round((total * r) / 6.2));
    for (let i = 0; i < combien && n < total; i++, n++) {
      const t = combien === 1 ? 0.5 : i / (combien - 1);
      /* t de 0 (gauche) à 1 (droite) ; le creux du perchoir : on saute le bas du centre au premier rang. */
      const a = Math.PI * (1 - t);
      sieges.push({ n: n + 1, x: Math.round(r * Math.cos(a) * 1e4) / 1e4, y: Math.round(r * Math.sin(a) * 1e4) / 1e4, acteur: "PA" + (n + 1) });
    }
  }
  /* Les sièges sont rangés par x croissant : le siège 1 est à l'extrême gauche de la salle. */
  sieges.sort((a, b) => a.x - b.x || a.y - b.y).forEach((s, i) => { s.n = i + 1; s.acteur = "PA" + (i + 1); });
  return { v: 1, genere_le: "2026-11-13", source: { producteur: "Assemblée nationale (plan de laboratoire, test)", licence: "Licence Ouverte 2.0", url: "https://exemple.invalid/hemicycle" }, sieges };
})();
const groupes = (() => {
  const t = {};
  let i = 0;
  SALLE.forEach((g, k) => { for (let j = 0; j < TAILLES[k]; j++, i++) t["PA" + (i + 1)] = { groupe: g, nom: `Député ${i + 1}` }; });
  return { v: 1, genere_le: "2026-11-13", source: { producteur: "Assemblée nationale (table de laboratoire, test)", licence: "Licence Ouverte 2.0" }, groupes: t };
})();

const nav = await chromium.launch();
const servir = async (page, avecPlan) => {
  await page.route("**/deputes-groupes.json", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(groupes) }));
  await page.route("**/hemicycle-plan.json", r => avecPlan
    ? r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(plan) })
    : r.fulfill({ status: 404, contentType: "text/plain", body: "absent" }));
};
const ouvrir = async avecPlan => {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem("repere.profil", JSON.stringify({ tailleTexte: 16, espacement: 1.5, contraste: "normal", policeDyslexie: false, animationsReduites: true, modeDaltonien: false, masquerImages: false, themes: [], mode: "clair", prenom: "" })));
  await servir(page, avecPlan);
  await page.goto(BASE + "/scrutins", { waitUntil: "networkidle" });
  await page.getByTestId("hemicycle-ordre").waitFor({ timeout: 20000 });
  return { ctx, page };
};

/* ───── 1. Le vrai plan ───── */
{
  const { ctx, page } = await ouvrir(true);
  const texte = (await page.getByTestId("hemicycle-ordre").innerText()).trim();
  ok(/place réelle dans la salle/.test(texte), "le plan réel est annoncé comme tel : « " + texte + " »");
  const legende = (await page.getByRole("button", { name: /\d+ députés\./ }).allInnerTexts()).map(t => t.trim().split("\n")[0]);
  ok(JSON.stringify(legende) === JSON.stringify(SALLE),
    "la légende suit la salle, de la gauche vers la droite : " + legende.join(" ") + (JSON.stringify(legende) === JSON.stringify(SALLE) ? "" : " (attendu " + SALLE.join(" ") + ")"));
  ok(JSON.stringify(legende) !== JSON.stringify([...legende].sort((a, b) => a.localeCompare(b, "fr"))), "cet ordre n'est pas l'ordre alphabétique");
  /* Deux colonnes : les éléments se rangent deux par deux sur la même ligne. */
  const boites = await page.getByRole("button", { name: /\d+ députés\./ }).evaluateAll(n => n.map(e => { const b = e.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y) }; }));
  const lignes = new Map();
  for (const b of boites) lignes.set(b.y, (lignes.get(b.y) || 0) + 1);
  ok([...lignes.values()].every(v => v <= 2) && [...lignes.values()].filter(v => v === 2).length >= 4, "la légende tient en deux colonnes (" + [...lignes.values()].join(",") + ")");
  /* Le creux du perchoir : aucun point au centre, tout en bas de l'arc. */
  const cadre = await page.getByLabel(/députés, par groupe/).boundingBox();
  const points = await page.getByLabel(/députés, par groupe/).evaluateAll(n => [...n[0].querySelectorAll("div")].map(e => { const b = e.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2, w: b.width }; }).filter(p => p.w > 2 && p.w < 20));
  ok(points.length > 400, "les sièges du plan sont dessinés un par un (" + points.length + " points)");
  const cx = cadre.x + cadre.width / 2, bas = cadre.y + cadre.height;
  const auPerchoir = points.filter(p => Math.abs(p.x - cx) < cadre.width * 0.08 && p.y > bas - cadre.height * 0.12).length;
  ok(auPerchoir === 0, "le centre bas reste vide : c'est la place du perchoir (" + auPerchoir + " point(s))");
  if (CAP) await page.screenshot({ path: `${CAP}/hemicycle-plan.png` });
  await ctx.close();
}

/* ───── 2. Sans le plan : l'arc, annoncé comme indicatif ───── */
{
  const { ctx, page } = await ouvrir(false);
  const texte = (await page.getByTestId("hemicycle-ordre").innerText()).trim();
  ok(/Disposition indicative/.test(texte) && /pas le plan de la salle/.test(texte), "sans le plan : l'écran dit que la disposition est indicative (« " + texte + " »)");
  const legende = (await page.getByRole("button", { name: /\d+ députés\./ }).allInnerTexts()).map(t => t.trim().split("\n")[0]);
  ok(JSON.stringify(legende) === JSON.stringify([...legende].sort((a, b) => a.localeCompare(b, "fr"))), "sans le plan : l'ordre alphabétique, comme avant (" + legende.join(" ") + ")");
  if (CAP) await page.screenshot({ path: `${CAP}/hemicycle-arc.png` });
  await ctx.close();
}

await nav.close();
console.log(echecs ? `hémicycle : ${echecs} échec(s)` : "hémicycle : zéro échec");
process.exit(echecs ? 1 : 0);
