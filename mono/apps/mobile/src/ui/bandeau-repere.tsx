/* LE BANDEAU « REPÈRE DU JOUR » (V54, 03/11/2026) — une ligne, en tête de « Chez vous ».
 *
 * Décision CEO D139 et D147 : au-dessus des trois réponses. La zone tactile fait 44 px
 * (règle du projet : cible tactile >= 44) ; le fond visible fait 32 px, centré dans cette
 * zone. Il ne montre que le premier fait, tronqué sur une ligne. Un geste ouvre la page
 * complète, qui porte les trois faits, leurs sources et le partage.
 * Sans fait affichable, le bandeau ne s'affiche pas. */
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { couleurs, feuille, PAS, TYPO } from "../lib/theme";
import { etatFraicheur, FRAICHEUR, surFraicheur } from "../lib/donnees";
import { useMouvementReduit } from "./mouvement";
import { faitsAffichables, type FaitDuJour, type SourcesDuJour } from "../lib/repere-jour";
import { enfonce } from "./mouvement";

const ZONE_TACTILE = 44;
const HAUTEUR_VISIBLE = 32;

/* V55 (bloc 3) : sur une ligne, à 390 px, le bandeau montre environ 36 caractères (mesuré, V54).
   Le préfixe en prend 14 ; le fait est raccourci à 22 caractères, à un mot près, et garde son
   premier chiffre quand il y en a un. La phrase entière reste à un geste, sur la page complète. */
const PREFIXE = ""; /* 09/11/2026 : l'étiquette « Repère du jour » est à part, en petites capitales. */

/* « FRAIS », ET SEULEMENT SI C'EST VRAI (retour du porteur, 11/11/2026 ; invariant 9). La bordure s'éclaire une
   fois à l'arrivée puis se pose, avec un petit point, UNIQUEMENT quand la publication affichée est la courante,
   vérifiée. En « publication précédente » ou « impossible à vérifier », aucun effet : le bandeau reste sobre,
   pour ne jamais faire passer pour frais ce qui ne l'est pas. Neutre (encre) : l'émeraude est réservée aux
   votes. Une seule fois, pas de boucle : rien qui ressemble à une série ou à une récompense (invariant 6). */
function useFraiche(): boolean {
  const [fraiche, setFraiche] = useState(etatFraicheur().etat === FRAICHEUR.ACTUELLE);
  useEffect(() => {
    const desabonner = surFraicheur((e: { etat: string }) => setFraiche(e.etat === FRAICHEUR.ACTUELLE));
    return () => { desabonner(); };
  }, []);
  return fraiche;
}

export function BandeauRepere({ faits, sources, onOuvrir }: {
  faits: FaitDuJour[];
  sources: SourcesDuJour;
  onOuvrir: () => void;
}) {
  const fraiche = useFraiche();
  const reduit = useMouvementReduit();
  const lueur = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!fraiche) { lueur.setValue(0); return undefined; }
    if (reduit) { lueur.setValue(0.4); return undefined; }
    const a = Animated.sequence([
      Animated.timing(lueur, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(lueur, { toValue: 0.4, duration: 900, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
    ]);
    a.start();
    return () => a.stop();
  }, [fraiche, reduit, lueur]);
  const premier = faitsAffichables(faits, sources)[0];
  if (!premier) return null;
  return (
    <Pressable onPress={onOuvrir} accessibilityRole="button"
      accessibilityLabel="Ouvrir le Repère du jour"
      style={({ pressed }) => [s.zone, pressed && enfonce(true)]}>
      {/* Refonte (porteur, 09/11/2026) : un bloc discret, sans icône ni fond ; un filet fin dessous. */}
      <Animated.View testID={fraiche ? "repere-frais" : undefined}
        style={[s.visible, fraiche && { ...s.frais, borderColor: lueur.interpolate({ inputRange: [0, 1], outputRange: [couleurs.trait, couleurs.encre] }) }]}>
        {fraiche ? <View style={s.point} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" /> : null}
        {/* 13/11/2026 (porteur) : la bulle coupait le fait à 28 caractères sur une ligne (« Sur 100 € encaissés à… ») :
            avec un nom de commune long, il ne restait rien à lire. L'étiquette passe au-dessus, le fait entier
            dessous, sur deux lignes au plus, et la bulle grandit avec lui. */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={s.etiquette}>REPÈRE DU JOUR</Text>
          <Text numberOfLines={2} style={s.texte}>{`${PREFIXE}${premier.f.texte}`}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
      </Animated.View>
    </Pressable>
  );
}

const s = feuille(() => StyleSheet.create({
  zone: {
    minHeight: ZONE_TACTILE,
    justifyContent: "center",
  },
  visible: {
    minHeight: HAUTEUR_VISIBLE,
    paddingVertical: PAS * 2,
    flexDirection: "row",
    alignItems: "center",
    gap: PAS * 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: couleurs.trait,
  },
  frais: { borderWidth: 1, borderRadius: 16, paddingHorizontal: PAS * 3, borderBottomWidth: 1 },
  point: { width: 6, height: 6, borderRadius: 3, backgroundColor: couleurs.encre },
  etiquette: { ...TYPO.micro, fontSize: 13, letterSpacing: 0.6, color: couleurs.sourd },
  texte: { ...TYPO.note, color: couleurs.encre },
}));
