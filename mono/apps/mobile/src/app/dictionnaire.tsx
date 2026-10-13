/* « DICTIONNAIRE CITOYEN » — ecran mobile, 13/10/2026.
 *
 * La table est celle du web (packages/core/src/mots.js, lue par @repere/core) : une
 * seule liste pour le site et le telephone. Le filtre ignore les accents et la casse,
 * et cherche dans le mot ET dans sa definition : « scrutin » trouve aussi le texte
 * qui le decrit.
 *
 * ETAT ACTUEL : la table ne compte que trois mots. Les vingt autres de la maquette
 * ne sont pas publies, faute de sources verifiees (voir le cadrage du 13/10). Ajouter
 * un mot = ajouter une entree dans mots.js, rien d'autre a faire ici. */
import { useMemo, useState } from "react";
import { Stack } from "expo-router";
import { GLOSSAIRE } from "@repere/core";
import { Text, TextInput, View } from "react-native";
import { couleurs, PAS, TYPO } from "../lib/theme";
import { Page, Question } from "../ui/page";

const normaliser = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function Dictionnaire() {
  const [recherche, setRecherche] = useState("");
  const entrees = useMemo(
    () => Object.entries(GLOSSAIRE as Record<string, { titre: string; corps: string }>)
      .map(([cle, m]) => ({ cle, titre: m.titre, corps: m.corps }))
      .sort((a, b) => normaliser(a.titre).localeCompare(normaliser(b.titre), "fr")),
    [],
  );
  const q = normaliser(recherche.trim());
  const liste = q ? entrees.filter(e => normaliser(e.titre + " " + e.corps).includes(q)) : entrees;

  return (
    <Page>
      <Stack.Screen options={{ title: "Dictionnaire citoyen" }} />
      <Question etiquette="Les mots de la vie publique" question="Que veut dire ce mot ?"
        sous="Des définitions courtes, exactes sur le plan institutionnel. Tapez un mot pour filtrer la liste." />
      <TextInput
        value={recherche}
        onChangeText={setRecherche}
        placeholder="Rechercher un mot"
        accessibilityLabel="Rechercher un mot du dictionnaire"
        autoCorrect={false}
        style={{ minHeight: 48, borderWidth: 1, borderColor: couleurs.trait, borderRadius: 12,
          paddingHorizontal: 14, color: couleurs.encre, backgroundColor: couleurs.carte }}
      />
      {liste.length ? liste.map(e => (
        <View key={e.cle} testID="dico-entree"
          style={{ gap: PAS, paddingTop: PAS * 3, borderTopWidth: 1, borderTopColor: couleurs.trait }}>
          <Text style={[TYPO.corps, { fontWeight: "700" }]}>{e.titre}</Text>
          <Text style={TYPO.corps}>{e.corps}</Text>
        </View>
      )) : (
        <Text style={TYPO.note}>{`Aucun mot ne correspond à « ${recherche.trim()} ». Essayez une partie du mot.`}</Text>
      )}
    </Page>
  );
}
