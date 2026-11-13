/* Variante « quiz civique » (13/11/2026, décision du porteur, ADR 0010) : le rang atteint, en très gros.
 *
 * Ce que cette carte ne dit JAMAIS : un vote, une position, un élu, un parti, une commune. Elle ne parle
 * que de vocabulaire institutionnel — c'est la limite exacte de l'amendement de l'invariant 6. Aucun
 * rang comparé entre lecteurs non plus : il n'y a rien à comparer, Repère ne sait rien des autres. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export function QuizStory({ refCarte, mode = "sombre", rang, defi }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; rang: string; defi: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} pied="Quiz civique" source="Dictionnaire citoyen de Repère"
      corps={<>
        <Text style={{ color: P.sourd, fontSize: 20, lineHeight: 28 }}>J'ai atteint le rang de</Text>
        <Text style={{ fontFamily: POLICE.titre, fontSize: 52, lineHeight: 58, color: P.encre }}>{rang}</Text>
        <Text style={{ color: P.sourd, fontSize: 22, lineHeight: 30 }}>{defi}</Text>
      </>} />
  );
}
