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
import { espacesFines } from "./donnees";
import { Avatar } from "./avatar";
import { useState, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { feuille, couleurs, PAS, RAYON, TEINTES, TYPO, CIBLE, type Echelon } from "../lib/theme";
import { useCouleurVote } from "../lib/couleur-vote";
import { useApparition, useCompteur } from "./mouvement";
import { pointEchelon } from "../lib/niveaux";

const largeur = (v: Animated.Value, pct: number) =>
  v.interpolate({ inputRange: [0, 1], outputRange: ["0%", `${Math.max(0, Math.min(100, pct))}%`] });

/* ── Un grand nombre qui se revele (le lecteur d'ecran lit la valeur finale) ── */
export function Compteur({ valeur, suffixe }: { valeur: number; suffixe: string }) {
  const n = useCompteur(valeur);
  return (
    <View accessible accessibilityLabel={`${valeur.toLocaleString("fr-FR")} ${suffixe}`}>
      <Text style={TYPO.chiffre}>{espacesFines(n.toLocaleString("fr-FR"))}<Text style={[TYPO.reponse, { color: couleurs.sourd }]}> €</Text></Text>
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
    <View accessible accessibilityLabel={`${libelle} : ${valeur}`} style={{ gap: 8 }}>
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

/* ── « Sur 100 € dépensés » en blocs empilés (V34, bloc 5) ───────────────
   Remplace les barres fondues : chaque part a un bloc plein, son chiffre dedans quand il tient,
   et son libelle a cote. Le reste est dessine, jamais chiffre : la source ne le detaille pas.
   Couleurs : l'echelon de la commune (ville) pour les salaires, dept pour les investissements, gris
   pour le reste. Aucune couleur nouvelle (invariant 7). */
/* V54 — LISTE DE BARRES (inspirée d'AniUI « Bar List », recodée sans dépendance) : une ligne par
   poste, triée du plus grand au plus petit. Libellé à gauche, montant au centre (« sur 100 € »),
   barre à droite. Couleurs de la palette seulement : piste voile, partie active encre (invariant 7).
   Le reste n'est jamais donné comme un poste détaillé : il est écrit « non détaillé par la source ». */
export function RepartitionCent({ salaires, investissement }: { salaires: number | null; investissement: number | null }) {
  const reste = Math.max(0, 100 - (salaires ?? 0) - (investissement ?? 0));
  const lignes = [
    salaires !== null ? { libelle: "Salaires des agents", valeur: salaires } : null,
    investissement !== null ? { libelle: "Investissements", valeur: investissement } : null,
    reste > 0 ? { libelle: "Autres (non détaillés)", valeur: reste } : null,
  ].filter(Boolean) as { libelle: string; valeur: number }[];
  lignes.sort((a, b) => b.valeur - a.valeur);
  const dit = lignes.map(p => `${p.libelle} ${p.valeur} €`).join(", ");
  return (
    <View accessible accessibilityLabel={`Sur 100 € dépensés : ${dit}.`} style={{ gap: PAS * 3 }}>
      {lignes.map(p => (
        <View key={p.libelle} style={s.ligneBarre}>
          <Text style={[TYPO.note, { flex: 1.4 }]}>{p.libelle}</Text>
          <Text style={[TYPO.corps, { fontWeight: "700", minWidth: 52, textAlign: "center" }]}>{`${p.valeur} €`}</Text>
          <View style={s.pisteBarre} importantForAccessibility="no">
            <View style={[s.remplissageBarre, { width: `${Math.max(0, Math.min(100, p.valeur))}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

/* V54 — TENDANCE (inspirée d'AniUI « Stat card avec delta chip »). Un chiffre et sa variation
   par rapport à l'exercice précédent. Calcul de Repère, annoncé comme tel. Couleur neutre
   (encre sur voile) : ni vert ni rouge, la hausse n'est ni bonne ni mauvaise (invariant 7).
   Absente quand l'exercice précédent n'est pas publié, ou quand la variation est nulle. */
export function Tendance({ pct, an1, an2 }: { pct: number | null; an1: string; an2: string }) {
  if (pct === null || pct === 0 || !Number.isFinite(pct)) return null;
  const texte = `${Math.abs(pct).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
  const sens = pct > 0 ? "en hausse" : "en baisse";
  return (
    <View accessible accessibilityLabel={`${sens.charAt(0).toUpperCase()}${sens.slice(1)} de ${texte} par habitant entre ${an1} et ${an2}. Calcul Repère.`}
      style={s.tendance}>
      <Text style={[TYPO.note, { color: couleurs.encre, fontWeight: "700" }]}>{`${pct > 0 ? "↑" : "↓"} ${texte}`}</Text>
      <Text style={TYPO.note}>{`par rapport à ${an1} · calcul Repère`}</Text>
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
  const COULEUR_VOTE = useCouleurVote();
  const phrase = segments.map(x => `${x.libelle} : ${x.nombre}`).join(", ")
    + `, sur ${total} députés ayant pris part au vote.` + (qui && position ? ` ${qui} : ${segments.find(x => x.cle === position)?.libelle.toLowerCase() || "position non portée"}.` : "");
  return (
    <View accessible accessibilityLabel={phrase} style={{ gap: PAS * 3 }}>
      <View style={s.barreVote}>
        {segments.map(x => (
          <Animated.View key={x.cle} style={{ width: largeur(v, x.part * 100), backgroundColor: COULEUR_VOTE[x.cle as keyof typeof COULEUR_VOTE] }} />
        ))}
      </View>
      {compact ? null : <View style={{ gap: PAS * 2 }}>
        {segments.map(x => (
          <View key={x.cle} style={s.legende}>
            <View style={[s.pastilleCouleur, { backgroundColor: COULEUR_VOTE[x.cle as keyof typeof COULEUR_VOTE] }]} />
            <Text style={[TYPO.corps, { flex: 1 }]}>{x.libelle}</Text>
            {position === x.cle && qui ? <Text style={s.marque} numberOfLines={1}>{qui}</Text> : null}
            <Text style={[TYPO.corps, { fontWeight: "600", minWidth: 44, textAlign: "right" }]}>{x.nombre}</Text>
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
        <Text style={TYPO.note}><Text style={{ color: couleurs.lien, fontWeight: "500" }}>État · {partPct} %</Text>  {subventionTexte}</Text>
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
    <View accessible accessibilityLabel={`${libelle} : ${an1}, ${texte1} ; ${an2}, ${texte2}. ${diffTexte}.`} style={{ gap: 8 }}>
      <View style={s.ligneH}>
        <Text style={TYPO.note}>{libelle}</Text>
        <Text style={[TYPO.corps, { fontWeight: "600" }]}>{diffTexte}</Text>
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
/* `surNom` : quand il est donne, le nom de chaque personne ouvre sa fiche. Le nom
   est alors une cible de 48 px, lue comme un lien. */
/* `ouverts` et `basculer` (maquette Stitch, 09/11/2026) : la chaîne devient un accordéon. Chaque
   niveau garde son nom et sa personne visibles ; ce qu'il décide, la note et le pied se déplient. */
export function Chaine({ niveaux, compact, surNom, ouverts, basculer }: {
  niveaux: Niveau[]; compact?: boolean; surNom?: (n: Niveau) => void;
  ouverts?: ReadonlySet<Echelon>; basculer?: (e: Echelon) => void;
}) {
  return (
    <View>
      {niveaux.map((n, i) => {
        const deplie = !ouverts || ouverts.has(n.echelon);
        return (
        <View key={n.echelon} style={s.jalon}
          accessible={compact}
          accessibilityLabel={compact ? `${n.niveau} : ${n.personne ? n.personne.nom + ", " + n.personne.role : n.institution}` : undefined}>
          <View style={s.jalonAxe}>
            {/* Le niveau est ecrit en texte, au-dessus (etiquette) ; le maillon garde son
                contour s'il est sous 3:1 sur la carte (D17, region en sombre). */}
            <View style={[s.maillon, pointEchelon(n.echelon)]} />
            {i < niveaux.length - 1 ? <View style={[s.jalonTrait, { backgroundColor: couleurs.trait }]} /> : null}
          </View>
          {/* Palette B : chaque echelon dans sa teinte — c'est ici que la palette
              « territoriale » dit quelque chose (qui decide, a quel niveau). */}
          <View style={[{ flex: 1, paddingBottom: compact ? PAS * 3 : PAS * 6, gap: 2 },
            !compact ? { backgroundColor: TEINTES[n.echelon], borderRadius: RAYON.bloc, padding: PAS * 3, marginBottom: PAS * 3 } : null]}>
            {/* La couleur d'echelon est portee par le maillon, pas par le texte :
                en 13 px, l'intercommunalite (ancien cyan) faisait 3,21:1 sur le fond
                et le departement 4,38:1 — sous le seuil AA de 4,5:1 (mesure du
                30/09/2026, controle « contraste AA » du parcours). */}
            {ouverts && basculer && !compact ? (
              <Pressable onPress={() => basculer(n.echelon)} accessibilityRole="button" accessibilityState={{ expanded: deplie }}
                accessibilityLabel={`${n.niveau}${n.lieu ? ", " + n.lieu : ""} : ${deplie ? "replier" : "déplier"} ce que ce niveau décide`}
                style={({ pressed }) => ({ minHeight: 44, flexDirection: "row", alignItems: "center", gap: PAS * 2, opacity: pressed ? 0.6 : 1 })}>
                <Text style={[TYPO.etiquette, { flex: 1 }]}>{n.niveau}{n.lieu ? " · " + n.lieu : ""}</Text>
                <Ionicons name={deplie ? "chevron-up" : "chevron-down"} size={18} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
              </Pressable>
            ) : (
              <Text style={TYPO.etiquette}>{n.niveau}{n.lieu && !compact ? " · " + n.lieu : ""}</Text>
            )}
            {n.personne && surNom && !compact ? (
              /* 07/11/2026 : l'avatar (initiales sur la couleur de l'ÉCHELON, jamais d'un parti) à côté du nom. */
              <Pressable onPress={() => surNom(n)} accessibilityRole="link"
                accessibilityLabel={`Voir la fiche de ${n.personne.nom}, ${n.personne.role}`}
                style={({ pressed }) => ({ minHeight: 48, flexDirection: "row", alignItems: "center", gap: PAS * 3, opacity: pressed ? 0.6 : 1 })}>
                <Avatar nom={n.personne.nom} taille={44} fond={(pointEchelon(n.echelon) as { backgroundColor: string }).backgroundColor} />
                <Text style={[TYPO.reponse, { flex: 1, color: couleurs.lien, textDecorationLine: "underline" }]}>{n.personne.nom}</Text>
              </Pressable>
            ) : n.personne ? (
              <Text style={compact ? [TYPO.corps, { fontWeight: "600" }] : TYPO.reponse}>{n.personne.nom}</Text>
            ) : (
              <Text style={compact ? TYPO.corps : TYPO.reponse}>{n.institution}</Text>
            )}
            {!compact && n.personne ? <Text style={TYPO.note}>{n.personne.role}</Text> : null}
            {!compact && deplie && n.decide ? <Text style={TYPO.corps}>Décide : {n.decide}.</Text> : null}
            {!compact && deplie && n.note ? <Text style={TYPO.note}>{n.note}</Text> : null}
            {!compact && deplie && n.pied ? n.pied : null}
          </View>
        </View>
        );
      })}
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
        <Text style={[TYPO.note, { color: couleurs.lien, fontWeight: "500", flex: 1 }]}>{titre.replace(/ ([?!:;])/g, "\u00a0$1")}</Text>
        <Text style={[TYPO.note, { color: couleurs.lien }]} accessibilityElementsHidden importantForAccessibility="no">{ouvert ? "−" : "+"}</Text>
      </Pressable>
      {ouvert ? <View style={{ gap: PAS * 2, paddingBottom: PAS * 2 }}>{children}</View> : null}
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  ligneH: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: PAS * 2, flexWrap: "wrap" },
  piste: { height: 12, borderRadius: 6, backgroundColor: couleurs.voile, overflow: "hidden" },
  rempli: { height: "100%", borderRadius: 6 },
  ligneLegende: { flexDirection: "row", alignItems: "center", gap: PAS * 2 },
  pastille: { width: 12, height: 12, borderRadius: 3 },
  ligneBarre: { flexDirection: "row", alignItems: "center", gap: PAS * 2 },
  pisteBarre: { flex: 1.2, height: 6, borderRadius: 3, backgroundColor: couleurs.voile, overflow: "hidden" },
  remplissageBarre: { height: 6, borderRadius: 3, backgroundColor: couleurs.encre },
  tendance: { alignSelf: "flex-start", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: PAS * 2, backgroundColor: couleurs.voile, borderRadius: RAYON.pastille, paddingHorizontal: PAS * 2, paddingVertical: PAS },
  mois: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  moisCase: { width: 22, height: 22, borderRadius: 6, backgroundColor: couleurs.voile, overflow: "hidden" },
  moisRempli: { height: "100%" },
  barreVote: { flexDirection: "row", height: 22, borderRadius: 8, overflow: "hidden", backgroundColor: couleurs.voile },
  legende: { flexDirection: "row", alignItems: "center", gap: PAS * 2 },
  pastilleCouleur: { width: 14, height: 14, borderRadius: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: couleurs.sourd },
  marque: { fontSize: 13, fontWeight: "500", color: couleurs.blanc, backgroundColor: couleurs.ville, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RAYON.pastille, overflow: "hidden", maxWidth: 170 },
  annee: { flexDirection: "row", alignItems: "center", gap: PAS * 2 },
  jalon: { flexDirection: "row", gap: PAS * 3 },
  jalonAxe: { width: 18, alignItems: "center" },
  jalonPoint: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, backgroundColor: couleurs.sol, marginTop: 4 },
  jalonActif: { width: 18, height: 18, borderRadius: 9, marginTop: 2 },
  jalonTrait: { flex: 1, width: 2, backgroundColor: couleurs.trait, marginTop: 2 },
  maillon: { width: 14, height: 14, borderRadius: 7, marginTop: 4 },
  depli: { minHeight: CIBLE, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
}));
