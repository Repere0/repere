/* TYPES DU LOCAL (05/11/2026) : les exemples fictifs respectent les types, et les types
   refusent un statut majorité/opposition sans source, ou un décompte de vote sans état. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const MONO = path.resolve(import.meta.dirname, "..");
const TSC = path.join(MONO, "apps", "mobile", "node_modules", "typescript", "bin", "tsc");
const tsc = fichier => spawnSync(process.execPath, [TSC, "--noEmit", "--strict", "--skipLibCheck", fichier], { encoding: "utf8" });

test("les exemples fictifs respectent les types du local", { skip: !fs.existsSync(TSC) && "typescript absent" }, () => {
  const r = tsc(path.join(MONO, "tests", "fixtures", "local-fictif.ts"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

test("un statut de majorité sans source est refusé par les types", { skip: !fs.existsSync(TSC) && "typescript absent" }, () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "local-"));
  const f = path.join(dir, "faux.ts");
  fs.writeFileSync(f, `import type { GroupeMunicipal } from ${JSON.stringify(path.join(MONO, "packages/core/src/local"))};
const g: GroupeMunicipal = { libelle: "X", sieges: 3, statut: { valeur: "majorite", source: null } };
export default g;`);
  assert.notEqual(tsc(f).status, 0, "un statut majorité sans provenance doit être refusé");
});

test("les exemples ne sont importés par aucune application", () => {
  const apps = path.join(MONO, "apps");
  const trouves = spawnSync("grep", ["-rl", "--include=*.ts", "--include=*.tsx", "--include=*.js", "--include=*.jsx", "--exclude-dir=node_modules", "local-fictif", apps], { encoding: "utf8" });
  assert.equal(trouves.stdout.trim(), "", "un écran importe des données fictives : " + trouves.stdout);
});

/* 07/11/2026 : le schéma de référence des maquettes Stitch compile en strict, et aucune application ne l'importe. */
test("le schéma Stitch compile en strict et n'est importé par aucune application", { skip: !fs.existsSync(TSC) && "typescript absent" }, () => {
  const r = tsc(path.join(MONO, "packages", "core", "src", "types", "schema.ts"));
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const trouves = spawnSync("grep", ["-rl", "--include=*.ts", "--include=*.tsx", "--exclude-dir=node_modules", "types/schema", path.join(MONO, "apps")], { encoding: "utf8" });
  assert.equal(trouves.stdout.trim(), "", "un écran importe le schéma de référence : " + trouves.stdout);
});
