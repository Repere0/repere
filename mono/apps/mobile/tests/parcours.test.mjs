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

/* Changer de commune depuis chaque onglet. Le bouton de la barre doit ramener
   a l'accueil (remplacement de la route), et non revenir dans l'historique : sur
   l'onglet « Qui decide », un retour arriere ouvrirait l'onglet precedent. */
test("parcours — chaque onglet offre « changer de commune », qui ramene a l'accueil", () => {
  const s = sansCommentaires(lire(path.join(APP, "(onglets)", "_layout.tsx")));
  /* Le bloc screenOptions seul : borné au premier « }} » qui le ferme. Une regex
     non bornée traversait le fichier et trouvait un bouton posé sur un seul onglet. */
  const debutOpts = s.indexOf("screenOptions={{");
  const finOpts = debutOpts >= 0 ? s.indexOf("}}", debutOpts) : -1;
  const blocOpts = debutOpts >= 0 && finOpts > debutOpts ? s.slice(debutOpts, finOpts) : "";
  const globale = /headerLeft:\s*\(\)\s*=>\s*<ChangerCommune/.test(blocOpts);
  const ecrans = [...s.matchAll(/<Tabs\.Screen\s[\s\S]*?\/>/g)].map(m => m[0]);
  const sans = ecrans
    .filter(x => !globale && !/headerLeft:\s*\(\)\s*=>\s*<ChangerCommune/.test(x))
    .map(x => x.match(/name="([^"]+)"/)[1]);
  assert.deepEqual(sans, [], "onglets sans « changer de commune » : " + sans.join(", "));
  const retour = sansCommentaires(lire(path.join(RACINE, "src", "ui", "retour.tsx")));
  assert.match(retour, /export function ChangerCommune[\s\S]*router\.replace\("\/"\)/, "le bouton doit remplacer la route par l'accueil");
});

/* Le chemin de première utilisation, de bout en bout : l'accueil mène au
   territoire, le territoire à « qui décide », qui mène à la fiche, et la
   fiche donne ses sources. Chaque maillon est une navigation réelle. */
test("parcours — le chemin de première utilisation relie accueil, « qui décide », fiche et sources", () => {
  const lectureDe = f => sansCommentaires(lire(path.join(APP, f)));
  assert.match(lectureDe("index.tsx"), /router\.push\(\s*"\/chez-vous"\s*\)/, "l'accueil ne mène pas au territoire");
  assert.match(lectureDe("(onglets)/chez-vous.tsx"), /pathname:\s*"\/qui-decide"|router\.push\(\s*"\/qui-decide"\s*\)/, "le territoire ne mène pas à « qui décide »");
  assert.match(lectureDe("(onglets)/qui-decide.tsx"), /pathname:\s*"\/elu"/, "« qui décide » ne mène pas à la fiche");
  assert.match(lectureDe("elu.tsx"), /D'où viennent ces informations/, "la fiche ne donne pas ses sources");
});
