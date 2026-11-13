// LE QUIZ DU DICTIONNAIRE (12/11/2026) : quatre propositions, une seule vraie ; des fausses réponses valables ; du vocabulaire, jamais une opinion.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GLOSSAIRE } from "../../../packages/core/src/index.js";
import { construireQuestion, definitionCourte, entreesDuQuiz, melanger, sessionDuQuiz } from "../src/lib/quiz.js";

const entrees = Object.entries(GLOSSAIRE).map(([cle, m]) => ({ cle, titre: m.titre, corps: m.corps }));
const graine = (s = 7) => () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
const sans = t => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

test("quiz : chaque mot posable donne exactement quatre propositions, une seule vraie, toutes différentes", () => {
  const session = sessionDuQuiz(entrees, graine());
  assert.ok(session.length >= 14, `au moins 14 questions possibles (${session.length})`);
  for (const q of session) {
    assert.equal(q.propositions.length, 4, q.cle);
    assert.equal(q.propositions.filter(p => p.juste).length, 1, q.cle);
    assert.equal(new Set(q.propositions.map(p => p.texte)).size, 4, `${q.cle} : propositions distinctes`);
    assert.equal(q.propositions.find(p => p.juste).texte, definitionCourte(GLOSSAIRE[q.cle].corps), "la vraie est la définition du dictionnaire");
  }
});

test("quiz : une fausse réponse est la définition d'un AUTRE mot, qui ne partage aucun mot de 4 lettres avec la question et ne la cite pas", () => {
  for (const q of sessionDuQuiz(entrees, graine(3))) {
    const motsQ = new Set(sans(q.titre).match(/[a-z]{4,}/g) || []);
    for (const p of q.propositions.filter(x => !x.juste)) {
      assert.notEqual(p.cle, q.cle);
      assert.equal(p.texte, definitionCourte(GLOSSAIRE[p.cle].corps), "texte déjà publié, rien d'inventé");
      assert.ok(!(sans(p.titre).match(/[a-z]{4,}/g) || []).some(m => motsQ.has(m)), `${q.cle} / ${p.cle} : mots partagés`);
      assert.ok(!sans(p.texte).includes(sans(q.titre)), `${q.cle} : une fausse réponse cite le mot demandé`);
    }
  }
});

test("quiz : le vocabulaire institutionnel seulement — aucun sigle de groupe politique", () => {
  const cles = entreesDuQuiz(entrees).map(e => e.cle);
  for (const interdit of ["ps", "lr", "rn", "lfi", "eelv", "epr", "pcf", "modem", "hor", "dem", "gdr", "liot", "udi"]) assert.ok(!cles.includes(interdit), interdit);
  assert.ok(cles.includes("circonscription") && cles.includes("mandat"));
});

test("quiz : l'ordre change d'une session à l'autre, et reste le même pour un même hasard", () => {
  const a = sessionDuQuiz(entrees, graine(1)).map(q => q.cle).join();
  const b = sessionDuQuiz(entrees, graine(2)).map(q => q.cle).join();
  assert.notEqual(a, b);
  assert.equal(a, sessionDuQuiz(entrees, graine(1)).map(q => q.cle).join());
  assert.deepEqual(melanger([1, 2, 3, 4], graine()).sort(), [1, 2, 3, 4]);
});

test("quiz : un mot sans assez de fausses réponses valables ne produit pas de question", () => {
  const trois = entrees.slice(0, 3);
  assert.equal(construireQuestion(trois, trois[0].cle), null);
});

/* ─── Le quiz sur un écran (13/11/2026) : la définition est posée, quatre MOTS sont proposés ─── */
const { construireQuestionMot, donneLaReponse, entreesDuQuizMots, mancheDuQuiz, TAILLE_MANCHE, TITRE_MAX_QUIZ } = await import("../src/lib/quiz.js");

