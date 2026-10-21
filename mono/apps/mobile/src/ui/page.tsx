/* Le cadre commun des ecrans : defilement, marges sures, largeur de lecture,
 * et l'etat d'une commune qui n'est pas prete (chargement, panne, absence).
 * Chaque ecran de detail commence par UNE question, en grand. */
import type { ReactNode, Ref } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ETATS, PHRASES } from "../lib/donnees";
import { Bouton, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { useCommuneChoisie, type EtatCommune } from "../lib/useCommune";
import { couleurs, feuille, PAS, TYPO, type Echelon } from "../lib/theme";
import { Etiquette } from "./resume";
import { BandeauFraicheur } from "./fraicheur";

/* `defilement` : pour un ecran qui doit amener le lecteur a une section (Qui decide,
   16/10/2026). Facultatif ; les autres ecrans ne le passent pas. */
export function Page({ children, defilement, surDefilement }: { children: ReactNode; defilement?: Ref<ScrollView>; surDefilement?: (y: number) => void }) {
  const marges = useSafeAreaInsets();
  return (
    /* LE FOND EST EXPLICITE (20/10/2026). Le defilement etait transparent : en
       theme sombre, le conteneur de navigation laissait passer son propre gris
       clair (#f2f2f2 mesure) tout autour des cartes. */
    <ScrollView ref={defilement} scrollEventThrottle={32}
      style={{ backgroundColor: couleurs.sol }}
      onScroll={surDefilement ? e => surDefilement(e.nativeEvent.contentOffset.y) : undefined}
      contentContainerStyle={[s.page, { backgroundColor: couleurs.sol, paddingBottom: marges.bottom + PAS * 10 }]}>
      <BandeauFraicheur />
      {children}
    </ScrollView>
  );
}

/* Typographie francaise : une espace insecable avant « ? ! : ; », pour que le
   point d'interrogation ne tombe jamais seul a la ligne (vu sur capture). */
export const insecable = (t: string) => t.replace(/ ([?!:;])/g, "\u00a0$1");

/* LE REPERE D'ECHELON — 21/10/2026.
 *
 * Un filet de 3 px dans la couleur de l'echelon, colle a l'etiquette du titre.
 * Il dit, avant la premiere phrase, DE QUEL NIVEAU DE DECISION parle l'ecran :
 * c'est la question meme du produit. Le meme dispositif qu'on a pose sur « Chez
 * vous » le matin meme — un seul langage visuel dans toute l'application.
 *
 * Ce sont les cinq couleurs gelees, aucune couleur nouvelle. ET LE FILET NE
 * PARAIT JAMAIS SEUL : il exige `etiquette`, qui nomme le niveau en toutes
 * lettres juste a cote (invariant 7). Sans etiquette, pas de filet. */
export function Question({ etiquette, question, sous, emoji, echelon }: { etiquette?: string; question: string; sous?: string; emoji?: string; echelon?: Echelon }) {
  return (
    <View style={{ gap: PAS * 2, marginBottom: PAS * 1 }}>
      {etiquette ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
          {echelon ? <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: couleurs[echelon] }}
            importantForAccessibility="no" accessibilityElementsHidden /> : null}
          <View style={{ flex: 1 }}><Etiquette emoji={emoji} texte={etiquette} /></View>
        </View>
      ) : null}
      <Text style={TYPO.question} accessibilityRole="header">{insecable(question)}</Text>
      {/* `insecable` aussi sur le sous-titre (20/10/2026) : sans lui, le « ; » de
          la page « Avant 18 ans » tombait seul en debut de ligne. */}
      {sous ? <Text style={TYPO.note}>{insecable(sous)}</Text> : null}
    </View>
  );
}

/* Rend `rendu(r)` quand la commune est prete ; sinon la phrase de l'etat. */
export function AvecDonnees({ rendu }: { rendu: (r: Extract<EtatCommune, { pret: true }>) => ReactNode }) {
  const { choix } = useSelection();
  const { r, reessayer } = useCommuneChoisie();
  if (!choix) {
    return (
      <View style={[s.page, s.pleinFond, { paddingTop: PAS * 6 }]}>
        <Vide titre="Aucune commune n'est choisie." corps="Revenez à l'accueil et tapez le nom de votre commune." />
        <Bouton texte="Revenir à l'accueil" onPress={() => router.replace("/")} />
      </View>
    );
  }
  if (!r.pret) {
    const p = (PHRASES as Record<string, { titre: string; corps: string }>)[r.etat] || PHRASES[ETATS.ECHEC];
    return (
      <View style={[s.page, s.pleinFond, { paddingTop: PAS * 6 }]}>
        <Vide titre={p.titre} corps={p.corps}
          action={r.etat === ETATS.EN_COURS ? undefined : "Réessayer"} onAction={reessayer} />
      </View>
    );
  }
  return <>{rendu(r)}</>;
}

const s = feuille(() => StyleSheet.create({
  /* LES ETATS « PAS PRETE » NE PASSENT PAS PAR Page : sans fond propre, le
     conteneur de navigation laissait voir son gris clair sur tout l'ecran en
     theme sombre (mesure rgb(242,242,242) le 20/10/2026). */
  pleinFond: { flex: 1, minHeight: "100%", backgroundColor: couleurs.sol },
  page: { paddingHorizontal: PAS * 4, paddingTop: PAS * 1, gap: PAS * 3, maxWidth: 640, width: "100%", alignSelf: "center" },
}));
