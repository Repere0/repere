/* Variante « vote » (V34, bloc 4) : le resultat en tres gros, avec une icone qui le dit sans
   couleur seule (forme : coche, croix, tiret ; couleur : ADR 0003, COULEURS_VOTE). Une phrase :
   le nom et la date. Le sujet du texte reste dans le message de partage (repli), pas sur la carte. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { COULEURS_VOTE, NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

type Position = "p" | "c" | "a";
const LIBELLE: Record<Position, string> = { p: "Pour", c: "Contre", a: "Abstention" };
/* Taille du mot : « Abstention » est le plus long, il doit tenir sur une ligne de 304 px. */
const TAILLE: Record<Position, number> = { p: 104, c: 80, a: 48 };
const SYMBOLE: Record<Position, string> = { p: "✓", c: "✕", a: "–" };
const COULEUR: Record<Position, string> = { p: COULEURS_VOTE.votePour, c: COULEURS_VOTE.voteContre, a: COULEURS_VOTE.voteAbstention };

export function VoteStory({ refCarte, mode = "sombre", position, nom, date, source }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; position: Position; nom: string; date: string; source: string;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  return (
    <CarteStory refCarte={refCarte} mode={mode} source={source} pied="Dernier vote publié"
      corps={<>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: COULEUR[position], alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: P.blanc, fontSize: 48, lineHeight: 56, fontWeight: "800" }}>{SYMBOLE[position]}</Text>
        </View>
        <Text style={{ fontFamily: POLICE.affiche, fontSize: TAILLE[position], lineHeight: TAILLE[position] * 1.02, color: P.encre }}>{LIBELLE[position]}</Text>
        <Text style={{ color: P.sourd, fontSize: 18, lineHeight: 25 }}>{nom} a voté à l'Assemblée nationale, le {date}.</Text>
      </>} />
  );
}
