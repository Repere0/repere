/* LES COMPOSANTS SIGNATURES — design system 2026, d'apres les maquettes du
 * porteur (20/10/2026).
 *
 * EN CLAIR : un cartouche qui reformule en une phrase ce que la carte vient de
 * dire en chiffres. Il ne remplace jamais la source : il la double.
 *
 * JAUGE DE COFINANCEMENT : qui paie quoi, en une barre et deux legendes.
 *
 * JAUGE D'UN SCRUTIN : les trois positions d'un vote. Chaque position porte son
 * LIBELLE EN TOUTES LETTRES a cote de sa couleur (invariant 7) : la couleur ne
 * porte jamais seule le sens, ni pour un daltonien, ni pour un lecteur d'ecran.
 */
import { Text, View } from "react-native";
import { couleurs, feuille, PAS, RAYON, TYPO } from "../lib/theme";
import { StyleSheet } from "react-native";

/* ── « En clair » ─────────────────────────────────────────────────────── */

export function EnClair({ texte, titre = "En clair" }: { texte: string; titre?: string }) {
  return (
    <View style={s.enClair} accessible accessibilityLabel={`${titre} : ${texte}`}>
      <View style={s.enClairTete}>
        <View style={s.enClairPastille} importantForAccessibility="no" accessibilityElementsHidden />
        <Text style={s.enClairTitre}>{titre}</Text>
      </View>
      <Text style={s.enClairCorps}>{texte}</Text>
    </View>
  );
}

/* ── Jauge de cofinancement ───────────────────────────────────────────── */

