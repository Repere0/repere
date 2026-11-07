/* HÉMICYCLE (07/11/2026) : l'ordre des groupes ne dépend jamais de leur taille (invariant 3),
   chaque député a exactement un siège, et les sièges vont de la gauche vers la droite. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { compositionGroupes, siegesHemicycle } from "../packages/core/src/index.js";

test("composition : ordre alphabétique, jamais par taille ; Inconnu en dernier", () => {
  const noms = [...Array(90).fill("RN"), ...Array(3).fill("DEM"), "Inconnu", ...Array(40).fill("EPR"), "", null];
  assert.deepEqual(compositionGroupes(noms), [
    { groupe: "DEM", sieges: 3 }, { groupe: "EPR", sieges: 40 }, { groupe: "RN", sieges: 90 }, { groupe: "Inconnu", sieges: 1 },
  ]);
  assert.deepEqual(compositionGroupes(null), []);
});

test("sièges : un par député, dans le demi-disque, de gauche à droite", () => {
  for (const n of [1, 7, 120, 577]) {
    const s = siegesHemicycle(n);
    assert.equal(s.length, n);
    for (const p of s) assert.ok(p.y >= -1e-9 && Math.hypot(p.x, p.y) <= 1 + 1e-9);
  }
  const s = siegesHemicycle(577);
  assert.ok(s[0].x < 0 && s.at(-1).x > 0, "le premier siège à gauche, le dernier à droite");
  assert.deepEqual(siegesHemicycle(0), []);
});

import { groupesACerner } from "../packages/core/src/index.js";
test("contours : le second de deux couleurs proches est cerné ; les couleurs éloignées non", () => {
  /* Des gris fictifs : aucune couleur hors de palette.ts (garde de l invariant 7). */
  const c = { A: "#202020", B: "#303030", D: "#F0F0F0", E: "#808080", Inconnu: "#808080" };
  const r = groupesACerner(["A", "B", "E", "D", "Inconnu"], g => c[g]);
  assert.deepEqual([...r], ["B", "Inconnu"]);
  assert.equal(groupesACerner([], g => c[g]).size, 0);
});
