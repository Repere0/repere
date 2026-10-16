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

export function Marque() {
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="Repère" style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
      <Image source={require("../../assets/icon.png")} accessibilityElementsHidden importantForAccessibility="no"
        style={{ width: 30, height: 30, borderRadius: 7, borderWidth: StyleSheet.hairlineWidth, borderColor: couleurs.trait }} />
      <Text style={{ fontFamily: POLICE.affiche, fontSize: 24, lineHeight: 28, color: couleurs.encre, letterSpacing: -0.4 }}>Repère</Text>
    </View>
  );
}
