/* « AUJOURD'HUI » — LE CANEVAS « MAIN » (13/10/2026).
 *
 * Deux réponses locales, dans l'ordre du canevas :
 *   1. Votre députée  -> le dernier vote publié : date, position, répartition en phrase
 *   2. Votre commune  -> les dépenses par habitant, publiées par l'OFGL
 * Chaque bloc : une phrase, une explication, « D'où vient cette info ? » (la
 * source se déplie sur place), et un lien vers l'écran qui va plus loin.
 *
 * PUIS, sous les deux réponses, la semaine au Parlement (ui/semaine.tsx) : elle
 * est nationale, et la carte le dit. Elle n'est jamais parmi les réponses locales.
 *
 * Le projet financé par l'État n'est plus sur l'accueil : il est sur « Où va
 * cet argent ? », à un geste (le calcul y est signalé comme calcul).
 *
 * Doctrine conservée : une absence de donnée est une phrase vraie, jamais un
 * vide ; une position de vote, jamais une présence ; une commune partagée entre
 * plusieurs circonscriptions ne reçoit jamais UN député.
 *
 * RIEN N'EST CALCULÉ ICI : @repere/core derive, ui/semaine.tsx compte la semaine. */
import { useState, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { router, Stack } from "expo-router";
import {
  dateFr, datePublication, decompte, fraicheurPublication, jourParis, ordinal, parHabitant, phrasePosition,
  texteDe, titreLisible, REFUS_APPARIEMENT,
} from "@repere/core";
import { Vide } from "../../lib/composants";
import { CarteMemoire } from "../../cartes/CarteMemoire";
import { useSelection } from "../../lib/selection";
import { useCommuneChoisie } from "../../lib/useCommune";
import { VOTES_PAS_ARRIVES, circoInconnue, VOTE_AUCUN } from "../../lib/absences";
import { srcComptesPublies, srcElus, srcVote } from "../../lib/sources";
import { CIBLE, couleurs, OMBRE, PAS, RAYON, TYPO } from "../../lib/theme";
import { AvecDonnees, Page } from "../../ui/page";
import { PastilleSource } from "../../ui/source";
import { SemaineParlement } from "../../ui/semaine";
import { typo } from "../../ui/reponse";
import { useApparition } from "../../ui/mouvement";

export default function ChezVous() {
  const { choix } = useSelection();
  const { reessayer } = useCommuneChoisie();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const nom = d.nomCommune;
      const publie = datePublication(r.index);
      /* Invariant 9 : la fraicheur se dit en phrase, a cote de la date. Sans date lisible,
         la phrase dit qu'on ne peut pas le dire : on ne pretend jamais que c'est a jour. */
      const fraicheur = fraicheurPublication(publie, jourParis(new Date()));
      const depIndex = r.index.departements.find((x: { code: string }) => x.code === d.dep);
      const vote = d.dernierVote;
      const hab = d.exercice ? parHabitant(d.exercice.ex) : null;
      const maire = d.fiche && d.fiche.maire && d.fiche.maire.nom ? d.fiche.maire.nom : null;

      return (
        <Page>
          <Stack.Screen options={{ title: nom }} />
          <View style={{ gap: 2 }}>
            <Text style={TYPO.etiquette}>Repère</Text>
            <Text style={TYPO.affiche} accessibilityRole="header">{nom}</Text>
            <Text style={TYPO.note}>{[depIndex && depIndex.nom, depIndex && depIndex.region].filter(Boolean).join(" · ")}</Text>
            {publie ? <Text style={TYPO.micro}>Publication Repère du {dateFr(publie)}</Text> : null}
            <Text testID="fraicheur-phrase" data-etat={fraicheur.etat}
              style={fraicheur.etat === "precedente" || fraicheur.etat === "inconnue" ? [TYPO.note, { fontWeight: "700" }] : TYPO.note}>
              {fraicheur.phrase}
            </Text>
          </View>

          <View style={{ gap: PAS * 3 }}>
            {/* 1. VOTRE DEPUTEE */}
            {!r.votesLus ? (
              <Vide {...VOTES_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : !r.votesFiables ? (
              <Vide titre={REFUS_APPARIEMENT.titre} corps={REFUS_APPARIEMENT.corps} />
            ) : vote ? (
              <Bloc testID="reponse" etiquette="Votre députée"
                phrase={d.nbCircos > 1
                  ? `${nom} est partagée entre ${d.nbCircos} circonscriptions. Votre député dépend de votre adresse.`
                  : `Votre commune est dans la ${ordinal(vote.circo)} circonscription. Le ${dateFr(vote.sc.d)}, ${texteDe(phrasePosition(vote.position, vote.qui))}`}
                explication={d.nbCircos > 1
                  ? "Une circonscription est une partie du territoire dont les électeurs élisent un député."
                  : <Text style={TYPO.note} numberOfLines={3}>{typo(`${vote.sc.s.charAt(0).toUpperCase()}${vote.sc.s.slice(1)}, ${decompte(vote.sc.dec)} : ${titreLisible(vote.sc.t)}`)}</Text>}
                source={<PastilleSource court source={srcVote(d, vote.sc)} />}
                actions={[
                  { texte: "Comprendre ce vote", onPress: () => router.push("/vote") },
                  { texte: "Partager ce vote en image", onPress: () => router.push("/partager") },
                ]} />
            ) : d.nbCircos === 0 ? (
              <Vide {...circoInconnue(nom)} />
            ) : (
              <Vide {...VOTE_AUCUN} />
            )}

            {/* 2. VOTRE COMMUNE */}
            {d.exercice && hab && hab.depenses !== null ? (
              <Bloc testID="reponse" etiquette="Votre commune" delai={120}
                phrase={`En ${d.exercice.an}, ${nom} a dépensé ${hab.depenses.toLocaleString("fr-FR")} € par habitant.`}
                explication={<Text style={TYPO.note}>{maire
                  ? `Le maire, ${maire}, prépare ce budget ; le conseil municipal le vote.`
                  : "Le maire prépare ce budget ; le conseil municipal le vote."}</Text>}
                source={<>
                  <PastilleSource court nom="Comptes" source={srcComptesPublies(d)} />
                  {maire ? <PastilleSource court nom="Élus" source={srcElus(r.srcElus)} /> : null}
                </>}
                actions={[{ texte: "Où va cet argent ?", onPress: () => router.push("/argent") }]} />
            ) : (
              <Bloc testID="reponse" etiquette="Votre commune" delai={120}
                phrase={`Les comptes de ${nom} ne permettent pas de dire combien la commune dépense par habitant.`}
                actions={[{ texte: "Pourquoi ?", onPress: () => router.push("/argent") }]} />
            )}
          </View>

          {/* AU PARLEMENT — sous les réponses locales, nationale, dite comme telle */}
          <SemaineParlement sp={d.semaineParlement} lu={r.agendaLu} nom={nom} />

          <Pressable onPress={() => router.push("/sources")} accessibilityRole="link" accessibilityLabel="Sources et mises à jour"
            style={({ pressed }) => [s.ligne, pressed && { opacity: 0.6 }]}>
            <Text style={s.lien}>Sources et mises à jour</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/ce-qui-manque")} accessibilityRole="link" accessibilityLabel="Ce que Repère ne montre pas encore"
            style={({ pressed }) => [s.ligne, pressed && { opacity: 0.6 }]}>
            <Text style={s.lien}>Ce que Repère ne montre pas encore</Text>
          </Pressable>

          {choix ? <CarteMemoire choix={choix} /> : null}
          <Text style={TYPO.note}>Repère ne classe ni ne note personne, et ne compare jamais deux communes.</Text>
        </Page>
      );
    }} />
  );
}

