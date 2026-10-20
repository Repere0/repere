/* LA BARRE BASSE (13/10/2026, « Chez vous » corrige le 15/10/2026,
 * quatrieme onglet le 20/10/2026).
 *
 * Aujourd'hui  -> chez-vous   (les trois reponses du jour)
 * Chez vous    -> territoire (le territoire de la commune : departement, region,
 *                             intercommunalite, circonscription ; « Qui decide »
 *                             en est une sortie, pas l'onglet)
 * Calendrier   -> a-venir     (le Parlement, semaine et mois)
 *
 * Qui decide   -> qui-decide (la chaine commune -> Assemblee). Il reste ouvert
 *                             aussi depuis « Aller plus loin » et depuis le bloc
 *                             de « Aujourd'hui » : trois chemins, un seul ecran.
 * Les ecrans de detail (argent, vote, fiche, partage, dictionnaire...) restent
 * dans la pile, au-dessus de la barre. */
import { PixelRatio, Text, type ColorValue } from "react-native";
import { Tabs } from "expo-router";
import { toucherLeger } from "../../ui/toucher";
import { LIBELLES } from "@repere/core";
import { couleurs } from "../../lib/theme";
import { Retour } from "../../ui/retour";
import { IconeCalendrier, IconeHorloge, IconeMaison, IconePersonne } from "../../ui/icones";

/* Au-dela de ce facteur d'agrandissement du texte du telephone, le libelle d'onglet
   est masque : l'onglet ne montre que son icone. Le nom reste lu par les lecteurs
   d'ecran (tabBarAccessibilityLabel). Decision du porteur (15/10/2026) : pas de
   plafond sur le texte lui-meme, seulement le libelle de la barre. Seuil a verifier
   sur appareil (non verifie sur navigateur : PixelRatio y vaut 1). */
const SEUIL_LIBELLE_MASQUE = 1.5;

/* L'onglet actif se distingue aussi par la graisse, pas par la seule couleur (16/10/2026). */
const libelle = (texte: string) => ({ color, focused }: { color: ColorValue; focused: boolean }) => (
  <Text style={{ color, fontSize: 13, fontWeight: focused ? "800" : "600", textAlign: "center" }}>{texte}</Text>
);

/* Nom d'onglet : libelle visible, ou masque a grande taille. Le nom accessible est toujours fixe. */
const nomOnglet = (texte: string) =>
  PixelRatio.getFontScale() >= SEUIL_LIBELLE_MASQUE
    ? { tabBarLabel: () => null, tabBarAccessibilityLabel: texte }
    : { tabBarLabel: libelle(texte), tabBarAccessibilityLabel: texte };

/* Une icone dessinee par onglet (ui/icones.tsx, 16/10/2026) : les caracteres
   « ◷ ⌂ ▦ » dependaient de la police du telephone. Sans bibliotheque de plus. */
const icone = (Icone: (p: { couleur: string }) => React.JSX.Element) => ({ color }: { color: ColorValue }) => (
  <Icone couleur={String(color)} />
);

export default function Onglets() {
  return (
    <Tabs
      /* Un leger retour haptique au changement d'onglet (16/10/2026, ui/toucher.ts). */
      screenListeners={{ tabPress: () => toucherLeger() }}
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
          tabBarIcon: icone(IconeHorloge),
          headerLeft: () => <Retour texte="Communes" etiquette="Revenir à l'accueil pour changer de commune" />,
        }}
      />
      <Tabs.Screen
        name="territoire"
        options={{
          title: "Chez vous",
          ...nomOnglet("Chez vous"),
          tabBarIcon: icone(IconeMaison),
          headerLeft: () => <Retour texte="Communes" etiquette="Revenir à l'accueil pour changer de commune" />,
        }}
      />
      <Tabs.Screen name="a-venir" options={{ title: LIBELLES.calendrier, ...nomOnglet("Calendrier"), tabBarIcon: icone(IconeCalendrier) }} />
      {/* QUATRIEME ONGLET (20/10/2026, maquette du porteur). « Qui decide » etait
         un ecran sans onglet (href null) : on y arrivait par « Aller plus loin »
         ou par le bloc de « Aujourd'hui ». C'est l'une des deux questions
         fondatrices du produit ; elle vaut une porte dans la barre, et c'est ce
         que montre la maquette. Les deux chemins existants continuent de
         fonctionner : ils menent au meme ecran. */}
      <Tabs.Screen
        name="qui-decide"
        options={{
          title: LIBELLES.qui,
          ...nomOnglet(LIBELLES.qui),
          tabBarIcon: icone(IconePersonne),
          headerLeft: () => <Retour texte="Communes" etiquette="Revenir à l'accueil pour changer de commune" />,
        }}
      />
    </Tabs>
  );
}
