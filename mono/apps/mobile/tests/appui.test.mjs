/* GARDE — CHAQUE BOUTON RÉPOND AU DOIGT (sprint « finition », 17/11/2026 ; audit UI 3.2).
 * Tout <Pressable> de src/ porte un retour d'appui : un style qui lit « pressed » (enfonce, ui/mouvement.ts),
 * ou passe par <Pression> (ui/pression.tsx), qui l'anime lui-même. Exceptions écrites ici, avec leur raison. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const SRC = new URL("../src/", import.meta.url).pathname;
const EXCEPTIONS = new Map([
  ["ui/pression.tsx", "le composant Pression anime lui-même son contenu (Animated.View)"],
]);

export function sansRetour(fichier, texte) {
  const sortie = [];
  for (const m of texte.matchAll(/<Pressable\b/g)) {
    let i = m.index + m[0].length, prof = 0;
    for (; i < texte.length; i++) { const c = texte[i]; if (c === "{") prof++; else if (c === "}") prof--; else if (c === ">" && prof === 0) break; }
    /* Exception écrite : le voile derrière la feuille des réglages (style={s.voile}) ; le toucher ferme, rien à enfoncer. */
    const balise = texte.slice(m.index, i);
    if (!/pressed/.test(balise) && !/style=\{s\.voile\}/.test(balise)) sortie.push(`${fichier}:${texte.slice(0, m.index).split("\n").length}`);
  }
  return sortie;
}

test("chaque Pressable a un retour d'appui, sauf exceptions écrites", () => {
  const manque = [];
  const parcourir = d => { for (const n of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, n.name);
    if (n.isDirectory()) parcourir(f);
    else if (n.name.endsWith(".tsx")) {
      const rel = path.relative(SRC, f);
      if (EXCEPTIONS.has(rel)) continue;
      for (const x of sansRetour(rel, fs.readFileSync(f, "utf8"))) if (!EXCEPTIONS.has(x)) manque.push(x);
    } } };
  parcourir(SRC);
  assert.deepEqual(manque, [], "Pressable sans retour d'appui : " + manque.join(", "));
});

test("la garde voit un Pressable sans retour", () => {
  assert.deepEqual(sansRetour("x.tsx", '<Pressable onPress={f} style={{ minHeight: 44 }}>'), ["x.tsx:1"]);
  assert.deepEqual(sansRetour("x.tsx", '<Pressable style={({ pressed }) => [a, pressed && enfonce(true)]}>'), []);
});
