/* LA COQUILLE — refonte du 30/09/2026, barre basse du 13/10/2026.
 *
 * Architecture : un accueil (« Où habitez-vous ? »), puis la barre basse a trois
 * onglets (groupe « (onglets) » : Aujourd'hui, Chez vous, Calendrier), et des
 * ecrans qui repondent chacun a UNE question, ouverts par-dessus la barre.
 * Une pile, avec la barre basse du canevas « Accueil ». Chaque question
 * s'ouvre par un geste et se referme par le geste retour natif.
 *
 * Les donnees d'une commune sont lues une fois (FournisseurCommune) et
 * partagees par les ecrans. La police de Repere est embarquee dans
 * l'application : aucune requete vers un hote tiers. */
import "../lib/donnees";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque/800ExtraBold";
import { BricolageGrotesque_600SemiBold } from "@expo-google-fonts/bricolage-grotesque/600SemiBold";
import type { ReactNode } from "react";
import { FournisseurSelection, useSelection } from "../lib/selection";
import { FournisseurCommune } from "../lib/useCommune";
import { couleurs, useModeSysteme } from "../lib/theme";
import { LIBELLES } from "@repere/core";
import { Retour } from "../ui/retour";

const themeClair = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: "#F5F2EC", card: "#FFFFFF", text: "#171614", border: "#DDD8D0", primary: "#171614" } };
const themeSombre = { ...DarkTheme, colors: { ...DarkTheme.colors, background: "#161513", card: "#1F1D1A", text: "#F3F0EA", border: "#3B3832", primary: "#F3F0EA" } };

function AvecCommune({ children }: { children: ReactNode }) {
  const { choix } = useSelection();
  return <FournisseurCommune choix={choix}>{children}</FournisseurCommune>;
}

export default function Coquille() {
  /* Le rendu attend la police (quelques millisecondes, fichier local) : un
     titre qui change de forme sous les yeux du lecteur gene davantage qu'un
     instant de plus sur l'ecran de demarrage. En cas d'echec, la police du
     systeme. */
  const mode = useModeSysteme();
  const [polices, erreur] = useFonts({ BricolageGrotesque_800ExtraBold, BricolageGrotesque_600SemiBold });
  if (!polices && !erreur) return null;
  return (
    <SafeAreaProvider>
      <FournisseurSelection>
        <AvecCommune>
          <StatusBar style={mode === "sombre" ? "light" : "dark"} />
          <ThemeProvider value={mode === "sombre" ? themeSombre : themeClair}>
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
              <Stack.Screen name="(onglets)" options={{ headerShown: false }} />
              <Stack.Screen name="argent" options={{ title: LIBELLES.argent, headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
              <Stack.Screen name="vote" options={{ title: "Votre député", headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
              <Stack.Screen name="scrutins" options={{ title: "Scrutins publics", headerLeft: () => <Retour texte="Votre député" etiquette="Revenir à l'écran du député" /> }} />
              <Stack.Screen name="sources" options={{ title: LIBELLES.sources, headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
              <Stack.Screen name="dictionnaire" options={{ title: "Dictionnaire citoyen", headerLeft: () => <Retour texte={LIBELLES.calendrier} etiquette={`Revenir à l'écran ${LIBELLES.calendrier}`} /> }} />
              <Stack.Screen name="procedure" options={{ title: "La procédure", headerLeft: () => <Retour texte={LIBELLES.calendrier} etiquette={`Revenir à l'écran ${LIBELLES.calendrier}`} /> }} />
              <Stack.Screen name="elu" options={{ title: "Fiche", headerLeft: () => <Retour texte={LIBELLES.qui} etiquette={`Revenir à l'écran ${LIBELLES.qui}`} /> }} />
              <Stack.Screen name="partager" options={{ title: "Partager", headerLeft: () => <Retour texte="Votre député" etiquette="Revenir à l'écran du député" /> }} />
            </Stack>
          </ThemeProvider>
        </AvecCommune>
      </FournisseurSelection>
    </SafeAreaProvider>
  );
}
