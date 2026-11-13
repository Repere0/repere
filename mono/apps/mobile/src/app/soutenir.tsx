/* SOUTENIR REPÈRE (13/11/2026, décision du porteur).
 *
 * Ce que cette page ne fait PAS, et ne doit jamais faire tant que l'association n'existe pas : encaisser.
 * Aucun lien de paiement, aucun formulaire, aucune adresse e-mail demandée. Le bouton est éteint et dit
 * pourquoi — appeler au don sans structure déclarée exposerait le porteur, et promettre un paiement qui
 * n'existe pas serait faux.
 *
 * Les promesses écrites ici sont vérifiables dans l'application : pas de publicité, pas de traceur, pas de
 * compte. Si l'une d'elles cessait d'être vraie, c'est cette page qu'il faudrait corriger en premier. */
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Carte } from "../lib/composants";
import { Page, Question } from "../ui/page";
import { CIBLE, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";

export default function Soutenir() {
  return (
    <Page sansDate>
      <Stack.Screen options={{ title: "Soutenir Repère" }} />
      <Question etiquette="Projet indépendant" question="Soutenir Repère"
        sous="Projet indépendant, sans publicité, sans traceur. Pour rester libre, nous avons besoin de vous." />

      <Carte titre="Ce que votre soutien protège">
        {[
          ["shield-checkmark-outline", "Aucune publicité", "Personne n'achète d'espace ici, donc personne n'a son mot à dire sur ce qui s'affiche."],
          ["eye-off-outline", "Aucun traceur", "Pas de mesure d'audience, pas de revente de données : il n'y a rien à revendre."],
          ["document-text-outline", "Des sources, toujours", "Relever, vérifier et republier des données officielles prend du temps tous les jours."],
        ].map(([icone, titre, corps]) => (
          <View key={titre} style={{ flexDirection: "row", gap: PAS * 3, alignItems: "flex-start" }}>
            <Ionicons name={icone as keyof typeof Ionicons.glyphMap} size={22} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{titre}</Text>
              <Text style={TYPO.note}>{corps}</Text>
            </View>
          </View>
        ))}
      </Carte>

      {/* Bouton ÉTEINT, et qui dit pourquoi : ni lien de paiement, ni collecte, tant que l'association n'existe pas. */}
      <View accessible accessibilityRole="button" accessibilityState={{ disabled: true }} testID="don-eteint"
        accessibilityLabel="Faire un don : bientôt disponible, en attente de la création de l'association"
        style={{ minHeight: CIBLE + 8, borderRadius: RAYON.pastille, alignItems: "center", justifyContent: "center",
          backgroundColor: couleurs.voile, borderWidth: 1, borderColor: couleurs.trait }}>
        <Text style={{ fontSize: 17, fontFamily: POLICE.section, color: couleurs.sourd }}>Faire un don</Text>
      </View>
      <Text style={[TYPO.note, { textAlign: "center" }]}>Bientôt disponible — en attente de la création de l'association.</Text>
      <Text style={TYPO.micro}>Repère ne collecte aujourd'hui aucun paiement et ne demande aucune coordonnée. Cette page le dira autrement le jour où ce sera le cas.</Text>
    </Page>
  );
}
