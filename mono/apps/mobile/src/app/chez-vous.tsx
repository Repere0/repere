/* « VOICI CE QUI SE PASSE CHEZ VOUS » — LA PREMIERE TRANCHE VERTICALE (29/09/2026).
 *
 * Parcours : qui decide (le maire) -> un projet finance dans la commune ->
 * le depute de la circonscription -> son dernier vote, explique -> les
 * sources -> retour a l'accueil.
 *
 * Cet ecran ne fait qu'assembler : le chargement est dans lib/useCommune.ts,
 * la derivation dans @repere/core, chaque bloc dans src/cartes/. Un nouvel
 * ecran (Qui decide, Ou va mon argent) reprend le meme crochet et ses propres
 * cartes, sans recopier celui-ci. */
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import { ETATS, PHRASES } from "../lib/donnees";
import { Bouton, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { useCommune } from "../lib/useCommune";
import { CarteMaire } from "../cartes/CarteMaire";
import { CarteProjet } from "../cartes/CarteProjet";
import { CarteDepute } from "../cartes/CarteDepute";
import { couleurs, PAS } from "../lib/theme";

const revenir = () => (router.canGoBack() ? router.back() : router.replace("/"));

export default function ChezVous() {
  const marges = useSafeAreaInsets();
  const { choix } = useSelection();
  const [essai, setEssai] = useState(0);
  const reessayer = () => setEssai(n => n + 1);
  const r = useCommune(choix, essai);

  if (!choix) {
    return (
      <View style={[s.page, { paddingTop: PAS * 6 }]}>
        <Vide titre="Aucune commune n'est choisie." corps="Revenez à l'accueil et tapez le nom de votre commune." />
        <Bouton texte="Revenir à l'accueil" onPress={() => router.replace("/")} />
      </View>
    );
  }

  if (!r.pret) {
    const p = (PHRASES as Record<string, { titre: string; corps: string }>)[r.etat] || PHRASES[ETATS.ECHEC];
    return (
      <View style={[s.page, { paddingTop: PAS * 6 }]}>
        <Vide titre={p.titre} corps={p.corps}
          action={r.etat === ETATS.EN_COURS ? undefined : "Réessayer"} onAction={reessayer} />
      </View>
    );
  }

  const { d } = r;
  return (
    <ScrollView contentContainerStyle={[s.page, { paddingBottom: marges.bottom + PAS * 8 }]}>
      <Stack.Screen options={{ title: d.nomCommune }} />
      <View style={s.tete}>
        <Text style={s.titre} accessibilityRole="header">Voici ce qui se passe chez vous</Text>
        <Text style={s.lieu}>{d.nomCommune}{d.nomDep ? " — " + d.nomDep : ""}</Text>
      </View>
      <CarteMaire fiche={d.fiche} nomCommune={d.nomCommune} srcElus={r.srcElus} />
      <CarteProjet d={d} lu={r.projetsLus} onReessayer={reessayer} />
      <CarteDepute d={d} lus={r.votesLus} fiables={r.votesFiables} onReessayer={reessayer} />
      <Text style={s.fin}>
        Chaque ligne ci-dessus porte sa source officielle. Repère ne classe ni ne note personne.
      </Text>
      <Bouton texte="Revenir à l'accueil" discret onPress={revenir} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: PAS * 4, paddingTop: PAS * 2, gap: PAS * 4, maxWidth: 640, width: "100%", alignSelf: "center" },
  tete: { gap: PAS },
  titre: { fontSize: 26, lineHeight: 32, fontWeight: "800", color: couleurs.encre },
  lieu: { fontSize: 17, color: couleurs.sourd },
  fin: { fontSize: 15, lineHeight: 21, color: couleurs.sourd },
});
