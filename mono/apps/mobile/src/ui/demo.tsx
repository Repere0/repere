/* Bandeau « Version démo » et bouton « Laisser un avis » (17/11/2026). Logique pure : lib/avis.ts. */
import { Linking, Platform, Pressable, Text, View } from "react-native";
import Constants from "expo-constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";
import { COURRIEL_AVIS, lienAvis, MODE_DEMO } from "../lib/avis";
import { enfonce } from "./mouvement";

export function ouvrirAvis() {
  if (!COURRIEL_AVIS) return;
  const navigateur = Platform.OS === "web" && typeof navigator !== "undefined" ? navigator.userAgent : null;
  Linking.openURL(lienAvis(COURRIEL_AVIS, {
    version: Constants.expoConfig?.version || "inconnue", date: new Date(),
    plateforme: `${Platform.OS} ${String(Platform.Version ?? "")}`.trim(), navigateur,
  })).catch(() => {});
}

export function BoutonAvis({ style }: { style?: object }) {
  if (!COURRIEL_AVIS) return null;
  return (
    <Pressable onPress={ouvrirAvis} accessibilityRole="link" testID="laisser-un-avis"
      accessibilityLabel="Laisser un avis. Ouvre votre messagerie avec un message pré-rempli."
      style={({ pressed }) => [{ minHeight: CIBLE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: PAS * 2 }, style, pressed && enfonce(true)]}>
      <Ionicons name="chatbubble-ellipses-outline" size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
      <Text style={[TYPO.note, { color: couleurs.encre, fontWeight: "600" }]}>Laisser un avis</Text>
    </Pressable>
  );
}

/* Discret : une ligne en haut de l'application, seulement en mode démo. */
export function BandeauDemo() {
  if (!MODE_DEMO) return null;
  return (
    <View testID="bandeau-demo" accessibilityRole="summary"
      style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", columnGap: PAS * 3, paddingHorizontal: PAS * 4, backgroundColor: couleurs.carte, borderBottomWidth: 1, borderBottomColor: couleurs.trait }}>
      <Text style={[TYPO.note, { color: couleurs.encre }]}>Version démo · vos retours sont précieux</Text>
      <BoutonAvis />
    </View>
  );
}
