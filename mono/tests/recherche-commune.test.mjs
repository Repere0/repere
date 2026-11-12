// La recherche d'une commune : code postal, abréviation, faute de frappe, « Vouliez-vous dire… ».
import test from "node:test";
import assert from "node:assert/strict";
import { chercherCommunes, motsCible, motsCommune } from "../packages/core/src/index.js";

const L = Object.entries({ "77288": "Melun", "93066": "Saint-Denis", "94033": "Fontenay-sous-Bois", "75056": "Paris", "78646": "Versailles", "77001": "Achères-la-Forêt", "93048": "Montreuil" })
  .map(([i, n]) => [i, n, motsCible(n)]);
const noms = r => r.resultats.map(x => x[1]);

test("abréviations : st -> saint, ste -> sainte", () => {
  assert.deepEqual(motsCommune("St Denis"), ["saint", "denis"]);
  assert.deepEqual(noms(chercherCommunes(L, "st denis")), ["Saint-Denis"]);
  assert.deepEqual(motsCommune("ste"), ["sainte"]);
});

test("faute de frappe : « melum » ne donne rien d'exact mais propose Melun, sans l'appliquer", () => {
  const r = chercherCommunes(L, "melum");
  assert.deepEqual(r.resultats, []);
  assert.deepEqual(r.suggestions.map(x => x[1]), ["Melun"]);
});

test("une lettre inversée, une lettre oubliée", () => {
  assert.deepEqual(chercherCommunes(L, "vesrailles").suggestions.map(x => x[1]), ["Versailles"]);
  assert.deepEqual(chercherCommunes(L, "montruil").suggestions.map(x => x[1]), ["Montreuil"]);
});

test("les mots courts ne sont jamais rapprochés ; pas de suggestion quand il y a un résultat exact", () => {
  assert.deepEqual(chercherCommunes(L, "pari").suggestions, [], "« pari » est le début de Paris : résultat exact, pas de suggestion");
  assert.deepEqual(noms(chercherCommunes(L, "pari")), ["Paris"]);
  assert.deepEqual(chercherCommunes(L, "xyz").suggestions, []);
  assert.deepEqual(chercherCommunes(L, "mx").suggestions, []);
});

test("code postal : table absente = on le dit ; table présente = les communes du code ; code inconnu = vide net", () => {
  assert.deepEqual(chercherCommunes(L, "77000").codePostal, { saisi: "77000", disponible: false });
  const cp = { "77000": ["77288"], "93200": ["93066", "93999"] };
  const r = chercherCommunes(L, "77000", { codesPostaux: cp });
  assert.deepEqual(noms(r), ["Melun"]);
  assert.deepEqual(noms(chercherCommunes(L, "93200", { codesPostaux: cp })), ["Saint-Denis"], "un code hors liste est ignoré");
  const inconnu = chercherCommunes(L, "99999", { codesPostaux: cp });
  assert.deepEqual(inconnu.resultats, []); assert.equal(inconnu.codePostal.disponible, true);
  assert.deepEqual(chercherCommunes(L, "__proto__", { codesPostaux: cp }).resultats, []);
  assert.deepEqual(noms(chercherCommunes(L, "constructor", { codesPostaux: cp })), []);
});

test("le texte vide ne cherche rien", () => {
  assert.deepEqual(chercherCommunes(L, "  "), { resultats: [], suggestions: [], codePostal: null });
});
