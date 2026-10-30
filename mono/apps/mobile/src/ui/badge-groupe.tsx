/* Le badge d'identification d'un groupe politique : sa couleur (ou le gris « Inconnu »),
   et un texte lisible dessus. Il identifie l'élu ; il ne code aucun vote (invariant 7). */
import { Text, View } from "react-native";
import { couleurGroupe, texteSur } from "../lib/groupes";

export function BadgeGroupe({ groupe }: { groupe: string }) {
  const fond = couleurGroupe(groupe);
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: fond }}>
      <Text style={{ color: texteSur(fond), fontSize: 13, fontWeight: "700" }}>Groupe : {groupe}</Text>
    </View>
  );
}
