/* Variante « à venir » : un point de l'agenda publié, sans vote ni résultat.
   Ce n'est pas une carte de vote : un point de calendrier n'a pas encore de position. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export function AgendaStory({ refCarte, mode = "clair", titre, date, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; titre: string; date: string; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} titre="À venir au Parlement" source={source}
      corps={<>
        <Text style={{ fontFamily: POLICE.titre, fontSize: 28, lineHeight: 34, color: P.encre }}>{titre}</Text>
        <Text style={{ color: P.sourd, fontSize: 18, lineHeight: 24 }}>{date}</Text>
      </>} />
  );
}
