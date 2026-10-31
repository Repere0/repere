/* « DICTIONNAIRE CITOYEN » — le canevas Dictionnaire, en donnees reelles (13/10/2026).
 *
 * La table est celle du web (packages/core/src/mots.js, lue par @repere/core) : une
 * seule liste pour le site et le telephone. Le filtre ignore les accents et la casse,
 * et cherche dans le mot ET dans sa definition : « scrutin » trouve aussi le texte
 * qui le decrit.
 *
 * LE CANEVAS MONTRE : une recherche, une rangee de lettres (seules celles qui ont
 * un mot), la liste. Une recherche ignore la lettre choisie, comme sur la maquette.
 *
 * ETAT ACTUEL : la table (packages/core/src/mots.js) porte les mots dont la definition
 * est verifiee ; le canevas en prevoyait davantage, non publies faute de source
 * verifiee (cadrage du 13/10). Ajouter un mot = une entree dans mots.js, rien d'autre.
 *
 * ENTREE PAR UN MOT (H1, 29/10/2026) : un mot tapable dans une phrase ouvre cet ecran
 * avec le mot deja cherche (?mot=cle). Une cle inconnue ou heritee est ignoree. */
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { GLOSSAIRE, titreDuMot } from "@repere/core";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Page, Question } from "../ui/page";

const normaliser = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Entree = { cle: string; titre: string; corps: string; lettre: string };

export default function Dictionnaire() {
  const parametres = useLocalSearchParams<{ mot?: string | string[] }>();
  const cleMot = Array.isArray(parametres.mot) ? parametres.mot[0] : parametres.mot;
  const [recherche, setRecherche] = useState(() => titreDuMot(cleMot) || "");
  const [lettre, setLettre] = useState<string | null>(null);
  const toutes = useMemo<Entree[]>(
    () => Object.entries(GLOSSAIRE as Record<string, { titre: string; corps: string }>)
      .map(([cle, m]) => ({ cle, titre: m.titre, corps: m.corps, lettre: normaliser(m.titre).charAt(0).toUpperCase() }))
      .sort((a, b) => normaliser(a.titre).localeCompare(normaliser(b.titre), "fr")),
    [],
  );
  /* Seules les lettres qui ont au moins un mot : aucune case vide. */
  const lettres = useMemo(() => [...new Set(toutes.map(e => e.lettre))], [toutes]);
  const q = normaliser(recherche.trim());
  /* Une recherche porte sur tous les mots : elle ignore la lettre choisie. */
  const liste = q
    ? toutes.filter(e => normaliser(e.titre + " " + e.corps).includes(q))
    : (lettre ? toutes.filter(e => e.lettre === lettre) : toutes);

  const chip = (actif: boolean) => ({
    minHeight: 44, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1,
    borderColor: actif ? couleurs.encre : couleurs.trait, backgroundColor: actif ? couleurs.encre : couleurs.carte,
    alignItems: "center" as const, justifyContent: "center" as const,
  });

  return (
    <Page>
      <Stack.Screen options={{ title: "Dictionnaire citoyen" }} />
      <Question etiquette="Les mots de la vie publique" question="Dictionnaire"
        sous="Les mots de la vie publique, expliqués simplement. Des définitions courtes, exactes sur le plan institutionnel." />

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TextInput
          value={recherche}
          onChangeText={setRecherche}
          placeholder="Chercher un mot"
          accessibilityLabel="Rechercher un mot du dictionnaire"
          autoCorrect={false}
          style={{ flex: 1, minHeight: 48, borderWidth: 1, borderColor: couleurs.trait, borderRadius: 999,
            paddingHorizontal: 16, color: couleurs.encre, backgroundColor: couleurs.carte, fontSize: 17 }}
        />
        {recherche.length > 0 ? (
          <Pressable onPress={() => setRecherche("")} accessibilityRole="button" accessibilityLabel="Effacer la recherche"
            style={({ pressed }) => ({ position: "absolute", right: 4, minHeight: 44, paddingHorizontal: 16, borderRadius: 999,
              backgroundColor: couleurs.voile, justifyContent: "center", opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontWeight: "700", color: couleurs.encre, fontSize: 14 }}>Effacer</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Lettres : une seule rangee, seules les lettres presentes. */}
      <View accessibilityRole="tablist" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Pressable onPress={() => setLettre(null)} accessibilityRole="tab" accessibilityState={{ selected: lettre === null }}
          accessibilityLabel="Tous les mots" style={chip(lettre === null)}>
          <Text style={{ fontWeight: "700", color: lettre === null ? couleurs.sol : couleurs.encre }}>Tous</Text>
        </Pressable>
        {lettres.map(l => (
          <Pressable key={l} onPress={() => setLettre(lettre === l ? null : l)} accessibilityRole="tab"
            accessibilityState={{ selected: lettre === l }} accessibilityLabel={`Lettre ${l}`}
            style={({ pressed }) => [chip(lettre === l), { width: 44, paddingHorizontal: 0 }, pressed && { opacity: 0.7 }]}>
            <Text style={{ fontWeight: "800", fontSize: 16, color: lettre === l ? couleurs.sol : couleurs.encre }}>{l}</Text>
          </Pressable>
        ))}
      </View>

      {liste.length ? liste.map(e => (
        <View key={e.cle} testID="dico-entree"
          style={{ gap: PAS, paddingTop: PAS * 3, borderTopWidth: 1, borderTopColor: couleurs.trait }}>
          <Text style={[TYPO.corps, { fontWeight: "700" }]}>{e.titre}</Text>
          <Text style={TYPO.corps}>{e.corps}</Text>
        </View>
      )) : (
        <Text style={TYPO.note}>{`Aucun mot ne correspond à « ${recherche.trim()} ». Essayez une partie du mot, ou parcourez les lettres.`}</Text>
      )}
    </Page>
  );
}
