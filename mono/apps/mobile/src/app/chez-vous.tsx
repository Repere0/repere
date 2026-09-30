/* « CHEZ VOUS » — LE COEUR DE REPERE (refonte du 30/09/2026, spike visuel).
 *
 * La question de l'ecran : « Qu'est-ce que j'ai besoin de savoir aujourd'hui
 * sur mon territoire ? ». Cinq cartes. Chacune suit le meme ordre :
 *   phrase humaine -> chiffre cle -> visuel -> « En clair » -> ⓘ Source
 *   -> un geste pour approfondir.
 * Les phrases sont factuelles et viennent de regles de @repere/core
 * (partEnMots, montantCourt, phrasePosition…) : aucune n'est redigee au cas
 * par cas, aucune ne qualifie un fait de bon ou de mauvais.
 *
 * RIEN N'EST CALCULE ICI : les nombres viennent de @repere/core (visuels.js,
 * deriverAujourdhui), les absences de lib/absences.ts. */
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import {
  chaineDecision, chiffresComptes, datePublication, dateFr, euros, financementProjet, heureFr, jourFr,
  montantCourt, parHabitant, partReperee, phrasePosition, repartitionVote, texteDe, titreLisible, REFUS_APPARIEMENT,
} from "@repere/core";
import { CarteQuestion, Vide } from "../lib/composants";
import { CarteMemoire } from "../cartes/CarteMemoire";
import { useSelection } from "../lib/selection";
import { useCommuneChoisie } from "../lib/useCommune";
import {
  PROJETS_PAS_ARRIVES, projetsAucun, VOTES_PAS_ARRIVES, circoInconnue, VOTE_AUCUN, AGENDA_PAS_ARRIVE, AGENDA_VIDE,
} from "../lib/absences";
import { srcAgenda, srcComptes, srcElus, srcProjets, srcVote } from "../lib/sources";
import { couleurs, PAS, RAYON, TYPO } from "../lib/theme";
import { AvecDonnees, Page } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Etiquette, Resume } from "../ui/resume";
import { BarrePart, Chaine, Financement, Frise, Repartition, type Niveau } from "../ui/visuels";

