/* Variante « chiffre » : un grand nombre et sa source. Toutes les valeurs viennent de l'ecran appelant. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export function ChiffreStory({ refCarte, mode = "clair", ville, euros, an, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; ville: string; euros: string; an: string | number; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} titre={`Dépenses de ${ville}`} source={source}
      corps={<>
        <Text style={{ fontFamily: POLICE.affiche, fontSize: 72, lineHeight: 76, color: P.encre }}>{euros}</Text>
        <Text style={{ color: P.sourd, fontSize: 18, lineHeight: 24 }}>dépensés par habitant en {an}</Text>
      </>} />
  );
}
