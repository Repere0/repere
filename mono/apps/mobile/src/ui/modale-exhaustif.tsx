/* TOUT VOIR — feuille plein écran (V28, bloc 2). Pour le niveau 3 : méthode, sources,
 * dates. Chaque section a son titre (h2) et son contenu ; la source, si elle existe, est
 * écrite sous le contenu. Fermeture en haut, défilement vertical. */
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { CIBLE, couleurs, PAS, TYPO } from "../lib/theme";

export type SectionExhaustive = { titre: string; contenu: React.ReactNode; source?: string };

export function ModaleExhaustif({ titre, sections, visible, onFermer }: {
  titre: string; sections: SectionExhaustive[]; visible: boolean; onFermer: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onFermer}>
      <View style={{ flex: 1, backgroundColor: couleurs.sol }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: PAS * 4, gap: PAS * 3 }}>
          <Text style={[TYPO.reponse, { flex: 1 }]} accessibilityRole="header">{titre}</Text>
          <Pressable onPress={onFermer} accessibilityRole="button" accessibilityLabel="Fermer"
            style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
            <Text style={{ color: couleurs.lien, fontWeight: "500", fontSize: 16 }}>Fermer</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: PAS * 4, paddingTop: 0, gap: PAS * 5 }}>
          {sections.map((s, i) => (
            <View key={i} style={{ gap: PAS * 2 }}>
              <Text style={[TYPO.corps, { fontWeight: "600" }]} accessibilityRole="header">{s.titre}</Text>
              {typeof s.contenu === "string" ? <Text style={TYPO.corps}>{s.contenu}</Text> : s.contenu}
              {s.source ? <Text style={TYPO.note}>Source : {s.source}</Text> : null}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}
