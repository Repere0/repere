/* GARDE SUR LA DONNEE PUBLIEE (15/10/2026) : une commune partagee entre plusieurs
 * circonscriptions n'a pas UN depute, et une commune sans circonscription publiee ne
 * recoit aucune circonscription deduite. Lit les fiches reelles (data/departments) et
 * la chaine reelle (chaineDecision), pas des fixtures.
 * Lancer : node --test tests/circos-reelles.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DONNEES = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const { chaineDecision, phraseCirconscription } = await import("../packages/core/src/index.js");
const lire = f => JSON.parse(readFileSync(join(DONNEES, f), "utf8"));
const index = lire("index.json");
const deputes = lire("deputes.json");

const communes = [];
for (const f of readdirSync(join(DONNEES, "departments")).filter(n => n.endsWith(".json")).sort()) {
  const dep = JSON.parse(readFileSync(join(DONNEES, "departments", f), "utf8"));
  for (const [code, fiche] of Object.entries(dep.communes)) communes.push({ code, dep: dep.d, fiche });
}

/* La case « Qui decide » de l'echelon France, telle que la chaine la calcule. */
const echelonFrance = c => chaineDecision({ fiche: c.fiche, paquet: {}, index, deputes, elusRegion: null, dep: c.dep })
  .find(n => n.echelon === "france");

test("donnee : chaque circonscription publiee est un entier de 1 a 577, sans doublon", () => {
  for (const c of communes) {
    const circos = Array.isArray(c.fiche.circo) ? c.fiche.circo : (c.fiche.circo == null ? [] : [c.fiche.circo]);
    for (const n of circos) assert.ok(Number.isInteger(n) && n >= 1 && n <= 577, `${c.fiche.nom} : circonscription ${n}`);
    assert.equal(new Set(circos).size, circos.length, `${c.fiche.nom} : circonscription en double`);
  }
});

test("une commune a plusieurs circonscriptions : aucun depute n'est nomme, et la phrase donne le bon nombre", () => {
  const multi = communes.filter(c => Array.isArray(c.fiche.circo) && c.fiche.circo.length > 1);
  assert.ok(multi.length > 0, "aucune commune a plusieurs circonscriptions dans la donnee : le cas n'est plus teste");
  for (const c of multi) {
    const n = c.fiche.circo.length;
    assert.equal(echelonFrance(c).personne, null, `${c.fiche.nom} (${c.fiche.circo.join(", ")}) : un depute est nomme`);
    const phrase = phraseCirconscription({ nbCircos: n, nomCommune: c.fiche.nom, nomDep: "" }, c.fiche.circo[0]);
    assert.ok(phrase.includes(`partagée entre ${n} circonscriptions`), `${c.fiche.nom} : nombre faux (« ${phrase} »)`);
  }
});

test("une commune sans circonscription publiee ne recoit pas de circonscription deduite", () => {
  const sans = communes.filter(c => c.fiche.circo == null || (Array.isArray(c.fiche.circo) && c.fiche.circo.length === 0));
  for (const c of sans) {
    assert.equal(echelonFrance(c).personne, null, `${c.fiche.nom} : un depute est nomme sans circonscription publiee`);
  }
});
