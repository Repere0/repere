/* Variante « vote » : une phrase simple, le titre du texte, la source officielle.
   Le vote est en gris : aucune couleur de vote (invariant 7). */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { titreLisible } from "@repere/core";
import { CarteStory } from "../carte-story";
import { LIEN_VOTE, VOTE } from "../donnees";

export function VoteStory({ refCarte, mode = "clair" }: { refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode }) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} titre="Dernier vote enregistré"
      source={`Source : Assemblée nationale, scrutin n° ${VOTE.n}, 13 octobre 2026. ${LIEN_VOTE}`}
      corps={<>
        <Text style={{ fontFamily: POLICE.titre, fontSize: 30, lineHeight: 36, color: P.encre }}>{VOTE.depute} s'est abstenu.</Text>
        <Text style={{ color: P.sourd, fontSize: 16, lineHeight: 22 }}>{titreLisible(VOTE.titre)}</Text>
        <Text style={{ color: P.sourd, fontSize: 14, lineHeight: 20 }}>Député de la 1re circonscription de Seine-et-Marne.</Text>
      </>} />
  );
}
