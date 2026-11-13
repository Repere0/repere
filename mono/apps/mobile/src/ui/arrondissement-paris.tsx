/* PARIS : LA VILLE ENTIÈRE, ET VOTRE ARRONDISSEMENT — 13/11/2026 (décision du porteur).
 *
 * La page de Paris montre les données de la Ville entière (une seule commune, 75056). Cette carte laisse choisir un
 * arrondissement et dit ce que cela change AUJOURD'HUI : la mairie de proximité. Elle dit aussi ce que Repère ne publie
 * pas encore par arrondissement (maire d'arrondissement, député), au lieu de l'inventer (invariant 5). Aucune donnée
 * d'essai n'est affichée : un faux nom ou un faux chiffre sur un écran civique serait une faute (invariant 4). */
import { ScrollView, Text, View } from "react-native";
import { ARRONDISSEMENTS, mairieArrondissement, nomArrondissement, ordinalArrondissement } from "@repere/core";
import { couleurs, CIBLE, PAS, POLICE, RAYON, TYPO, ACCENTS } from "../lib/theme";
import { LienSortant } from "../lib/composants";
import { choisirArrondissement, useArrondissement } from "../lib/arrondissement";
import { Pression } from "./pression";

export function ArrondissementParis() {
  const n = useArrondissement();
  const mairie = n ? mairieArrondissement(n) : null;
  return (
    <View testID="arrondissement-paris" style={{ gap: PAS * 3, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
      <Text style={TYPO.etiquette} accessibilityRole="header">Votre arrondissement</Text>
      <Text style={TYPO.note}>Cette page montre Paris en entier : une seule commune, un seul budget. Choisissez votre arrondissement pour voir ce qui en dépend.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: PAS * 2, paddingVertical: PAS }}
        accessibilityRole="radiogroup" accessibilityLabel="Arrondissement de Paris">
        <Puce texte="Tout Paris" actif={n === null} onPress={() => choisirArrondissement(null)} etiquette="Tout Paris, sans arrondissement" />
        {ARRONDISSEMENTS.map((a: number) => (
          <Puce key={a} texte={ordinalArrondissement(a)} actif={n === a} onPress={() => choisirArrondissement(a)} etiquette={`${ordinalArrondissement(a)} arrondissement`} />
        ))}
      </ScrollView>
      {n && mairie ? (
        <View style={{ gap: PAS * 2 }} accessibilityLiveRegion="polite">
          <Text style={TYPO.reponse}>{nomArrondissement(n)}</Text>
          <Text style={TYPO.corps}>Votre mairie de proximité : {mairie.nom.replace(/^Mairie/, "la mairie")}.</Text>
          {mairie.detail ? <Text style={TYPO.note}>{mairie.detail}</Text> : null}
          <Text style={TYPO.note}>Le maire d'arrondissement et votre député ne sont pas encore publiés par Repère pour chaque arrondissement. Paris compte plusieurs circonscriptions : votre député dépend de votre adresse.</Text>
          <LienSortant url="https://www.paris.fr" texte="Les mairies d'arrondissement, sur paris.fr" />
        </View>
      ) : null}
    </View>
  );
}

function Puce({ texte, actif, onPress, etiquette }: { texte: string; actif: boolean; onPress: () => void; etiquette: string }) {
  return (
    <Pression onPress={onPress} etiquette={etiquette} role="radio" etat={{ checked: actif }}
      style={{ minHeight: CIBLE, minWidth: CIBLE, paddingHorizontal: PAS * 4, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center",
        backgroundColor: actif ? ACCENTS.autorite : couleurs.voile }}>
      <Text style={{ fontSize: 15, fontFamily: POLICE.section, color: actif ? ACCENTS.surAutorite : couleurs.encre }}>{texte}</Text>
    </Pression>
  );
}
