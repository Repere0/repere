/* UNE REPONSE DE L'ACCUEIL — « Réponses d'abord », 30/09/2026.
 *
 * Hierarchie : la reponse (une phrase entiere, sujet + verbe + fait date),
 * une preuve visuelle proportionnee (une barre, une repartition, ou rien quand
 * le nombre suffit), une note courte, la source discrete, et UNE question
 * suivante. Pas de rubrique au-dessus d'un texte : l'etiquette dit de quel
 * niveau de decision il s'agit, la phrase dit ce qui se passe.
 *
 * `testID="reponse"` : le parcours mesure que les trois reponses tiennent dans
 * le premier ecran (tests/parcours-web.mjs). */
import type { ReactNode } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { feuille, ACCENTS, couleurs, CIBLE, OMBRE, PAS, POLICE, RAYON, TYPO, type Echelon } from "../lib/theme";
import { enfonce } from "./mouvement";

function BoutonPartager({ titre, texte, sourceUrl }: { titre: string; texte: string; sourceUrl?: string | null }) {
  const partager = async () => {
    const message = sourceUrl ? `${texte}\n\nSource : ${sourceUrl}` : texte;
    await Share.share({ message, title: titre });
  };
  return (
    <Pressable onPress={partager} accessibilityRole="button" accessibilityLabel={`Partager : ${titre}`}
      style={({ pressed }) => [s.rond, pressed && enfonce(true)]}>
      <Ionicons name="share-outline" size={20} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
    </Pressable>
  );
}

/* Espace insecable devant « ? ! : ; € » : ni le point d'interrogation ni le
   symbole euro ne tombent seuls a la ligne (vu sur capture : « 332 372 / € »). */
export const typo = (t: string) => t.replace(/ ([?!:;€»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");

export function Reponse({ phrase, preuve, note, sources, suite, partage, heros, sur }: {
  /* VARIANTE A (11/11/2026) : `heros` = la réponse principale de l'écran (le chiffre d'abord, la phrase
     dessous, le seul bouton plein) ; `sur` = l'étiquette au-dessus du chiffre. */
  heros?: boolean; sur?: string;
  /* l'echelon qui decide : porte par la donnee, pas encore par le rendu
     (cartes blanches en palette B partiel) ; la PR « Chez vous » s'en servira. */
  echelon: Echelon; phrase: string; preuve?: ReactNode; note?: ReactNode;
  sources?: ReactNode; suite?: { texte: string; onPress: () => void };
  partage?: { titre: string; texte: string; sourceUrl?: string | null };
}) {
  /* Pas de rubrique au-dessus : la reponse vient d'abord (consigne du
     30/09/2026 : « une réponse », pas « une rubrique puis du texte »). La
     phrase est le titre de la carte pour le lecteur d'ecran, qui peut ainsi
     sauter d'une reponse a l'autre. */
  return (
    <View testID="reponse" style={[s.carte, { backgroundColor: couleurs.carte }]}>
      {sur ? <Text style={TYPO.etiquette}>{sur}</Text> : null}
      {heros ? preuve : null}
      <Text style={heros ? s.phraseHeros : s.phrase} accessibilityRole="header">{typo(phrase)}</Text>
      {heros ? null : preuve}
      {note ? (typeof note === "string" ? <Text style={TYPO.note}>{typo(note)}</Text> : note) : null}
      {sources ? <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: -PAS * 2 }}>{sources}</View> : null}
      {suite || partage ? (
        <View style={s.pied}>
          {suite ? (
            <Pressable onPress={suite.onPress} accessibilityRole="button" accessibilityLabel={suite.texte}
              style={({ pressed }) => [s.suite, pressed && enfonce(true)]}>
              <Text style={s.suiteTexte}>{typo(suite.texte)}</Text>
            </Pressable>
          ) : <View style={{ flex: 1 }} />}
          {partage ? <BoutonPartager {...partage} /> : null}
        </View>
      ) : null}
    </View>
  );
}

/* Un lien de la liste « Aller plus loin ». */
export function Plus({ texte, onPress, premier, dernier }: { texte: string; onPress: () => void; premier?: boolean; dernier?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={texte}
      style={({ pressed }) => [s.plus, premier && s.plusPremier, dernier && s.plusDernier, pressed && enfonce(true)]}>
      <Text style={[TYPO.corps, { flex: 1, fontFamily: POLICE.titre }]}>{texte}</Text>
      <Ionicons name="chevron-forward" size={16} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
    </Pressable>
  );
}

const s = feuille(() => StyleSheet.create({
  /* Variante A (11/11/2026) : surface sans filet, 24 px d'intérieur, 16 px entre les éléments. */
  carte: { borderRadius: RAYON.carte + 4, padding: PAS * 6, gap: PAS * 4, ...OMBRE },
  phrase: { ...TYPO.reponse },
  phraseHeros: { ...TYPO.corps },
  pied: { flexDirection: "row", alignItems: "center", gap: PAS * 3 },
  /* La question suivante : une pilule PLEINE, la même sur toutes les cartes (13/11/2026, porteur). Avant, seule la
     première carte avait un bouton plein : « Où va cet argent ? » clair, « Comprendre ce vote » et « Le projet »
     sombres, lus comme un défaut d'affichage. */
  suite: { flex: 1, minHeight: CIBLE + 4, borderRadius: RAYON.pastille, paddingHorizontal: PAS * 5, alignItems: "center", justifyContent: "center", backgroundColor: ACCENTS.autorite },
  suiteTexte: { fontSize: 17, fontFamily: POLICE.section, color: ACCENTS.surAutorite },
  rond: { width: CIBLE, height: CIBLE, borderRadius: CIBLE / 2, backgroundColor: couleurs.voile, alignItems: "center", justifyContent: "center" },
  plus: { minHeight: CIBLE + 4, flexDirection: "row", alignItems: "center", paddingHorizontal: PAS * 4, backgroundColor: couleurs.carte,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: couleurs.trait },
  plusPremier: { borderTopLeftRadius: RAYON.bloc, borderTopRightRadius: RAYON.bloc },
  plusDernier: { borderBottomLeftRadius: RAYON.bloc, borderBottomRightRadius: RAYON.bloc, borderBottomWidth: 0 },
}));
