/* La carte 9:16 envoyee dans la feuille de partage. Hors ecran : seule la capture la montre.
   Sombre par defaut (decision D5, 30/10/2026) : fond et couleurs fixes, quel que soit le theme
   du telephone (palette.ts, PALETTE_CARTE). Le logo est la marque vectorielle (ui/logo.tsx).
   V34 (bloc 4, skill ux-ui-audit puis ux-superpowers) : logo en haut, un seul bloc central
   (le titre tres gros, une phrase, un visuel eventuel), la source en bas. Plus de signature. */
import type { ComponentRef, ReactNode, RefObject } from "react";
import { Text, View } from "react-native";
import { NEUTRES_PAR_MODE, type Mode } from "../../lib/palette";
import { Logo } from "../logo";

export function CarteStory({ refCarte, mode = "sombre", corps, pied, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; corps: ReactNode; pied?: string; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <View ref={refCarte} collapsable={false} testID="carte-story" style={{ width: 360, height: 640, backgroundColor: P.sol, padding: 28, justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Logo size={34} c={P} />
        <Text style={{ color: P.encre, fontWeight: "800", fontSize: 20 }}>Repère</Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center", gap: 22 }}>{corps}</View>
      <View style={{ gap: 6 }}>
        {pied ? <Text style={{ color: P.sourd, fontSize: 13, lineHeight: 18 }}>{pied}</Text> : null}
        <Text style={{ color: P.sourd, fontSize: 13, lineHeight: 18 }}>{source}</Text>
      </View>
    </View>
  );
}
