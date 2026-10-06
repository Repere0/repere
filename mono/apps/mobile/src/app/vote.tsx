/* « QU'A VOTÉ VOTRE DÉPUTÉ ? » — UNE QUESTION, UN ECRAN (refonte du 30/09/2026).
 *
 * Niveau 1 : la position, en grand. Niveau 2 : la repartition du scrutin (sur
 * les deputes QUI ONT PRIS PART au vote — c'est ecrit), et pourquoi c'est
 * « votre » depute (commune -> circonscription -> depute -> Assemblee).
 * Niveau 3 : ou en est le texte, sur la frise du parcours d'une loi — pedagogie
 * generale sourcee a la Constitution ; l'etape surlignee vient de l'intitule
 * officiel du scrutin et de rien d'autre. Niveau 4 : le scrutin officiel.
 *
 * Neutralite : trois gris, jamais de vert ni de rouge ; aucune position n'est
 * dite bonne ou mauvaise ; « ses autres votes » sont dans l'ordre du temps. */
import { useState } from "react";
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";
import {
  CONSTITUTION_45_URL, dateFr, ordinal, ETAPES_LOI, etapeDuScrutin, ligneScrutin, motPosition,
  phraseCirconscription, phraseDenominateurVote, phrasePosition, POSITION_NON_PORTEE, procedure,
  repartitionVote, REFUS_APPARIEMENT, titreLisible, MOTS,
} from "@repere/core";
import { Carte, LienSortant, Segments, Vide } from "../lib/composants";
import { circoInconnue, VOTE_AUCUN, VOTES_PAS_ARRIVES, votesNonPublies } from "../lib/absences";
import { srcScrutins, srcVote } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, TYPO, CIBLE } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Frise, Repartition } from "../ui/visuels";

type FaitVote = { cle: string; type: string; sc: { t: string; d: string; n: string; s: string; dec?: Record<string, string> }; position?: string; qui: string; circo: number };

/* PLUSIEURS CIRCONSCRIPTIONS — 06/10/2026. Mesure sur Paris (18) : l'ecran
   montrait le depute de la 1re et affirmait, sous « Pourquoi c'est votre
   député », « Élu par les électeurs de cette circonscription » — faux pour les
   Parisiens des 17 autres. Repere ne connait pas l'adresse du lecteur et ne la
   demande pas : l'ecran le dit, montre la 1re en exemple, et laisse choisir la
   sienne. Le choix vit dans l'ecran, n'est ni garde ni envoye ; une seule
   circonscription a la fois, jamais deux deputes cote a cote. */
const TROUVER_SON_DEPUTE = "https://www.assemblee-nationale.fr/dyn/vos-deputes";

