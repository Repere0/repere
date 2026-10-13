/* « FICHE D'UN ÉLU » — ecran mobile, 13/10/2026.
 *
 * Ouvert par le nom de la personne, depuis la chaine « Qui décide ». Chaque nom
 * de la chaine ouvre cette fiche : c'est la regle du porteur (13/10/2026).
 *
 * CE QUI EST AFFICHE, ET CE QUI NE L'EST PAS.
 *   - Le nom, le role et l'institution : ce que la source du niveau donne.
 *   - Le parti : « non publié par la source » tant que la source ne le donne pas.
 *     Repère ne le devine jamais.
 *   - Ce que ce niveau decide : la meme phrase que « Qui décide » (@repere/core).
 *   - Patrimoine, presence ou absence aux seances : jamais (invariant 8).
 * Une fiche n'affiche que des faits de mandat, sources. */
import { Animated, Pressable, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { chaineDecision, LIBELLES } from "@repere/core";
import { Carte } from "../lib/composants";
import { srcElus } from "../lib/sources";
import { couleurs, CIBLE, PAS, TYPO, type Echelon } from "../lib/theme";
import { AvecDonnees, Page, Question } from "../ui/page";
import { PastilleSource } from "../ui/source";
import { useApparition } from "../ui/mouvement";

type Params = { nom?: string; role?: string; echelon?: string; niveau?: string; institution?: string; lieu?: string };

const PARTI_NON_PUBLIE = "Parti : non publié par la source. Repère ne le déduit pas.";

function Initiales({ nom }: { nom: string }) {
  const lettres = nom.split(/\s+/).filter(Boolean).map(m => m[0]).slice(0, 2).join("").toUpperCase();
  return (
    <View accessible={false}
      style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: couleurs.encre, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: couleurs.sol, fontWeight: "800", fontSize: 22 }}>{lettres}</Text>
    </View>
  );
}

function Bouton({ libelle, etiquette, onPress }: { libelle: string; etiquette: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiquette}
      style={({ pressed }) => ({ minHeight: CIBLE, borderRadius: 14, borderWidth: 1, borderColor: couleurs.trait,
        backgroundColor: couleurs.carte, padding: 14, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ fontWeight: "700", color: couleurs.encre }}>{libelle}</Text>
    </Pressable>
  );
}

export default function Elu() {
  const p = useLocalSearchParams<Params>();
  const nom = p.nom || "Élu";
  const echelon = p.echelon || "";
  const apparition = useApparition(0);
  return (
    <AvecDonnees rendu={r => {
      const niveaux = chaineDecision({ fiche: r.d.fiche, paquet: r.paquet, index: r.index, deputes: r.deputes, elusRegion: r.elusRegion, dep: r.d.dep });
      const decide = (niveaux as { echelon: string; decide?: string }[]).find(n => n.echelon === echelon)?.decide;
      return (
        <Page>
          <Stack.Screen options={{ title: "Fiche" }} />
          <Animated.View style={{ opacity: apparition, gap: PAS * 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 4 }}>
            <Initiales nom={nom} />
            <View style={{ flex: 1, gap: PAS }}>
              <Question etiquette={p.niveau || LIBELLES.qui} question={nom} sous={p.role || undefined} />
            </View>
          </View>

          <Carte echelon={echelon as Echelon} titre="Mandat">
            {p.institution ? <Text style={TYPO.corps}>{p.institution}</Text> : null}
            {p.lieu ? <Text style={TYPO.note}>{p.lieu}</Text> : null}
            <Text style={TYPO.note}>{PARTI_NON_PUBLIE}</Text>
          </Carte>

          {decide ? (
            <Carte titre="Ce que ce niveau décide">
              <Text style={TYPO.corps}>{decide}.</Text>
              <Text style={TYPO.note}>Les mêmes phrases que sur « Qui décide ».</Text>
            </Carte>
          ) : null}

          {echelon === "france" ? (
            <View style={{ gap: PAS * 2 }}>
              <Bouton libelle="Voir son vote" etiquette={`Voir le vote de ${nom}`} onPress={() => router.push("/vote")} />
            </View>
          ) : null}

          <Carte titre="D'où viennent ces informations">
            <PastilleSource source={srcElus(r.srcElus ?? null)} />
          </Carte>
          <Text style={TYPO.note}>
            Repère n'affiche ni le patrimoine des élus, ni leur présence ou absence aux séances.
          </Text>
          </Animated.View>
        </Page>
      );
    }} />
  );
}
