// Photos d'élus (V36, B3) : filtre de licences et rapprochement par nom, hors réseau.
// Les règles sont celles de scripts/collecte-photos-elus.mjs (ADR 0004, docs/data/photos-elus.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import { LICENCE_OK, appeler, concorde, familleRNE, photosReprises, rapprocherCandidats } from "../scripts/collecte-photos-elus.mjs";

test("licences : libres acceptées (CC BY, CC BY-SA, CC0, domaine public)", () => {
  for (const l of ["CC BY 4.0", "CC BY-SA 4.0", "CC BY-SA 3.0", "CC0 1.0", "CC0", "Public domain", "domaine public"])
    assert.ok(LICENCE_OK.test(l), l);
});

test("licences : non libres ou ambiguës refusées (NC, ND, GFDL, vide)", () => {
  for (const l of ["CC BY-NC-SA 4.0", "CC BY-ND 4.0", "CC BY-NC 2.0", "GFDL", "", "Copyrighted", "All rights reserved"])
    assert.ok(!LICENCE_OK.test(l), "« " + l + " » ne doit pas passer");
});

test("nom : le nom de famille doit apparaître mot pour mot", () => {
  assert.ok(concorde("Xavier Breton", "Breton"));
  assert.ok(!concorde("Xavier Bretonneau", "Breton"));
  assert.ok(!concorde("Xavier Breton", ""));
});

test("maires : le nom de famille du RNE est la partie en capitales", () => {
  assert.equal(familleRNE("Kadir MEBAREK"), "MEBAREK");
  assert.equal(familleRNE("Jean-Paul DUPONT"), "DUPONT");
});

/* Candidats (ADR 0008) : un seul item au nom exact, ou aucune photo. Lignes = réponses SPARQL déjà filtrées. */
test("candidats : rapprochés seulement si un seul item porte exactement leur nom", () => {
  const liste = [{ id: "a", prenom: "Marine", nom: "Le Pen" }, { id: "b", prenom: "Benoît", nom: "Mathieu" }, { id: "c", prenom: "Teddy", nom: "Riner" }, { id: "d", prenom: "Anne", nom: "Sans Photo" }];
  const r = rapprocherCandidats(liste, [
    { p: "http://www.wikidata.org/entity/Q12927", label: "Marine Le Pen", img: "x.jpg" }, { p: "http://www.wikidata.org/entity/Q12927", label: "Marine Le Pen", img: "y.jpg" },
    { p: "Q1", label: "Benoît Mathieu", img: "a.jpg" }, { p: "Q2", label: "Benoît Mathieu", img: "b.jpg" },
    { p: "Q3", label: "Anne Sans Photo", img: null },
  ]);
  assert.deepEqual(r.map(x => [x.id, x.wikidata, x.image, x.cle]), [["a", "Q12927", "x.jpg", "C:a"]]);
});

/* Robustesse (12/11/2026) : Wikidata et Commons en erreur. Faux fetch, aucune attente réelle. */
const rep = (status, headers = {}) => ({ ok: status >= 200 && status < 300, status, headers: { get: k => headers[k] ?? null } });
const sansAttente = { dormir: async () => {} };

test("appel : 429 puis 503 puis 200 = trois essais, et le résultat", async () => {
  const suite = [rep(429, { "retry-after": "1" }), rep(503), rep(200)]; let n = 0;
  const r = await appeler("https://x", {}, { ...sansAttente, fetchFn: async () => suite[n++] });
  assert.equal(r.status, 200); assert.equal(n, 3);
});

test("appel : une coupure réseau est rejouée ; trois échecs = une erreur", async () => {
  let n = 0;
  await assert.rejects(appeler("https://x", {}, { ...sansAttente, fetchFn: async () => { n++; throw new Error("ECONNRESET"); } }), /ECONNRESET/);
  assert.equal(n, 3);
});

test("appel : une erreur 400 n'est pas rejouée", async () => {
  let n = 0;
  await assert.rejects(appeler("https://x", {}, { ...sansAttente, fetchFn: async () => { n++; return rep(400); } }), /HTTP 400/);
  assert.equal(n, 1);
});

test("reprise de la veille : seulement des candidats toujours listés, jamais une photo retirée ni une licence fermée", () => {
  const ph = (licence = "CC BY-SA 4.0") => ({ data: "data:image/jpeg;base64,AA", auteur: "A", licence });
  const prec = { photos: { a: ph(), b: ph(), parti: ph(), ferme: ph("CC BY-NC 2.0"), vide: { auteur: "A", licence: "CC0" } } };
  const liste = [{ id: "a" }, { id: "b" }, { id: "ferme" }, { id: "vide" }];
  assert.deepEqual(Object.keys(photosReprises(prec, liste, new Set(["C:b"]))), ["a"]);
  assert.deepEqual(photosReprises(null, liste, new Set()), {});
});
