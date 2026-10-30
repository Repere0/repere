/* Variante « actualité » : un événement publié par Repère, avec sa source. Le texte
   est celui de l'enregistrement, jamais réécrit ici. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export function ActuStory({ refCarte, mode = "sombre", titre, corps, source, etiquette = "Ce qui s'est passé au Parlement" }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; titre: string; corps: string; source: string; etiquette?: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} titre={etiquette} source={source}
      corps={<>
        <Text style={{ fontFamily: POLICE.titre, fontSize: 26, lineHeight: 32, color: P.encre }}>{titre}</Text>
        <Text numberOfLines={9} style={{ color: P.sourd, fontSize: 16, lineHeight: 22 }}>{corps}</Text>
      </>} />
  );
}
