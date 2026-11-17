/* « MENTIONS LÉGALES » — 17/11/2026 (sprint « stores »). Le même texte que docs/mentions-legales.md. Ouvert depuis
 * les réglages. Toute modification se fait dans les deux fichiers à la fois.
 * Cadre : loi n° 2004-575 du 21 juin 2004 (LCEN), article 1-1. Un éditeur personne physique qui agit à titre non
 * professionnel peut ne pas publier son identité, s'il l'a communiquée à l'hébergeur et si le nom, l'adresse et le
 * téléphone de l'hébergeur sont publiés (art. 1-1, II). Ce choix revient au porteur : voir docs/mentions-legales.md. */
import { MARQUE_DEFILEMENT } from "../lib/defilement-ios";
import { useBasSur } from "../ui/page";
import { ScrollView, Text } from "react-native";
import { Stack } from "expo-router";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Carte, LienSortant } from "../lib/composants";


const CONTACT = "repere0@protonmail.com";

/* Les hébergeurs (relevé le 17/11/2026) : Netlify d'après son contrat-cadre publié ; Vercel d'après une page de mentions
   d'un autre site, À VÉRIFIER sur les documents de Vercel avant fusion. Téléphones non trouvés : voir docs/mentions-legales.md. */
const HEBERGEURS = [
  { role: "Données publiées (fichiers lus par l'application)", nom: "Netlify, Inc.", adresse: "101 2nd Street, San Francisco, CA 94105, États-Unis", url: "https://www.netlify.com" },
  { role: "Application web (version actuelle)", nom: "Vercel Inc.", adresse: "440 N Barranca Ave, suite 4133, Covina, CA 91723, États-Unis", url: "https://vercel.com" },
];

export default function MentionsLegales() {
  const bas = useBasSur();
  return (
    <ScrollView {...MARQUE_DEFILEMENT} focusable style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, paddingBottom: bas, gap: PAS * 4 }}>
      <Stack.Screen options={{ title: "Mentions légales" }} />
      <Text style={TYPO.question} accessibilityRole="header">Mentions légales</Text>
      <Text style={TYPO.corps}>Version du 17/11/2026.</Text>

      <Carte titre="Éditeur">
        <Text style={TYPO.note}>Repère est une application d'information civique, gratuite et sans publicité, éditée à titre non professionnel par une personne physique.</Text>
        <Text style={TYPO.note}>Contact : {CONTACT}</Text>
      </Carte>

      <Carte titre="Hébergement">
        {HEBERGEURS.map(h => (
          <Text key={h.nom} style={TYPO.note}>{h.role} : {h.nom}, {h.adresse}.</Text>
        ))}
      </Carte>

      <Carte titre="Les données affichées">
        <Text style={TYPO.note}>Les chiffres, les votes et les informations sur les élus viennent de sources publiques. Chacun porte, à l'écran, son producteur, sa licence et sa date. Repère ne les modifie pas ; un calcul de Repère est annoncé comme tel.</Text>
        <Text style={TYPO.note}>Les photos d'élus et de candidats viennent de Wikimedia Commons, sous licence libre, avec le nom de leur auteur et leur licence sous chaque photo.</Text>
        <Text style={TYPO.note}>Une erreur ? Chaque écran propose de la signaler, ou écrivez à {CONTACT}.</Text>
      </Carte>

      <Carte titre="Code source">
        <Text style={TYPO.note}>Le code de Repère est publié sous licence AGPL-3.0.</Text>
        <LienSortant url="https://github.com/Repere0/repere" texte="Le dépôt du code" />
      </Carte>

      <Carte titre="Vos données">
        <Text style={TYPO.note}>Repère ne crée aucun compte et ne détient aucune donnée qui vous concerne. Le détail est dans la page « Confidentialité ».</Text>
      </Carte>
    </ScrollView>
  );
}
