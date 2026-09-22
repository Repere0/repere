/* TESTS DU REGISTRE DES SOURCES — objectif 12 de la mission du 22/09/2026.
 *
 * DETERMINISTES, SANS RESEAU. Un serveur HTTP local et deux petits fichiers
 * sous fixtures/ remplacent toute source reelle — le meme motif que
 * mono/tests/runtime.test.mjs, qui monte son propre serveur plutot que de
 * dependre d'un reseau ou d'un etat externe.
 *
 * Lancer : node --test outils/registre/tests.test.mjs
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sonder } from "./verifier_sources.mjs";
import { mesurer } from "./couverture.mjs";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(ICI, "fixtures");

let serveur, base;

before(async () => {
  serveur = http.createServer((req, rep) => {
    if (req.url === "/ok") {
      const corps = "x".repeat(20000);
      rep.writeHead(200, { "content-length": corps.length, "last-modified": "Mon, 01 Sep 2026 00:00:00 GMT" });
      return rep.end(req.method === "HEAD" ? undefined : corps);
    }
    if (req.url === "/petit") {
      const corps = "trop petit";
      rep.writeHead(200, { "content-length": corps.length });
      return rep.end(req.method === "HEAD" ? undefined : corps);
    }
    if (req.url === "/frais") {
      const corps = "x".repeat(20000);
      rep.writeHead(200, { "content-length": corps.length, "last-modified": new Date().toUTCString() });
      return rep.end(req.method === "HEAD" ? undefined : corps);
    }
    if (req.url === "/refuse-head" && req.method === "HEAD") {
      rep.writeHead(405);
      return rep.end();
    }
    if (req.url === "/refuse-head" && req.method === "GET") {
      const corps = "x".repeat(20000);
      rep.writeHead(200, { "content-length": corps.length });
      return rep.end(corps);
    }
    rep.writeHead(404);
    rep.end();
  });
  await new Promise(r => serveur.listen(0, "127.0.0.1", r));
  base = "http://127.0.0.1:" + serveur.address().port;
});

after(() => { serveur.close(); });

test("verifier_sources — une source saine est READY", async () => {
  const r = await sonder({ id: "test_ok", url: base + "/ok" });
  assert.equal(r.status, "READY");
  assert.equal(r.errors.length, 0);
});

test("verifier_sources — une reponse anormalement petite est DATA_INVALID", async () => {
  const r = await sonder({ id: "test_petit", url: base + "/petit" });
  assert.equal(r.status, "DATA_INVALID");
  assert.ok(r.warnings.some(w => w.includes("suspecte")));
});

test("verifier_sources — une URL introuvable est SOURCE_UNAVAILABLE, pas une exception", async () => {
  const r = await sonder({ id: "test_404", url: base + "/introuvable" });
  assert.equal(r.status, "SOURCE_UNAVAILABLE");
  assert.ok(r.errors.some(e => e.includes("404")));
});

test("verifier_sources — une source sans URL est SOURCE_NOT_PUBLISHED, jamais une requete", async () => {
  const r = await sonder({ id: "test_sans_url" });
  assert.equal(r.status, "SOURCE_NOT_PUBLISHED");
});

test("verifier_sources — HEAD refusee (405) retente en GET", async () => {
  const r = await sonder({ id: "test_head_refuse", url: base + "/refuse-head" });
  assert.equal(r.status, "READY");
  assert.ok(r.warnings.some(w => w.includes("HEAD refusee")));
});

test("verifier_sources — signale une source mise a jour depuis le dernier releve connu", async () => {
  const r = await sonder({ id: "test_frais", url: base + "/frais", derniere_maj_connue: "2020-01-01" });
  assert.ok(r.warnings.some(w => w.includes("mise a jour depuis")),
    "le changement de Last-Modified aurait du etre signale : " + JSON.stringify(r.warnings));
});

test("couverture — compte trouvees/absentes/inconnues par source, sur les fixtures", () => {
  const r = mesurer(FIXTURES);
  assert.equal(r.communes_attendues, 4);
  assert.equal(r.sources.rne.trouvees, 2, "rne : 99001 et 99003 ont un maire");
  assert.equal(r.sources.rne.absentes, 2, "rne : 99002 (sans maire) et 99004 (absente du fichier)");
  assert.deepEqual(r.sources.rne.inconnues, ["99999"]);
  assert.equal(r.sources.circos_ministere.trouvees, 2, "circos : 99001 et 99002 ont un circo");
  assert.equal(r.sources.ofgl_comptes.trouvees, 2, "ofgl : 99001 et 99002 ont des comptes non vides");
});

test("couverture — detecte l'homonyme sans le fusionner", () => {
  const r = mesurer(FIXTURES);
  assert.equal(r.homonymes.length, 1);
  assert.equal(r.homonymes[0].nom, "Homonyme");
  assert.deepEqual(r.homonymes[0].insee.sort(), ["99003", "99004"]);
});

test("couverture — jamais de rapprochement par le nom : 99999 reste inconnue malgre un nom present ailleurs", () => {
  const r = mesurer(FIXTURES);
  assert.ok(r.sources.rne.inconnues.includes("99999"),
    "un code INSEE hors reference doit rester 'inconnu', jamais rattache par son nom");
});
