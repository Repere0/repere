/* Le bouton « Partager » d'un ecran de contexte : il capture la carte correspondante
   (hors ecran) puis ouvre la feuille de partage native. Le texte de repli est fourni. */
import type { ComponentRef, ReactNode, RefObject } from "react";
import { Pressable, Text, View } from "react-native";
import { couleurs, CIBLE, PAS } from "../../lib/theme";
import { usePartageStory } from "./use-partage-story";

export function PartagerCarte({ etiquette, repli, rendu, libelle = "Partager" }: {
  etiquette: string; repli: string; rendu: (ref: RefObject<ComponentRef<typeof View> | null>) => ReactNode;
  /* V55 : libellé du bouton (« Partager ma story » sur la page du Repère du jour) */
  libelle?: string;
}) {
  const { carte, partager } = usePartageStory(repli);
  return (
    <>
      <Pressable onPress={partager} accessibilityRole="button" accessibilityLabel={etiquette}
        style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait,
          backgroundColor: couleurs.carte, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 4, opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ color: couleurs.encre, fontWeight: "500" }}>{libelle}</Text>
      </Pressable>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={{ position: "absolute", left: -10000, top: 0 }}>
        {rendu(carte)}
      </View>
    </>
  );
}
