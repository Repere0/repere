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

/* Bordure de l'avatar : la même teinte, plus sombre (70 % de chaque canal). Calculée, pas écrite en dur. */
export function bordureGroupe(fond: string): string {
  const canaux = [1, 3, 5].map(i => Math.round(parseInt(fond.slice(i, i + 2), 16) * 0.7));
  return "#" + canaux.map(v => v.toString(16).padStart(2, "0")).join("");
}
