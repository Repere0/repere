// Garde des fiches « impact concret » (V42, bloc 1). Lit data/contenu/impact-scrutins.json.
// Règles du brief : 15 à 20 fiches ; impact factuel (pas de jugement) ; null seulement si le titre
// ne permet pas d'écrire un impact (motion, amendement, titre tronqué) ; relecture CEO à false.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fiches = JSON.parse(readFileSync(path.join(RACINE, "data/contenu/impact-scrutins.json"), "utf8"));
const PROCEDURE = /^(La motion|L'amendement|Le sous-amendement|La proposition du Gouvernement)/;
// Vocabulaire de classement ou de jugement, interdit par l'invariant 3 et par le brief.
const JUGEMENT = /meilleur|pire|scandale|lobby|honteux|courageux/i;

test("15 à 20 fiches, numéros uniques", () => {
  assert.ok(fiches.length >= 15 && fiches.length <= 20, `${fiches.length} fiches`);
  assert.equal(new Set(fiches.map(f => f.n)).size, fiches.length);
});

test("chaque fiche : n, titre, lien officiel au bon format, relecture CEO à false", () => {
  for (const f of fiches) {
    assert.match(f.n, /^\d+$/);
    assert.ok(f.titre_officiel && f.titre_officiel.length > 20, `titre ${f.n}`);
    assert.equal(f.source_url, `https://www.assemblee-nationale.fr/dyn/17/scrutins/${f.n}`);
    assert.equal(f.relecture_ceo, false, `relecture ${f.n} doit rester false tant que le CEO n'a pas relu`);
  }
});

test("impact : null ou une à deux phrases, sans jugement, jamais vide", () => {
  for (const f of fiches) {
    if (f.impact_citoyen === null) continue;
    assert.equal(typeof f.impact_citoyen, "string", f.n);
    assert.ok(f.impact_citoyen.trim().length > 20 && f.impact_citoyen.length <= 230, `longueur ${f.n}`);
    assert.ok(!/  |\n/.test(f.impact_citoyen), `espaces ${f.n}`);
    assert.ok(!JUGEMENT.test(f.impact_citoyen), `jugement ${f.n}`);
  }
});

test("null seulement pour une motion, un amendement ou un titre tronqué", () => {
  for (const f of fiches.filter(f => f.impact_citoyen === null)) {
    const tronque = f.titre_officiel.endsWith("…") || /\(texte de la…?$/.test(f.titre_officiel);
    assert.ok(PROCEDURE.test(f.titre_officiel) || tronque, `null injustifié ${f.n}`);
  }
});
