/* LES BRIQUES D'ECRAN DE L'APPLICATION MOBILE — 29/09/2026.
 *
 * Meme role et memes phrases que packages/ui/src/composants.jsx (Source, Vide,
 * Chargement), reecrits en composants React Native : le DOM n'existe pas sur
 * un telephone. La logique (dates, montants, lecture d'un scrutin) n'est PAS
 * reecrite : elle vient de @repere/core. */
import type { ReactNode } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ligneSource, CALCUL_REPERE } from "@repere/core";
import { couleurs, CIBLE, PAS } from "./theme";

export function Carte({ echelon, children, titre }: { echelon?: keyof typeof couleurs; children: ReactNode; titre?: string }) {
  return (
    <View style={[s.carte, echelon ? { borderLeftColor: couleurs[echelon], borderLeftWidth: 4 } : null]}>
      {titre ? <Text style={s.carteTitre} accessibilityRole="header">{titre}</Text> : null}
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

type SourceProps = { producteur?: string; licence?: string; maj?: string; mention?: string; url?: string; calcul?: boolean };
export function Source({ producteur, licence, maj, mention, url, calcul }: SourceProps) {
  /* La ligne est celle du site, ecrite dans @repere/core (ligneSource). */
  const ligne = ligneSource({ producteur, licence, maj, mention });
  return (
    <View style={s.source}>
      {calcul ? <Text style={[s.sourceTexte, s.fort]}>{CALCUL_REPERE}</Text> : null}
      <Text style={s.sourceTexte}>Source : {ligne}</Text>
      {url ? <LienSortant url={url} texte="Voir à la source" etiquette={producteur ? "Voir à la source : " + producteur : undefined} /> : null}
    </View>
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
  carte: {
    backgroundColor: couleurs.carte, borderRadius: 10, padding: PAS * 4, gap: PAS * 2,
    borderWidth: StyleSheet.hairlineWidth, borderColor: couleurs.trait,
  },
  carteTitre: { fontSize: 13, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase", color: couleurs.sourd },
  texte: { fontSize: 17, lineHeight: 24, color: couleurs.encre },
  fort: { fontWeight: "700" },
  sourd: { color: couleurs.sourd, fontSize: 15, lineHeight: 21 },
  source: { gap: PAS, paddingTop: PAS * 2, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: couleurs.trait },
  sourceTexte: { fontSize: 13, lineHeight: 18, color: couleurs.sourd },
  lien: { minHeight: CIBLE, justifyContent: "center" },
  lienTexte: { fontSize: 15, color: couleurs.ville, textDecorationLine: "underline" },
  vide: { gap: PAS * 2, padding: PAS * 4, backgroundColor: couleurs.voile, borderRadius: 10 },
  bouton: {
    minHeight: CIBLE, borderRadius: 10, paddingHorizontal: PAS * 4, alignItems: "center", justifyContent: "center",
    backgroundColor: couleurs.ville,
  },
  boutonDiscret: { backgroundColor: couleurs.voile },
  boutonTexte: { color: "#ffffff", fontSize: 17, fontWeight: "600" },
});
