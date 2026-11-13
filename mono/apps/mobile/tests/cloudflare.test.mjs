// Cloudflare Pages (12/11/2026) : les règles de routage sont déduites des écrans, jamais écrites à la main.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { routes, redirections, preparer } from "../scripts/cloudflare.mjs";

const app = join(dirname(fileURLToPath(import.meta.url)), "..");

test("chaque écran a son adresse : onglets à la racine, ni _layout ni l'accueil", () => {
  const r = routes(app);
  for (const attendu of ["/finances", "/qui-decide", "/a-venir", "/chez-vous", "/elu", "/vote", "/quiz", "/presidentielle-2027"]) assert.ok(r.includes(attendu), attendu);
  assert.ok(!r.some(x => /_layout|\(|index/.test(x)), r.join(" "));
  assert.ok(!r.includes("/"));
});

test("réécriture vers « / », jamais vers /index.html (Pages répond alors 308 et perd l'écran), avec et sans barre finale", () => {
  const t = redirections(["/finances"]);
  assert.equal(t, "/finances / 200\n/finances/ / 200\n");
  assert.ok(!redirections(routes(app)).includes("index.html"));
});

test("préparer : _redirects, _headers et un 404.html identique à index.html (un fichier de données absent répond 404)", () => {
  const dist = mkdtempSync(join(tmpdir(), "cf-"));
  writeFileSync(join(dist, "index.html"), "<!doctype html><title>Repère</title>");
  const liste = preparer(app, dist);
  assert.equal(readFileSync(join(dist, "404.html"), "utf8"), readFileSync(join(dist, "index.html"), "utf8"));
  assert.equal(readFileSync(join(dist, "_redirects"), "utf8").trim().split("\n").length, liste.length * 2);
  assert.match(readFileSync(join(dist, "_headers"), "utf8"), /\/sw\.js\n {2}Cache-Control: no-cache/);
  assert.ok(existsSync(join(dist, "_headers")));
});
