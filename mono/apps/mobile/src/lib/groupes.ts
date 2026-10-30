/* Le groupe politique d'un depute. Repere ne publie pas encore ce lien (voir
   docs/data/groupes-politiques.md) : tant qu'il manque, le groupe est « Inconnu »,
   jamais un faux groupe. shortcut: aucun fichier de groupes publie, retourne toujours
   « Inconnu », upgrade: lire data/groupes.json quand l'extraction AMO30 existe. */
export const GROUPE_INCONNU = "Inconnu";

export function groupeDe(_acteurRef: string): string {
  return GROUPE_INCONNU;
}
