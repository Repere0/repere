/* LA SOURCE FAIT PARTIE DU DESIGN — refonte du 30/09/2026.
 *
 * Niveau 1 : une pastille discrete sous chaque reponse (« ⓘ OFGL · 2025 »).
 * Niveau 4 : un geste l'ouvre en feuille — producteur, date, licence, methode
 * si c'est un calcul de Repere, et le lien vers la source officielle.
 * Aucune information importante sans pastille (invariant 4). Les lignes de
 * source completes restent aussi en bas de chaque ecran de detail, telles que
 * le site les ecrit (ligneSource, @repere/core). */
import { useState } from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CALCUL_REPERE, dateFr, ligneSource } from "@repere/core";
import { couleurs, CIBLE, PAS, RAYON, TYPO } from "../lib/theme";

export type InfoSource = {
  producteur?: string; licence?: string; maj?: string; mention?: string; url?: string;
  /* date de releve (fichiers de l'Assemblee, du Senat) : ce n'est pas une date de mise a jour */
  releve?: string;
  /* nom court pour la pastille, quand le nom complet ne se resume pas seul */
  court?: string;
  /* present si le chiffre est un calcul de Repere : la methode, en une phrase */
  methode?: string;
};

/* « Observatoire des finances et de la gestion publique locales (OFGL) » -> « OFGL » */
export function producteurCourt(p?: string): string {
  const m = /\(([A-ZÉ]{2,8})\)\s*$/.exec(p || "");
  if (m) return m[1];
  const nom = (p || "Source").split(" — ")[0];
  if (nom.length <= 26) return nom;
  /* « Direction générale des collectivités locales » -> « DGCL » : les initiales
     des mots porteurs, la feuille de source donnant le nom complet. */
  return nom.split(/\s+/).filter(w => w.length > 3).map(w => w[0].toUpperCase()).join("");
}
const annee = (maj?: string) => (/^(\d{4})/.exec(maj || "") || [])[1];

export function PastilleSource({ source }: { source: InfoSource | null | undefined }) {
  const [ouverte, setOuverte] = useState(false);
  if (!source || !source.producteur) return null;
  const a = annee(source.maj || source.releve);
  const texte = `${source.methode ? "Calcul Repère · " : ""}${source.court || producteurCourt(source.producteur)}${a ? " · " + a : ""}`;
  return (
    <>
      {/* La zone tactile fait 48 px ; la pastille visible, 32. */}
      <Pressable
        onPress={() => setOuverte(true)}
        accessibilityRole="button"
        accessibilityLabel={`D'où vient cette information ? ${source.methode ? "Calcul de Repère à partir de " : ""}${source.producteur}${source.maj ? ", mise à jour du " + dateFr(source.maj) : source.releve ? ", relevé le " + dateFr(source.releve) : ""}`}
        style={({ pressed }) => [s.zone, pressed && { opacity: 0.6 }]}
      >
        <View style={s.pastille}>
          <Text style={s.pastilleI}>ⓘ</Text>
          <Text style={s.pastilleTexte} numberOfLines={1}>{texte}</Text>
        </View>
      </Pressable>
      <FeuilleSource source={source} visible={ouverte} onFermer={() => setOuverte(false)} />
    </>
  );
}

export function FeuilleSource({ source, visible, onFermer }: { source: InfoSource; visible: boolean; onFermer: () => void }) {
  const marges = useSafeAreaInsets();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onFermer}>
      <ScrollView style={{ backgroundColor: couleurs.sol }}
        contentContainerStyle={[s.feuille, { paddingBottom: marges.bottom + PAS * 8 }]}>
        <Text style={TYPO.etiquette}>D'où vient cette information ?</Text>
        <Text style={TYPO.question} accessibilityRole="header">{source.producteur}</Text>
        {source.methode ? (
          <View style={s.calcul}>
            <Text style={[TYPO.corps, { fontWeight: "700" }]}>{CALCUL_REPERE}</Text>
            <Text style={TYPO.corps}>{source.methode}</Text>
          </View>
        ) : (
          <Text style={TYPO.corps}>Ce chiffre est affiché tel que la source le publie.</Text>
        )}
        <Text style={TYPO.note}>{ligneSource(source.releve && !source.mention ? { ...source, mention: "relevé le " + dateFr(source.releve) } : source)}</Text>
        {source.url ? (
          <Pressable onPress={() => Linking.openURL(source.url as string)} accessibilityRole="link"
            accessibilityLabel={`Voir la source officielle : ${source.producteur}, ouvre un site externe`}
            style={({ pressed }) => [s.bouton, pressed && { opacity: 0.7 }]}>
            <Text style={s.boutonTexte}>Voir la source officielle ↗</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onFermer} accessibilityRole="button" style={({ pressed }) => [s.fermer, pressed && { opacity: 0.6 }]}>
          <Text style={[TYPO.corps, { fontWeight: "600" }]}>Fermer</Text>
        </Pressable>
      </ScrollView>
    </Modal>
  );
}

const s = StyleSheet.create({
  zone: { alignSelf: "flex-start", minHeight: CIBLE, justifyContent: "center", maxWidth: "100%" },
  pastille: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "100%",
    minHeight: 32, paddingHorizontal: 12, borderRadius: RAYON.pastille, backgroundColor: couleurs.voile,
  },
  pastilleI: { fontSize: 14, color: couleurs.sourd },
  pastilleTexte: { fontSize: 13, color: couleurs.sourd, fontWeight: "600", flexShrink: 1 },
  feuille: { padding: PAS * 6, gap: PAS * 4 },
  calcul: { gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte },
  bouton: { minHeight: CIBLE + 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.ville, alignItems: "center", justifyContent: "center" },
  boutonTexte: { color: couleurs.blanc, fontSize: 17, fontWeight: "700" },
  fermer: { minHeight: CIBLE, alignItems: "center", justifyContent: "center" },
});
