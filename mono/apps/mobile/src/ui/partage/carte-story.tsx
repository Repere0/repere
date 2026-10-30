/* La carte 9:16 envoyee dans la feuille de partage. Hors ecran : seule la capture la montre.
   Claire par defaut : elle part dans une messagerie, sur un fond que nous ne choisissons
   pas (palette.ts). Le logo est le « R » de secours : aucun fichier logo dans l'application. */
import type { ComponentRef, ReactNode, RefObject } from "react";
import { Text, View } from "react-native";
import { NEUTRES_PAR_MODE, type Mode } from "../../lib/palette";

export function CarteStory({ refCarte, mode = "clair", titre, corps, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; titre: string; corps: ReactNode; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <View ref={refCarte} collapsable={false} style={{ width: 360, height: 640, backgroundColor: P.sol, padding: 28, justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: P.encre, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: P.sol, fontWeight: "800", fontSize: 20 }}>R</Text>
        </View>
        <Text style={{ color: P.encre, fontWeight: "800", fontSize: 20 }}>Repère</Text>
      </View>
      <View style={{ gap: 16 }}>
        <Text style={{ color: P.sourd, fontSize: 16 }}>{titre}</Text>
        {corps}
      </View>
      <Text style={{ color: P.sourd, fontSize: 12, lineHeight: 16 }}>{source}</Text>
    </View>
  );
}
