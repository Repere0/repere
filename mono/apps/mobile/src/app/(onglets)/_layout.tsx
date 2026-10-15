/* LA BARRE BASSE A TROIS ONGLETS DU CANEVAS « ACCUEIL » (13/10/2026, « Chez vous » corrige le 15/10/2026).
 *
 * Aujourd'hui  -> chez-vous   (les trois reponses du jour)
 * Chez vous    -> territoire (le territoire de la commune : departement, region,
 *                             intercommunalite, circonscription ; « Qui decide »
 *                             en est une sortie, pas l'onglet)
 * Calendrier   -> a-venir     (le Parlement, semaine et mois)
 *
 * « Qui decide » reste un ecran (route qui-decide), ouvert depuis « Aller plus
 * loin », mais il n'a plus d'onglet : href null le retire de la barre.
 * Les ecrans de detail (argent, vote, fiche, partage, dictionnaire...) restent
 * dans la pile, au-dessus de la barre. */
import { Text, type ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { LIBELLES } from "@repere/core";
import { couleurs } from "../../lib/theme";
import { Retour } from "../../ui/retour";

/* Le libelle d'onglet : il doit tenir dans sa case. A 200 % de texte, « Aujourd'hui »
   etait tronque en « Aujo... » (mesure du 15/10/2026). Le libelle est plafonne a 130 %
   (au-dela, « Aujourd'hui » ne tient plus dans sa case sur un ecran de 320 px)
   et ne passe jamais sur deux lignes : c'est le seul plafond de l'application, et il
   ne touche qu'aux trois noms de la barre basse (decision a confirmer par le porteur). */
const libelle = (texte: string) => ({ color }: { color: ColorValue }) => (
  <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={{ color, fontSize: 13, fontWeight: "700" }}>{texte}</Text>
);

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
        /* minHeight et non height : la barre grandit avec le texte (15/10/2026). */
        tabBarStyle: { backgroundColor: couleurs.carte, borderTopColor: couleurs.trait, minHeight: 72, paddingTop: 6 },
      }}
    >
      <Tabs.Screen
        name="chez-vous"
        options={{
          title: LIBELLES.aujourdhui,
          tabBarLabel: libelle(LIBELLES.aujourdhui),
          tabBarIcon: icone("◷"),
          headerLeft: () => <Retour texte="Communes" etiquette="Revenir à l'accueil pour changer de commune" />,
        }}
      />
      <Tabs.Screen
        name="territoire"
        options={{
          title: "Chez vous",
          tabBarLabel: libelle("Chez vous"),
          tabBarIcon: icone("⌂"),
          headerLeft: () => <Retour texte="Communes" etiquette="Revenir à l'accueil pour changer de commune" />,
        }}
      />
      <Tabs.Screen name="qui-decide" options={{ title: LIBELLES.qui, href: null }} />
      <Tabs.Screen name="a-venir" options={{ title: LIBELLES.calendrier, tabBarLabel: libelle("Calendrier"), tabBarIcon: icone("▦") }} />
    </Tabs>
  );
}
