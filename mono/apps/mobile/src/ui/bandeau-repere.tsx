/* LE BANDEAU « REPÈRE DU JOUR » (V54, 03/11/2026) — une ligne, en tête de « Chez vous ».
 *
 * Décision CEO D139 et D147 : au-dessus des trois réponses. La zone tactile fait 44 px
 * (règle du projet : cible tactile >= 44) ; le fond visible fait 32 px, centré dans cette
 * zone. Il ne montre que le premier fait, tronqué sur une ligne. Un geste ouvre la page
 * complète, qui porte les trois faits, leurs sources et le partage.
 * Sans fait affichable, le bandeau ne s'affiche pas. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { couleurs, feuille, PAS, RAYON, TYPO } from "../lib/theme";
import { faitsAffichables, type FaitDuJour, type SourcesDuJour } from "../lib/repere-jour";

const ZONE_TACTILE = 44;
const HAUTEUR_VISIBLE = 32;

export function BandeauRepere({ faits, sources, onOuvrir }: {
  faits: FaitDuJour[];
  sources: SourcesDuJour;
  onOuvrir: () => void;
}) {
  const premier = faitsAffichables(faits, sources)[0];
  if (!premier) return null;
  return (
    <Pressable onPress={onOuvrir} accessibilityRole="button"
      accessibilityLabel="Ouvrir le Repère du jour"
      style={({ pressed }) => [s.zone, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={[s.visible, { backgroundColor: couleurs.voile }]}>
        <Text style={s.icone} importantForAccessibility="no">💡</Text>
        <Text numberOfLines={1} style={s.texte}>{`Aujourd'hui : ${premier.f.texte}`}</Text>
        <Text style={s.chevron} importantForAccessibility="no">›</Text>
      </View>
    </Pressable>
  );
}

const s = feuille(() => StyleSheet.create({
  zone: {
    minHeight: ZONE_TACTILE,
    height: ZONE_TACTILE,
    justifyContent: "center",
  },
  visible: {
    height: HAUTEUR_VISIBLE,
    flexDirection: "row",
    alignItems: "center",
    gap: PAS * 2,
    paddingHorizontal: PAS * 3,
    borderRadius: RAYON.bloc,
  },
  icone: { ...TYPO.note },
  texte: { ...TYPO.note, flex: 1, color: couleurs.encre },
  chevron: { ...TYPO.corps, fontWeight: "700", color: couleurs.encre },
}));
