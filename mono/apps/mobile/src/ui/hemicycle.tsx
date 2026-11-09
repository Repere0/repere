/* L'HÉMICYCLE (07/11/2026) : la composition de l'Assemblée, un point par député.
 *
 * Données : data/deputes-groupes.json (AMO30, Assemblée nationale), avec sa source et sa date.
 * Sans fichier lisible : rien n'est dessiné (doctrine du vide) ; l'écran garde sa phrase.
 * Ordre : alphabétique (@repere/core, compositionGroupes) — jamais par taille (invariant 3).
 * Couleurs : celles des groupes, pour les reconnaître seulement (invariant 7, palette.ts).
 * Couleurs trop proches : contour sur le second groupe (groupesACerner).
 * Aucun libellé majorité / opposition. Dessiné avec des View : aucune bibliothèque ajoutée. */
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { compositionGroupes, groupesACerner, siegesHemicycle } from "@repere/core";
import { couleurGroupe, groupeDe, GROUPE_INCONNU, useFichierGroupes } from "../lib/groupes";
import { CIBLE, feuille, couleurs, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { PastilleSource } from "./source";

type Part = { groupe: string; sieges: number };

export function Hemicycle() {
  const fichier = useFichierGroupes();
  const [largeur, setLargeur] = useState(0);
  /* 07/11/2026 (maquette Stitch) : toucher un groupe l'éclaire, les autres passent à 20 %.
     Le geste de navigation devient le lien « Voir les N députés » du groupe choisi. */
  const [choisi, setChoisi] = useState<string | null>(null);
  const parts: Part[] = useMemo(() => {
    if (!fichier) return [];
    const t = fichier.groupes;
    return compositionGroupes(Object.keys(t).map(ref => groupeDe(ref, t)), GROUPE_INCONNU);
  }, [fichier]);
  const total = parts.reduce((a, p) => a + p.sieges, 0);
  const sieges = useMemo(() => siegesHemicycle(total, 12, 0.35), [total]);
  if (!fichier || !total) return null;

  /* Deux couleurs trop proches (DEM/EPR, LIOT/Inconnu…) : le second groupe est cerné de la couleur
     du texte (blanc en sombre, encre en clair), sans toucher à la palette (invariant 7). */
  const cernes: Set<string> = groupesACerner(parts.map(p => p.groupe), couleurGroupe);
  const siegeDe = parts.flatMap(p => Array(p.sieges).fill(p.groupe) as string[]);
  const rayon = largeur / 2;
  const point = Math.max(3, rayon * 0.04);
  const phrase = `${total} députés, par groupe, dans l'ordre alphabétique : `
    + parts.map(p => `${p.groupe === GROUPE_INCONNU ? "groupe non publié" : p.groupe}, ${p.sieges}`).join(" ; ") + ".";

  return (
    <View style={s.carte}>
      <Text style={TYPO.etiquette} accessibilityRole="header">La composition de l'Assemblée</Text>
      <View onLayout={e => setLargeur(e.nativeEvent.layout.width)} accessible accessibilityLabel={phrase}
        style={{ width: "100%", height: rayon + point }}>
        {largeur ? sieges.map((p: { x: number; y: number }, i: number) => (
          <View key={i} style={{
            position: "absolute", width: point, height: point, borderRadius: point / 2, backgroundColor: couleurGroupe(siegeDe[i]),
            opacity: choisi && siegeDe[i] !== choisi ? 0.2 : 1,
            ...(cernes.has(siegeDe[i]) ? { borderWidth: 1.25, borderColor: couleurs.encre } : null),
            left: rayon + p.x * (rayon - point / 2) - point / 2, top: rayon - p.y * (rayon - point / 2) - point / 2,
          }} />
        )) : null}
      </View>
      <View style={s.legende}>
        {parts.map(p => (
          <Pressable key={p.groupe} onPress={() => setChoisi(c => (c === p.groupe ? null : p.groupe))} accessibilityRole="button"
            accessibilityState={{ selected: choisi === p.groupe }}
            accessibilityLabel={`${p.groupe === GROUPE_INCONNU ? "Groupe non publié" : p.groupe}, ${p.sieges} députés. ${choisi === p.groupe ? "Retirer la mise en évidence" : "Mettre en évidence"}`}
            style={({ pressed }) => [s.item, { opacity: choisi && choisi !== p.groupe ? 0.4 : pressed ? 0.7 : 1 }]}>
            <View style={[s.pastille, { backgroundColor: couleurGroupe(p.groupe) }, cernes.has(p.groupe) ? { borderWidth: 2, borderColor: couleurs.encre } : null]} />
            <Text style={[TYPO.corps, choisi === p.groupe ? { fontFamily: POLICE.titre } : null]}>{p.groupe === GROUPE_INCONNU ? "Non publié" : p.groupe}</Text>
            <Text style={TYPO.donnee}>{p.sieges}</Text>
          </Pressable>
        ))}
      </View>
      {choisi ? (
        <Pressable onPress={() => router.push({ pathname: "/groupe", params: { g: choisi } })} accessibilityRole="link"
          accessibilityLabel={`Voir la liste des députés du groupe ${choisi === GROUPE_INCONNU ? "non publié" : choisi}`}
          style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
          <Text style={[TYPO.corps, { fontFamily: POLICE.titre, textDecorationLine: "underline" }]}>
            Voir les {parts.find(x => x.groupe === choisi)?.sieges ?? ""} députés {choisi === GROUPE_INCONNU ? "sans groupe publié" : choisi} ›
          </Text>
        </Pressable>
      ) : null}
      {/* 07/11/2026 : raccourci. La place sur l'arc vient de l'ordre alphabétique (invariant 3). */}
      <Text style={TYPO.micro}>{total} députés. Ordre alphabétique : ne reflète pas la position politique.</Text>
      <PastilleSource source={{ producteur: fichier.source.producteur, licence: fichier.source.licence, url: fichier.source.url, releve: fichier.genere_le }} />
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 5, gap: PAS * 4, borderWidth: 1, borderColor: couleurs.trait },
  legende: { flexDirection: "row", flexWrap: "wrap", columnGap: PAS * 5, rowGap: PAS * 2 },
  item: { flexDirection: "row", alignItems: "center", gap: PAS * 2, minHeight: CIBLE },
  pastille: { width: 12, height: 12, borderRadius: 6 },
}));
