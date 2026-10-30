/* « À PROPOS » — 30/10/2026. Ce qu'est Repère, sans compte ni promesse qui ne se tient pas.
 * Le contact n'apparaît que si EXPO_PUBLIC_CONTACT_EMAIL est défini au moment du build
 * (décision D2 du porteur) : aucune adresse n'est écrite dans le code. */
import { Linking, ScrollView, Text } from "react-native";
import { Stack, router } from "expo-router";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Bouton, Carte } from "../lib/composants";
import { Logo } from "../ui/logo";

const CONTACT = process.env.EXPO_PUBLIC_CONTACT_EMAIL;
const CORPS_AVIS = "Ce que j'ai aimé :\n\nCe qui m'a gêné :\n\nUne idée :\n";

export default function APropos() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, gap: PAS * 4 }}>
      <Stack.Screen options={{ title: "À propos" }} />
      <Logo size={96} variant="mono" />
      <Text style={TYPO.question} accessibilityRole="header">Repère</Text>
      <Text style={TYPO.corps}>L'application qui vous raccroche à votre citoyenneté française.</Text>
      <Carte>
        <Text style={TYPO.corps}>Repère montre ce qui se décide et ce qui se dépense dans votre commune, à partir de données publiques.</Text>
        <Text style={TYPO.corps}>Chaque chiffre porte sa source officielle et sa date de mise à jour.</Text>
        <Text style={TYPO.corps}>Aucun compte, aucun traceur. Repère ne prend pas parti : il donne l'information, sans dire quoi en penser.</Text>
      </Carte>
      {CONTACT ? (
        <>
          <Bouton texte="Signaler un bug" onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${encodeURIComponent("Bug Repère")}`)} />
          <Bouton texte="Donner mon avis" onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${encodeURIComponent("Feedback Repère")}&body=${encodeURIComponent(CORPS_AVIS)}`)} />
        </>
      ) : (
        <Text style={TYPO.note}>Contact : bientôt disponible dans la bêta.</Text>
      )}
      <Bouton texte="Politique de confidentialité" onPress={() => router.push("/confidentialite")} />
    </ScrollView>
  );
}
