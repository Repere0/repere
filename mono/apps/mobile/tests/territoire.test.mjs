/* GARDE : « Chez vous » est un ecran distinct de « Qui decide » (15/10/2026).
 *
 * Trois verifications statiques sur le code source (pas de rendu) :
 *  1. la barre basse porte un onglet « Chez vous » qui ouvre l'ecran territoire ;
 *  2. « Qui decide » n'a plus d'onglet (href: null) : il reste une sortie ;
 *  3. l'ecran territoire ne reprend ni la chaine des elus ni le composant Chaine.
 *
 * Lancer : node --test tests/territoire.test.mjs
 * Variable MOBILE_SRC : dossier src/ a lire (sert a prouver la garde en la cassant). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
/* Les cinq echelons geles, lus a leur source unique. */
const { ECHELONS } = await import("../../../packages/data-utils/src/invariants.js");

const ici = dirname(fileURLToPath(import.meta.url));
const SRC = process.env.MOBILE_SRC || join(ici, "..", "src");
const lire = f => readFileSync(join(SRC, "app", "(onglets)", f), "utf8");

/* Le bloc d'un <Tabs.Screen name="..." ... /> ; le nom est celui de la route. */
function bloc(layout, nom) {
  const debut = layout.indexOf(`name="${nom}"`);
  if (debut < 0) return null;
  const debutBalise = layout.lastIndexOf("<Tabs.Screen", debut);
  const fin = layout.indexOf("/>", debut);
  return layout.slice(debutBalise, fin + 2);
}

test("la barre basse a un onglet « Chez vous » qui ouvre l'ecran territoire", () => {
  const layout = lire("_layout.tsx");
  const onglet = bloc(layout, "territoire");
  assert.ok(onglet, "pas d'onglet territoire dans _layout.tsx");
  assert.match(onglet, /(?:tabBarLabel:\s*(?:libelle\()?|\.\.\.nomOnglet\()"Chez vous"/);
  assert.doesNotMatch(onglet, /href:\s*null/, "l'onglet Chez vous ne doit pas etre masque");
  assert.ok(lire("territoire.tsx").length > 0, "app/(onglets)/territoire.tsx absent");
});

test("« Qui decide » est le quatrieme onglet, et reste joignable autrement", () => {
  /* DECISION DU PORTEUR, 20/10/2026 (maquette Stitch) : la barre passe a quatre
     onglets. Le 13/10, la decision etait l'inverse — « Qui decide » etait une sortie
     de « Chez vous », pas un onglet. Ce qui ne change pas : c'est le MEME ecran, et
     les chemins existants continuent d'y mener, sinon on aurait deux produits.
     Ce que la garde protege toujours : « Chez vous » designe territoire, jamais
     qui-decide — c'est la confusion corrigee le 15/10. */
  const layout = lire("_layout.tsx");
  const qui = bloc(layout, "qui-decide");
  assert.ok(qui, "la route qui-decide doit rester declaree");
  assert.doesNotMatch(qui, /href:\s*null/, "qui-decide ne doit plus etre retire de la barre");
  assert.match(qui, /tabBarIcon/, "un onglet sans icone n'est pas un onglet");
  assert.doesNotMatch(qui, /tabBarLabel:\s*"Chez vous"/, "« Chez vous » ne doit plus designer qui-decide");
  const aujourdhui = lire("chez-vous.tsx");
  assert.match(aujourdhui, /\/qui-decide/, "le chemin depuis « Aujourd'hui » doit rester");
});

test("l'ecran territoire est distinct de « Qui decide » : ni chaine des elus, ni composant Chaine", () => {
  const territoire = lire("territoire.tsx");
  assert.doesNotMatch(territoire, /\bChaine\b/, "territoire.tsx reprend la chaine de decision");
  assert.doesNotMatch(territoire, /chaineDecision/, "territoire.tsx calcule la chaine des elus");
  assert.match(territoire, /Circonscription législative|Circonscription legislative/);
  assert.match(territoire, /Intercommunalité|Intercommunalite/);
});

test("chaque rubrique de territoire porte la couleur de son echelon, et son nom en toutes lettres", () => {
  /* 21/10/2026. « Chez vous » nommait des echelons sans jamais les relier a la
     legende de couleurs de « Qui decide ». Un filet dans la couleur de l'echelon
     fait le lien. Cette garde verifie deux choses :
       1. les echelons cites existent parmi les CINQ GELES — pas de sixieme
          couleur introduite en douce par une faute de frappe ;
       2. chaque rubrique coloree garde son LIBELLE ECRIT : la couleur ne porte
          jamais seule l'information (invariant 7).
     Eprouvee en remplacant echelon="dept" par echelon="departement" : elle tombe
     sur « echelon inconnu ». */
  const territoire = lire("territoire.tsx");
  const cites = [...territoire.matchAll(/<Rubrique\s+titre="([^"]+)"\s+echelon="([^"]+)"/g)];
  assert.ok(cites.length >= 4, `attendu au moins 4 rubriques a echelon, trouve ${cites.length}`);
  for (const [, titre, echelon] of cites) {
    assert.ok(Object.keys(ECHELONS).includes(echelon), `echelon inconnu « ${echelon} » sur la rubrique « ${titre} »`);
    assert.ok(titre.trim().length > 2, `la rubrique a echelon « ${echelon} » n'a pas de libelle ecrit`);
  }
});
