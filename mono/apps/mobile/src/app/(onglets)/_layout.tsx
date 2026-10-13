/* LA BARRE BASSE A TROIS ONGLETS DU CANEVAS « ACCUEIL » (13/10/2026).
 *
 * Aujourd'hui  -> chez-vous   (les trois reponses du jour)
 * Chez vous    -> qui-decide  (la chaine de decision de la commune)
 * Calendrier   -> a-venir     (le Parlement, semaine et mois)
 *
 * Le canevas dessine « Aujourd'hui » et « Calendrier » ; « Chez vous » n'a pas
 * d'ecran dessine : il ouvre « Qui decide », a confirmer par le porteur.
 * Les ecrans de detail (argent, vote, fiche, partage, dictionnaire...) restent
 * dans la pile, au-dessus de la barre. */
import { Text, type ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { LIBELLES } from "@repere/core";
import { couleurs } from "../../lib/theme";
import { Retour } from "../../ui/retour";

/* Une icone sobre par onglet : un caractere, sans bibliotheque d'icones de plus. */
const icone = (glyphe: string) => ({ color }: { color: ColorValue }) => (
  <Text accessibilityElementsHidden importantForAccessibility="no" style={{ color, fontSize: 20, lineHeight: 24 }}>{glyphe}</Text>
);

export default function Onglets() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: couleurs.sol },
        headerTintColor: couleurs.encre,
        headerShadowVisible: false,
        tabBarActiveTintColor: couleurs.encre,
        tabBarInactiveTintColor: couleurs.sourd,
        tabBarStyle: { backgroundColor: couleurs.carte, borderTopColor: couleurs.trait, height: 72, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 13, fontWeight: "700" },
      }}
    >
      <Tabs.Screen
        name="chez-vous"
        options={{
          title: LIBELLES.aujourdhui,
          tabBarLabel: LIBELLES.aujourdhui,
          tabBarIcon: icone("◷"),
          headerLeft: () => <Retour texte="Communes" etiquette="Revenir à l'accueil pour changer de commune" />,
        }}
      />
      <Tabs.Screen name="qui-decide" options={{ title: LIBELLES.qui, tabBarLabel: "Qui décide", tabBarIcon: icone("⌂") }} />
      <Tabs.Screen name="a-venir" options={{ title: LIBELLES.calendrier, tabBarLabel: "Calendrier", tabBarIcon: icone("▦") }} />
    </Tabs>
  );
}
