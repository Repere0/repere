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
import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";
import {
  CONSTITUTION_45_URL, dateFr, ETAPES_LOI, etapeDuScrutin, ligneScrutin, motPosition,
  phraseCirconscription, phraseDenominateurVote, phrasePosition, POSITION_NON_PORTEE, procedure,
  repartitionVote, REFUS_APPARIEMENT, titreLisible, MOTS, ordinal,
} from "@repere/core";
import { Carte, Segments, Vide } from "../lib/composants";
import { circoInconnue, refusAppariement, VOTE_AUCUN, VOTES_PAS_ARRIVES } from "../lib/absences";
import { srcScrutins, srcVote } from "../lib/sources";
import { useCommuneChoisie } from "../lib/useCommune";
import { couleurs, PAS, TYPO, CIBLE } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { Termes } from "../lib/termes";
import { Depli, Frise, Repartition } from "../ui/visuels";
import { Etiq } from "../ui/signatures";
import { IconePartage } from "../ui/icones";

/* DENSITE (16/10/2026). Mesure : 3,8 hauteurs d'ecran (3 188 px a 390 x 844). La
   repartition rejoint la carte du vote ; « pourquoi c'est votre depute » tient en une
   ligne (la frise detaillee se deplie) ; « ou en est ce texte » montre l'etape du
   vote, les six etapes se deplient ; deux votes precedents, les autres se deplient. */
function Chemin({ etapes }: { etapes: string[] }) {
  return (
    <View accessible accessibilityLabel={etapes.join(", puis ")} style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: PAS }}>
      {etapes.map((e, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: PAS }}>
          <Text style={[TYPO.corps, { fontWeight: i === etapes.length - 2 ? "800" : "600" }]}>{e}</Text>
          {i < etapes.length - 1 ? <Text style={[TYPO.corps, { color: couleurs.sourd }]}>›</Text> : null}
        </View>
      ))}
    </View>
  );
}

function AutreVote({ a }: { a: FaitVote }) {
  return (
    <View style={{ gap: 2, paddingBottom: PAS * 2 }}
      accessible accessibilityLabel={`${dateFr(a.sc.d)} : ${titreLisible(a.sc.t)}. ${motPosition(a.position) ? "A voté " + motPosition(a.position) : "Position non portée par le relevé"}.`}>
      <Text style={TYPO.micro}>{dateFr(a.sc.d)} · texte {a.sc.s}</Text>
      <Text style={TYPO.corps}>{titreLisible(a.sc.t)}</Text>
      <Text style={[TYPO.note, { fontWeight: "700" }]}>{motPosition(a.position) ? "A voté " + motPosition(a.position) : "Position non portée par le relevé"}</Text>
    </View>
  );
}

type FaitVote = { cle: string; type: string; sc: { t: string; d: string; n: string; s: string; dec?: Record<string, string> }; position?: string; qui: string; circo: number };

