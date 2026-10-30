/* Variante « chiffre » : un grand nombre, sa source. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";
import { CHIFFRE } from "../donnees";

export function ChiffreStory({ refCarte, mode = "clair" }: { refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode }) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} titre={`Le chiffre du jour · ${CHIFFRE.ville}`}
      source={`Source : OFGL, comptes ${CHIFFRE.an}.`}
      corps={<>
        <Text style={{ fontFamily: POLICE.affiche, fontSize: 72, lineHeight: 76, color: P.encre }}>{CHIFFRE.euros}</Text>
        <Text style={{ color: P.sourd, fontSize: 18, lineHeight: 24 }}>dépensés par habitant en {CHIFFRE.an}</Text>
      </>} />
  );
}
