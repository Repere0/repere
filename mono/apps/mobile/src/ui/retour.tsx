/* LE BOUTON RETOUR, A 48 PX — partage par la coquille et les onglets.
 * La fleche native de la barre mesurait 30 px sur l'export web
 * (tests/parcours-web.mjs) : on la remplace par ce bouton, a la meme cible.
 * Le geste natif reste actif. */
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { couleurs, CIBLE, PAS, RAYON } from "../lib/theme";
import { useSelection } from "../lib/selection";

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

/* 20/10/2026 (maquette « Qui decide pour vous ? ») : la commune choisie en pilule, a la
   place du retour « Communes ». Toucher la pilule ramene a l'accueil, ou l'on change de
   commune. Sans commune choisie, elle n'affiche rien de faux. */
export function PastilleCommune() {
  const { choix } = useSelection();
  if (!choix) return null;
  return (
    <Pressable
      onPress={() => router.navigate("/")}
      accessibilityRole="button"
      accessibilityLabel={`Changer de commune, actuellement ${choix.nom}`}
      style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", marginLeft: PAS * 2, opacity: pressed ? 0.6 : 1 })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, backgroundColor: couleurs.carte, borderRadius: RAYON.pastille, paddingHorizontal: PAS * 3, paddingVertical: PAS * 2, borderWidth: 1, borderColor: couleurs.trait }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: couleurs.encre }}>{choix.nom}</Text>
        <Text style={{ fontSize: 12, color: couleurs.sourd }}>▾</Text>
      </View>
    </Pressable>
  );
}
