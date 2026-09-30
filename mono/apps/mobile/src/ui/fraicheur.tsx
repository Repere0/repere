/* INVARIANT 9 — FRAICHEUR (decision du porteur, 30/09/2026), sur le telephone.
 *
 * Meme etat et memes phrases que le site (packages/data-utils/src/client.js,
 * @repere/core phraseFraicheur) : une donnee gardee sur l'appareil peut etre affichee,
 * jamais presentee comme actuelle si elle ne l'est pas. Place dans `Page` :
 * tous les ecrans de detail le portent, pas seulement l'accueil.
 *
 * AU RETOUR AU PREMIER PLAN, l'application redemande l'index : une application
 * laissee ouverte plusieurs jours ne le faisait jamais (faille F-2 du 30/09).
 * Si une publication est parue, l'ecran le dit et propose la mise a jour ;
 * il ne recharge jamais de lui-meme ce que le lecteur est en train de lire. */
import { useEffect, useState } from "react";
import { AppState, Pressable, StyleSheet, Text, View } from "react-native";
import {
  etatFraicheur, surFraicheur, verifierPublication, publicationPriseEnCompte,
} from "../lib/donnees";
import { phraseFraicheur } from "@repere/core";
import { useCommuneChoisie } from "../lib/useCommune";
import { CIBLE, couleurs, PAS, RAYON, TYPO } from "../lib/theme";

/* L'etat de fraicheur de la session, pour qui doit le dire (bandeau, feuille
   de source, ecran des sources). */
export function useFraicheur() {
  const [e, setE] = useState(etatFraicheur());
  useEffect(() => { const arreter = surFraicheur(setE); return () => { arreter(); }; }, []);
  return e;
}

export function BandeauFraicheur() {
  const [e, setE] = useState(etatFraicheur());
  const { reessayer } = useCommuneChoisie();
  useEffect(() => {
    const desabonner = surFraicheur(setE);
    const abo = AppState.addEventListener("change", s => { if (s === "active") verifierPublication().catch(() => {}); });
    return () => { desabonner(); abo.remove(); };
  }, []);
  const p: { titre: string; corps: string; action?: string } | null = phraseFraicheur(e);
  if (!p) return null;
  return (
    <View style={s.bandeau} testID="fraicheur" accessibilityRole="summary">
      <Text style={[TYPO.note, { color: couleurs.encre, fontWeight: "700" }]}>{p.titre}</Text>
      <Text style={TYPO.note}>{p.corps}</Text>
      {p.action ? (
        <Pressable accessibilityRole="button" onPress={() => { publicationPriseEnCompte(); reessayer(); }}
          style={({ pressed }) => [s.bouton, pressed && { opacity: 0.6 }]}>
          <Text style={s.boutonTexte}>{p.action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  bandeau: { borderLeftWidth: 3, borderLeftColor: couleurs.encre, backgroundColor: couleurs.voile,
    borderTopRightRadius: RAYON.bloc, borderBottomRightRadius: RAYON.bloc, paddingHorizontal: PAS * 3, paddingVertical: PAS * 2, gap: PAS },
  bouton: { minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start" },
  boutonTexte: { fontSize: 15, fontWeight: "700", color: couleurs.lien },
});
