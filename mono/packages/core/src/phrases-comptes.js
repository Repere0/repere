/* @repere/core — LES PHRASES DES COMPTES (30/09/2026, lot M1).
 * Fichier a part pour ne charger ces phrases qu'avec les ecrans qui en ont
 * besoin (voir source.js). */
import { population } from "./comptes.js";

/*
 * Deplacees depuis apps/web/src/routes/OuVaArgent.jsx le 30/09/2026 pour que
 * l'application mobile tienne la promesse de son accueil (« ou va votre
 * argent ») avec les MEMES phrases que le site. Le calcul (rapports,
 * dernierExercice) vivait deja dans comptes.js. */

export const OFGL_URL = "https://data.ofgl.fr/";

/* « Ce que ça représente · exercice 2025 · 13 409 habitants » */
export function sousTitreRapports(an, ex) {
  const pop = population(ex);
  return `Ce que ça représente · exercice ${an}${pop ? ` · ${pop.toLocaleString("fr-FR")} habitants` : ""}`;
}

/* `detailPlusBas` : le site affiche les six montants bruts sous les rapports,
   l'application pas encore — la phrase ne promet pas ce que l'ecran ne montre pas. */
export function introRapports({ detailPlusBas } = {}) {
  return "Aucun de ces rapports n'est publié : Repère les calcule à partir de six montants"
    + " publiés par l'Observatoire des finances locales"
    + (detailPlusBas ? ", visibles plus bas sur cette page," : ",")
    + " et explique sous chacun ce qu'il ne veut pas dire.";
}

/* Trois absences, trois phrases (invariant 5). */
export const comptesAbsents = nom => ({
  titre: `${nom} : ses comptes ne figurent pas dans le fichier officiel.`,
  corps: "Un montant absent n'est pas un montant nul : Repère n'affiche rien plutôt qu'un zéro qui pourrait être faux. Les très petites communes et celles qui viennent de fusionner manquent souvent à ce fichier.",
  lien: { texte: "Chercher cette commune dans les comptes publics", url: OFGL_URL },
});
export const comptesInsuffisants = an => ({
  titre: "Pas assez de montants pour traduire ces comptes.",
  corps: `Les rapports se calculent à partir de plusieurs lignes à la fois ; pour l'exercice ${an}, le fichier officiel n'en porte pas assez.`,
});
/* Exercices publies mais ecartes (montants incoherents avec la population,
   voir extract-html.js) posterieurs au dernier exercice affiche. */
export function exercicesEcartes(c, exercice) {
  return (c && Array.isArray(c.comptes_ecartes) ? c.comptes_ecartes : [])
    .filter(an => !exercice || an > exercice.an).sort();
}
export function phraseEcartes(ecartes, nom) {
  if (!ecartes.length) return null;
  return `Le fichier officiel porte des comptes pour ${ecartes.length > 1 ? "les exercices " + ecartes.join(" et ") : "l'exercice " + ecartes[0]}, mais leurs montants ne correspondent pas à la population publiée sur la même ligne. Repère ne les affiche pas plutôt que de risquer d'attribuer à ${nom || "cette commune"} des chiffres qui ne sont pas les siens.`;
}
export const comptesIncoherents = (nom, phrase) => ({
  titre: `${nom} : ses comptes publiés ne sont pas cohérents.`,
  corps: phrase,
  lien: { texte: "Vérifier dans les comptes publics", url: OFGL_URL },
});

/* --- d'un exercice a l'autre (deplace de OuVaArgent.jsx, Evolution) --------- */
const eurosRonds = n => Math.round(n).toLocaleString("fr-FR") + " €";
export const eurosArrondis = eurosRonds;
export const INTRO_EVOLUTION = "Les deux montants sont publiés par l'Observatoire des finances locales ; la différence est une soustraction faite par Repère.";
export const NOTE_EVOLUTION = "Une différence d'une année sur l'autre ne dit pas si la commune est bien ou mal gérée : un chantier qui commence ou s'achève, un emprunt, une compétence transférée à l'intercommunalité suffisent à la faire varier.";
export function diffEuros(diff) {
  if (diff === null || diff === undefined) return "—";
  return diff === 0 ? "inchangé" : (diff > 0 ? "+ " : "− ") + eurosRonds(Math.abs(diff));
}
export const perimetreChange = (e, nom) => ({
  titre: `D'un exercice à l'autre : ${nom} n'est pas comparable à elle-même.`,
  corps: `La population publiée passe de ${e.p1.toLocaleString("fr-FR")} habitants (exercice ${e.an1}) à ${e.p2.toLocaleString("fr-FR")} (exercice ${e.an2}). Un écart de cette taille signale un changement de territoire, par exemple une fusion de communes : comparer les deux années mesurerait ce changement, pas l'évolution des comptes. Repère ne fait donc pas la différence.`,
});
