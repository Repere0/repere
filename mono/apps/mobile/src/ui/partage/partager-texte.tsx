/* LE PARTAGE TEXTE DES ÉCRANS DE DÉTAIL (V37, bloc 7, 31/10/2026).
 *
 * Un bouton en tête d'écran : le titre de la page, le lien direct (schéma repere://, sans commune : la commune
 * ne se met jamais dans une adresse, invariant 2), et la source telle que l'écran la montre. Share de React
 * Native, comme ailleurs ; pas de carte d'image : ce partage-là est un texte. */
import { Pressable, Share, Text } from "react-native";
import { dateFr } from "@repere/core";
import { couleurs, CIBLE } from "../../lib/theme";

export const SCHEMA = "repere://";

export function messagePartage({ titre, chemin, source }: { titre: string; chemin: string; source: string }): string {
  return [titre, SCHEMA + chemin, source].filter(Boolean).join("\n");
}

/* « Source : X, relevé le JJ mois AAAA. » — la même forme que la fiche élu. */
export function ligneSource(s: { producteur?: string; maj?: string } | null | undefined): string {
  if (!s || !s.producteur) return "";
  return `Source : ${s.producteur}${s.maj ? `, relevé le ${dateFr(s.maj)}` : ""}.`;
}

export function BoutonPartageTexte({ titre, chemin, source }: { titre: string; chemin: string; source: string }) {
  return (
    <Pressable
      onPress={() => { Share.share({ title: titre, message: messagePartage({ titre, chemin, source }) }).catch(() => {}); }}
      accessibilityRole="button"
      accessibilityLabel={`Partager : ${titre}`}
      style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, justifyContent: "center", paddingHorizontal: 8, opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={{ fontSize: 17, color: couleurs.lien, fontWeight: "500" }}>Partager</Text>
    </Pressable>
  );
}
