/* PARIS : LA VILLE ENTIÈRE, ET VOTRE ARRONDISSEMENT — 13/11/2026 (décision du porteur).
 *
 * La page de Paris montre les données de la Ville entière (une seule commune, 75056). Cette carte laisse choisir un
 * arrondissement et dit ce que cela change AUJOURD'HUI : la mairie de proximité. Elle dit aussi ce que Repère ne publie
 * pas encore par arrondissement (maire d'arrondissement, député), au lieu de l'inventer (invariant 5). Aucune donnée
 * d'essai n'est affichée : un faux nom ou un faux chiffre sur un écran civique serait une faute (invariant 4). */
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ARRONDISSEMENTS, mairieArrondissement, nomArrondissement, ordinalArrondissement } from "@repere/core";
import { couleurs, CIBLE, PAS, POLICE, RAYON, TYPO, ACCENTS } from "../lib/theme";
import { LienSortant } from "../lib/composants";
import { choisirArrondissement, useArrondissement } from "../lib/arrondissement";
import { Pression } from "./pression";
import { DateDonnee } from "./fraicheur";
import { chargerDeputes, chargerParisArrondissements } from "../lib/donnees";

/* 17/11/2026 : les circonscriptions et les maires d'arrondissement publiés par la collecte
   (scripts/collecte-paris-arrondissements.mjs). Une partie absente garde sa phrase « pas encore publié ». */
type Source = { producteur: string; url: string; releve_le?: string; mis_a_jour_le?: string | null };
type Paris = {
  circonscriptions: { source: Source; methode: string; par_arrondissement: Record<string, string[]> } | null;
  maires: { source: Source; par_arrondissement: Record<string, { maire: string; fonction: string; debut: string | null }> } | null;
};
type Depute = { prenom: string; nom: string };
function useParis() {
  const [p, setP] = useState<{ paris: Paris | null; deputes: Record<string, Depute> }>({ paris: null, deputes: {} });
  useEffect(() => {
    let vivant = true;
    Promise.all([chargerParisArrondissements().catch(() => null), chargerDeputes().catch(() => null)]).then(([a, d]) => {
      if (vivant) setP({ paris: (a?.donnees as Paris) ?? null, deputes: ((d?.donnees as { deputes?: Record<string, Depute> }) ?? {}).deputes ?? {} });
    });
    return () => { vivant = false; };
  }, []);
  return p;
}

export function ArrondissementParis() {
  const n = useArrondissement();
  const mairie = n ? mairieArrondissement(n) : null;
  const { paris, deputes } = useParis();
  const fiche = n && paris?.maires ? paris.maires.par_arrondissement[String(n)] ?? null : null;
  const circos = n && paris?.circonscriptions ? paris.circonscriptions.par_arrondissement[String(n)] ?? null : null;
  const noms = (circos ?? []).map(c => ({ c, d: deputes[c] })).filter(x => x.d);
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
          {fiche && paris?.maires ? (
            <View style={{ gap: PAS }}>
              <Text style={TYPO.corps}>{fiche.fonction} : {fiche.maire}.</Text>
              <DateDonnee quoi="Répertoire national des élus" date={paris.maires.source.mis_a_jour_le ?? paris.maires.source.releve_le} url={paris.maires.source.url} />
            </View>
          ) : <Text style={TYPO.note}>Le maire d'arrondissement n'est pas encore publié par Repère.</Text>}
          {circos && noms.length === circos.length && paris?.circonscriptions ? (
            <View style={{ gap: PAS }}>
              <Text style={TYPO.corps}>
                {noms.length === 1
                  ? `Votre député : ${noms[0].d.prenom} ${noms[0].d.nom} (${Number(noms[0].c.split("-")[1])}e circonscription).`
                  : `Cet arrondissement est partagé entre ${noms.length} circonscriptions : ${noms.map(x => `${x.d.prenom} ${x.d.nom} (${Number(x.c.split("-")[1])}e)`).join(", ")}. Votre député dépend de votre adresse.`}
              </Text>
              <Text style={TYPO.note}>{paris.circonscriptions.methode}</Text>
              <DateDonnee quoi="Bureaux de vote et circonscriptions" date={paris.circonscriptions.source.releve_le} url={paris.circonscriptions.source.url} />
            </View>
          ) : <Text style={TYPO.note}>Votre député n'est pas encore publié par Repère pour chaque arrondissement. Paris compte plusieurs circonscriptions : votre député dépend de votre adresse.</Text>}
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
