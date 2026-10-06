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
/* « st denis », « ste genevieve » (06/10/2026) : l'abreviation se tape plus
   souvent que le mot entier, et aucun nom officiel de commune ne l'emploie.
   Le mot tape garde AUSSI sa forme courte : « st » doit continuer de trouver
   Strasbourg pendant qu'on tape. */
const ABREVIATIONS = { st: "saint", ste: "sainte", sts: "saints", stes: "saintes" };
const formes = m => (ABREVIATIONS[m] ? [m, ABREVIATIONS[m]] : [m]);
export function correspond(cherches, cible) {
  return cherches.every(m => formes(m).some(f => cible.some(w => w.startsWith(f))));
}

/* L'ORDRE DES RESULTATS EST CELUI DE LA RECHERCHE, PAS UN ORDRE DE VALEUR.
 * Deplace depuis apps/web/src/App.jsx le 29/09/2026 (voir l'historique complet
 * la-bas, defaut « paris » -> « Cormeilles-en-Parisis » du 13/09/2026) : le
 * nom exact d'abord, puis ceux qui commencent par la saisie, puis le reste.
 * Aucune propriete de la commune n'entre dans ce rang (invariant 3). */
export function rangRecherche(nom, cherches) {
  const n = mots(nom).join(" ");
  const q = cherches.join(" ");
  const qLong = cherches.map(m => ABREVIATIONS[m] || m).join(" ");
  if (n === q || n === qLong) return 0;
  if (n.startsWith(q) || n.startsWith(qLong)) return 1;
  return 2;
}
/* `liste` : [[insee, nom, motsCible(nom)], ...]. Rend les 30 premieres
   correspondances, dans l'ordre de la recherche puis l'ordre alphabetique. */
export function trouverCommunes(liste, cherches, max = 30) {
  if (!cherches.length) return [];
  return liste.filter(([, , cible]) => correspond(cherches, cible))
    .sort((a, b) => rangRecherche(a[1], cherches) - rangRecherche(b[1], cherches) || a[1].localeCompare(b[1], "fr"))
    .slice(0, max);
}
