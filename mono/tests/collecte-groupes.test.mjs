// Groupes politiques (V36, B2) : la lecture d'AMO30 par scripts/collecte-groupes.mjs.
// Fixtures inventees, forme AMO30 (acteur.mandats.mandat, organe.codeType). Elles ne
// prouvent pas la forme reelle de l'archive : c'est le role du seuil, teste plus bas.
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupeDuDepute, groupesDesDeputes, INCONNU } from "../scripts/collecte-groupes.mjs";

const organes = new Map([
  ["PO1", { codeType: "GP", libelle: "EPR" }],
  ["PO2", { codeType: "GP", libelle: "LFI-NFP" }],
  ["PO9", { codeType: "ASSEMBLEE", libelle: "Assemblée nationale" }],
]);
const dep = (uid, mandats, prenom = "Xavier", nom = "Breton") =>
  ({ uid: { "#text": uid }, etatCivil: { ident: { prenom, nom } }, mandats: { mandat: mandats } });
const gp = (organeRef, dateDebut, dateFin = "") => ({ typeOrgane: "GP", dateDebut, dateFin, organes: { organeRef } });
const assemblee = { typeOrgane: "ASSEMBLEE", dateDebut: "2024-07-07", dateFin: "", organes: { organeRef: "PO9" } };

test("groupe : le mandat de groupe ouvert est retenu, le clos est ignoré", () => {
  const a = dep("PA1", [assemblee, gp("PO2", "2024-07-08", "2025-01-01"), gp("PO1", "2024-07-10")]);
  assert.equal(groupeDuDepute(a, organes), "EPR");
});

test("groupe : un mandat unique, non enveloppe dans une liste, est lu", () => {
  const a = { uid: { "#text": "PA2" }, mandats: { mandat: gp("PO2", "2024-07-08") } };
  assert.equal(groupeDuDepute(a, organes), "LFI-NFP");
});

test("groupe : plusieurs groupes ouverts, le plus récent l'emporte", () => {
  const a = dep("PA3", [gp("PO2", "2023-01-01"), gp("PO1", "2025-03-01")]);
  assert.equal(groupeDuDepute(a, organes), "EPR");
});

test("groupe : sans mandat de groupe ouvert, rien (le script écrit « Inconnu »)", () => {
  assert.equal(groupeDuDepute(dep("PA4", [assemblee]), organes), null);
});

test("table : chaque depute de la liste a une entrée, « Inconnu » si pas de groupe", () => {
  const acteurs = [dep("PA1", [gp("PO1", "2024-07-10")], "Xavier", "Breton"), dep("PA4", [assemblee], "Ann", "Dupont")];
  const r = groupesDesDeputes(acteurs, organes, ["PA1", "PA4", "PA999"]);
  assert.deepEqual(r.sortie.PA1, { groupe: "EPR", nom: "Xavier Breton" });
  assert.deepEqual(r.sortie.PA4, { groupe: INCONNU, nom: "Ann Dupont" });
  assert.deepEqual(r.sortie.PA999, { groupe: INCONNU, nom: "" });
  assert.equal(r.connus, 1);
  assert.equal(r.total, 3);
});

test("seuil : une lecture où moins de 90 % des deputes ont un groupe n'est pas fiable", () => {
  const refs = Array.from({ length: 10 }, (_, i) => "PA" + i);
  const acteurs = refs.slice(0, 8).map(r => dep(r, [gp("PO1", "2024-07-10")]));
  const r = groupesDesDeputes(acteurs, organes, refs);
  assert.equal(r.connus, 8);
  assert.equal(r.ok, false, "8 sur 10 = 80 % : refusé");
});

test("seuil : une lecture vide ou sans aucun groupe n'est jamais fiable", () => {
  assert.equal(groupesDesDeputes([], organes, ["PA1"]).ok, false);
  assert.equal(groupesDesDeputes([dep("PA1", [assemblee])], organes, ["PA1"]).ok, false);
  assert.equal(groupesDesDeputes([], organes, []).ok, false);
});

test("seuil : 9 sur 10 passe", () => {
  const refs = Array.from({ length: 10 }, (_, i) => "PA" + i);
  const acteurs = refs.slice(0, 9).map(r => dep(r, [gp("PO1", "2024-07-10")]));
  assert.equal(groupesDesDeputes(acteurs, organes, refs).ok, true);
});
