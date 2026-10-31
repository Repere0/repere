/* Variante « à venir » (V34, bloc 4) : le point de l'agenda en tres gros, et sa date. Pas de vote,
   pas de resultat : un point de calendrier n'a pas encore de position. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export function AgendaStory({ refCarte, mode = "sombre", titre, date, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; titre: string; date: string; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  const taille = titre.length > 90 ? 26 : titre.length > 45 ? 32 : 40;
  return (
    <CarteStory refCarte={refCarte} mode={mode} pied="À venir au Parlement" source={source}
      corps={<>
        <Text style={{ fontFamily: POLICE.titre, fontSize: taille, lineHeight: taille * 1.15, color: P.encre }}>{titre}</Text>
        <Text style={{ color: P.sourd, fontSize: 18, lineHeight: 25 }}>{date}</Text>
      </>} />
  );
}
