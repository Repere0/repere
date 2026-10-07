/* LA COQUILLE — refonte du 30/09/2026.
 *
 * Architecture : un accueil (« Où habitez-vous ? »), un ecran central
 * (« Chez vous »), et trois ecrans qui repondent chacun a UNE question
 * (« Où va l'argent ? », « Qu'a voté votre député ? », « Qui décide ? »).
 * Une pile, pas d'onglets : l'ecran central est le sommaire, chaque question
 * s'ouvre par un geste et se referme par le geste retour natif.
 *
 * Les donnees d'une commune sont lues une fois (FournisseurCommune) et
 * partagees par les quatre ecrans. La police de Repere est embarquee dans
 * l'application : aucune requete vers un hote tiers. */
import "../lib/donnees";
import { router, Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque/800ExtraBold";
import { BricolageGrotesque_600SemiBold } from "@expo-google-fonts/bricolage-grotesque/600SemiBold";
import type { ReactNode } from "react";
import { FournisseurSelection, useSelection } from "../lib/selection";
import { FournisseurCommune } from "../lib/useCommune";
import { couleurs, CIBLE } from "../lib/theme";
import { LIBELLES } from "@repere/core";

/* LE BOUTON RETOUR, A 48 PX — la fleche native de la barre mesurait 30 px sur
   l'export web (tests/parcours-web.mjs). Le geste natif reste actif. */
function Retour({ texte, etiquette }: { texte: string; etiquette: string }) {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      accessibilityRole="button"
      accessibilityLabel={etiquette}
      style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, justifyContent: "center", paddingHorizontal: 8, opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={{ fontSize: 17, color: couleurs.lien, fontWeight: "600" }}>‹ {texte}</Text>
    </Pressable>
  );
}

function AvecCommune({ children }: { children: ReactNode }) {
  const { choix } = useSelection();
  return <FournisseurCommune choix={choix}>{children}</FournisseurCommune>;
}

export default function Coquille() {
  /* Le rendu attend la police (quelques millisecondes, fichier local) : un
     titre qui change de forme sous les yeux du lecteur gene davantage qu'un
     instant de plus sur l'ecran de demarrage. En cas d'echec, la police du
     systeme. */
  const [polices, erreur] = useFonts({ BricolageGrotesque_800ExtraBold, BricolageGrotesque_600SemiBold });
  if (!polices && !erreur) return null;
  return (
    <SafeAreaProvider>
      <FournisseurSelection>
        <AvecCommune>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: couleurs.sol },
              headerTintColor: couleurs.encre,
              headerShadowVisible: false,
              headerTitle: "",
              contentStyle: { backgroundColor: couleurs.sol },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false, title: "Repère" }} />
            <Stack.Screen name="chez-vous" options={{ title: LIBELLES.aujourdhui, headerLeft: () => <Retour texte="Communes" etiquette="Revenir à l'accueil pour changer de commune" /> }} />
            <Stack.Screen name="argent" options={{ title: LIBELLES.argent, headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
            <Stack.Screen name="vote" options={{ title: "Votre député", headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
            <Stack.Screen name="scrutins" options={{ title: "Scrutins publics", headerLeft: () => <Retour texte="Votre député" etiquette="Revenir à l'écran du député" /> }} />
            <Stack.Screen name="qui-decide" options={{ title: LIBELLES.qui, headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
            <Stack.Screen name="a-venir" options={{ title: "Au Parlement", headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
            <Stack.Screen name="sources" options={{ title: LIBELLES.sources, headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
          </Stack>
        </AvecCommune>
      </FournisseurSelection>
    </SafeAreaProvider>
  );
}
