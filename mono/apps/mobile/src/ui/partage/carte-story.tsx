/* La carte 9:16 envoyee dans la feuille de partage. Hors ecran : seule la capture la montre.
   Sombre par defaut (decision D5, 30/10/2026) : fond et couleurs fixes, quel que soit le theme
   du telephone (palette.ts, PALETTE_CARTE). Le logo est la marque vectorielle (ui/logo.tsx). */
import type { ComponentRef, ReactNode, RefObject } from "react";
import { Text, View } from "react-native";
import { NEUTRES_PAR_MODE, type Mode } from "../../lib/palette";
import { Logo } from "../logo";

export function CarteStory({ refCarte, mode = "sombre", titre, corps, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; titre: string; corps: ReactNode; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <View ref={refCarte} collapsable={false} style={{ width: 360, height: 640, backgroundColor: P.sol, padding: 28, justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Logo size={34} c={P} />
        <Text style={{ color: P.encre, fontWeight: "800", fontSize: 20 }}>Repère</Text>
      </View>
      <View style={{ gap: 16 }}>
        <Text style={{ color: P.sourd, fontSize: 16 }}>{titre}</Text>
        {corps}
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ color: P.sourd, fontSize: 14, lineHeight: 20 }}>L'application qui vous raccroche à votre citoyenneté française.</Text>
        <Text style={{ color: P.sourd, fontSize: 12, lineHeight: 16 }}>{source}</Text>
      </View>
    </View>
  );
}
