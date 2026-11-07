/* « QU'A VOTÉ VOTRE DÉPUTÉ ? » — UNE QUESTION, UN ECRAN (refonte du 30/09/2026).
 *
 * Niveau 1 : la position, en grand. Niveau 2 : la repartition du scrutin (sur
 * les deputes QUI ONT PRIS PART au vote — c'est ecrit), et pourquoi c'est
 * « votre » depute (commune -> circonscription -> depute -> Assemblee).
 * Niveau 3 : ou en est le texte, sur la frise du parcours d'une loi — pedagogie
 * generale sourcee a la Constitution ; l'etape surlignee vient de l'intitule
 * officiel du scrutin et de rien d'autre. Niveau 4 : le scrutin officiel.
 *
 * Neutralite : les couleurs de vote codent un FAIT (D24), le mot reste ecrit ; aucune
 * position n'est dite bonne ou mauvaise ; l'encart « retenir » reste gris ; « ses autres votes » sont dans l'ordre du temps. */
import { useState } from "react";
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";
import {
  CONSTITUTION_45_URL, dateFr, ETAPES_LOI, etapeDuScrutin, ligneScrutin, motPosition,
  phraseCirconscription, phraseDenominateurVote, phrasePosition, POSITION_NON_PORTEE, procedure,
  repartitionVote, titreLisible, MOTS, chaineDecision, copieVoteVide, ETAT_VOTE, dossierDuScrutin, dossierReleve, etapesDuScrutin,
  metaScrutin, retenirDuScrutin,
} from "@repere/core";
import { Carte, LienSortant, Segments, Vide } from "../lib/composants";
import { srcScrutins, srcVote } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, RAYON, TYPO, CIBLE } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Frise, Repartition } from "../ui/visuels";
import { SignalerErreur } from "../ui/contact";
import { Timeline } from "../ui/timeline";
import { DataBadge, Encart, StatCard } from "../ui/donnees";
import { useCouleurVote } from "../lib/couleur-vote";

type FaitVote = { cle: string; type: string; sc: { t: string; d: string; n: string; s: string; dec?: Record<string, string>; dl?: string; dr?: string; dm?: string; dq?: number; et?: { d: string; f?: string; l: string }[] }; position?: string; qui: string; circo: number };

const ETAPES_VISIBLES = 6;

