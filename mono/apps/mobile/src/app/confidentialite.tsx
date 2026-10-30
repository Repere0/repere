/* « CONFIDENTIALITÉ » — 30/10/2026. Le même texte que docs/privacy-policy.md (version
 * du 30/10/2026). Ouvert depuis les réglages. Toute modification se fait dans les deux
 * fichiers à la fois. */
import { ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Carte } from "../lib/composants";

const Puce = ({ children }: { children: string }) => (
  <View style={{ flexDirection: "row", gap: PAS * 2 }}>
    <Text style={TYPO.note}>•</Text>
    <Text style={[TYPO.note, { flex: 1 }]}>{children}</Text>
  </View>
);

export default function Confidentialite() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, gap: PAS * 4 }}>
      <Stack.Screen options={{ title: "Confidentialité" }} />
      <Text style={TYPO.question} accessibilityRole="header">Confidentialité</Text>
      <Text style={TYPO.corps}>Version du 30/10/2026.</Text>

      <Carte titre="Ce que Repère ne fait pas">
        <Puce>Repère ne crée aucun compte. Aucun nom, aucune adresse e-mail, aucun numéro de téléphone ne vous est demandé.</Puce>
        <Puce>Repère n'utilise aucun traceur, aucun cookie publicitaire et aucun outil de mesure d'audience dans l'application.</Puce>
        <Puce>Repère ne vend, ne loue et ne partage aucune donnée. Repère n'envoie aucune notification.</Puce>
        <Puce>Repère fonctionne sans connexion après le premier chargement des données.</Puce>
      </Carte>

      <Carte titre="Ce qui est gardé sur votre appareil">
        <Puce>Une seule information peut être gardée : la commune que vous avez choisie, sous la forme de deux codes publics (le code du département et le code INSEE de la commune). Elle n'est gardée que si vous cochez « Retenir sur ce téléphone ». Elle est sous la clé repere.departement.</Puce>
        <Puce>Le bouton « Oublier » efface cette information.</Puce>
        <Puce>Les fichiers publics de Repère (élus, votes, comptes, calendrier) sont gardés dans le dossier de cache de l'application, pour fonctionner hors ligne. Ce sont des données publiques. Le système peut vider ce dossier à tout moment ; l'application les télécharge alors à nouveau.</Puce>
        <Puce>Supprimer l'application efface tout ce qu'elle a gardé sur votre appareil.</Puce>
      </Carte>

      <Carte titre="Ce qui quitte votre appareil">
        <Puce>Pour afficher les données, l'application les télécharge depuis le serveur qui les publie, repereapp.netlify.app (hébergement Netlify).</Puce>
        <Puce>Comme pour tout site web, ce serveur reçoit votre adresse IP, la date de la demande et le type d'appareil ou de navigateur. Il peut consigner ces informations dans ses journaux techniques, selon sa propre politique.</Puce>
        <Puce>Les fichiers demandés sont découpés par département : le serveur voit quel département vous consultez. Il ne voit ni votre nom, ni votre commune exacte.</Puce>
        <Puce>Repère n'a pas accès à ces journaux, n'en fait aucun usage et ne les relie à aucun compte, puisqu'il n'y en a pas.</Puce>
        <Puce>Quand vous ouvrez une source officielle, vous quittez Repère. Ce site applique sa propre politique.</Puce>
      </Carte>

      <Carte titre="Données concernant des élus">
        <Text style={TYPO.note}>Les données sur les élus, les votes et les comptes sont publiques. Repère les reprend avec leur source et leur date. Repère ne publie ni photo ni patrimoine d'élu.</Text>
      </Carte>

      <Carte titre="Vos droits">
        <Text style={TYPO.note}>Repère ne détient aucune donnée qui vous concerne : il n'y a rien à demander, rectifier ou supprimer chez Repère. Pour effacer ce qui est gardé sur votre appareil, utilisez « Oublier » ou désinstallez l'application.</Text>
      </Carte>
    </ScrollView>
  );
}
