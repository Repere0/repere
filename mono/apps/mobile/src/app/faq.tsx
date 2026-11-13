/* « QUESTIONS FRÉQUENTES » — 30/10/2026 (V19, bloc 3).
 *
 * Huit questions que les testeurs poseront. Chaque reponse est vraie aujourd'hui, en deux
 * ou trois phrases : aucune date promise, aucune adresse inventee (le contact n'apparait
 * que si EXPO_PUBLIC_CONTACT_EMAIL est defini, comme dans « À propos »). Chaque question
 * est un en-tete : on passe de l'une a l'autre au lecteur d'ecran. */
import { MARQUE_DEFILEMENT } from "../lib/defilement-ios";
import { useBasSur } from "../ui/page";
import { useState, type ReactNode } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, router } from "expo-router";
import { couleurs, CIBLE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { Bouton } from "../lib/composants";
import { ResumeClair } from "../ui/resume-clair";

/* Exemple fourni par le porteur (12/11/2026), limité à ce que dit sa source : « Projet de loi de finances pour 2027. Première
   partie. Adopté par l'Assemblée nationale le 4 novembre 2026. 503 pour, 0 contre, 67 abstentions. » Il illustre la forme ; il
   n'est relié à aucun vote réel. L'adresse est celle du site de l'Assemblée, faute d'adresse vérifiée du dossier. */
const EXEMPLE_EN_CLAIR = {
  valide: true,
  resume: "Ce texte est la première partie du projet de loi de finances pour 2027. Il a été adopté par l'Assemblée nationale le 4 novembre 2026 : 503 députés ont voté pour, aucun contre, et 67 se sont abstenus.",
  source: { producteur: "Assemblée nationale", url: "https://www.assemblee-nationale.fr/", releve_le: "2026-11-12" },
};

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
      "Nous ne le calculons pas : le montant par habitant est celui que publie l'Observatoire des finances et de la gestion publique locales (OFGL), à partir des comptes de la commune.",
      "Ce que Repère calcule, il le dit : la comparaison avec la commune médiane d'Île-de-France, et les parts « salaires, investissement, autres », marquées « Calcul Repère ».",
    ],
  },
  {
    q: "Pourquoi pas de compte ?",
    r: [
      "Parce que Repère n'a pas besoin de savoir qui vous êtes. Pas de compte, pas d'e-mail, pas de traceur.",
      "Pour afficher votre commune, l'application télécharge le fichier public de tout votre département : le serveur ne sait pas quelle commune vous regardez. Votre commune n'est gardée sur l'appareil que si vous le demandez.",
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
      "Oui. Le bouton « Partager » envoie le texte et sa source. Le Repère du jour, le calendrier et les actualités créent aussi une image, prête pour vos messages ou vos stories.",
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

/* LES ATOUTS, EN TÊTE (13/11/2026, porteur) : ce que Repère garantit, en quatre tuiles qui se font défiler du doigt.
   Chaque phrase est une règle du produit (invariants 1 à 4), pas un argument : rien n'y est comparé à un autre service. */
const ATOUTS: { icone: keyof typeof Ionicons.glyphMap; titre: string; texte: string }[] = [
  { icone: "person-remove-outline", titre: "Aucun compte", texte: "Ni e-mail, ni mot de passe, ni traceur." },
  { icone: "document-text-outline", titre: "Sources officielles", texte: "Chaque chiffre porte sa source et sa date." },
  { icone: "scale-outline", titre: "Aucun avis", texte: "Repère ne classe ni ne note personne." },
  { icone: "cloud-offline-outline", titre: "Hors ligne", texte: "Ce que vous avez ouvert reste lisible sans réseau." },
];

/* UNE QUESTION = UN ACCORDÉON (13/11/2026, porteur) : la page tenait sur 3 036 px à 390 px de large (mesuré), toutes
   réponses dépliées. Les questions tiennent maintenant sur un écran ; une seule réponse est ouverte à la fois. */
function Question({ q, ouvert, basculer, children }: { q: string; ouvert: boolean; basculer: () => void; children: ReactNode }) {
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: couleurs.trait }}>
      <Pressable onPress={basculer} accessibilityRole="button" accessibilityState={{ expanded: ouvert }} aria-expanded={ouvert} accessibilityLabel={q}
        style={({ pressed }) => ({ minHeight: CIBLE + 8, flexDirection: "row", alignItems: "center", gap: PAS * 3, paddingVertical: PAS * 3, opacity: pressed ? 0.7 : 1 })}>
        <Text style={[TYPO.corps, { flex: 1, fontFamily: POLICE.titre }]}>{q}</Text>
        <Ionicons name={ouvert ? "remove" : "add"} size={22} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
      </Pressable>
      {ouvert ? <View style={{ gap: PAS * 3, paddingBottom: PAS * 4 }}>{children}</View> : null}
    </View>
  );
}

const Q_EN_CLAIR = "Comment seront écrits les résumés « En clair » ?";

export default function Faq() {
  const bas = useBasSur();
  const [ouverte, setOuverte] = useState<string | null>(null);
  const basculer = (q: string) => setOuverte(o => (o === q ? null : q));
  return (
    <ScrollView {...MARQUE_DEFILEMENT} style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, paddingBottom: bas, gap: PAS * 4, maxWidth: 640, width: "100%", alignSelf: "center" }}>
      <Stack.Screen options={{ title: "Questions fréquentes" }} />
      <Text style={TYPO.question} accessibilityRole="header">Questions fréquentes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -PAS * 4 }} contentContainerStyle={{ gap: PAS * 3, paddingHorizontal: PAS * 4 }}
        accessibilityLabel="Ce que Repère garantit">
        {ATOUTS.map(a => (
          <View key={a.titre} accessible accessibilityLabel={`${a.titre}. ${a.texte}`}
            style={{ width: 168, gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
            <Ionicons name={a.icone} size={24} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
            <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{a.titre}</Text>
            <Text style={TYPO.note}>{a.texte}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: PAS * 5, borderRadius: RAYON.carte, backgroundColor: couleurs.carte }}>
        {FAQ.map(x => (
          <Question key={x.q} q={x.q} ouvert={ouverte === x.q} basculer={() => basculer(x.q)}>
            {x.r.map(p => <Text key={p.slice(0, 24)} style={TYPO.corps}>{p}</Text>)}
            {x.lien ? <Bouton texte={x.lien.texte} discret onPress={x.lien.aller} /> : null}
          </Question>
        ))}
        <Question q={Q_EN_CLAIR} ouvert={ouverte === Q_EN_CLAIR} basculer={() => basculer(Q_EN_CLAIR)}>
          <Text style={TYPO.corps}>Repère prépare des résumés courts des textes votés. Ils ne sont pas encore publiés : un résumé n'apparaît qu'après relecture par un humain, avec le lien vers le texte officiel. Voici la forme, avec un exemple qui n'est relié à aucun vote réel.</Text>
          <ResumeClair resume={EXEMPLE_EN_CLAIR} lienOfficiel={EXEMPLE_EN_CLAIR.source.url} />
        </Question>
      </View>
      {CONTACT ? <Bouton texte="Signaler un bug" onPress={() => Linking.openURL(`mailto:${CONTACT}?subject=${encodeURIComponent("Bug Repère")}`)} /> : null}
    </ScrollView>
  );
}
