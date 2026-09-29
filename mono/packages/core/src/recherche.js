/* @repere/core — LA REGLE DE RECHERCHE, UNE SEULE FOIS (29/09/2026).
 * Deplacee depuis apps/web/src/App.jsx : le site et l'application mobile
 * trouvent les memes communes pour la meme saisie. */
/* Comparer « Pyrenees at » et « Pyrénées-Atlantiques » : au clavier, personne ne
   tape les accents, et le trait d'union se tape en espace une fois sur deux. On
   ramene donc tout a des mots nus, et on demande que chaque mot cherche soit le
   debut d'un mot du territoire — « cotes armor », « val doise », « 64 ». */
export function mots(t) {
  return String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
}
/* L'apostrophe se tape rarement : « val doise » doit trouver Val-d'Oise, et
   « cote dor » la Cote-d'Or. On indexe donc aussi la forme sans apostrophe, ou
   « d'Oise » devient un seul mot. */
export function motsCible(t) {
  return [...new Set([...mots(t), ...mots(String(t || "").replace(/['\u2019]/g, ""))])];
}
export function correspond(cherches, cible) {
  return cherches.every(m => cible.some(w => w.startsWith(m)));
}
