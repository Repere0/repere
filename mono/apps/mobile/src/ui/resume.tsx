/* RESUMER AVANT D'EXPLIQUER — spike du 30/09/2026.
 *
 * L'ordre de lecture de chaque information importante :
 *   phrase humaine (factuelle)  ->  chiffre cle  ->  visuel  ->  « En clair »
 *   ->  ⓘ Source  ->  approfondir (repli).
 * La phrase vient toujours d'une regle de @repere/core ou d'une donnee brute,
 * jamais d'une formule emotionnelle : pas de « bonne nouvelle », pas de
 * « refuse ». Les icones sont des reperes de categorie, masques au lecteur
 * d'ecran : ce sont des Ionicons, jamais des emojis (05/11/2026). */
import { espacesFines } from "./donnees";
import { ChiffreQuiCompte } from "./visuels";
import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { PAS, TYPO } from "../lib/theme";
import { EnClair } from "./stitch";

/* Une etiquette de categorie : libelle en capitales de style. */
export function Etiquette({ texte, couleur }: { texte: string; couleur?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
      <Text style={[TYPO.etiquette, couleur ? { color: couleur } : null, { flex: 1 }]} accessibilityRole="header">{texte}</Text>
    </View>
  );
}

/* `geant` : LE chiffre de l'écran (un seul par écran, porteur, 11/11/2026) ; les autres restent en TYPO.stat. */
export function Resume({ phrase, chiffre, legende, enClair, children, geant }: {
  geant?: boolean;
  phrase: string; chiffre?: string | null; legende?: string; enClair?: string | null; children?: ReactNode;
}) {
  return (
    <View style={{ gap: PAS * 3 }}>
      <Text style={TYPO.reponse}>{phrase}</Text>
      {chiffre ? (
        <View accessible accessibilityLabel={`${chiffre}${legende ? ", " + legende : ""}`}>
          {(() => {
            const style = geant ? [TYPO.chiffre, { fontSize: TYPO.chiffre.fontSize * 1.75, lineHeight: TYPO.chiffre.lineHeight * 1.6, letterSpacing: -2 }] : TYPO.stat;
            /* Le chiffre héros d'un montant entier (« 4 493 € ») se révèle en 0,5 s ; tout autre format s'affiche tel quel. */
            const m = geant && typeof chiffre === "string" ? /^(\d[\d\s\u202f\u00a0]*)(\D*)$/.exec(chiffre) : null;
            const nombre = m ? Number(m[1].replace(/[\s\u202f\u00a0]/g, "")) : NaN;
            return Number.isFinite(nombre) && m
              ? <ChiffreQuiCompte valeur={nombre} style={style} etiquette={chiffre as string} suffixe={m[2] ? <Text>{m[2]}</Text> : undefined} />
              : <Text style={style}>{typeof chiffre === "string" ? espacesFines(chiffre) : chiffre}</Text>;
          })()}
          {legende ? <Text style={TYPO.note}>{legende}</Text> : null}
        </View>
      ) : null}
      {children}
      {/* 09/11/2026 : le cartouche « En clair » des maquettes Stitch (ui/stitch.tsx). */}
      <EnClair texte={enClair} />
    </View>
  );
}
