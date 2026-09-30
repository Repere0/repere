/* « CHEZ VOUS » — RÉPONSES D'ABORD (30/09/2026).
 *
 * La question de l'ecran : « Qu'est-ce que le citoyen apprend en ouvrant
 * Repere ? ». Trois reponses, pas cinq rubriques, qui suivent la progression
 * d'un lecteur qui ne connait rien a la politique locale :
 *   1. ce que l'Etat finance ici        (-> pourquoi, combien : « Où va l'argent »)
 *   2. qui decide, et avec quel argent  (-> « Où va cet argent ? »)
 *   3. ce qu'a vote le depute           (-> « Comprendre ce vote »)
 * puis « Aller plus loin » : qui decide de quoi, ce qui arrive au Parlement
 * (national, dit comme tel), d'ou viennent ces informations.
 *
 * Chaque phrase a ete verifiee contre les donnees (spike du 30/09/2026) :
 * - « a engage » et non « un projet de 726 800 € » : 726 800 € est l'aide,
 *   le projet coute 1 533 500 € ;
 * - une position de vote (pour, contre, abstention), jamais « a participe » :
 *   une donnee de presence est interdite (invariant 8) ;
 * - jamais « dernier vote » : le vote affiche n'est pas forcement le plus
 *   recent d'une meme journee ; on dit sa date ;
 * - une commune partagee entre plusieurs circonscriptions ne se voit jamais
 *   attribuer UN depute : « votre depute depend de votre adresse ».
 *
 * Trois dates, jamais confondues : celle du fait dans la phrase (« en 2025 »,
 * « le 21 juillet 2026 ») ; celle de la source dans la feuille « D'où vient
 * cette information ? » ; celle du traitement par Repere en en-tete.
 *
 * RIEN N'EST CALCULE ICI : @repere/core derive, lib/absences.ts dit les absences. */
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import {
  dateFr, datePublication, decompte, euros, financementProjet, montantCourt, ordinal, parHabitant, partReperee, phrasePosition,
  repartitionVote, texteDe,
  titreLisible, REFUS_APPARIEMENT,
} from "@repere/core";
import { Vide } from "../lib/composants";
import { CarteMemoire } from "../cartes/CarteMemoire";
import { useSelection } from "../lib/selection";
import { useCommuneChoisie } from "../lib/useCommune";
import {
  PROJETS_PAS_ARRIVES, projetsAucun, VOTES_PAS_ARRIVES, circoInconnue, VOTE_AUCUN,
} from "../lib/absences";
import { srcComptesPublies, srcElus, srcProjets, srcVote } from "../lib/sources";
import { PAS, TYPO } from "../lib/theme";
import { AvecDonnees, Page } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Etiquette } from "../ui/resume";
import { Plus, Reponse } from "../ui/reponse";
import { BarrePart, Repartition } from "../ui/visuels";

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
      const cout = f && f.cout ? montantCourt(f.cout) : null;
      const nbProjets = r.projetsLus ? (d.faits || []).filter((x: { type: string }) => x.type === "projet").length : 0;
      const vote = d.dernierVote;
      const rep = vote ? repartitionVote(vote.sc) : null;
      const hab = d.exercice ? parHabitant(d.exercice.ex) : null;
      const maire = d.fiche && d.fiche.maire && d.fiche.maire.nom ? d.fiche.maire.nom : null;
      return (
        <Page>
          <Stack.Screen options={{ title: nom }} />
          {/* OU JE SUIS, ET DE QUAND DATE CE QUE JE LIS */}
          {/* Pas d'etiquette « Chez vous » au-dessus du nom : 20 px gagnes, et la
             troisieme reponse de Paris revient dans le premier ecran (mesure). */}
          <View style={{ gap: 2 }}>
            <Text style={TYPO.affiche} accessibilityRole="header">{nom}</Text>
            <Text style={TYPO.note}>{[depIndex && depIndex.nom, depIndex && depIndex.region].filter(Boolean).join(" · ")}</Text>
            {publie ? <Text style={TYPO.micro}>Mis à jour par Repère le {dateFr(publie)}</Text> : null}
            {r.perime ? (
              <Text style={TYPO.micro} testID="perime">
                Le réseau n'a pas permis de tout mettre à jour : une partie de ce qui suit date d'une publication précédente.
              </Text>
            ) : null}
          </View>

          <View style={{ gap: PAS * 3 }}>
          {/* 1. CE QUE L'ETAT FINANCE ICI — la part se dit en mots pres d'un repere
             vrai, sinon en euros ; le cout est arrondi dans la phrase et exact
             dans la note. */}
          {!r.projetsLus ? (
            <Vide {...PROJETS_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
          ) : projet && f ? (
            <Reponse echelon="ville"
              phrase={f.partPct !== null && cout
                ? (partReperee(f.partPct)
                  ? `L'État finance ${partReperee(f.partPct)} d'un projet de ${cout.texte} à ${nom}.`
                  : `Pour 100 € d'un projet de ${cout.texte} à ${nom}, l'État en apporte ${f.partPct}.`)
                : `L'État apporte ${euros(f.subvention)} à un projet à ${nom}.`}
              preuve={f.partPct !== null ? <BarrePart sansLibelle part={f.partPct} libelle="Part de l'État dans le coût annoncé" valeur={`${f.partPct} € sur 100 €`} /> : undefined}
              note={`« ${projet.p.intitule} » : ${euros(f.subvention)} engagés par l'État en ${projet.p.annee}${f.cout ? ` sur ${euros(f.cout)} annoncés` : ""}.`}
              sources={<PastilleSource court source={srcProjets(d, f.partPct !== null)} />}
              suite={{ texte: nbProjets > 1 ? `${nbProjets} projets aidés` : "Le projet", onPress: () => router.push("/argent") }} />
          ) : (
            <Reponse echelon="ville" phrase={projetsAucun(nom).titre} note={projetsAucun(nom).corps}
              sources={<PastilleSource court source={srcProjets(d)} />} />
          )}

          {/* 2. QUI DECIDE, ET AVEC QUEL ARGENT — montant par habitant PUBLIE par
             l'OFGL ; le nom du maire vient du RNE : deux sources, deux pastilles.
             « prépare / vote » est la regle du code general des collectivites. */}
          {d.exercice && hab && hab.depenses !== null ? (
            <Reponse echelon="ville"
              phrase={`En ${d.exercice.an}, ${nom} a dépensé ${hab.depenses.toLocaleString("fr-FR")} € par habitant.`}
              note={maire ? `Le maire, ${maire}, prépare ce budget ; le conseil municipal le vote.` : "Le maire prépare ce budget ; le conseil municipal le vote."}
              sources={<>
                <PastilleSource court nom="Comptes" source={srcComptesPublies(d)} />
                {maire ? <PastilleSource court nom="Élus" source={srcElus(r.srcElus)} /> : null}
              </>}
              suite={{ texte: "Où va cet argent ?", onPress: () => router.push("/argent") }} />
          ) : (
            <Reponse echelon="ville"
              phrase={`Les comptes de ${nom} ne permettent pas de dire combien la commune dépense par habitant.`}
              suite={{ texte: "Pourquoi ?", onPress: () => router.push("/argent") }} />
          )}

          {/* 3. A L'ASSEMBLEE NATIONALE — une position, jamais une presence ; une
             date, jamais « dernier » ; plusieurs circonscriptions, jamais UN depute. */}
          {!r.votesLus ? (
            <Vide {...VOTES_PAS_ARRIVES} action="Réessayer" onAction={reessayer} />
          ) : !r.votesFiables ? (
            <Vide titre={REFUS_APPARIEMENT.titre} corps={REFUS_APPARIEMENT.corps} />
          ) : vote && rep ? (
            <Reponse echelon="france"
              phrase={d.nbCircos > 1
                ? `${nom} est partagée entre ${d.nbCircos} circonscriptions : votre député dépend de votre adresse.`
                : `Le ${dateFr(vote.sc.d)}, ${texteDe(phrasePosition(vote.position, `${vote.qui}, qui représente votre circonscription,`))}`}
              preuve={<Repartition compact segments={rep.segments} total={rep.total} position={vote.position} qui={vote.qui} />}
              note={d.nbCircos > 1
                ? `Par exemple, dans la ${ordinal(vote.circo)}, le ${dateFr(vote.sc.d)}, ${texteDe(phrasePosition(vote.position, vote.qui)).replace(/\.$/, "")} (texte ${vote.sc.s}).`
                : `${titreLisible(vote.sc.t)} : ${vote.sc.s}, ${decompte(vote.sc.dec)}.`}
              sources={<PastilleSource court source={srcVote(d, vote.sc)} />}
              suite={{ texte: "Comprendre ce vote", onPress: () => router.push("/vote") }} />
          ) : d.nbCircos === 0 ? (
            <Vide {...circoInconnue(nom)} />
          ) : (
            <Vide {...VOTE_AUCUN} />
          )}
          </View>

          {/* ALLER PLUS LOIN */}
          <View style={{ gap: PAS * 2 }}>
            <Etiquette texte="Aller plus loin" />
            <View>
              <Plus premier texte="Qui décide de quoi" onPress={() => router.push("/qui-decide")} />
              <Plus texte="Ce qui arrive au Parlement" onPress={() => router.push("/a-venir")} />
              <Plus dernier texte="D'où viennent ces informations" onPress={() => router.push("/sources")} />
            </View>
          </View>

          {choix ? <CarteMemoire choix={choix} /> : null}
          <Text style={TYPO.note}>Repère ne classe ni ne note personne, et ne compare jamais deux communes.</Text>
        </Page>
      );
    }} />
  );
}