export default function Vote() {
  const { reessayer } = useCommuneChoisie();
  const [toutesEtapes, setToutesEtapes] = useState(false);
  const COULEUR = useCouleurVote();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const vote: FaitVote | undefined = d.dernierVote;
      /* Commune partagée : le vote affiché est celui d'un exemple, pas « votre » député (invariant 3). */
      const partagee = d.nbCircos > 1;
      const entete = <Question etiquette={partagee ? "Un député de votre commune" : "Votre député"} question={partagee ? "Qu'a voté un député de votre commune ?" : "Qu'a voté votre député ?"} />;
      if (!r.votesLus) return <Page>{entete}<Vide {...copieVoteVide(ETAT_VOTE.RELEVE_NON_LU)} action="Réessayer" onAction={reessayer} /></Page>;
      if (!r.votesFiables) return <Page>{entete}<Vide {...copieVoteVide(ETAT_VOTE.RELEVE_INCOHERENT)} /></Page>;
      /* Un seul endroit décide du texte du vide : @repere/core (votesVides.js). */
      if (!vote) return <Page>{entete}<Vide {...copieVoteVide(d.etatVote, { nom: d.nomCommune, releve: srcScrutins(d)?.releve, portee: d.srcScrutins && d.srcScrutins.portee })} /></Page>;

      const rep = repartitionVote(vote.sc);
      const retenir = retenirDuScrutin(vote.sc);
      const dossier = dossierDuScrutin(vote.sc);
      const etapes = etapesDuScrutin(vote.sc);
      const MOTS_POS = MOTS as Record<string, string>;
      const mot = MOTS_POS[vote.position || ""];
      const etape = etapeDuScrutin(procedure(vote.sc.t));
      const autres = (d.faits as FaitVote[]).filter(x => x.type === "vote" && x.cle !== vote.cle && x.circo === vote.circo).slice(0, 4);
      const depIndex = r.index.departements.find((x: { code: string }) => x.code === d.dep);
      /* Le député : le niveau « France » de la chaîne de décision, celui de « Qui décide ».
         Sa fiche s'ouvre avec les mêmes paramètres que depuis cet onglet. */
      type NiveauFiche = { echelon: string; niveau?: string; institution?: string; lieu?: string; personne?: { nom: string; role?: string } | null };
      const fiche = (chaineDecision({ fiche: d.fiche, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: d.dep }) as NiveauFiche[])
        .find(n => n.echelon === "france" && n.personne);
      const parametresFiche = fiche && fiche.personne ? {
        nom: fiche.personne.nom, role: fiche.personne.role ?? "", echelon: fiche.echelon,
        niveau: fiche.niveau ?? "", institution: fiche.institution ?? "", lieu: fiche.lieu ?? "",
      } : null;
      return (
        <Page>
          <Stack.Screen options={{ title: partagee ? "Un député de votre commune" : "Votre député" }} />
          {entete}
          <Text style={TYPO.note}>{phraseCirconscription(d, vote.circo)}</Text>

          {/* NIVEAU 1 : la position, puis le scrutin en grands nombres (07/11/2026, DA « storytelling »).
              Le titre est l'intitulé OFFICIEL du dossier quand l'Assemblée le publie (souvent plus court),
              sinon celui du scrutin : Repère ne réécrit aucun titre. La phrase « Ce qu'il faut retenir »
              sort d'un gabarit de @repere/core (retenirDuScrutin), appliqué au seul décompte. */}
          <Carte echelon="france" titre="Le vote">
            <DataBadge texte={mot || "Position non portée"} couleur={mot ? COULEUR[vote.position as keyof typeof COULEUR] : undefined} />
            <Text style={TYPO.question}><Segments s={phrasePosition(vote.position, vote.qui)} /></Text>
            <View style={{ gap: PAS }}>
              <Text style={[TYPO.reponse, { fontSize: 19, lineHeight: 25 }]}>{dossier ? dossier.intitule : titreLisible(vote.sc.t)}</Text>
              {dossier ? <Text style={TYPO.note}>Objet du scrutin : {titreLisible(vote.sc.t)}</Text> : null}
              <Text style={TYPO.donnee}>{metaScrutin(vote.sc)}</Text>
            </View>
            {rep ? (
              <View style={{ gap: PAS * 3 }}>
                <View style={{ flexDirection: "row", gap: PAS * 3 }}>
                  {rep.segments.map(x => <StatCard key={x.cle} valeur={x.nombre.toLocaleString("fr-FR")} libelle={x.libelle} couleur={COULEUR[x.cle as keyof typeof COULEUR]} />)}
                </View>
                <Repartition compact segments={rep.segments} total={rep.total} position={vote.position} qui={vote.qui} />
                <Text style={TYPO.micro}>{phraseDenominateurVote(rep.total)}</Text>
              </View>
            ) : <Text style={TYPO.note}>{ligneScrutin(vote.sc)}</Text>}
            {retenir ? (
              <Encart titre="Ce qu'il faut retenir">
                <Text style={TYPO.corps}>{retenir.phrase}</Text>
                {retenir.calcul ? <Text style={TYPO.micro}>Calcul de Repère à partir du décompte officiel.</Text> : null}
              </Encart>
            ) : null}
            {!mot ? <Text style={TYPO.note}>{POSITION_NON_PORTEE}</Text> : null}
            <PastilleSource source={srcVote(d, vote.sc)} />
          </Carte>
          {parametresFiche ? (
            <Pressable onPress={() => router.push({ pathname: "/elu", params: parametresFiche })}
              accessibilityRole="button" accessibilityLabel={`Voir la fiche de ${parametresFiche.nom}`}
              style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
              <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>Voir la fiche de {parametresFiche.nom} ›</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => router.push("/partager")} accessibilityRole="button"
            accessibilityLabel="Partager ce vote en deux cartes"
            style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
            <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>Partager ce vote ›</Text>
          </Pressable>

          {/* DE QUOI PARLE CE TEXTE (05/11/2026) : l'intitulé officiel du dossier et qui a demandé
              le scrutin public, tels que l'Assemblée les publie dans le scrutin. Aucun résumé écrit
              par Repère. Dossier lu et absent : une phrase vraie. Champ pas encore relevé : rien. */}
          {dossier || dossierReleve(vote.sc) ? <Carte echelon="france" titre="De quoi parle ce texte ?">
            {dossier ? (
              <>
                <Text style={TYPO.note}>Le titre du vote, plus haut, est l'intitulé de ce dossier à l'Assemblée nationale.</Text>
                {dossier.demandeur ? <Text style={TYPO.note}>Vote public demandé par : {dossier.demandeur}.</Text> : null}
                {dossier.url ? <LienSortant url={dossier.url} texte="Le dossier complet : texte, rapports, étapes" /> : null}
              </>
            ) : (
              <Text style={TYPO.note}>L'Assemblée ne rattache ce scrutin à aucun dossier législatif dans ses données. Le détail est sur la page officielle du scrutin.</Text>
            )}
            <PastilleSource source={srcVote(d, vote.sc)} />
          </Carte> : null}

          {/* POURQUOI C'EST « VOTRE » DEPUTE */}
          <Carte echelon="france" titre={d.nbCircos > 1 ? "Pourquoi ce député est pris en exemple" : "Pourquoi c'est votre député"}>
            <Frise etiquette="De votre commune à l'Assemblée" jalons={[
              { cle: "c", titre: d.nomCommune, texte: "Votre commune.", echelon: "ville" },
              { cle: "ci", titre: `${vote.circo === 1 ? "1re" : vote.circo + "e"} circonscription${depIndex ? " · " + depIndex.nom : ""}`, texte: "Le territoire qui élit un député. Il regroupe plusieurs communes, ou une partie d'une grande ville.", echelon: "france" },
              { cle: "d", titre: vote.qui, texte: "Élu par les électeurs de cette circonscription.", echelon: "france", actif: true },
              { cle: "an", titre: "Assemblée nationale", texte: "Au plus 577 députés y votent les lois et le budget de l'État, selon l'article 24 de la Constitution.", echelon: "france" },
            ]} />
            <PastilleSource source={{ producteur: "Constitution du 4 octobre 1958, article 24", court: "Constitution, art. 24", url: CONSTITUTION_45_URL }} />
          </Carte>

          {/* LES ETAPES DE CE TEXTE (05/11/2026) : les actes datés du dossier législatif, tels que
              l'Assemblée les publie. Sans étape dans le relevé, la section n'existe pas et le
              parcours général ci-dessous reste le repère. */}
          {etapes.length ? (
            <Carte echelon="france" titre="Les étapes de ce texte">
              {/* Mesure (05/11/2026, 12 textes) : de 5 à 39 étapes. Les 6 plus récentes d'abord, le reste sur demande. */}
              {!toutesEtapes && etapes.length > ETAPES_VISIBLES ? (
                <Text style={TYPO.note}>{etapes.length - ETAPES_VISIBLES} étapes plus anciennes ne sont pas affichées.</Text>
              ) : null}
              <Timeline etapes={toutesEtapes ? etapes : etapes.slice(-ETAPES_VISIBLES)} etiquette="Les étapes de ce texte, de la plus ancienne à la plus récente" />
              {etapes.length > ETAPES_VISIBLES ? (
                <Pressable onPress={() => setToutesEtapes(v => !v)} accessibilityRole="button" accessibilityState={{ expanded: toutesEtapes }}
                  style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
                  <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>{toutesEtapes ? "Afficher seulement les plus récentes" : `Voir les ${etapes.length} étapes`}</Text>
                </Pressable>
              ) : null}
              <PastilleSource source={{ producteur: "Assemblée nationale — dossiers législatifs", court: "Assemblée nationale", url: dossier && dossier.url ? dossier.url : "https://data.assemblee-nationale.fr/travaux-parlementaires/dossiers-legislatifs" }} />
            </Carte>
          ) : null}

          {/* NIVEAU 3 : ou en est le texte */}
          {!etapes.length ? <Carte echelon="france" titre="Où en est ce texte ?">
            {etape ? (
              <Text style={TYPO.note}>Ce vote porte sur l'étape surlignée ; les autres étapes expliquent le parcours général d'une loi.</Text>
            ) : (
              <Text style={TYPO.note}>L'intitulé officiel de ce scrutin ne précise pas l'étape de la procédure : Repère n'en surligne aucune.</Text>
            )}
            <Frise etiquette="Le parcours d'une loi" jalons={ETAPES_LOI.map(e => ({
              cle: e.cle, titre: e.titre, texte: e.texte, echelon: "france", actif: e.cle === etape,
            }))} />
            <PastilleSource source={{ producteur: "Constitution du 4 octobre 1958 (articles 10, 39 et 45)", court: "Constitution, art. 39 et 45", url: CONSTITUTION_45_URL }} />
          </Carte> : null}

          {/* SES AUTRES VOTES, dans l'ordre du temps */}
          {autres.length ? (
            <Carte echelon="france" titre="Ses votes précédents">
              <View style={{ gap: PAS * 3 }}>
              {autres.map(a => (
                <View key={a.cle} style={{ flexDirection: "row", gap: PAS * 3, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.voile }}
                  accessible accessibilityLabel={`${dateFr(a.sc.d)} : ${titreLisible(a.sc.t)}. ${motPosition(a.position) ? "A voté " + motPosition(a.position) : "Position non portée par le relevé"}.`}>
                  <Ionicons name="document-text-outline" size={22} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
                  <View style={{ flex: 1, gap: PAS * 2 }}>
                    <Text style={TYPO.donnee}>{dateFr(a.sc.d)} · texte {a.sc.s}</Text>
                    <Text style={TYPO.corps}>{titreLisible(a.sc.t)}</Text>
                    <DataBadge texte={MOTS_POS[a.position || ""] ? "A voté " + motPosition(a.position) : "Position non portée par le relevé"}
                      couleur={MOTS_POS[a.position || ""] ? COULEUR[a.position as keyof typeof COULEUR] : undefined} />
                  </View>
                </View>
              ))}
              </View>
              <Text style={TYPO.micro}>Derniers votes solennels récupérés par Repère : des scrutins publics, généralement sur le vote d'ensemble d'un texte majeur, c'est-à-dire le vote sur le texte entier. Du plus récent au plus ancien.</Text>
            </Carte>
          ) : null}

          <Pressable accessibilityRole="button" accessibilityLabel="Voir les scrutins publics et les votes détaillés" onPress={() => router.push("/scrutins")} style={{ minHeight: CIBLE, justifyContent: "center", marginTop: PAS * 2 }}><Text style={{ color: couleurs.lien, fontWeight: "600" }}>Voir les scrutins publics et les votes détaillés ›</Text></Pressable>
          <PastilleSource source={srcScrutins(d)} />
          <SignalerErreur contexte={`le vote de ${vote.qui}`} donnee={`${dateFr(vote.sc.d)} · ${titreLisible(vote.sc.t)} · ${vote.qui}`} />
        </Page>
      );
    }} />
  );
}
