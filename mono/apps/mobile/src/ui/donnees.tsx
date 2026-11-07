/* DONNÉES EN GRAND (07/11/2026, DA « storytelling »).
 *
 * StatCard : un nombre officiel en grand (IBM Plex Mono), son libellé dessous.
 * DataBadge : un statut écrit (« Pour », « Adopté »), dans une pastille.
 * Une couleur de vote y code un FAIT (invariant 7, D24) ; le mot reste toujours écrit,
 * la couleur n'est jamais seule à porter le sens. Les nombres viennent de @repere/core. */
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { feuille, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { texteSur } from "../lib/groupes";

/* Grand texte (40 px) : le seuil WCAG est 3:1 ; les couleurs de vote sont mesurées à 3,0 et plus sur la carte sombre. */
export function StatCard({ valeur, libelle, couleur }: { valeur: string; libelle: string; couleur?: string }) {
  return (
    <View style={s.stat} accessible accessibilityLabel={`${libelle} : ${valeur}`}>
      <Text style={[TYPO.stat, couleur ? { color: couleur } : null]}>{valeur}</Text>
      <Text style={TYPO.etiquette}>{libelle}</Text>
    </View>
  );
}

export function DataBadge({ texte, couleur }: { texte: string; couleur?: string }) {
  const fond = couleur || couleurs.voile;
  return (
    <View style={[s.badge, { backgroundColor: fond }]}>
      <Text style={[s.badgeTexte, { color: couleur ? texteSur(fond) : couleurs.encre }]}>{texte}</Text>
    </View>
  );
}

/* L'encart « Ce qu'il faut retenir » : fond plus clair, filet à gauche. */
export function Encart({ titre, children, couleur }: { titre: string; children: ReactNode; couleur?: string }) {
  return (
    <View style={[s.encart, { borderLeftColor: couleur || couleurs.sourd }]}>
      <Text style={TYPO.etiquette} accessibilityRole="header">{titre}</Text>
      {children}
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  stat: { flex: 1, gap: PAS, minWidth: 0 },
  badge: { alignSelf: "flex-start", borderRadius: RAYON.pastille, paddingHorizontal: PAS * 3, paddingVertical: PAS },
  badgeTexte: { fontFamily: POLICE.texteGras, fontSize: 14, lineHeight: 18, letterSpacing: 0.3 },
  encart: { backgroundColor: couleurs.voile, borderRadius: RAYON.bloc, borderLeftWidth: 4, padding: PAS * 4, gap: PAS * 2 },
}));
