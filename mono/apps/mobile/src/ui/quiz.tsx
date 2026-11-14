/* LE QUIZ CIVIQUE SUR UN SEUL ÉCRAN (13/11/2026, décision du porteur ; première version le 12/11/2026).
 *
 * Une définition en grand, quatre mots en cartes empilées, une seule juste. Tout tient sur un écran de téléphone :
 * la question, les quatre cartes, le retour et « Question suivante » ont chacun une place réservée, rien ne saute.
 * Une manche fait cinq questions.
 *
 * Règles du produit tenues ici :
 *   - le vocabulaire institutionnel seulement (lib/quiz : aucun sigle de groupe, aucune opinion) ;
 *   - 13/11/2026 (ADR 0010, invariant 6 amendé) : POINTS ET RANGS. +10 par réponse juste, gardés dans
 *     repere.profil — pas de clé de stockage en plus (invariant 2), rien qui parte sur le réseau, aucun
 *     rang comparé entre lecteurs (Repère ne sait rien des autres). Cela ne porte QUE sur du vocabulaire
 *     institutionnel : jamais un vote, un élu, un parti, un territoire. C'est la limite de l'amendement ;
 *   - la série et le résultat de la manche vivent en mémoire, le temps de l'écran ;
 *   - vert et rouge du quiz (palette.ts, ADR 0009) : réservés au quiz, distincts des couleurs de vote, et jamais
 *     seuls : une coche ou une croix, et « Juste » ou « Faux » en toutes lettres ;
 *   - mouvement réduit : pas de transition. */
import { MARQUE_DEFILEMENT } from "../lib/defilement-ios";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GLOSSAIRE } from "@repere/core";
import { mancheDuQuiz, TAILLE_MANCHE, type EntreeQuiz, type QuestionQuiz } from "../lib/quiz";
import { POINTS_PAR_REPONSE_JUSTE, pointsAvantRangSuivant, RANGS, rangPour } from "@repere/core";
import { useProfil } from "../lib/profil";
import { PartagerCarte } from "./partage/bouton-partage";
import { QuizStory } from "./partage/variantes/quiz.story";
import { COULEURS_QUIZ } from "../lib/palette";
import { ACCENTS, CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { useMouvementReduit } from "./mouvement";

/* La définition est « en gros » : la taille descend d'un cran quand elle est longue, pour tenir sans défiler. */
const tailleEnonce = (n: number) => (n <= 80 ? 26 : n <= 130 ? 23 : n <= 170 ? 21 : 19);
const pluriel = (n: number) => `${n} réponse${n > 1 ? "s" : ""} juste${n > 1 ? "s" : ""}`;

/* LES RANGS EN ROADMAP VERTICALE (13/11/2026, refonte demandée par le porteur).
 *
 * Un fil continu, un jalon par rang, le rang atteint en plein et les suivants en gris. Ce ne sont pas
 * des places : ce sont des paliers de points, les mêmes pour tout le monde, et Repère ne sait rien des
 * autres lecteurs — il n'y a personne à qui se comparer.
 *
 * LES ICÔNES, à ma main (le porteur me laissait le choix) : bronze, argent et or auraient demandé
 * TROIS COULEURS NOUVELLES dans palette.ts, donc un amendement de l'invariant 7 que personne n'a
 * décidé. Les paliers se lisent donc à la forme et au remplissage — cercle vide, cercle plein, ruban,
 * trophée — et au texte, jamais à une couleur de métal. Un lecteur daltonien lit la même chose. */
const JALONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  neo: "ellipse-outline", apprenti: "leaf-outline", citoyen: "ellipse", initie: "book-outline", averti: "bulb-outline",
  eclaire: "sunny-outline", expert: "ribbon-outline", maitre: "ribbon", mentor: "star", sage: "trophy",
};

