/* INVARIANT 9 — FRAICHEUR (decision du porteur, 30/09/2026), sur le telephone.
 *
 * Meme etat et memes phrases que le site (packages/data-utils/src/client.js,
 * PHRASES_FRAICHEUR) : une donnee gardee sur l'appareil peut etre affichee,
 * jamais presentee comme actuelle si elle ne l'est pas. Place dans `Page` :
 * tous les ecrans de detail le portent, pas seulement l'accueil.
 *
 * AU RETOUR AU PREMIER PLAN, l'application redemande l'index : une application
 * laissee ouverte plusieurs jours ne le faisait jamais (faille F-2 du 30/09).
 * Si une publication est parue, l'ecran le dit et propose la mise a jour ;
 * il ne recharge jamais de lui-meme ce que le lecteur est en train de lire. */
import { useEffect, useState } from "react";
import { AppState, Pressable, StyleSheet, Text, View } from "react-native";
import { dateFr } from "@repere/core";
import {
  etatFraicheur, surFraicheur, verifierPublication, publicationPriseEnCompte, phraseFraicheur, FRAICHEUR,
} from "../lib/donnees";
import { useCommuneChoisie } from "../lib/useCommune";
import { feuille, CIBLE, couleurs, PAS, RAYON, TYPO } from "../lib/theme";

export function BandeauFraicheur() {
  const [e, setE] = useState(etatFraicheur());
  const { reessayer } = useCommuneChoisie();
  useEffect(() => {
    const desabonner = surFraicheur(setE);
    const abo = AppState.addEventListener("change", s => { if (s === "active") verifierPublication().catch(() => {}); });
    return () => { desabonner(); abo.remove(); };
  }, []);
  if (e.etat !== FRAICHEUR.PRECEDENTE && e.etat !== FRAICHEUR.INCONNUE) return null;
  /* La phrase porte la date de la publication affichee (phraseFraicheur, partagee avec le site). */
  const p = phraseFraicheur(e);
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

/* La date de publication des donnees, en tete de chaque ecran (chantier 6, 30/10/2026).
   C'est la date de construction de l'index (generation), pas celle d'un releve par
   source : l'ecran ne la presente pas comme une date de source. Rien s'il n'y en a pas. */
/* « flottant » : la ligne se pose dans la marge haute de Page (16 px), sans repousser
   le contenu. Les réponses d'abord doivent tenir dans le premier écran à 390 x 844 :
   une ligne en flux les faisait passer de 839 à 877 px (parcours navigateur). */
export function DatePublication({ flottant = false }: { flottant?: boolean }) {
  const [e, setE] = useState(etatFraicheur());
  useEffect(() => {
    const desabonner = surFraicheur(setE);
    return () => { desabonner(); };
  }, []);
  const jour = e.generation ? String(e.generation).slice(0, 10) : "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(jour)) return null;
  const style = flottant
    ? { position: "absolute" as const, top: 0, left: PAS * 4, right: PAS * 4, fontSize: 12, lineHeight: 16, color: couleurs.sourd }
    : [TYPO.micro, { marginBottom: PAS * 2 }];
  return <Text testID="date-publication" style={style}>Données Repère publiées le {dateFr(jour)}.</Text>;
}

const s = feuille(() => StyleSheet.create({
  bandeau: { borderLeftWidth: 3, borderLeftColor: couleurs.encre, backgroundColor: couleurs.voile,
    borderTopRightRadius: RAYON.bloc, borderBottomRightRadius: RAYON.bloc, paddingHorizontal: PAS * 3, paddingVertical: PAS * 2, gap: PAS },
  bouton: { minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start" },
  boutonTexte: { fontSize: 15, fontWeight: "700", color: couleurs.lien },
}));
