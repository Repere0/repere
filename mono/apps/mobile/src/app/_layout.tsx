/* La coquille de l'application : zones sures (encoche, barre d'accueil),
 * barre d'etat, et une pile de navigation a deux ecrans. Le geste retour
 * natif (glisser sur iOS, bouton retour d'Android) ramene a l'accueil. */
import "../lib/donnees";
import { router, Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { FournisseurSelection } from "../lib/selection";
import { couleurs, CIBLE } from "../lib/theme";

/* LE BOUTON RETOUR, A 48 PX — 29/09/2026. Celui de la barre de navigation
   mesurait 30 px de haut sur l'export web (tests/parcours-web.mjs). Le geste
   natif (glisser sur iOS, retour d'Android) reste actif en plus. */
function Retour() {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      accessibilityRole="button"
      accessibilityLabel="Revenir à l'accueil"
      style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, justifyContent: "center", paddingHorizontal: 8, opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={{ fontSize: 17, color: couleurs.ville }}>‹ Accueil</Text>
    </Pressable>
  );
}

export default function Coquille() {
  return (
    <SafeAreaProvider>
      <FournisseurSelection>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: couleurs.sol },
            headerTintColor: couleurs.encre,
            headerShadowVisible: false,
            contentStyle: { backgroundColor: couleurs.sol },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false, title: "Repère" }} />
          <Stack.Screen name="chez-vous" options={{ title: "Chez vous", headerLeft: () => <Retour /> }} />
        </Stack>
      </FournisseurSelection>
    </SafeAreaProvider>
  );
}
