/* Health checks du build — mission phase 3.2, §11. Teste `classerSante()`
 * (scripts/extract-html.js) directement, sans sous-processus : la fonction
 * est pure (aucun process.exit, aucun console), c'est ce qui la rend
 * testable sans risquer de tuer ce lanceur de tests.
 *
 * PROUVER LE GARDE-FOU EN LE CASSANT (doctrine du depot) : ces controles ne
 * se contentent pas de verifier le cas normal, ils fabriquent les trois
 * absences (RNE vide, OFGL absent, les deux) et verifient que la
 * classification les nomme CRITIQUES — c'est cette classification qui, au
 * point d'appel dans extraire(), declenche process.exit(5).
 *
 * Usage : node --test tests/sante.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { classerSante } from "../scripts/extract-html.js";

const RNE_OK = { cl: { "75056": "PARIS" } };
const OFGL_OK = { ech: { commune: { terr: { "75056": { ex: {} } } } } };
const CIRCOS_OK = { communes: { "75056": 1 } };

test("sante — tout present : aucune source critique manquante", () => {
  const r = classerSante(RNE_OK, OFGL_OK, CIRCOS_OK);
  assert.equal(r.critical.elus, true);
  assert.equal(r.critical.comptes, true);
  assert.equal(r.important.circonscriptions, true);
  assert.deepEqual(r.manquantesCritiques, []);
});

test("sante — RNE vide (cl:{}) est classe CRITIQUE, pas juste absent", () => {
  const r = classerSante({ cl: {} }, OFGL_OK, CIRCOS_OK);
  assert.equal(r.critical.elus, false);
  assert.ok(r.manquantesCritiques.includes("elus"));
});

test("sante — RNE null (bloc totalement absent) est classe CRITIQUE", () => {
  const r = classerSante(null, OFGL_OK, CIRCOS_OK);
  assert.equal(r.critical.elus, false);
  assert.ok(r.manquantesCritiques.includes("elus"));
});

test("sante — OFGL absent est classe CRITIQUE (comptes), pas seulement un avertissement", () => {
  const r = classerSante(RNE_OK, null, CIRCOS_OK);
  assert.equal(r.critical.comptes, false);
  assert.ok(r.manquantesCritiques.includes("comptes"));
  assert.equal(r.critical.elus, true, "RNE present ne doit pas etre affecte par l'absence d'OFGL");
});

test("sante — OFGL present mais sans aucune commune (terr:{}) reste CRITIQUE", () => {
  const r = classerSante(RNE_OK, { ech: { commune: { terr: {} } } }, CIRCOS_OK);
  assert.equal(r.critical.comptes, false);
});

test("sante — RNE et OFGL absents ensemble : les deux sont nommes, pas un seul", () => {
  const r = classerSante(null, null, CIRCOS_OK);
  assert.deepEqual(new Set(r.manquantesCritiques), new Set(["elus", "comptes"]));
});

test("sante — CIRCOS absent est IMPORTANT, jamais CRITIQUE (ne doit pas arreter le build)", () => {
  const r = classerSante(RNE_OK, OFGL_OK, null);
  assert.equal(r.important.circonscriptions, false);
  assert.deepEqual(r.manquantesCritiques, [], "l'absence de circos ne doit jamais figurer parmi les manquantes critiques");
});

/* PREUVE DE BOUT EN BOUT, PAS SEULEMENT DE LA LOGIQUE PURE — mission phase
 * 3.2, §10 : "determiner si le pipeline sait REELLEMENT echouer quand il
 * le doit". Fabrique une copie du VRAI fichier source, ampute juste du bloc
 * OFGL (une seule ligne retiree, tout le reste authentique — RNE, CIRCOS,
 * structure HTML reels), et verifie que `node scripts/extract-html.js`
 * s'arrete reellement avec un code de sortie non nul plutot que de
 * publier un site ou "Ou va l'argent" serait vide pour toutes les
 * communes en silence. */
test("sante — extract-html.js ECHOUE reellement (pas juste un avertissement) si OFGL manque du fichier source", async (t) => {
  const fs = await import("node:fs");
  const os = await import("node:os");
  const path = await import("node:path");
  const { spawnSync } = await import("node:child_process");

  const source = path.resolve("../app_repere_v18_20.html");
  if (!fs.existsSync(source)) { t.skip("app_repere_v18_20.html absent de ce poste"); return; }

  const brut = fs.readFileSync(source, "utf8");
  const lignes = brut.split("\n").filter(l => !l.startsWith("window.REPERE_OFGL = "));
  assert.ok(lignes.length < brut.split("\n").length, "le bloc OFGL n'a pas ete trouve dans le fichier source — le test ne prouve rien");

  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "repere-sante-"));
  const fixtureSansOfgl = path.join(dossier, "sans-ofgl.html");
  fs.writeFileSync(fixtureSansOfgl, lignes.join("\n"));
  const sortie = path.join(dossier, "data");

  const r = spawnSync(process.execPath, ["scripts/extract-html.js", fixtureSansOfgl, sortie], { encoding: "utf8" });
  fs.rmSync(dossier, { recursive: true, force: true });

  assert.notEqual(r.status, 0, "extract-html.js a rendu un code de sortie 0 avec OFGL absent : le garde-fou ne fonctionne pas — " + (r.stderr || "").slice(-400));
  assert.match(r.stderr || "", /CRITIQUE/, "le message d'erreur ne nomme pas la cause");
});
