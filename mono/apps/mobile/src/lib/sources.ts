/* Les sources de chaque bloc, dans la forme que la pastille et la feuille
 * attendent. Les methodes et les usages sont ecrits ici, une fois, en francais
 * courant : la feuille les montre sous « Comment Repère l'utilise »
 * (invariant 4 : un calcul se dit calcul). */
import { lienScrutin } from "@repere/core";
import type { InfoSource } from "../ui/source";
import type { Source } from "@repere/core/domaine";

/* Ce dont les pastilles ont besoin, et rien de plus : les sources que
   l'accueil derive (@repere/core, deriverAujourdhui) et la base des liens de
   scrutin. */
type Derive = { srcProjets?: Source | null; srcComptes?: Source | null; srcScrutins?: Source | null; base?: string | null };

export const METHODE_COMPTES = "Repère part des six montants du budget principal de la commune, publiés pour une année, et fait une division. Exemple : la part des salaires, c'est la ligne « frais de personnel » divisée par le total des dépenses. Aucun autre territoire n'entre dans le calcul. Les montants par habitant, eux, sont publiés tels quels par l'Observatoire.";
export const METHODE_FINANCEMENT = "La part de l'État, c'est l'aide de l'État divisée par le coût annoncé du projet. Les deux montants sont publiés par la Direction générale des collectivités locales.";
export const USAGE_PAR_HABITANT = "Les montants par habitant sont publiés tels quels par l'Observatoire des finances locales ; Repère ne les recalcule pas.";

export const srcProjets = (d: Derive, calcul = false): InfoSource | null => d.srcProjets ? {
  producteur: d.srcProjets.producteur, licence: d.srcProjets.licence, maj: d.srcProjets.mis_a_jour_le,
  url: d.srcProjets.url, methode: calcul ? METHODE_FINANCEMENT : undefined,
  usage: "Chaque projet est affiché avec l'année et les montants que la source publie.",
} : null;
export const srcComptes = (d: Derive): InfoSource | null => d.srcComptes ? {
  producteur: d.srcComptes.producteur, licence: d.srcComptes.licence, maj: d.srcComptes.maj,
  url: d.srcComptes.url, methode: METHODE_COMPTES,
} : null;
export const srcComptesPublies = (d: Derive): InfoSource | null => d.srcComptes ? {
  producteur: d.srcComptes.producteur, licence: d.srcComptes.licence, maj: d.srcComptes.maj,
  url: d.srcComptes.url, usage: USAGE_PAR_HABITANT,
} : null;
export const srcScrutins = (d: Derive): InfoSource | null => d.srcScrutins ? {
  producteur: d.srcScrutins.producteur, licence: d.srcScrutins.licence, url: d.srcScrutins.url, releve: d.srcScrutins.releve_le,
  usage: "Repère affiche la position du député et le décompte tels que l'Assemblée les publie pour ce vote.",
} : null;
/* Le vote precis : la donnee originale est la page du scrutin. */
export const srcVote = (d: Derive, sc: { n: string }): InfoSource | null => {
  const base = srcScrutins(d);
  if (!base) return null;
  const l = d.base ? lienScrutin(d.base, sc) : null;
  return l ? { ...base, url: l.url, lienTexte: l.texte } : base;
};
export const srcElus = (s: Source | null | undefined): InfoSource | null => s ? {
  producteur: s.producteur, licence: s.licence, maj: s.maj, url: s.url,
  usage: "Les noms et les fonctions sont écrits comme le Répertoire national des élus les publie.",
} : null;
/* Un rendez-vous d'agenda sans source porte `{}` (@repere/core, aujourdhui.js) :
   sans producteur, pas de pastille — une « ⓘ Source » vide dirait qu'il y en a
   une (invariant 4). Trouve par le typage du 01/10/2026. */
export const srcAgenda = (x: unknown): InfoSource | null => {
  const s = x as (Source & { producteur_affiche?: string }) | null | undefined;
  return s && (s.producteur_affiche || s.producteur) ? {
  producteur: s.producteur_affiche || s.producteur, licence: s.licence, url: s.url, releve: s.releve_le,
  usage: "Repère recopie l'agenda publié ; il est relevé chaque jour et peut changer après.",
  } : null;
};
