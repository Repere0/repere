/* VOTE VIDE SUR LE SITE : MÊME RÈGLE QUE L'APPLICATION — 29/10/2026.
 *
 * Garde STATIQUE : elle lit le source des écrans et vérifie le branchement, elle
 * ne rend rien. Elle ne prouve pas l'aspect à l'écran.
 * Elle échoue si un écran reprend une ancienne formulation qui confondait les
 * états (« ne porte aucune position » quand le relevé ne s'apparie pas ou que le
 * député n'est pas identifié), ou une cause inventée (« siège vacant », « mandat
 * ouvert après la période relevée »). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROUTES = path.join(import.meta.dirname, "..", "apps", "web", "src", "routes");
const lire = f => fs.readFileSync(path.join(ROUTES, f), "utf8");

test("site — « Ce qui a décidé » : le vide du vote passe par la règle partagée, pas par nbVotes", () => {
  const src = lire("CeQuiADecide.jsx");
  assert.match(src, /etatVoteVide\(/, "l'état doit venir de core (etatVoteVide)");
  assert.match(src, /copieVoteVide\(/, "le texte doit venir de core (copieVoteVide)");
  assert.doesNotMatch(src, /ne porte aucune position pour le député/, "ancienne phrase : confond relevé non apparié et député absent");
  assert.doesNotMatch(src, /n'a pas réussi à obtenir le relevé des scrutins pour ce département/, "ancienne phrase : doit venir de la règle partagée");
});

test("site — « Qui décide » : le vote d'un député identifié sans position dit le périmètre, sans cause inventée", () => {
  const src = lire("QuiDecide.jsx");
  assert.match(src, /copieVoteVide\(ETAT_VOTE\.POSITION_ABSENTE/, "position absente : texte de la règle partagée");
  assert.match(src, /copieVoteVide\(ETAT_VOTE\.POSITION_ABSENTE, \{ nom, elu: true/, "position absente d'un député nommé : le titre porte son nom (elu: true), pas le titre de commune");
  assert.match(src, /copieVoteVide\(ETAT_VOTE\.CIRCO_SANS_DEPUTE/, "député absent du fichier : texte de la règle partagée");
  assert.doesNotMatch(src, /Un mandat ouvert|Un siège vacant|un découpage plus récent/, "cause inventée, non sourcée");
  assert.doesNotMatch(src, /ne porte aucune position pour \$\{nom\}/, "ancienne phrase : une absence de position n'est pas une absence de vote");
});

test("site — les trois pages « Aujourd'hui » n'ont pas de repli « Aucun vote » hors règle", () => {
  for (const f of ["Aujourdhui.jsx", "AujourdhuiJournal.jsx", "AujourdhuiTerritoire.jsx"]) {
    const src = lire(f);
    assert.match(src, /copieVoteVide\(etatVote/, `${f} : le vide vient de copieVoteVide`);
    assert.doesNotMatch(src, /Aucun vote solennel de votre député/, `${f} : ancienne phrase du site`);
  }
});

/* Répertoire des élus : le producteur ne sait que ce que la source a donné. La
   phrase ne généralise donc pas une cause (« ne porte aucune ligne ») : elle dit
   ce que Repère a lu. Le site et l'application disent la même chose. */
test("site et app — répertoire : « ne porte aucune ligne » est remplacé par ce que Repère a lu", () => {
  const APP = path.join(import.meta.dirname, "..", "apps");
  const fichiers = [path.join(APP, "web", "src", "App.jsx"), path.join(APP, "mobile", "src", "app", "index.tsx")];
  for (const f of fichiers) {
    const src = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(src, /ne porte aucune ligne pour cette commune/, `${path.basename(f)} : formulation à remplacer`);
    assert.match(src, /ne contiennent pas de fiche pour cette commune/, `${path.basename(f)} : formulation attendue absente`);
  }
});

/* Syntaxe JSX des écrans du site : une accolade fermante en trop après une
   expression devient du TEXTE rendu à l'écran (« )} »). esbuild ne l'arrête pas,
   il l'émet en avertissement. La garde compile chaque écran avec le même
   transformateur que Vite et refuse tout texte parasite. Écrit rouge avant
   correction (Aujourd'hui.jsx, défaut apparu avec le vide du vote). */
test("site — chaque écran JSX compile sans texte parasite « )} » dans le rendu", async () => {
  const web = path.join(import.meta.dirname, "..", "apps", "web");
  const viteDir = fs.realpathSync(path.join(web, "node_modules", "vite"));
  const vite = await import(new URL("file://" + path.join(viteDir, "dist", "node", "index.js")));
  /* Tous les .jsx du site et du paquet ui, pas seulement les écrans : un composant
     ou une bibliothèque en a le même défaut. */
  const jsxDans = d => fs.readdirSync(d, { withFileTypes: true })
    .flatMap(e => e.isDirectory() ? jsxDans(path.join(d, e.name)) : e.name.endsWith(".jsx") ? [path.join(d, e.name)] : []);
  const fichiers = [...jsxDans(path.join(web, "src")), ...jsxDans(path.join(web, "..", "..", "packages", "ui", "src"))];
  assert.ok(fichiers.length >= 10, `moins de fichiers JSX trouvés (${fichiers.length}) : la garde ne couvre pas le site`);
  for (const f of fichiers) {
    const r = await vite.transformWithEsbuild(fs.readFileSync(f, "utf8"), path.basename(f), { jsx: "automatic", jsxImportSource: "preact", loader: "jsx" });
    assert.doesNotMatch(r.code, /"\)\}"|"\}"/, `${path.basename(f)} : texte « )} » rendu à l'écran (accolade en trop)`);
  }
});
