/* BIENVENUE — une seule question, facultative : le prénom (13/11/2026, décision du porteur, ADR 0009).
 *
 * Remplace les trois questions de l'ancien accueil (taille du texte, sujets) : ces réglages restent à un geste, dans
 * « Confort de lecture » et « Pour vous ». Affiché une fois, quand aucun profil n'est gardé sur l'appareil.
 * « C'est parti » garde le prénom (s'il y en a un) dans repere.profil ; « Passer » n'en garde aucun. Les deux gardent
 * les réglages par défaut. Le prénom reste sur l'appareil : il n'est jamais transmis (invariant 2). */
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { nettoyerPrenom, PRENOM_MAX, PROFIL_DEFAUT } from "@repere/core";
import { useSelection } from "../lib/selection";
import { MODE_INITIAL, useProfil } from "../lib/profil";
import { CIBLE, couleurs, PAS, POLICE, RAYON, TYPO, ACCENTS } from "../lib/theme";
import { enfonce, useApparition } from "../ui/mouvement";
import { Animated } from "react-native";
import { Logo } from "../ui/logo";

export default function Bienvenue() {
  const { choix } = useSelection();
  const { enregistrer } = useProfil();
  const marges = useSafeAreaInsets();
  const [saisie, setSaisie] = useState("");
  const apparition = useApparition();
  const prenom = nettoyerPrenom(saisie);
  /* Une saisie non vide que la règle refuse (chiffres, signes) : on le dit, on ne la garde pas en silence. */
  const refuse = saisie.trim().length > 0 && !prenom;

  const suite = (p: string) => {
    enregistrer({ ...PROFIL_DEFAUT, mode: MODE_INITIAL, prenom: p } as Parameters<typeof enregistrer>[0]);
    router.replace(choix ? "/chez-vous" : "/");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: couleurs.sol }}>
      <Stack.Screen options={{ title: "Bienvenue", headerShown: false }} />
      <Animated.View style={{ flex: 1, paddingHorizontal: PAS * 6, paddingTop: marges.top + PAS * 6, paddingBottom: marges.bottom + PAS * 6, justifyContent: "center", gap: PAS * 6,
        maxWidth: 520, width: "100%", alignSelf: "center", opacity: apparition, transform: [{ translateY: apparition.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <View style={{ alignItems: "center", gap: PAS * 5 }}>
          <Logo size={64} />
          <Text style={[TYPO.affiche, { textAlign: "center" }]} accessibilityRole="header">Bienvenue sur Repère.</Text>
          <Text style={[TYPO.corps, { textAlign: "center", fontSize: 18, lineHeight: 26 }]} nativeID="question-prenom">Comment souhaitez-vous qu'on vous appelle ?</Text>
        </View>
        <View style={{ gap: PAS * 2 }}>
          <TextInput value={saisie} onChangeText={setSaisie} maxLength={PRENOM_MAX} autoCapitalize="words" autoCorrect={false} autoComplete="given-name"
            returnKeyType="done" onSubmitEditing={() => suite(prenom)} placeholder="Votre prénom" placeholderTextColor={couleurs.sourd}
            accessibilityLabel="Votre prénom, facultatif"
            style={{ minHeight: CIBLE + 12, borderRadius: RAYON.bloc, borderWidth: 1, borderColor: refuse ? couleurs.encre : couleurs.trait, backgroundColor: couleurs.carte,
              paddingHorizontal: PAS * 5, fontSize: 20, fontFamily: POLICE.titre, color: couleurs.encre, textAlign: "center" }} />
          <Text style={[TYPO.note, { textAlign: "center" }]} accessibilityLiveRegion="polite">
            {refuse ? "Un prénom : des lettres, un espace ou un trait d'union. Il ne sera pas gardé tel quel." : "Facultatif. Il reste sur cet appareil et n'est jamais envoyé."}
          </Text>
        </View>
        <View style={{ gap: PAS * 2 }}>
          <Pressable onPress={() => suite(prenom)} accessibilityRole="button" accessibilityLabel="C'est parti"
            style={({ pressed }) => ({ minHeight: CIBLE + 8, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center", backgroundColor: ACCENTS.autorite, ...enfonce(pressed) })}>
            <Text style={{ fontSize: 18, fontFamily: POLICE.section, color: ACCENTS.surAutorite }}>C'est parti</Text>
          </Pressable>
          <Pressable onPress={() => suite("")} accessibilityRole="button" accessibilityLabel="Passer, sans donner de prénom"
            style={({ pressed }) => ({ minHeight: CIBLE, alignItems: "center", justifyContent: "center", ...enfonce(pressed) })}>
            <Text style={[TYPO.note, { color: couleurs.sourd, textDecorationLine: "underline" }]}>Passer</Text>
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
