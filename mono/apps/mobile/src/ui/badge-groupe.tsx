/* Le badge d'identification d'un groupe politique : sa couleur (ou le gris « Inconnu »),
   et un texte lisible dessus. Il identifie l'élu ; il ne code aucun vote (invariant 7). */
import { Text, View } from "react-native";
import { couleurGroupe, GROUPE_INCONNU, texteSur } from "../lib/groupes";

/* Le libelle unique quand le groupe n'est pas connu (V21) : « non publie » dit que Repère
   ne l'a pas (D3 : le lien depute -> groupe de l'Assemblee n'est pas extrait). Pas
   « (source AN) » : l'Assemblee publie bien les groupes, c'est Repère qui ne les lit pas. */
export const libelleGroupe = (g: string) => (g === GROUPE_INCONNU ? "Groupe politique : non publié" : `Groupe : ${g}`);

export function BadgeGroupe({ groupe }: { groupe: string }) {
  const fond = couleurGroupe(groupe);
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: fond }}>
      <Text style={{ color: texteSur(fond), fontSize: 13, fontWeight: "500" }}>{libelleGroupe(groupe)}</Text>
    </View>
  );
}
