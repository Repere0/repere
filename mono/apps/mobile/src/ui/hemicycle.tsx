/* L'HÉMICYCLE (07/11/2026) : la composition de l'Assemblée, un point par député.
 *
 * Données : data/deputes-groupes.json (AMO30, Assemblée nationale), avec sa source et sa date.
 * Sans fichier lisible : rien n'est dessiné (doctrine du vide) ; l'écran garde sa phrase.
 * 13/11/2026 (décision du porteur) : quand data/hemicycle-plan.json est publié, chaque point est la VRAIE place
 * du député dans la salle (plan de l'Assemblée) — le creux du perchoir et les travées viennent de la source — et
 * la légende suit la salle, de la gauche vers la droite vue du perchoir. C'est la description d'un lieu, et non
 * un rang (invariant 3) : rien n'est trié par taille ni par valeur, et l'écran dit d'où vient l'ordre.
 * Sans ce fichier : l'arc ci-dessous, groupes par ordre alphabétique, et l'écran l'écrit (on ne présente jamais
 * une disposition inventée comme le plan réel).
 * Couleurs : celles des groupes, pour les reconnaître seulement (invariant 7, palette.ts).
 * 12/11/2026 (porteur : « moins plat ») : chaque point a un filet plus sombre de sa teinte, un reflet en haut
 * à gauche et une ombre portée ; l'arc apparaît d'un souffle, et le groupe touché grossit (les autres à 20 %).
 * Couleurs trop proches : contour sur le second groupe (groupesACerner).
 * Aucun libellé majorité / opposition. Dessiné avec des View : aucune bibliothèque ajoutée. */
