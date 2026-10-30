/* LE REGLAGE D'AFFICHAGE : une roue dans l'en-tete, qui ouvre trois choix
 * (systeme, clair, sombre). La roue est blanche sur une pastille sombre fixe :
 * elle reste visible en clair comme en sombre. */
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { CIBLE, PAS, RAYON, TYPO, couleurs, feuille, type ChoixTheme } from "../lib/theme";
import { NEUTRES_PAR_MODE, VOILE_MODAL } from "../lib/palette";
import { useTheme } from "../lib/themeChoix";

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
      <Pressable style={s.voile} onPress={onFermer} accessibilityLabel="Fermer les réglages">
        <View style={s.carte}>
          <Text style={TYPO.corps}>Affichage</Text>
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
        </View>
      </Pressable>
    </Modal>
  );
}

const s = feuille(() => StyleSheet.create({
  roue: { minWidth: CIBLE, minHeight: CIBLE, borderRadius: CIBLE / 2, backgroundColor: NEUTRES_PAR_MODE.clair.encre, alignItems: "center", justifyContent: "center", marginRight: PAS * 2 },
  glyphe: { color: NEUTRES_PAR_MODE.clair.blanc, fontSize: 22, lineHeight: 26 },
  voile: { flex: 1, backgroundColor: VOILE_MODAL, justifyContent: "center", padding: PAS * 5 },
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 4, gap: PAS * 2 },
  option: { minHeight: CIBLE, borderRadius: RAYON.bloc, borderWidth: 1, borderColor: couleurs.trait, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 4 },
  optionActive: { backgroundColor: couleurs.encre, borderColor: couleurs.encre },
  optionTexte: { color: couleurs.encre, fontSize: 17, fontWeight: "700" },
  optionTexteActif: { color: couleurs.sol },
}));
