/* « PARTAGER UN VOTE » — deux cartes, comme sur la maquette du 13/10/2026.
 *
 * Carte 1, l'annonce : qui, la position, le sujet, la date. Elle donne envie de lire.
 * Carte 2, l'explication : où en est le texte, selon l'étape de la procédure, avec
 * sa source. Elle renvoie vers le détail, sans prendre position.
 *
 * Tout vient des données de la commune (le vote du député, la chaîne « Qui décide »)
 * et de @repere/core. Rien n'est écrit à la main. Si le vote n'est pas publié, la
 * carte n'existe pas : on ne partage pas une absence.
 *
 * Chaque carte se partage en image (PNG, react-native-view-shot, cadrage du 13/10) par la
 * feuille de partage du téléphone ; le texte et le lien restent disponibles en repli. */
import { useRef, type RefObject } from "react";
import { Animated, Pressable, Share, Text, View } from "react-native";
import { Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { chaineDecision, dateFr, etapeDuScrutin, ETAPES_LOI, procedure, titreLisible } from "@repere/core";
import { couleurs, CIBLE, PAS, TYPO } from "../lib/theme";
import { srcVote } from "../lib/sources";
import { AvecDonnees, Page, Question } from "../ui/page";
import { useApparition } from "../ui/mouvement";

const VERBE: Record<string, string> = {
  p: "a voté pour.",
  c: "a voté contre.",
  a: "s'est abstenu.",
};

type Vote = { sc: { t: string; d: string; n: string }; position?: string; qui?: string };

/* Une carte devient une image PNG, puis la feuille de partage du telephone la
   transmet. Si la capture echoue, on partage le texte : le lecteur ne perd rien. */
async function partagerImage(carte: RefObject<View | null>, titre: string, repli: string) {
  try {
    const uri = await captureRef(carte, { format: "png", quality: 1, result: "tmpfile" });
    if (!(await Sharing.isAvailableAsync())) {
      await Share.share({ message: repli });
      return;
    }
    await Sharing.shareAsync(uri, { mimeType: "image/png", UTI: "public.png", dialogTitle: titre });
  } catch {
    await Share.share({ message: repli });
  }
}

export default function Partager() {
  const apparition = useApparition(0);
  const carte1 = useRef<View>(null);
  const carte2 = useRef<View>(null);
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const vote = d.dernierVote as Vote | undefined;
      if (!vote || !vote.position || !VERBE[vote.position]) {
        return (
          <Page>
            <Stack.Screen options={{ title: "Partager" }} />
            <Question etiquette="Partager" question="Rien à partager pour l'instant"
              sous="Repère n'a pas de vote publié à partager pour votre député. Le partage n'invente rien." />
          </Page>
        );
      }
      const niveaux = chaineDecision({ fiche: d.fiche, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep }) as { echelon: string; personne?: { nom: string } | null }[];
      const nom = niveaux.find(n => n.echelon === "france")?.personne?.nom || "Votre député";
      const verbe = VERBE[vote.position];
      const sujet = titreLisible(vote.sc.t);
      const date = dateFr(vote.sc.d);
      const etape = etapeDuScrutin(procedure(vote.sc.t));
      const jalon = ETAPES_LOI.find(e => e.cle === etape);
      const lienScrutin = srcVote(d, vote.sc)?.url || null;
      const ou = jalon
        ? `Où en est le texte : ${jalon.titre.toLowerCase()}. ${jalon.texte}`
        : "Le scrutin ne précise pas l'étape du texte : Repère ne la devine pas.";

      const lignes = [
        `${nom} ${verbe}`,
        sujet,
        `Vote à l'Assemblée nationale, ${date}.`,
        "",
        ou,
        "",
        "Résumé Repère, à partir du scrutin publié. Le détail est dans l'application.",
      ];
      if (lienScrutin) lignes.push(lienScrutin);
      const message = lignes.join("\n");

      return (
        <Page>
          <Stack.Screen options={{ title: "Partager" }} />
          <Animated.View style={{ opacity: apparition, gap: PAS * 4 }}>
            <Question etiquette="Partager ce vote" question="Deux cartes, à lire dans l'ordre" />

            {/* CARTE 1 — L'ANNONCE */}
            <View ref={carte1} collapsable={false} accessible accessibilityLabel={`${nom} ${verbe} ${sujet}. Vote à l'Assemblée nationale, ${date}.`}
              style={{ backgroundColor: couleurs.encre, borderRadius: 24, padding: PAS * 6, gap: PAS * 3, minHeight: 320, justifyContent: "space-between" }}>
              <Text style={{ color: couleurs.sol, fontWeight: "800", fontSize: 14, letterSpacing: 1 }}>REPÈRE · L'ANNONCE</Text>
              <View style={{ gap: PAS * 2 }}>
                <Text style={{ color: couleurs.sol, fontWeight: "800", fontSize: 26, lineHeight: 30 }}>{nom}</Text>
                <Text style={{ color: couleurs.sol, fontWeight: "800", fontSize: 52, lineHeight: 52, letterSpacing: -1.5 }}>{verbe}</Text>
              </View>
              <View style={{ gap: PAS * 2 }}>
                <Text style={{ color: couleurs.sol, fontWeight: "700", fontSize: 18, lineHeight: 24 }}>{sujet}</Text>
                <Text style={{ color: couleurs.trait, fontSize: 14, lineHeight: 20 }}>Vote à l'Assemblée nationale, {date}.</Text>
              </View>
            </View>

            {/* CARTE 2 — L'EXPLICATION */}
            <View ref={carte2} collapsable={false} accessible accessibilityLabel={`Comment ce texte avance. ${ou}`}
              style={{ backgroundColor: couleurs.carte, borderRadius: 24, borderWidth: 1, borderColor: couleurs.trait, padding: PAS * 6, gap: PAS * 3 }}>
              <Text style={{ color: couleurs.sourd, fontWeight: "800", fontSize: 14, letterSpacing: 1 }}>REPÈRE · POUR COMPRENDRE</Text>
              <Text style={{ color: couleurs.encre, fontWeight: "800", fontSize: 24, lineHeight: 28 }}>Comment ce texte avance</Text>
              <Text style={{ color: couleurs.encre, fontSize: 16, lineHeight: 23 }}>{ou}</Text>
              <Text style={[TYPO.note, { marginTop: PAS * 2 }]}>Source : Assemblée nationale, scrutin n° {vote.sc.n}, {date}.</Text>
            </View>

            <View style={{ gap: PAS * 2 }}>
              <Pressable onPress={() => partagerImage(carte1, "Carte 1 : l'annonce", message)} accessibilityRole="button"
                accessibilityLabel="Partager la carte 1 en image"
                style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, backgroundColor: couleurs.encre,
                  alignItems: "center", justifyContent: "center", padding: 14, opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ color: couleurs.sol, fontWeight: "700" }}>Partager la carte 1 (image)</Text>
              </Pressable>
              <Pressable onPress={() => partagerImage(carte2, "Carte 2 : pour comprendre", message)} accessibilityRole="button"
                accessibilityLabel="Partager la carte 2 en image"
                style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, backgroundColor: couleurs.encre,
                  alignItems: "center", justifyContent: "center", padding: 14, opacity: pressed ? 0.7 : 1 })}>
                <Text style={{ color: couleurs.sol, fontWeight: "700" }}>Partager la carte 2 (image)</Text>
              </Pressable>
              <Pressable onPress={() => Share.share({ message })} accessibilityRole="button"
                accessibilityLabel="Partager le texte et le lien par la feuille de partage du téléphone"
                style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait,
                  backgroundColor: couleurs.carte, alignItems: "center", justifyContent: "center", padding: 14, opacity: pressed ? 0.6 : 1 })}>
                <Text style={{ color: couleurs.encre, fontWeight: "700" }}>Partager le texte et le lien</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Page>
      );
    }} />
  );
}
