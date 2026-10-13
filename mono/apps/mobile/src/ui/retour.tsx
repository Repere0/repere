/* LE BOUTON RETOUR, A 48 PX — partage par la coquille et les onglets.
 * La fleche native de la barre mesurait 30 px sur l'export web
 * (tests/parcours-web.mjs) : on la remplace par ce bouton, a la meme cible.
 * Le geste natif reste actif. */
import { Pressable, Text } from "react-native";
import { router } from "expo-router";
import { couleurs, CIBLE } from "../lib/theme";

export function Retour({ texte, etiquette }: { texte: string; etiquette: string }) {
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
