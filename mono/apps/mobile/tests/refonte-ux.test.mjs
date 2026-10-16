/* GARDE : la refonte UX ne revient pas aux libelles techniques (16/10/2026).
 *  1. le calendrier n'affiche jamais « fin non publiée » : il dit « heure de fin non précisée » ;
 *  2. les etiquettes ne sont plus en capitales de style (theme.ts, TYPO.etiquette) ;
 *  3. « Chez vous » garde ses deux rubriques de circonscription pliables, et ne redit pas la chaine des elus.
 * Lancer : node --test tests/refonte-ux.test.mjs (MOBILE_SRC pour prouver la garde). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ici = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MOBILE_SRC || join(ici, "..", "src");
const lire = p => readFileSync(join(SRC, p), "utf8");

test("le calendrier ne dit jamais « fin non publiée » : une formulation naturelle", () => {
  const cal = lire("app/(onglets)/a-venir.tsx");
  assert.doesNotMatch(cal, /fin non publiée/, "le calendrier affiche encore « fin non publiée »");
  assert.match(cal, /heure de fin non précisée/);
});

test("les etiquettes ne sont plus en capitales de style", () => {
  assert.doesNotMatch(lire("lib/theme.ts"), /textTransform/, "les etiquettes repassent en capitales de style");
});

test("votes : l'etiquette ne dit pas « Dernier scrutin » au-dessus du total de l'archive", () => {
  const v = lire("app/scrutins.tsx");
  assert.doesNotMatch(v, />\s*Dernier scrutin\s*</, "l'etiquette « Dernier scrutin » est revenue au-dessus du total");
  assert.match(v, /Dans l'archive/);
});

test("« Où va l'argent » : un seul projet aidé ouvert, les autres sous un repli annoncé", () => {
  const a = lire("app/argent.tsx");
  assert.match(a, /Voir les \$\{listeProjets\.length - 1\} autres projets aidés/, "les projets suivants ne sont plus sous un repli annonce");
  assert.match(a, /<CarteProjet p=\{listeProjets\[0\]\}/, "le premier projet n'est plus rendu seul");
  assert.match(a, /listeProjets\.length > 1 \? \(/, "le repli n'est plus conditionne a la presence d'autres projets");
  assert.doesNotMatch(a, /listeProjets\.map\(/, "tous les projets sont a nouveau affiches d'un coup");
});

test("« Chez vous » : circonscription pliable, et pas de chaine des elus", () => {
  const t = lire("app/(onglets)/territoire.tsx");
  assert.match(t, /<Depli titre="(Pourquoi|C'est quoi)/, "la circonscription n'a plus son explication pliable");
  assert.doesNotMatch(t, /\bChaine\b|chaineDecision/, "« Chez vous » reprend la chaine des elus");
});

test("détail d'un rendez-vous : une route, reliée au calendrier, sans heure devinée", () => {
  const ev = lire("app/evenement.tsx");
  assert.match(lire("app/_layout.tsx"), /name="evenement"/, "le détail du rendez-vous n'est pas déclaré dans la pile");
  assert.match(lire("app/(onglets)/a-venir.tsx"), /pathname: "\/evenement"/, "le calendrier ne mène plus au détail");
  assert.match(ev, /regrouperParJour/, "le détail ne relit pas le même regroupement que la liste");
  assert.doesNotMatch(ev, /fin non publiée/, "le détail affiche « fin non publiée »");
});

test("sources : la donnée d'origine reste au premier niveau, la licence se déplie", () => {
  const src = lire("app/sources.tsx");
  assert.match(src, /<Depli/, "les sources n'ont plus de repli pour la licence et l'usage");
  const lien = src.indexOf('texte="Voir la donnée originale"');
  const repli = src.indexOf("<Depli");
  assert.ok(lien > 0 && repli > lien, "le lien vers la donnée originale est passé dans le repli");
});

test("dictionnaire : cibles tactiles à 48 pt, pas à 40", () => {
  const dico = lire("app/dictionnaire.tsx");
  assert.doesNotMatch(dico, /minHeight: 40\b/, "une commande du dictionnaire est revenue à 40 pt");
  assert.doesNotMatch(dico, /width: 40\b/, "une lettre du dictionnaire est revenue à 40 pt");
});

test("un seul lien d'action : LienAction, à 48 pt", () => {
  assert.match(lire("lib/composants.tsx"), /export function LienAction\s*\(/, "le lien d'action n'est plus factorisé");
  assert.match(lire("app/(onglets)/qui-decide.tsx"), /<LienAction\b/, "Qui décide n'utilise plus le lien d'action partagé");
  assert.match(lire("app/(onglets)/a-venir.tsx"), /<LienAction\b/, "le calendrier n'utilise plus le lien d'action partagé");
});
