/* « CHEZ VOUS » — LE COEUR DE REPERE (refonte du 30/09/2026).
 *
 * La question de l'ecran : « Qu'est-ce que j'ai besoin de savoir aujourd'hui
 * sur mon territoire ? ». La reponse tient en cinq cartes, chacune = UNE
 * question, UNE reponse lisible en trois secondes, UN visuel, SA source, et
 * UN geste pour approfondir (niveau 1 -> niveaux 2 a 4 dans l'ecran de detail).
 *
 * L'ordre raconte : ce qui se passe pres de chez vous (un projet reel, date par
 * son exercice), ce qu'a fait votre depute, ou va l'argent, qui decide, ce qui
 * arrive. Ce n'est pas un ordre d'importance entre echelons.
 *
 * RIEN N'EST CALCULE ICI : les nombres viennent de @repere/core (visuels.js,
 * deriverAujourdhui), les absences de lib/absences.ts. */
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import {
  chaineDecision, chiffresComptes, datePublication, dateFr, euros, financementProjet, heureFr, jourFr,
  phrasePosition, repartitionVote, texteDe, titreLisible, REFUS_APPARIEMENT,
} from "@repere/core";
import { CarteQuestion, Vide } from "../lib/composants";
import { CarteMemoire } from "../cartes/CarteMemoire";
import { useSelection } from "../lib/selection";
import { useCommuneChoisie } from "../lib/useCommune";
import {
  PROJETS_PAS_ARRIVES, projetsAucun, VOTES_PAS_ARRIVES, circoInconnue, VOTE_AUCUN, AGENDA_PAS_ARRIVE, AGENDA_VIDE,
} from "../lib/absences";
import { srcAgenda, srcComptes, srcElus, srcProjets, srcScrutins } from "../lib/sources";
import { couleurs, PAS, RAYON, TYPO } from "../lib/theme";
import { AvecDonnees, Page } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { BarrePart, Chaine, Compteur, Financement, Frise, Repartition, type Niveau } from "../ui/visuels";

