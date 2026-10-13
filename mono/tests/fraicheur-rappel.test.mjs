/* FRAICHEUR DE LA PUBLICATION, ET RAPPEL AVANT UNE SEANCE (beta, 13/10/2026).
 *
 * POURQUOI CES CONTROLES. Invariant 9 : une donnee gardee sur l'appareil ne doit
 * jamais passer pour actuelle. Et un rappel ne doit jamais etre programme pour un
 * moment deja passe, ni annoncer une heure fausse. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fraicheurPublication } from "../packages/core/src/fraicheur.js";
import { rappelSeance } from "../packages/core/src/rappel.js";

test("fraicheur : le jour meme, la veille, une publication plus ancienne, une date inconnue", () => {
  assert.equal(fraicheurPublication("2026-10-13", "2026-10-13").etat, "du-jour");
  assert.equal(fraicheurPublication("2026-10-12", "2026-10-13").etat, "hier");
  const ancienne = fraicheurPublication("2026-10-10", "2026-10-13");
  assert.equal(ancienne.etat, "precedente");
  assert.equal(ancienne.jours, 3);
  assert.match(ancienne.phrase, /il y a 3 jours/);
  assert.doesNotMatch(ancienne.phrase, /vérifier|actuelle/, "la phrase ne pretend ni verifier, ni dire « actuelle »");
  const inconnue = fraicheurPublication(null, "2026-10-13");
  assert.equal(inconnue.etat, "inconnue");
  assert.doesNotMatch(inconnue.phrase, /publication du jour|précédente/);
});

test("fraicheur : une date future (horloge du telephone en retard) ne devient jamais « ancienne »", () => {
  assert.equal(fraicheurPublication("2026-10-14", "2026-10-13").etat, "du-jour");
});

const seance = {
  titre: "Questions au Gouvernement", debut: new Date("2026-10-13T13:00:00Z"), fin: null, finPubliee: false,
  producteur: "Assemblée nationale", url: null, notes: "",
};

test("rappel : une heure avant le debut, pour une seance encore a venir", () => {
  const r = rappelSeance(seance, new Date("2026-10-13T10:00:00Z"));
  assert.equal(r.date.toISOString(), "2026-10-13T12:00:00.000Z");
  assert.equal(r.titre, "Dans une heure : Questions au Gouvernement");
  assert.match(r.corps, /15:00/, "l'heure est celle de Paris");
  assert.match(r.corps, /Source : Assemblée nationale/);
});

test("rappel : jamais programme pour un moment deja passe, ni a moins d'une heure", () => {
  assert.equal(rappelSeance(seance, new Date("2026-10-13T12:30:00Z")), null);
  assert.equal(rappelSeance(seance, new Date("2026-10-13T12:00:00Z")), null, "pile une heure avant : trop tard");
});
