/* DONNÉES EN GRAND (07/11/2026, DA « storytelling »).
 *
 * StatCard : un nombre officiel en grand (IBM Plex Mono), son libellé dessous.
 * DataBadge : un statut écrit (« Pour », « Adopté »), dans une pastille.
 * CarteListe, Puces : la forme commune des listes et des explications longues.
 * Une couleur de vote y code un FAIT (invariant 7, D24) ; le mot reste toujours écrit,
 * la couleur n'est jamais seule à porter le sens. Les nombres viennent de @repere/core. */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Pression } from "./pression";
import { Ionicons } from "@expo/vector-icons";
import { feuille, couleurs, OMBRE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { bordureGroupe, texteSur } from "../lib/groupes";
import { phrasesDe } from "@repere/core";

/* 09/11/2026 (Stitch) : le nombre reste dans l'encre ; la couleur du vote est un filet au-dessus.
   Les couleurs de vote Stitch descendent à 2,56:1 sur la carte claire : jamais en texte. */
export function StatCard({ valeur, libelle, couleur }: { valeur: string; libelle: string; couleur?: string }) {
  return (
    <View style={s.stat} accessible accessibilityLabel={`${libelle} : ${valeur}`}>
      {couleur ? <View style={{ height: 4, width: 28, borderRadius: 2, backgroundColor: couleur }} accessibilityElementsHidden importantForAccessibility="no" /> : null}
      <Text style={TYPO.stat}>{espacesFines(valeur)}</Text>
      <Text style={TYPO.etiquette}>{libelle}</Text>
    </View>
  );
}

/* `teinte` : la même couleur de vote (D24, inchangée), posée en voile à 22 % avec un filet plein,
   texte en encre : un badge plus doux, sans nouvelle couleur hors palette (invariant 7). */
export function DataBadge({ texte, couleur, teinte }: { texte: string; couleur?: string; teinte?: boolean }) {
  const fond = couleur || couleurs.voile;
  if (couleur && teinte) {
    return (
      <View style={[s.badge, { backgroundColor: couleur + "38", borderWidth: 1, borderColor: couleur }]}>
        <Text style={[s.badgeTexte, { color: couleurs.encre }]}>{texte}</Text>
      </View>
    );
  }
  /* 07/11/2026 : un filet plus sombre de la même teinte (bordureGroupe) détache le badge de la
     carte. La teinte elle-même ne change pas : c'est une couleur de vote fixée (invariant 7, D24). */
  return (
    <View style={[s.badge, { backgroundColor: fond }, couleur ? { borderWidth: 1.5, borderColor: bordureGroupe(fond) } : null]}>
      <Text style={[s.badgeTexte, { color: couleur ? texteSur(fond) : couleurs.encre }]}>{texte}</Text>
    </View>
  );
}

/* UNE CARTE DE LISTE (07/11/2026) : une ligne d'une liste (votes, actus, élus), en carte.
 * Icône à gauche, titre en Manrope Bold, sous-titre en DM Sans gris, ombre douce, 16 px. */
export function CarteListe({ icone, gauche, titre, sous, children, onPress, etiquette }: {
  icone?: keyof typeof Ionicons.glyphMap; gauche?: ReactNode; titre: string; sous?: string | null; children?: ReactNode;
  onPress?: () => void; etiquette?: string;
}) {
  const corps = (
    <>
      {gauche ?? (icone ? <Ionicons name={icone} size={22} color={couleurs.sourd} accessible={false} importantForAccessibility="no" /> : null)}
      <View style={{ flex: 1, gap: PAS * 2, alignSelf: "center" }}>
        {sous ? <Text style={TYPO.donnee}>{sous}</Text> : null}
        <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{titre}</Text>
        {children}
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={couleurs.sourd} accessible={false} importantForAccessibility="no" /> : null}
    </>
  );
  return onPress ? (
    <Pression onPress={onPress} etiquette={etiquette} style={[s.ligne, { ...OMBRE }]}>{corps}</Pression>
  ) : <View style={[s.ligne, { ...OMBRE }]} accessible={!!etiquette} accessibilityLabel={etiquette}>{corps}</View>;
}

/* DES PUCES (règle des 3 lignes) : les phrases existantes, une par ligne, sans en changer un mot. */
export function Puces({ items }: { items: { icone: keyof typeof Ionicons.glyphMap; texte: ReactNode }[] }) {
  return (
    <View style={{ gap: PAS * 3 }}>
      {items.map((x, i) => (
        <View key={i} style={{ flexDirection: "row", gap: PAS * 3 }}>
          <Ionicons name={x.icone} size={18} color={couleurs.sourd} style={{ marginTop: 2 }} accessible={false} importantForAccessibility="no" />
          <Text style={[TYPO.note, { flex: 1 }]}>{x.texte}</Text>
        </View>
      ))}
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  stat: { flex: 1, gap: PAS, minWidth: 0 },
  badge: { alignSelf: "flex-start", borderRadius: RAYON.pastille, paddingHorizontal: PAS * 3, paddingVertical: PAS },
  badgeTexte: { fontFamily: POLICE.texteGras, fontSize: 14, lineHeight: 18, letterSpacing: 0.3 },
  ligne: { flexDirection: "row", alignItems: "flex-start", gap: PAS * 3, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte },
}));

/* LA RÈGLE DES 3 LIGNES (07/11/2026) : au-delà d'environ trois lignes (180 signes), un texte
   de plusieurs phrases s'affiche en puces, une phrase par puce, mot pour mot (phrasesDe). */
export function TexteLong({ texte, icone = "ellipse-outline" }: { texte: string; icone?: keyof typeof Ionicons.glyphMap }) {
  const phrases = phrasesDe(texte);
  if (texte.length <= 180 || phrases.length < 2) return <Text style={TYPO.corps}>{texte}</Text>;
  return <Puces items={phrases.map(p => ({ icone, texte: p }))} />;
}

/* LES ESPACES D'UN GRAND NOMBRE (07/11/2026) : en IBM Plex Mono, l'espace insécable de
   « 2 495 € » prend la largeur d'un chiffre (« 2  495  € » sur iPhone). Chaque espace est
   rendu à 40 % de la taille : le nombre reste un seul texte, lu d'un seul tenant. */
export function espacesFines(texte: string): ReactNode {
  const morceaux = texte.split(/[   ]/);
  if (morceaux.length < 2) return texte;
  return morceaux.flatMap((m, i) => (i ? [<Text key={i} style={{ fontSize: 16, letterSpacing: 0 }}>{" "}</Text>, m] : [m]));
}
