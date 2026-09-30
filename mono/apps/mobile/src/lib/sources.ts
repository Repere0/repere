/* Les sources de chaque bloc, dans la forme que la pastille et la feuille
 * attendent. Les methodes de calcul sont ecrites ici, une fois : la feuille
 * les montre quand un chiffre est un calcul de Repere (invariant 4). */
import type { InfoSource } from "../ui/source";
import type { Ouvert } from "./useCommune";

export const METHODE_COMPTES = "Rapports calculés à partir des six montants du budget principal publiés par l'Observatoire des finances locales, pour cette commune et cet exercice seulement. Exemple : la part des salaires est la ligne « frais de personnel » divisée par les « dépenses totales ».";
export const METHODE_FINANCEMENT = "La part de l'État est la subvention divisée par le coût annoncé du projet, deux montants publiés par la Direction générale des collectivités locales.";

export const srcProjets = (d: Ouvert, calcul = false): InfoSource | null => d.srcProjets ? {
  producteur: d.srcProjets.producteur, licence: d.srcProjets.licence, maj: d.srcProjets.mis_a_jour_le,
  url: d.srcProjets.url, methode: calcul ? METHODE_FINANCEMENT : undefined,
} : null;
export const srcComptes = (d: Ouvert): InfoSource | null => d.srcComptes ? {
  producteur: d.srcComptes.producteur, licence: d.srcComptes.licence, maj: d.srcComptes.maj,
  url: d.srcComptes.url, methode: METHODE_COMPTES,
} : null;
export const srcScrutins = (d: Ouvert): InfoSource | null => d.srcScrutins ? {
  producteur: d.srcScrutins.producteur, licence: d.srcScrutins.licence, url: d.srcScrutins.url, releve: d.srcScrutins.releve_le,
} : null;
export const srcElus = (s: Ouvert): InfoSource | null => s ? { producteur: s.producteur, licence: s.licence, maj: s.maj, url: s.url } : null;
export const srcAgenda = (s: Ouvert): InfoSource | null => s ? {
  producteur: s.producteur_affiche || s.producteur, licence: s.licence, url: s.url, releve: s.releve_le,
} : null;
