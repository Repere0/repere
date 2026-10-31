/* Variante « élu » (V34, bloc 4) : le nom en tres gros, et une phrase : la fonction et le lieu.
   Ce n'est pas une carte de vote : les votes sont dans « Qui décide », par commune. Aucun parti ni
   photo n'y figure, parce que les données publiées n'en portent pas. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export function ElusStory({ refCarte, mode = "sombre", nom, fonction, lieu, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; nom: string; fonction: string; lieu: string; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  const phrase = [fonction, lieu].filter(Boolean).join(", ");
  const taille = nom.length > 24 ? 34 : 42;
  return (
    <CarteStory refCarte={refCarte} mode={mode} pied="Annuaire Repère" source={source}
      corps={<>
        <Text style={{ fontFamily: POLICE.titre, fontSize: taille, lineHeight: taille * 1.15, color: P.encre }}>{nom}</Text>
        {phrase ? <Text style={{ color: P.sourd, fontSize: 18, lineHeight: 25 }}>{phrase}.</Text> : null}
      </>} />
  );
}
