/* UN TEXTE LONG, REPLIÉ À 3 LIGNES (audit UI, vague 2, 16/11/2026).
 * Mesuré à l'audit : des pavés de 7 à 12 lignes (actualités, dictionnaire, qui décide). Le texte
 * reste entier pour un lecteur d'écran (accessibilityLabel) ; « Lire la suite » le déplie à l'écran.
 * Un texte court (moins de SEUIL caractères) s'affiche tel quel, sans bouton inutile. */
import { useState } from "react";
import { Pressable, Text, View, type StyleProp, type TextStyle } from "react-native";
import { CIBLE, couleurs, POLICE, TYPO } from "../lib/theme";
import { enfonce } from "./mouvement";

export const SEUIL = 160;
export const LIGNES = 3;

export function Repliable({ texte, style }: { texte: string; style?: StyleProp<TextStyle> }) {
  const [ouvert, ouvrir] = useState(false);
  if (texte.length <= SEUIL) return <Text style={style ?? TYPO.corps}>{texte}</Text>;
  return (
    <View>
      <Text style={style ?? TYPO.corps} numberOfLines={ouvert ? undefined : LIGNES} accessibilityLabel={texte}>{texte}</Text>
      <Pressable onPress={() => ouvrir(!ouvert)} accessibilityRole="button" accessibilityState={{ expanded: ouvert }}
        aria-expanded={ouvert} testID="repliable"
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", ...enfonce(pressed) })}>
        <Text style={{ fontFamily: POLICE.titre, fontSize: 15, color: couleurs.lien }}>{ouvert ? "Réduire" : "Lire la suite"}</Text>
      </Pressable>
    </View>
  );
}
