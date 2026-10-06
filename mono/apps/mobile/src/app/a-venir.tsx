/* « CE QUI ARRIVE AU PARLEMENT » — deplace de l'accueil le 30/09/2026.
 *
 * L'agenda est NATIONAL : l'ecran le dit d'emblee. Le mettre parmi les trois
 * reponses de « Chez vous » aurait laisse croire qu'il concerne la commune.
 * Fichiers republies chaque jour par la chaine, jamais embarques : un
 * calendrier absent ne fait jamais dire « aucune seance annoncee ». */
import { router, Stack } from "expo-router";
import { fraicheurCalendrier, heureFr, jourFr, phraseSemaineParlement } from "@repere/core";
import { Pressable, Text } from "react-native";
import { Carte, Vide } from "../lib/composants";
import { AGENDA_PAS_ARRIVE, AGENDA_VIDE } from "../lib/absences";
import { srcAgenda } from "../lib/sources";
import { TYPO } from "../lib/theme";
import { useCommuneChoisie } from "../lib/useCommune";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Resume } from "../ui/resume";
import { Frise } from "../ui/visuels";

export default function AVenir() {
  const { reessayer } = useCommuneChoisie();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const prochains = (d.prochains || []) as { titre: string; debut: string; institution: string; categorie?: string; source: unknown }[];
      return (
        <Page>
          <Stack.Screen options={{ title: "Au Parlement" }} />
          <Question etiquette="Au Parlement" question="Qu'est-ce qui arrive ?"
            sous="Les rendez-vous annoncés par l'Assemblée nationale et le Sénat. Ils concernent tout le pays, pas seulement votre commune." />
          <Pressable
            onPress={() => router.push("/scrutins?mode=qag")}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir les Questions au Gouvernement"
            style={{ minHeight: 52, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff" }}
          >
            <Text style={{ fontWeight: "700", color: "#1d1d1f" }}>Questions au Gouvernement</Text>
            <Text style={{ marginTop: 4, color: "#5f6368" }}>Voir les questions posées et les réponses publiées.</Text>
          </Pressable>
          {/* Un releve de plus de deux jours, ou REPRIS faute de reponse de la
              source, le dit, institution par institution (@repere/core
              fraicheurCalendrier), sur toutes les sources montrees. */}
          {r.agendaLu && fraicheurCalendrier([...prochains.map(e => e.source as { producteur?: string; releve_le?: string; reutilise?: boolean }), d.srcCal], new Date()) ? (
            <Text testID="releve-ancien" style={TYPO.note}>{fraicheurCalendrier([...prochains.map(e => e.source as { producteur?: string; releve_le?: string; reutilise?: boolean }), d.srcCal], new Date())}</Text>
          ) : null}
          {/* en route : ni « pas arrivé », ni « aucune séance » (06/10/2026) */}
          {r.agendaEnCours ? (
            <Vide titre="Chargement du calendrier de l'Assemblée nationale et du Sénat." corps="Il est relevé chaque jour par Repère." />
          ) : !r.agendaLu ? (
            <Vide {...AGENDA_PAS_ARRIVE} action="Réessayer" onAction={reessayer} />
          ) : prochains.length ? (
            <Carte echelon="france" titre={d.prochainsDansLaSemaine ? "Cette semaine" : "Prochainement"}>
              <Resume phrase={phraseSemaineParlement(d)}>
                <Frise etiquette="Les prochains rendez-vous" jalons={prochains.map((e, i) => ({
                  cle: e.debut + i, date: `${jourFr(e.debut)}${heureFr(e.debut) ? " · " + heureFr(e.debut) : ""}`,
                  titre: e.titre, texte: e.categorie ? `${e.institution} · ${e.categorie}` : e.institution, echelon: "france", actif: i === 0,
                }))} />
              </Resume>
              <PastilleSource source={srcAgenda(prochains[0].source)} />
            </Carte>
          ) : (
            <Vide {...AGENDA_VIDE} />
          )}
        </Page>
      );
    }} />
  );
}
