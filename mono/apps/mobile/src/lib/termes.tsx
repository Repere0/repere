/* LES MOTS QUI ONT UNE DEFINITION, DANS UNE PHRASE (15/10/2026).
 *
 * Le premier emploi d'un mot du glossaire (@repere/core, mots.js) ouvre sa
 * definition dans le dictionnaire. Le lien n'est PAS souligne dans la phrase :
 * il est une ligne tactile sous la phrase, « Ce que veut dire « … » › », d'au
 * moins CIBLE (48) de haut. Un lien souligne de quelques lettres (23 px) ne tient
 * pas le seuil de 44 px du parcours, et il est trop petit pour le doigt.
 * La phrase reste un titre (header) pour le lecteur d'ecran. */
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { GLOSSAIRE, termesDuTexte } from "@repere/core";
import { couleurs, CIBLE, PAS } from "./theme";
import { FRASE, typo } from "../ui/reponse";

export function Termes({ texte }: { texte: string }) {
  const morceaux = termesDuTexte(typo(texte));
  /* Un seul lien par mot et par texte, dans l'ordre de la phrase. */
  const cles = [...new Set(morceaux.flatMap(x => (x.cle ? [x.cle] : [])))];
  return (
    <View style={{ gap: PAS }}>
      <Text style={FRASE} accessibilityRole="header">{morceaux.map(x => x.t).join("")}</Text>
      {cles.map(cle => {
        const titre = (GLOSSAIRE as Record<string, { titre: string }>)[cle].titre;
        return (
          <Pressable key={cle} accessibilityRole="link" accessibilityLabel={`Ce que veut dire ${titre}`}
            onPress={() => router.push({ pathname: "/dictionnaire", params: { mot: cle } })}
            style={({ pressed }) => [s.lien, pressed && { opacity: 0.6 }]}>
            <Text style={s.lienTexte}>{`Ce que veut dire « ${titre} » ›`}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  lien: { minHeight: CIBLE, justifyContent: "center" },
  lienTexte: { fontSize: 15, fontWeight: "700", color: couleurs.lien },
});
