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
      <Question etiquette="Au Parlement" echelon="france" question="Comment une loi devient loi"
        sous={`${ETAPES_LOI.length} étapes, du dépôt à la publication. Touchez une étape pour la lire.`} />

      {/* LES SIX ETAPES D'UN COUP D'OEIL (16/10/2026, audit Lovable). Avant : une barre de
          six segments numerotes 1 a 6 ; seul le titre de l'etape ouverte se lisait. Une
          ligne par etape, son numero et son titre ; toucher une ligne ouvre son detail. */}
      <View accessibilityRole="tablist" style={{ gap: 2 }}>
        {ETAPES_LOI.map((e, i) => {
          const choisie = i === etape;
          return (
            <Pressable key={e.cle} onPress={() => aller(i)} accessibilityRole="tab"
              accessibilityState={{ selected: choisie }} aria-selected={choisie} accessibilityLabel={`Étape ${i + 1} : ${e.titre}`}
              style={({ pressed }) => ({ minHeight: CIBLE, flexDirection: "row", alignItems: "center", gap: PAS * 3,
                paddingHorizontal: PAS * 3, borderRadius: 12, backgroundColor: choisie ? couleurs.carte : "transparent", opacity: pressed ? 0.6 : 1 })}>
              <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center",
                backgroundColor: choisie ? couleurs.encre : "transparent", borderWidth: 1.5, borderColor: i <= etape ? couleurs.encre : couleurs.trait }}>
                <Text style={{ fontWeight: "700", fontSize: 14, color: choisie ? couleurs.sol : couleurs.encre, fontVariant: ["tabular-nums"] }}>{i + 1}</Text>
              </View>
              <Text style={[TYPO.corps, { flex: 1, fontWeight: choisie ? "800" : "500" }]}>{e.titre}</Text>
            </Pressable>
          );
        })}
      </View>

      <Etape key={etape} indice={etape} />

      <View style={{ flexDirection: "row", gap: PAS * 3 }}>
        <Pressable onPress={() => aller(etape - 1)} disabled={etape === 0} accessibilityRole="button"
          accessibilityLabel="Étape précédente" accessibilityState={{ disabled: etape === 0 }} aria-disabled={etape === 0}
          style={({ pressed }) => ({ flex: 1, minHeight: CIBLE, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait,
            backgroundColor: couleurs.carte, alignItems: "center", justifyContent: "center", opacity: etape === 0 ? 0.4 : pressed ? 0.6 : 1 })}>
          <Text style={{ fontWeight: "700", color: couleurs.encre }}>Précédente</Text>
        </Pressable>
        <Pressable onPress={() => aller(etape + 1)} disabled={etape === dernier} accessibilityRole="button"
          accessibilityLabel="Étape suivante" accessibilityState={{ disabled: etape === dernier }} aria-disabled={etape === dernier}
          style={({ pressed }) => ({ flex: 1, minHeight: CIBLE, borderRadius: 14, backgroundColor: couleurs.encre,
            alignItems: "center", justifyContent: "center", opacity: etape === dernier ? 0.4 : pressed ? 0.7 : 1 })}>
          <Text style={{ fontWeight: "700", color: couleurs.sol }}>Suivante</Text>
        </Pressable>
      </View>

      <Text style={TYPO.note}>
        {/* 16/10/2026 : « articles 45 et 61 » ne correspondait a aucune etape affichee (61 =
            Conseil constitutionnel) ; l'ecran du vote cite 10, 39 et 45. Le parcours est
            general et simplifie : on le dit, et l'article 61 est nomme pour ce qu'il est. */}
        {"Ce qui est écrit ici est le résumé de Repère, simplifié\u00a0: un texte ne passe pas toujours par toutes ces étapes, et avant la promulgation, le Conseil constitutionnel peut être saisi (article 61). La Constitution (articles 10, 39, 45 et 61) fait foi."}
      </Text>
      <LienSortant url={CONSTITUTION_45_URL} texte="La Constitution, texte intégral" etiquette="Ouvrir le texte de la Constitution" />
    </Page>
  );
}
