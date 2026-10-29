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
