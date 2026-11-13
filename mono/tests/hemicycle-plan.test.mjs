/* LE PLAN DE L'HEMICYCLE (13/11/2026) : le parseur, eprouve sur un extrait RECOPIE de l'echantillon que le
 * runner a pris sur assemblee-nationale.fr le 13/11/2026 (le conteneur ne joint pas la source). Chaque
 * morceau ci-dessous vient de ce journal, tel quel : les deux sieges, le decor sans class="place", et la
 * forme de data-siegeData. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { appliquerTransform, centreDuTrace, collecter, occupantsDuPlan, planNormalise, siegesDuPlan, SIEGES_MIN } from "../scripts/collecte-hemicycle.mjs";

const SIEGE = (n, x, y) => `<a href=""><path transform="matrix(0.28,0,0,0.28,0,0)"\n d="M${x} ${y}l-7.872 1.863-7.426 2.09 3.176 9.748 7.364-2.057 6.885-1.62-2.128-10.022z"\n class="place" id="p${n}"/></a>`;
const DECOR = `<a><path transform="matrix(0.28,0,0,0.28,0,0)" d="M388.578 0l.415 4.494" fill="#BBBBBB" stroke-linejoin="round" /><title>Bancs des commissions</title></a>`;

const page = (sieges, occupants) => `<div class="@HemicycleCarte hemicycle-carte"
 data-siegeData="${JSON.stringify(Object.fromEntries(Object.entries(occupants).map(([n, pa]) =>
   [n, { couleur: "#" + "F5B4CE", tooltipUrl: `/dyn/embed/acteur-presentation/${pa}` }])))
   .replace(/"/g, "&quot;").replace(/\//g, "\\/")}"
 data-initialSiege="0">
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 237 164" class="hemicycle-carte">
 ${DECOR}
 ${sieges.join("\n")}
 </svg></div>`;

test("plan : un siege donne son centre, pas son premier point ; la matrice est appliquee", () => {
  /* Le trace de l'echantillon (p331) : un petit polygone de 7 sommets autour de (381, 252). */
  const c = centreDuTrace("M384.657 247.488l-7.872 1.863-7.426 2.09 3.176 9.748 7.364-2.057 6.885-1.62-2.128-10.022z");
  assert.ok(c && Math.abs(c.x - 379.239) < 0.01 && Math.abs(c.y - 253.372) < 0.01, `centre inattendu : ${JSON.stringify(c)}`);
  assert.notEqual(Math.round(c.x), 385, "le centre n'est pas le point de depart du trace");
  const p = appliquerTransform("matrix(0.28,0,0,0.28,0,0)", c);
  assert.ok(Math.abs(p.x - c.x * 0.28) < 1e-9 && Math.abs(p.y - c.y * 0.28) < 1e-9);
  assert.equal(appliquerTransform("rotate(10)", c), null, "une transformation non geree ecarte le siege");
});

test("plan : les decimales sans zero (« -.026 ») et les commandes fermantes sont lues", () => {
  const c = centreDuTrace("M415.976 243.474l-.026 10.26-7.576.513-7.085.774-1.057-10.195 7.444-.804 8.3-.546z");
  assert.ok(c && Math.abs(c.x - 409.353) < 0.01 && Math.abs(c.y - 248.4) < 0.01, `centre inattendu : ${JSON.stringify(c)}`);
});

test("plan : seuls les <path class=\"place\" id=\"pN\"> sont des sieges ; le decor est ecarte", () => {
  const html = page([SIEGE(331, 384.657, 247.488), SIEGE(329, 415.976, 243.474)], { 331: "PA1008" });
  const lus = siegesDuPlan(html);
  assert.equal(lus.length, 2, "le decor (« Bancs des commissions ») n'est pas un siege");
  assert.deepEqual(lus.map(s => s.n).sort((a, b) => a - b), [329, 331]);
});

test("plan : data-siegeData donne siege -> depute ; la couleur publiee est ignoree", () => {
  const html = page([SIEGE(410, 100, 100)], { 410: "PA1008", 417: "PA1567" });
  assert.deepEqual(occupantsDuPlan(html), { 410: "PA1008", 417: "PA1567" });
  assert.ok(!JSON.stringify(planNormalise(html)).includes("F5B4CE"), "aucune couleur de la page n'entre dans le plan (invariant 7)");
  assert.equal(occupantsDuPlan("<div>sans attribut</div>").constructor, Object);
  assert.deepEqual(occupantsDuPlan('<div data-siegeData="pas du json">'), {}, "un attribut illisible ne fait pas tomber la collecte");
});

