// Garde : le build web complete dist/data avec les fichiers publics absents, sans jamais casser le build.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { miroir, FICHIERS } from "../scripts/miroir-donnees.mjs";

const faux = serveur => async url => {
  const chemin = url.split("/data/")[1];
  if (chemin in serveur) { const v = serveur[chemin]; return { ok: true, status: 200, text: async () => v }; }
  return { ok: false, status: 404, text: async () => "" };
};
const dossier = () => { const d = mkdtempSync(join(tmpdir(), "miroir-")); mkdirSync(join(d, "departments")); writeFileSync(join(d, "departments", "77.json"), "{}"); return d; };

test("copie les fichiers absents, les lots jusqu'au premier 404, et ne touche pas à l'existant", async () => {
  const d = dossier(); writeFileSync(join(d, "agenda-an.json"), '{"local":1}');
  const serveur = { "scrutins-index.json": '{"a":1}', "agenda-an.json": '{"distant":1}', "photos-elus/77.json": "{}",
    "scrutins-details/0000.json": "[]", "scrutins-details/0001.json": "[]", "questions-gouvernement/0000.json": "[]" };
  const b = await miroir(d, { fetchFn: faux(serveur) });
  assert.ok(existsSync(join(d, "scrutins-index.json")));
  assert.ok(existsSync(join(d, "scrutins-details/0001.json")) && !existsSync(join(d, "scrutins-details/0002.json")));
  assert.equal(readFileSync(join(d, "agenda-an.json"), "utf8"), '{"local":1}');
  assert.ok(b.manquants.some(m => m.startsWith("deputes-groupes.json")));
});

test("réseau coupé ou page HTML servie en 200 : pas d'exception, pas de fichier invalide posé", async () => {
  const d = dossier();
  const b1 = await miroir(d, { fetchFn: async () => { throw new Error("offline"); } });
  assert.equal(b1.copies.length, 0); assert.ok(b1.manquants.length >= FICHIERS.length);
  const b2 = await miroir(d, { fetchFn: async () => ({ ok: true, status: 200, text: async () => "<html>" }) });
  assert.equal(b2.copies.length, 0); assert.ok(!existsSync(join(d, "scrutins-index.json")));
});
