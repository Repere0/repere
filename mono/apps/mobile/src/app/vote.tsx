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
 * position n'est dite bonne ou mauvaise ; « ses autres votes » sont dans l'ordre du temps. */
import { useState } from "react";
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";
import {
  CONSTITUTION_45_URL, dateFr, ETAPES_LOI, etapeDuScrutin, ligneScrutin, motPosition,
  phraseCirconscription, phraseDenominateurVote, phrasePosition, POSITION_NON_PORTEE, procedure,
  repartitionVote, titreLisible, MOTS, chaineDecision, copieVoteVide, ETAT_VOTE, dossierDuScrutin, dossierReleve, etapesDuScrutin,
  metaScrutin, resultatScrutin, dateCourte, ordinal,
} from "@repere/core";
import { Carte, LienSortant, Segments, Vide } from "../lib/composants";
import { srcScrutins, srcVote } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, POLICE, RAYON, TYPO, CIBLE } from "../lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { ResumeClair } from "../ui/resume-clair";
import { Frise, Repartition } from "../ui/visuels";
import { SignalerErreur } from "../ui/contact";
import { Timeline } from "../ui/timeline";
import { DataBadge, StatCard } from "../ui/donnees";
import { VoteBarTricolor } from "../ui/stitch";
import { AvatarElu, CreditPhotoElu } from "../ui/avatar";
import { libelleGroupe } from "../ui/badge-groupe";
import { deputeParNom, groupeDe, useGroupes } from "../lib/groupes";
import { useCouleurVote } from "../lib/couleur-vote";
import { enfonce } from "../ui/mouvement";

type FaitVote = { cle: string; type: string; sc: { t: string; d: string; n: string; s: string; dec?: Record<string, string>; dl?: string; dr?: string; dm?: string; dq?: number; et?: { d: string; f?: string; l: string }[] }; position?: string; qui: string; circo: number; ref?: string };

const ETAPES_VISIBLES = 6;

