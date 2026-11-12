/* UNE LIGNE « ICÔNE + TITRE COURT » (retour du porteur, 11/11/2026 : moins de texte, plus d'icônes).
 * Le titre dit l'essentiel en une ligne ; le texte complet, lui, n'est jamais supprimé : il reste à un geste,
 * dans « Le texte complet » (Depli). Réservé aux textes écrits dans l'application : les phrases de
 * @repere/core, les mises en garde et les mentions de source gardent leurs mots. */
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { couleurs, PAS, TYPO } from "../lib/theme";

export function LigneIcone({ icone, titre }: { icone: keyof typeof Ionicons.glyphMap; titre: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }} accessible accessibilityLabel={titre}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: couleurs.voile, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icone} size={20} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
      </View>
      <Text style={[TYPO.reponse, { flex: 1 }]}>{titre}</Text>
    </View>
  );
}
