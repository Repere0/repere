/* LES COMPOSANTS SIGNATURES DES MAQUETTES STITCH (09/11/2026, décision du porteur : « tout Stitch »).
 *
 * EnClair            le cartouche « En clair » : une phrase calculée ou lue, jamais rédigée ici.
 * VoteBarTricolor    la répartition d'un scrutin (pour, contre, abstention), nombres écrits.
 * StatBubbleTile     une variation entre deux exercices, en bulle (calcul annoncé comme tel).
 * JaugeCofinancement la part de l'État dans un projet aidé, et le reste.
 * MicroJauge         la jauge tripartite du budget (salaires, investissements, fonctionnement).
 * Onglets            le contrôle segmenté compact (pastille blanche, point d'accent).
 * BadgeRepere        le badge « ● REPÈRE DU JOUR · EXERCICE … ».
 *
 * Écarts assumés aux maquettes (règles du produit, pas de la direction artistique) :
 * - « En clair (4 sec) » devient « En clair » : la durée de lecture n'est pas mesurée (règle
 *   « mesurer plutôt que supposer ») ;
 * - les couleurs de vote ne portent jamais le texte (2,56 à 2,98:1 sur la carte claire) : le
 *   nombre et le mot sont dans l'encre, la couleur est dans la barre et la pastille ;
 * - les tailles de 11 px de la maquette suivent l'échelle du lecteur (TYPO), jamais figées.
 *
 * Aucune couleur littérale ici : tout vient de theme.ts (ACCENTS, JAUGE, couleurs) et de
 * useCouleurVote (variante daltonienne comprise). */
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ACCENTS, CIBLE, couleurs, feuille, JAUGE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { useCouleurVote } from "../lib/couleur-vote";
import { espacesFines } from "./donnees";

/* ── Le cartouche « En clair » ─────────────────────────────────────────── */
export function EnClair({ texte, enfants }: { texte?: string | null; enfants?: ReactNode }) {
  if (!texte && !enfants) return null;
  return (
    <View style={s.enClair} accessible accessibilityLabel={`En clair : ${texte ?? ""}`}>
      <View style={s.enClairTete}>
        {/* L'éclair dans la couleur du texte d'accent : en émeraude, il tombait à 2,72:1 sur le fond du
            cartouche (mesuré par parcours-web). L'émeraude reste au filet de gauche. */}
        <Ionicons name="flash" size={14} color={ACCENTS.texteAccent} accessible={false} importantForAccessibility="no" />
        <Text style={s.enClairBadge}>EN CLAIR</Text>
      </View>
      {texte ? <Text style={[TYPO.corps, { fontFamily: POLICE.texteMoyen }]}>{texte}</Text> : null}
      {enfants}
    </View>
  );
}

/* ── La répartition d'un scrutin ───────────────────────────────────────── */
const nb = (x: unknown) => { const n = Number(x); return Number.isFinite(n) && n >= 0 ? n : null; };
export function VoteBarTricolor({ pour, contre, abstention, position, qui }: {
  pour: unknown; contre: unknown; abstention: unknown; position?: string | null; qui?: string | null;
}) {
  const C = useCouleurVote();
  const p = nb(pour), c = nb(contre), a = nb(abstention);
  if (p === null || c === null || a === null || p + c + a === 0) return null;
  const total = p + c + a;
  /* Arrondis : la somme des trois pourcentages est ramenée à 100 sur l'abstention, comme la maquette. */
  const pp = Math.round(p / total * 100), pc = Math.round(c / total * 100), pa = 100 - pp - pc;
  const parts = [
    { cle: "p", n: p, pct: pp, mot: "Pour" },
    { cle: "c", n: c, pct: pc, mot: "Contre" },
    { cle: "a", n: a, pct: pa, mot: "Abst." },
  ] as const;
  const mot: Record<string, string> = { p: "Pour", c: "Contre", a: "Abstention" };
  return (
    <View style={{ gap: PAS * 2 }} accessible
      accessibilityLabel={`${p} pour, ${c} contre, ${a} abstentions${position && qui ? `. ${qui} : ${mot[position] ?? ""}` : ""}`}>
      <View style={s.barreVote}>
        {parts.filter(x => x.n > 0).map(x => <View key={x.cle} style={{ flex: x.n, backgroundColor: C[x.cle] }} />)}
      </View>
      <View style={s.ligne}>
        {parts.map(x => (
          <View key={x.cle} style={{ flexDirection: "row", alignItems: "center", gap: PAS }}>
            <View style={[s.point, { backgroundColor: C[x.cle] }]} />
            <Text style={[TYPO.micro, { color: couleurs.encre, fontFamily: POLICE.texteGras }]}>{x.n.toLocaleString("fr-FR")} {x.mot} ({x.pct} %)</Text>
          </View>
        ))}
      </View>
      {position && qui && mot[position] ? (
        <View style={s.badgeDepute}>
          <Text style={[TYPO.micro, { color: ACCENTS.texteAccent, fontFamily: POLICE.texteGras }]}>Position de {qui} : {mot[position]}</Text>
        </View>
      ) : null}
    </View>
  );
}