export default function ChezVous() {
  const { choix } = useSelection();
  const { reessayer } = useCommuneChoisie();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const publie = datePublication(r.index);
      const depIndex = r.index.departements.find((x: { code: string }) => x.code === d.dep);
      const projet = d.dernierProjet;
      const f = projet ? financementProjet(projet.p) : null;
      const vote = d.dernierVote;
      const rep = vote ? repartitionVote(vote.sc) : null;
      const ch = d.exercice ? chiffresComptes(d.exercice.ex) : null;
      const chaine = chaineDecision({ fiche: d.fiche, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep });
      const prochains = (d.prochains || []) as { titre: string; debut: string; institution: string; source: unknown }[];
      return (
        <Page>
          <Stack.Screen options={{ title: d.nomCommune }} />
          {/* JE SUIS ICI */}
          <View style={{ gap: PAS }}>
            <Text style={TYPO.etiquette}>Chez vous</Text>
            <Text style={TYPO.affiche} accessibilityRole="header">{d.nomCommune}</Text>
            <Text style={TYPO.note}>{[depIndex && depIndex.nom, depIndex && depIndex.region].filter(Boolean).join(" · ")}</Text>
            {publie ? (
              <View style={{ alignSelf: "flex-start", marginTop: PAS * 2, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RAYON.pastille, backgroundColor: couleurs.voile }}>
                <Text style={[TYPO.micro, { fontWeight: "600" }]}>Données publiées le {dateFr(publie)}</Text>
              </View>
            ) : null}
          </View>

          {/* 1. CE QUI SE PASSE PRES DE CHEZ VOUS : un projet reel */}
          <CarteQuestion echelon="ville" question="Ce qui se passe près de chez vous"
            reponse={!r.projetsLus ? "" : projet && f ? `L'État apporte ${euros(f.subvention)} à un projet à ${d.nomCommune}` : ""}
            action={r.projetsLus && projet ? { texte: "Voir tous les projets et l'argent de la commune", onPress: () => router.push("/argent") } : undefined}>
            {!r.projetsLus ? (
              <Vide {...PROJETS_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : projet && f ? (
              <>
                <Text style={TYPO.corps}>{projet.p.intitule} · exercice {projet.p.annee}</Text>
                {f.cout && f.partPct !== null ? (
                  <Financement subvention={f.subvention} cout={f.cout} partPct={f.partPct}
                    subventionTexte={`${euros(f.subvention)} sur ${euros(f.cout)}`}
                    resteTexte={`${euros(f.reste as number)} non détaillés par la source`} />
                ) : null}
                <PastilleSource source={srcProjets(d, f.partPct !== null)} />
              </>
            ) : (
              <Vide {...projetsAucun(d.nomCommune)} />
            )}
          </CarteQuestion>

          {/* 2. CE QU'A FAIT VOTRE DEPUTE */}
          <CarteQuestion echelon="france" question="Ce qu'a voté votre député"
            reponse={r.votesLus && r.votesFiables && vote ? <Text style={TYPO.reponse}>{texteDe(phrasePosition(vote.position, vote.qui))}</Text> : ""}
            action={r.votesLus && r.votesFiables && vote ? { texte: "Comprendre ce vote", onPress: () => router.push("/vote") } : undefined}>
            {!r.votesLus ? (
              <Vide {...VOTES_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
            ) : !r.votesFiables ? (
              <Vide titre={REFUS_APPARIEMENT.titre} corps={REFUS_APPARIEMENT.corps} />
            ) : vote && rep ? (
              <>
                <Text style={TYPO.corps}>{titreLisible(vote.sc.t)}</Text>
                <Text style={TYPO.note}>Le {dateFr(vote.sc.d)} · texte {vote.sc.s}</Text>
                <Repartition segments={rep.segments} total={rep.total} position={vote.position} qui={vote.qui} />
                <PastilleSource source={srcScrutins(d)} />
              </>
            ) : d.nbCircos === 0 ? (
              <Vide {...circoInconnue(d.nomCommune)} />
            ) : (
              <Vide {...VOTE_AUCUN} />
            )}
          </CarteQuestion>

          {/* 3. OU VA L'ARGENT */}
          <CarteQuestion echelon="ville" question="Où va l'argent de la commune"
            reponse={ch && ch.parJour !== null ? <Compteur valeur={ch.parJour} suffixe="€ dépensés par jour" /> : ""}
            action={{ texte: "Comprendre le budget de la commune", onPress: () => router.push("/argent") }}>
            {ch && ch.parJour !== null ? (
              <>
                <Text style={TYPO.note}>En moyenne sur l'exercice {d.exercice.an} : une façon de rendre le total imaginable, pas un rythme réel.</Text>
                {ch.partSalaires !== null ? <BarrePart part={ch.partSalaires} libelle="Salaires, sur 100 € dépensés" valeur={`${ch.partSalaires} €`} /> : null}
                {ch.partInvestissement !== null ? <BarrePart part={ch.partInvestissement} libelle="Investissement, sur 100 € dépensés" valeur={`${ch.partInvestissement} €`} delai={120} /> : null}
                <PastilleSource source={srcComptes(d)} />
              </>
            ) : (
              <Text style={TYPO.corps}>Les comptes de {d.nomCommune} ne permettent pas ce calcul : l'écran de détail dit pourquoi.</Text>
            )}
          </CarteQuestion>

          {/* 4. QUI DECIDE */}
          <CarteQuestion echelon="dept" question="Qui décide pour vous"
            reponse="Cinq niveaux, du plus proche au plus lointain."
            action={{ texte: "Qui décide de quoi", onPress: () => router.push("/qui-decide") }}>
            <Chaine compact niveaux={chaine as Niveau[]} />
            <PastilleSource source={srcElus(r.srcElus)} />
          </CarteQuestion>

          {/* 5. CE QUI ARRIVE (fichiers republies chaque jour, jamais embarques) */}
          <CarteQuestion echelon="france" question="Ce qui arrive au Parlement"
            reponse={r.agendaLu && prochains.length ? (d.prochainsDansLaSemaine ? "Cette semaine" : "Prochainement") : ""}>
            {!r.agendaLu ? (
              <Vide {...AGENDA_PAS_ARRIVE} action="Réessayer" onAction={reessayer} />
            ) : prochains.length ? (
              <>
                <Frise etiquette="Les prochaines séances" jalons={prochains.map((e, i) => ({
                  cle: e.debut + i, date: `${jourFr(e.debut)}${heureFr(e.debut) ? " · " + heureFr(e.debut) : ""}`,
                  titre: e.titre, texte: e.institution, echelon: "france", actif: i === 0,
                }))} />
                {d.semaineSelectionnee ? <Text style={TYPO.note}>{d.semaineTotal} rendez-vous cette semaine : les séances publiques d'abord.</Text> : null}
                <PastilleSource source={srcAgenda(prochains[0].source)} />
              </>
            ) : (
              <Vide {...AGENDA_VIDE} />
            )}
          </CarteQuestion>

          {choix ? <CarteMemoire choix={choix} /> : null}
          <Text style={TYPO.note}>
            Chaque information porte sa source officielle : touchez ⓘ pour la voir. Repère ne classe ni ne note personne.
          </Text>
        </Page>
      );
    }} />
  );
}
