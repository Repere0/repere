/* BIENVENUE — TROIS ÉCRANS (13/11/2026, décision du porteur ; première version le même jour, ADR 0009).
 *
 * 1. le logo, et « Continuer » ;
 * 2. le prénom, facultatif, et « Continuer » / « Passer » ;
 * 3. ce que Repère ne fait pas : zéro traceur, pas de compte, pas d'adresse e-mail.
 *
 * POURQUOI UN BOUTON SUR LE PREMIER ÉCRAN. Le voile de démarrage (ui/demarrage.tsx) part tout seul et garde
 * son filet de sécurité : il n'est PAS cet écran-ci. Ici, le lecteur décide quand avancer — rien ne dépend
 * d'une animation, donc rien ne peut rester bloqué, sur iOS comme ailleurs.
 *
 * AFFICHÉ UNE SEULE FOIS : dès qu'un profil est gardé sur l'appareil, l'accueil ne passe plus par ici.
 * Le prénom reste sur l'appareil : il n'est jamais transmis (invariant 2). Ce qui n'est pas un prénom
 * (chiffres, balises, plus de 24 caractères) n'est pas gardé, et c'est dit plutôt que corrigé en silence. */
import { useState } from "react";
import { Animated, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { nettoyerPrenom, PRENOM_MAX, PROFIL_DEFAUT } from "@repere/core";
import { useSelection } from "../lib/selection";
import { MODE_INITIAL, useProfil } from "../lib/profil";
import { ACCENTS, CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { enfonce, useApparition } from "../ui/mouvement";
import { Logo } from "../ui/logo";

/* Ce que Repère ne fait pas. Chaque ligne est vérifiable dans l'application : aucune promesse en l'air. */
const VALEURS: { icone: keyof typeof Ionicons.glyphMap; titre: string; corps: string }[] = [
  { icone: "eye-off-outline", titre: "Zéro traceur", corps: "Aucun cookie publicitaire, aucune mesure d'audience. Personne ne sait que vous êtes là." },
  { icone: "person-outline", titre: "Pas de compte", corps: "Aucune adresse e-mail, aucun numéro de téléphone, aucun mot de passe ne vous est demandé." },
  { icone: "document-text-outline", titre: "Des faits, leurs sources", corps: "Chaque chiffre porte son producteur et sa date. Aucune opinion, aucun jugement." },
];

export default function Bienvenue() {
  const { choix } = useSelection();
  const { enregistrer } = useProfil();
  const marges = useSafeAreaInsets();
  const [etape, setEtape] = useState(0);
  const [saisie, setSaisie] = useState("");
  const apparition = useApparition();
  const prenom = nettoyerPrenom(saisie);
  /* Une saisie non vide que la règle refuse (chiffres, signes) : on le dit, on ne la garde pas en silence. */
  const refuse = saisie.trim().length > 0 && !prenom;

  const terminer = (p: string) => {
    enregistrer({ ...PROFIL_DEFAUT, mode: MODE_INITIAL, prenom: p } as Parameters<typeof enregistrer>[0]);
    router.replace(choix ? "/chez-vous" : "/");
  };

  const bouton = (texte: string, action: () => void, id?: string) => (
    <Pressable onPress={action} accessibilityRole="button" accessibilityLabel={texte} testID={id}
      style={({ pressed }) => ({ minHeight: CIBLE + 8, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center", backgroundColor: ACCENTS.autorite, ...enfonce(pressed) })}>
      <Text style={{ fontSize: 18, fontFamily: POLICE.section, color: ACCENTS.surAutorite }}>{texte}</Text>
    </Pressable>
  );
  const discret = (texte: string, etiquette: string, action: () => void) => (
    <Pressable onPress={action} accessibilityRole="button" accessibilityLabel={etiquette}
      style={({ pressed }) => ({ minHeight: CIBLE, alignItems: "center", justifyContent: "center", ...enfonce(pressed) })}>
      <Text style={[TYPO.note, { color: couleurs.sourd, fontFamily: POLICE.texteGras }]}>{texte}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: couleurs.sol }}>
      <Stack.Screen options={{ title: "Bienvenue", headerShown: false }} />
      <Animated.View testID={`bienvenue-${etape}`} style={{ flex: 1, paddingHorizontal: PAS * 6, paddingTop: marges.top + PAS * 6, paddingBottom: marges.bottom + PAS * 6,
        justifyContent: "center", gap: PAS * 6, maxWidth: 520, width: "100%", alignSelf: "center",
        opacity: apparition, transform: [{ translateY: apparition.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>

        {etape === 0 ? (
          <>
            <View style={{ alignItems: "center", gap: PAS * 5 }}>
              <Logo size={96} />
              <Text style={[TYPO.affiche, { textAlign: "center" }]} accessibilityRole="header">Repère</Text>
              <Text style={[TYPO.corps, { textAlign: "center", fontSize: 18, lineHeight: 26 }]}>
                Qui décide chez vous, et où va votre argent. Deux questions, des réponses sourcées.
              </Text>
            </View>
            {bouton("Continuer", () => setEtape(1), "continuer-0")}
          </>
        ) : null}

        {etape === 1 ? (
          <>
            <View style={{ alignItems: "center", gap: PAS * 4 }}>
              <Text style={[TYPO.affiche, { textAlign: "center" }]} accessibilityRole="header">Comment souhaitez-vous qu'on vous appelle ?</Text>
            </View>
            <View style={{ gap: PAS * 2 }}>
              <TextInput value={saisie} onChangeText={setSaisie} maxLength={PRENOM_MAX} autoCapitalize="words" autoCorrect={false} autoComplete="given-name"
                returnKeyType="done" onSubmitEditing={() => setEtape(2)} placeholder="Votre prénom" placeholderTextColor={couleurs.sourd}
                accessibilityLabel="Votre prénom, facultatif"
                style={{ minHeight: CIBLE + 12, borderRadius: RAYON.bloc, borderWidth: 1, borderColor: refuse ? couleurs.encre : couleurs.trait, backgroundColor: couleurs.carte,
                  paddingHorizontal: PAS * 5, fontSize: 20, fontFamily: POLICE.titre, color: couleurs.encre, textAlign: "center" }} />
              <Text style={[TYPO.note, { textAlign: "center" }]} accessibilityLiveRegion="polite">
                {refuse ? "Un prénom : des lettres, un espace ou un trait d'union. Il ne sera pas gardé tel quel." : "Facultatif. Il reste sur cet appareil et n'est jamais envoyé."}
              </Text>
            </View>
            <View style={{ gap: PAS * 2 }}>
              {bouton("Continuer", () => setEtape(2), "continuer-1")}
              {discret("Passer", "Passer, sans donner de prénom", () => { setSaisie(""); setEtape(2); })}
            </View>
          </>
        ) : null}

        {etape === 2 ? (
          <>
            <View style={{ gap: PAS * 5 }}>
              <Text style={[TYPO.affiche, { textAlign: "center" }]} accessibilityRole="header">Ce que Repère ne fait pas</Text>
              <View style={{ gap: PAS * 4 }}>
                {VALEURS.map(v => (
                  <View key={v.titre} style={{ flexDirection: "row", gap: PAS * 4, alignItems: "flex-start" }}>
                    <Ionicons name={v.icone} size={24} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{v.titre}</Text>
                      <Text style={TYPO.note}>{v.corps}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ gap: PAS * 2 }}>
              {bouton(prenom ? `C'est parti, ${prenom}` : "C'est parti", () => terminer(prenom), "continuer-2")}
              {discret("Confidentialité", "Lire la page Confidentialité", () => router.push("/confidentialite"))}
            </View>
          </>
        ) : null}
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