/* ── Une variation, en bulle ───────────────────────────────────────────── */
export function StatBubbleTile({ libelle, variation }: { libelle: string; variation: string }) {
  return (
    <View style={s.bulle} accessible accessibilityLabel={`${libelle} : ${variation}`}>
      <Text style={[TYPO.micro, { textAlign: "center" }]}>{libelle}</Text>
      <View style={s.bulleBadge}><Text style={[TYPO.corps, { fontFamily: POLICE.donneeForte, color: ACCENTS.texteAccent }]}>{variation}</Text></View>
    </View>
  );
}

/* ── La part de l'État dans un projet aidé ─────────────────────────────── */
export function JaugeCofinancement({ partEtat, montantEtat, montantTotal, lieu }: {
  partEtat: number; montantEtat: string; montantTotal: string; lieu: string;
}) {
  const p = Math.max(0, Math.min(100, Math.round(partEtat)));
  return (
    <View style={{ gap: PAS * 2 }} accessible
      accessibilityLabel={`État : ${p} %, ${montantEtat}. ${lieu} et autres financeurs : ${100 - p} %, sur ${montantTotal}.`}>
      <View style={s.piste}>
        <View style={{ width: `${p}%`, backgroundColor: JAUGE.investissement }} />
        <View style={{ flex: 1, backgroundColor: JAUGE.salaires }} />
      </View>
      <View style={[s.ligne, { justifyContent: "space-between" }]}>
        <Text style={TYPO.micro}><Text style={{ color: couleurs.encre, fontFamily: POLICE.texteGras }}>État · {p} %</Text> ({espacesFines(montantEtat)})</Text>
        <Text style={TYPO.micro}><Text style={{ color: couleurs.encre, fontFamily: POLICE.texteGras }}>Reste · {100 - p} %</Text> (sur {espacesFines(montantTotal)})</Text>
      </View>
    </View>
  );
}

