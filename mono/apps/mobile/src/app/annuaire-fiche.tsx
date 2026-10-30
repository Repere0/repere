/* FICHE D'UN ELU DE L'ANNUAIRE : identite, fonction, lieu, debut de fonction, source.
 * Ouverte depuis l'onglet « Élus ». Pas de vote ici : les votes sont dans la fiche
 * « Qui décide », par commune. */
import { ScrollView, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { dateFr } from "@repere/core";
import { Carte } from "../lib/composants";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Avatar } from "../ui/avatar";
import { PastilleSource } from "../ui/source";

type Params = { nom?: string; fonction?: string; lieu?: string; depuis?: string; producteur?: string; licence?: string; maj?: string; url?: string };

export default function AnnuaireFiche() {
  const p = useLocalSearchParams<Params>();
  const nom = p.nom || "Élu";
  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} contentContainerStyle={{ padding: PAS * 4, gap: PAS * 4 }}>
      <Stack.Screen options={{ title: "Élu" }} />
      <View style={{ alignItems: "center", gap: PAS * 3 }}>
        <Avatar nom={nom} taille={96} />
        <Text style={[TYPO.question, { textAlign: "center" }]} accessibilityRole="header">{nom}</Text>
        {p.fonction ? <Text style={[TYPO.corps, { textAlign: "center" }]}>{p.fonction}</Text> : null}
        {p.lieu ? <Text style={[TYPO.note, { textAlign: "center" }]}>{p.lieu}</Text> : null}
      </View>
      <Carte titre="En fonction depuis">
        {p.depuis ? (
          <Text style={TYPO.corps}>Le {dateFr(p.depuis)}.</Text>
        ) : (
          <Text style={TYPO.note}>Date de début non publiée par la source. Repère ne la devine pas.</Text>
        )}
      </Carte>
      <Carte titre="Ce que Repère n'affiche pas">
        <Text style={TYPO.note}>Ni photo, ni parti : les données publiées ne les contiennent pas.</Text>
      </Carte>
      {p.producteur ? <PastilleSource source={{ producteur: p.producteur, licence: p.licence, maj: p.maj, url: p.url }} /> : null}
    </ScrollView>
  );
}
