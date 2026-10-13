/* AJOUTER UNE SEANCE AU CALENDRIER DU TELEPHONE (beta, 13/10/2026).
 *
 * POURQUOI CES CONTROLES. L'application remet les donnees d'une seance au
 * calendrier du lecteur. Une heure decalee d'une heure, ou une fin inventee,
 * dit faux dans son agenda. Ces controles tournent sans reseau ni telephone. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { instantParis, seancesAgenda } from "../packages/core/src/agenda.js";

test("heure de Paris : +2 en ete, +1 en hiver, et les deux passages d'heure de 2026", () => {
  const iso = naif => new Date(instantParis(naif)).toISOString();
  assert.equal(iso("2026-10-13T15:00"), "2026-10-13T13:00:00.000Z", "en ete (+2)");
  assert.equal(iso("2026-01-13T15:00"), "2026-01-13T14:00:00.000Z", "en hiver (+1)");
  assert.equal(iso("2026-03-29T03:00"), "2026-03-29T01:00:00.000Z", "apres le passage a l'heure d'ete du 29 mars");
  assert.equal(iso("2026-03-29T01:30"), "2026-03-29T00:30:00.000Z", "avant le passage a l'heure d'ete du 29 mars");
  assert.equal(iso("2026-10-25T12:00"), "2026-10-25T11:00:00.000Z", "apres le retour a l'heure d'hiver du 25 octobre");
});

const groupe = {
  jour: "2026-10-13", institution: "Assemblée nationale", titre: "Questions au Gouvernement, séance du jour",
  debut: "2026-10-13T15:00", debuts: ["2026-10-13T15:00", "2026-10-13T21:30"], fins: [null, "2026-10-13T23:00"],
  categorie: "Séance publique", lieu: "Salle Lamartine", points: ["Débat sur la dette"], textesLibres: [],
  source: { producteur: "Assemblée nationale", url: "https://www.assemblee-nationale.fr/dyn/17/agenda", releve_le: "2026-10-13" },
};

test("seance : une entree par heure de debut, dans l'heure de Paris convertie", () => {
  const s = seancesAgenda(groupe);
  assert.equal(s.length, 2);
  assert.equal(s[0].debut.toISOString(), "2026-10-13T13:00:00.000Z");
  assert.equal(s[1].debut.toISOString(), "2026-10-13T19:30:00.000Z");
  assert.equal(s[0].titre, "Questions au Gouvernement, séance du jour");
});

test("seance : fin publiee recopiee, fin absente jamais devinee", () => {
  const s = seancesAgenda(groupe);
  assert.equal(s[0].fin, null, "pas de fin publiee : rien n'est invente");
  assert.equal(s[0].finPubliee, false);
  assert.equal(s[1].fin.toISOString(), "2026-10-13T21:00:00.000Z");
  assert.equal(s[1].finPubliee, true);
});

test("seance : une fin anterieure au debut est ecartee, pas affichee", () => {
  const s = seancesAgenda({ ...groupe, debuts: ["2026-10-13T15:00"], fins: ["2026-10-13T10:00"] });
  assert.equal(s[0].fin, null);
});

test("seance : sans heure, pas d'evenement (une heure inventee serait fausse)", () => {
  assert.deepEqual(seancesAgenda({ ...groupe, debuts: ["2026-10-13"], fins: [null] }), []);
});

test("seance : la source, sa date et le lien sont dans les notes ; l'absence de fin y est dite", () => {
  const s = seancesAgenda(groupe);
  assert.match(s[0].notes, /Source : Assemblée nationale/);
  assert.match(s[0].notes, /relevé le 13 octobre 2026/);
  assert.match(s[0].notes, /https:\/\/www\.assemblee-nationale\.fr\/dyn\/17\/agenda/);
  assert.match(s[0].notes, /Fin non publiée par la source/);
  assert.doesNotMatch(s[1].notes, /Fin non publiée/);
  assert.match(s[0].notes, /Vérifiez l'horaire/);
});

test("seance : aucun identifiant ni commune dans les donnees transmises au calendrier", () => {
  const s = seancesAgenda(groupe);
  assert.doesNotMatch(JSON.stringify(s), /77284|gmail/);
});
