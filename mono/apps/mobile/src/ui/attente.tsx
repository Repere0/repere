/* L'ILLUSTRATION D'UNE DONNÉE QUI N'EST PAS ENCORE LÀ (retour du porteur, 11/11/2026 : « moins triste »).
 *
 * Avant : des lignes grises en forme de fiche, qui ressemblaient à une donnée vide. Maintenant : une
 * composition abstraite de cercles aux teintes d'échelon très douces, avec une icône au centre. C'est un
 * DÉCOR, pas la forme d'une donnée : aucun nom, aucun chiffre, aucune date, aucune couleur de parti ni de
 * vote. Les teintes sont celles du thème (TEINTES), aucune couleur nouvelle. La phrase vraie et le lien
 * restent dessous (invariant 5 : jamais une forme vide à la place d'une donnée). Décoratif : le lecteur
 * d'écran ne lit que la phrase. Une apparition de 0,5 s, une fois ; aucune boucle. */
import { Animated, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { couleurs, PAS, RAYON, TEINTES, TYPO } from "../lib/theme";
import { useApparition } from "./mouvement";

export function Attente({ icone, etiquette, texte }: { icone: keyof typeof Ionicons.glyphMap; etiquette: string; texte: string }) {
  const v = useApparition();
  const grossit = { transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }], opacity: v };
  return (
    <View style={{ gap: PAS * 3, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte, overflow: "hidden" }}>
      <Text style={TYPO.etiquette}>{etiquette}</Text>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={{ height: 132, alignItems: "center", justifyContent: "center", borderRadius: RAYON.bloc, backgroundColor: couleurs.voile, overflow: "hidden" }}>
        <Animated.View style={[{ position: "absolute", width: 168, height: 168, borderRadius: 84, left: "50%", marginLeft: -122, top: -30, backgroundColor: TEINTES.region }, grossit]} />
        <Animated.View style={[{ position: "absolute", width: 120, height: 120, borderRadius: 60, left: "50%", marginLeft: 20, top: 40, backgroundColor: TEINTES.ville }, grossit]} />
        <Animated.View style={[{ position: "absolute", width: 72, height: 72, borderRadius: 36, left: "50%", marginLeft: -86, top: 74, backgroundColor: TEINTES.dept }, grossit]} />
        <Animated.View style={[{ width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: couleurs.encre, backgroundColor: couleurs.carte }, grossit]}>
          <Ionicons name={icone} size={28} color={couleurs.encre} />
        </Animated.View>
      </View>
      <Text style={TYPO.note}>{texte}</Text>
    </View>
  );
}