export default function Vote() {
  const { reessayer } = useCommuneChoisie();
  return (
    <AvecDonnees rendu={r => {
      const { d } = r;
      const vote: FaitVote | undefined = d.dernierVote;
      /* 15/10/2026 : partagee entre plusieurs circonscriptions, la page montre le vote d'UN
         depute, en exemple : la question le dit. */
      /* Sans etiquette ni emoji (16/10/2026) : la barre haute dit deja « Votre député ». */
      const entete = <Question question={d.nbCircos > 1 ? `Qu'a voté un député de ${d.nomCommune} ?` : "Qu'a voté votre député ?"} />;
      if (!r.votesLus) return <Page>{entete}<Vide {...VOTES_PAS_ARRIVES} action="Réessayer" onAction={reessayer} /></Page>;
      if (!r.votesFiables) return <Page>{entete}<Vide {...refusAppariement(REFUS_APPARIEMENT)} /></Page>;
      if (!vote) return <Page>{entete}<Vide {...(d.nbCircos === 0 ? circoInconnue(d.nomCommune, r.index?.sources?.circonscriptions?.url) : { ...VOTE_AUCUN, corps: POSITION_NON_PORTEE })} /></Page>;

      const rep = repartitionVote(vote.sc);
      const mot = (MOTS as Record<string, string>)[vote.position || ""];
      const etape = etapeDuScrutin(procedure(vote.sc.t));
      const etapeCourante = ETAPES_LOI.find(e => e.cle === etape) || null;
      const autres = (d.faits as FaitVote[]).filter(x => x.type === "vote" && x.cle !== vote.cle && x.circo === vote.circo).slice(0, 4);
      const depIndex = r.index.departements.find((x: { code: string }) => x.code === d.dep);
      /* POURQUOI CE DEPUTE, DES LE HAUT (16/10/2026, audit Lovable). Le lien commune ->
         circonscription etait dans la deuxieme carte, puis replie ; pour une commune
         partagee (Paris : 18 circonscriptions), le fait que ce vote n'est qu'UN exemple
         n'etait plus lisible qu'au titre. Une phrase sous le titre, dans les deux cas. */
      const pourquoi = d.nbCircos > 1
        ? `${d.nomCommune} est partagée entre ${d.nbCircos} circonscriptions\u00a0: votre député dépend de votre adresse, que Repère ne demande pas. Voici, en exemple, le vote du député de la ${ordinal(vote.circo)}.`
        : `${d.nomCommune} est dans la ${ordinal(vote.circo)} circonscription${depIndex ? ` de ${depIndex.nom.replace(/-/g, "\u2011")}` : ""}\u00a0: voici le vote de son député.`;
      return (
        <Page>
          <Stack.Screen options={{ title: "Votre député" }} />
          <Question question={d.nbCircos > 1 ? `Qu'a voté un député de ${d.nomCommune} ?` : "Qu'a voté votre député ?"} sous={pourquoi} />

          {/* NIVEAU 1 : la position */}
          <Carte echelon="france" titre={`Le ${dateFr(vote.sc.d)}`}>
            {/* LA LIGNE D'ETIQUETTES (20/10/2026, maquettes du porteur) : la nature du
               scrutin et son sort, cote a cote, avant la position. Le sort vient du
               champ `s` publie par l'Assemblee (« adopté », « rejeté »), jamais d'un
               calcul : il est teinte selon ce que la source dit, et il dit ce que le
               texte est devenu, pas si c'est une bonne chose. */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, flexWrap: "wrap" }}>
              <Etiq texte="Scrutin public" />
              {vote.sc.s ? (
                <Etiq texte={vote.sc.s}
                  fond={/adopt/i.test(vote.sc.s) ? couleurs.accentVoile : couleurs.corailVoile}
                  texteCouleur={/adopt/i.test(vote.sc.s) ? couleurs.accent : couleurs.corail} />
              ) : null}
            </View>
            <Text style={TYPO.question}><Segments s={phrasePosition(vote.position, vote.qui)} /></Text>
            <Text style={[TYPO.reponse, { fontSize: 19, lineHeight: 25 }]}>{titreLisible(vote.sc.t)}</Text>
            {/* le numero du scrutin, pour le retrouver sur le site de l'Assemblee (audit Lovable) */}
            <Text style={TYPO.note}>{`${ligneScrutin(vote.sc)} Scrutin n°\u00a0${vote.sc.n}.`}</Text>
            {!mot ? <Text style={TYPO.note}>{POSITION_NON_PORTEE}</Text> : null}
            {/* Comment l'Assemblee a vote : dans la meme carte que la position. */}
            {rep ? (
              <View style={{ gap: PAS * 2 }}>
                <Text style={[TYPO.etiquette, { color: couleurs.encre }]}>Comment l'Assemblée a voté</Text>
                <Repartition segments={rep.segments} total={rep.total} position={vote.position} qui={vote.qui} />
                <Text style={TYPO.micro}>{phraseDenominateurVote(rep.total)}</Text>
              </View>
            ) : null}
            {/* La source et le partage sur une ligne, au pied de la carte (16/10/2026) : avant,
               « Partager ce vote › » flottait seul entre deux cartes. */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: PAS * 2 }}>
              <PastilleSource source={srcVote(d, vote.sc)} />
              <Pressable onPress={() => router.push("/partager")} accessibilityRole="button"
                accessibilityLabel="Partager ce vote en deux cartes"
                style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 2, opacity: pressed ? 0.6 : 1 })}>
                <IconePartage couleur={couleurs.lien} />
                <Text style={{ color: couleurs.lien, fontWeight: "700", fontSize: 15 }}>Partager</Text>
              </Pressable>
            </View>
          </Carte>

          {/* POURQUOI C'EST « VOTRE » DEPUTE : le chemin suffit a repondre ; la phrase de la
             circonscription et le sens de chaque etape se deplient (16/10/2026). */}
          <Carte echelon="france" titre="Pourquoi c'est votre député">
            <Chemin etapes={[d.nomCommune, `${vote.circo === 1 ? "1re" : vote.circo + "e"} circonscription`, vote.qui, "Assemblée nationale"]} />
            <Depli titre="Ce que veut dire chaque étape">
            <Termes texte={phraseCirconscription(d, vote.circo)} />
            <Frise etiquette="De votre commune à l'Assemblée" jalons={[
              { cle: "c", titre: d.nomCommune, texte: "Votre commune.", echelon: "ville" },
              { cle: "ci", titre: `${vote.circo === 1 ? "1re" : vote.circo + "e"} circonscription${depIndex ? " · " + depIndex.nom : ""}`, texte: "Le territoire qui élit un député. Il regroupe plusieurs communes, ou une partie d'une grande ville.", echelon: "france" },
              { cle: "d", titre: vote.qui, texte: "Élu par les électeurs de cette circonscription.", echelon: "france", actif: true },
              { cle: "an", titre: "Assemblée nationale", texte: "577 députés y votent les lois et le budget de l'État.", echelon: "france" },
            ]} />
            </Depli>
          </Carte>

          {/* NIVEAU 3 : ou en est le texte */}
          <Carte echelon="france" titre="Où en est ce texte ?">
            {etapeCourante ? (
              <View style={{ gap: PAS }}>
                {/* « Etape de ce vote », pas « Etape 4 sur 6 » (16/10/2026) : le rang venait de
                    l'ordre pedagogique lineaire et laissait croire qu'il restait deux etapes a
                    un texte deja adopte. L'etape vient de l'intitule officiel du scrutin. */}
                <Text style={TYPO.reponse}>{`Étape de ce vote : ${etapeCourante.titre}`}</Text>
                <Text style={TYPO.note}>{etapeCourante.texte}</Text>
              </View>
            ) : (
              <Text style={TYPO.note}>L'intitulé officiel de ce scrutin ne précise pas l'étape de la procédure : Repère n'en surligne aucune.</Text>
            )}
            <Depli titre={`Le parcours d'une loi, en ${ETAPES_LOI.length} étapes`}>
              <Frise etiquette="Le parcours d'une loi" jalons={ETAPES_LOI.map(e => ({
                cle: e.cle, titre: e.titre, texte: e.texte, echelon: "france", actif: e.cle === etape,
              }))} />
            </Depli>
            <PastilleSource source={{ producteur: "Constitution du 4 octobre 1958 (articles 10, 39 et 45)", court: "Constitution, art. 39 et 45", url: CONSTITUTION_45_URL }} />
          </Carte>

          {/* SES AUTRES VOTES, dans l'ordre du temps */}
          {autres.length ? (
            <Carte echelon="france" titre="Ses votes précédents">
              {autres.slice(0, 2).map(a => <AutreVote key={a.cle} a={a} />)}
              {autres.length > 2 ? (
                <Depli titre={`Voir ${autres.length - 2 > 1 ? `ses ${autres.length - 2} autres votes` : "son autre vote"}`}>
                  {autres.slice(2).map(a => <AutreVote key={a.cle} a={a} />)}
                </Depli>
              ) : null}
              <Termes style={TYPO.micro} texte="Scrutins solennels relevés, du plus récent au plus ancien." />
            </Carte>
          ) : null}

          <Pressable accessibilityRole="button" accessibilityLabel="Voir les scrutins publics et les votes détaillés" onPress={() => router.push("/scrutins")} style={{ minHeight: CIBLE, justifyContent: "center", marginTop: PAS * 2 }}><Text style={{ color: couleurs.lien, fontWeight: "600" }}>Voir les scrutins publics et les votes détaillés ›</Text></Pressable>
          <PastilleSource source={srcScrutins(d)} />
        </Page>
      );
    }} />
  );
}
