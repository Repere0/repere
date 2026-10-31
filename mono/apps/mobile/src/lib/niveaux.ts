/* LE NIVEAU D'UNE CARTE, DIT PAR UN TEXTE — 29/10/2026 (D17).
 *
 * Une carte d'echelon (commune, departement, region...) portait son niveau par la
 * seule couleur : la barre ou le point. Ici, le nom du niveau s'ecrit a cote, et
 * le point qui reste sous 3:1 sur la carte (sombre : la Region, 2,37:1) recoit
 * un contour de l'encre. La couleur, elle, reste gelee (invariant 7).
 *
 * Les noms reprennent ceux de packages/core (chaine des echelons) : un test les
 * compare (tests/niveaux.test.mjs). */
import { couleurs, type Echelon } from "./theme";
import { rapportContraste, SEUIL_POINT } from "./palette";

export const NIVEAU_NOM: Record<Echelon, string> = {
  ville: "Commune",
  agglo: "Intercommunalité",
  dept: "Département",
  region: "Région",
  france: "Assemblée nationale",
};

/* Le point d'echelon. Sous le seuil de 3:1 sur la carte, il recoit un contour de
   l'encre : la forme se voit sans changer la couleur. */
export function pointEchelon(echelon: Echelon) {
  const contour = rapportContraste(couleurs[echelon], couleurs.carte) < SEUIL_POINT;
  return { backgroundColor: couleurs[echelon], ...(contour ? { borderWidth: 2, borderColor: couleurs.encre } : null) };
}
