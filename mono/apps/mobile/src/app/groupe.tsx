/* UN GROUPE DE L'ASSEMBLÉE (07/11/2026, maillage) : ses députés, ouverts depuis un badge de groupe.
 *
 * Données : data/deputes-groupes.json (AMO30, nom et groupe des 577 députés), avec sa source.
 * Ordre : ALPHABÉTIQUE par nom de famille, jamais par une mesure (invariant 3).
 * Une ligne ouvre la fiche de l'élu ; hors de votre département, la fiche n'a que ce que
 * Repère publie (pas de votes) et le dit. Sans fichier : la phrase vraie (invariant 5). */
import { Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { couleurGroupe, groupeDe, GROUPE_INCONNU, useFichierGroupes } from "../lib/groupes";
import { Vide } from "../lib/composants";
import { Page, Question } from "../ui/page";
import { Avatar } from "../ui/avatar";
import { CarteListe, StatCard } from "../ui/donnees";
import { PastilleSource } from "../ui/source";
import { SquelettesListe } from "../ui/squelette";
import { PAS, TYPO } from "../lib/theme";

const famille = (nom: string) => nom.split(/\s+/).slice(1).join(" ") || nom;

export default function Groupe() {
  const { g = GROUPE_INCONNU } = useLocalSearchParams<{ g?: string }>();
  const fichier = useFichierGroupes();
  const titre = g === GROUPE_INCONNU ? "Groupe non publié" : g;
  if (fichier === null) {
    return (
      <Page sansDate>
        <Stack.Screen options={{ title: titre }} />
        <Question etiquette="Groupe à l'Assemblée nationale" question={titre} />
        <Vide titre="La liste des députés par groupe n'est pas encore sur ce téléphone." corps="Elle vient de la table des groupes de l'Assemblée nationale, publiée chaque matin par Repère." />
      </Page>
    );
  }
  if (fichier === undefined) {
    return (
      <Page sansDate>
        <Stack.Screen options={{ title: titre }} />
        <Question etiquette="Groupe à l'Assemblée nationale" question={titre} />
        <SquelettesListe n={3} />
      </Page>
    );
  }
  const membres = Object.entries(fichier.groupes)
    .filter(([ref]) => groupeDe(ref, fichier.groupes) === g)
    .map(([ref, x]) => ({ ref, nom: x.nom || "Nom non publié" }))
    .sort((a, b) => famille(a.nom).localeCompare(famille(b.nom), "fr") || a.nom.localeCompare(b.nom, "fr"));
  return (
    <Page sansDate>
      <Stack.Screen options={{ title: titre }} />
      <Question etiquette="Groupe à l'Assemblée nationale" question={titre} />
      {membres.length ? (
        <>
          <View style={{ flexDirection: "row" }}>
            <StatCard valeur={String(membres.length)} libelle={membres.length > 1 ? "députés" : "député"} couleur={couleurGroupe(g)} />
          </View>
          <Text style={TYPO.micro}>Ordre alphabétique des noms de famille.</Text>
          <View style={{ gap: PAS * 2 }}>
            {membres.map(m => (
              <CarteListe key={m.ref} titre={m.nom} etiquette={`${m.nom}, ouvrir sa fiche`} gauche={<Avatar nom={m.nom} taille={40} groupe={g} />}
                onPress={() => router.push({ pathname: "/elu", params: { nom: m.nom, echelon: "france", niveau: "Assemblée nationale", role: "Député", institution: "Assemblée nationale" } })}>
              </CarteListe>
            ))}
          </View>
        </>
      ) : <Vide titre="Aucun député de ce groupe dans la table publiée." corps="La table des groupes de l'Assemblée ne rattache aucun député à ce groupe à cette date." />}
      <PastilleSource source={{ producteur: fichier.source.producteur, licence: fichier.source.licence, url: fichier.source.url, releve: fichier.genere_le }} />
    </Page>
  );
}
