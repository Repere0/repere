// Garde : la commune dans l'adresse vit APRÈS le « # » (jamais envoyée au serveur), sans homonyme ni devinette.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { slugNom, tableSlugs, inseeDepuisHash, titreOnglet } from "../packages/core/src/index.js";

const PETITE = { "77288": "Melun", "77034": "Blandy", "91067": "Blandy", "93066": "Saint-Denis", "77001": "Achères-la-Forêt" };

test("slugNom : sans accents ni apostrophes, en minuscules, tirets", () => {
  assert.equal(slugNom("Achères-la-Forêt"), "acheres-la-foret");
  assert.equal(slugNom("L'Haÿ-les-Roses"), "l-hay-les-roses");
  assert.equal(slugNom("  Melun "), "melun");
});

test("tableSlugs : seuls les homonymes prennent le département ; aller-retour exact", () => {
  const t = tableSlugs(PETITE);
  assert.equal(t.parInsee["77288"], "melun");
  assert.equal(t.parInsee["77034"], "blandy-77");
  assert.equal(t.parInsee["91067"], "blandy-91");
  assert.equal(inseeDepuisHash("#blandy-91", t), "91067");
  assert.equal(inseeDepuisHash("#blandy", t), null, "un homonyme sans département ne choisit rien");
});

test("inseeDepuisHash : sans devinette", () => {
  const t = tableSlugs(PETITE);
  assert.equal(inseeDepuisHash("#Melun", t), "77288");
  assert.equal(inseeDepuisHash("#melun%20", t), "77288");
  assert.equal(inseeDepuisHash("#melunn", t), null);
  assert.equal(inseeDepuisHash("", t), null);
  assert.equal(inseeDepuisHash("#__proto__", t), null);
  assert.equal(inseeDepuisHash("#%E0%A4%A", t), null);
});

test("sur toutes les communes publiées : un slug par commune, tous distincts", { skip: !existsSync(new URL("../data/communes-beta.json", import.meta.url)) }, () => {
  const c = JSON.parse(readFileSync(new URL("../data/communes-beta.json", import.meta.url), "utf8")).communes;
  const t = tableSlugs(c);
  assert.equal(Object.keys(t.parInsee).length, Object.keys(c).length);
  assert.equal(Object.keys(t.parSlug).length, Object.keys(c).length, "deux communes ne partagent jamais un slug");
  for (const [insee, slug] of Object.entries(t.parInsee)) assert.equal(inseeDepuisHash("#" + slug, t), insee);
});

test("titreOnglet : l'écran et la commune, sinon « Repère »", () => {
  assert.equal(titreOnglet("/finances", "Melun"), "Finances de Melun - Repère");
  assert.equal(titreOnglet("/finances/", "Melun"), "Finances de Melun - Repère");
  assert.equal(titreOnglet("/finances", ""), "Finances - Repère");
  assert.equal(titreOnglet("/inconnu", "Melun"), "Repère");
  assert.equal(titreOnglet("/", "Melun"), "Repère");
});
