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
import { feuille, couleurs, CIBLE, OMBRE, PAS, RAYON, TYPO, type Echelon } from "../lib/theme";
import { IconePartage } from "./icones";
import { EnClair } from "./signatures";
import { Depli } from "./visuels";

function BoutonPartager({ titre, texte, sourceUrl }: { titre: string; texte: string; sourceUrl?: string | null }) {
  const partager = async () => {
    const message = sourceUrl ? `${texte}\n\nSource : ${sourceUrl}` : texte;
    await Share.share({ message, title: titre });
  };
  return (
    <Pressable onPress={partager} accessibilityRole="button" accessibilityLabel={`Partager : ${titre}`}
      style={({ pressed }) => [s.partage, pressed && { opacity: 0.6 }]}>
      <IconePartage couleur={couleurs.lien} />
    </Pressable>
  );
}

/* Espace insecable devant « ? ! : ; € » : ni le point d'interrogation ni le
   symbole euro ne tombent seuls a la ligne (vu sur capture : « 332 372 / € »). */
export const typo = (t: string) => t.replace(/ ([?!:;€»])/g, "\u00a0$1").replace(/« /g, "«\u00a0");

/* LE CHIFFRE SORT DE LA PHRASE — 21/10/2026, d'apres les maquettes du porteur.
 *
 * Dans les maquettes le montant est le premier element lu : il est grand, la
 * phrase qui l'explique est petite. Jusqu'ici les trois cartes etaient trois
 * paves du meme poids, et le montant se noyait au milieu.
 *
 * LA CARTE DIT QUEL NOMBRE EST LA REPONSE, on ne le devine pas. Un premier jet
 * prenait le premier montant de la phrase : sur la carte des projets, il a
 * grossi « 1,5 million d'euros » (le cout du projet) au lieu de « 726 800 € »
 * (ce que l'Etat paie, qui est la reponse). Mettre en avant le mauvais nombre
 * induit le lecteur en erreur ; aucune heuristique ne vaut le fait que la carte
 * sache ce qu'elle repond.
 *
 * Ce decoupage NE REECRIT PAS la phrase et n'en retire rien : la reponse reste
 * une phrase entiere (sujet + verbe + fait date, consigne du 30/09/2026), le
 * lecteur d'ecran la recoit telle quelle, et le chiffre n'est pas repete — il
 * est agrandi la ou il se trouve deja. Si le texte demande ne figure pas dans
 * la phrase, rien ne grossit : jamais d'affichage faux. */
export function decouperChiffre(phrase: string, chiffre?: string): [string, string, string] | null {
  if (!chiffre) return null;
  const i = phrase.indexOf(chiffre);
  if (i < 0) return null;
  return [phrase.slice(0, i), chiffre, phrase.slice(i + chiffre.length)];
}

/* La phrase d'une reponse. Le lecteur d'ecran recoit UNE seule chaine, entiere :
   `accessibilityLabel` la porte, et le decoupage ne le concerne pas. */
function Phrase({ texte, chiffre }: { texte: string; chiffre?: string }) {
  const parts = decouperChiffre(texte, chiffre);
  if (!parts) return <Text style={s.phrase} accessibilityRole="header">{texte}</Text>;
  const [avant, nombre, apres] = parts;
  return (
    <Text style={s.phraseChiffree} accessibilityRole="header" accessibilityLabel={texte}>
      {avant}<Text style={s.chiffre}>{nombre}</Text>{apres}
    </Text>
  );
}

