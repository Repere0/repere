// GARDE DE LA CHAINE DE CONTROLES DE L'APPLICATION MOBILE (C2, 29/10/2026).
//
// mobile.yml lance les tests node par une liste ecrite a la main. Un fichier de
// test ajoute sans etre ajoute a cette liste ne tourne jamais, et la CI reste verte.
// Ce garde ne lit aucune liste codee ici : il deduit la couverture du disque et des
// fichiers de workflow, puis exige que chaque test soit execute quelque part.
//
// Repartition attendue :
//   - apps/mobile/tests/*.test.mjs : obligatoirement dans le socle de mobile.yml ;
//   - mono/tests/*.test.mjs : dans le socle de mobile.yml, OU dans `pnpm test`
//     (racine de mono/), que pipeline.sh lance pour toute PR qui ne touche pas
//     seulement apps/mobile (epreuve.yml) ;
//   - une PR qui ne touche que apps/mobile/** declenche mobile.yml, et seulement lui.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ICI = dirname(fileURLToPath(import.meta.url)); // mono/apps/mobile/tests
const MONO = join(ICI, "..", "..", ".."); // mono/
const DEPOT = join(MONO, ".."); // racine du depot

const lire = (chemin) => readFileSync(chemin, "utf8");
const fichiersTest = (dossier) =>
  readdirSync(dossier).filter((f) => f.endsWith(".test.mjs"));
const motsTest = (texte) => texte.match(/[\w/.-]+\.test\.mjs/g) || [];

// Ligne de mobile.yml qui lance node --test : elle donne le socle, chemins relatifs a mono/.
function socleMobile() {
  const yml = lire(join(DEPOT, ".github", "workflows", "mobile.yml"));
  const ligne = yml.split("\n").find((l) => l.includes("node --test"));
  assert.ok(ligne, "mobile.yml : ligne « node --test » introuvable");
  return new Set(motsTest(ligne));
}

// Tests lances par `pnpm test` a la racine de mono/.
function testsRacine() {
  const pkg = JSON.parse(lire(join(MONO, "package.json")));
  return new Set(motsTest(pkg.scripts.test || ""));
}

test("le socle de mobile.yml ne cite aucun fichier absent du disque", () => {
  for (const chemin of socleMobile()) {
    assert.ok(existsSync(join(MONO, chemin)), `fichier fantome dans mobile.yml : ${chemin}`);
  }
});

test("chaque test de l'application mobile est lance par mobile.yml", () => {
  const socle = socleMobile();
  const manquants = fichiersTest(ICI)
    .map((f) => `apps/mobile/tests/${f}`)
    .filter((chemin) => !socle.has(chemin));
  assert.deepEqual(
    manquants,
    [],
    `tests presents mais jamais lances par mobile.yml : ${manquants.join(", ")}`,
  );
});

test("chaque test racine est lance par mobile.yml OU par pnpm test (que pipeline.sh execute)", () => {
  const socle = socleMobile();
  const racine = testsRacine();
  const pipeline = lire(join(DEPOT, "outils", "pipeline.sh"));
  // Sans cette ligne, « pnpm test » ne serait lance par aucune epreuve.
  assert.ok(
    pipeline.includes("cd mono && pnpm test"),
    "pipeline.sh ne lance plus « pnpm test » : la couverture racine tombe",
  );
  const orphelins = fichiersTest(join(MONO, "tests"))
    .map((f) => `tests/${f}`)
    .filter((chemin) => !socle.has(chemin) && !racine.has(chemin));
  assert.deepEqual(
    orphelins,
    [],
    `tests racine lances par aucune chaine : ${orphelins.join(", ")}`,
  );
});

test("epreuve.yml n'ignore que apps/mobile, et mobile.yml se declenche sur ce chemin", () => {
  const epreuve = lire(join(DEPOT, ".github", "workflows", "epreuve.yml"));
  const bloc = epreuve.split("paths-ignore:")[1] || "";
  const ignores = bloc.split("\n").slice(1, 4).filter((l) => l.trim().startsWith("-"));
  assert.deepEqual(
    ignores.map((l) => l.trim()),
    ['- "mono/apps/mobile/**"'],
    "epreuve.yml doit ignorer exactement mono/apps/mobile/**",
  );
  const mobile = lire(join(DEPOT, ".github", "workflows", "mobile.yml"));
  assert.ok(
    mobile.includes('"mono/apps/mobile/**"'),
    "mobile.yml ne se declenche plus sur mono/apps/mobile/** : une PR mobile ne serait verifiee nulle part",
  );
});

