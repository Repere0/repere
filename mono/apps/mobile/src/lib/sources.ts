/* Les sources de chaque bloc, dans la forme que la pastille et la feuille
 * attendent. Les methodes et les usages sont ecrits ici, une fois, en francais
 * courant : la feuille les montre sous « Comment Repère l'utilise »
 * (invariant 4 : un calcul se dit calcul). */
import { lienScrutin } from "@repere/core";
import type { InfoSource } from "../ui/source";
import type { Ouvert } from "./useCommune";

export const METHODE_COMPTES = "Repère part des six montants du budget principal de la commune, publiés pour une année, et fait une division. Exemple : la part des salaires, c'est la ligne « frais de personnel » divisée par le total des dépenses. Aucun autre territoire n'entre dans le calcul. Les montants par habitant, eux, sont publiés tels quels par l'Observatoire.";
export const METHODE_FINANCEMENT = "La part de l'État, c'est l'aide de l'État divisée par le coût annoncé du projet. Les deux montants sont publiés par la Direction générale des collectivités locales.";
export const USAGE_PAR_HABITANT = "Les montants par habitant sont publiés tels quels par l'Observatoire des finances locales ; Repère ne les recalcule pas.";

export const srcProjets = (d: Ouvert, calcul = false): InfoSource | null => d.srcProjets ? {
  producteur: d.srcProjets.producteur, licence: d.srcProjets.licence, maj: d.srcProjets.mis_a_jour_le,
  url: d.srcProjets.url, methode: calcul ? METHODE_FINANCEMENT : undefined,
  usage: "Chaque projet est affiché avec l'année et les montants que la source publie.",
} : null;
export const srcComptes = (d: Ouvert): InfoSource | null => d.srcComptes ? {
  producteur: d.srcComptes.producteur, licence: d.srcComptes.licence, maj: d.srcComptes.maj,
  url: d.srcComptes.url, methode: METHODE_COMPTES,
} : null;
export const srcComptesPublies = (d: Ouvert): InfoSource | null => d.srcComptes ? {
  producteur: d.srcComptes.producteur, licence: d.srcComptes.licence, maj: d.srcComptes.maj,
  url: d.srcComptes.url, usage: USAGE_PAR_HABITANT,
} : null;
export const srcScrutins = (d: Ouvert): InfoSource | null => d.srcScrutins ? {
  producteur: d.srcScrutins.producteur, licence: d.srcScrutins.licence, url: d.srcScrutins.url, releve: d.srcScrutins.releve_le,
  usage: "Repère affiche la position du député et le décompte tels que l'Assemblée les publie pour ce vote.",
} : null;
/* Le vote precis : la donnee originale est la page du scrutin. */
export const srcVote = (d: Ouvert, sc: { n: string }): InfoSource | null => {
  const base = srcScrutins(d);
  if (!base) return null;
  const l = d.base ? lienScrutin(d.base, sc) : null;
  return l ? { ...base, url: l.url, lienTexte: l.texte } : base;
};
export const srcElus = (s: Ouvert): InfoSource | null => s ? {
  producteur: s.producteur, licence: s.licence, maj: s.maj, url: s.url,
  usage: "Les noms et les fonctions sont écrits comme le Répertoire national des élus les publie.",
} : null;
export const srcAgenda = (s: Ouvert): InfoSource | null => s ? {
  producteur: s.producteur_affiche || s.producteur, licence: s.licence, url: s.url, releve: s.releve_le,
  usage: "Repère recopie l'agenda publié ; il est relevé chaque jour et peut changer après.",
} : null;
