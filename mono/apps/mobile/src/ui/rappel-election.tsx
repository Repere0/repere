/* LE RAPPEL DE LA PROCHAINE ÉLECTION, sur l'accueil (V37, bloc 6, 31/10/2026).
 * Une carte, une question : quand vote-t-on, et comment. Dates de lib/elections.ts (vérifiées et sourcées).
 * Rien n'est affiché si aucune élection ne tombe dans les 180 jours. */
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { dateFr } from "@repere/core";
import { ELECTIONS_SOURCE, ELECTIONS_VERIFIEES_LE, prochaineElection } from "../lib/elections";
import { NEUTRES_PAR_MODE } from "../lib/palette";
import { CIBLE, PAS, POLICE, RAYON } from "../lib/theme";

const D = NEUTRES_PAR_MODE.sombre; /* l'accueil est toujours sombre */

/* Icône calendrier dessinée avec deux vues (pas de bibliothèque d'icônes). Décorative : le titre porte le sens. */
function IconeCalendrier() {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ width: 22, height: 22, borderWidth: 2, borderColor: D.encre, borderRadius: 4 }}>
      <View style={{ height: 6, borderBottomWidth: 2, borderColor: D.encre }} />
    </View>
  );
}

export function RappelElection({ aujourdhui = new Date() }: { aujourdhui?: Date }) {
  const trouve = prochaineElection(aujourdhui);
  if (!trouve) return null;
  const { election, jours } = trouve;
  const titre = election.type === "presidentielle" ? "Élections présidentielles" : "Élections législatives";
  const quand = jours === 0 ? "aujourd'hui" : jours === 1 ? "dans 1 jour" : `dans ${jours} jours`;
  const date = dateFr(election.date);
  return (
    <View accessibilityLabel={`${titre}, ${quand}, ${date}`}
      style={{ gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: D.carte, borderWidth: 1, borderColor: D.trait }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
        <IconeCalendrier />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: POLICE.titre, fontSize: 20, lineHeight: 26, color: D.encre }}>{titre}</Text>
          <Text style={{ fontSize: 15, lineHeight: 21, color: D.encre }}>{quand} ({date})</Text>
        </View>
      </View>
      <Pressable onPress={() => router.push("/voter")} accessibilityRole="link" accessibilityLabel="Comment voter"
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: D.encre, textDecorationLine: "underline" }}>Comment voter ?</Text>
      </Pressable>
      <Text style={{ fontSize: 13, lineHeight: 18, color: D.sourd }}>
        Source : {ELECTIONS_SOURCE.producteur}, vérifié le {dateFr(ELECTIONS_VERIFIEES_LE)}.
      </Text>
    </View>
  );
}
