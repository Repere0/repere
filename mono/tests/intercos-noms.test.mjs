/* GARDE : le nom d'une intercommunalite s'ecrit comme on l'ecrit (16/10/2026).
 * Le Repertoire national des elus publie « Ca Du Pays De Meaux » : le sigle CA
 * devient « Ca ». nomIntercommunalite rend les sigles et les petits mots, et ne
 * touche pas un nom deja juste. Lancer : node --test tests/intercos-noms.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";

const { nomIntercommunalite, competencesIntercommunalite } = await import("../packages/core/src/index.js");

test("le sigle CA n'est plus ecrit « Ca » ; les petits mots passent en minuscules", () => {
  assert.equal(nomIntercommunalite("Ca Du Pays De Meaux"), "CA du Pays de Meaux");
  assert.equal(nomIntercommunalite("Ca Pays De Fontainebleau"), "CA Pays de Fontainebleau");
  assert.equal(nomIntercommunalite("Ca Du Pays Basque"), "CA du Pays Basque");
});

test("un nom deja juste sort tel quel, en majuscules ou non", () => {
  assert.equal(nomIntercommunalite("CA du Pays de Meaux"), "CA du Pays de Meaux");
  assert.equal(nomIntercommunalite("Communauté d'agglomération Paris Saclay"), "Communauté d'agglomération Paris Saclay");
  assert.equal(nomIntercommunalite("CC Brie Nangissienne"), "CC Brie Nangissienne");
});

test("la Metropole du Grand Paris s'ecrit avec son accent", () => {
  assert.equal(nomIntercommunalite("Metropole Du Grand Paris"), "Métropole du Grand Paris");
});

test("un nom absent ou vide donne null, jamais une chaine vide", () => {
  assert.equal(nomIntercommunalite(null), null);
  assert.equal(nomIntercommunalite(""), null);
  assert.equal(nomIntercommunalite("   "), null);
});

test("la reconnaissance de la Metropole ne depend pas de la casse publiee", () => {
  const brut = competencesIntercommunalite({ agglo: { nom: "Metropole Du Grand Paris" }, regionCode: "11", dep: "93" });
  assert.equal(brut.precisions.length, 2);
});
