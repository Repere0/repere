/* LE REGLAGE D'AFFICHAGE : une roue dans l'en-tete, qui ouvre trois choix
 * (systeme, clair, sombre). V34 bloc 7 (audit) : la roue est un contour qui suit le thème, sans
 * pastille noire : elle ne rivalise plus avec le titre de l'écran, et la cible reste de 48 px. */
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { CIBLE, PAS, RAYON, TYPO, couleurs, feuille, type ChoixTheme } from "../lib/theme";
import { VOILE_MODAL } from "../lib/palette";
import { useTheme } from "../lib/themeChoix";
import { router } from "expo-router";

const OPTIONS: { valeur: ChoixTheme; libelle: string }[] = [
  { valeur: "systeme", libelle: "Système" },
  { valeur: "clair", libelle: "Clair" },
  { valeur: "sombre", libelle: "Sombre" },
];

export function BoutonReglages() {
  const [ouvert, setOuvert] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOuvert(true)}
        accessibilityRole="button"
        accessibilityLabel="Réglages de l'affichage"
        style={({ pressed }) => [s.roue, pressed && { opacity: 0.7 }]}
      >
        <Text accessibilityElementsHidden importantForAccessibility="no" allowFontScaling={false} style={s.glyphe}>{"⚙︎"}</Text>
      </Pressable>
      <ChoixAffichage visible={ouvert} onFermer={() => setOuvert(false)} />
    </>
  );
}

function ChoixAffichage({ visible, onFermer }: { visible: boolean; onFermer: () => void }) {
  const { choix, setChoix } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFermer}>
      <Pressable style={s.voile} onPress={onFermer} accessibilityRole="button" accessibilityLabel="Fermer les réglages">
        <View style={s.carte} accessibilityViewIsModal>
          <Text style={TYPO.corps} accessibilityRole="header">Affichage</Text>
          {OPTIONS.map(o => {
            const actif = choix === o.valeur;
            return (
              <Pressable
                key={o.valeur}
                onPress={() => { setChoix(o.valeur); onFermer(); }}
                accessibilityRole="radio"
                accessibilityState={{ checked: actif }}
                style={({ pressed }) => [s.option, actif && s.optionActive, pressed && { opacity: 0.7 }]}
              >
                <Text style={[s.optionTexte, actif && s.optionTexteActif]}>{o.libelle}</Text>
              </Pressable>
            );
          })}
          <View style={{ height: 1, backgroundColor: couleurs.trait, marginVertical: PAS }} />
          <Pressable
            onPress={() => { onFermer(); router.push("/confidentialite"); }}
            accessibilityRole="link"
            style={({ pressed }) => [s.option, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.optionTexte}>Confidentialité</Text>
          </Pressable>
          <Pressable
            onPress={() => { onFermer(); router.push("/a-propos"); }}
            accessibilityRole="link"
            style={({ pressed }) => [s.option, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.optionTexte}>À propos</Text>
          </Pressable>
          <Pressable
            onPress={() => { onFermer(); router.push("/faq"); }}
            accessibilityRole="link"
            style={({ pressed }) => [s.option, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.optionTexte}>Questions fréquentes</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const s = feuille(() => StyleSheet.create({
  roue: { minWidth: CIBLE, minHeight: CIBLE, borderRadius: CIBLE / 2, borderWidth: 1.5, borderColor: couleurs.sourd, alignItems: "center", justifyContent: "center", marginRight: PAS * 2 },
  glyphe: { color: couleurs.encre, fontSize: 22, lineHeight: 26 },
  voile: { flex: 1, backgroundColor: VOILE_MODAL, justifyContent: "center", padding: PAS * 5 },
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 4, gap: PAS * 2 },
  option: { minHeight: CIBLE, borderRadius: RAYON.bloc, borderWidth: 1, borderColor: couleurs.trait, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 4 },
  optionActive: { backgroundColor: couleurs.encre, borderColor: couleurs.encre },
  optionTexte: { color: couleurs.encre, fontSize: 17, fontWeight: "500" },
  optionTexteActif: { color: couleurs.sol },
}));
