/* UN TOUCHER QUI REPOND — 16/10/2026.
 *
 * Un seul retour haptique dans Repere : le leger « selection » du systeme, quand on
 * ouvre ou ferme une explication, ou qu'on change d'onglet. Il dit « c'est pris en
 * compte », rien de plus.
 *
 * INVARIANT 6 : jamais sur un vote, une position ou un partage (aucun gain, aucun
 * « succes »). La garde est dans tests/refonte-ux.test.mjs : seuls ui/visuels.tsx
 * (les replis) et (onglets)/_layout.tsx peuvent importer ce fichier.
 *
 * Rien sur le web (pas de moteur de vibration) ; une erreur du telephone est ignoree :
 * le retour est un plus, jamais une condition. */
import * as Haptics from "expo-haptics";

export function toucherLeger(): void {
  if (process.env.EXPO_OS === "web") return;
  Haptics.selectionAsync().catch(() => {});
}
