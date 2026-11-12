/* TIMELINE — une liste d'étapes datées, de haut en bas (05/11/2026).
 * Point gris neutre (POINT_ETAPE), trait fin, date puis libellé officiel, lien seulement s'il
 * existe. Aucun plafond de taille : le texte suit le Dynamic Type et Confort de lecture.
 * Liste vide : rien n'est rendu (pas de cadre vide, invariant 5). */
import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { dateFr } from "@repere/core";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";
import { POINT_ETAPE } from "../lib/palette";
import { enfonce } from "./mouvement";

export type Etape = { date: string; fin?: string | null; libelle: string; lien: string | null };

const quand = (e: Etape) => (e.fin ? `du ${dateFr(e.date)} au ${dateFr(e.fin)}` : dateFr(e.date));

export function Timeline({ etapes, etiquette }: { etapes: Etape[]; etiquette?: string }) {
  if (!etapes.length) return null;
  return (
    <View accessibilityLabel={etiquette}>
      {etapes.map((e, i) => (
        <View key={e.date + e.libelle} style={{ flexDirection: "row", gap: PAS * 3 }}>
          <View style={{ width: 12, alignItems: "center" }} importantForAccessibility="no-hide-descendants">
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: POINT_ETAPE, marginTop: 6 }} />
            {i < etapes.length - 1 ? <View style={{ flex: 1, width: 1, backgroundColor: couleurs.trait, marginTop: 4 }} /> : null}
          </View>
          <View style={{ flex: 1, gap: 2, paddingBottom: PAS * 4 }} accessible={!e.lien}
            accessibilityLabel={e.lien ? undefined : `${quand(e)} : ${e.libelle}`}>
            <Text style={TYPO.donnee}>{quand(e)}</Text>
            <Text style={[TYPO.corps, { color: couleurs.encre }]}>{e.libelle}</Text>
            {e.lien ? (
              <Pressable onPress={() => Linking.openURL(e.lien as string)} accessibilityRole="link"
                accessibilityLabel={`${quand(e)} : ${e.libelle}. Ouvrir le document officiel, site externe`}
                style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: 6, ...enfonce(pressed) })}>
                <Ionicons name="document-text-outline" size={16} color={couleurs.lien} accessible={false} importantForAccessibility="no" />
                <Text style={[TYPO.note, { color: couleurs.lien }]}>Document officiel</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
