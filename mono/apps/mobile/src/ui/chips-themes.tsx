/* LES THÈMES, EN UN GESTE (12/11/2026, décision du porteur) : une rangée de pastilles sur l'accueil. Toucher un thème
 * ouvre la recherche déjà filtrée sur ce thème (scrutins et questions au Gouvernement). Les thèmes sont ceux de
 * @repere/core (THEMES, D57) : les mêmes que les sujets d'intérêt du profil, aucun thème nouveau.
 * Le rangement d'un titre dans un thème se fait par mots-clés (core/themes.js) : approximatif, et la recherche le dit. */
import { Pressable, ScrollView, Text } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { THEMES } from "@repere/core";
import { CIBLE, couleurs, PAS, POLICE, RAYON } from "../lib/theme";

export const ICONE_THEME: Record<string, keyof typeof Ionicons.glyphMap> = {
  "Santé": "medkit-outline", "École": "school-outline", "Transport": "bus-outline", "Environnement": "leaf-outline",
  "Budget": "wallet-outline", "Sécurité": "shield-checkmark-outline", "Économie": "briefcase-outline",
};

export function ChipsThemes({ actif, choisir }: { actif?: string | null; choisir?: (t: string | null) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} accessibilityLabel="Thèmes : filtrer la recherche par sujet"
      contentContainerStyle={{ gap: PAS * 2, paddingVertical: PAS }}>
      {(THEMES as string[]).map(t => {
        const on = actif === t;
        return (
          <Pressable key={t} onPress={() => (choisir ? choisir(on ? null : t) : router.push({ pathname: "/recherche", params: { theme: t } }))}
            accessibilityRole="button" accessibilityState={{ selected: on }}
            accessibilityLabel={choisir ? `Thème ${t}${on ? ", choisi : le retirer" : ""}` : `Thème ${t} : voir les votes et les questions liés`}
            style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 2, paddingHorizontal: PAS * 4,
              borderRadius: RAYON.pastille, borderWidth: 1, borderColor: on ? couleurs.encre : couleurs.trait,
              backgroundColor: on ? couleurs.encre : couleurs.carte, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
            <Ionicons name={ICONE_THEME[t] ?? "pricetag-outline"} size={18} color={on ? couleurs.sol : couleurs.encre} accessible={false} importantForAccessibility="no" />
            <Text style={{ fontSize: 15, fontFamily: POLICE.texteMoyen, color: on ? couleurs.sol : couleurs.encre }}>{t}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
