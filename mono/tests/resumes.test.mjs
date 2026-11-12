import test from "node:test";
import assert from "node:assert/strict";
import { resumeAffichable, MENTION_RESUME } from "../packages/core/src/index.js";

const bon = { valide: true, resume: "Le texte crée une aide.", source: { producteur: "Assemblée nationale", url: "https://www.assemblee-nationale.fr/x", releve_le: "2026-11-12" } };
test("résumé — affiché seulement validé, avec source https et date", () => {
  assert.equal(resumeAffichable(bon).texte, "Le texte crée une aide.");
  assert.equal(resumeAffichable({ ...bon, valide: false }), null, "brouillon : jamais affiché");
  assert.equal(resumeAffichable({ ...bon, valide: "true" }), null, "seul le booléen vrai valide");
  assert.equal(resumeAffichable({ ...bon, resume: "  " }), null);
  assert.equal(resumeAffichable({ ...bon, source: { ...bon.source, url: "http://x" } }), null, "source non https");
  assert.equal(resumeAffichable({ ...bon, source: { ...bon.source, releve_le: "" } }), null, "sans date de relevé");
  assert.equal(resumeAffichable(null), null);
});
test("résumé — la mention d'assistance IA est écrite en toutes lettres", () => {
  assert.match(MENTION_RESUME, /assistance d'une IA/);
});
