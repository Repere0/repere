/* LE PARTAGE TEXTE DES ÉCRANS DE DÉTAIL (V37, bloc 7, 31/10/2026).
 *
 * Un bouton en tête d'écran : le titre de la page, le lien direct (schéma repere://, sans commune : la commune
 * ne se met jamais dans une adresse, invariant 2), et la source telle que l'écran la montre. Share de React
 * Native, comme ailleurs ; pas de carte d'image : ce partage-là est un texte. */
import { useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable, Share, Text, View } from "react-native";
import { dateFr } from "@repere/core";
import { couleurs, CIBLE } from "../../lib/theme";
import { useSelection } from "../../lib/selection";
import { lienDeLaPage } from "../../lib/adresse-web";

export const SCHEMA = "repere://";

export function messagePartage({ titre, chemin, source }: { titre: string; chemin: string; source: string }): string {
  return [titre, SCHEMA + chemin, source].filter(Boolean).join("\n");
}

/* « Source : X, relevé le JJ mois AAAA. » — la même forme que la fiche élu. */
export function ligneSource(s: { producteur?: string; maj?: string } | null | undefined): string {
  if (!s || !s.producteur) return "";
  return `Source : ${s.producteur}${s.maj ? `, relevé le ${dateFr(s.maj)}` : ""}.`;
}

/* « Copier le lien » (web, 12/11/2026, décision du porteur) : copie l'adresse de la page avec la commune après le « # ».
   Un message dit « Lien copié » ; si le navigateur refuse la copie, il le dit aussi (jamais un faux « copié »). */
async function copier(texte: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    return false;
  }
}
export function BoutonCopierLien({ icone = false }: { icone?: boolean }) {
  const { choix } = useSelection();
  const [etat, setEtat] = useState<"" | "ok" | "echec">("");
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (Platform.OS !== "web") return null;
  const onPress = async () => {
    setEtat((await copier(lienDeLaPage(choix ? choix.insee : null))) ? "ok" : "echec");
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setEtat(""), 3000);
  };
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Copier le lien de cette page"
      style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, alignItems: "center", justifyContent: "center", paddingHorizontal: 8, opacity: pressed ? 0.6 : 1 })}>
      {icone && !etat ? <Ionicons name="share-outline" size={24} color={couleurs.lien} accessible={false} importantForAccessibility="no" /> : (
        <Text style={{ fontSize: 17, color: couleurs.lien, fontWeight: "500" }} accessibilityLiveRegion="polite">
          {etat === "ok" ? "Lien copié" : etat === "echec" ? "Copie impossible" : "Copier le lien"}
        </Text>
      )}
    </Pressable>
  );
}

export function BoutonPartageTexte({ titre, chemin, source }: { titre: string; chemin: string; source: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <BoutonPartager titre={titre} chemin={chemin} source={source} />
      <BoutonCopierLien />
    </View>
  );
}

function BoutonPartager({ titre, chemin, source }: { titre: string; chemin: string; source: string }) {
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
