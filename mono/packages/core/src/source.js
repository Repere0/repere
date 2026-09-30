/* @repere/core — LA LIGNE DE SOURCE, ECRITE UNE FOIS (29/09/2026).
 * Separee de phrases.js le 30/09/2026 : le composant Source du site est dans le
 * premier ecran ; ce petit fichier y entre seul, sans entrainer toutes les
 * phrases des ecrans charges plus tard (mesure : le premier ecran passait de
 * 120 a 121 Ko, au-dela du plafond du banc). */
import { dateFr } from "./format.js";

/* CORRIGE LE 30/09/2026 : la phrase disait « a partir des montants ci-dessus ».
   Relu le 30/09 : sur cinq des six emplacements du site (Aujourd'hui et ses
   deux variantes, les rapports de la commune depuis le 19/09, ceux du
   departement et de la region) et sur le mobile, aucun montant n'est affiche
   au-dessus ; seule la carte « D'un exercice a l'autre » en montrait. La phrase renvoie desormais a la
   source nommee juste apres elle, ce qui est vrai partout. */
export const CALCUL_REPERE = "Calculé par Repère à partir des montants publiés par cette source — ce n'est pas un chiffre publié.";
export function ligneSource({ producteur, licence, maj, mention } = {}) {
  return `${producteur || ""}${licence ? " · " + licence : ""}${maj ? " · mise à jour du " + dateFr(maj) : ""}${mention ? " · " + mention : ""}`;
}

