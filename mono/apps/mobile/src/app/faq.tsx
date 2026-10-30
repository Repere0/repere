/* « QUESTIONS FRÉQUENTES » — 30/10/2026 (V19, bloc 3).
 *
 * Huit questions que les testeurs poseront. Chaque reponse est vraie aujourd'hui, en deux
 * ou trois phrases : aucune date promise, aucune adresse inventee (le contact n'apparait
 * que si EXPO_PUBLIC_CONTACT_EMAIL est defini, comme dans « À propos »). Chaque question
 * est un en-tete : on passe de l'une a l'autre au lecteur d'ecran. */
import { Linking, ScrollView, Text, View } from "react-native";
import { Stack, router } from "expo-router";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Bouton, Carte } from "../lib/composants";

const CONTACT = process.env.EXPO_PUBLIC_CONTACT_EMAIL;

const FAQ: { q: string; r: string[]; lien?: { texte: string; aller: () => void } }[] = [
  {
    q: "D'où viennent les données ?",
    r: [
      "Uniquement de sources publiques officielles : le Répertoire national des élus (ministère de l'Intérieur), les comptes des communes (OFGL), les votes et les députés (Assemblée nationale), les projets financés par l'État (DGCL), les agendas de l'Assemblée et du Sénat.",
      "Chaque chiffre affiche sa source et sa date. L'écran « Sources » les liste toutes, avec la date de relevé.",
    ],
    lien: { texte: "Voir les sources", aller: () => router.push("/sources") },
  },
  {
    q: "Pourquoi je ne vois pas ma commune ?",
    r: [
      "Pendant la bêta, Repère couvre les communes d'Île-de-France qui ont une fiche dans les données publiées. Une commune d'ailleurs n'apparaît pas encore.",
      "Si votre commune est en Île-de-France et n'apparaît pas, c'est que sa fiche manque dans les données : l'application vous le dit quand vous la cherchez.",
    ],
  },
  {
    q: "Comment calculez-vous le budget par habitant ?",
    r: [
      "Nous ne le calculons pas : le montant par habitant est celui que publie l'Observatoire des finances locales (OFGL), à partir des comptes de la commune.",
      "Ce que Repère calcule, il le dit : la comparaison avec la commune médiane d'Île-de-France, et les parts « salaires, investissement, autres », marquées « Calcul Repère ».",
    ],
  },
  {
    q: "Pourquoi pas de compte ?",
    r: [
      "Parce que Repère n'a pas besoin de savoir qui vous êtes. Pas de compte, pas d'e-mail, pas de traceur.",
      "Pour afficher votre commune, l'application télécharge le fichier public de tout votre département : le serveur ne sait pas quelle commune vous regardez. Votre commune n'est gardée sur le téléphone que si vous le demandez.",
    ],
    lien: { texte: "Politique de confidentialité", aller: () => router.push("/confidentialite") },
  },
  {
    q: "Pourquoi pas de notes sur les élus ?",
    r: [
      "Repère montre des faits (qui décide, combien, ce qui a été voté) sans dire quoi en penser. Aucune note, aucun rang, aucun score.",
      "Quand Repère compare, c'est un fait et c'est annoncé : « 1,8 fois la commune médiane », jamais un jugement.",
    ],
  },
  {
    q: "Puis-je partager une info ?",
    r: [
      "Oui. Sur les écrans qui l'affichent, le bouton « Partager » crée une image avec le chiffre ou le vote, et sa source, prête pour vos messages ou vos stories.",
      "La source voyage avec l'image : celui qui la reçoit peut vérifier.",
    ],
  },
  {
    q: "Comment signaler un bug ?",
    r: CONTACT
      ? [`Écrivez à ${CONTACT}, en disant l'écran et ce que vous avez fait juste avant. Une capture d'écran aide beaucoup.`]
      : ["Pendant la bêta, répondez simplement à la personne qui vous a invité à tester, en disant l'écran et ce que vous avez fait juste avant. Une capture d'écran aide beaucoup."],
  },
  {
    q: "Quand couvrirez-vous toute la France ?",
    r: [
      "Il n'y a pas encore de date. Les données des députés et des comptes existent déjà pour toute la France ; la bêta se limite à l'Île-de-France le temps de vérifier que tout est juste et compréhensible.",
      "Les retours des testeurs décideront de la suite.",
    ],
  },
];

export default function Faq() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, gap: PAS * 3, maxWidth: 640, width: "100%", alignSelf: "center" }}>
      <Stack.Screen options={{ title: "Questions fréquentes" }} />
      <Text style={TYPO.question} accessibilityRole="header">Questions fréquentes</Text>
      {FAQ.map(x => (
        <Carte key={x.q}>
          <Text style={[TYPO.corps, { fontWeight: "800" }]} accessibilityRole="header">{x.q}</Text>
          <View style={{ gap: PAS * 2 }}>
            {x.r.map(p => <Text key={p.slice(0, 24)} style={TYPO.corps}>{p}</Text>)}
          </View>
          {x.lien ? <Bouton texte={x.lien.texte} discret onPress={x.lien.aller} /> : null}
        </Carte>
      ))}
      {CONTACT ? <Bouton texte="Signaler un bug" onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${encodeURIComponent("Bug Repère")}`)} /> : null}
    </ScrollView>
  );
}
