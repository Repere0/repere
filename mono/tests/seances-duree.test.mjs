/* Heure de fin des seances de l'Assemblee (13/10/2026).
 *
 * POURQUOI CE TEST. La duree d'une seance vient de l'heure de fin publiee par la
 * source, recopiee par outils/agenda_an.py puis par scripts/agenda-an.mjs. Ce test
 * fait tourner le script publie sur un fixture et verifie trois choses :
 *   1. une fin coherente est recopiee telle quelle ;
 *   2. une seance sans fin reste sans fin (doctrine du vide : rien n'est devine) ;
 *   3. une fin anterieure au debut est ecartee, pas affichee.
 * Il ne touche pas le reseau. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ici = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.resolve(ici, "../scripts/agenda-an.mjs");

function publier(reunions) {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), "repere-fin-"));
  const entree = path.join(dossier, "agenda_an.json");
  const sortie = path.join(dossier, "sortie");
  fs.writeFileSync(entree, JSON.stringify({
    v: 1, maj: "2099-01-01",
    org: [["ASSEMBLEE", "Assemblée nationale de la 17ème législature"]],
    r: reunions,
  }));
  const pr = spawnSync(process.execPath, [SCRIPT, sortie, entree], { encoding: "utf8" });
  assert.equal(pr.status, 0, pr.stderr || pr.stdout);
  return JSON.parse(fs.readFileSync(path.join(sortie, "agenda-an.json"), "utf8")).evenements;
}

test("seances — une heure de fin publiee est recopiee, la date de debut aussi", () => {
  const ev = publier([
    { d: "2099-10-13T17:00", t: "seance", o: 0, f: "2099-10-13T18:30" },
  ]);
  assert.equal(ev.length, 1);
  assert.equal(ev[0].debut, "2099-10-13T17:00");
  assert.equal(ev[0].fin, "2099-10-13T18:30");
});

test("seances — sans heure de fin dans la source, pas de fin inventee", () => {
  const ev = publier([
    { d: "2099-10-13T21:30", t: "seance", o: 0 },
  ]);
  assert.equal(ev[0].fin, null);
});

test("seances — une fin anterieure au debut est ecartee, jamais affichee", () => {
  const ev = publier([
    { d: "2099-10-13T23:30", t: "seance", o: 0, f: "2099-10-13T22:00" },
  ]);
  assert.equal(ev[0].fin, null, "une fin avant le debut ne doit pas sortir");
});

test("seances — les commissions ne passent pas dans le calendrier de la seance", () => {
  const ev = publier([
    { d: "2099-10-13T10:00", t: "commission", o: 0, f: "2099-10-13T12:00" },
    { d: "2099-10-13T17:00", t: "seance", o: 0, f: "2099-10-13T18:00" },
  ]);
  assert.equal(ev.length, 1);
  assert.equal(ev[0].debut, "2099-10-13T17:00");
});
