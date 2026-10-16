/* LA MARQUE DANS L'APPLICATION — 16/10/2026.
 *
 * Le logo (une mairie noire et un tapis bleu-blanc-rouge, outils/marque_repere.py)
 * porte la seule exception de l'invariant 7 : le tricolore est reserve au logo et a
 * ses declinaisons de marque. Ce composant est le SEUL endroit de l'application qui
 * affiche l'icone : la garde de mono/tests/invariants.test.mjs refuse toute autre
 * utilisation des images de marque, pour que le tricolore ne devienne jamais un
 * decor ni le support d'une information. */
import { Image, StyleSheet, Text, View } from "react-native";
import { couleurs, PAS, POLICE } from "../lib/theme";

/* grande : l'ecran d'accueil (premiere impression) ; sinon la ligne compacte des ecrans. */
export function Marque({ grande }: { grande?: boolean }) {
  const cote = grande ? 56 : 30;
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="Repère" style={{ flexDirection: "row", alignItems: "center", gap: grande ? PAS * 3 : PAS * 2 }}>
      <Image source={require("../../assets/icon.png")} accessibilityElementsHidden importantForAccessibility="no"
        style={{ width: cote, height: cote, borderRadius: Math.round(cote * 0.23), borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(0,0,0,0.1)" }} />
      <Text style={{ fontFamily: POLICE.affiche, fontSize: grande ? 34 : 24, lineHeight: grande ? 38 : 28, color: couleurs.encre, letterSpacing: grande ? -0.8 : -0.4 }}>Repère</Text>
    </View>
  );
}
