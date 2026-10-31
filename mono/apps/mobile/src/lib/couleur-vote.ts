/* LA COULEUR D'UN VOTE, SELON LE RÉGLAGE (V29 bloc 3, D56). Le réglage « mode daltonien »
 * vit dans repere.profil (ADR 0006). Seuls les écrans de l'application l'utilisent : les
 * cartes de partage gardent leur palette figée (D5). */
import { useProfil } from "./profil";
import { COULEUR_VOTE, COULEUR_VOTE_DALTONIEN } from "./theme";

export function useCouleurVote() {
  const { profil } = useProfil();
  return profil?.modeDaltonien ? COULEUR_VOTE_DALTONIEN : COULEUR_VOTE;
}
