// Codes postaux (12/11/2026) : lecture de la base de La Poste, hors réseau. Règle : scripts/collecte-codes-postaux.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { lireBase, champs } from "../scripts/collecte-codes-postaux.mjs";
import { chercherCommunes } from "../packages/core/src/recherche.js";
import { arrondissementDuCodePostal, mairieArrondissement, nomArrondissement } from "../packages/core/src/paris.js";

const BETA = ["75056", "77288", "77152", "93066"];
const CSV = [
  "﻿#Code_commune_INSEE;Nom_de_la_commune;Code_postal;Libellé_d_acheminement;Ligne_5",
  "77288;MELUN;77000;MELUN;",
  "77152;DAMMARIE LES LYS;77190;DAMMARIE LES LYS;",
  "77999;HORS BETA;77000;HORS BETA;",
  "75101;PARIS 01;75001;PARIS;",
  "75116;PARIS 16;75016;PARIS;",
  "75116;PARIS 16;75116;PARIS;",
  "93066;ST DENIS;93200;ST DENIS;",
  "93066;ST DENIS;93210;ST DENIS;LA PLAINE ST DENIS",
  "1004;AMBERIEU EN BUGEY;1500;AMBERIEU EN BUGEY;",
  "97411;ST DENIS;97400;ST DENIS;",
].join("\n");

test("lit l'en-tête (BOM, accents, casse), garde la bêta, range Paris sous 75056", () => {
  const { codes, couverture } = lireBase(CSV, BETA);
  assert.deepEqual(codes["77000"], ["77288"], "une commune hors bêta n'entre pas");
  assert.deepEqual(codes["75001"], ["75056"]);
  assert.deepEqual(codes["75116"], ["75056"]);
  assert.deepEqual(codes["93210"], ["93066"]);
  assert.equal(codes["01500"], undefined, "hors Île-de-France");
  assert.equal(codes["97400"], undefined);
  assert.equal(couverture.avec_code, 4);
  assert.deepEqual(couverture.sans_code, []);
});

test("séparateur virgule et guillemets", () => {
  const { codes } = lireBase('code_commune_insee,nom,code_postal\n"77288","MELUN, VILLE","77000"', BETA);
  assert.deepEqual(codes, { "77000": ["77288"] });
  assert.deepEqual(champs('a;"b;c";"d""e"', ";"), ["a", "b;c", 'd"e']);
});

test("en-tête inattendu ou fichier vide : une erreur, jamais une table vide", () => {
  assert.throws(() => lireBase("colonne_a;colonne_b\n1;2", BETA), /en-tete inattendu/);
  assert.throws(() => lireBase("", BETA), /vide/);
});

test("une commune sans code postal est nommée dans la couverture", () => {
  const { couverture } = lireBase("insee;code_postal\n77288;77000", BETA);
  assert.equal(couverture.avec_code, 1);
  assert.ok(couverture.sans_code.includes("93066"));
});

test("de bout en bout : la table produite répond à la recherche de l'application", () => {
  const { codes } = lireBase(CSV, BETA);
  const liste = [["77288", "Melun", ["melun"]], ["75056", "Paris", ["paris"]], ["93066", "Saint-Denis", ["saint", "denis"]]];
  const r = chercherCommunes(liste, "75016", { codesPostaux: codes });
  assert.deepEqual(r.resultats.map(x => x[1]), ["Paris"]);
});

test("Paris : l'arrondissement d'un code postal est lu dans la base, jamais déduit du code", () => {
  const base = lireBase(CSV + "\n75104;PARIS 04;75003;PARIS;\n75103;PARIS 03;75003;PARIS;", BETA);
  assert.equal(base.arrondissements["75001"], "75101");
  assert.equal(base.arrondissements["75116"], "75116");
  assert.equal(base.arrondissements["75003"], undefined, "un code à cheval sur deux arrondissements n'en désigne aucun");
  assert.equal(arrondissementDuCodePostal(base, "75116"), 16);
  assert.equal(arrondissementDuCodePostal(base, "75016"), 16);
  assert.equal(arrondissementDuCodePostal(base, "77000"), null);
  assert.equal(arrondissementDuCodePostal(null, "75011"), null, "sans fichier : rien");
  assert.equal(arrondissementDuCodePostal({ arrondissements: { "75011": "75999" } }, "75011"), null);
  assert.equal(nomArrondissement(1), "Paris 1er");
  assert.equal(mairieArrondissement(3).nom, "Mairie de Paris Centre");
  assert.equal(mairieArrondissement(11).nom, "Mairie du 11e arrondissement");
  assert.equal(mairieArrondissement(21), null);
});
