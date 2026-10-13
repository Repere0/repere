/* SIGNALER UNE ERREUR SUR UNE INFORMATION (beta, 13/10/2026).
 *
 * POURQUOI CES CONTROLES. Le courriel de signalement part vers le contact du
 * projet : il ne doit ni porter une adresse personnelle, ni une commune, ni
 * annoncer « undefined ». Les contrôles de l'agenda sont dans agenda-calendrier.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { courrielSignalement, CONTACT_REPERE } from "../packages/core/src/signalement.js";

/* Lit les parametres d'une URL mailto, decodes. */
const parametres = url => Object.fromEntries(
  url.split("?")[1].split("&").map(p => {
    const i = p.indexOf("=");
    return [p.slice(0, i), decodeURIComponent(p.slice(i + 1).replace(/\+/g, " "))];
  }),
);

test("signalement : un courriel au contact du projet, qui nomme la source et son lien", () => {
  const u = courrielSignalement({ producteur: "Assemblée nationale", url: "https://www.assemblee-nationale.fr/dyn/17/agenda", maj: "2026-10-13" });
  assert.ok(u.startsWith("mailto:" + CONTACT_REPERE + "?"), "le destinataire est le contact du projet");
  const p = parametres(u);
  assert.match(p.subject, /Repère/);
  assert.match(p.body, /Assemblée nationale/);
  assert.match(p.body, /https:\/\/www\.assemblee-nationale\.fr\/dyn\/17\/agenda/);
  assert.match(p.body, /Ce que je vois/);
});

test("signalement : sans lien ni date, le courriel reste utilisable et n'ecrit ni undefined ni null", () => {
  const p = parametres(courrielSignalement({ producteur: "OFGL" }));
  assert.match(p.body, /OFGL/);
  assert.doesNotMatch(p.body, /undefined|null/);
});

test("signalement : aucune adresse personnelle ni code de commune dans le courriel", () => {
  const u = courrielSignalement({ producteur: "Sénat", url: "https://www.senat.fr/agenda.html", releve: "2026-10-13" });
  assert.equal(u.split("?")[0], "mailto:" + CONTACT_REPERE, "seul le contact du projet est destinataire");
  assert.equal(CONTACT_REPERE, "repere0@protonmail.com");
  assert.doesNotMatch(u, /gmail|77284/);
});
