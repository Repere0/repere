import React from "react";
import { Mot } from "@repere/ui";
import { rapports as rapportsTexte } from "@repere/core";

/* LA LECTURE DES COMPTES VIT DANS @repere/core DEPUIS LE 29/09/2026 (voir
 * packages/core/src/comptes.js) : valeur, population, pourCent, rapports,
 * dernierExercice, evolution. L'application mobile traduit les memes comptes
 * avec les memes phrases. Ce fichier n'ajoute qu'une chose, propre au web : le
 * mot du dictionnaire contenu dans un libelle devient un bouton de definition.
 * Le rendu est identique a celui d'avant le deplacement. */
export { valeur, population, pourCent, dernierExercice, SEUIL_PERIMETRE, evolution } from "@repere/core";

export function rapports(ex) {
  return rapportsTexte(ex).map(o => {
    if (!o.mot || !o.l.includes(o.mot)) return o;
    const [avant, apres] = o.l.split(o.mot);
    return { ...o, l: <>{avant}<Mot cle={o.mot}>{o.mot}</Mot>{apres}</> };
  });
}
