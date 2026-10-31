/* LES ACTUALITES D'UN FLUX RSS OFFICIEL DE MAIRIE, POUR UNE COMMUNE (D81, ADR 0007).
 *
 * Fonction pure : ne lit rien, n'écrit rien. Le collecteur (mono/scripts/collecte-rss-mairies.mjs)
 * a déjà validé chaque entrée (domaine de la mairie, https, date, deux phrases au plus) ; ici on
 * ne garde que ce qui reste affichable honnêtement : un titre, un lien https, une date passée
 * (invariant 9 : jamais une date future, jamais une fraîcheur inventée). Trois au plus. */
export const ACTUS_FLUX_MAX = 3;

/* D82 : sans « publication: true » (publication désactivée par défaut), rien n'est affiché. */
export function actusFlux(fichier, insee, aujourdhui) {
  if (!fichier || fichier.publication !== true) return [];
  const c = fichier.communes && fichier.communes[insee];
  if (!c || !Array.isArray(c.items)) return [];
  return c.items
    .filter(x => x && typeof x.titre === "string" && x.titre.trim() !== ""
      && /^https:\/\//.test(x.lien || "")
      && /^\d{4}-\d{2}-\d{2}$/.test(x.date || "") && x.date <= aujourdhui)
    .slice(0, ACTUS_FLUX_MAX);
}
