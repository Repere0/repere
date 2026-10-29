/* ONGLETS ET LIBELLES — 29/10/2026.
 *
 * Les intitulés officiels de Repère sont dans packages/core/src/libelles.js
 * (decisions du 07/10/2026 : « Aujourd'hui », « Qui décide », « Le calendrier »
 * partout). Ce controle statique verifie que la barre d'onglets et les titres
 * d'ecran reprennent exactement ces intitulés, sans nom hérité (« Chez vous »
 * a été retiré comme nom de l'accueil). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { LIBELLES } from "../../../packages/core/src/libelles.js";

const RACINE = path.resolve(import.meta.dirname, "..");
const lire = p => fs.readFileSync(path.join(RACINE, p), "utf8");

test("onglets — chaque onglet porte l'intitule officiel de son ecran", () => {
  const src = lire("src/app/(onglets)/_layout.tsx");
  const attendu = { "chez-vous": LIBELLES.aujourdhui, "qui-decide": LIBELLES.qui, "a-venir": LIBELLES.calendrier };
  for (const [ecran, libelle] of Object.entries(attendu)) {
    const bloc = src.match(new RegExp(`name="${ecran}"[\\s\\S]*?\\/>|name="${ecran}"[\\s\\S]*?\\}\\)`));
    assert.ok(bloc, `onglet ${ecran} introuvable`);
    const etiquette = (bloc[0].match(/tabBarLabel: (?:LIBELLES\.(\w+)|"([^"]+)")/) || []);
    const valeur = etiquette[1] ? LIBELLES[etiquette[1]] : etiquette[2];
    assert.equal(valeur, libelle, `onglet ${ecran} : etiquette « ${valeur} », attendue « ${libelle} »`);
  }
});

test("onglets — « Chez vous » n'est plus le nom d'aucun onglet", () => {
  assert.ok(!/tabBarLabel: "Chez vous"/.test(lire("src/app/(onglets)/_layout.tsx")));
});
