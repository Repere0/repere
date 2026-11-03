/* LA BARRE BASSE A TROIS ONGLETS DU CANEVAS « ACCUEIL » (13/10/2026).
 *
 * Aujourd'hui  -> chez-vous   (les trois reponses du jour)
 * Chez vous    -> qui-decide  (la chaine de decision de la commune)
 * Calendrier   -> a-venir     (le Parlement, semaine et mois)
 * Élus         -> elus        (annuaire des élus publiés, recherche)
 *
 * Le canevas dessine « Aujourd'hui » et « Calendrier » ; « Chez vous » n'a pas
 * d'ecran dessine : il ouvre « Qui decide », a confirmer par le porteur.
 * Les ecrans de detail (argent, vote, fiche, partage, dictionnaire...) restent
 * dans la pile, au-dessus de la barre. */
import { Platform, Text, type ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { LIBELLES } from "@repere/core";
import { couleurs } from "../../lib/theme";
import { useTheme } from "../../lib/themeChoix";
import { ChangerCommune } from "../../ui/retour";
import { BoutonReglages } from "../../ui/reglages";

/* Une icone par onglet (@expo/vector-icons, Ionicons, brief V47 bloc 1) : pleine quand l'onglet
 * est actif, contour sinon. L'icone est decorative : le nom de l'onglet la porte. Ionicons n'a pas
 * « landmark » ni « users » en contour : « business » (un batiment) et « calendar » font l'affaire. */
type NomIcone = "newspaper" | "business" | "calendar" | "person-circle";
const icone = (nom: NomIcone) => ({ color, focused }: { color: ColorValue; focused: boolean }) => (
  <Ionicons name={focused ? nom : (`${nom}-outline` as const)} size={24} color={typeof color === "string" ? color : undefined} allowFontScaling={false} accessible={false} importantForAccessibility="no" />
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
    style={{ color, fontSize: 13, fontWeight: "500", textAlign: "center" }}>{texte}</Text>
);

export default function Onglets() {
  /* V35 : s'abonner au thème fait relire les couleurs de l'en-tête à chaque changement de mode
     (sans cela, passer de sombre à clair laissait l'en-tête sombre jusqu'au rechargement). */
  useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: couleurs.sol },
        headerTintColor: couleurs.encre,
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: couleurs.sol },
        animation: "fade", /* changement d'onglet : fondu court, sans glissement */
        tabBarActiveTintColor: couleurs.encre,
        tabBarInactiveTintColor: couleurs.sourd,
        tabBarStyle: { backgroundColor: couleurs.carte, borderTopColor: couleurs.trait, minHeight: 72, paddingTop: 6 },
        headerLeft: () => <ChangerCommune />,
        headerRight: () => <BoutonReglages />,
      }}
    >
      <Tabs.Screen
        name="chez-vous"
        options={{
          title: LIBELLES.aujourdhui,
          tabBarLabel: etiquette(LIBELLES.aujourdhui),
          tabBarIcon: icone("newspaper"),
        }}
      />
      <Tabs.Screen name="qui-decide" options={{ title: LIBELLES.qui, tabBarLabel: etiquette(LIBELLES.qui), tabBarIcon: icone("business") }} />
      <Tabs.Screen name="a-venir" options={{ title: LIBELLES.calendrier, tabBarLabel: etiquette(LIBELLES.calendrier), tabBarIcon: icone("calendar") }} />
      <Tabs.Screen name="elus" options={{ title: "Élus", tabBarLabel: etiquette("Élus"), tabBarIcon: icone("person-circle") }} />
    </Tabs>
  );
}
