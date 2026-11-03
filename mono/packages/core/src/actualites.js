/* Ordre des actualites : la plus recente d'abord. Deux actualites du meme jour gardent
   leur ordre d'origine (le tri est stable) : un comparateur qui repond -1 dans les deux
   sens, lui, ne garantissait rien. */
export function plusRecentEnPremier(liste) {
  return [...liste].sort((a, b) => b.d.localeCompare(a.d));
}