function LesRangs({ ouvert, fermer, points }: { ouvert: boolean; fermer: () => void; points: number }) {
  const atteint = rangPour(points);
  const rangAtteint = RANGS.indexOf(atteint);
  /* 14/11/2026 (porteur, iPhone) : le titre « Les rangs » passait sous l'encoche et la barre d'état. La modale couvre tout
     l'écran : elle prend elle-même les marges de sécurité, en haut (encoche) et en bas (barre d'accueil). */
  const marges = useSafeAreaInsets();
  return (
    <Modal visible={ouvert} animationType="slide" onRequestClose={fermer} transparent={false}>
      <ScrollView {...MARQUE_DEFILEMENT} style={{ backgroundColor: couleurs.sol }} contentContainerStyle={{ paddingHorizontal: PAS * 3, paddingTop: marges.top + PAS * 3, paddingBottom: marges.bottom + PAS * 3, gap: PAS * 2, maxWidth: 560, width: "100%", alignSelf: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
          <Text style={[TYPO.affiche, { flex: 1 }]} accessibilityRole="header">Les rangs</Text>
          <Pressable onPress={fermer} accessibilityRole="button" accessibilityLabel="Fermer la liste des rangs"
            style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
            <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>Fermer</Text>
          </Pressable>
        </View>
        <Text style={TYPO.note}>Dix points par réponse juste. Les mêmes paliers pour tout le monde.</Text>

        <View style={{ gap: 0 }}>
          {RANGS.map((r, i) => {
            const ici = i === rangAtteint;
            const passe = i < rangAtteint;
            const aVenir = i > rangAtteint;
            const teinte = aVenir ? couleurs.sourd : couleurs.encre;
            return (
              <View key={r.cle} style={{ flexDirection: "row", gap: PAS * 3, position: "relative" }} testID="rang-ligne"
                accessibilityLabel={`${r.nom}, ${r.max === null ? `${r.min} points et plus` : `de ${r.min} à ${r.max} points`}${ici ? ". Votre rang." : passe ? ". Franchi." : ". À venir."}`}>
                {/* LE FIL (14/11/2026, porteur, iPhone : les cercles et le trait se chevauchaient). Le trait ne dépend plus
                    de la mise en page : deux segments posés en absolu dans la ligne, DERRIÈRE le jalon (zIndex 0), qui
                    se rejoignent au centre du cercle. Le jalon, opaque et de taille fixe, est peint au-dessus (zIndex 1). */}
                {i > 0 ? (
                  <View testID="rang-fil" pointerEvents="none" style={{ position: "absolute", zIndex: 0, left: 15.5, top: 0, height: 16, width: 1,
                    backgroundColor: i <= rangAtteint + 1 ? couleurs.encre : couleurs.trait }} />
                ) : null}
                {i < RANGS.length - 1 ? (
                  <View testID="rang-fil" pointerEvents="none" style={{ position: "absolute", zIndex: 0, left: 15.5, top: 16, bottom: 0, width: 1,
                    backgroundColor: passe || ici ? couleurs.encre : couleurs.trait }} />
                ) : null}
                <View testID="rang-jalon" style={{ zIndex: 1, flexShrink: 0, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
                  backgroundColor: ici ? couleurs.encre : couleurs.carte, borderWidth: ici ? 0 : 1, borderColor: couleurs.trait }}>
                  <Ionicons name={JALONS[r.cle] || "ellipse-outline"} size={16} color={ici ? couleurs.sol : teinte}
                    accessible={false} importantForAccessibility="no" />
                </View>
                <View style={{ flex: 1, gap: 0, paddingBottom: PAS * 3, opacity: aVenir ? 0.55 : 1 }}>
                  <Text style={[TYPO.corps, { fontFamily: POLICE.titre, color: teinte }]}>
                    {r.nom}{ici ? " — votre rang" : ""}
                  </Text>
                  <Text style={[TYPO.note, { color: couleurs.sourd }]}>
                    {r.max === null ? `${r.min} points et plus` : `de ${r.min} à ${r.max} points`}
                  </Text>
                  {ici && r.max !== null ? (
                    <Text style={[TYPO.note, { color: couleurs.sourd }]}>Vous avez {points} points.</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
        <Text style={TYPO.micro}>100 % local, aucune donnée collectée.</Text>
      </ScrollView>
    </Modal>
  );
}

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
  const [rangsOuverts, setRangsOuverts] = useState(false);
  const { profil, modifier } = useProfil();
  const points = profil ? profil.points : 0;
  const monRang = rangPour(points);
  /* Le rang au DÉBUT de la manche : c'est ce qui permet de dire « vous avez changé de rang » à la fin,
     sans rien enregistrer de plus. */
  const [rangDepart] = useState(() => rangPour(profil ? profil.points : 0).cle);
  /* Le rang suivant, ou null au dernier : sert la barre de progression de fin de manche. */
  const suivant = RANGS[RANGS.indexOf(monRang) + 1] || null;
  const monte = useRef(new Animated.Value(0)).current;
  /* L'arrivee sur l'ecran de fin : le score grossit puis retombe. Rien de sonore, rien qui tourne. */
  const arrivee = useRef(new Animated.Value(1)).current;
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
      const avant = rangPour(points).cle;
      const apres = rangPour(points + POINTS_PAR_REPONSE_JUSTE);
      modifier({ points: points + POINTS_PAR_REPONSE_JUSTE });
      if (!reduit) {
        pop.setValue(1.35); Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: false }).start();
        /* Montée de rang : la pastille du rang grossit puis revient. Rien de sonore (invariant 6). */
        if (apres.cle !== avant) { monte.setValue(0); Animated.sequence([
          Animated.spring(monte, { toValue: 1, friction: 3, useNativeDriver: false }),
          Animated.timing(monte, { toValue: 0, duration: 900, useNativeDriver: false }),
        ]).start(); }
      }
    } else setSerie(0);
  };
  const suivante = () => {
    setChoix(null);
    if (!derniere) { setRang(r => r + 1); return; }
    setFini(true);
    if (!reduit) { arrivee.setValue(0.7); Animated.spring(arrivee, { toValue: 1, friction: 4, tension: 70, useNativeDriver: false }).start(); }
  };
  const rejouer = () => { setFini(false); setRang(0); setChoix(null); setJustes(0); setManche(m => m + 1); };

  const bouton = (texte: string, action: () => void, id?: string) => (
    <Pressable onPress={action} accessibilityRole="button" accessibilityLabel={texte} testID={id}
      style={({ pressed }) => ({ minHeight: CIBLE + 8, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center", backgroundColor: ACCENTS.autorite, opacity: pressed ? 0.8 : 1 })}>
      <Text style={{ fontSize: 17, fontFamily: POLICE.section, color: ACCENTS.surAutorite }}>{texte}</Text>
    </Pressable>
  );

  /* En-tête : la progression de la manche et la série en cours. */
  const faites = fini ? total : rang + (repondu ? 1 : 0);
  const enTete = (
    <View style={{ gap: PAS * 2 }}>
      {/* LE RANG, en haut (ADR 0010). Il ne se compare a personne : Repere ne sait rien des autres lecteurs. */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
        <Animated.View testID="quiz-rang-pastille"
          style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, paddingHorizontal: PAS * 4, minHeight: 36,
            borderRadius: RAYON.pastille, backgroundColor: couleurs.voile,
            transform: [{ scale: monte.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }}>
          <Ionicons name="ribbon-outline" size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
          <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]} testID="quiz-rang-nom">{monRang.nom}</Text>
        </Animated.View>
        <Text style={[TYPO.donnee, { color: couleurs.sourd, flex: 1, textAlign: "right" }]} testID="quiz-points">{points} pts</Text>
      </View>
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
    </View>
  );

  if (fini) {
    /* L'ÉCRAN DE FIN (13/11/2026, refonte demandée par le porteur : « trop textuel et triste »).
     * Le score en très gros, une phrase courte, la jauge vers le rang suivant, et « Nouvelle manche »
     * en bouton plein. Les couleurs sont celles DÉJÀ autorisées pour le quiz (palette.ts) : vert pour
     * un bon score, rouge pour un score faible, l'encre entre les deux. Pas d'orange : ce serait une
     * troisième couleur de quiz, donc un amendement de l'invariant 7, et il n'a pas été décidé. */
    const teinte = justes >= 4 ? COULEURS_QUIZ.juste : justes <= 1 ? COULEURS_QUIZ.faux : couleurs.encre;
    const phrase = justes >= 4 ? "Bien joué !" : justes >= 2 ? "Continue comme ça !" : "On recommence ?";
    return (
      <ScrollView {...MARQUE_DEFILEMENT} contentContainerStyle={cadre} alwaysBounceVertical={false}>
        {enTete}
        <Animated.View style={{ flex: 1, justifyContent: "center", gap: PAS * 5, opacity: entree }}>
          {/* LE SCORE, en très gros. L'animation est un simple agrandissement qui retombe : rien de
              sonore, rien qui tourne, et rien du tout si les animations sont réduites (invariant 6). */}
          <Animated.View style={{ alignItems: "center", gap: PAS, transform: [{ scale: arrivee }] }}>
            <Text accessibilityRole="header" testID="quiz-score"
              style={{ fontFamily: POLICE.affiche, fontSize: 72, lineHeight: 78, letterSpacing: -2, color: teinte }}>{justes} / {total}</Text>
            <Text style={[TYPO.reponse, { color: couleurs.encre }]} testID="quiz-phrase">{phrase}</Text>
            <Text style={TYPO.note}>{justes * POINTS_PAR_REPONSE_JUSTE} points gagnés</Text>
          </Animated.View>

          {monRang.cle !== rangDepart ? (
            <View testID="quiz-montee" style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: PAS * 2 }}>
              <Ionicons name="ribbon" size={22} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
              <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>Nouveau rang : {monRang.nom}</Text>
            </View>
          ) : null}

          {/* LA JAUGE vers le rang suivant. C'est une progression, pas une place dans une file :
              il n'y a personne d'autre dessus. */}
          {suivant ? (
            <View style={{ gap: PAS * 2 }} accessible accessibilityRole="progressbar" testID="quiz-progression"
              accessibilityLabel={`${points} points sur ${suivant.min} pour devenir ${suivant.nom}`}
              accessibilityValue={{ min: 0, max: suivant.min, now: points }}>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={[TYPO.corps, { fontFamily: POLICE.titre, flex: 1 }]}>{points} pts / {suivant.min} pts pour {suivant.nom}</Text>
                <Text style={[TYPO.donnee, { color: couleurs.sourd }]}>{Math.min(100, Math.round((points / suivant.min) * 100))} %</Text>
              </View>
              <View style={{ height: 14, borderRadius: 7, backgroundColor: couleurs.voile, overflow: "hidden" }}>
                <View style={{ height: 14, borderRadius: 7, width: `${Math.min(100, Math.round((points / suivant.min) * 100))}%`, backgroundColor: couleurs.encre }} />
              </View>
            </View>
          ) : (
            <Text style={[TYPO.corps, { fontFamily: POLICE.titre, textAlign: "center" }]} testID="quiz-progression">Dernier rang atteint : {monRang.nom}.</Text>
          )}
        </Animated.View>

        <View style={{ gap: PAS * 2 }}>
          {bouton("Nouvelle manche", rejouer, "quiz-rejouer")}
          <View style={{ flexDirection: "row", gap: PAS * 2 }}>
            <Pressable onPress={() => setRangsOuverts(true)} accessibilityRole="button" accessibilityLabel="Voir les rangs et les points qu'ils demandent"
              testID="voir-rangs"
              style={({ pressed }) => ({ flex: 1, minHeight: CIBLE, borderRadius: RAYON.pastille, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: PAS * 2,
                borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.carte, opacity: pressed ? 0.7 : 1 })}>
              <Ionicons name="trophy-outline" size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
              <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>Les rangs</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <PartagerCarte etiquette={`Partager mon rang : ${monRang.nom}`} libelle="Partager" icone="share-outline"
                repli={`J'ai atteint le rang de ${monRang.nom} sur Repère. Peux-tu faire mieux ?`}
                rendu={ref => <QuizStory refCarte={ref} rang={monRang.nom} defi="Peux-tu faire mieux ?" />} />
            </View>
          </View>
          <Text style={[TYPO.micro, { textAlign: "center" }]} testID="quiz-local">100 % local, aucune donnée collectée.</Text>
        </View>
        <LesRangs ouvert={rangsOuverts} fermer={() => setRangsOuverts(false)} points={points} />
      </ScrollView>
    );
  }

  const bonne = q.propositions.find(p => p.juste)!;
  return (
    <ScrollView {...MARQUE_DEFILEMENT} contentContainerStyle={cadre} alwaysBounceVertical={false}>
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
