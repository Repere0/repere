/* PARCOURS — ATTEINTABILITE DES ECRANS, LU DANS LE CODE — 29/10/2026.
 *
 * Un écran qu'aucun geste n'atteint est une impasse : le citoyen ne le trouve
 * pas. Ce contrôle lit les appels de navigation (router.push / replace) et
 * vérifie que chaque écran est atteignable depuis l'accueil. Il est statique :
 * il ne prouve pas que le geste est visible ni agréable, seulement qu'il existe. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");
const APP = path.join(RACINE, "src", "app");
const lire = f => fs.readFileSync(f, "utf8");
const sansCommentaires = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");

/* Les écrans : chaque fichier de route, nommé comme la navigation le nomme
   (sans les groupes de dossier « (onglets) »). */
function fichiersEcrans(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return fichiersEcrans(p);
    if (!/\.tsx$/.test(e.name) || e.name.startsWith("_")) return [];
    return [p];
  });
}
const FICHIERS = fichiersEcrans(APP);
const nomDe = f => path.basename(f, ".tsx");
const TOUS = FICHIERS.map(nomDe);

/* Ce que chaque écran peut ouvrir, lu dans son source. */
function ouvre(f) {
  const s = sansCommentaires(lire(f));
  const out = new Set();
  for (const m of s.matchAll(/router\.(?:push|replace)\(\s*(?:\{\s*pathname:\s*)?"\/?([^"?]+)/g)) out.add(m[1]);
  return [...out];
}

/* Parcours à partir de l'accueil (« index ») : fermeture transitive. */
function atteignables() {
  const parNom = new Map(FICHIERS.map(f => [nomDe(f), f]));
  const vus = new Set(["index"]);
  const file = ["index"];
  while (file.length) {
    const f = parNom.get(file.shift());
    if (!f) continue;
    for (const c of ouvre(f)) {
      if (!vus.has(c)) { vus.add(c); file.push(c); }
    }
  }
  return vus;
}

test("parcours — la fiche d'un député est atteignable depuis l'écran « Votre député »", () => {
  const s = sansCommentaires(lire(path.join(APP, "vote.tsx")));
  assert.match(s, /pathname:\s*"\/elu"/, "l'écran du député ne mène pas à sa fiche");
});

test("parcours — chaque écran de l'application est atteignable depuis l'accueil (aucune impasse)", () => {
  const vus = atteignables();
  const impasses = TOUS.filter(e => !vus.has(e));
  assert.deepEqual(impasses, [], "écrans sans geste d'accès : " + impasses.join(", "));
});
