/* COLLECTE DE LA PRÉSIDENTIELLE 2027 (10/11/2026) — la collecte ne plante jamais, ne publie jamais à
   moitié, et garde la version précédente dès qu'une source échoue. Données fictives : fixtures/. */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { collecter, controler, fetchDepuisDossier } from "../scripts/collecte-presidentielle.mjs";

const FIX = path.join(import.meta.dirname, "fixtures", "presidentielle");
const VRAI = path.join(import.meta.dirname, "..", "..", "data", "presidentielle-2027");
const SOURCES = JSON.parse(fs.readFileSync(path.join(FIX, "sources.json"), "utf8")).sources;
const source = id => SOURCES.find(s => s.id === id);
const fetchImpl = fetchDepuisDossier(FIX);

function dossierNeuf() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "pres-"));
  for (const f of ["candidats", "debats", "meetings", "meta"]) fs.copyFileSync(path.join(VRAI, f + ".json"), path.join(d, f + ".json"));
  return d;
}
const octets = d => ["candidats", "debats", "meetings", "meta"].map(f => fs.readFileSync(path.join(d, f + ".json"), "utf8")).join("|");

test("collecte présidentielle — les sources qui publient écrivent des fichiers que le contrôle accepte", async () => {
  const d = dossierNeuf();
  const r = await collecter({ dossier: d, sources: SOURCES, fetchImpl, aujourdhui: "2027-02-01" });
  const { lu } = controler(d);
  assert.equal(lu.candidats.length, 2);
  assert.equal(lu.meetings.length, 1);
  assert.equal(lu.meta.lastUpdate, "2027-02-01");
  assert.equal(lu.meta.source.producteur, "Source fictive de test");
  /* décision 2 : un champ que la source ne donne pas reste absent, jamais rempli */
  assert.equal("programmeUrl" in lu.candidats[1], false);
  assert.equal(lu.candidats[1].parti, null);
  /* ni le flux, ni la source « publier: false » ne sont publiés : brouillon seulement */
  assert.equal(lu.debats.length, 0);
  assert.match(r.brouillon, /Débat fictif/);
  assert.match(r.brouillon, /Annonce fictive/);
  assert.equal(r.journal.filter(j => j.niveau === "erreur").length, 0);
});

test("collecte présidentielle — essai à blanc : rien n'est écrit", async () => {
  const d = dossierNeuf();
  const avant = octets(d);
  const r = await collecter({ dossier: d, sources: SOURCES, fetchImpl, ecrire: false, brouillonVers: path.join(d, "b.md") });
  assert.deepEqual(Object.keys(r.ecrits).sort(), ["candidats", "meetings", "meta"]);
  assert.equal(octets(d), avant);
  assert.equal(fs.existsSync(path.join(d, "b.md")), false);
});

for (const [cas, url, attendu] of [
  ["source injoignable", "https://source.exemple.invalid/absente.json", /injoignable/],
  ["HTML à la place du JSON", "https://source.exemple.invalid/page.json", /pas du JSON/],
  ["tableau déplacé dans la réponse", "https://source.exemple.invalid/reunions.json", /pas de tableau/],
]) {
  test(`collecte présidentielle — ${cas} : pas d'exception, fichiers précédents intacts, erreur au journal`, async () => {
    const d = dossierNeuf();
    await collecter({ dossier: d, sources: [source("liste-fictive")], fetchImpl, aujourdhui: "2027-02-01" });
    const avant = octets(d);
    const r = await collecter({ dossier: d, sources: [{ ...source("liste-fictive"), url }], fetchImpl, aujourdhui: "2027-02-02" });
    assert.equal(octets(d), avant, "un fichier a été réécrit alors que la source a échoué");
    assert.deepEqual(r.ecrits, {});
    assert.match(r.journal.filter(j => j.niveau === "erreur").map(j => j.message).join(" "), attendu);
    assert.match(r.brouillon, /Sources en échec/);
  });
}

test("collecte présidentielle — une entrée mal formée fait refuser toute la source", async () => {
  const d = dossierNeuf();
  const avant = octets(d);
  const sansNom = { ...source("liste-fictive"), champs: { id: "code", prenom: "prenom", parti: "mouvement" } };
  const r = await collecter({ dossier: d, sources: [sansNom], fetchImpl });
  assert.equal(octets(d), avant);
  assert.match(r.journal[0].message, /2 entrée\(s\) sur 2 refusée/);
});

test("collecte présidentielle — une réunion pour un candidat absent de la liste n'est pas publiée", async () => {
  const d = dossierNeuf();
  const avant = octets(d);
  const r = await collecter({ dossier: d, sources: [source("reunions-fictives")], fetchImpl });
  assert.equal(octets(d), avant);
  assert.match(r.journal.map(j => j.message).join(" "), /candidat absent de la liste/);
});

test("collecte présidentielle — sans source déclarée, rien ne bouge ; et le dépôt n'en déclare aucune non relue", async () => {
  const d = dossierNeuf();
  const avant = octets(d);
  const r = await collecter({ dossier: d, sources: [], fetchImpl });
  assert.equal(octets(d), avant);
  assert.equal(r.brouillon, null);
  const declarees = JSON.parse(fs.readFileSync(path.join(VRAI, "sources.json"), "utf8")).sources;
  for (const s of declarees) assert.doesNotMatch(s.url, /exemple\.invalid/, "une source fictive est déclarée dans les vraies données");
});