/* UN BLOC DU CANEVAS : étiquette, phrase, explication, source qui se déplie, des liens. */
function Bloc({ testID, etiquette, phrase, explication, source, actions, delai = 0 }: {
  testID?: string;
  etiquette: string;
  phrase: string;
  explication?: ReactNode;
  source?: ReactNode;
  actions?: { texte: string; onPress: () => void }[];
  delai?: number;
}) {
  const [ouvert, setOuvert] = useState(false);
  /* Une montee de 8 px et un fondu, une fois : la reponse arrive, elle ne danse pas.
     Reduire les animations du telephone : l'etat final, tout de suite (ui/mouvement.ts). */
  const apparition = useApparition(delai);
  return (
    <Animated.View style={{ opacity: apparition, transform: [{ translateY: apparition.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
    <View testID={testID} style={s.bloc}>
      <Text style={TYPO.etiquette}>{etiquette}</Text>
      <Text style={s.phrase} accessibilityRole="header">{typo(phrase)}</Text>
      {explication ? <View style={{ gap: PAS }}>{typeof explication === "string" ? <Text style={TYPO.note}>{explication}</Text> : explication}</View> : null}
      {source ? (
        <>
          <Pressable onPress={() => setOuvert(o => !o)} accessibilityRole="button"
            accessibilityLabel={ouvert ? "Masquer la source" : "D'où vient cette info ?"} accessibilityState={{ expanded: ouvert }}
            style={({ pressed }) => [s.ligne, pressed && { opacity: 0.6 }]}>
            {/* Secondaire : la source se lit, sans rivaliser avec les actions du bloc. */}
            <Text style={s.source}>{ouvert ? "Masquer la source" : "D'où vient cette info ?"}</Text>
          </Pressable>
          {ouvert ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS }}>{source}</View> : null}
        </>
      ) : null}
      {actions?.map(a => (
        <Pressable key={a.texte} onPress={a.onPress} accessibilityRole="button" accessibilityLabel={a.texte}
          style={({ pressed }) => [s.ligne, pressed && { opacity: 0.6 }]}>
          <Text style={s.lien}>{a.texte} ›</Text>
        </Pressable>
      ))}
    </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  bloc: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 4, gap: PAS * 2, ...OMBRE },
  phrase: { ...TYPO.reponse, fontSize: 22, lineHeight: 28 },
  ligne: { minHeight: CIBLE, justifyContent: "center" },
  lien: { color: couleurs.lien, fontWeight: "700", fontSize: 15 },
  source: { color: couleurs.sourd, fontWeight: "600", fontSize: 15, textDecorationLine: "underline" },
});
