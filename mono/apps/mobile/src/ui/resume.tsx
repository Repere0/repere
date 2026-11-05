/* RESUMER AVANT D'EXPLIQUER — spike du 30/09/2026.
 *
 * L'ordre de lecture de chaque information importante :
 *   phrase humaine (factuelle)  ->  chiffre cle  ->  visuel  ->  « En clair »
 *   ->  ⓘ Source  ->  approfondir (repli).
 * La phrase vient toujours d'une regle de @repere/core ou d'une donnee brute,
 * jamais d'une formule emotionnelle : pas de « bonne nouvelle », pas de
 * « refuse ». Les icones sont des reperes de categorie, masques au lecteur
 * d'ecran : ce sont des Ionicons, jamais des emojis (05/11/2026). */
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { couleurs, PAS, TYPO } from "../lib/theme";

/* Une etiquette de categorie : libelle en capitales de style. */
export function Etiquette({ texte, couleur }: { texte: string; couleur?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
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
          <Text style={[TYPO.corps, { fontWeight: "600", color: couleurs.lien }]}>En clair</Text>
          <Text style={[TYPO.corps, { flex: 1 }]}>{enClair}</Text>
        </View>
      ) : null}
    </View>
  );
}
