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

test("« Qui decide » n'est plus un onglet : href null le retire de la barre", () => {
  const layout = lire("_layout.tsx");
  const qui = bloc(layout, "qui-decide");
  assert.ok(qui, "la route qui-decide doit rester declaree (ecran ouvert depuis « Aller plus loin »)");
  assert.match(qui, /href:\s*null/, "qui-decide doit porter href: null");
  assert.doesNotMatch(qui, /tabBarLabel:\s*"Chez vous"/, "« Chez vous » ne doit plus designer qui-decide");
});

test("l'ecran territoire est distinct de « Qui decide » : ni chaine des elus, ni composant Chaine", () => {
  const territoire = lire("territoire.tsx");
  assert.doesNotMatch(territoire, /\bChaine\b/, "territoire.tsx reprend la chaine de decision");
  assert.doesNotMatch(territoire, /chaineDecision/, "territoire.tsx calcule la chaine des elus");
  assert.match(territoire, /Circonscription législative|Circonscription legislative/);
  assert.match(territoire, /Intercommunalité|Intercommunalite/);
});
