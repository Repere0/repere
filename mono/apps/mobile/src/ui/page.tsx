/* Le cadre commun des ecrans : defilement, marges sures, largeur de lecture,
 * et l'etat d'une commune qui n'est pas prete (chargement, panne, absence).
 * Chaque ecran de detail commence par UNE question, en grand. */
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ETATS, PHRASES } from "../lib/donnees";
import { Bouton, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { useCommuneChoisie, type EtatCommune } from "../lib/useCommune";
import { PAS, TYPO } from "../lib/theme";
import { Etiquette } from "./resume";

export function Page({ children }: { children: ReactNode }) {
  const marges = useSafeAreaInsets();
  return (
    <ScrollView contentContainerStyle={[s.page, { paddingBottom: marges.bottom + PAS * 10 }]}>
      {children}
    </ScrollView>
  );
}

/* Typographie francaise : une espace insecable avant « ? ! : ; », pour que le
   point d'interrogation ne tombe jamais seul a la ligne (vu sur capture). */
export const insecable = (t: string) => t.replace(/ ([?!:;])/g, "\u00a0$1");

export function Question({ etiquette, question, sous, emoji }: { etiquette?: string; question: string; sous?: string; emoji?: string }) {
  return (
    <View style={{ gap: PAS * 2, marginBottom: PAS * 2 }}>
      {etiquette ? <Etiquette emoji={emoji} texte={etiquette} /> : null}
      <Text style={TYPO.question} accessibilityRole="header">{insecable(question)}</Text>
      {sous ? <Text style={TYPO.note}>{sous}</Text> : null}
    </View>
  );
}

/* Rend `rendu(r)` quand la commune est prete ; sinon la phrase de l'etat. */
export function AvecDonnees({ rendu }: { rendu: (r: Extract<EtatCommune, { pret: true }>) => ReactNode }) {
  const { choix } = useSelection();
  const { r, reessayer } = useCommuneChoisie();
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
  return <>{rendu(r)}</>;
}

const s = StyleSheet.create({
  page: { paddingHorizontal: PAS * 5, paddingTop: PAS * 2, gap: PAS * 5, maxWidth: 640, width: "100%", alignSelf: "center" },
});
