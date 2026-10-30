/* Le groupe politique d'un depute. Repere ne publie pas encore ce lien (voir
   docs/data/groupes-politiques.md) : tant qu'il manque, le groupe est « Inconnu »,
   jamais un faux groupe. shortcut: aucun fichier de groupes publie, retourne toujours
   « Inconnu », upgrade: lire data/groupes.json quand l'extraction AMO30 existe. */
import { COULEURS_GROUPES, NEUTRES_PAR_MODE, rapportContraste } from "./palette";

export const GROUPE_INCONNU = "Inconnu";

export function groupeDe(_acteurRef?: string): string {
  return GROUPE_INCONNU;
}

/* Couleur du badge : celle du groupe, ou le gris « Inconnu » (jamais une couleur inventee). */
export function couleurGroupe(groupe: string): string {
  return COULEURS_GROUPES[groupe] ?? COULEURS_GROUPES[GROUPE_INCONNU];
}

/* Texte encre ou blanc, celui qui lit le mieux sur la couleur du badge. */
export function texteSur(fond: string): string {
  const { encre, blanc } = NEUTRES_PAR_MODE.clair;
  return rapportContraste(fond, encre) >= rapportContraste(fond, blanc) ? encre : blanc;
}
