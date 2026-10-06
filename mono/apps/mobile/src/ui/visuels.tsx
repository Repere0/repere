/* LES PRIMITIVES D'INFOGRAPHIE DE REPERE — refonte du 30/09/2026.
 *
 * Une regle : chaque visuel doit faire comprendre plus vite qu'une phrase, et
 * ne rien dire de plus qu'elle. Donc :
 *   - le denominateur et l'unite sont ecrits a cote du dessin ;
 *   - le lecteur d'ecran recoit la meme information en une phrase
 *     (accessibilityLabel), et les formes dessinees lui sont masquees ;
 *   - aucune couleur ne porte de jugement (invariant 7 : gris et couleurs
 *     d'echelon seulement) ;
 *   - les nombres viennent de @repere/core (visuels.js), jamais d'ici.
 * Construites avec des View : aucune bibliotheque de graphiques. */
import { useState, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { couleurs, GRIS_VOTE, PAS, RAYON, TEINTES, TYPO, CIBLE, type Echelon } from "../lib/theme";
import { useApparition, useCompteur } from "./mouvement";

const largeur = (v: Animated.Value, pct: number) =>
  v.interpolate({ inputRange: [0, 1], outputRange: ["0%", `${Math.max(0, Math.min(100, pct))}%`] });

/* ── Un grand nombre qui se revele (le lecteur d'ecran lit la valeur finale) ── */
export function Compteur({ valeur, suffixe }: { valeur: number; suffixe: string }) {
  const n = useCompteur(valeur);
  return (
    <View accessible accessibilityLabel={`${valeur.toLocaleString("fr-FR")} ${suffixe}`}>
      <Text style={TYPO.chiffre} maxFontSizeMultiplier={1.4}>{n.toLocaleString("fr-FR")}<Text style={[TYPO.reponse, { color: couleurs.sourd }]}> €</Text></Text>
      <Text style={[TYPO.reponse, { color: couleurs.sourd }]}>{suffixe.replace(/^€\s*/, "")}</Text>
    </View>
  );
}

/* ── Une part de 100 (« sur 100 € dépensés, 47 € de salaires ») ─────────── */
export function BarrePart({ part, libelle, valeur, echelon = "ville", delai = 0, sansLibelle }: {
  part: number; libelle: string; valeur: string; echelon?: Echelon; delai?: number;
  /* la phrase au-dessus dit deja la part : la barre seule, le libelle reste pour le lecteur d'ecran */
  sansLibelle?: boolean;
}) {
  const v = useApparition(delai);
  return (
    <View accessible accessibilityLabel={`${libelle} : ${valeur}`} style={{ gap: 6 }}>
      {sansLibelle ? null : <View style={s.ligneH}>
        <Text style={TYPO.note}>{libelle}</Text>
        <Text style={[TYPO.corps, { fontWeight: "700" }]}>{valeur}</Text>
      </View>}
      <View style={s.piste}>
        <Animated.View style={[s.rempli, { width: largeur(v, part), backgroundColor: couleurs[echelon] }]} />
      </View>
    </View>
  );
}

/* ── Des mois de recettes (encours de dette) ───────────────────────────── */
export function Mois({ mois, echelon = "ville" }: { mois: number; echelon?: Echelon }) {
  const n = Math.max(12, Math.ceil(mois));
  const cases = Array.from({ length: n }, (_, i) => Math.max(0, Math.min(1, mois - i)));
  const v = useApparition(120);
  return (
    <View accessible accessibilityLabel={`Environ ${mois.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} mois de recettes, sur une frise de ${n} mois.`}
      style={s.mois}>
      {cases.map((r, i) => (
        <View key={i} style={s.moisCase}>
          <Animated.View style={[s.moisRempli, { width: largeur(v, r * 100), backgroundColor: couleurs[echelon] }]} />
        </View>
      ))}
    </View>
  );
}

/* ── La repartition d'un scrutin ───────────────────────────────────────── */
type Segment = { cle: string; libelle: string; nombre: number; part: number };
export function Repartition({ segments, total, position, qui, compact }: {
  segments: Segment[]; total: number; position?: string; qui?: string;
  /* compact : la barre et une ligne de decompte, pour une reponse de l'accueil */
  compact?: boolean;
}) {
  const v = useApparition(80);
  const phrase = segments.map(x => `${x.libelle} : ${x.nombre}`).join(", ")
    + `, sur ${total} députés ayant pris part au vote.` + (qui && position ? ` ${qui} : ${segments.find(x => x.cle === position)?.libelle.toLowerCase() || "position non portée"}.` : "");
  return (
    <View accessible accessibilityLabel={phrase} style={{ gap: PAS * 3 }}>
      <View style={s.barreVote}>
        {segments.map(x => (
          <Animated.View key={x.cle} style={{ width: largeur(v, x.part * 100), backgroundColor: GRIS_VOTE[x.cle as keyof typeof GRIS_VOTE] }} />
        ))}
      </View>
      {compact ? null : <View style={{ gap: PAS * 2 }}>
        {segments.map(x => (
          <View key={x.cle} style={s.legende}>
            <View style={[s.pastilleCouleur, { backgroundColor: GRIS_VOTE[x.cle as keyof typeof GRIS_VOTE] }]} />
            <Text style={[TYPO.corps, { flex: 1 }]}>{x.libelle}</Text>
            {position === x.cle && qui ? <Text style={s.marque} numberOfLines={2}>{qui}</Text> : null}
            <Text style={[TYPO.corps, { fontWeight: "700", minWidth: 44, textAlign: "right" }]}>{x.nombre}</Text>
          </View>
        ))}
      </View>}
    </View>
  );
}

/* ── Le financement d'un projet : la part de l'Etat dans le cout declare ── */
export function Financement({ subvention, cout, partPct, subventionTexte, resteTexte }: {
  subvention: number; cout: number; partPct: number; subventionTexte: string; resteTexte: string;
}) {
  const v = useApparition(100);
  return (
    <View accessible accessibilityLabel={`L'État finance ${subventionTexte}, soit ${partPct} % du coût annoncé. Reste ${resteTexte}, dont la source ne dit pas qui le paie.`}
      style={{ gap: PAS * 2 }}>
      <View style={[s.piste, { height: 18 }]}>
        <Animated.View style={[s.rempli, { width: largeur(v, (subvention / cout) * 100), backgroundColor: couleurs.ville }]} />
      </View>
      <View style={s.ligneH}>
        <Text style={TYPO.note}><Text style={{ color: couleurs.lien, fontWeight: "700" }}>État · {partPct} %</Text>  {subventionTexte}</Text>
      </View>
      <Text style={TYPO.note}>Reste · {resteTexte}</Text>
    </View>
  );
}

/* ── Deux exercices cote a cote (chaque paire a sa propre echelle) ───────── */
export function DeuxAnnees({ libelle, an1, an2, m1, m2, texte1, texte2, diffTexte }: {
  libelle: string; an1: string; an2: string; m1: number; m2: number; texte1: string; texte2: string; diffTexte: string;
}) {
  const max = Math.max(m1, m2) || 1;
  const v = useApparition(60);
  return (
    <View accessible accessibilityLabel={`${libelle} : ${an1}, ${texte1} ; ${an2}, ${texte2}. ${diffTexte}.`} style={{ gap: 6 }}>
      <View style={s.ligneH}>
        <Text style={TYPO.note}>{libelle}</Text>
        <Text style={[TYPO.corps, { fontWeight: "700" }]}>{diffTexte}</Text>
      </View>
      {[[an1, m1, texte1, couleurs.trait], [an2, m2, texte2, couleurs.ville]].map(([an, m, t, c]) => (
        <View key={an as string} style={s.annee}>
          <Text style={[TYPO.micro, { width: 40 }]}>{an as string}</Text>
          <View style={[s.piste, { flex: 1 }]}>
            <Animated.View style={[s.rempli, { width: largeur(v, ((m as number) / max) * 100), backgroundColor: c as string }]} />
          </View>
          <Text style={[TYPO.micro, { minWidth: 92, textAlign: "right" }]}>{t as string}</Text>
        </View>
      ))}
    </View>
  );
}

/* ── Une frise : le temps, de haut en bas ──────────────────────────────── */
export type Jalon = { cle: string; titre: string; texte?: string; date?: string; actif?: boolean; echelon?: Echelon };
export function Frise({ jalons, etiquette }: { jalons: Jalon[]; etiquette?: string }) {
  return (
    <View accessibilityLabel={etiquette} style={{ gap: 0 }}>
      {jalons.map((j, i) => (
        <View key={j.cle} style={s.jalon}
          accessible accessibilityLabel={`${j.date ? j.date + " : " : ""}${j.titre}${j.actif ? " (ce vote)" : ""}. ${j.texte || ""}`}>
          <View style={s.jalonAxe}>
            <View style={[s.jalonPoint, j.actif && s.jalonActif, { borderColor: couleurs[j.echelon || "france"] },
              j.actif && { backgroundColor: couleurs[j.echelon || "france"] }]} />
            {i < jalons.length - 1 ? <View style={s.jalonTrait} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: PAS * 5, gap: 2 }}>
            {j.date ? <Text style={TYPO.micro}>{j.date}</Text> : null}
            <Text style={[TYPO.corps, { fontWeight: j.actif ? "800" : "600" }]}>{j.titre}</Text>
            {j.texte ? <Text style={TYPO.note}>{j.texte}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/* ── La chaine des echelons, de chez vous a l'Assemblee ────────────────── */
export type Niveau = {
  echelon: Echelon; niveau: string; institution: string; lieu?: string | null;
  personne?: { nom: string; role: string } | null; decide?: string; note?: string; pied?: ReactNode;
};
export function Chaine({ niveaux, compact }: { niveaux: Niveau[]; compact?: boolean }) {
  return (
    <View>
      {niveaux.map((n, i) => (
        <View key={n.echelon} style={s.jalon}
          accessible={compact}
          accessibilityLabel={compact ? `${n.niveau} : ${n.personne ? n.personne.nom + ", " + n.personne.role : n.institution}` : undefined}>
          <View style={s.jalonAxe}>
            <View style={[s.maillon, { backgroundColor: couleurs[n.echelon] }]} />
            {i < niveaux.length - 1 ? <View style={[s.jalonTrait, { backgroundColor: couleurs.trait }]} /> : null}
          </View>
          {/* Palette B : chaque echelon dans sa teinte — c'est ici que la palette
              « territoriale » dit quelque chose (qui decide, a quel niveau). */}
          <View style={[{ flex: 1, paddingBottom: compact ? PAS * 3 : PAS * 6, gap: 2 },
            !compact ? { backgroundColor: TEINTES[n.echelon], borderRadius: RAYON.bloc, padding: PAS * 3, marginBottom: PAS * 3 } : null]}>
            {/* La couleur d'echelon est portee par le maillon, pas par le texte :
                en 13 px, l'intercommunalite (#0891b2) faisait 3,21:1 sur le fond
                et le departement 4,38:1 — sous le seuil AA de 4,5:1 (mesure du
                30/09/2026, controle « contraste AA » du parcours). */}
            <Text style={TYPO.etiquette}>{n.niveau}{n.lieu && !compact ? " · " + n.lieu : ""}</Text>
            {n.personne ? (
              <Text style={compact ? [TYPO.corps, { fontWeight: "700" }] : TYPO.reponse}>{n.personne.nom}</Text>
            ) : (
              <Text style={compact ? TYPO.corps : TYPO.reponse}>{n.institution}</Text>
            )}
            {!compact && n.personne ? <Text style={TYPO.note}>{n.personne.role}</Text> : null}
            {!compact && n.decide ? <Text style={TYPO.corps}>Décide : {n.decide}.</Text> : null}
            {!compact && n.note ? <Text style={TYPO.note}>{n.note}</Text> : null}
            {!compact && n.pied ? n.pied : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/* ── Approfondir : une explication qu'on ouvre ─────────────────────────── */
export function Depli({ titre, children }: { titre: string; children: ReactNode }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <View>
      <Pressable onPress={() => setOuvert(o => !o)} accessibilityRole="button"
        accessibilityState={{ expanded: ouvert }} style={({ pressed }) => [s.depli, pressed && { opacity: 0.6 }]}>
        <Text style={[TYPO.note, { color: couleurs.lien, fontWeight: "600", flex: 1 }]}>{titre.replace(/ ([?!:;])/g, "\u00a0$1")}</Text>
        <Text style={[TYPO.note, { color: couleurs.lien }]} accessibilityElementsHidden importantForAccessibility="no">{ouvert ? "−" : "+"}</Text>
      </Pressable>
      {ouvert ? <View style={{ gap: PAS * 2, paddingBottom: PAS * 2 }}>{children}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  ligneH: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: PAS * 2, flexWrap: "wrap" },
  piste: { height: 12, borderRadius: 6, backgroundColor: couleurs.voile, overflow: "hidden" },
  rempli: { height: "100%", borderRadius: 6 },
  mois: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  moisCase: { width: 22, height: 22, borderRadius: 6, backgroundColor: couleurs.voile, overflow: "hidden" },
  moisRempli: { height: "100%" },
  barreVote: { flexDirection: "row", height: 22, borderRadius: 8, overflow: "hidden", backgroundColor: couleurs.voile },
  legende: { flexDirection: "row", alignItems: "center", gap: PAS * 2 },
  pastilleCouleur: { width: 14, height: 14, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: couleurs.sourd },
  /* deux lignes : a 200 % de texte, un nom sur une seule ligne etait coupe
     (« Sylvain Berrios » : 196 px pour 161, mesure du 06/10/2026) */
  marque: { fontSize: 13, fontWeight: "700", color: couleurs.blanc, backgroundColor: couleurs.ville, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RAYON.pastille, overflow: "hidden", maxWidth: 170 },
  annee: { flexDirection: "row", alignItems: "center", gap: PAS * 2 },
  jalon: { flexDirection: "row", gap: PAS * 3 },
  jalonAxe: { width: 18, alignItems: "center" },
  jalonPoint: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: couleurs.sol, marginTop: 4 },
  jalonActif: { width: 18, height: 18, borderRadius: 9, marginTop: 2 },
  jalonTrait: { flex: 1, width: 2, backgroundColor: couleurs.trait, marginTop: 2 },
  maillon: { width: 14, height: 14, borderRadius: 7, marginTop: 3 },
  depli: { minHeight: CIBLE, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
