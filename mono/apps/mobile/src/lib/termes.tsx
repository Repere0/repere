/* LES MOTS QUI ONT UNE DEFINITION, DANS UN TEXTE (15/10/2026).
 *
 * Le premier emploi d'un mot du glossaire (@repere/core, mots.js) ouvre sa
 * definition dans le dictionnaire. Le lien n'est PAS souligne dans la phrase :
 * il est une ligne tactile sous le texte, « Ce que veut dire « … » › », d'au
 * moins CIBLE (48) de haut. Un lien souligne de quelques lettres (23 px) ne tient
 * pas le seuil de 44 px du parcours, et il est trop petit pour le doigt.
 *
 * Un texte sans mot defini garde exactement son rendu d'avant : pas de ligne en plus.
 * Usage sur les ecrans de detail (pas sur le premier ecran, qui a son budget de hauteur). */
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from "react-native";
import { router } from "expo-router";
import { GLOSSAIRE, termesDuTexte } from "@repere/core";
import { couleurs, CIBLE, PAS, TYPO } from "./theme";
import { typo } from "../ui/reponse";

export function Termes({ texte, style = TYPO.note }: { texte: string; style?: StyleProp<TextStyle> }) {
  const morceaux = termesDuTexte(typo(texte));
  /* Un seul lien par mot et par texte, dans l'ordre de la phrase. */
  const cles = [...new Set(morceaux.flatMap(x => (x.cle ? [x.cle] : [])))];
  const phrase = <Text style={style}>{morceaux.map(x => x.t).join("")}</Text>;
  if (cles.length === 0) return phrase;
  return (
    <View style={{ gap: PAS }}>
      {phrase}
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

/* Un lien vers la definition d'un mot, sans reprendre la phrase : pour un libelle ou une
   note ou le mot a sa place mais ne figure pas dans un texte a decouper. Meme ligne
   tactile que Termes (CIBLE de haut). Un mot sans definition ne donne rien. */
export function LienDefinition({ cle }: { cle: string }) {
  const titre = (GLOSSAIRE as Record<string, { titre: string } | undefined>)[cle]?.titre;
  if (!titre) return null;
  return (
    <Pressable accessibilityRole="link" accessibilityLabel={`Ce que veut dire ${titre}`}
      onPress={() => router.push({ pathname: "/dictionnaire", params: { mot: cle } })}
      style={({ pressed }) => [s.lien, pressed && { opacity: 0.6 }]}>
      <Text style={s.lienTexte}>{`Ce que veut dire « ${titre} » ›`}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  lien: { minHeight: CIBLE, justifyContent: "center" },
  lienTexte: { fontSize: 15, fontWeight: "700", color: couleurs.lien },
});
