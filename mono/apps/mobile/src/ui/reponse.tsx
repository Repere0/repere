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
import { couleurs, CIBLE, OMBRE, PAS, RAYON, TYPO, type Echelon } from "../lib/theme";

function BoutonPartager({ titre, texte, sourceUrl }: { titre: string; texte: string; sourceUrl?: string | null }) {
  const partager = async () => {
    const message = sourceUrl ? `${texte}\n\nSource : ${sourceUrl}` : texte;
    await Share.share({ message, title: titre });
  };
  return (
    <Pressable onPress={partager} accessibilityRole="button" accessibilityLabel={`Partager : ${titre}`}
      style={({ pressed }) => [s.partage, pressed && { opacity: 0.6 }]}>
      <Text style={s.suiteTexte}>Partager</Text>
    </Pressable>
  );
}

/* Espace insecable devant « ? ! : ; € » : ni le point d'interrogation ni le
   symbole euro ne tombent seuls a la ligne (vu sur capture : « 332 372 / € »),
   ni le signe pour cent (« soit 47 / % », capture du 06/10/2026). */
const typo = (t: string) => t.replace(/ ([?!:;€»%])/g, "\u00a0$1").replace(/« /g, "«\u00a0");

/* LE PARTAGE DE L'ECRAN « CHEZ VOUS » — un seul bouton, sous les reponses
   (06/10/2026). Le message reprend les reponses affichees, chacune avec le lien
   officiel de sa source. Rien d'autre : ni code de commune, ni identifiant, ni
   parametre de suivi, ni adresse de Repere (la diffusion publique de la beta
   est une decision du porteur du projet, pas de ce bouton). */
export function messagePartage(nom: string, lignes: { texte: string; url?: string | null }[]): string {
  return [`Ce qui se passe à ${nom}, d'après les sources officielles :`,
    ...lignes.map(l => (l.url ? `• ${l.texte}\n  Source : ${l.url}` : `• ${l.texte}`))].join("\n\n");
}
export function BoutonPartagerTout({ nom, lignes }: { nom: string; lignes: { texte: string; url?: string | null }[] }) {
  const partager = async () => {
    try { await Share.share({ message: messagePartage(nom, lignes), title: `Ce qui se passe à ${nom}` }); } catch { /* partage annule ou indisponible */ }
  };
  return (
    <Pressable onPress={partager} accessibilityRole="button" accessibilityLabel={`Partager ce qui se passe à ${nom}`}
      style={({ pressed }) => [s.partageTout, pressed && { opacity: 0.6 }]}>
      <Text style={s.suiteTexte}>Partager ce qui se passe à {nom}</Text>
    </Pressable>
  );
}

export function Reponse({ phrase, preuve, note, noteLignes, sources, suite, partage }: {
  /* l'echelon qui decide : porte par la donnee, pas encore par le rendu
     (cartes blanches en palette B partiel) ; la PR « Chez vous » s'en servira. */
  echelon: Echelon; phrase: string; preuve?: ReactNode; note?: ReactNode;
  /* coupe une note longue (intitule officiel d'un projet) ; le lecteur d'ecran
     lit le texte entier, et l'ecran de detail l'affiche en entier */
  noteLignes?: number;
  sources?: ReactNode; suite?: { texte: string; onPress: () => void };
  partage?: { titre: string; texte: string; sourceUrl?: string | null };
}) {
  /* Pas de rubrique au-dessus : la reponse vient d'abord (consigne du
     30/09/2026 : « une réponse », pas « une rubrique puis du texte »). La
     phrase est le titre de la carte pour le lecteur d'ecran, qui peut ainsi
     sauter d'une reponse a l'autre. */
  return (
    <View testID="reponse" style={[s.carte, { backgroundColor: couleurs.carte }]}>
      <Text style={s.phrase} accessibilityRole="header">{typo(phrase)}</Text>
      {preuve}
      {note ? (typeof note === "string" ? <Text style={TYPO.note} numberOfLines={noteLignes} accessibilityLabel={noteLignes ? note : undefined}>{typo(note)}</Text> : note) : null}
      <View style={s.pied}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", flexShrink: 1 }}>{sources}</View>
        {partage ? <BoutonPartager {...partage} /> : null}
        {suite ? (
          <Pressable onPress={suite.onPress} accessibilityRole="button" accessibilityLabel={suite.texte}
            style={({ pressed }) => [s.suite, pressed && { opacity: 0.6 }]}>
            <Text style={s.suiteTexte}>{suite.texte.replace(/ \?$/, " ?")} ›</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* Un lien de la liste « Aller plus loin ». */
export function Plus({ texte, onPress, premier, dernier }: { texte: string; onPress: () => void; premier?: boolean; dernier?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={texte}
      style={({ pressed }) => [s.plus, premier && s.plusPremier, dernier && s.plusDernier, pressed && { opacity: 0.6 }]}>
      <Text style={[s.suiteTexte, { flex: 1 }]}>{texte}</Text>
      <Text style={s.suiteTexte} accessibilityElementsHidden importantForAccessibility="no">›</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  /* 06/10/2026 : 14 px en haut et 6 px entre les lignes (au lieu de 16 et 8), corps
     18/24 (au lieu de 19/25) : mesures a 360 x 800, ce sont les pixels qui
     manquaient pour que la troisieme reponse tienne dans le premier ecran. */
  carte: { borderRadius: RAYON.carte, paddingHorizontal: PAS * 4, paddingTop: 14, paddingBottom: 0, gap: 6, ...OMBRE },
  phrase: { ...TYPO.reponse, fontSize: 18, lineHeight: 24 },
  pied: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: PAS * 2 },
  suite: { minHeight: CIBLE, justifyContent: "center", marginLeft: "auto" },
  suiteTexte: { fontSize: 15, fontWeight: "700", color: couleurs.lien },
  partage: { minHeight: CIBLE, justifyContent: "center" },
  partageTout: { minHeight: CIBLE + 4, justifyContent: "center", alignItems: "center", borderRadius: RAYON.bloc,
    borderWidth: 1, borderColor: couleurs.trait, backgroundColor: couleurs.carte, paddingHorizontal: PAS * 4 },
  plus: { minHeight: CIBLE + 4, flexDirection: "row", alignItems: "center", paddingHorizontal: PAS * 4, backgroundColor: couleurs.carte,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: couleurs.trait },
  plusPremier: { borderTopLeftRadius: RAYON.bloc, borderTopRightRadius: RAYON.bloc },
  plusDernier: { borderBottomLeftRadius: RAYON.bloc, borderBottomRightRadius: RAYON.bloc, borderBottomWidth: 0 },
});
