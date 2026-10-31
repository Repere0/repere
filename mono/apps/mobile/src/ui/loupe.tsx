/* La loupe du champ de recherche, dessinee avec deux vues : pas de bibliotheque d'icones.
 * Decorative : le champ porte son propre libelle. */
import { View } from "react-native";

export function Loupe({ couleur }: { couleur: string }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: 18, height: 18 }}>
      <View style={{ position: "absolute", top: 0, left: 0, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: couleur }} />
      <View style={{ position: "absolute", right: 0, bottom: 1, width: 7, height: 2, borderRadius: 1, backgroundColor: couleur, transform: [{ rotate: "45deg" }] }} />
    </View>
  );
}