// LACUNE FERMEE (29/10/2026). Le filtre `.test.mjs` ignorait les scripts de
// controle qui ne portent pas ce suffixe (ex. parcours-web.mjs, le parcours
// navigateur a 200 %) : un script ajoute sans etre cite dans mobile.yml ne tournait
// jamais, et la CI restait verte. Tout .mjs du dossier de tests doit etre cite
// quelque part dans mobile.yml, sauf les aides explicitement listees ici.
/* Les aides : du code partage par plusieurs tests, jamais lance seul. Le nom commence par « _ ». */
const AIDES_NON_LANCEES = new Set(["_premier-lancement.mjs"]);
test("chaque script .mjs de apps/mobile/tests est cite par mobile.yml (pas seulement les *.test.mjs)", () => {
  const yml = lire(join(DEPOT, ".github", "workflows", "mobile.yml"));
  const scripts = readdirSync(ICI).filter((f) => f.endsWith(".mjs") && !f.endsWith(".test.mjs") && !AIDES_NON_LANCEES.has(f));
  const orphelins = scripts.filter((f) => !yml.includes(f));
  assert.deepEqual(orphelins, [], `scripts presents mais jamais cites par mobile.yml : ${orphelins.join(", ")}`);
});

/* ─── 13/11/2026 : UN FICHIER PUBLIE QUE L'APPLICATION NE RECOIT PAS ────────────────────────────────────
 * L'application servie sur le web lit SA PROPRE ORIGINE (/data, invariants 1 et 2). dist/data est rempli
 * par deux voies, et deux seulement : l'extraction du fichier autonome, ou le miroir des fichiers publics
 * (scripts/miroir-donnees.mjs). Un fichier publie par la chaine mais absent des deux n'arrive jamais a
 * l'ecran — et l'ecran applique alors la doctrine du vide en disant « pas encore publie », ce qui est FAUX.
 * C'est arrive deux fois : les photos des candidats (12/11), puis les senateurs et le plan de l'hemicycle
 * (13/11, trouve par un test sur iPhone, pas par le banc). Cette garde le refuse. */
test("tout fichier entier servi a l'application arrive jusqu'a dist/data", async () => {
  const { FICHIERS } = await import("../scripts/miroir-donnees.mjs");
  /* Produits par `extract-html.js` depuis le fichier autonome, puis copies tels quels dans dist/data. */
  const PRODUITES_PAR_EXTRACTION = new Set([
    "index.json", "communes-beta.json", "deputes.json", "scrutins.json", "evenements.json",
    "comptes-regions.json", "decoupage-idf.json",
  ]);
  const client = lire(join(DEPOT, "mono", "packages", "data-utils", "src", "client.js"));
  /* Les adresses de FICHIER ENTIER : celles qui ne portent aucun parametre (`${d}`, `${lotPadded}`...).
     Les autres (par departement, par lot) sont prises en charge par les boucles du miroir. */
  const entieres = [...new Set([...client.matchAll(/\$\{BASE_DONNEES\}\/([A-Za-z0-9_.-]+\.json)\b/g)].map(m => m[1]))];
  assert.ok(entieres.length >= 20, `trop peu d'adresses lues dans client.js (${entieres.length}) : la lecture a change de forme`);
  const couvertes = new Set([...FICHIERS, ...PRODUITES_PAR_EXTRACTION]);
  const orphelines = entieres.filter(f => !couvertes.has(f));
  assert.deepEqual(orphelines, [],
    "ces fichiers sont demandes par l'application mais n'arrivent jamais dans dist/data : "
    + orphelines.join(", ") + ". Ajoutez-les a FICHIERS dans apps/mobile/scripts/miroir-donnees.mjs "
    + "(ou a PRODUITES_PAR_EXTRACTION ici s'ils sortent du fichier autonome).");
});

/* ─── 13/11/2026 : UNE REDIRECTION AU MONTAGE NE PASSE PAS PAR `router` ────────────────────────────────
 * Vu sur iPhone : au premier lancement, la question du prenom ne s'affichait jamais. La cause etait un
 * `router.replace` lance depuis un effet du PREMIER rendu : l'ordre part avant que la pile d'ecrans soit
 * prete, et expo-router le perd SANS BRUIT. En navigateur de bureau, la pile etait prete a temps et le
 * banc restait vert — c'est pour cela que cette garde lit le code, et pas l'ecran. */
test("l'accueil redirige vers la bienvenue de facon declarative, jamais par un ordre de navigation au montage", () => {
  const accueil = lire(join(ICI, "..", "src", "app", "index.tsx"));
  assert.match(accueil, /<Redirect href="\/bienvenue" \/>/, "l'accueil doit rediriger avec <Redirect> (expo-router l'applique quand la pile est prete)");
  const effets = [...accueil.matchAll(/useEffect\(\s*\(\)\s*=>\s*\{?[^}]*router\.(replace|push)\(\s*["'`]\/bienvenue/g)];
  assert.deepEqual(effets.map(m => m[0].slice(0, 60)), [],
    "une redirection vers /bienvenue part d'un effet : elle sera perdue si la pile d'ecrans n'est pas encore prete");
});
