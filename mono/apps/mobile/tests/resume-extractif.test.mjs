// RÉSUMÉ EXTRACTIF DES RÉPONSES DU GOUVERNEMENT (12/11/2026) : des phrases recopiées, jamais reformulées.
import { test } from "node:test";
import assert from "node:assert/strict";
import { phrases, resumeExtractif } from "../src/lib/resume-extractif.js";

const REPONSE = "Monsieur le député, merci pour votre question. Le Gouvernement a décidé de porter à 1 200 euros par an l'aide à la rénovation des logements anciens. " +
  "Cette aide s'adresse aux ménages modestes et aux propriétaires occupants, selon le décret n° 2026-12. " +
  "Elle sera versée par l'Agence nationale de l'habitat, sans avance de frais pour les ménages modestes. " +
  "Le ministre M. Durand l'a rappelé lundi devant la commission. " +
  "Nous poursuivrons le dialogue avec les collectivités. " +
  "Les dossiers déposés avant le 1er janvier seront instruits en priorité par l'Agence nationale de l'habitat.";

test("découpage : « M. » et « n° » ne coupent pas une phrase", () => {
  const p = phrases(REPONSE);
  assert.ok(p.some(x => x.includes("M. Durand l'a rappelé")), "M. Durand reste dans sa phrase");
  assert.ok(p.some(x => x.includes("décret n° 2026-12")), "n° reste dans sa phrase");
  assert.equal(p.length, 7);
});

test("résumé : trois phrases au plus, recopiées à l'identique, dans l'ordre du texte, sans politesse", () => {
  const r = resumeExtractif(REPONSE);
  assert.equal(r.complet, false);
  assert.ok(r.phrases.length <= 3 && r.phrases.length >= 1);
  const toutes = phrases(REPONSE);
  for (const x of r.phrases) assert.ok(toutes.includes(x), "chaque phrase est une phrase de la réponse, mot pour mot");
  const idx = r.phrases.map(x => toutes.indexOf(x));
  assert.deepEqual([...idx].sort((a, b) => a - b), idx, "ordre du texte");
  assert.ok(!r.phrases.some(x => /^Monsieur le député/.test(x)), "la formule de politesse est écartée");
  assert.ok(r.phrases.some(x => x.includes("1 200 euros")), "la phrase au chiffre est retenue");
});

test("réponse courte : rendue entière ; réponse vide : rien", () => {
  const courte = "Le Gouvernement est favorable. Un décret suivra.";
  assert.deepEqual(resumeExtractif(courte), { phrases: ["Le Gouvernement est favorable.", "Un décret suivra."], complet: true });
  assert.deepEqual(resumeExtractif(""), { phrases: [], complet: true });
  assert.deepEqual(resumeExtractif(null), { phrases: [], complet: true });
});

test("déterminisme : même texte, même résumé", () => {
  assert.deepEqual(resumeExtractif(REPONSE), resumeExtractif(REPONSE));
});
