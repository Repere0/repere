/* ACCUEIL, DEUX VARIANTES À JUGER SUR IMAGE (porteur, 11/11/2026) — PROTOTYPE, pas l'écran livré.
 * Ouvert par /chez-vous?v=a ou ?v=b. Mêmes faits que l'écran actuel, lus au même endroit ; aucune
 * donnée nouvelle. Décisions du 11/11 : échelle 34 / 28 / 22 / 17 / 15 / 13, chiffres héros en
 * Manrope à chiffres alignés, grille de 8 px, trois teintes de surface sans bordure.
 * shortcut: styles écrits ici et non dans theme.ts ; à y verser quand une variante est retenue. */
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ACCENTS, couleurs, JAUGE } from "../lib/theme";
import { Avatar } from "./avatar";
import { DataBadge } from "./donnees";

const G = 8;
const F = { xb: "Manrope_800ExtraBold", b: "Manrope_700Bold", sb: "Manrope_600SemiBold", t: "DMSans_400Regular", tm: "DMSans_500Medium" };
const T = {
  titre: { fontFamily: F.xb, fontSize: 34, lineHeight: 40, letterSpacing: -0.8, color: couleurs.encre },
  section: { fontFamily: F.b, fontSize: 22, lineHeight: 28, letterSpacing: -0.3, color: couleurs.encre },
  ligne: { fontFamily: F.sb, fontSize: 17, lineHeight: 22, color: couleurs.encre },
  corps: { fontFamily: F.t, fontSize: 15, lineHeight: 22, color: couleurs.encre },
  note: { fontFamily: F.t, fontSize: 13, lineHeight: 18, color: couleurs.sourd },
  sur: { fontFamily: F.tm, fontSize: 13, lineHeight: 16, letterSpacing: 0.9, textTransform: "uppercase" as const, color: couleurs.sourd },
};
const chiffres = { fontVariant: ["tabular-nums" as const] };

export type FaitsAccueil = {
  nom: string; territoire: string; publieLe: string;
  an: string | null; depenses: number | null; parts: { sal: number; inv: number; aut: number } | null;
  vote: { qui: string; circo: string; mot: string | null; couleur: string | null; titre: string; date: string; pour: number; contre: number; abst: number; couleurs: { p: string; c: string; a: string } } | null;
  maire: string | null; projets: number; aide: string | null; repere: string | null; jours: number | null;
};

function Rond({ icone, etiquette, onPress }: { icone: keyof typeof Ionicons.glyphMap; etiquette: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiquette}
      style={({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, backgroundColor: couleurs.voile, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
      <Ionicons name={icone} size={20} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
    </Pressable>
  );
}

function Tete({ sur, titre, sous }: { sur: string; titre: string; sous: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: G * 2 }}>
      <View style={{ flex: 1, gap: G / 2 }}>
        <Text style={T.sur}>{sur}</Text>
        <Text style={T.titre} accessibilityRole="header">{titre}</Text>
        <Text style={T.note}>{sous}</Text>
      </View>
      <Rond icone="swap-horizontal" etiquette="Changer de commune" onPress={() => router.dismissTo("/")} />
    </View>
  );
}

function BarreBudget({ p, epais }: { p: { sal: number; inv: number; aut: number }; epais: number }) {
  return (
    <View accessible accessibilityLabel={`Sur 100 euros : ${p.sal} de salaires, ${p.inv} d'investissement, ${p.aut} d'autres dépenses.`}
      style={{ flexDirection: "row", height: epais, borderRadius: epais / 2, overflow: "hidden", gap: 2 }}>
      <View style={{ flex: p.sal, backgroundColor: JAUGE.salaires }} />
      <View style={{ flex: p.inv, backgroundColor: JAUGE.investissement }} />
      <View style={{ flex: p.aut, backgroundColor: JAUGE.autres }} />
    </View>
  );
}

function BarreVote({ v, epais }: { v: NonNullable<FaitsAccueil["vote"]>; epais: number }) {
  return (
    <View accessible accessibilityLabel={`${v.pour} pour, ${v.contre} contre, ${v.abst} abstentions.`}
      style={{ flexDirection: "row", height: epais, borderRadius: epais / 2, overflow: "hidden", gap: 2, backgroundColor: couleurs.voile }}>
      {v.pour ? <View style={{ flex: v.pour, backgroundColor: v.couleurs.p }} /> : null}
      {v.contre ? <View style={{ flex: v.contre, backgroundColor: v.couleurs.c }} /> : null}
      {v.abst ? <View style={{ flex: v.abst, backgroundColor: v.couleurs.a }} /> : null}
    </View>
  );
}

