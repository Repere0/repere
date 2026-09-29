/* Les cinq couleurs d'echelon viennent de @repere/data-utils (invariant 7),
 * jamais recopiees ici. Les neutres reprennent packages/ui/src/tokens.css :
 * tous restent sous l'amplitude de 24 sur les canaux RGB. */
import { ECHELONS } from "@repere/data-utils";

export const couleurs = {
  ...ECHELONS,
  sol: "#f2efe9",
  carte: "#ffffff",
  encre: "#1a1917",
  sourd: "#6b675f",
  trait: "#ddd8ce",
  voile: "#ece8e0",
} as const;

/* 44 points : cible tactile minimale d'Apple, au-dessus des 48 dp d'Android
   une fois la marge interne comptee. Un controle du banc web a deja trouve
   une cible a 33 px : on ne la refait pas ici. */
export const CIBLE = 48;
export const PAS = 4;
