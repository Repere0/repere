/* Variante « élu » : la fiche d'un élu de l'annuaire, avec sa source. Ce n'est pas une
   carte de vote : les votes sont dans « Qui décide », par commune. Aucun parti ni photo
   n'y figure, parce que les données publiées n'en portent pas. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export function ElusStory({ refCarte, mode = "sombre", nom, fonction, lieu, depuis, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; nom: string; fonction: string; lieu: string; depuis: string; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} titre="Élu dans l'annuaire Repère" source={source}
      corps={<>
        <Text style={{ fontFamily: POLICE.titre, fontSize: 30, lineHeight: 36, color: P.encre }}>{nom}</Text>
        {fonction ? <Text style={{ color: P.encre, fontSize: 18, lineHeight: 24 }}>{fonction}</Text> : null}
        {lieu ? <Text style={{ color: P.sourd, fontSize: 16, lineHeight: 22 }}>{lieu}</Text> : null}
        {depuis ? <Text style={{ color: P.sourd, fontSize: 16, lineHeight: 22 }}>{depuis}</Text> : null}
        {/* Le groupe politique n'est publié nulle part dans les données : badge gris, sans couleur de parti. */}
        <View style={{ alignSelf: "flex-start", borderWidth: 1, borderColor: P.sourd, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: P.sourd, fontSize: 14 }}>Groupe politique : non publié</Text>
        </View>
      </>} />
  );
}
