/* @repere/core — la verite de Repere, sans interface (29/09/2026).
 *
 * Ce paquet ne depend de RIEN : ni React, ni DOM, ni reseau, ni stockage. Il
 * recoit des donnees deja chargees et rend des valeurs. C'est ce qui permet au
 * site et a l'application mobile de dire exactement la meme chose : une regle
 * n'existe qu'ici, et chaque interface l'habille a sa maniere.
 *
 *   format.js     dates et montants ecrits comme on les dit
 *   votes.js      lecture d'un scrutin, garde d'appariement des positions
 *   faits.js      assemblage et ordre des faits dates d'une commune
 *   comptes.js    lecture des comptes, rapports en texte, evolution
 *   aujourdhui.js derivation de l'ecran « Aujourd'hui »
 *   recherche.js  la regle de recherche d'une commune ou d'un departement
 *
 * Les chargeurs (reseau, cache) vivent dans @repere/data-utils, qui ne depend
 * pas non plus du DOM et sert aussi a l'application mobile. */
export * from "./format.js";
export * from "./votes.js";
export * from "./faits.js";
export * from "./comptes.js";
export * from "./aujourdhui.js";
export * from "./recherche.js";
export * from "./territoire.js";
export * from "./changements.js";
export * from "./phrases.js";
export * from "./phrases-comptes.js";
export * from "./source.js";
export * from "./visuels.js";
