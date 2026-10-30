/* « À PROPOS » — 30/10/2026. Ce qu'est Repère, sans compte ni promesse qui ne se tient
 * pas. Le contact n'est pas affiché : son adresse est une décision du porteur (BLOCAGES.md). */
import { ScrollView, Text } from "react-native";
import { Stack, router } from "expo-router";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Bouton, Carte } from "../lib/composants";

export default function APropos() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, gap: PAS * 4 }}>
      <Stack.Screen options={{ title: "À propos" }} />
      <Text style={TYPO.question} accessibilityRole="header">Repère</Text>
      <Text style={TYPO.corps}>L'application qui vous raccroche à votre citoyenneté française.</Text>
      <Carte>
        <Text style={TYPO.corps}>Repère montre ce qui se décide et ce qui se dépense dans votre commune, à partir de données publiques.</Text>
        <Text style={TYPO.corps}>Chaque chiffre porte sa source officielle et sa date de mise à jour.</Text>
        <Text style={TYPO.corps}>Aucun compte, aucun traceur. Repère ne prend pas parti : il donne l'information, sans dire quoi en penser.</Text>
      </Carte>
      <Bouton texte="Politique de confidentialité" onPress={() => router.push("/confidentialite")} />
    </ScrollView>
  );
}
