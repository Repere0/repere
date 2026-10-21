/* REPERES CITOYENS AVANT 18 ANS (18/10/2026).
 * Page informative statique : aucun âge n'est demandé ni enregistré.
 * Les dates ci-dessous sont celles affichées sur les fiches officielles consultées. */
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { Carte, LienSortant } from "../lib/composants";
import { PAS, TYPO } from "../lib/theme";
import { insecable, Page, Question } from "../ui/page";

const SOURCES = {
  recensement: "https://www.service-public.gouv.fr/particuliers/vosdroits/F870",
  jdc: "https://www.service-public.gouv.fr/particuliers/vosdroits/F871",
  inscription: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1961",
  verifier: "https://www.service-public.gouv.fr/particuliers/vosdroits/R51788",
  ecole: "https://www.education.gouv.fr/le-role-des-collectivites-territoriales-dans-le-service-public-de-l-education-et-le-partenariat-avec-8138",
} as const;

function Source({ nom, date, url }: { nom: string; date: string; url: string }) {
  return (
    <View style={{ gap: PAS }}>
      <Text style={TYPO.note}>Source : {nom}. Vérifiée le {date}.</Text>
      <LienSortant url={url} texte="Lire la fiche officielle" etiquette={`Lire la source officielle : ${nom}`} />
    </View>
  );
}

export default function Avant18() {
  return (
    <Page>
      <Stack.Screen options={{ title: "Avant 18 ans" }} />
      <Question question="Avant 18 ans"
        sous="Quelques repères de démarches et de décisions publiques. Cette page ne demande ni votre âge ni aucune information personnelle." />

      <Carte titre="À 16 ans · Le recensement citoyen">
        <Text style={TYPO.corps}>{insecable("Si vous êtes français, vous devez vous faire recenser dans les 3 mois qui suivent votre 16e anniversaire. Vous pouvez le faire en ligne ou à la mairie de votre domicile. Gardez l'attestation : elle est demandée pour vous inscrire à certains examens ou concours avant 18 ans.")}</Text>
        <Source nom="Service Public, fiche F870" date="19 octobre 2026" url={SOURCES.recensement} />
      </Carte>

      <Carte titre="Après le recensement · La JDC">
        <Text style={TYPO.corps}>{insecable("Après le recensement, les jeunes Français sont convoqués à la Journée défense et citoyenneté (JDC). En France, elle a lieu entre le recensement et le 18e anniversaire ; une exemption est possible dans certains cas.")}</Text>
        <Source nom="Service Public, fiche F871" date="14 avril 2026" url={SOURCES.jdc} />
      </Carte>

      <Carte titre="À 18 ans · Le droit de vote">
        <Text style={TYPO.corps}>{insecable("Si vous êtes français et recensé à 16 ans, l'Insee vous inscrit automatiquement sur la liste électorale de la commune où vous avez fait le recensement. Si vous n'avez pas été recensé, ou trop tard, l'inscription n'est pas automatique : vous pouvez la demander en ligne, à la mairie ou par courrier, avec un justificatif d'identité et un justificatif de domicile. Le formulaire Cerfa 12669 est demandé pour une inscription sur place ou par courrier.")}</Text>
        <Source nom="Service Public, fiche F1961" date="28 novembre 2025" url={SOURCES.inscription} />
        <LienSortant url={SOURCES.verifier} texte="Vérifier votre inscription et votre bureau de vote"
          etiquette="Vérifier votre inscription électorale et votre bureau de vote sur Service Public" />
      </Carte>

      <Carte titre="Ce qui vous concerne déjà · L'école">
        <Text style={TYPO.corps}>{insecable("Pour les écoles publiques, la commune s'occupe notamment des bâtiments et de la restauration. Le département a la charge des collèges publics ; la région, des lycées publics. L'État reste responsable des programmes et des personnels enseignants.")}</Text>
        <Source nom="Ministère de l'Éducation nationale, rôle des collectivités" date="29 décembre 2025" url={SOURCES.ecole} />
      </Carte>
    </Page>
  );
}
