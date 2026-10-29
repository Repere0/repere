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
const AIDES_NON_LANCEES = new Set([]);
test("chaque script .mjs de apps/mobile/tests est cite par mobile.yml (pas seulement les *.test.mjs)", () => {
  const yml = lire(join(DEPOT, ".github", "workflows", "mobile.yml"));
  const scripts = readdirSync(ICI).filter((f) => f.endsWith(".mjs") && !f.endsWith(".test.mjs") && !AIDES_NON_LANCEES.has(f));
  const orphelins = scripts.filter((f) => !yml.includes(f));
  assert.deepEqual(orphelins, [], `scripts presents mais jamais cites par mobile.yml : ${orphelins.join(", ")}`);
});
