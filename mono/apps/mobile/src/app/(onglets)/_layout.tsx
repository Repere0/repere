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
import { PixelRatio, Text, type ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { LIBELLES } from "@repere/core";
import { couleurs } from "../../lib/theme";
import { Retour } from "../../ui/retour";

/* Au-dela de ce facteur d'agrandissement du texte du telephone, le libelle d'onglet
   est masque : l'onglet ne montre que son icone. Le nom reste lu par les lecteurs
   d'ecran (tabBarAccessibilityLabel). Decision du porteur (15/10/2026) : pas de
   plafond sur le texte lui-meme, seulement le libelle de la barre. Seuil a verifier
   sur appareil (non verifie sur navigateur : PixelRatio y vaut 1). */
const SEUIL_LIBELLE_MASQUE = 1.5;

const libelle = (texte: string) => ({ color }: { color: ColorValue }) => (
  <Text style={{ color, fontSize: 13, fontWeight: "700", textAlign: "center" }}>{texte}</Text>
);

/* Nom d'onglet : libelle visible, ou masque a grande taille. Le nom accessible est toujours fixe. */
const nomOnglet = (texte: string) =>
  PixelRatio.getFontScale() >= SEUIL_LIBELLE_MASQUE
    ? { tabBarLabel: () => null, tabBarAccessibilityLabel: texte }
    : { tabBarLabel: libelle(texte), tabBarAccessibilityLabel: texte };

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
          ...nomOnglet(LIBELLES.aujourdhui),
          tabBarIcon: icone("◷"),
          headerLeft: () => <Retour texte="Communes" etiquette="Revenir à l'accueil pour changer de commune" />,
        }}
      />
      <Tabs.Screen name="qui-decide" options={{ title: LIBELLES.qui, ...nomOnglet("Chez vous"), tabBarIcon: icone("⌂") }} />
      <Tabs.Screen name="a-venir" options={{ title: LIBELLES.calendrier, ...nomOnglet("Calendrier"), tabBarIcon: icone("▦") }} />
    </Tabs>
  );
}
