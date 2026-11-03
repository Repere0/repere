/* Variante « actualité » (V34, bloc 4) : le titre de l'enregistrement, en tres gros, et sa premiere
   phrase, telle quelle. Le texte n'est jamais reecrit ici. La mention « locale » ou « au Parlement »
   passe dans le pied, avec la source. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export function ActuStory({ refCarte, mode = "sombre", titre, corps, source, etiquette = "Ce qui s'est passé au Parlement" }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; titre: string; corps: string; source: string; etiquette?: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  /* La premiere phrase de l'enregistrement, ou le texte entier s'il n'a pas de point. */
  const phrase = corps.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? corps;
  const taille = titre.length > 90 ? 28 : titre.length > 45 ? 34 : 42;
  return (
    <CarteStory refCarte={refCarte} mode={mode} pied={etiquette} source={source}
      corps={<>
        <Text style={{ fontFamily: POLICE.titre, fontSize: taille, lineHeight: taille * 1.15, color: P.encre }}>{titre}</Text>
        <Text numberOfLines={4} style={{ color: P.sourd, fontSize: 18, lineHeight: 25 }}>{phrase}</Text>
      </>} />
  );
}
