// UN MOT TAPABLE NE MENE JAMAIS A UNE IMPASSE (H1, 29/10/2026).
//
// Sur l'application, un mot du dictionnaire (segment { t, mot }) est tapable : il
// ouvre sa definition. Un tap sans definition serait une impasse. Ces controles
// portent sur les fonctions reelles de @repere/core, pas sur une liste recopiee.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as core from "../../../packages/core/src/index.js";

const ICI = path.dirname(fileURLToPath(import.meta.url));

/* LE DICTIONNAIRE SE TROUVE DEPUIS « AUJOURD'HUI » (29/10/2026). Il n'avait qu'une
   porte d'entree (le Calendrier) et les mots tapables : un novice ne savait pas ou
   chercher un mot lu sur l'ecran. Le garde borne son extrait a la section « Aller
   plus loin » elle-meme : le commentaire d'en-tete porte la meme expression. */
test("le dictionnaire est atteignable depuis « Aujourd'hui », dans « Aller plus loin »", () => {
  const src = fs.readFileSync(path.join(ICI, "..", "src", "app", "(onglets)", "chez-vous.tsx"), "utf8");
  const debut = src.indexOf('<Etiquette texte="Aller plus loin"');
  const fin = src.indexOf("{choix ? <CarteMemoire");
  assert.ok(debut > 0 && fin > debut, "section « Aller plus loin » introuvable : le garde ne prouve rien");
  const section = src.slice(debut, fin);
  assert.match(section, /router\.push\("\/dictionnaire"\)/, "le dictionnaire n'a pas de porte d'entree depuis « Aujourd'hui »");
});

test("tous les mots tapables produits par une phrase ont une definition", () => {
  let tapables = 0;
  for (const n of [1, 2, 30]) {
    for (const seg of core.phraseAdjoints(n, "Nom du maire")) {
      if (!seg.mot) continue;
      tapables += 1;
      assert.notEqual(
        core.titreDuMot(seg.mot),
        null,
        `« ${seg.mot} » est tapable sans definition : impasse`,
      );
    }
  }
  assert.ok(tapables > 0, "aucun mot tapable : le controle ne prouve rien");
});

test("titreDuMot : mot connu, mot inconnu, cles heritees de l'objet", () => {
  assert.equal(core.titreDuMot("adjoint au maire"), "Adjoint au maire");
  assert.equal(core.titreDuMot("mot-qui-nexiste-pas"), null);
  assert.equal(core.titreDuMot("constructor"), null, "« constructor » est herite, pas un mot");
  assert.equal(core.titreDuMot("__proto__"), null, "« __proto__ » est herite, pas un mot");
  assert.equal(core.titreDuMot(undefined), null);
  assert.equal(core.titreDuMot(null), null);
});

test("chaque entree du glossaire porte un titre et une definition non vides", () => {
  for (const [cle, m] of Object.entries(core.GLOSSAIRE)) {
    assert.ok(m.titre && m.titre.trim().length > 0, `titre vide : ${cle}`);
    assert.ok(m.corps && m.corps.trim().length > 40, `definition trop courte : ${cle}`);
  }
});

// Les mots definis d'une phrase, une fois chacun, avec leur titre : la liste que
// l'application affiche sous la phrase, chaque bouton dans une zone de 44 px.
test("motsDuTexte : chaque mot defini d'une phrase, une fois, avec son titre", () => {
  assert.deepEqual(
    core.motsDuTexte(core.phraseAdjoints(2, "Nom du maire")),
    [{ mot: "adjoint au maire", titre: "Adjoint au maire" }],
  );
  assert.deepEqual(core.motsDuTexte(core.phraseAdjoints(0, "Nom du maire")), []);
  assert.deepEqual(core.motsDuTexte([{ t: "a", mot: "mot-qui-nexiste-pas" }]), []);
  assert.deepEqual(core.motsDuTexte(undefined), []);
});
