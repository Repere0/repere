/* LE REGLAGE D'AFFICHAGE : une roue dans l'en-tete, qui ouvre trois choix
 * (systeme, clair, sombre), puis les réglages de lecture et les pages d'information. V34 bloc 7 (audit) : la roue est un contour qui suit le thème, sans
 * pastille noire : elle ne rivalise plus avec le titre de l'écran, et la cible reste de 48 px. */
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CIBLE, PAS, RAYON, TYPO, couleurs, feuille, type ChoixTheme } from "../lib/theme";
import { VOILE_MODAL } from "../lib/palette";
import { useTheme } from "../lib/themeChoix";
import { router } from "expo-router";
import { enfonce } from "./mouvement";

const OPTIONS: { valeur: ChoixTheme; libelle: string }[] = [
  { valeur: "systeme", libelle: "Système" },
  { valeur: "clair", libelle: "Clair" },
  { valeur: "sombre", libelle: "Sombre" },
];

export function BoutonReglages() {
  const [ouvert, setOuvert] = useState(false);
  const { mode, setChoix } = useTheme();
  const versClair = mode === "sombre";
  return (
    <>
      {/* 12/11/2026 (porteur) : une bascule directe clair / sombre, visible sur tous les onglets. « Système » reste dans la roue. */}
      <Pressable
        onPress={() => setChoix(versClair ? "clair" : "sombre")}
        accessibilityRole="button"
        accessibilityLabel={versClair ? "Passer en mode clair" : "Passer en mode sombre"}
        style={({ pressed }) => [s.roue, pressed && enfonce(true)]}
      >
        <Ionicons name={versClair ? "sunny-outline" : "moon-outline"} size={22} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
      </Pressable>
      <Pressable
        onPress={() => setOuvert(true)}
        accessibilityRole="button"
        accessibilityLabel="Réglages de l'affichage"
        style={({ pressed }) => [s.roue, pressed && enfonce(true)]}
      >
        <Ionicons name="settings-outline" size={22} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
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
                style={({ pressed }) => [s.option, actif && s.optionActive, pressed && enfonce(true)]}
              >
                <Text style={[s.optionTexte, actif && s.optionTexteActif]}>{o.libelle}</Text>
              </Pressable>
            );
          })}
          <View style={{ height: 1, backgroundColor: couleurs.trait, marginVertical: PAS }} />
          {/* 11/11/2026 : la roue est le seul point d'entrée des réglages et des informations, sur tous les
              onglets. Le confort de lecture n'était atteignable que depuis l'ancien accueil. */}
          <Pressable
            onPress={() => { onFermer(); router.push("/confort-lecture"); }}
            accessibilityRole="link" accessibilityLabel="Confort de lecture"
            style={({ pressed }) => [s.option, pressed && enfonce(true)]}
          >
            <Text style={s.optionTexte}>Confort de lecture</Text>
          </Pressable>
          <Pressable
            onPress={() => { onFermer(); router.push("/confidentialite"); }}
            accessibilityRole="link"
            style={({ pressed }) => [s.option, pressed && enfonce(true)]}
          >
            <Text style={s.optionTexte}>Confidentialité</Text>
          </Pressable>
          {/* 13/11/2026 (porteur) : « Soutenir Repère ». Aucun paiement n'y est encaissé (voir l'écran). */}
          <Pressable
            onPress={() => { onFermer(); router.push("/soutenir"); }}
            accessibilityRole="link"
            style={({ pressed }) => [s.option, pressed && enfonce(true)]}
          >
            <Text style={s.optionTexte}>Soutenir Repère</Text>
          </Pressable>
          <Pressable
            onPress={() => { onFermer(); router.push("/a-propos"); }}
            accessibilityRole="link"
            style={({ pressed }) => [s.option, pressed && enfonce(true)]}
          >
            <Text style={s.optionTexte}>À propos</Text>
          </Pressable>
          <Pressable
            onPress={() => { onFermer(); router.push("/faq"); }}
            accessibilityRole="link"
            style={({ pressed }) => [s.option, pressed && enfonce(true)]}
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
  voile: { flex: 1, backgroundColor: VOILE_MODAL, justifyContent: "center", padding: PAS * 5 },
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 4, gap: PAS * 2 },
  option: { minHeight: CIBLE, borderRadius: RAYON.bloc, borderWidth: 1, borderColor: couleurs.trait, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 4 },
  optionActive: { backgroundColor: couleurs.encre, borderColor: couleurs.encre },
  optionTexte: { color: couleurs.encre, fontSize: 17, fontWeight: "500" },
  optionTexteActif: { color: couleurs.sol },
}));
