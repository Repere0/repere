/* LA FRAICHEUR, DITE A L'ECRAN — INVARIANT 9 (01/10/2026).
 *
 * Meme etat (client partage, `abonnerFraicheur`) et meme phrase
 * (@repere/core, `phraseFraicheur`) que le site. Place en tete de chaque ecran
 * de donnees par `Page` : aucun ecran ne peut montrer une donnee d'une
 * publication precedente, ou non verifiable, sans le dire. Rien n'est affiche
 * quand la donnee est actuelle. `accessibilityLiveRegion` : annonce sans
 * interrompre (Android) ; le role « summary » la fait lire en tete (iOS). */
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { abonnerFraicheur } from "@repere/data-utils";
import { phraseFraicheur } from "@repere/core";
import { couleurs, PAS, RAYON, TYPO } from "../lib/theme";

type Etat = { etat: string; generation: string | null; depuis: string | null };

export function Fraicheur() {
  const [etat, setEtat] = useState<Etat | null>(null);
  useEffect(() => abonnerFraicheur(setEtat), []);
  const p = phraseFraicheur(etat);
  if (!p) return null;
  return (
    <View style={s.bloc} testID="fraicheur" accessibilityRole="summary" accessibilityLiveRegion="polite">
      <Text style={[TYPO.corps, { fontWeight: "600" }]}>{p.titre}</Text>
      <Text style={TYPO.note}>{p.corps}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  bloc: { backgroundColor: couleurs.voile, borderLeftWidth: 3, borderLeftColor: couleurs.encre,
    borderRadius: RAYON.bloc, padding: PAS * 3, gap: PAS },
});