export default function Vote() {
  const { reessayer } = useCommuneChoisie();
  const [circoVue, setCircoVue] = useState<number | null>(null);
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const circos: number[] = Array.isArray(d.fiche.circo) ? d.fiche.circo : [];
      const plusieurs = d.nbCircos > 1;
      const votesCirco = circoVue !== null ? (d.faits as FaitVote[]).filter(x => x.type === "vote" && x.circo === circoVue) : [];
      const vote: FaitVote | undefined = circoVue !== null ? votesCirco[0] : d.dernierVote;
      const entete = <Question emoji="🗳️" etiquette="Votre député" question="Qu'a voté votre député ?" />;
      if (r.votesNonPublies) return <Page>{entete}<Vide {...votesNonPublies(d.nomDep || "ce département")} /></Page>;
      if (!r.votesLus) return <Page>{entete}<Vide {...VOTES_PAS_ARRIVES} action="Réessayer" onAction={reessayer} /></Page>;
      if (!r.votesFiables) return <Page>{entete}<Vide titre={REFUS_APPARIEMENT.titre} corps={REFUS_APPARIEMENT.corps} /></Page>;
      if (!vote) return <Page>{entete}<Vide {...(d.nbCircos === 0 ? circoInconnue(d.nomCommune) : { ...VOTE_AUCUN, corps: POSITION_NON_PORTEE })} /></Page>;

      const rep = repartitionVote(vote.sc);
      const mot = (MOTS as Record<string, string>)[vote.position || ""];
      const etape = etapeDuScrutin(procedure(vote.sc.t));
      const autres = (d.faits as FaitVote[]).filter(x => x.type === "vote" && x.cle !== vote.cle && x.circo === vote.circo).slice(0, 4);
      const depIndex = r.index.departements.find((x: { code: string }) => x.code === d.dep);
      return (
        <Page>
          <Stack.Screen options={{ title: "Votre député" }} />
          {entete}
          {/* La phrase du socle reste celle du site (tests/meme-verite.mjs) ; la
              precision vient a cote. */}
          <Text style={TYPO.note}>{phraseCirconscription(d, vote.circo)}</Text>
          {plusieurs ? <Text style={TYPO.note}>Votre député dépend de votre adresse, que Repère ne connaît pas : choisissez votre circonscription.</Text> : null}
          {plusieurs && circos.length > 1 ? (
            <View style={{ gap: PAS * 2 }}>
              <Text style={TYPO.note} nativeID="choix-circo">Votre circonscription :</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: PAS * 2 }} accessibilityLabelledBy="choix-circo">
                {circos.map(c => {
                  const actif = c === vote.circo;
                  return (
                    <Pressable key={c} onPress={() => setCircoVue(c)} accessibilityRole="button"
                      accessibilityState={{ selected: actif }} accessibilityLabel={`${ordinal(c)} circonscription`}
                      style={({ pressed }) => [{ minWidth: CIBLE, minHeight: CIBLE, alignItems: "center", justifyContent: "center", borderRadius: 999,
                        borderWidth: 1, borderColor: actif ? couleurs.encre : couleurs.trait, backgroundColor: actif ? couleurs.voile : couleurs.carte, paddingHorizontal: PAS * 2 }, pressed && { opacity: 0.6 }]}>
                      <Text style={{ fontSize: 15, fontWeight: actif ? "800" : "600", color: couleurs.encre }}>{ordinal(c)}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <LienSortant url={TROUVER_SON_DEPUTE} texte="Trouver sa circonscription sur le site de l'Assemblée" />
            </View>
          ) : null}

          {/* NIVEAU 1 : la position */}
          <Carte echelon="france" titre={`Le ${dateFr(vote.sc.d)}`}>
            <Text style={TYPO.question}><Segments s={phrasePosition(vote.position, vote.qui)} /></Text>
            <Text style={[TYPO.reponse, { fontSize: 19, lineHeight: 25 }]}>{titreLisible(vote.sc.t)}</Text>
            <Text style={TYPO.note}>{ligneScrutin(vote.sc)}</Text>
            {!mot ? <Text style={TYPO.note}>{POSITION_NON_PORTEE}</Text> : null}
            <PastilleSource source={srcVote(d, vote.sc)} />
          </Carte>

          {/* NIVEAU 2 : le scrutin, visuellement */}
          {rep ? (
            <Carte echelon="france" titre="Comment l'Assemblée a voté">
              <Repartition segments={rep.segments} total={rep.total} position={vote.position} qui={vote.qui} />
              <Text style={TYPO.micro}>{phraseDenominateurVote(rep.total)}</Text>
              <PastilleSource source={srcVote(d, vote.sc)} />
            </Carte>
          ) : null}

          {/* POURQUOI C'EST « VOTRE » DEPUTE */}
          {/* « Élu par … » accordait au masculin une deputee : la phrase est
             desormais sans genre (06/10/2026). */}
          <Carte echelon="france" titre={plusieurs ? "Comment trouver votre député" : "Pourquoi c'est votre député"}>
            <Frise etiquette="De votre commune à l'Assemblée" jalons={[
              { cle: "c", titre: d.nomCommune, texte: plusieurs ? `Partagée entre ${d.nbCircos} circonscriptions : c'est votre adresse qui décide de la vôtre.` : "Votre commune.", echelon: "ville" },
              { cle: "ci", titre: `${ordinal(vote.circo)} circonscription${depIndex ? " · " + depIndex.nom : ""}`, texte: plusieurs ? "Celle qui est affichée ici." : "Le territoire qui élit un député. Il regroupe plusieurs communes, ou une partie d'une grande ville.", echelon: "france" },
              { cle: "d", titre: vote.qui, texte: "Siège à l'Assemblée pour les électeurs de cette circonscription.", echelon: "france", actif: true },
              { cle: "an", titre: "Assemblée nationale", texte: "577 députés y votent les lois et le budget de l'État.", echelon: "france" },
            ]} />
          </Carte>

          {/* NIVEAU 3 : ou en est le texte */}
          <Carte echelon="france" titre="Où en est ce texte ?">
            {etape ? (
              <Text style={TYPO.note}>Ce vote porte sur l'étape surlignée ; les autres étapes expliquent le parcours général d'une loi.</Text>
            ) : (
              <Text style={TYPO.note}>L'intitulé officiel de ce scrutin ne précise pas l'étape de la procédure : Repère n'en surligne aucune.</Text>
            )}
            <Frise etiquette="Le parcours d'une loi" jalons={ETAPES_LOI.map(e => ({
              cle: e.cle, titre: e.titre, texte: e.texte, echelon: "france", actif: e.cle === etape,
            }))} />
            <PastilleSource source={{ producteur: "Constitution du 4 octobre 1958 (articles 10, 39 et 45)", court: "Constitution, art. 39 et 45", url: CONSTITUTION_45_URL }} />
          </Carte>

          {/* SES AUTRES VOTES, dans l'ordre du temps */}
          {autres.length ? (
            <Carte echelon="france" titre="Ses votes précédents">
              {autres.map(a => (
                <View key={a.cle} style={{ gap: 2, paddingBottom: PAS * 2 }}
                  accessible accessibilityLabel={`${dateFr(a.sc.d)} : ${titreLisible(a.sc.t)}. ${motPosition(a.position) ? "A voté " + motPosition(a.position) : "Position non portée par le relevé"}.`}>
                  <Text style={TYPO.micro}>{dateFr(a.sc.d)} · texte {a.sc.s}</Text>
                  <Text style={TYPO.corps}>{titreLisible(a.sc.t)}</Text>
                  <Text style={[TYPO.note, { fontWeight: "700" }]}>{motPosition(a.position) ? "A voté " + motPosition(a.position) : "Position non portée par le relevé"}</Text>
                </View>
              ))}
              <Text style={TYPO.micro}>Scrutins solennels relevés, du plus récent au plus ancien.</Text>
            </Carte>
          ) : null}

          <Pressable accessibilityRole="button" accessibilityLabel="Voir les scrutins publics et les votes détaillés" onPress={() => router.push("/scrutins")} style={{ minHeight: CIBLE, justifyContent: "center", marginTop: PAS * 2 }}><Text style={{ color: couleurs.lien, fontWeight: "600" }}>Voir les scrutins publics et les votes détaillés ›</Text></Pressable>
          <PastilleSource source={srcScrutins(d)} />
        </Page>
      );
    }} />
  );
}
