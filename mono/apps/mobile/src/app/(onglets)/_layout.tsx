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
import { Platform, Text, type ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { LIBELLES } from "@repere/core";
import { couleurs } from "../../lib/theme";
import { ChangerCommune } from "../../ui/retour";

/* Une icone sobre par onglet : un caractere, sans bibliotheque d'icones de plus.
 * Le glyphe est decoratif : il ne suit pas l'agrandissement du texte. */
const icone = (glyphe: string) => ({ color }: { color: ColorValue }) => (
  <Text accessibilityElementsHidden importantForAccessibility="no" allowFontScaling={false} style={{ color, fontSize: 20, lineHeight: 24 }}>{glyphe}</Text>
);

/* L'intitule de l'onglet, sur deux lignes au plus (D22, 200 %). Le libelle par
 * defaut d'expo-router le tronque sur une ligne. Sur iOS, expo-router fixe deja la
 * taille des libelles d'onglets (allowFontScaling false, convention Apple : la
 * barre basse ne grossit pas, le « Large Content Viewer » la remplace) : on la
 * garde telle quelle. Sur Android, le libelle suit la taille choisie par le
 * lecteur, sans plafond, et la barre n'a plus de hauteur figee (voir tabBarStyle). */
/* ARBITRAGE (D22, 29/10/2026) : sur Android, le libelle d'onglet ne grossit pas au-dela
 * de 1,2 fois sa taille. A 13 px, « Aujourd'hui » mesure 75 px ; une colonne d'onglet
 * d'un ecran de 360 px en laisse environ 96 px utiles. A 1,2 : 90 px. Au-dela, le mot
 * ne tient plus et Android le coupe. Le reste de l'ecran suit la taille choisie,
 * sans plafond. Mesure navigateur, pas appareil : a valider sur Android. Pour
 * lever ce plafond, changer cette seule constante (et sa garde dans onglets.test.mjs). */
export const TAILLE_MAX_LIBELLE_ONGLET = 1.2;

const etiquette = (texte: string) => ({ color }: { color: ColorValue }) => (
  <Text numberOfLines={2} allowFontScaling={Platform.OS !== "ios"} maxFontSizeMultiplier={TAILLE_MAX_LIBELLE_ONGLET}
    style={{ color, fontSize: 13, fontWeight: "700", textAlign: "center" }}>{texte}</Text>
);

export default function Onglets() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: couleurs.sol },
        headerTintColor: couleurs.encre,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: couleurs.sol },
        tabBarActiveTintColor: couleurs.encre,
        tabBarInactiveTintColor: couleurs.sourd,
        tabBarStyle: { backgroundColor: couleurs.carte, borderTopColor: couleurs.trait, minHeight: 72, paddingTop: 6 },
        headerLeft: () => <ChangerCommune />,
      }}
    >
      <Tabs.Screen
        name="chez-vous"
        options={{
          title: LIBELLES.aujourdhui,
          tabBarLabel: etiquette(LIBELLES.aujourdhui),
          tabBarIcon: icone("◷"),
        }}
      />
      <Tabs.Screen name="qui-decide" options={{ title: LIBELLES.qui, tabBarLabel: etiquette(LIBELLES.qui), tabBarIcon: icone("⌂") }} />
      <Tabs.Screen name="a-venir" options={{ title: LIBELLES.calendrier, tabBarLabel: etiquette(LIBELLES.calendrier), tabBarIcon: icone("▦") }} />
    </Tabs>
  );
}
