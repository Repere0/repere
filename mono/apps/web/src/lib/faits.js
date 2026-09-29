/* L'ASSEMBLAGE DES FAITS VIT DANS @repere/core DEPUIS LE 29/09/2026 (voir
 * packages/core/src/faits.js) : le web et l'application mobile doivent lire le
 * meme fait le plus recent, jamais deux calculs qui divergent. Re-export pour
 * que les ecrans web gardent leurs imports. */
export { calculerFaits, ancienneCommune, noteRattachement } from "@repere/core";
