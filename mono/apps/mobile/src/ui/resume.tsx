/* RESUMER AVANT D'EXPLIQUER — spike du 30/09/2026.
 *
 * L'ordre de lecture de chaque information importante :
 *   phrase humaine (factuelle)  ->  chiffre cle  ->  visuel  ->  « En clair »
 *   ->  ⓘ Source  ->  approfondir (repli).
 * La phrase vient toujours d'une regle de @repere/core ou d'une donnee brute,
 * jamais d'une formule emotionnelle : pas de « bonne nouvelle », pas de
 * « refuse ». Les emojis sont des reperes de categorie, masques au lecteur
 * d'ecran, et se coupent en une variable (EXPO_PUBLIC_REPERE_EMOJIS=0) pour
 * comparer les deux versions. */
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { couleurs, PAS, TYPO } from "../lib/theme";

/* Decision du 30/09/2026 : pas d'emojis pour l'instant. Ils ne reviennent
   que construits avec EXPO_PUBLIC_REPERE_EMOJIS=1, pour un test qui
   demontrerait leur fonction. */
export const AVEC_EMOJIS = process.env.EXPO_PUBLIC_REPERE_EMOJIS === "1";

export function Emoji({ c, taille = 16 }: { c: string; taille?: number }) {
  if (!AVEC_EMOJIS) return null;
  return <Text style={{ fontSize: taille }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{c}</Text>;
}

/* Une etiquette de categorie : emoji (optionnel) + libelle en capitales de style. */
export function Etiquette({ emoji, texte, couleur }: { emoji?: string; texte: string; couleur?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
      {emoji ? <Emoji c={emoji} /> : null}
      <Text style={[TYPO.etiquette, couleur ? { color: couleur } : null, { flex: 1 }]} accessibilityRole="header">{texte}</Text>
    </View>
  );
}

export function Resume({ phrase, chiffre, legende, enClair, children }: {
  phrase: string; chiffre?: string | null; legende?: string; enClair?: string | null; children?: ReactNode;
}) {
  return (
    <View style={{ gap: PAS * 3 }}>
      <Text style={TYPO.reponse}>{phrase}</Text>
      {chiffre ? (
        <View accessible accessibilityLabel={`${chiffre}${legende ? ", " + legende : ""}`}>
          <Text style={TYPO.chiffre} maxFontSizeMultiplier={1.4}>{chiffre}</Text>
          {legende ? <Text style={TYPO.note}>{legende}</Text> : null}
        </View>
      ) : null}
      {children}
      {enClair ? (
        <View style={{ flexDirection: "row", gap: PAS * 2, paddingTop: PAS }}>
          <Text style={[TYPO.corps, { fontWeight: "800", color: couleurs.lien }]}>En clair</Text>
          <Text style={[TYPO.corps, { flex: 1 }]}>{enClair}</Text>
        </View>
      ) : null}
    </View>
  );
}
