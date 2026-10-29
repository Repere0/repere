/* CIBLES TACTILES, LU DANS LE CODE — 29/10/2026.
 *
 * Regle du projet : toute cible tactile fait au moins 44 px de haut (et de
 * large si elle est carree). Ce controle est STATIQUE : il lit le source de
 * l'application et ne depend ni d'un navigateur ni du reseau.
 *
 * Il trouve les contrôles qui ont un role interactif (bouton, onglet, lien) et
 * une hauteur ou une largeur minimale inferieure a 44. Le controle navigateur
 * (tests/parcours-web.mjs) ne mesure pas role="tab" : cet angle mort est la
 * raison de ce fichier. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const RACINE = path.resolve(import.meta.dirname, "..");
const fichiers = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? fichiers(p) : (/\.tsx?$/.test(e.name) ? [p] : []);
});
const SOURCES = fichiers(path.join(RACINE, "src"));
const lire = f => fs.readFileSync(f, "utf8");

/* Balises interactives : le texte de la balise, jusqu'au « > » fermant (les
   fonctions fléchées entre accolades ne comptent pas). */
function balises(s) {
  const out = [];
  const re = /<(Pressable|TouchableOpacity|TouchableHighlight)\b/g;
  let m;
  while ((m = re.exec(s))) {
    let i = m.index + m[0].length, depth = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
      i++;
    }
    out.push({ texte: s.slice(m.index, i + 1), ligne: s.slice(0, m.index).split("\n").length });
  }
  return out;
}

test("cibles — aucun contrôle interactif (Pressable) n'a une hauteur minimale sous 44 px", () => {
  const defauts = [];
  for (const f of SOURCES) {
    for (const b of balises(lire(f))) {
      for (const m of b.texte.matchAll(/minHeight:\s*(\d+)/g)) {
        if (Number(m[1]) < 44) defauts.push(`${path.relative(RACINE, f)}:${b.ligne} minHeight ${m[1]}`);
      }
    }
  }
  assert.deepEqual(defauts, [], "cibles tactiles sous 44 px : " + defauts.join(" | "));
});

test("cibles — les lettres du dictionnaire sont des carres de 44 px au moins", () => {
  const src = lire(path.join(RACINE, "src/app/dictionnaire.tsx"));
  const chip = src.match(/const chip = \(actif: boolean\) => \(\{([\s\S]*?)\}\);/);
  assert.ok(chip, "definition de chip introuvable");
  const h = Number((chip[1].match(/minHeight:\s*(\d+)/) || [])[1]);
  assert.ok(h >= 44, `chip minHeight ${h} < 44`);
  const lettre = src.match(/style=\{\[chip\(lettre === l\), \{ width: (\d+)/);
  assert.ok(lettre && Number(lettre[1]) >= 44, `lettre width ${lettre && lettre[1]} < 44`);
});
