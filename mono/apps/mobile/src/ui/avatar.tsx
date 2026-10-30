/* L'AVATAR D'UN ELU : ses initiales sur la couleur de son groupe, avec une bordure de la
 * même teinte, plus sombre, et une ombre douce (clair comme sombre).
 * Aucune photo : décision du porteur (30/10/2026, D1). Les photos de l'Assemblée ne sont
 * pas chargées, pour ne pas révéler l'adresse du lecteur. Sans groupe connu (c'est le cas
 * de tous les élus aujourd'hui), la couleur est le gris « Inconnu » (ADR 0001). */
import { Text, View } from "react-native";
import { OMBRE } from "../lib/theme";
import { bordureGroupe, couleurGroupe, groupeDe, texteSur } from "../lib/groupes";

export function initiales(nom: string): string {
  const morceaux = nom.split(/\s+/).filter(Boolean);
  if (!morceaux.length) return "?";
  const premiere = morceaux[0].charAt(0);
  const derniere = morceaux.length > 1 ? morceaux[morceaux.length - 1].charAt(0) : "";
  return (premiere + derniere).toUpperCase();
}

/* 64 px par défaut : initiales à 24 px. Le texte est blanc sur le gris « Inconnu » ; sur une
 * couleur de groupe claire, il passe en encre pour rester lisible (texteSur). */
export function Avatar({ nom, taille = 64 }: { nom: string; taille?: number }) {
  const fond = couleurGroupe(groupeDe());
  return (
    <View accessible={false}
      style={[{ width: taille, height: taille, borderRadius: taille / 2, backgroundColor: fond,
        borderWidth: 2, borderColor: bordureGroupe(fond), alignItems: "center", justifyContent: "center" }, OMBRE]}>
      <Text style={{ color: texteSur(fond), fontWeight: "800", fontSize: Math.round(taille * 0.375) }}>{initiales(nom)}</Text>
    </View>
  );
}
