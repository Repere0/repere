/* « VOICI CE QUI SE PASSE CHEZ VOUS » — LA PREMIERE TRANCHE VERTICALE (29/09/2026).
 *
 * Parcours : qui decide (le maire) -> un projet finance dans la commune ->
 * le depute de la circonscription -> son dernier vote, explique -> les
 * sources -> retour a l'accueil.
 *
 * RIEN N'EST CALCULE ICI. Les fichiers sont ceux du site (@repere/data-utils,
 * un fichier par departement, jamais par commune) ; la derivation est celle
 * du site (@repere/core, deriverAujourdhui). Les phrases reprennent celles de
 * apps/web/src/routes/Aujourdhui.jsx. Si ce fichier se met a calculer un
 * fait, le web et le telephone pourront un jour dire deux choses differentes :
 * c'est le defaut que @repere/core existe pour empecher. */
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import {
  deriverAujourdhui, dateFr, euros, ordinal, titreLisible, procedure, decompte, MOTS,
  ancienneCommune, noteRattachement, positionsFiables, REFUS_APPARIEMENT,
} from "@repere/core";
import {
  chargerIndex, chargerDepartement, chargerProjets, chargerDeputes, chargerCatalogueScrutins,
  chargerVotes, chargerCalendrierSenat, chargerAgendaAN, chargerEvenements, ETATS, PHRASES,
} from "../lib/donnees";
import { Bouton, Carte, LienSortant, Source, Texte, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { couleurs, PAS } from "../lib/theme";

const DGCL_URL = "https://www.data.gouv.fr/datasets/projets-finances-par-les-dotations-de-soutien-a-linvestissement-des-collectivites-territoriales";
const RESULTAT = (x: string) => (x === "adopté" ? "adopté" : x === "rejeté" ? "rejeté" : x);

/* Les fichiers publies ne sont pas types : on les lit comme des objets
   ouverts, et chaque absence est traitee comme une absence (invariant 5). */
type Ouvert = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export default function ChezVous() {
  const marges = useSafeAreaInsets();
  const { choix } = useSelection();
  const [etat, setEtat] = useState<string>(ETATS.EN_COURS);
  const [d, setD] = useState<Ouvert>(null);
  const [srcElus, setSrcElus] = useState<Ouvert>(null);
  const [fiable, setFiable] = useState(true);
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    if (!choix) return undefined;
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    const { dep, insee } = choix;
    Promise.all([
      chargerIndex(), chargerDepartement(dep), chargerProjets(dep), chargerDeputes(), chargerCatalogueScrutins(),
      chargerVotes(dep), chargerCalendrierSenat(), chargerEvenements(), chargerAgendaAN(),
    ]).then(([ix, pq, pr, de, c, v, ca, ev, an]) => {
      if (!vivant) return;
      const paquet: Ouvert = pq.donnees;
      const fiche = paquet && paquet.communes ? paquet.communes[insee] : null;
      if (!fiche) { setEtat(pq.donnees ? ETATS.INTROUVABLE : pq.etat); return; }
      setFiable(positionsFiables(c.donnees, v.donnees));
      setSrcElus(ix.donnees && (ix.donnees as Ouvert).sources ? (ix.donnees as Ouvert).sources.elus : null);
      setD(deriverAujourdhui({
        fiche, commune: insee, dep, index: ix.donnees, projets: pr.donnees, cat: c.donnees, pos: v.donnees,
        deputes: de.donnees, cal: ca.donnees, agendaAN: an.donnees, evenements: ev.donnees, maintenant: new Date(),
      }));
      setEtat(ETATS.SERVI);
    });
    return () => { vivant = false; };
  }, [choix, essai]);

  if (!choix) {
    return (
      <View style={[s.page, { paddingTop: PAS * 6 }]}>
        <Vide titre="Aucune commune n'est choisie." corps="Revenez à l'accueil et tapez le nom de votre commune." />
        <Bouton texte="Revenir à l'accueil" onPress={() => router.replace("/")} />
      </View>
    );
  }

  if (etat !== ETATS.SERVI || !d) {
    const p = (PHRASES as Record<string, { titre: string; corps: string }>)[etat] || PHRASES[ETATS.ECHEC];
    return (
      <View style={[s.page, { paddingTop: PAS * 6 }]}>
        <Vide titre={p.titre} corps={p.corps}
          action={etat === ETATS.EN_COURS ? undefined : "Réessayer"} onAction={() => setEssai(n => n + 1)} />
      </View>
    );
  }

  const fiche = d.fiche;
  const vote = d.dernierVote;
  const projet = d.dernierProjet;
  const mot = vote ? (MOTS as Record<string, string>)[vote.position] : undefined;
  const proc = vote ? procedure(vote.sc.t) : "";

  return (
    <ScrollView contentContainerStyle={[s.page, { paddingBottom: marges.bottom + PAS * 8 }]}>
      <Stack.Screen options={{ title: d.nomCommune }} />
      <View style={s.tete}>
        <Text style={s.titre} accessibilityRole="header">Voici ce qui se passe chez vous</Text>
        <Text style={s.lieu}>{d.nomCommune}{d.nomDep ? " — " + d.nomDep : ""}</Text>
      </View>

      <Carte echelon="ville" titre="Qui décide dans votre commune">
        {fiche.maire && fiche.maire.nom ? (
          <>
            <Texte><Text style={s.fort}>{fiche.maire.nom}</Text> est {fiche.maire.fonction === "Maire" ? "maire" : String(fiche.maire.fonction || "maire").toLowerCase()} de {d.nomCommune}.</Texte>
            {typeof fiche.adjoints === "number" ? (
              <Texte sourd>{fiche.adjoints === 0 ? "Le répertoire ne compte aucun adjoint pour cette commune." : `${fiche.adjoints} adjoint${fiche.adjoints > 1 ? "s" : ""} au maire, selon le répertoire.`}</Texte>
            ) : null}
          </>
        ) : (
          <Vide titre={`Le Répertoire national des élus ne porte pas de maire pour ${d.nomCommune}.`}
            corps="Ce n'est pas la preuve que la commune n'en a pas : c'est la source qui ne le dit pas." />
        )}
        {srcElus ? <Source producteur={srcElus.producteur} licence={srcElus.licence} maj={srcElus.maj} url={srcElus.url} /> : null}
      </Carte>

      <Carte echelon="ville" titre="Un projet financé dans votre commune">
        {projet ? (
          <>
            <Texte fort>{projet.p.intitule}</Texte>
            <Texte>
              L'État a engagé {euros(projet.p.subvention)} à {ancienneCommune(projet.p) ? `${ancienneCommune(projet.p)} (aujourd'hui rattachée à ${d.nomCommune})` : d.nomCommune}, exercice {projet.p.annee}.
            </Texte>
            {noteRattachement(projet.p) ? <Texte sourd>{noteRattachement(projet.p)}</Texte> : null}
            {d.srcProjets ? <Source producteur={d.srcProjets.producteur} licence={d.srcProjets.licence} maj={d.srcProjets.mis_a_jour_le} url={d.srcProjets.url} /> : null}
          </>
        ) : (
          <Vide titre={`Aucun projet financé par l'État n'est publié pour ${d.nomCommune} sur les exercices relevés.`}
            corps="La source ne couvre que les dotations d'investissement de l'État : une commune finance aussi des projets par elle-même."
            lien={{ texte: "Projets financés par l'État — données publiques", url: DGCL_URL }} />
        )}
      </Carte>

      <Carte echelon="france" titre="Votre député, à l'Assemblée nationale">
        {vote ? (
          <>
            <Texte sourd>
              {d.nbCircos > 1
                ? `${d.nomCommune} est partagée entre ${d.nbCircos} circonscriptions. Vote du député élu dans la ${ordinal(vote.circo)} :`
                : `Vote du député élu dans votre circonscription (${ordinal(vote.circo)} circonscription${d.nomDep ? " — " + d.nomDep : ""}), à l'Assemblée nationale :`}
            </Texte>
            <Texte fort>{titreLisible(vote.sc.t)}</Texte>
            <Texte>
              {mot
                ? <>{vote.qui || "Votre député"} a voté <Text style={s.fort}>{mot === "Abstention" ? "l'abstention" : mot.toLowerCase()}</Text>.</>
                : <>{vote.qui || "Votre député"} : le relevé de l'Assemblée ne porte pas de position sur ce scrutin.</>}
            </Texte>
            <Texte sourd>
              Texte {RESULTAT(vote.sc.s)} le {dateFr(vote.sc.d)}{proc ? " · " + proc : ""}{vote.sc.dec ? " · " + decompte(vote.sc.dec) : ""}.
            </Texte>
            {!mot ? (
              <Texte sourd>Une position non portée n'est pas une absence : elle peut couvrir une délégation de vote, une présidence de séance, ou un scrutin auquel le député n'a pas été appelé. Repère n'en déduit rien.</Texte>
            ) : null}
            {d.base ? <LienSortant url={d.base + vote.sc.n} texte={`Scrutin n° ${vote.sc.n} sur le site de l'Assemblée`} /> : null}
            {d.srcScrutins ? <Source producteur={d.srcScrutins.producteur} licence={d.srcScrutins.licence} url={d.srcScrutins.url}
              mention={d.srcScrutins.releve_le ? "relevé le " + dateFr(d.srcScrutins.releve_le) : undefined} /> : null}
          </>
        ) : !fiable ? (
          /* Deux causes d'absence, deux phrases (invariant 5) : ici, la garde
             d'appariement de @repere/core a refuse les positions. */
          <Vide titre={REFUS_APPARIEMENT.titre} corps={REFUS_APPARIEMENT.corps} />
        ) : d.nbCircos === 0 ? (
          <Vide titre={`Repère ne connaît pas la circonscription de ${d.nomCommune}.`}
            corps="La commune est absente de la table du ministère de l'Intérieur, souvent parce qu'elle a été créée après son dernier découpage. Repère ne devine pas." />
        ) : (
          <Vide titre="Aucun vote solennel de votre député n'est porté par le relevé de l'Assemblée."
            corps="Une position non portée n'est pas une absence : elle peut couvrir une délégation de vote, une présidence de séance, ou un scrutin auquel le député n'a pas été appelé. Repère n'en déduit rien."
            lien={{ texte: "Les scrutins sur le site de l'Assemblée", url: "https://www.assemblee-nationale.fr/dyn/17/scrutins/" }} />
        )}
      </Carte>

      <Text style={s.fin}>
        Chaque ligne ci-dessus porte sa source officielle. Repère ne classe ni ne note personne.
      </Text>
      <Bouton texte="Revenir à l'accueil" discret onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: PAS * 4, paddingTop: PAS * 2, gap: PAS * 4, maxWidth: 640, width: "100%", alignSelf: "center" },
  tete: { gap: PAS },
  titre: { fontSize: 26, lineHeight: 32, fontWeight: "800", color: couleurs.encre },
  lieu: { fontSize: 17, color: couleurs.sourd },
  fort: { fontWeight: "700" },
  fin: { fontSize: 15, lineHeight: 21, color: couleurs.sourd },
});