import { useMemo, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { compositionGroupes, groupesACerner, groupesDansLaSalle, siegesDuPlan, siegesHemicycle } from "@repere/core";
import { bordureGroupe, couleurGroupe, groupeDe, GROUPE_INCONNU, useFichierGroupes, usePlanHemicycle } from "../lib/groupes";
import { enfonce, useApparition } from "./mouvement";
import { CIBLE, feuille, couleurs, OMBRE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { PastilleSource } from "./source";
import { REFLET_AVATAR, rapportContraste } from "../lib/palette";

type Part = { groupe: string; sieges: number };

export function Hemicycle() {
  const fichier = useFichierGroupes();
  const plan = usePlanHemicycle();
  const [largeur, setLargeur] = useState(0);
  /* 07/11/2026 (maquette Stitch) : toucher un groupe l'éclaire, les autres passent à 20 %.
     Le geste de navigation devient le lien « Voir les N députés » du groupe choisi. */
  const [choisi, setChoisi] = useState<string | null>(null);
  const apparition = useApparition();
  /* Les sièges du plan réel, s'il est publié : [{ x, y, groupe }]. */
  const reels = useMemo(() => (fichier && plan ? siegesDuPlan(plan, (ref: string) => groupeDe(ref, fichier.groupes), GROUPE_INCONNU) : []),
    [fichier, plan]);
  const vraiPlan = reels.length > 0;
  const parts: Part[] = useMemo(() => {
    if (!fichier) return [];
    if (vraiPlan) return groupesDansLaSalle(reels, GROUPE_INCONNU);
    const t = fichier.groupes;
    return compositionGroupes(Object.keys(t).map(ref => groupeDe(ref, t)), GROUPE_INCONNU);
  }, [fichier, vraiPlan, reels]);
  const total = parts.reduce((a, p) => a + p.sieges, 0);
  const arc = useMemo(() => (vraiPlan ? [] : siegesHemicycle(total, 12, 0.35)), [total, vraiPlan]);
  if (!fichier || !total) return null;

  /* Deux couleurs trop proches (DEM/EPR, LIOT/Inconnu…) : le second groupe est cerné de la couleur
     du texte (blanc en sombre, encre en clair), sans toucher à la palette (invariant 7). */
  const cernes: Set<string> = groupesACerner(parts.map(p => p.groupe), couleurGroupe);
  /* Sous 3:1 sur la carte (WCAG 1.4.11) : un trait gris dessine le point. */
  const faible = (fond: string) => rapportContraste(fond, couleurs.carte) < 3;
  /* Le vrai plan porte son groupe sur chaque siège ; l'arc, lui, range les groupes dans l'ordre affiché. */
  const siegeDe = parts.flatMap(p => Array(p.sieges).fill(p.groupe) as string[]);
  const places: { x: number; y: number; groupe: string }[] = vraiPlan
    ? reels
    : arc.map((p: { x: number; y: number }, i: number) => ({ ...p, groupe: siegeDe[i] }));
  const rayon = largeur / 2;
  const point = Math.max(3, rayon * (vraiPlan ? 0.032 : 0.04));
  const ordre = vraiPlan ? "de la gauche vers la droite de l'hémicycle, vue du perchoir" : "dans l'ordre alphabétique";
  const phrase = `${total} députés, par groupe, ${ordre} : `
    + parts.map(p => `${p.groupe === GROUPE_INCONNU ? "groupe non publié" : p.groupe}, ${p.sieges}`).join(" ; ") + ".";

  return (
    <View style={s.carte}>
      <Text style={TYPO.etiquette} accessibilityRole="header">La composition de l'Assemblée</Text>
      <View onLayout={e => setLargeur(e.nativeEvent.layout.width)} accessible accessibilityLabel={phrase}
        style={{ width: "100%", height: rayon + point }}>
        {largeur ? (
          <Animated.View style={{ width: "100%", height: rayon + point, opacity: apparition,
            transform: [{ scale: apparition.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }}>
            {places.map((p, i: number) => {
              const g = p.groupe, fond = couleurGroupe(g), actif = choisi === g;
              return (
                <View key={i} style={{
                  position: "absolute", width: point, height: point, borderRadius: point / 2, backgroundColor: fond,
                  opacity: choisi && !actif ? 0.2 : 1,
                  ...(cernes.has(g) ? { borderWidth: 1.25, borderColor: couleurs.encre } : faible(fond) ? { borderWidth: 1, borderColor: couleurs.sourd } : { borderWidth: 0.75, borderColor: bordureGroupe(fond) }),
                  shadowColor: OMBRE.shadowColor, shadowOpacity: choisi && !actif ? 0 : 0.35, shadowRadius: 1.5, shadowOffset: { width: 0, height: 1 },
                  transform: [{ scale: actif ? 1.35 : 1 }], zIndex: actif ? 2 : 1,
                  left: rayon + p.x * (rayon - point / 2) - point / 2, top: rayon - p.y * (rayon - point / 2) - point / 2,
                }}>
                  <View style={{ position: "absolute", top: point * 0.14, left: point * 0.18, width: point * 0.34, height: point * 0.34,
                    borderRadius: point * 0.17, backgroundColor: REFLET_AVATAR.clair }} />
                </View>
              );
            })}
          </Animated.View>
        ) : null}
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
          style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
          <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>
            Voir les {parts.find(x => x.groupe === choisi)?.sieges ?? ""} députés {choisi === GROUPE_INCONNU ? "sans groupe publié" : choisi} ›
          </Text>
        </Pressable>
      ) : null}
      {/* D'où vient la place de chaque point : le lecteur ne doit jamais avoir a le deviner (invariant 4). */}
      <Text style={TYPO.micro} testID="hemicycle-ordre">
        {vraiPlan
          ? `${total} députés à leur place réelle dans la salle, d'après le plan publié par l'Assemblée nationale.`
          : `${total} députés. Disposition indicative, groupes par ordre alphabétique : ce n'est pas le plan de la salle.`}
      </Text>
      {/* Deux faits, deux sources : le groupe de chaque député, et sa place dans la salle. Chacune se lit. */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: PAS * 5 }}>
        <PastilleSource nom={vraiPlan ? "Source des groupes" : "Source"}
          source={{ producteur: fichier.source.producteur, licence: fichier.source.licence, url: fichier.source.url, releve: fichier.genere_le }} />
        {vraiPlan && plan ? (
          <PastilleSource nom="Source du plan"
            source={{ producteur: plan.source.producteur, licence: plan.source.licence, url: plan.source.url, releve: plan.genere_le }} />
        ) : null}
      </View>
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 5, gap: PAS * 4 },
  legende: { flexDirection: "row", flexWrap: "wrap", rowGap: PAS, justifyContent: "space-between" },
  item: { flexDirection: "row", alignItems: "center", gap: PAS * 2, minHeight: CIBLE, width: "48%" },
  pastille: { width: 12, height: 12, borderRadius: 6 },
}));
