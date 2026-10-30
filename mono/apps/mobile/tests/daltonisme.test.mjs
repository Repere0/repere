/* DALTONISME — LA VARIANTE DE VOTE SE DISTINGUE SOUS SIMULATION (V29 bloc 3, D56).
 *
 * On simule la protanopie et la deutéranopie (Machado, Oliveira & Fernandes 2009, sévérité 1,0),
 * puis on mesure l'écart ΔE76 (CIELAB) entre pour / contre / abstention. Un écart inférieur à 20
 * se voit mal à l'écran : le test échoue. Le mode normal n'est pas testé ici (rouge et vert, il
 * ne doit pas être choisi par les personnes daltoniennes) ; son écart est seulement affiché.
 * Le test lit les vraies valeurs de palette.ts. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { COULEURS_VOTE, COULEURS_VOTE_DALTONIEN } from "../src/lib/palette.ts";

const SEUIL_DELTA_E = 20;
const MATRICES = {
  protanopie: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deuteranopie: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
};
const lineaire = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const gamma = x => { x = Math.min(Math.max(x, 0), 1); return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055) * 255); };
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function simuler(h, m) {
  const c = rgb(h).map(lineaire);
  return m.map(l => gamma(l[0] * c[0] + l[1] * c[1] + l[2] * c[2]));
}
function lab([r, g, b]) {
  const [R, G, B] = [r, g, b].map(lineaire);
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047;
  const Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  const Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const deltaE = (a, b) => Math.hypot(...lab(a).map((v, i) => v - lab(b)[i]));
const paires = [[0, 1, "pour / contre"], [0, 2, "pour / abstention"], [1, 2, "contre / abstention"]];

test("daltonisme — la variante se distingue sous protanopie et deutéranopie", () => {
  const trio = [COULEURS_VOTE_DALTONIEN.votePour, COULEURS_VOTE_DALTONIEN.voteContre, COULEURS_VOTE_DALTONIEN.voteAbstention];
  const fautes = [];
  for (const [nom, m] of Object.entries(MATRICES)) {
    const vus = trio.map(h => simuler(h, m));
    for (const [i, j, libelle] of paires) {
      const d = deltaE(vus[i], vus[j]);
      if (d < SEUIL_DELTA_E) fautes.push(`${nom} ${libelle} : ΔE ${d.toFixed(1)} < ${SEUIL_DELTA_E}`);
    }
  }
  assert.deepEqual(fautes, [], fautes.join(" | "));
});

test("daltonisme — le mode normal est mesuré, pas caché (information, sans seuil)", () => {
  const trio = [COULEURS_VOTE.votePour, COULEURS_VOTE.voteContre, COULEURS_VOTE.voteAbstention];
  for (const [nom, m] of Object.entries(MATRICES)) {
    const vus = trio.map(h => simuler(h, m));
    const d = paires.map(([i, j]) => deltaE(vus[i], vus[j]).toFixed(1));
    console.log(`  [info] mode normal, ${nom} : ΔE pour/contre, pour/abstention, contre/abstention = ${d.join(", ")}`);
  }
  assert.ok(true);
});
