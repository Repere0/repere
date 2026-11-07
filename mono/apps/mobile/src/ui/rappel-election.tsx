/* LE RAPPEL DE LA PROCHAINE ÉLECTION, sur l'accueil (V37, bloc 6, 31/10/2026).
 * Une carte, une question : quand vote-t-on, et comment. Dates de lib/elections.ts (vérifiées et sourcées).
 * Rien n'est affiché si aucune élection ne tombe dans les 180 jours. */
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { dateFr } from "@repere/core";
import { ELECTIONS_SOURCE, ELECTIONS_VERIFIEES_LE, prochaineElection } from "../lib/elections";
import { NEUTRES_PAR_MODE } from "../lib/palette";
import { CIBLE, PAS, POLICE, RAYON } from "../lib/theme";

const D = NEUTRES_PAR_MODE.sombre; /* l'accueil est toujours sombre */

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
        <Ionicons name="calendar-outline" size={22} color={D.encre} accessible={false} importantForAccessibility="no" />
        <Text style={{ flex: 1, fontFamily: POLICE.titre, fontSize: 20, lineHeight: 26, color: D.encre }}>{titre}</Text>
      </View>
      {/* 07/11/2026 : la durée en grand (invariant 6 : suivre une durée est permis), la date à côté. */}
      {jours > 0 ? (
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: PAS * 2 }}>
          <Text style={{ fontFamily: POLICE.donneeForte, fontSize: 40, lineHeight: 46, color: D.encre, letterSpacing: -1 }}>{jours}</Text>
          <Text style={{ fontFamily: POLICE.texte, fontSize: 15, lineHeight: 21, color: D.sourd }}>{jours === 1 ? "jour" : "jours"} · {date}</Text>
        </View>
      ) : <Text style={{ fontSize: 15, lineHeight: 21, color: D.encre }}>{quand} ({date})</Text>}
      <Pressable onPress={() => router.push("/voter")} accessibilityRole="link" accessibilityLabel="Comment voter"
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ fontSize: 15, fontWeight: "600", color: D.encre, textDecorationLine: "underline" }}>Comment voter ?</Text>
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS }}>
        <Ionicons name="link-outline" size={14} color={D.sourd} accessible={false} importantForAccessibility="no" />
        <Text style={{ flex: 1, fontSize: 13, lineHeight: 18, color: D.sourd }}>
          Source : {ELECTIONS_SOURCE.producteur}, vérifié le {dateFr(ELECTIONS_VERIFIEES_LE)}.
        </Text>
      </View>
    </View>
  );
}