export function JaugeCofinancement({ part, nomA, nomB, montantA, montantB }: {
  part: number; nomA: string; nomB: string; montantA: string; montantB: string;
}) {
  const reste = Math.max(0, 100 - part);
  return (
    <View style={{ gap: PAS * 2 }} accessible
      accessibilityLabel={`${nomA} : ${part} %, ${montantA}. ${nomB} : ${reste} %, ${montantB}.`}>
      <View style={s.piste} importantForAccessibility="no" accessibilityElementsHidden>
        <View style={{ flex: part, backgroundColor: couleurs.accent }} />
        <View style={{ flex: reste, backgroundColor: couleurs.trait }} />
      </View>
      <View style={s.legendes}>
        {[[nomA, part, montantA, couleurs.accent], [nomB, reste, montantB, couleurs.trait]].map(([n, p, mt, c], i) => (
          <View key={i} style={s.legende}>
            <View style={[s.point, { backgroundColor: c as string }]} />
            <Text style={s.legendeTexte} numberOfLines={2}>
              <Text style={s.legendeFort}>{n as string} · {p as number} %</Text>{"\n"}{mt as string}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Jauge d'un scrutin ───────────────────────────────────────────────── */

export function JaugeScrutin({ pour, contre, abstentions }: { pour: number; contre: number; abstentions: number }) {
  const total = pour + contre + abstentions || 1;
  const pct = (n: number) => Math.round((n / total) * 100);
  const lignes: [string, number, string][] = [
    ["Pour", pour, couleurs.accent],
    ["Contre", contre, couleurs.corail],
    ["Abstention", abstentions, couleurs.abstention],
  ];
  return (
    <View style={{ gap: PAS * 2 }} accessible
      accessibilityLabel={lignes.map(([n, v]) => `${v} ${n.toLowerCase()}`).join(", ") + "."}>
      <View style={s.piste} importantForAccessibility="no" accessibilityElementsHidden>
        {lignes.map(([n, v, c]) => v > 0 ? <View key={n} style={{ flex: v, backgroundColor: c }} /> : null)}
      </View>
      {/* LE LIBELLE EN TOUTES LETTRES A COTE DE LA COULEUR (invariant 7). */}
      <View style={s.legendes}>
        {lignes.map(([n, v, c]) => (
          <View key={n} style={s.legende}>
            <View style={[s.point, { backgroundColor: c }]} />
            <Text style={s.legendeTexte}>
              <Text style={s.legendeFort}>{v}</Text> {n.toLowerCase()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ── Etiquette ────────────────────────────────────────────────────────── */

/* Une etiquette de rubrique : « Scrutin public solennel », « Financement
   public », « Budget municipal 2026 ». Teinte au choix de l'appelant ; par
   defaut le voile du teal. */
export function Etiq({ texte, fond, texteCouleur, emoji }: {
  texte: string; fond?: string; texteCouleur?: string; emoji?: string;
}) {
  return (
    <View style={[s.etiq, fond ? { backgroundColor: fond } : null]}>
      {emoji ? <Text style={s.etiqEmoji}>{emoji}</Text> : null}
      <Text style={[s.etiqTexte, texteCouleur ? { color: texteCouleur } : null]} numberOfLines={1}>{texte}</Text>
    </View>
  );
}

/* Un chiffre choc : le nombre en grand, son unite a cote, sa legende dessous. */
export function ChiffreChoc({ valeur, unite, legende }: { valeur: string; unite?: string; legende?: string }) {
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
        <Text style={s.choc}>{valeur}</Text>
        {unite ? <Text style={s.chocUnite}> {unite}</Text> : null}
      </View>
      {legende ? <Text style={TYPO.note}>{legende}</Text> : null}
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  enClair: {
    backgroundColor: couleurs.accentVoile, borderRadius: RAYON.bloc,
    padding: PAS * 3, gap: PAS, borderLeftWidth: 4, borderLeftColor: couleurs.accent,
  },
  enClairTete: { flexDirection: "row", alignItems: "center", gap: PAS * 1.5 },
  enClairPastille: { width: 8, height: 8, borderRadius: 4, backgroundColor: couleurs.accent },
  enClairTitre: { fontSize: 12, fontWeight: "800", color: couleurs.accentTexte, letterSpacing: 0.6, textTransform: "uppercase" },
  enClairCorps: { fontSize: 14, lineHeight: 20, color: couleurs.encre, fontWeight: "500" },

  piste: { flexDirection: "row", height: 10, borderRadius: 5, overflow: "hidden", backgroundColor: couleurs.trait },
  legendes: { flexDirection: "row", flexWrap: "wrap", gap: PAS * 3 },
  legende: { flexDirection: "row", alignItems: "flex-start", gap: PAS * 1.5, flexShrink: 1 },
  point: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  legendeTexte: { fontSize: 12, lineHeight: 17, color: couleurs.sourd, flexShrink: 1 },
  legendeFort: { fontWeight: "700", color: couleurs.encre },

  etiq: {
    flexDirection: "row", alignItems: "center", gap: PAS,
    backgroundColor: couleurs.primaireVoile, borderRadius: RAYON.pastille,
    paddingHorizontal: PAS * 2.5, paddingVertical: PAS, alignSelf: "flex-start", maxWidth: "100%",
  },
  etiqEmoji: { fontSize: 12 },
  etiqTexte: { fontSize: 11, fontWeight: "800", color: couleurs.primaire, letterSpacing: 0.5, textTransform: "uppercase", flexShrink: 1 },

  groupe: {
    flexDirection: "row", alignItems: "center", gap: PAS * 1.5,
    borderWidth: 1.5, borderColor: couleurs.trait, borderRadius: RAYON.pastille,
    paddingHorizontal: PAS * 2, paddingVertical: PAS * 0.75, alignSelf: "flex-start",
  },
  groupePoint: { width: 8, height: 8, borderRadius: 4 },
  groupeTexte: { fontSize: 12, fontWeight: "800", color: couleurs.encre, letterSpacing: 0.3 },

  choc: { fontFamily: "BricolageGrotesque_800ExtraBold", fontSize: 40, lineHeight: 46, color: couleurs.encre, letterSpacing: -1 },
  chocUnite: { fontFamily: "BricolageGrotesque_600SemiBold", fontSize: 20, lineHeight: 26, color: couleurs.sourd },
}));

/* ── L'etiquette d'un groupe parlementaire ────────────────────────────── */

/* LA COULEUR VIENT DE L'ASSEMBLEE, JAMAIS DE REPERE (invariant 7, exception b).
   `couleur` est celle que la source publie pour ce groupe (organe.couleurAssociee),
   deja filtree par couleurDeGroupeAdmise. Sans couleur publiee : l'etiquette reste
   neutre et porte seulement le sigle — jamais une couleur devinee a partir d'un
   bord politique. Le sigle et le nom sont toujours ecrits : la couleur ne porte
   jamais seule l'information. */
export function EtiquetteGroupe({ sigle, nom, couleur }: { sigle: string; nom?: string; couleur?: string | null }) {
  const teinte = couleur || null;
  return (
    <View style={[s.groupe, teinte ? { borderColor: teinte } : null]}
      accessible accessibilityLabel={nom ? `Groupe ${nom}` : `Groupe ${sigle}`}>
      <View style={[s.groupePoint, { backgroundColor: teinte || couleurs.sourd }]}
        importantForAccessibility="no" accessibilityElementsHidden />
      <Text style={s.groupeTexte} numberOfLines={1}>{sigle}</Text>
    </View>
  );
}
