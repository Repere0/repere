/* Variante « vote » : une phrase simple, le titre du texte, la source officielle.
   Le vote reste en gris : la couleur du groupe n'identifie que l'élu (invariant 7). */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { BadgeGroupe } from "../../badge-groupe";
import { CarteStory } from "../carte-story";

export function VoteStory({ refCarte, mode = "sombre", groupe, etiquette, phrase, titre, sous, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; groupe: string;
  etiquette: string; phrase: string; titre: string; sous: string; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} titre={etiquette} source={source}
      corps={<>
        <BadgeGroupe groupe={groupe} />
        <Text style={{ fontFamily: POLICE.titre, fontSize: 30, lineHeight: 36, color: P.encre }}>{phrase}</Text>
        <Text style={{ color: P.sourd, fontSize: 16, lineHeight: 22 }}>{titre}</Text>
        <Text style={{ color: P.sourd, fontSize: 14, lineHeight: 20 }}>{sous}</Text>
      </>} />
  );
}
