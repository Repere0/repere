/* LA STORY « LE REPÈRE DU JOUR » (V55, bloc 2) — une carte 9:16 pour la feuille de partage.
 *
 * Même gabarit que les autres stories (CarteStory : 360 x 640 pt, capturée à 1080 x 1920 px).
 * Contenu : logo et titre, « date · commune », les faits du jour (80 caractères au plus chacun),
 * la source de chaque fait, et « #Repère » en pied. Fond sombre, comme les autres cartes
 * (décision D5). Rien n'est calculé ici : les faits et leurs sources viennent de l'écran. */
import type { ComponentRef, RefObject } from "react";
import { Text, View } from "react-native";
import { raccourcirFait } from "@repere/core";
import { POLICE } from "../lib/theme";
import { ECHELONS_PAR_MODE, NEUTRES_PAR_MODE, type Mode } from "../lib/palette";
import type { FaitDuJour, SourcesDuJour } from "../lib/repere-jour";
import { CarteStory } from "./partage/carte-story";

export function RepereDuJourStory({ refCarte, mode = "sombre", ville, date, faits, sources }: {
  refCarte: RefObject<ComponentRef<typeof View> | null>; mode?: Mode; ville: string; date: string;
  faits: (FaitDuJour & { texte: string })[]; sources: SourcesDuJour;
}) {
  const P = NEUTRES_PAR_MODE[mode];
  const E = ECHELONS_PAR_MODE[mode];
  const lignes = faits.slice(0, 3).map(f => {
    const src = sources[f.source];
    return { id: f.id, texte: raccourcirFait(f.texte, { max: 80, visible: 80 }), source: src?.court ?? src?.producteur ?? "" };
  });
  return (
    <CarteStory refCarte={refCarte} mode={mode} pied="#Repère"
      source="Chiffres publiés par les producteurs cités ; ce qui est calculé est annoncé comme tel."
      corps={<>
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: POLICE.affiche, fontSize: 36, lineHeight: 40, color: P.encre }}>Le Repère du jour</Text>
          <Text style={{ color: P.sourd, fontSize: 16, lineHeight: 22 }}>{`${date} · ${ville}`}</Text>
        </View>
        <View style={{ gap: 18 }}>
          {lignes.map(l => (
            <View key={l.id} style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, marginTop: 7, backgroundColor: E.ville }} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: P.encre, fontSize: 17, lineHeight: 23 }}>{l.texte}</Text>
                <Text style={{ color: P.sourd, fontSize: 12, lineHeight: 16 }}>{`Source : ${l.source}`}</Text>
              </View>
            </View>
          ))}
        </View>
      </>} />
  );
}
