// Photos d'élus (V36, B3) : filtre de licences et rapprochement par nom, hors réseau.
// Les règles sont celles de scripts/collecte-photos-elus.mjs (ADR 0004, docs/data/photos-elus.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import { LICENCE_OK, concorde, familleRNE } from "../scripts/collecte-photos-elus.mjs";

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