const euros = (n: number) => n.toLocaleString("fr-FR").replace(/ | /g, " ");

/* ───────── VARIANTE A — LE CHIFFRE D'ABORD : une réponse héros, un bouton, deux aperçus. ───────── */
function VarianteA({ f }: { f: FaitsAccueil }) {
  return (
    <>
      <Tete sur={f.territoire} titre={f.nom} sous={`Données publiées le ${f.publieLe}`} />
      {f.depenses !== null && f.an ? (
        <View style={{ backgroundColor: couleurs.carte, borderRadius: 28, padding: G * 3, gap: G * 2 }}>
          <Text style={T.sur}>Dépenses {f.an} · par habitant</Text>
          <Text style={[{ fontFamily: F.xb, fontSize: 64, lineHeight: 68, letterSpacing: -2, color: couleurs.encre }, chiffres]}>{euros(f.depenses)}<Text style={{ fontSize: 34, color: couleurs.sourd }}> €</Text></Text>
          {f.parts ? (
            <>
              <BarreBudget p={f.parts} epais={16} />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                {([["Salaires", f.parts.sal, JAUGE.salaires], ["Investissements", f.parts.inv, JAUGE.investissement], ["Autres", f.parts.aut, JAUGE.autres]] as [string, number, string][]).map(([l, n, c]) => (
                  <View key={l} style={{ gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c }} />
                      <Text style={[{ fontFamily: F.b, fontSize: 17, color: couleurs.encre }, chiffres]}>{n} %</Text>
                    </View>
                    <Text style={T.note}>{l}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
          <View style={{ flexDirection: "row", gap: G * 1.5, marginTop: G }}>
            <Pressable onPress={() => router.push("/finances")} accessibilityRole="button"
              style={({ pressed }) => ({ flex: 1, height: 52, borderRadius: 26, backgroundColor: ACCENTS.autorite, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.8 : 1 })}>
              <Text style={{ fontFamily: F.b, fontSize: 17, color: ACCENTS.surAutorite }}>Où va cet argent ?</Text>
            </Pressable>
            <Rond icone="share-outline" etiquette="Partager" onPress={() => router.push("/finances")} />
            <Rond icone="information-circle-outline" etiquette="D'où vient cette information" onPress={() => router.push("/sources")} />
          </View>
        </View>
      ) : null}
      {f.vote ? (
        <View style={{ gap: G * 1.5 }}>
          <Text style={T.section}>Votre député</Text>
          <Pressable onPress={() => router.push("/vote")} accessibilityRole="button" accessibilityLabel={`${f.vote.qui} a voté ${f.vote.mot ?? ""}. Comprendre ce vote.`}
            style={({ pressed }) => ({ backgroundColor: couleurs.carte, borderRadius: 24, padding: G * 2.5, gap: G * 1.5, opacity: pressed ? 0.8 : 1 })}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: G * 1.5 }}>
              <Avatar nom={f.vote.qui} taille={44} echelon="france" />
              <View style={{ flex: 1 }}>
                <Text style={T.ligne}>{f.vote.qui}</Text>
                <Text style={T.note}>{f.vote.circo} · {f.vote.date}</Text>
              </View>
              {f.vote.mot && f.vote.couleur ? <DataBadge texte={f.vote.mot} couleur={f.vote.couleur} /> : null}
            </View>
            <Text style={T.corps} numberOfLines={2}>{f.vote.titre}</Text>
            <BarreVote v={f.vote} epais={10} />
            <Text style={[T.note, chiffres]}>{f.vote.pour} pour · {f.vote.contre} contre · {f.vote.abst} abstentions</Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

/* ───────── VARIANTE B — LA LISTE D'ABORD : une phrase du jour, puis une liste groupée. ───────── */
function Ligne({ icone, titre, sous, droite, onPress, dernier }: { icone: keyof typeof Ionicons.glyphMap; titre: string; sous: string; droite?: ReactNode; onPress: () => void; dernier?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: G * 1.5, paddingLeft: G * 2, minHeight: 72, backgroundColor: pressed ? couleurs.voile : "transparent" })}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: couleurs.voile, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icone} size={20} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
      </View>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: G, minHeight: 72, paddingRight: G * 2, borderBottomWidth: dernier ? 0 : 0.5, borderBottomColor: couleurs.voile }}>
        <View style={{ flex: 1, paddingVertical: G * 1.5 }}>
          <Text style={T.ligne} numberOfLines={1}>{titre}</Text>
          <Text style={T.note} numberOfLines={1}>{sous}</Text>
        </View>
        {droite ? <View style={{ alignSelf: "center" }}>{droite}</View> : null}
        <Ionicons name="chevron-forward" size={16} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
      </View>
    </Pressable>
  );
}
const valeur = (t: string) => <Text style={[{ fontFamily: F.b, fontSize: 17, color: couleurs.encre }, chiffres]}>{t}</Text>;

function VarianteB({ f }: { f: FaitsAccueil }) {
  return (
    <>
      <Tete sur={`${f.nom} · ${f.territoire.split(" · ")[0]}`} titre="Aujourd'hui" sous={`Données publiées le ${f.publieLe}`} />
      {f.repere ? (
        <Pressable onPress={() => router.push("/repere-du-jour")} accessibilityRole="button"
          style={({ pressed }) => ({ backgroundColor: couleurs.voile, borderRadius: 28, padding: G * 3, gap: G * 2, opacity: pressed ? 0.8 : 1 })}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: G }}>
            <Ionicons name="flash" size={14} color={couleurs.sourd} accessible={false} importantForAccessibility="no" />
            <Text style={T.sur}>Le repère du jour</Text>
          </View>
          <Text style={{ fontFamily: F.b, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: couleurs.encre }}>{f.repere}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={T.note}>Les 3 faits du jour</Text>
            <Ionicons name="arrow-forward" size={18} color={couleurs.encre} accessible={false} importantForAccessibility="no" />
          </View>
        </Pressable>
      ) : null}
      <View style={{ gap: G * 1.5 }}>
        <Text style={T.section}>Chez vous</Text>
        <View style={{ backgroundColor: couleurs.carte, borderRadius: 24, overflow: "hidden" }}>
          {f.depenses !== null && f.an ? <Ligne icone="wallet-outline" titre="Dépenses" sous={`${f.an} · par habitant`} droite={valeur(`${euros(f.depenses)} €`)} onPress={() => router.push("/finances")} /> : null}
          {f.vote ? <Ligne icone="checkbox-outline" titre={f.vote.qui} sous={f.vote.titre}
            droite={f.vote.mot && f.vote.couleur ? <DataBadge texte={f.vote.mot} couleur={f.vote.couleur} /> : undefined} onPress={() => router.push("/vote")} /> : null}
          {f.projets > 0 ? <Ligne icone="construct-outline" titre="Projets aidés par l'État" sous={f.aide ? `Dernier : ${f.aide} d'aide` : "Dotations publiées"} droite={valeur(String(f.projets))} onPress={() => router.push("/finances")} /> : null}
          {f.maire ? <Ligne icone="people-outline" titre="Qui décide" sous={`Maire : ${f.maire}`} onPress={() => router.push("/qui-decide")} dernier /> : null}
        </View>
      </View>
      {f.jours !== null ? (
        <View style={{ gap: G * 1.5 }}>
          <Text style={T.section}>À venir</Text>
          <View style={{ backgroundColor: couleurs.carte, borderRadius: 24, overflow: "hidden" }}>
            <Ligne icone="flag-outline" titre="Présidentielle 2027" sous="Premier tour le 18 avril 2027" droite={valeur(`${f.jours} j`)} onPress={() => router.push("/presidentielle-2027")} dernier />
          </View>
        </View>
      ) : null}
    </>
  );
}

export function AccueilVariante({ v, faits }: { v: "a" | "b"; faits: FaitsAccueil }) {
  const marges = useSafeAreaInsets();
  return (
    <ScrollView style={{ backgroundColor: couleurs.sol }} contentContainerStyle={{ paddingTop: marges.top + G * 3, paddingHorizontal: G * 2, paddingBottom: G * 6, gap: G * 4 }}>
      {v === "a" ? <VarianteA f={faits} /> : <VarianteB f={faits} />}
    </ScrollView>
  );
}
