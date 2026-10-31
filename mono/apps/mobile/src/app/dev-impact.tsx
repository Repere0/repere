/* Prévisualisation des fiches « impact concret » (V42). RÉSERVÉE AU DÉVELOPPEMENT : hors __DEV__,
 * l'écran ne rend rien et ne charge pas le fichier. Le CEO relit chaque fiche ici, corrige
 * data/contenu/impact-scrutins.json dans le dépôt, puis passe relecture_ceo à true. Voir
 * docs/data/impact-scrutins.md. Rien n'est lu sur le réseau. */
import { ScrollView, Text, View } from "react-native";
import { Stack } from "expo-router";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Carte, LienSortant } from "../lib/composants";

type Fiche = { n: string; titre_officiel: string; impact_citoyen: string | null; source_url: string; relecture_ceo: boolean };

export default function DevImpact() {
  if (!__DEV__) return null;
  // Chargement local : le fichier vit à la racine du dépôt, hors du paquet mobile.
  const fiches: Fiche[] = require("../../../../../data/contenu/impact-scrutins.json");
  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, gap: PAS * 4 }}>
      <Stack.Screen options={{ title: "Aperçu impacts (dev)" }} />
      <Text style={TYPO.question} accessibilityRole="header">Fiches impact concret : {fiches.length}</Text>
      <Text style={TYPO.note}>Écran de développement. Relire chaque fiche, corriger le fichier, passer relecture_ceo à true.</Text>
      {fiches.map(f => (
        <Carte key={f.n} titre={`Scrutin ${f.n}`}>
          <View style={{ gap: PAS * 2 }}>
            <Text style={TYPO.note}>{f.titre_officiel}</Text>
            <Text style={TYPO.corps}>{f.impact_citoyen ?? "Pas d'impact rédigé (voir BLOCAGES.md)."}</Text>
            <Text style={TYPO.micro}>relecture_ceo : {String(f.relecture_ceo)}</Text>
            <LienSortant url={f.source_url} texte="Scrutin sur le site de l'Assemblée" etiquette={`Scrutin ${f.n} sur le site de l'Assemblée`} />
          </View>
        </Carte>
      ))}
    </ScrollView>
  );
}
