/* LE SÉNAT (13/11/2026, décision du porteur : « l'onglet L'Assemblée devient Le Parlement »).
 *
 * Données : data/senateurs.json, produit par scripts/collecte-senat.mjs depuis api-senat, avec sa source,
 * sa LICENCE RELEVÉE à la collecte et sa date. Absent ou illisible : une phrase vraie et un lien, jamais
 * une forme vide ni des sièges inventés (invariant 5).
 *
 * Ce que l'écran montre : la composition en sièges, la liste des sénateurs, leur groupe, leur commission
 * permanente et le lien vers leur fiche officielle. Rien d'autre : aucune présence, aucune absence, aucun
 * patrimoine (invariant 8).
 *
 * ORDRE : alphabétique du sigle, « sans groupe » au bout — jamais par taille (invariant 3). Contrairement
 * à l'Assemblée, le plan réel de la salle n'est pas publié par le Sénat sous une forme lisible : l'arc est
 * donc une disposition indicative, et l'écran l'écrit.
 *
 * COULEURS : celles des familles politiques déjà dans palette.ts (COULEURS_GROUPES_SENAT), pour
 * reconnaître un groupe seulement (invariant 7). Aucune teinte nouvelle.
 *
 * PHOTOS : aucune. Celles du Sénat ne sont pas sous licence libre (D27, ADR 0004) ; tant que la collecte
 * Wikimedia ne couvre pas les sénateurs, chaque carte porte des initiales. */
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { siegesHemicycle } from "@repere/core";
import { chargerSenateurs } from "../lib/donnees";
import { COULEURS_GROUPES_SENAT, NEUTRES_PAR_MODE, rapportContraste } from "../lib/palette";
import { CIBLE, couleurs, feuille, OMBRE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { PastilleSource } from "./source";
import { useApparition } from "./mouvement";
import { Animated } from "react-native";

export const SANS_GROUPE = "Non inscrit ou sans groupe publié";

export type Senateur = { id: string; nom: string; prenom: string; groupe: string; civilite?: string; siege?: number; groupeLibelle?: string; commission?: string; fiche?: string };
export type GroupeSenat = { sigle: string; sieges: number; libelle?: string };
export type FichierSenat = { source: { producteur: string; licence: string; url?: string }; genere_le: string; groupes: GroupeSenat[]; senateurs: Senateur[] };

export function couleurGroupeSenat(sigle: string): string {
  return COULEURS_GROUPES_SENAT[sigle] || NEUTRES_PAR_MODE.clair.sourd;
}

export async function lireSenateurs(): Promise<FichierSenat | null> {
  try {
    const r = await chargerSenateurs();
    const d = r.donnees as Partial<FichierSenat> | null;
    if (!d || !d.source || !d.source.producteur || !d.source.licence || !d.genere_le || !Array.isArray(d.senateurs) || !d.senateurs.length) return null;
    return d as FichierSenat;
  } catch {
    return null;
  }
}

const initiales = (s: Senateur) => ((s.prenom || " ")[0] + (s.nom || " ")[0]).toUpperCase();

export function PanneauSenat() {
  const [f, setF] = useState<FichierSenat | null | undefined>(undefined);
  const [choisi, setChoisi] = useState<string | null>(null);
  const [largeur, setLargeur] = useState(0);
  const apparition = useApparition();
  useEffect(() => {
    let vivant = true;
    lireSenateurs().then(x => { if (vivant) setF(x); });
    return () => { vivant = false; };
  }, []);

  const groupes = f ? f.groupes : [];
  const total = groupes.reduce((a, g) => a + g.sieges, 0);
  const arc = useMemo(() => siegesHemicycle(total, 10, 0.35), [total]);
  const liste = useMemo(() => (f ? f.senateurs.filter(s => !choisi || (s.groupe || SANS_GROUPE) === choisi) : []), [f, choisi]);

  if (f === undefined) return <Text style={TYPO.note}>Lecture de la liste des sénateurs…</Text>;
  /* Doctrine du vide : une phrase vraie, et où aller. */
  if (f === null || !total) return (
    <View style={s.carte}>
      <Text style={TYPO.corps}>Repère ne publie pas encore la liste des sénateurs : la dernière collecte n'a rien rapporté de lisible. Elle est reprise chaque matin.</Text>
      <Text style={TYPO.note}>La liste officielle est publiée par le Sénat, sur senat.fr.</Text>
    </View>
  );

  const rayon = largeur / 2;
  const point = Math.max(3, rayon * 0.042);
  const siegeDe = groupes.flatMap(g => Array(g.sieges).fill(g.sigle) as string[]);
  const faible = (fond: string) => rapportContraste(fond, couleurs.carte) < 3;
  const phrase = `${total} sénateurs, par groupe, dans l'ordre alphabétique du sigle : `
    + groupes.map(g => `${g.sigle}, ${g.sieges}`).join(" ; ") + ".";

  return (
    <View style={{ gap: PAS * 4 }}>
      <View style={s.carte}>
        <Text style={TYPO.etiquette} accessibilityRole="header">La composition du Sénat</Text>
        <View onLayout={e => setLargeur(e.nativeEvent.layout.width)} accessible accessibilityLabel={phrase}
          style={{ width: "100%", height: rayon + point }}>
          {largeur ? (
            <Animated.View style={{ width: "100%", height: rayon + point, opacity: apparition }}>
              {arc.map((p: { x: number; y: number }, i: number) => {
                const g = siegeDe[i], fond = couleurGroupeSenat(g), actif = choisi === g;
                return (
                  <View key={i} testID="siege-senat" style={{
                    position: "absolute", width: point, height: point, borderRadius: point / 2, backgroundColor: fond,
                    opacity: choisi && !actif ? 0.2 : 1,
                    borderWidth: faible(fond) ? 1 : 0.75, borderColor: faible(fond) ? couleurs.sourd : couleurs.trait,
                    shadowColor: OMBRE.shadowColor, shadowOpacity: 0.3, shadowRadius: 1.5, shadowOffset: { width: 0, height: 1 },
                    transform: [{ scale: actif ? 1.35 : 1 }], zIndex: actif ? 2 : 1,
                    left: rayon + p.x * (rayon - point / 2) - point / 2, top: rayon - p.y * (rayon - point / 2) - point / 2,
                  }} />
                );
              })}
            </Animated.View>
          ) : null}
        </View>
        <View style={s.legende}>
          {groupes.map(g => (
            <Pressable key={g.sigle} onPress={() => setChoisi(c => (c === g.sigle ? null : g.sigle))} accessibilityRole="button"
              accessibilityState={{ selected: choisi === g.sigle }}
              accessibilityLabel={`${g.libelle || g.sigle}, ${g.sieges} sénateurs. ${choisi === g.sigle ? "Montrer tous les sénateurs" : "Ne montrer que ce groupe"}`}
              style={({ pressed }) => [s.item, { opacity: choisi && choisi !== g.sigle ? 0.4 : pressed ? 0.7 : 1 }]}>
              <View style={[s.pastille, { backgroundColor: couleurGroupeSenat(g.sigle) }]} />
              <Text style={[TYPO.corps, { flexShrink: 1 }, choisi === g.sigle ? { fontFamily: POLICE.titre } : null]} numberOfLines={1}>{g.sigle}</Text>
              <Text style={TYPO.donnee}>{g.sieges}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={TYPO.micro} testID="senat-ordre">
          {total} sénateurs. Disposition indicative, groupes par ordre alphabétique du sigle : ce n'est pas le plan de la salle.
        </Text>
        <PastilleSource source={{ producteur: f.source.producteur, licence: f.source.licence, url: f.source.url, releve: f.genere_le }} />
      </View>

      <Text style={TYPO.etiquette} accessibilityRole="header">
        {choisi ? `Les ${liste.length} sénateurs ${choisi}` : `Les ${liste.length} sénateurs`}
      </Text>
      {liste.map(x => (
        <View key={x.id} style={s.fiche} testID="carte-senateur">
          {/* Pas de photo : celles du Sénat ne sont pas sous licence libre (ADR 0004). Des initiales. */}
          <View style={[s.avatar, { borderColor: couleurGroupeSenat(x.groupe || SANS_GROUPE) }]} accessible={false} importantForAccessibility="no">
            <Text style={s.initiales}>{initiales(x)}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[TYPO.corps, { fontFamily: POLICE.titre }]}>{x.prenom} {x.nom}</Text>
            <Text style={TYPO.note} numberOfLines={2}>
              {[x.groupeLibelle || x.groupe || SANS_GROUPE, x.commission].filter(Boolean).join(" · ")}
            </Text>
          </View>
          {x.fiche ? (
            <Pressable onPress={() => { if (typeof window !== "undefined") window.open(x.fiche, "_blank", "noopener"); }}
              accessibilityRole="link" accessibilityLabel={`Fiche officielle de ${x.prenom} ${x.nom} sur senat.fr (nouvel onglet)`}
              style={({ pressed }) => ({ minHeight: CIBLE, minWidth: CIBLE, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
              <Ionicons name="open-outline" size={18} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
            </Pressable>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 5, gap: PAS * 4 },
  legende: { flexDirection: "row", flexWrap: "wrap", rowGap: PAS, justifyContent: "space-between" },
  item: { flexDirection: "row", alignItems: "center", gap: PAS * 2, minHeight: CIBLE, width: "48%" },
  pastille: { width: 12, height: 12, borderRadius: 6 },
  fiche: { flexDirection: "row", alignItems: "center", gap: PAS * 3, backgroundColor: couleurs.carte, borderRadius: RAYON.bloc, padding: PAS * 3, minHeight: CIBLE + 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: "center", justifyContent: "center", backgroundColor: couleurs.voile },
  initiales: { fontFamily: POLICE.texteGras, fontSize: 15, color: couleurs.encre },
}));
