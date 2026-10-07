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

/* L'ORDRE DES RESULTATS EST CELUI DE LA RECHERCHE, PAS UN ORDRE DE VALEUR.
 * Deplace depuis apps/web/src/App.jsx le 29/09/2026 (voir l'historique complet
 * la-bas, defaut « paris » -> « Cormeilles-en-Parisis » du 13/09/2026) : le
 * nom exact d'abord, puis ceux qui commencent par la saisie, puis le reste.
 * Aucune propriete de la commune n'entre dans ce rang (invariant 3). */
export function rangRecherche(nom, cherches) {
  const n = mots(nom).join(" ");
  const q = cherches.join(" ");
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
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

/* LE DEPARTEMENT D'UNE COMMUNE, LU SUR SON CODE INSEE — 07/10/2026.
 * `insee.slice(0, 2)` etait ecrit trois fois (site, application, memoire) : juste
 * en metropole et en Corse (2A, 2B), faux outre-mer, ou le departement tient en
 * trois chiffres (971 a 976, 987, 988 : « 97101 » -> 971, pas 97). Sans effet
 * visible tant que la recherche directe ne lit que l'Ile-de-France ; bloquant
 * des qu'elle couvrira la France entiere. Verifie sur toutes les communes
 * publiees (tests/core.test.mjs). Renvoie null pour un code mal forme : aucune
 * adresse n'est alors composee. */
export function departementDe(insee) {
  const c = String(insee || "").toUpperCase();
  if (!/^(\d{5}|2[AB]\d{3})$/.test(c)) return null;
  return /^9[78]/.test(c) ? c.slice(0, 3) : c.slice(0, 2);
}