/* ── La jauge tripartite du budget ─────────────────────────────────────── */
export function MicroJauge({ salaires, investissement, autres }: { salaires: number; investissement: number; autres: number }) {
  const parts = [
    { cle: "s", v: salaires, c: JAUGE.salaires, l: "Salaires", i: "people-outline" as const },
    { cle: "i", v: investissement, c: JAUGE.investissement, l: "Investissements", i: "construct-outline" as const },
    { cle: "a", v: autres, c: JAUGE.autres, l: "Fonctionnement", i: "settings-outline" as const },
  ];
  return (
    <View style={{ gap: PAS * 2 }}>
      <View style={s.piste} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {parts.filter(x => x.v > 0).map(x => <View key={x.cle} style={{ flex: x.v, backgroundColor: x.c }} />)}
      </View>
      <View style={[s.ligne, { columnGap: PAS * 3 }]}>
        {parts.map(x => (
          <View key={x.cle} style={{ flexDirection: "row", alignItems: "center", gap: PAS * 1.5 }}>
            <View style={[s.point, { backgroundColor: x.c, borderWidth: 1, borderColor: couleurs.trait }]} />
            <Ionicons name={x.i} size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
            <Text style={TYPO.micro}>{x.l} <Text style={{ color: couleurs.encre, fontFamily: POLICE.texteGras }}>{x.v}{"\u00a0"}%</Text></Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Le contrôle segmenté ──────────────────────────────────────────────── */
export function Onglets<T extends string>({ valeurs, actif, choisir, etiquette }: {
  valeurs: { cle: T; texte: string }[]; actif: T; choisir: (c: T) => void; etiquette: string;
}) {
  return (
    <View style={s.segments} accessibilityRole="tablist" accessibilityLabel={etiquette}>
      {valeurs.map(v => {
        const on = v.cle === actif;
        return (
          <Pressable key={v.cle} onPress={() => choisir(v.cle)} accessibilityRole="tab" accessibilityState={{ selected: on }}
            accessibilityLabel={v.texte}
            style={({ pressed }) => [s.segment, on && s.segmentActif, pressed && { opacity: 0.7 }]}>
            {on ? <View style={[s.point, { backgroundColor: ACCENTS.civique }]} /> : null}
            <Text numberOfLines={2} style={[s.segmentTexte, on && { color: couleurs.encre }]}>{v.texte}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── Le badge « Repère du jour » ───────────────────────────────────────── */
export function BadgeRepere({ texte }: { texte: string }) {
  return (
    <View style={s.badgeRepere}>
      <View style={[s.point, { backgroundColor: ACCENTS.civique }]} />
      <Text style={[TYPO.micro, { color: ACCENTS.texteAccent, fontFamily: POLICE.texteGras, letterSpacing: 0.6 }]}>{texte.toUpperCase()}</Text>
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  enClair: {
    gap: PAS, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: ACCENTS.fondCivique,
    borderLeftWidth: 4, borderLeftColor: ACCENTS.civique,
  },
  enClairTete: { flexDirection: "row", alignItems: "center", gap: PAS * 1.5 },
  enClairBadge: { ...TYPO.micro, fontFamily: POLICE.texteGras, color: ACCENTS.texteAccent, letterSpacing: 0.6 },
  barreVote: { flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: couleurs.voile, gap: 2 },
  ligne: { flexDirection: "row", flexWrap: "wrap", columnGap: PAS * 3, rowGap: PAS },
  point: { width: 10, height: 10, borderRadius: 5 },
  badgeDepute: { alignSelf: "flex-start", backgroundColor: couleurs.voile, paddingHorizontal: PAS * 2, paddingVertical: PAS, borderRadius: 6 },
  bulle: { flex: 1, minWidth: 96, alignItems: "center", gap: PAS, paddingVertical: PAS * 2.5, paddingHorizontal: PAS * 1.5, borderRadius: 16, backgroundColor: couleurs.voile },
  bulleBadge: { paddingHorizontal: PAS * 2, paddingVertical: 3, borderRadius: 10, backgroundColor: couleurs.carte },
  /* Refonte « légère » : une jauge fine. */
  piste: { flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: couleurs.voile, gap: 2 },
  segments: { flexDirection: "row", padding: 4, gap: 4, borderRadius: RAYON.pastille, backgroundColor: couleurs.voile },
  segment: { flex: 1, minHeight: CIBLE - 4, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: PAS, paddingHorizontal: PAS, borderRadius: RAYON.pastille },
  segmentActif: { backgroundColor: couleurs.carte },
  /* Pas de capitales : à 360 px, « PLAFONDS » se coupait au milieu du mot (capture du 09/11/2026). */
  segmentTexte: { ...TYPO.micro, fontFamily: POLICE.texteGras, color: couleurs.sourd, textAlign: "center" },
  badgeRepere: { flexDirection: "row", alignItems: "center", gap: PAS * 1.5, alignSelf: "flex-start" },
}));

/* LA RÉPARTITION DE 100 € (Variante A, 11/11/2026) : une barre épaisse en trois segments et sa légende
   chiffrée. Couleurs de la jauge du budget (invariant 7), jamais politiques ; chaque part est écrite. */
export function BarreBudget({ parts }: { parts: { sal: number; inv: number; aut: number } }) {
  const lignes: [string, number, string][] = [["Salaires", parts.sal, JAUGE.salaires], ["Investissements", parts.inv, JAUGE.investissement], ["Autres", parts.aut, JAUGE.autres]];
  return (
    <View style={{ gap: PAS * 3 }}>
      <View accessible accessibilityLabel={`Sur 100 euros dépensés : ${parts.sal} de salaires, ${parts.inv} d'investissements, ${parts.aut} d'autres dépenses.`}
        style={{ flexDirection: "row", height: 16, borderRadius: 8, overflow: "hidden", gap: 2 }}>
        {lignes.map(([l, n, c]) => <View key={l} style={{ flex: Math.max(n, 1), backgroundColor: c }} />)}
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {lignes.map(([l, n, c]) => (
          <View key={l} style={{ gap: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
              <Text style={[TYPO.reponse, { fontFamily: POLICE.section, fontVariant: ["tabular-nums"] }]}>{n}{"\u00a0"}%</Text>
            </View>
            <Text style={TYPO.note}>{l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
