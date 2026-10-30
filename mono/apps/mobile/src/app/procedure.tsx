/* « COMMENT UNE LOI DEVIENT LOI » — ecran mobile, 13/10/2026.
 *
 * Les etapes viennent de @repere/core (ETAPES_LOI), la meme liste que la frise du
 * « Qu'a voté votre député ». La maquette du 13/10 en comptait sept : la liste du
 * code en compte six. On garde celle du code, deja relue, et on ne double pas les
 * sources. Chaque etape se revele au passage ; le mouvement s'efface avec le
 * reglage « moins d'animations » (ui/mouvement.ts). */
import { useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { CONSTITUTION_45_URL, ETAPES_LOI } from "@repere/core";
import { Carte, LienSortant } from "../lib/composants";
import { couleurs, CIBLE, PAS, TYPO } from "../lib/theme";
import { Page, Question } from "../ui/page";
import { useApparition } from "../ui/mouvement";

/* La navette : le texte passe d'une assemblee a l'autre, aller et retour. */
function Navette() {
  const boite = { flex: 1, minHeight: CIBLE, borderRadius: 12, borderWidth: 1, borderColor: couleurs.encre,
    alignItems: "center" as const, justifyContent: "center" as const, padding: PAS * 2 };
  return (
    <View accessible accessibilityLabel="Le texte passe de l'Assemblée nationale au Sénat, puis revient, jusqu'à ce qu'ils s'accordent."
      style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, marginTop: PAS * 2 }}>
      <View style={boite}><Text style={{ fontWeight: "700", color: couleurs.encre, textAlign: "center" }}>Assemblée nationale</Text></View>
      <Text style={{ color: couleurs.sourd, fontSize: 18 }}>⇄</Text>
      <View style={boite}><Text style={{ fontWeight: "700", color: couleurs.encre, textAlign: "center" }}>Sénat</Text></View>
    </View>
  );
}

/* Une etape, montee a nouveau a chaque changement (key) : l'apparition rejoue. */
function Etape({ indice }: { indice: number }) {
  const apparition = useApparition(0);
  const e = ETAPES_LOI[indice];
  return (
    <Animated.View style={{ opacity: apparition }}>
      <Carte titre={`${indice + 1}. ${e.titre}`}>
        <Text style={[TYPO.corps, { fontSize: 17, lineHeight: 24 }]}>{e.texte}</Text>
        {e.cle === "nouvelle lecture" ? <Navette /> : null}
      </Carte>
    </Animated.View>
  );
}

export default function Procedure() {
  const [etape, setEtape] = useState(0);
  const dernier = ETAPES_LOI.length - 1;
  const aller = (i: number) => setEtape(Math.max(0, Math.min(dernier, i)));

  return (
    <Page>
      <Stack.Screen options={{ title: "La procédure" }} />
      <Question etiquette="Au Parlement" question="Comment une loi devient loi"
        sous={`${ETAPES_LOI.length} étapes, du dépôt à la publication. Touchez une étape, ou suivez-les dans l'ordre.`} />

      <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 4 }}>
        {ETAPES_LOI.map((e, i) => (
          <Pressable key={e.cle} onPress={() => aller(i)} accessibilityRole="tab"
            accessibilityState={{ selected: i === etape }} accessibilityLabel={`Étape ${i + 1} : ${e.titre}`}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, flex: 1, minHeight: CIBLE, justifyContent: "center" })}>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: i <= etape ? couleurs.encre : couleurs.trait }} />
            <Text style={[TYPO.note, { marginTop: 4, textAlign: "center", fontWeight: i === etape ? "700" : "400" }]}>{i + 1}</Text>
          </Pressable>
        ))}
      </View>

      <Etape key={etape} indice={etape} />

      <View style={{ flexDirection: "row", gap: PAS * 3 }}>
        <Pressable onPress={() => aller(etape - 1)} disabled={etape === 0} accessibilityRole="button"
          accessibilityLabel="Étape précédente" accessibilityState={{ disabled: etape === 0 }}
          style={({ pressed }) => ({ flex: 1, minHeight: CIBLE, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait,
            backgroundColor: couleurs.carte, alignItems: "center", justifyContent: "center", opacity: etape === 0 ? 0.4 : pressed ? 0.6 : 1 })}>
          <Text style={{ fontWeight: "700", color: couleurs.encre }}>Précédente</Text>
        </Pressable>
        <Pressable onPress={() => aller(etape + 1)} disabled={etape === dernier} accessibilityRole="button"
          accessibilityLabel="Étape suivante" accessibilityState={{ disabled: etape === dernier }}
          style={({ pressed }) => ({ flex: 1, minHeight: CIBLE, borderRadius: 14, backgroundColor: couleurs.encre,
            alignItems: "center", justifyContent: "center", opacity: etape === dernier ? 0.4 : pressed ? 0.7 : 1 })}>
          <Text style={{ fontWeight: "700", color: couleurs.sol }}>Suivante</Text>
        </Pressable>
      </View>

      <Text style={TYPO.note}>
        Ce qui est écrit ici est le résumé de Repère. Le texte de la Constitution (articles 45 et 61) fait foi.
      </Text>
      <LienSortant url={CONSTITUTION_45_URL} texte="La Constitution, texte intégral" etiquette="Ouvrir le texte de la Constitution" />
    </Page>
  );
}
