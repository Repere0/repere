/* Variante « chiffre » (V34, bloc 4) : le montant par habitant en tres gros, une phrase, et une
   mini-infographie « sur 100 € » : les deux parts PUBLIEES (salaires, investissement) et le reste,
   sans pourcentage ni nombre calcule. Toutes les valeurs viennent de l'ecran appelant. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { POLICE } from "../../../lib/theme";
import { ECHELONS_PAR_MODE, NEUTRES_PAR_MODE, type Mode } from "../../../lib/palette";
import { CarteStory } from "../carte-story";

export type PartsCent = { salaires: number | null; investissement: number | null };

export function ChiffreStory({ refCarte, mode = "sombre", ville, euros, an, source, parts }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; ville: string; euros: string; an: string | number; source: string;
  parts?: PartsCent | null;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  const E = ECHELONS_PAR_MODE[mode];
  const s = parts?.salaires ?? null, i = parts?.investissement ?? null;
  /* Le reste est dessine, jamais chiffre : la source ne le detaille pas. */
  const reste = Math.max(0, 100 - (s ?? 0) - (i ?? 0));
  const lignes = [
    s !== null ? { couleur: E.ville, libelle: "Salaires des agents", valeur: `${s} €` } : null,
    i !== null ? { couleur: E.dept, libelle: "Investissements", valeur: `${i} €` } : null,
    { couleur: P.sourd, libelle: "Reste, non détaillé par la source", valeur: "" },
    /* gris clair : le reste est la plus grande part et doit se voir (non-texte, 3:1 au moins) */
  ].filter(Boolean) as { couleur: string; libelle: string; valeur: string }[];
  return (
    <CarteStory refCarte={refCarte} mode={mode} source={source}
      corps={<>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: POLICE.affiche, fontSize: 76, lineHeight: 80, color: P.encre }}>{euros}</Text>
          <Text style={{ color: P.sourd, fontSize: 18, lineHeight: 25 }}>dépensés par habitant à {ville} en {an}.</Text>
        </View>
        {s !== null || i !== null ? (
          <View accessible accessibilityLabel={`Sur 100 € dépensés : ${lignes.map(l => l.libelle + (l.valeur ? " " + l.valeur : "")).join(", ")}.`} style={{ gap: 12 }}>
            <Text style={{ color: P.sourd, fontSize: 14, lineHeight: 20 }}>Sur 100 € dépensés</Text>
            <View style={{ flexDirection: "row", height: 28, borderRadius: 6, overflow: "hidden" }}>
              {s !== null ? <View style={{ width: `${Math.min(s, 100)}%`, backgroundColor: E.ville }} /> : null}
              {i !== null ? <View style={{ width: `${Math.max(0, Math.min(i, 100 - (s ?? 0)))}%`, backgroundColor: E.dept }} /> : null}
              {reste > 0 ? <View style={{ flex: 1, backgroundColor: P.sourd }} /> : null}
            </View>
            <View style={{ gap: 6 }}>
              {lignes.map(l => (
                <View key={l.libelle} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: l.couleur }} />
                  <Text style={{ flex: 1, color: P.encre, fontSize: 14, lineHeight: 20 }}>{l.libelle}</Text>
                  {l.valeur ? <Text style={{ color: P.encre, fontSize: 14, fontWeight: "700" }}>{l.valeur}</Text> : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </>} />
  );
}
