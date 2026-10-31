/* « POURQUOI JE VOIS ÇA » — V29 bloc 5 (D50, transparence). Un bouton « ? » à côté d'un
 * chiffre ou d'un vote ouvre la même feuille que « Tout voir » : trois sections, la source,
 * le calcul, la raison de l'affichage ici. Chaque texte est écrit par le code qui l'affiche. */
import { useState } from "react";
import { Linking, Pressable, Text } from "react-native";
import { CIBLE, couleurs, TYPO } from "../lib/theme";
import { ModaleExhaustif } from "./modale-exhaustif";

export type Pourquoi = { source: { texte: string; lien?: string | null }; calcul: string; ici: string };

export function PourquoiJeVois({ p, etiquette, couleur, fond }: { p: Pourquoi; etiquette: string; couleur?: string; fond?: string }) {
  const [ouvert, setOuvert] = useState(false);
  const encre = couleur ?? couleurs.encre;
  return (
    <>
      <Pressable onPress={() => setOuvert(true)} accessibilityRole="button" accessibilityLabel={`Pourquoi je vois ça : ${etiquette}`}
        style={({ pressed }) => ({ minWidth: CIBLE, minHeight: CIBLE, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
        <Text aria-hidden style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: encre, color: encre, textAlign: "center", lineHeight: 22, fontWeight: "500", fontSize: 14, backgroundColor: fond }}>?</Text>
      </Pressable>
      <ModaleExhaustif titre="Pourquoi je vois ça" visible={ouvert} onFermer={() => setOuvert(false)} sections={[
        { titre: "Source", contenu: p.source.lien
          ? <Pressable onPress={() => Linking.openURL(p.source.lien as string)} accessibilityRole="link" accessibilityLabel={`${p.source.texte}, ouvre un site externe`}
              style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
              <Text style={[TYPO.corps, { textDecorationLine: "underline" }]}>{p.source.texte} (site externe)</Text>
            </Pressable>
          : p.source.texte },
        { titre: "Calcul", contenu: p.calcul },
        { titre: "Pourquoi ici", contenu: p.ici },
      ]} />
    </>
  );
}