export function Reponse({ phrase, chiffre, preuve, note, sources, suite, partage, noteRepliee, etiquettes, enClair }: {
  /* l'echelon qui decide : porte par la donnee, pas encore par le rendu
     (cartes blanches en palette B partiel) ; la PR « Chez vous » s'en servira. */
  echelon: Echelon; phrase: string; preuve?: ReactNode; note?: ReactNode;
  /* le morceau de `phrase` qui EST la reponse, agrandi ; absent = rien ne grossit */
  chiffre?: string;
  sources?: ReactNode; suite?: { texte: string; onPress: () => void };
  partage?: { titre: string; texte: string; sourceUrl?: string | null };
  /* le titre du repli quand la note n'est qu'un detail de la phrase (16/10/2026) */
  noteRepliee?: string;
  /* 20/10/2026, maquettes du porteur : une ligne d'etiquettes au-dessus de la
     reponse (la rubrique, le statut), et un cartouche « En clair » en dessous. */
  etiquettes?: ReactNode;
  enClair?: string;
}) {
  /* Pas de rubrique au-dessus : la reponse vient d'abord (consigne du
     30/09/2026 : « une réponse », pas « une rubrique puis du texte »). La
     phrase est le titre de la carte pour le lecteur d'ecran, qui peut ainsi
     sauter d'une reponse a l'autre. */
  return (
    <View testID="reponse" style={[s.carte, { backgroundColor: couleurs.carte }]}>
      {etiquettes ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS * 2 }}>{etiquettes}</View> : null}
      <Phrase texte={typo(phrase)} chiffre={chiffre ? typo(chiffre) : undefined} />
      {preuve}
      {enClair ? <EnClair texte={enClair} /> : null}
      {note && noteRepliee ? (
        <Depli titre={noteRepliee}>{typeof note === "string" ? <Text style={TYPO.note}>{typo(note)}</Text> : note}</Depli>
      ) : note ? (typeof note === "string" ? <Text style={TYPO.note}>{typo(note)}</Text> : note) : null}
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
export function Plus({ texte, onPress, premier, dernier, etiquette }: { texte: string; onPress: () => void; premier?: boolean; dernier?: boolean; etiquette?: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiquette || texte}
      style={({ pressed }) => [s.plus, premier && s.plusPremier, dernier && s.plusDernier, pressed && { opacity: 0.6 }]}>
      <Text style={[s.suiteTexte, { flex: 1 }]}>{texte}</Text>
      <Text style={s.suiteTexte} accessibilityElementsHidden importantForAccessibility="no">›</Text>
    </Pressable>
  );
}

const s = feuille(() => StyleSheet.create({
  carte: { borderRadius: RAYON.carte, paddingHorizontal: PAS * 4, paddingTop: PAS, paddingBottom: 0, gap: PAS, ...OMBRE },
  phrase: { ...TYPO.reponse, fontSize: 19, lineHeight: 25 },
  /* La phrase qui porte un montant : elle passe a 17 px pour laisser la place
     au chiffre, et son interligne monte a 34 pour que le grand chiffre ne
     chevauche pas la ligne du dessus. */
  phraseChiffree: { ...TYPO.reponse, fontSize: 17, lineHeight: 30, color: couleurs.sourd },
  chiffre: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: 28, lineHeight: 30, color: couleurs.encre, letterSpacing: -0.8 },
  pied: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: PAS * 2 },
  suite: { minHeight: CIBLE, justifyContent: "center", marginLeft: "auto" },
  suiteTexte: { fontSize: 15, fontWeight: "700", color: couleurs.lien },
  /* Une icone de 24 pt dans une cible de 48 x 48 (16/10/2026) : le mot « Partager »
     faisait passer le pied de la carte sur deux lignes, et la troisieme reponse
     sous le pli (mesure : 865 px pour 844). Le nom reste lu : « Partager : … ». */
  partage: { minHeight: CIBLE, minWidth: CIBLE, alignItems: "center", justifyContent: "center" },
  plus: { minHeight: CIBLE + 4, flexDirection: "row", alignItems: "center", paddingHorizontal: PAS * 4, backgroundColor: couleurs.carte,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: couleurs.trait },
  plusPremier: { borderTopLeftRadius: RAYON.bloc, borderTopRightRadius: RAYON.bloc },
  plusDernier: { borderBottomLeftRadius: RAYON.bloc, borderBottomRightRadius: RAYON.bloc, borderBottomWidth: 0 },
}));
