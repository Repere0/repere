/* LES MOTS QUI ONT UNE DEFINITION, DANS UN TEXTE (15/10/2026).
 *
 * Le premier emploi d'un mot du glossaire (@repere/core, mots.js) devient un lien
 * vers le dictionnaire, qui s'ouvre sur ce mot. Un seul lien par mot et par texte :
 * le reste du texte ne souligne rien. Le lien est un Text imbrique, donc il garde
 * la taille et le retour a la ligne du texte qui le contient. */
import { Text } from "react-native";
import { router } from "expo-router";
import { termesDuTexte } from "@repere/core";
import { couleurs } from "./theme";
import { typo } from "../ui/reponse";

export function Termes({ texte }: { texte: string }) {
  return (
    <Text>
      {termesDuTexte(typo(texte)).map((x, i) => x.cle ? (
        <Text key={i} accessibilityRole="link"
          onPress={() => router.push({ pathname: "/dictionnaire", params: { mot: x.cle } })}
          style={{ color: couleurs.lien, textDecorationLine: "underline" }}>{x.t}</Text>
      ) : <Text key={i}>{x.t}</Text>)}
    </Text>
  );
}
