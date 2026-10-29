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

/* CHANGER DE COMMUNE, DEPUIS UN ONGLET. Ramene a l'accueil DEJA EMPILE (dismissTo) :
   un simple retour arriere ouvrirait l'onglet precedent (sur « Qui decide », c'etait
   « Aujourd'hui »), pas le choix de commune. Un router.replace("/") empilait un
   second accueil sous le premier : le retour arriere revenait a un ecran identique
   (parcours navigateur, 29/10/2026). */
export function ChangerCommune() {
  return (
    <Pressable
      onPress={() => router.dismissTo("/")}
      accessibilityRole="button"
      accessibilityLabel="Changer de commune : revenir à l'accueil"
      style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, justifyContent: "center", paddingHorizontal: 8, opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={{ fontSize: 17, color: couleurs.lien, fontWeight: "600" }}>‹ Communes</Text>
    </Pressable>
  );
}