export default function Vote() {
  const { reessayer } = useCommuneChoisie();
  const [toutesEtapes, setToutesEtapes] = useState(false);
  const [titreEntier, setTitreEntier] = useState(false);
  const COULEUR = useCouleurVote();
  const groupes = useGroupes();
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
      const statut = resultatScrutin(vote.sc) as "p" | "c" | null;
      const groupe = groupeDe(vote.ref, groupes);
      /* La photo d'un député est rangée par SON département. */
      const depDepute = deputeParNom(r.deputes, vote.qui)?.dep ?? d.dep;
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
          {/* L'en-tête compact : le même avatar que sur la fiche (ui/avatar) ; une photo affichée a son
              crédit juste sous l'en-tête (D27). Nom, groupe, circonscription, date du scrutin.
              Commune partagée : la phrase qui dit que c'est UN EXEMPLE reste, elle ne se résume pas. */}
          {partagee ? <Text style={TYPO.note}>{phraseCirconscription(d, vote.circo)}</Text> : null}
          <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
            <AvatarElu nom={vote.qui} taille={48} groupe={groupe} echelon="france" dep={depDepute} cle={vote.ref} />
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
                {/* Maillage (07/11/2026) : le nom ouvre la fiche, partout où la fiche sait la retrouver. */}
                <Pressable style={{ flex: 1, minHeight: CIBLE, justifyContent: "center" }} disabled={!parametresFiche} accessibilityRole={parametresFiche ? "link" : "text"}
                  onPress={() => { if (parametresFiche) router.push({ pathname: "/elu", params: parametresFiche }); }}>
                  <Text style={[TYPO.corps, { fontFamily: POLICE.titre }, null]}>{vote.qui}</Text>
                </Pressable>
                <DataBadge texte={dateCourte(vote.sc.d)} />
              </View>
              <Text style={TYPO.micro}>{libelleGroupe(groupe)}</Text>
              <Text style={TYPO.micro}>{ordinal(vote.circo)} circonscription{d.nomDep ? " · " + d.nomDep : ""}</Text>
            </View>
          </View>

          <CreditPhotoElu nom={vote.qui} dep={depDepute} cle={vote.ref} />

          {/* NIVEAU 1 : la position, puis le scrutin en grands nombres (07/11/2026, DA « storytelling »).
              Le titre est l'intitulé OFFICIEL du dossier quand l'Assemblée le publie (souvent plus court),
              sinon celui du scrutin : Repère ne réécrit aucun titre. L'encart « Ce qu'il faut
              retenir » a été retiré le 07/11/2026 : il répétait les grands nombres. */}
          <Carte echelon="france" titre="Le vote">
            <DataBadge texte={mot || "Position non portée"} couleur={mot ? COULEUR[vote.position as keyof typeof COULEUR] : undefined} />
            <Text style={TYPO.question}><Segments s={phrasePosition(vote.position, vote.qui)} /></Text>
            <View style={{ gap: PAS }}>
              {/* Deux lignes au plus ; le titre officiel entier reste lisible d'un geste (jamais réécrit). */}
              <Pressable onPress={() => setTitreEntier(v => !v)} style={{ minHeight: CIBLE, justifyContent: "center" }} accessibilityRole="button" accessibilityState={{ expanded: titreEntier }}
                accessibilityLabel={`${dossier ? dossier.intitule : titreLisible(vote.sc.t)}. ${titreEntier ? "Réduire le titre" : "Afficher le titre entier"}`}>
                <Text style={[TYPO.corps, { fontFamily: POLICE.titre, fontSize: 17, lineHeight: 23 }]} numberOfLines={titreEntier ? undefined : 2}>
                  {dossier ? dossier.intitule : titreLisible(vote.sc.t)}
                </Text>
              </Pressable>
              {dossier ? <Text style={TYPO.note}>Objet du scrutin : {titreLisible(vote.sc.t)}</Text> : null}
              <Text style={TYPO.note}>{metaScrutin(vote.sc)}</Text>
            </View>
            {rep ? (
              <View style={{ gap: PAS * 3 }}>
                <View style={{ flexDirection: "row", gap: PAS * 3 }}>
                  {rep.segments.map(x => <StatCard key={x.cle} valeur={x.nombre.toLocaleString("fr-FR")} libelle={x.libelle} couleur={COULEUR[x.cle as keyof typeof COULEUR]} />)}
                </View>
                {/* Maquette Stitch (09/11/2026) : la jauge tricolore, nombres et pourcentages écrits,
                    et la position du député dans une pastille. */}
                <VoteBarTricolor pour={vote.sc.dec?.pour} contre={vote.sc.dec?.contre} abstention={vote.sc.dec?.abstentions}
                  position={mot ? vote.position : null} qui={vote.qui} />
                <Text style={TYPO.micro}>{phraseDenominateurVote(rep.total)}</Text>
              </View>
            ) : <Text style={TYPO.note}>{ligneScrutin(vote.sc)}</Text>}
            {!mot ? <Text style={TYPO.note}>{POSITION_NON_PORTEE}</Text> : null}
            {/* Le statut du scrutin, écrit en toutes lettres : la couleur du « pour » quand le pour l'a
                emporté (adopté), celle du « contre » quand il a été rejeté (D24 : un fait). */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: PAS * 3 }}>
              {statut ? <DataBadge texte={statut === "p" ? "ADOPTÉ" : "REJETÉ"} couleur={COULEUR[statut]} teinte /> : <View />}
              <PastilleSource source={srcVote(d, vote.sc)} />
            </View>
          </Carte>
          {parametresFiche ? (
            <Pressable onPress={() => router.push({ pathname: "/elu", params: parametresFiche })}
              accessibilityRole="button" accessibilityLabel={`Voir la fiche de ${parametresFiche.nom}`}
              style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
              <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>Voir la fiche de {parametresFiche.nom} ›</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => router.push("/partager")} accessibilityRole="button"
            accessibilityLabel="Partager ce vote en deux cartes"
            style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
            <Text style={[TYPO.corps, { color: couleurs.lien, fontWeight: "600" }]}>Partager ce vote ›</Text>
          </Pressable>

          {/* « En clair » (12/11/2026) : aucun résumé validé n'existe pour ce texte, le bloc le dit et renvoie au dossier officiel. */}
          <ResumeClair resume={null} lienOfficiel={dossier && dossier.url && /^https:\/\//.test(dossier.url) ? dossier.url : undefined} />

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
                  style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
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
