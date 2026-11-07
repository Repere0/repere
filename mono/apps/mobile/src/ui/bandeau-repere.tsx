/* LE BANDEAU « REPÈRE DU JOUR » (V54, 03/11/2026) — une ligne, en tête de « Chez vous ».
 *
 * Décision CEO D139 et D147 : au-dessus des trois réponses. La zone tactile fait 44 px
 * (règle du projet : cible tactile >= 44) ; le fond visible fait 32 px, centré dans cette
 * zone. Il ne montre que le premier fait, tronqué sur une ligne. Un geste ouvre la page
 * complète, qui porte les trois faits, leurs sources et le partage.
 * Sans fait affichable, le bandeau ne s'affiche pas. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { raccourcirFait } from "@repere/core";
import { couleurs, feuille, PAS, RAYON, TYPO } from "../lib/theme";
import { faitsAffichables, type FaitDuJour, type SourcesDuJour } from "../lib/repere-jour";

const ZONE_TACTILE = 44;
const HAUTEUR_VISIBLE = 32;

/* V55 (bloc 3) : sur une ligne, à 390 px, le bandeau montre environ 36 caractères (mesuré, V54).
   Le préfixe en prend 14 ; le fait est raccourci à 22 caractères, à un mot près, et garde son
   premier chiffre quand il y en a un. La phrase entière reste à un geste, sur la page complète. */
const PREFIXE = "Aujourd'hui : ";
const FAIT_MAX = 22;

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
        <Ionicons name="bulb-outline" size={16} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
        <Text numberOfLines={1} style={s.texte}>{`${PREFIXE}${raccourcirFait(premier.f.texte, { max: FAIT_MAX, visible: FAIT_MAX })}`}</Text>
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
  texte: { ...TYPO.note, flex: 1, color: couleurs.encre },
  chevron: { ...TYPO.corps, fontWeight: "700", color: couleurs.encre },
}));