test("quiz mots : une manche fait cinq questions distinctes, quatre mots chacune, un seul juste", () => {
  for (let g = 1; g <= 40; g++) {
    const manche = mancheDuQuiz(entrees, TAILLE_MANCHE, graine(g));
    assert.equal(manche.length, 5, `graine ${g}`);
    assert.equal(new Set(manche.map(q => q.cle)).size, 5, "cinq mots différents");
    for (const q of manche) {
      assert.equal(q.propositions.length, 4, q.cle);
      assert.equal(q.propositions.filter(p => p.juste).length, 1, q.cle);
      assert.equal(new Set(q.propositions.map(p => sans(p.texte))).size, 4, `${q.cle} : quatre mots distincts`);
      assert.equal(q.propositions.find(p => p.juste).texte, GLOSSAIRE[q.cle].titre, "le mot juste est le titre du dictionnaire");
      assert.equal(q.enonce, definitionCourte(GLOSSAIRE[q.cle].corps), "la question est la définition du dictionnaire, mot pour mot");
    }
  }
});
test("quiz mots : la question ne donne pas la réponse, et aucun faux mot n'est défendable", () => {
  const pool = entreesDuQuizMots(entrees);
  /* 31 le 13/11/2026, sur 90 entrées du dictionnaire. La règle « la définition ne donne pas sa réponse »
     en écarte beaucoup (toutes les abréviations, notamment) : c'est le prix d'une question honnête. */
  assert.ok(pool.length >= 25, `au moins 25 mots posables (${pool.length})`);
  const mots4 = t => sans(t).match(/[a-z]{4,}/g) || [];
  for (const e of pool) {
    const q = construireQuestionMot(pool, e.cle, graine(3));
    if (!q) continue;
    assert.ok(!donneLaReponse(q.enonce, q.titre), `${q.cle} : la définition donne son propre mot`);
    for (const p of q.propositions) {
      assert.ok(p.texte.length <= TITRE_MAX_QUIZ, `${p.texte} : trop long pour une carte`);
      if (p.juste) continue;
      assert.ok(!donneLaReponse(q.enonce, p.texte), `${q.cle} : la définition cite le faux mot « ${p.texte} »`);
      assert.ok(!mots4(p.texte).some(m => mots4(q.titre).includes(m)), `${q.cle} : « ${p.texte} » partage un mot avec la bonne réponse`);
    }
  }
});
test("quiz mots : aucun sigle de groupe politique, ni posé ni proposé", () => {
  const sigles = new Set(["ps", "lr", "rn", "lfi", "eelv", "epr", "pcf", "modem", "hor", "dem", "gdr", "liot", "udi"]);
  for (let g = 1; g <= 20; g++) for (const q of mancheDuQuiz(entrees, 5, graine(g))) for (const p of q.propositions) assert.ok(!sigles.has(sans(p.cle)), p.cle);
});

test("quiz mots : une définition qui donne sa réponse n'est jamais posée (vu à l'écran le 13/11/2026)", () => {
  /* Le cas réel : « Abréviation de l'Assemblée nationale, l'une des deux chambres du Parlement. » posée pour
     « AN (Assemblée nationale) ». La comparaison de chaînes entières laissait passer ; mot à mot, non. */
  assert.ok(donneLaReponse("Abréviation de l'Assemblée nationale, l'une des deux chambres du Parlement.", "AN (Assemblée nationale)"));
  assert.ok(donneLaReponse("Formation qui réunit des parlementaires déclarés ensemble.", "Groupe parlementaire"), "le pluriel ne sauve pas un mot");
  assert.ok(!donneLaReponse("Territoire dans lequel les électeurs élisent un député.", "Circonscription"), "une définition honnête reste posable");
  const pose = entreesDuQuizMots(entrees).map(e => e.titre);
  assert.ok(!pose.some(t => /^AN \(/.test(t)), "« AN (Assemblée nationale) » n'est plus posé");
  for (const t of pose) {
    const e = entrees.find(x => x.titre === t);
    assert.ok(!donneLaReponse(definitionCourte(e.corps), t), `« ${t} » : sa définition donne la réponse`);
  }
});
