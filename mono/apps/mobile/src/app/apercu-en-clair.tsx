/* APERÇU DU BLOC « EN CLAIR » (12/11/2026). Page de mise en page, reliée à aucun écran : elle montre le composant avec
 * l'exemple fourni par le porteur. Ce n'est PAS un résumé branché sur un vote : tant qu'aucun résumé n'est validé pour un
 * texte réel, les écrans disent « Pas encore de résumé pour ce texte ».
 * Le texte ne garde que ce que la source dit (garde-fou 3 de la note de conception : tout fait se retrouve dans la source) ;
 * l'adresse est celle du site de l'Assemblée nationale, faute d'adresse vérifiée du dossier. */
import { Text } from "react-native";
import { Stack } from "expo-router";
import { ResumeClair } from "../ui/resume-clair";
import { Page } from "../ui/page";
import { TYPO } from "../lib/theme";

export const SOURCE_EXEMPLE = "Projet de loi de finances pour 2027. Première partie. Adopté par l'Assemblée nationale le 4 novembre 2026. 503 pour, 0 contre, 67 abstentions.";
const EXEMPLE = {
  valide: true,
  resume: "Ce texte est la première partie du projet de loi de finances pour 2027. Il a été adopté par l'Assemblée nationale le 4 novembre 2026 : 503 députés ont voté pour, aucun contre, et 67 se sont abstenus.",
  source: { producteur: "Assemblée nationale", url: "https://www.assemblee-nationale.fr/", releve_le: "2026-11-12" },
};

export default function ApercuEnClair() {
  return (
    <Page sansDate>
      <Stack.Screen options={{ title: "Aperçu : En clair" }} />
      <Text style={TYPO.note}>Aperçu de mise en page, avec un exemple. Ce n'est pas encore le résumé d'un vote réel.</Text>
      <ResumeClair resume={EXEMPLE} lienOfficiel={EXEMPLE.source.url} />
      <Text style={TYPO.micro}>Texte source : {SOURCE_EXEMPLE}</Text>
    </Page>
  );
}
