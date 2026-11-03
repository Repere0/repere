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
import { AppState, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ageReleve, dateFr } from "@repere/core";
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
      <Text style={[TYPO.note, { color: couleurs.encre, fontWeight: "600" }]}>{p.titre}</Text>
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
    ? { position: "absolute" as const, top: 0, left: PAS * 5, right: PAS * 5, fontSize: 12, lineHeight: 16, color: couleurs.sourd }
    : [TYPO.micro, { marginBottom: PAS * 2 }];
  return <Text testID="date-publication" style={style}>Données Repère publiées le {dateFr(jour)}.</Text>;
}

/* LA DATE D'UNE DONNEE ET SON ANCIENNETE, D'UN COUP D'OEIL (V13, bloc A, 30/10/2026).
   « Comptes OFGL du 29 juillet 2026 · il y a 93 jours · Source ». Jamais « à jour »
   (invariant 9) : la date brute et le nombre de jours, comptes a l'heure de Paris
   (ageReleve, @repere/core). Au-dela de 30 jours, la ligne passe en « ancien » et en
   gras : le nombre de jours reste le signal, la couleur ne fait que le souligner.
   Toute la ligne est le lien vers la source (44 px, cible tactile du projet). */
export const SEUIL_ANCIEN_JOURS = 30;
export const ilYa = (n: number) => (n <= 0 ? "aujourd'hui" : `il y a ${n} jour${n > 1 ? "s" : ""}`);
/* « avant » : une ligne de contexte posee dans le meme lien (Aujourd'hui : departement et region),
   pour ne pas ajouter de hauteur au premier ecran (les trois reponses doivent y tenir). */
export function DateDonnee({ quoi, date, url, testID, avant }: { quoi: string; date?: string | null; url?: string | null; testID?: string; avant?: string }) {
  const jour = date ? String(date).slice(0, 10) : "";
  const age = ageReleve(jour);
  if (age === null || age < 0) return null;
  const ancien = age > SEUIL_ANCIEN_JOURS;
  const ouvrir = () => (url ? Linking.openURL(url) : router.push("/sources"));
  const lienSource = <Text style={{ fontSize: 14, lineHeight: 19, color: couleurs.lien, fontWeight: "500", textDecorationLine: "underline" }}>Source</Text>;
  return (
    <Pressable testID={testID} onPress={ouvrir} accessibilityRole="link"
      accessibilityLabel={`${quoi} du ${dateFr(jour)}, ${ilYa(age)}. ${url ? "Ouvrir la source, site externe" : "Voir les sources"}`}
      /* 45 px : la regle du projet (44) plus un pixel, car le navigateur a mesure 43,99999 px
         (arrondi sous-pixel) ; et non CIBLE (48) : trois pixels qui
         gardent la troisieme reponse d'Aujourd'hui dans le premier ecran a 390 x 844. */
      style={({ pressed }) => ({ minHeight: 45, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
      {/* Avec « avant », « Source » monte sur la premiere ligne : la date tient alors sur une
         seule ligne a 390 px, et le lien garde 44 px (mesure du parcours navigateur). */}
      {avant ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: PAS * 2 }}>
          <Text style={{ fontSize: 14, lineHeight: 19, color: couleurs.sourd, flexShrink: 1 }}>{avant}</Text>
          {lienSource}
        </View>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: PAS * 2 }}>
        <Text style={{ fontSize: 14, lineHeight: 19, color: ancien ? couleurs.ancien : couleurs.sourd, fontWeight: ancien ? "700" : "400" }}>
          {quoi} du {dateFr(jour)} · {ilYa(age)}
        </Text>
        {avant ? null : lienSource}
      </View>
    </Pressable>
  );
}

const s = feuille(() => StyleSheet.create({
  bandeau: { borderLeftWidth: 3, borderLeftColor: couleurs.encre, backgroundColor: couleurs.voile,
    borderTopRightRadius: RAYON.bloc, borderBottomRightRadius: RAYON.bloc, paddingHorizontal: PAS * 3, paddingVertical: PAS * 2, gap: PAS },
  bouton: { minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start" },
  boutonTexte: { fontSize: 15, fontWeight: "500", color: couleurs.lien },
}));