test("plan : x va de -1 a 1 et y de 0 (bas) a 1 (haut), bornes prises sur les sieges eux-memes", () => {
  /* Trois sieges : un a gauche, un a droite, un plus haut dans les gradins (y plus petit sur la page). */
  const html = page([SIEGE(1, 100, 300), SIEGE(2, 300, 300), SIEGE(3, 200, 100)], { 1: "PA1", 2: "PA2", 3: "PA3" });
  const plan = planNormalise(html);
  const par = Object.fromEntries(plan.sieges.map(s => [s.n, s]));
  assert.ok(Math.abs(par[1].x + 1) < 0.02 && Math.abs(par[2].x - 1) < 0.02, "les extremes sont a -1 et 1");
  assert.ok(Math.abs(par[1].y) < 0.02 && Math.abs(par[3].y - 1) < 0.02, "le bas de la salle est a 0, le haut a 1");
  assert.equal(plan.occupes, 3);
  assert.equal(par[1].acteur, "PA1");
});

test("plan : refuser plutot qu'ecraser — trop peu de sieges, ou trop peu de deputes rattaches", async () => {
  const peu = page([SIEGE(1, 10, 10)], { 1: "PA1" });
  await assert.rejects(() => collecter(null, peu), /moins de 500/, "un plan amputé n'ecrase pas celui de la veille");
  const vide = "<html><body>la page a change de forme</body></html>";
  await assert.rejects(() => collecter(null, vide), /aucun siege lu/);
  const sieges = Array.from({ length: SIEGES_MIN + 10 }, (_, i) => SIEGE(i + 1, 10 + (i % 50) * 3, 10 + Math.floor(i / 50) * 7));
  const occupants = Object.fromEntries(sieges.slice(0, 100).map((_, i) => [i + 1, `PA${i + 1}`]));
  await assert.rejects(() => collecter(null, page(sieges, occupants)), /moins de 90 %/);
  const tous = Object.fromEntries(sieges.map((_, i) => [i + 1, `PA${i + 1}`]));
  const f = await collecter(null, page(sieges, tous));
  assert.equal(f.sieges.length, SIEGES_MIN + 10);
  assert.equal(f.source.producteur, "Assemblée nationale");
  assert.ok(f.source.licence && f.source.url && f.genere_le, "la provenance est ecrite dans le fichier");
});

/* ─── Le plan à l'écran : sièges occupés, groupes de la gauche vers la droite ─── */
const { groupesDansLaSalle, siegesDuPlan: siegesPourEcran } = await import("../packages/core/src/hemicycle.js");

test("plan à l'écran : un siège sans député n'est pas dessiné ; un député sans groupe reste « Inconnu »", () => {
  const plan = { sieges: [{ n: 1, x: -0.5, y: 0.2, acteur: "PA1" }, { n: 2, x: 0.5, y: 0.2 }, { n: 3, x: 0.1, y: 0.4, acteur: "PA9" }] };
  const s = siegesPourEcran(plan, ref => ({ PA1: "LFI" })[ref], "Inconnu");
  assert.equal(s.length, 2, "le siège vide est écarté");
  assert.deepEqual(s.map(x => x.groupe), ["LFI", "Inconnu"]);
  assert.deepEqual(siegesPourEcran(null, () => "LFI"), [], "sans plan, rien n'est dessiné (doctrine du vide)");
});

test("plan à l'écran : les groupes sont rangés par leur place dans la salle, « Inconnu » au bout", () => {
  const sieges = [
    { x: -0.9, y: 0.3, groupe: "GDR" }, { x: -0.8, y: 0.5, groupe: "GDR" },
    { x: 0.9, y: 0.3, groupe: "RN" }, { x: 0.1, y: 0.3, groupe: "EPR" },
    { x: -0.2, y: 0.3, groupe: "SOC" }, { x: 0.0, y: 0.9, groupe: "Inconnu" },
  ];
  assert.deepEqual(groupesDansLaSalle(sieges, "Inconnu").map(g => g.groupe), ["GDR", "SOC", "EPR", "RN", "Inconnu"]);
  assert.deepEqual(groupesDansLaSalle(sieges, "Inconnu").find(g => g.groupe === "GDR"), { groupe: "GDR", sieges: 2 });
  /* Deux groupes exactement à la même place : l'ordre ne saute pas d'une publication à l'autre. */
});

test("plan à l'écran : à place égale, l'ordre alphabétique départage (il ne saute pas d'un jour à l'autre)", () => {
  const a = [{ x: 0.2, y: 0.3, groupe: "ZZZ" }, { x: 0.2, y: 0.4, groupe: "AAA" }];
  assert.deepEqual(groupesDansLaSalle(a, "Inconnu").map(g => g.groupe), ["AAA", "ZZZ"]);
  assert.deepEqual(groupesDansLaSalle([...a].reverse(), "Inconnu").map(g => g.groupe), ["AAA", "ZZZ"]);
});
