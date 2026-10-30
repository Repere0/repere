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
import { useMemo, useState, type ReactNode } from "react";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { BricolageGrotesque_800ExtraBold } from "@expo-google-fonts/bricolage-grotesque/800ExtraBold";
import { BricolageGrotesque_600SemiBold } from "@expo-google-fonts/bricolage-grotesque/600SemiBold";
import { FournisseurSelection, useSelection } from "../lib/selection";
import { FournisseurCommune } from "../lib/useCommune";
import { appliquerChoix, appliquerLecture, couleurs, useModeSysteme, type ChoixTheme } from "../lib/theme";
import { FournisseurProfil, useEtatProfil } from "../lib/profil";
import { PROFIL_DEFAUT } from "@repere/core";
import { FournisseurTheme } from "../lib/themeChoix";
import { NEUTRES_PAR_MODE, type Mode } from "../lib/palette";
import { LIBELLES } from "@repere/core";
import { Retour } from "../ui/retour";

/* Le theme de navigation reprend les neutres de la palette (aucune couleur ici). */
function themeDe(mode: Mode) {
  const base = mode === "sombre" ? DarkTheme : DefaultTheme;
  const n = NEUTRES_PAR_MODE[mode];
  return { ...base, colors: { ...base.colors, background: n.sol, card: n.carte, text: n.encre, border: n.trait, primary: n.encre } };
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
  const systeme = useModeSysteme();
  const [choix, setChoix] = useState<ChoixTheme>("systeme");
  const mode = appliquerChoix(choix, systeme);
  /* Le profil de lecture (V26, bloc 3) : appliqué avant le dessin, comme le mode. */
  const etatProfil = useEtatProfil();
  const lu = etatProfil.profil ?? PROFIL_DEFAUT;
  appliquerLecture({ taille: lu.tailleTexte, espacement: lu.espacement, contraste: lu.contraste });
  const valeur = useMemo(() => ({ choix, setChoix, mode }), [choix, mode]);
  const tema = useMemo(() => themeDe(mode), [mode]);
  const fonds = NEUTRES_PAR_MODE[mode];
  const [polices, erreur] = useFonts({ BricolageGrotesque_800ExtraBold, BricolageGrotesque_600SemiBold });
  if (!polices && !erreur) return null;
  return (
    <FournisseurTheme value={valeur}>
      <SafeAreaProvider>
        <FournisseurSelection>
        <FournisseurProfil valeur={etatProfil}>
          <AvecCommune>
            <StatusBar style={mode === "sombre" ? "light" : "dark"} />
            <ThemeProvider value={tema}>
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: couleurs.sol },
                  headerTintColor: couleurs.encre,
                  headerShadowVisible: false,
                  headerTitle: "",
                  contentStyle: { backgroundColor: fonds.sol },
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
                <Stack.Screen name="annuaire-fiche" options={{ title: "Élu", headerLeft: () => <Retour texte="Élus" etiquette="Revenir à l'écran Élus" /> }} />
                <Stack.Screen name="actus" options={{ title: "Actualités", headerLeft: () => <Retour texte={LIBELLES.aujourdhui} etiquette={`Revenir à l'écran ${LIBELLES.aujourdhui}`} /> }} />
                <Stack.Screen name="bienvenue" options={{ headerShown: false }} />
                <Stack.Screen name="confort-lecture" options={{ title: "Confort de lecture", headerLeft: () => <Retour texte="Retour" etiquette="Revenir à l'écran précédent" /> }} />
                <Stack.Screen name="pour-vous" options={{ title: "Pour vous", headerLeft: () => <Retour texte="Retour" etiquette="Revenir à l'écran précédent" /> }} />
                <Stack.Screen name="mes-elus" options={{ title: "Mes élus", headerLeft: () => <Retour texte="Retour" etiquette="Revenir à l'écran précédent" /> }} />
                <Stack.Screen name="voter" options={{ title: "Voter", headerLeft: () => <Retour texte="Retour" etiquette="Revenir à l'écran précédent" /> }} />
                <Stack.Screen name="a-propos" options={{ title: "À propos" }} />
                <Stack.Screen name="confidentialite" options={{ title: "Confidentialité" }} />
                <Stack.Screen name="faq" options={{ title: "Questions fréquentes", headerLeft: () => <Retour texte="Retour" etiquette="Revenir à l'écran précédent" /> }} />
                <Stack.Screen name="elu" options={{ title: "Fiche", headerLeft: () => <Retour texte={LIBELLES.qui} etiquette={`Revenir à l'écran ${LIBELLES.qui}`} /> }} />
                <Stack.Screen name="partager" options={{ title: "Partager", animation: "slide_from_bottom", headerLeft: () => <Retour texte="Votre député" etiquette="Revenir à l'écran du député" /> }} />
              </Stack>
            </ThemeProvider>
          </AvecCommune>
        </FournisseurProfil>
        </FournisseurSelection>
      </SafeAreaProvider>
    </FournisseurTheme>
  );
}
