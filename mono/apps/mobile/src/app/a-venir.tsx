/* « CE QUI ARRIVE AU PARLEMENT » — deplace de l'accueil le 30/09/2026.
 *
 * L'agenda est NATIONAL : l'ecran le dit d'emblee. Le mettre parmi les trois
 * reponses de « Chez vous » aurait laisse croire qu'il concerne la commune.
 * Fichiers republies chaque jour par la chaine, jamais embarques : un
 * calendrier absent ne fait jamais dire « aucune seance annoncee ». */
import { Stack } from "expo-router";
import { heureFr, jourFr } from "@repere/core";
import { Carte, Vide } from "../lib/composants";
import { AGENDA_PAS_ARRIVE, AGENDA_VIDE } from "../lib/absences";
import { srcAgenda } from "../lib/sources";
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
      const prochains = (d.prochains || []) as { titre: string; debut: string; institution: string; source: unknown }[];
      return (
        <Page>
          <Stack.Screen options={{ title: "Au Parlement" }} />
          <Question etiquette="Au Parlement" question="Qu'est-ce qui arrive ?"
            sous="Les séances annoncées à l'Assemblée nationale et au Sénat. Elles concernent tout le pays, pas seulement votre commune." />
          {!r.agendaLu ? (
            <Vide {...AGENDA_PAS_ARRIVE} action="Réessayer" onAction={reessayer} />
          ) : prochains.length ? (
            <Carte echelon="france" titre={d.prochainsDansLaSemaine ? "Cette semaine" : "Prochainement"}>
              <Resume phrase={d.prochainsDansLaSemaine
                ? `${d.semaineTotal} rendez-vous au Parlement cette semaine${d.semaineSelectionnee ? " ; voici les séances publiques" : ""}.`
                : "Le prochain rendez-vous au Parlement :"}>
                <Frise etiquette="Les prochaines séances" jalons={prochains.map((e, i) => ({
                  cle: e.debut + i, date: `${jourFr(e.debut)}${heureFr(e.debut) ? " · " + heureFr(e.debut) : ""}`,
                  titre: e.titre, texte: e.institution, echelon: "france", actif: i === 0,
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
