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
    /* Forme etiquette(LIBELLES.x) (D22) ou LIBELLES.x ou chaine : l'intitule doit rester le meme. */
    const etiquette = (bloc[0].match(/tabBarLabel: (?:etiquette\(LIBELLES\.(\w+)\)|LIBELLES\.(\w+)|"([^"]+)")/) || []);
    const valeur = (etiquette[1] || etiquette[2]) ? LIBELLES[etiquette[1] || etiquette[2]] : etiquette[3];
    assert.equal(valeur, libelle, `onglet ${ecran} : etiquette « ${valeur} », attendue « ${libelle} »`);
  }
});

test("onglets — « Chez vous » n'est plus le nom d'aucun onglet", () => {
  assert.ok(!/tabBarLabel: "Chez vous"/.test(lire("src/app/(onglets)/_layout.tsx")));
});

/* D22 — navigation à 200 % : la barre basse ne doit ni tronquer les intitulés
 * sur une ligne (le composant vendu le fait : numberOfLines 1), ni figer sa hauteur
 * (72 px rognaient le texte agrandi). Garde statique : un test natif sur appareil
 * reste à faire ; voir le rapport de la livraison. */
test("onglets a 200 % — intitulés sur deux lignes au plus, hauteur non figée", () => {
  const src = lire("src/app/(onglets)/_layout.tsx");
  assert.ok(/numberOfLines=\{2\}/.test(src), "les intitules doivent pouvoir passer sur deux lignes");
  assert.ok(!/height: 72/.test(src), "la barre ne doit pas figer sa hauteur a 72 px");
  assert.ok(/minHeight: 72/.test(src), "la barre garde une hauteur minimale de 72 px");
  assert.ok(/allowFontScaling=\{false\}/.test(src), "le glyphe decoratif reste fixe");
  assert.ok(/allowFontScaling=\{Platform\.OS !== "ios"\}/.test(src), "iOS garde la taille fixe des libelles (convention native), Android suit le texte");
});

test("onglets a 200 % — chaque onglet passe par l'etiquette a deux lignes", () => {
  const src = lire("src/app/(onglets)/_layout.tsx");
  const n = (src.match(/tabBarLabel: etiquette\(LIBELLES\.\w+\)/g) || []).length;
  assert.equal(n, 3, `trois onglets attendus avec etiquette(), trouve ${n}`);
});

/* D22, arbitrage : plafond de 1,2 sur les seuls libelles d'onglet (Android). Le test
   fige la valeur : elle ne bouge pas sans une decision ecrite. Le plafond doit etre
   applique aux libelles, pas a tout le texte. */
test("onglets a 200 % — plafond de 1,2 sur les seuls libelles d'onglet (arbitrage D22)", () => {
  const src = lire("src/app/(onglets)/_layout.tsx");
  assert.match(src, /export const TAILLE_MAX_LIBELLE_ONGLET = 1\.2;/, "la valeur du plafond a change : relire l'arbitrage D22");
  assert.match(src, /maxFontSizeMultiplier=\{TAILLE_MAX_LIBELLE_ONGLET\}/, "le plafond doit s'appliquer au libelle d'onglet");
  assert.ok(!/maxFontSizeMultiplier/.test(lire("src/app/(onglets)/chez-vous.tsx")), "aucun plafond ailleurs que sur la barre basse");
});
