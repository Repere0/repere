/* GARDE : une commune partagee entre plusieurs circonscriptions n'a pas UN depute
 * (15/10/2026). La chaine ne nomme personne a l'echelon Assemblee nationale ; une
 * commune a une seule circonscription garde son depute. Cas reels de la donnee :
 * Versailles [1,2], Colombes [1,2], Courbevoie [3,6], Paris [1..18]. Lancer :
 * node --test tests/circos-multiples.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";

const { chaineDecision } = await import("../packages/core/src/index.js");

const index = { departements: [{ code: "77", nom: "Seine-et-Marne", region: "Île-de-France", region_code: "11" }] };
const deputes = {
  deputes: {
    "77-1": { prenom: "Ana", nom: "Première", acteurRef: "PA1" },
    "77-2": { prenom: "Ben", nom: "Deuxième", acteurRef: "PA2" },
    "77-6": { prenom: "Béatrice", nom: "Roullaud", acteurRef: "PA6" },
  },
};
const france = fiche => chaineDecision({ fiche: { nom: "X", maire: null, ...fiche }, paquet: {}, index, deputes, elusRegion: null, dep: "77" })
  .find(n => n.echelon === "france");

test("deux circonscriptions : aucun depute n'est nomme, et le nombre est dit", () => {
  const n = france({ circo: [1, 2] });
  assert.equal(n.personne, null, "une commune a deux circonscriptions ne doit pas avoir UN depute");
  assert.equal(n.autresCircos, 1);
});

test("Paris (dix-huit circonscriptions) : aucun depute n'est nomme", () => {
  const n = france({ circo: Array.from({ length: 18 }, (_, i) => i + 1) });
  assert.equal(n.personne, null);
});

test("une seule circonscription : le depute de la commune est nomme", () => {
  const n = france({ circo: 6 });
  assert.equal(n.personne && n.personne.nom, "Béatrice Roullaud");
  assert.equal(n.autresCircos, 0);
});

test("une commune sans circonscription connue ne nomme personne", () => {
  assert.equal(france({ circo: null }).personne, null);
});