export default function ChezVous() {
  const { choix } = useSelection();
  const { reessayer } = useCommuneChoisie();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const nom = d.nomCommune;
      const publie = datePublication(r.index);
      const depIndex = r.index.departements.find((x: { code: string }) => x.code === d.dep);
      const projet = d.dernierProjet;
      const f = projet ? financementProjet(projet.p) : null;
      const vote = d.dernierVote;
      const rep = vote ? repartitionVote(vote.sc) : null;
      const ch = d.exercice ? chiffresComptes(d.exercice.ex) : null;
      const hab = d.exercice ? parHabitant(d.exercice.ex) : null;
      const chaine = chaineDecision({ fiche: d.fiche, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep });
      const prochains = (d.prochains || []) as { titre: string; debut: string; institution: string; source: unknown }[];
      const depenses = ch && ch.depenses !== null ? montantCourt(ch.depenses) : null;
      return (
        <Page>
          <Stack.Screen options={{ title: nom }} />
          {/* JE SUIS ICI */}
          <View style={{ gap: PAS }}>
            <Etiquette emoji="📍" texte="Chez vous" />
            <Text style={TYPO.affiche} accessibilityRole="header">{nom}</Text>
            <Text style={TYPO.note}>{[depIndex && depIndex.nom, depIndex && depIndex.region].filter(Boolean).join(" · ")}</Text>
            {publie ? (
              <View style={{ alignSelf: "flex-start", marginTop: PAS * 2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RAYON.pastille, backgroundColor: couleurs.voile }}>
                <Text style={[TYPO.micro, { fontWeight: "600" }]}>Mis à jour par Repère le {dateFr(publie)}</Text>
              </View>
            ) : null}
          </View>

          {/* 1. UN PROJET PRES DE CHEZ VOUS */}
          <CarteQuestion echelon="ville" emoji="🏗️" question="Un projet chez vous"
            reponse={null}
            action={r.projetsLus && projet ? { texte: "Voir tous les projets et le budget", onPress: () => router.push("/argent") } : undefined}>
            {!r.projetsLus ? (
              <Vide {...PROJETS_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : projet && f ? (
              <>
                <Resume
                  phrase={f.partPct === null ? `L'État apporte ${euros(f.subvention)} à ce projet.`
                    : partReperee(f.partPct) ? `L'État finance ${partReperee(f.partPct)} de ce projet.`
                    : `Pour 100 € de ce projet, ${f.partPct} € viennent de l'État.`}>
                  <Text style={TYPO.corps}>{projet.p.intitule} · {projet.p.annee}</Text>
                  {f.cout && f.partPct !== null ? (
                    <Financement subvention={f.subvention} cout={f.cout} partPct={f.partPct}
                      subventionTexte={`${euros(f.subvention)} sur ${euros(f.cout)}`}
                      resteTexte={`${euros(f.reste as number)}, financement non détaillé par la source`} />
                  ) : null}
                </Resume>
                <PastilleSource source={srcProjets(d, f.partPct !== null)} />
              </>
            ) : (
              <Vide {...projetsAucun(nom)} />
            )}
          </CarteQuestion>

          {/* 2. CE QU'A VOTE VOTRE DEPUTE */}
          <CarteQuestion echelon="france" emoji="🗳️" question="Ce qu'a voté votre député"
            reponse={null}
            action={r.votesLus && r.votesFiables && vote ? { texte: "Comprendre ce vote", onPress: () => router.push("/vote") } : undefined}>
            {!r.votesLus ? (
              <Vide {...VOTES_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : !r.votesFiables ? (
              <Vide titre={REFUS_APPARIEMENT.titre} corps={REFUS_APPARIEMENT.corps} />
            ) : vote && rep ? (
              <>
                <Resume phrase={texteDe(phrasePosition(vote.position, vote.qui))}
                  enClair={`Le texte a été ${vote.sc.s} le ${dateFr(vote.sc.d)}.`}>
                  <Text style={TYPO.corps}>{titreLisible(vote.sc.t)}</Text>
                  <Repartition segments={rep.segments} total={rep.total} position={vote.position} qui={vote.qui} />
                </Resume>
                <PastilleSource source={srcVote(d, vote.sc)} />
              </>
            ) : d.nbCircos === 0 ? (
              <Vide {...circoInconnue(nom)} />
            ) : (
              <Vide {...VOTE_AUCUN} />
            )}
          </CarteQuestion>

          {/* 3. L'ARGENT DE LA COMMUNE */}
          <CarteQuestion echelon="ville" emoji="💶" question="L'argent de la commune"
            reponse={null}
            action={{ texte: "Où va l'argent, en détail", onPress: () => router.push("/argent") }}>
            {ch && depenses && d.exercice ? (
              <>
                <Resume phrase={`En ${d.exercice.an}, ${nom} a dépensé ${depenses.texte}.`}
                  chiffre={hab && hab.depenses !== null ? `${hab.depenses.toLocaleString("fr-FR")} €` : null}
                  legende="par habitant, sur l'année"
                  enClair="Les autres dépenses ne sont pas détaillées par la source.">
                  {ch.partSalaires !== null ? <BarrePart part={ch.partSalaires} libelle="Salaires" valeur={`${ch.partSalaires} € sur 100 € dépensés`} /> : null}
                  {ch.partInvestissement !== null ? <BarrePart part={ch.partInvestissement} libelle="Investissements" valeur={`${ch.partInvestissement} € sur 100 € dépensés`} delai={120} /> : null}
                </Resume>
                <PastilleSource source={srcComptes(d)} />
              </>
            ) : (
              <Text style={TYPO.corps}>Les comptes de {nom} ne permettent pas ce calcul : l'écran de détail dit pourquoi.</Text>
            )}
          </CarteQuestion>

          {/* 4. QUI DECIDE */}
          <CarteQuestion echelon="dept" emoji="🏛️" question="Qui décide"
            reponse={null}
            action={{ texte: "Qui décide de quoi", onPress: () => router.push("/qui-decide") }}>
            <Resume phrase={`Cinq niveaux décident pour ${nom}, de la mairie à l'Assemblée nationale.`}>
              <Chaine compact niveaux={chaine as Niveau[]} />
            </Resume>
            <PastilleSource source={srcElus(r.srcElus)} />
          </CarteQuestion>

          {/* 5. CE QUI ARRIVE (fichiers republies chaque jour, jamais embarques) */}
          <CarteQuestion echelon="france" emoji="📅" question="Ce qui arrive au Parlement" reponse={null}>
            {!r.agendaLu ? (
              <Vide {...AGENDA_PAS_ARRIVE} action="Réessayer" onAction={reessayer} />
            ) : prochains.length ? (
              <>
                <Resume phrase={d.prochainsDansLaSemaine
                  ? `${d.semaineTotal} rendez-vous au Parlement cette semaine${d.semaineSelectionnee ? " ; voici les séances publiques" : ""}.`
                  : "Le prochain rendez-vous au Parlement :"}>
                  <Frise etiquette="Les prochaines séances" jalons={prochains.map((e, i) => ({
                    cle: e.debut + i, date: `${jourFr(e.debut)}${heureFr(e.debut) ? " · " + heureFr(e.debut) : ""}`,
                    titre: e.titre, texte: e.institution, echelon: "france", actif: i === 0,
                  }))} />
                </Resume>
                <PastilleSource source={srcAgenda(prochains[0].source)} />
              </>
            ) : (
              <Vide {...AGENDA_VIDE} />
            )}
          </CarteQuestion>

          {choix ? <CarteMemoire choix={choix} /> : null}
          <Text style={TYPO.note}>
            Chaque information a sa source : touchez « ⓘ ». Repère ne classe ni ne note personne.
          </Text>
        </Page>
      );
    }} />
  );
}
