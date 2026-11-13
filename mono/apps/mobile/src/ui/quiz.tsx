/* LE QUIZ CIVIQUE SUR UN SEUL ÉCRAN (13/11/2026, décision du porteur ; première version le 12/11/2026).
 *
 * Une définition en grand, quatre mots en cartes empilées, une seule juste. Tout tient sur un écran de téléphone :
 * la question, les quatre cartes, le retour et « Question suivante » ont chacun une place réservée, rien ne saute.
 * Une manche fait cinq questions.
 *
 * Règles du produit tenues ici :
 *   - le vocabulaire institutionnel seulement (lib/quiz : aucun sigle de groupe, aucune opinion) ;
 *   - la série et le résultat de la manche vivent en mémoire, le temps de l'écran : aucune clé de stockage
 *     (invariant 2), aucune comparaison entre joueurs, aucun partage, aucun son (invariant 6 : rien ici ne touche
 *     à un vote ou à une opinion) ;
 *   - vert et rouge du quiz (palette.ts, ADR 0009) : réservés au quiz, distincts des couleurs de vote, et jamais
 *     seuls : une coche ou une croix, et « Juste » ou « Faux » en toutes lettres ;
 *   - mouvement réduit : pas de transition. */
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GLOSSAIRE } from "@repere/core";
import { mancheDuQuiz, TAILLE_MANCHE, type EntreeQuiz, type QuestionQuiz } from "../lib/quiz";
import { COULEURS_QUIZ } from "../lib/palette";
import { ACCENTS, CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { useMouvementReduit } from "./mouvement";

/* La définition est « en gros » : la taille descend d'un cran quand elle est longue, pour tenir sans défiler. */
const tailleEnonce = (n: number) => (n <= 80 ? 26 : n <= 130 ? 23 : n <= 170 ? 21 : 19);
const pluriel = (n: number) => `${n} réponse${n > 1 ? "s" : ""} juste${n > 1 ? "s" : ""}`;

export function Quiz({ categorieDe }: { categorieDe: (cle: string) => string }) {
  const entrees = useMemo<EntreeQuiz[]>(() => Object.entries(GLOSSAIRE as Record<string, { titre: string; corps: string }>)
    .map(([cle, m]) => ({ cle, titre: m.titre, corps: m.corps, categorie: categorieDe(cle) })), [categorieDe]);
  /* Un tirage au hasard à chaque manche. */
  const [manche, setManche] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const questions = useMemo<QuestionQuiz[]>(() => mancheDuQuiz(entrees), [entrees, manche]);
  const [rang, setRang] = useState(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [serie, setSerie] = useState(0);
  const [justes, setJustes] = useState(0);
  const [fini, setFini] = useState(false);
  const reduit = useMouvementReduit();
  const marges = useSafeAreaInsets();
  const entree = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(1)).current;

  /* Transition entre deux questions : un fondu et une montée de 12 px, 220 ms. */
  useEffect(() => {
    if (reduit) { entree.setValue(1); return; }
    entree.setValue(0);
    Animated.timing(entree, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [rang, manche, fini, reduit, entree]);

  const total = questions.length;
  const q = questions[rang];
  const cadre = { flexGrow: 1, paddingHorizontal: PAS * 5, paddingTop: PAS * 3, paddingBottom: marges.bottom + PAS * 4, gap: PAS * 4, maxWidth: 560, width: "100%" as const, alignSelf: "center" as const };
  if (!q) return <View style={cadre}><Text style={TYPO.note}>Le quiz n'a pas de question à poser pour le moment.</Text></View>;

  const repondu = choix !== null;
  const juste = repondu && q.propositions[choix as number].juste;
  const derniere = rang + 1 >= total;

  const repondre = (i: number) => {
    if (repondu) return;
    setChoix(i);
    if (q.propositions[i].juste) {
      setSerie(s => s + 1); setJustes(j => j + 1);
      if (!reduit) { pop.setValue(1.35); Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: false }).start(); }
    } else setSerie(0);
  };
  const suivante = () => { setChoix(null); if (derniere) setFini(true); else setRang(r => r + 1); };
  const rejouer = () => { setFini(false); setRang(0); setChoix(null); setJustes(0); setManche(m => m + 1); };

  const bouton = (texte: string, action: () => void) => (
    <Pressable onPress={action} accessibilityRole="button" accessibilityLabel={texte}
      style={({ pressed }) => ({ minHeight: CIBLE + 8, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center", backgroundColor: ACCENTS.autorite, opacity: pressed ? 0.8 : 1 })}>
      <Text style={{ fontSize: 17, fontFamily: POLICE.section, color: ACCENTS.surAutorite }}>{texte}</Text>
    </Pressable>
  );

  /* En-tête : la progression de la manche et la série en cours. */
  const faites = fini ? total : rang + (repondu ? 1 : 0);
  const enTete = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
      <View accessible accessibilityRole="progressbar" accessibilityLabel={fini ? "Manche terminée" : `Question ${rang + 1} sur ${total}`}
        accessibilityValue={{ min: 0, max: total, now: faites }}
        style={{ flex: 1, height: 12, borderRadius: 6, backgroundColor: couleurs.voile, overflow: "hidden" }}>
        <View style={{ height: 12, borderRadius: 6, width: `${Math.round((faites / total) * 100)}%`, backgroundColor: couleurs.encre }} />
      </View>
      <Text style={[TYPO.donnee, { fontFamily: POLICE.donneeForte, color: couleurs.encre }]} testID="quiz-rang">{fini ? total : rang + 1}/{total}</Text>
      {/* La série : réponses justes d'affilée, remise à zéro à la première erreur. Jamais enregistrée ni partagée. */}
      <View accessible accessibilityLiveRegion="polite"
        accessibilityLabel={serie ? `Série : ${pluriel(serie)} d'affilée` : "Série : aucune réponse juste d'affilée pour l'instant"}
        style={{ flexDirection: "row", alignItems: "center", gap: PAS, minHeight: 32, paddingHorizontal: PAS * 3, borderRadius: RAYON.pastille, backgroundColor: couleurs.voile }}>
        <Animated.View style={{ transform: [{ scale: pop }] }}>
          <Ionicons name={serie ? "flame" : "flame-outline"} size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
        </Animated.View>
        <Text testID="quiz-serie" style={[TYPO.donnee, { fontFamily: POLICE.donneeForte, color: couleurs.encre }]}>{serie}</Text>
      </View>
    </View>
  );

  if (fini) {
    return (
      <ScrollView contentContainerStyle={cadre} alwaysBounceVertical={false}>
        {enTete}
        <Animated.View style={{ flex: 1, justifyContent: "center", gap: PAS * 3, opacity: entree }}>
          <Text style={TYPO.etiquette}>Manche terminée</Text>
          <Text style={TYPO.affiche} accessibilityRole="header">{pluriel(justes)} sur {total}</Text>
          <Text style={TYPO.corps}>{serie > 1 ? `Série en cours : ${pluriel(serie)} d'affilée. Elle continue à la manche suivante. ` : ""}Ce résultat reste sur cet écran : il n'est ni enregistré ni partagé.</Text>
        </Animated.View>
        <View style={{ gap: PAS * 2 }}>
          {bouton("Nouvelle manche", rejouer)}
          <Pressable onPress={() => router.push("/dictionnaire")} accessibilityRole="link" accessibilityLabel="Ouvrir le dictionnaire citoyen"
            style={({ pressed }) => ({ minHeight: CIBLE, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
            <Text style={[TYPO.note, { textDecorationLine: "underline" }]}>Ouvrir le dictionnaire citoyen</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const bonne = q.propositions.find(p => p.juste)!;
  return (
    <ScrollView contentContainerStyle={cadre} alwaysBounceVertical={false}>
      {enTete}
      <Animated.View key={`${manche}-${rang}`} style={{ flex: 1, gap: PAS * 4, opacity: entree, transform: [{ translateY: entree.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <View style={{ flex: 1, justifyContent: "center", gap: PAS * 2, minHeight: 120 }}>
          <Text style={TYPO.etiquette}>Quel mot correspond à cette définition ?</Text>
          <Text accessibilityRole="header" testID="quiz-enonce"
            style={{ fontFamily: POLICE.affiche, color: couleurs.encre, letterSpacing: -0.3, fontSize: tailleEnonce(q.enonce.length), lineHeight: Math.round(tailleEnonce(q.enonce.length) * 1.28) }}>{q.enonce}</Text>
        </View>

        <View accessibilityRole="radiogroup" style={{ gap: PAS * 2.5 }}>
          {q.propositions.map((p, i) => {
            const estChoix = choix === i;
            const etat = !repondu ? "attente" : p.juste ? "juste" : estChoix ? "faux" : "autre";
            const plein = etat === "juste" || etat === "faux";
            const fond = etat === "juste" ? COULEURS_QUIZ.juste : etat === "faux" ? COULEURS_QUIZ.faux : couleurs.carte;
            const encre = plein ? COULEURS_QUIZ.texte : couleurs.encre;
            return (
              <Pressable key={p.cle} onPress={() => repondre(i)} disabled={repondu} accessibilityRole="radio" testID={`quiz-carte-${etat}`}
                accessibilityState={{ selected: estChoix, disabled: repondu }}
                accessibilityLabel={`${p.texte}${etat === "juste" ? (estChoix ? ". Juste." : ". C'était le mot juste.") : etat === "faux" ? ". Faux." : ""}`}
                style={({ pressed }) => ({ minHeight: CIBLE + 12, flexDirection: "row", alignItems: "center", gap: PAS * 3, paddingVertical: PAS * 2, paddingHorizontal: PAS * 4,
                  borderRadius: RAYON.bloc, backgroundColor: fond, borderWidth: 1, borderColor: plein ? fond : couleurs.trait,
                  opacity: etat === "autre" ? 0.5 : pressed ? 0.75 : 1, transform: [{ scale: pressed && !repondu ? 0.985 : 1 }] })}>
                <Text style={{ flex: 1, fontFamily: POLICE.titre, fontSize: 17, lineHeight: 22, color: encre }}>{p.texte}</Text>
                {plein ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: PAS }}>
                    <Text style={{ fontFamily: POLICE.texteGras, fontSize: 14, color: encre }}>{etat === "juste" ? "Juste" : "Faux"}</Text>
                    <Ionicons name={etat === "juste" ? "checkmark-circle" : "close-circle"} size={22} color={encre} accessible={false} importantForAccessibility="no" />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {/* Place réservée : le retour et « Question suivante » n'apparaissent qu'après la réponse, sans rien déplacer. */}
      <View style={{ minHeight: CIBLE + 8 + 28, gap: PAS * 2, justifyContent: "flex-end" }}>
        <Text style={[TYPO.note, { color: couleurs.encre, minHeight: 20 }]} accessibilityLiveRegion="polite" numberOfLines={2} testID="quiz-retour">
          {!repondu ? "" : juste ? "Juste." : `Pas tout à fait : c'était « ${bonne.titre} ».`}
        </Text>
        {repondu ? bouton(derniere ? "Voir le résultat" : "Question suivante", suivante) : <View style={{ minHeight: CIBLE + 8 }} />}
      </View>
    </ScrollView>
  );
}
