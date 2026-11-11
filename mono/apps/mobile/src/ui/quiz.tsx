/* LE QUIZ DU DICTIONNAIRE CITOYEN (12/11/2026, décision du porteur) : quatre propositions, une seule juste.
 *
 * Règles du produit tenues ici :
 *   - le vocabulaire institutionnel seulement (lib/quiz : aucun sigle de groupe, aucune opinion) ;
 *   - la série (« 3 réponses justes d'affilée ») vit en mémoire, le temps de l'écran : aucune clé de stockage
 *     (invariant 2), aucune comparaison entre joueurs, aucun partage de score, aucun son (invariant 6) ;
 *   - le retour n'est pas vert : l'émeraude est réservée aux votes (invariant 7). La juste réponse est dite en
 *     toutes lettres (« Juste. »), marquée d'une coche et d'un trait épais ; l'autre, d'une explication neutre ;
 *   - la définition complète est celle du dictionnaire (rédaction Repère, d'après les textes officiels) ;
 *   - mouvement réduit : pas de transition. */
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { GLOSSAIRE } from "@repere/core";
import { sessionDuQuiz, type EntreeQuiz, type QuestionQuiz } from "../lib/quiz";
import { CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { useMouvementReduit } from "./mouvement";

const LETTRES = ["A", "B", "C", "D"];

export function Quiz({ categorieDe }: { categorieDe: (cle: string) => string }) {
  const entrees = useMemo<EntreeQuiz[]>(() => Object.entries(GLOSSAIRE as Record<string, { titre: string; corps: string }>)
    .map(([cle, m]) => ({ cle, titre: m.titre, corps: m.corps, categorie: categorieDe(cle) })), [categorieDe]);
  /* Un ordre aléatoire à chaque ouverture ; quand toutes les questions sont passées, un nouvel ordre. */
  const [tour, setTour] = useState(0);
  const questions = useMemo<QuestionQuiz[]>(() => sessionDuQuiz(entrees), [entrees, tour]);
  const [rang, setRang] = useState(0);
  const [choix, setChoix] = useState<number | null>(null);
  const [serie, setSerie] = useState(0);
  const reduit = useMouvementReduit();
  const entree = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(1)).current;

  const q = questions[rang];
  /* Transition entre deux questions : un fondu et une montée de 12 px, 220 ms. */
  useEffect(() => {
    if (reduit) { entree.setValue(1); return; }
    entree.setValue(0);
    Animated.timing(entree, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [rang, tour, reduit, entree]);

  if (!q) return <Text style={TYPO.note}>Le quiz n'a pas de question à poser pour le moment.</Text>;

  const repondu = choix !== null;
  const juste = repondu && q.propositions[choix as number].juste;
  const choisie = repondu ? q.propositions[choix as number] : null;
  const bonne = q.propositions.find(p => p.juste)!;

  const repondre = (i: number) => {
    if (repondu) return;
    setChoix(i);
    if (q.propositions[i].juste) {
      setSerie(s => s + 1);
      if (!reduit) { pop.setValue(1.25); Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: false }).start(); }
    } else setSerie(0);
  };
  const suivante = () => {
    setChoix(null);
    if (rang + 1 >= questions.length) { setRang(0); setTour(t => t + 1); } else setRang(r => r + 1);
  };

  return (
    <View style={{ gap: PAS * 4 }}>
      {/* La série : un compteur discret, remis à zéro à la première erreur. Jamais enregistré ni partagé. */}
      <View accessible accessibilityLiveRegion="polite"
        accessibilityLabel={serie ? `${serie} réponse${serie > 1 ? "s" : ""} juste${serie > 1 ? "s" : ""} d'affilée` : "Aucune réponse juste d'affilée pour l'instant"}
        style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, alignSelf: "flex-start", minHeight: 36, paddingHorizontal: PAS * 4, borderRadius: RAYON.pastille, backgroundColor: couleurs.voile }}>
        <Ionicons name="flame-outline" size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
        <Animated.Text style={[TYPO.corps, { fontFamily: POLICE.texteGras, transform: [{ scale: pop }] }]}>
          {serie ? `${serie} réponse${serie > 1 ? "s" : ""} juste${serie > 1 ? "s" : ""} d'affilée` : "Série : à vous de jouer"}
        </Animated.Text>
      </View>

      <Animated.View key={`${tour}-${rang}`} style={{ gap: PAS * 4, opacity: entree, transform: [{ translateY: entree.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
        <View style={{ gap: PAS * 2, padding: PAS * 6, borderRadius: RAYON.carte + 4, backgroundColor: couleurs.carte }}>
          <Text style={TYPO.etiquette}>Question {rang + 1} sur {questions.length}</Text>
          <Text style={TYPO.affiche} accessibilityRole="header">{q.enonce}</Text>
          <Text style={TYPO.note}>Une seule définition est la bonne.</Text>
        </View>

        <View accessibilityRole="radiogroup" style={{ gap: PAS * 3 }}>
          {q.propositions.map((p, i) => {
            const estChoix = choix === i;
            const aMontrer = repondu && p.juste;
            return (
              <Pressable key={p.cle} onPress={() => repondre(i)} disabled={repondu} accessibilityRole="radio"
                accessibilityState={{ selected: estChoix, disabled: repondu }}
                accessibilityLabel={`Proposition ${LETTRES[i]} : ${p.texte}${repondu ? (p.juste ? ". Juste." : estChoix ? ". Votre choix." : "") : ""}`}
                style={({ pressed }) => ({ minHeight: CIBLE + 8, flexDirection: "row", alignItems: "center", gap: PAS * 3, padding: PAS * 4,
                  borderRadius: RAYON.bloc, backgroundColor: couleurs.carte,
                  borderWidth: aMontrer ? 3 : estChoix ? 2 : 1, borderColor: aMontrer || estChoix ? couleurs.encre : couleurs.trait,
                  opacity: repondu && !aMontrer && !estChoix ? 0.55 : pressed ? 0.75 : 1,
                  transform: [{ scale: pressed && !repondu ? 0.985 : 1 }] })}>
                <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
                  backgroundColor: aMontrer ? couleurs.encre : couleurs.voile }}>
                  {aMontrer ? <Ionicons name="checkmark" size={18} color={couleurs.sol} accessible={false} importantForAccessibility="no" />
                    : repondu && estChoix ? <Ionicons name="close" size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
                    : <Text style={[TYPO.donnee, { color: couleurs.encre, fontFamily: POLICE.texteGras }]}>{LETTRES[i]}</Text>}
                </View>
                <Text style={[TYPO.corps, { flex: 1 }]}>{p.texte}</Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      {repondu ? (
        <View accessibilityLiveRegion="polite" style={{ gap: PAS * 3, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte, borderWidth: 2, borderColor: juste ? couleurs.encre : couleurs.trait }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
            <Ionicons name={juste ? "checkmark-circle" : "information-circle-outline"} size={24} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
            <Text style={TYPO.reponse} accessibilityRole="header">{juste ? "Juste." : "Pas tout à fait."}</Text>
          </View>
          {!juste && choisie ? (
            <Text style={TYPO.corps}>Ce que vous avez choisi définit « {choisie.titre} », pas « {q.titre} ».</Text>
          ) : null}
          <Text style={TYPO.etiquette}>{q.titre}</Text>
          <Text style={TYPO.corps}>{q.explication}</Text>
          <Pressable onPress={() => router.push("/sources")} accessibilityRole="link" accessibilityLabel="Les sources de Repère"
            style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 1.5, opacity: pressed ? 0.7 : 1 })}>
            <Ionicons name="link-outline" size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
            <Text style={[TYPO.micro, { flex: 1 }]}>Définition rédigée par Repère d'après les textes officiels · Les sources</Text>
          </Pressable>
          <Pressable onPress={suivante} accessibilityRole="button" accessibilityLabel="Question suivante"
            style={({ pressed }) => ({ minHeight: CIBLE + 4, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center", backgroundColor: couleurs.encre, opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ fontSize: 17, fontFamily: POLICE.section, color: couleurs.sol }}>Question suivante</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
