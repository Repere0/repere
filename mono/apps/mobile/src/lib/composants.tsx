/* LES BRIQUES D'ECRAN DE L'APPLICATION MOBILE — 29/09/2026.
 *
 * Meme role et memes phrases que packages/ui/src/composants.jsx (Source, Vide,
 * Chargement), reecrits en composants React Native : le DOM n'existe pas sur
 * un telephone. La logique (dates, montants, lecture d'un scrutin) n'est PAS
 * reecrite : elle vient de @repere/core. */
import type { ReactNode } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ligneSource, CALCUL_REPERE } from "@repere/core";
import { couleurs, CIBLE, PAS, RAYON, OMBRE, TYPO, type Echelon } from "./theme";

/* Refonte du 30/09/2026 : plus de filet de couleur a gauche ; l'echelon se
   dit par un point de couleur devant l'etiquette, et la carte prend de l'air. */
export function Carte({ echelon, children, titre }: { echelon?: Echelon; children: ReactNode; titre?: string }) {
  return (
    <View style={[s.carte, { backgroundColor: couleurs.carte }]}>
      {titre ? (
        <View style={s.carteTete}>
          {echelon ? <View style={[s.point, { backgroundColor: couleurs[echelon] }]} /> : null}
          <Text style={s.carteTitre} accessibilityRole="header">{titre}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

/* Une phrase de @repere/core (phrases.js) : texte, gras, mot du dictionnaire.
   Le dictionnaire n'existe pas encore sur mobile : le mot s'affiche en texte. */
export type Segment = { t: string; fort?: boolean; mot?: string };
export function Segments({ s: seg }: { s: Segment[] }) {
  return <>{seg.map((x, i) => (x.fort ? <Text key={i} style={s.fort}>{x.t}</Text> : <Text key={i}>{x.t}</Text>))}</>;
}

export function Texte({ children, fort, sourd }: { children: ReactNode; fort?: boolean; sourd?: boolean }) {
  return <Text style={[s.texte, fort && s.fort, sourd && s.sourd]}>{children}</Text>;
}

/* Un lien qui sort de l'application. Le lecteur doit le savoir avant de
   toucher : le libelle d'accessibilite le dit, la fleche aussi. */
/* `etiquette` : ce que lit VoiceOver / TalkBack quand le texte visible est le
   meme d'une carte a l'autre (« Voir a la source » trois fois ne dit pas
   laquelle). Audit de #45, 29/09/2026. */
export function LienSortant({ url, texte, etiquette }: { url: string; texte: string; etiquette?: string }) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      accessibilityRole="link"
      accessibilityLabel={(etiquette || texte) + ", ouvre un site externe"}
      style={({ pressed }) => [s.lien, pressed && { opacity: 0.6 }]}
      hitSlop={8}
    >
      <Text style={s.lienTexte}>{texte} ↗</Text>
    </Pressable>
  );
}

/* Doctrine du vide (invariant 5) : une absence produit une phrase, jamais une
   forme vide. `accessibilityLiveRegion` fait lire la phrase par TalkBack quand
   elle apparait ; VoiceOver la lit au passage du focus. */
export function Vide({ titre, corps, lien, action, onAction }: {
  titre: string; corps?: string; lien?: { texte: string; url: string }; action?: string; onAction?: () => void;
}) {
  return (
    <View style={s.vide} accessibilityRole="summary" accessibilityLiveRegion="polite">
      <Text style={[s.texte, s.fort]}>{titre}</Text>
      {corps ? <Text style={s.texte}>{corps}</Text> : null}
      {lien ? <LienSortant url={lien.url} texte={lien.texte} /> : null}
      {action && onAction ? <Bouton texte={action} onPress={onAction} /> : null}
    </View>
  );
}

export function Bouton({ texte, onPress, discret }: { texte: string; onPress: () => void; discret?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [s.bouton, discret && s.boutonDiscret, pressed && { opacity: 0.7 }]}
    >
      <Text style={[s.boutonTexte, discret && { color: couleurs.encre }]}>{texte}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  carte: { backgroundColor: couleurs.carte, borderRadius: RAYON.carte, padding: PAS * 5, gap: PAS * 3, ...OMBRE },
  carteTete: { flexDirection: "row", alignItems: "center", gap: PAS * 2 },
  point: { width: 10, height: 10, borderRadius: 5 },
  carteTitre: { ...TYPO.etiquette, flex: 1 },
  action: {
    minHeight: CIBLE, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: couleurs.trait, marginTop: PAS,
  },
  actionTexte: { fontSize: 17, fontWeight: "600", color: couleurs.lien },
  texte: { fontSize: 17, lineHeight: 24, color: couleurs.encre },
  fort: { fontWeight: "700" },
  sourd: { color: couleurs.sourd, fontSize: 15, lineHeight: 21 },
  source: { gap: PAS, paddingTop: PAS * 2, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: couleurs.trait },
  sourceTexte: { fontSize: 13, lineHeight: 18, color: couleurs.sourd },
  lien: { minHeight: CIBLE, justifyContent: "center" },
  /* En encre, souligne : la couleur de ville sur le gris d'une phrase d'absence
     faisait 4,38:1 (mesure du 30/09/2026), sous le seuil AA. */
  lienTexte: { fontSize: 15, color: couleurs.encre, textDecorationLine: "underline" },
  vide: { gap: PAS * 2, padding: PAS * 4, backgroundColor: couleurs.voile, borderRadius: RAYON.bloc },
  bouton: {
    minHeight: CIBLE + 4, borderRadius: RAYON.bloc, paddingHorizontal: PAS * 4, alignItems: "center", justifyContent: "center",
    backgroundColor: couleurs.ville,
  },
  boutonDiscret: { backgroundColor: couleurs.voile },
  boutonTexte: { color: couleurs.blanc, fontSize: 17, fontWeight: "700" },
});
