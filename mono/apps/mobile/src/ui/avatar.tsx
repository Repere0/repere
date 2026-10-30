/* L'AVATAR D'UN ELU : ses initiales, sur la couleur de son groupe.
 * Aucune photo n'est publiee dans les donnees de Repere, et l'adresse des photos de
 * l'Assemblee n'a pas pu etre verifiee : l'avatar est donc la seule image. Sans groupe
 * connu (c'est le cas de tous les elus aujourd'hui), la couleur est le gris « Inconnu »
 * (ADR 0001). La photo viendra d'une donnee publiee, jamais d'une adresse devinee. */
import { Text, View } from "react-native";
import { couleurGroupe, groupeDe, texteSur } from "../lib/groupes";

export function initiales(nom: string): string {
  const morceaux = nom.split(/\s+/).filter(Boolean);
  if (!morceaux.length) return "?";
  const premiere = morceaux[0].charAt(0);
  const derniere = morceaux.length > 1 ? morceaux[morceaux.length - 1].charAt(0) : "";
  return (premiere + derniere).toUpperCase();
}

export function Avatar({ nom, taille = 56 }: { nom: string; taille?: number }) {
  const fond = couleurGroupe(groupeDe());
  return (
    <View accessible={false}
      style={{ width: taille, height: taille, borderRadius: taille / 2, backgroundColor: fond, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: texteSur(fond), fontWeight: "800", fontSize: Math.round(taille * 0.36) }}>{initiales(nom)}</Text>
    </View>
  );
}
