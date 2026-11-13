/* Le bouton « Partager » d'un ecran de contexte : il capture la carte correspondante
   (hors ecran) puis ouvre la feuille de partage native. Le texte de repli est fourni. */
import { Ionicons } from "@expo/vector-icons";
import type { ComponentRef, ReactNode, RefObject } from "react";
import { Pressable, Text, View } from "react-native";
import { couleurs, CIBLE, PAS } from "../../lib/theme";
import { usePartageStory } from "./use-partage-story";

export function PartagerCarte({ etiquette, repli, rendu, libelle = "Partager", icone }: {
  etiquette: string; repli: string; rendu: (ref: RefObject<ComponentRef<typeof View> | null>) => ReactNode;
  /* V55 : libellé du bouton (« Partager ma story » sur la page du Repère du jour) */
  libelle?: string;
  /* 13/11/2026 : une icône à côté du libellé, là où le bouton doit attirer l'œil (fin de manche du quiz). */
  icone?: keyof typeof Ionicons.glyphMap;
}) {
  const { carte, partager } = usePartageStory(repli);
  return (
    <>
      <Pressable onPress={partager} accessibilityRole="button" accessibilityLabel={etiquette}
        style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait,
          backgroundColor: couleurs.carte, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 4, opacity: pressed ? 0.7 : 1 })}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
          {icone ? <Ionicons name={icone} size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" /> : null}
          <Text style={{ color: couleurs.encre, fontWeight: "500" }}>{libelle}</Text>
        </View>
      </Pressable>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={{ position: "absolute", left: -10000, top: 0 }}>
        {rendu(carte)}
      </View>
    </>
  );
}
