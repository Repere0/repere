/* GARDE : AUCUN PROXY DE THÈME DANS UNE PROP (V34, bloc 1 — crash de l'onglet Élus).
 *
 * lib/theme.ts exporte couleurs, TYPO, TEINTES, GRIS_VOTE et OMBRE sous forme de Proxy
 * (miroir) : ils suivent le thème courant. React Native fige en développement les props
 * des vues natives, et un Proxy de ce type ne le supporte pas : l'écran plante
 * (« trap result is configurable but target property is non-configurable »).
 * On lit ces objets par clé (couleurs.sol) ou on les copie (...OMBRE), jamais en entier.
 *
 * Ce test échoue si un de ces noms est écrit seul dans un tableau ou un objet, c'est-à-dire
 * hors d'une lecture par clé (.x, [x]) et hors d'une copie (...x). */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "src");
const PROXYS = ["couleurs", "TYPO", "TEINTES", "GRIS_VOTE", "OMBRE"];
/* nom seul, à une place de valeur (après une virgule, une ouverture, deux points, un opérateur),
   et suivi d'une fin de valeur. Un défaut de paramètre (c = couleurs) ne compte pas : il n'est pas une prop. */
const SEUL = new RegExp(`(^|[,\\[({:?!&|]\\s*)(${PROXYS.join("|")})\\s*(?=[,\\]\\)}]|$)`);

function fichiers(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return fichiers(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}

/* Renvoie les lignes où un proxy de thème est passé entier. */
export function proxysPassesEntier(texte) {
  const trouvees = [];
  texte.split("\n").forEach((ligne, i) => {
    if (/^\s*(import|export\s+(const|function|type))\b/.test(ligne)) return;
    if (/^\s*\*|^\s*\/\*|^\s*\/\//.test(ligne)) return;
    if (SEUL.test(ligne)) trouvees.push({ ligne: i + 1, texte: ligne.trim() });
  });
  return trouvees;
}

test("aucun proxy de thème (couleurs, TYPO, TEINTES, GRIS_VOTE, OMBRE) n'est passé entier dans une prop", () => {
  const fautes = [];
  for (const f of fichiers(RACINE)) {
    if (f.endsWith(path.join("lib", "theme.ts"))) continue;
    for (const t of proxysPassesEntier(fs.readFileSync(f, "utf8"))) {
      fautes.push(`${path.relative(RACINE, f)}:${t.ligne} → ${t.texte}`);
    }
  }
  assert.deepEqual(fautes, [], "proxy de thème passé entier :\n" + fautes.join("\n"));
});

test("la garde voit le cas du crash (OMBRE dans un tableau de styles) et laisse passer la copie", () => {
  assert.equal(proxysPassesEntier("style={[{ width: 1 }, OMBRE]}").length, 1);
  assert.equal(proxysPassesEntier("style={{ width: 1, ...OMBRE }}").length, 0);
  assert.equal(proxysPassesEntier("color: couleurs.sourd, backgroundColor: couleurs.carte").length, 0);
  assert.equal(proxysPassesEntier("backgroundColor: TEINTES[n.echelon]").length, 0);
  assert.equal(proxysPassesEntier("function Logo({ c = couleurs }) {").length, 0);
  assert.equal(proxysPassesEntier("<Marque c={couleurs} />").length, 1);
});
