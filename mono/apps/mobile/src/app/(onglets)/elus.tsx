/* « ÉLUS » : l'annuaire des élus publiés par Repère (30/10/2026).
 *
 * CE QUI Y EST : les deputes (data/deputes.json, mandats ouverts, France entiere) et
 * l'executif de chaque region (data/elus-regions/, 14 regions).
 * CE QUI N'Y EST PAS, ET L'ECRAN LE DIT :
 *   - les maires, adjoints et conseillers municipaux, et les conseillers departementaux
 *     et regionaux : leurs donnees sont rangees par departement, pas encore indexees ;
 *   - le parti : les groupes politiques ne sont pas publies dans le depot ;
 *   - les photos : le fichier publie n'en porte pas.
 * Recherche par nom, departement ou fonction. La recherche par ville n'est pas offerte :
 * les circonscriptions ne portent pas le nom des villes dans les donnees publiees. */
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Entree } from "../../ui/entree";
import { router, Stack } from "expo-router";
import { correspondFlou, motsCible, motsRecherche } from "@repere/core";
import { ETATS, PHRASES } from "../../lib/donnees";
import { chargerFiches } from "../../lib/annuaire";
import { Vide } from "../../lib/composants";
import { couleurs, CIBLE, PAS, RAYON, TYPO } from "../../lib/theme";
import { Avatar } from "../../ui/avatar";
import { Loupe } from "../../ui/loupe";
import { DatePublication } from "../../ui/fraicheur";
import { SquelettesListe } from "../../ui/squelette";
import type { Fiche } from "../../types/annuaire";

export default function Elus() {
  const [etat, setEtat] = useState<string>(ETATS.EN_COURS);
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [filtre, setFiltre] = useState("");
  const [essai, setEssai] = useState(0);

  useEffect(() => {
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    if (__DEV__) console.time("annuaire : chargement");
    chargerFiches().then(({ etat: e, fiches: f }) => {
      if (__DEV__) console.timeEnd("annuaire : chargement");
      if (!vivant) return;
      setFiches(f);
      setEtat(e);
    });
    return () => { vivant = false; };
  }, [essai]);

  const cherches = motsRecherche(filtre);
  const trouves = useMemo(
    () => (cherches.length ? fiches.filter(f => correspondFlou(cherches, motsCible(`${f.nom} ${f.fonction} ${f.lieu}`))) : fiches),
    [fiches, filtre],
  );
  const phrase = PHRASES[etat as keyof typeof PHRASES] as { titre: string; corps: string; action?: string } | undefined;

  return (
    <View style={{ flex: 1, backgroundColor: couleurs.sol }}>
      <Stack.Screen options={{ title: "Élus" }} />
      <FlatList
        data={etat === ETATS.SERVI ? trouves : []}
        keyExtractor={f => f.id}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        contentContainerStyle={{ padding: PAS * 4, gap: PAS * 2 }}
        ListHeaderComponent={
          <View style={{ gap: PAS * 3 }}>
            <DatePublication />
            <Text style={TYPO.question} accessibilityRole="header">Élus</Text>
            <Text style={TYPO.corps}>Les députés et les exécutifs régionaux publiés par Repère. Chaque nom porte sa source.</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, minHeight: CIBLE + 8, borderRadius: 999, borderWidth: 1.5,
              borderColor: couleurs.trait, backgroundColor: couleurs.carte, paddingLeft: PAS * 4 }}>
              <Loupe couleur={couleurs.sourd} />
              <TextInput value={filtre} onChangeText={setFiltre} placeholder="Nom, département ou fonction"
                placeholderTextColor={couleurs.sourd} autoCorrect={false} autoCapitalize="none" returnKeyType="search"
                accessibilityLabel="Chercher un élu : nom, département ou fonction"
                style={{ flex: 1, minHeight: CIBLE + 8, paddingHorizontal: PAS * 2, fontSize: 17, color: couleurs.encre }} />
            </View>
            {etat === ETATS.SERVI ? (
              <Text style={TYPO.note}>{trouves.length} élu{trouves.length > 1 ? "s" : ""} affiché{trouves.length > 1 ? "s" : ""}.</Text>
            ) : null}
            {etat === ETATS.EN_COURS ? <SquelettesListe n={5} hauteur={68} /> : null}
            {etat !== ETATS.SERVI && etat !== ETATS.EN_COURS && phrase ? (
              <Vide titre={phrase.titre} corps={phrase.corps}
                action="Réessayer" onAction={() => setEssai(n => n + 1)} />
            ) : null}
            {etat === ETATS.SERVI && cherches.length && !trouves.length ? (
              <Vide titre={`Aucun élu publié ne correspond à « ${filtre.trim()} ».`}
                corps="Essayez le nom de famille, le département ou la fonction."
                action="Effacer la recherche" onAction={() => setFiltre("")} />
            ) : null}
          </View>
        }
        ListFooterComponent={
          etat === ETATS.SERVI ? (
            <View style={{ gap: PAS * 2, marginTop: PAS * 4 }}>
              <Text style={TYPO.note}>Ce qui n'est pas dans cet annuaire, et pourquoi :</Text>
              <Text style={TYPO.note}>• Les maires, adjoints et conseillers municipaux, et les conseillers départementaux et régionaux : leurs données sont rangées par département et ne sont pas encore dans l'annuaire.</Text>
              <Text style={TYPO.note}>• Le parti : les groupes politiques ne sont pas publiés dans les données de Repère.</Text>
              <Text style={TYPO.note}>• Les photos : les données publiées n'en portent pas. Les initiales tiennent lieu d'image.</Text>
            </View>
          ) : undefined
        }
        /* Les huit premieres fiches apparaissent en cascade (40 ms entre deux) ; les suivantes
           s'affichent d'emblee, pour qu'une liste qui defile ne clignote pas. */
        renderItem={({ item, index }) => {
          const fiche = (
            <Pressable onPress={() => router.push({ pathname: "/annuaire-fiche", params: { ...item } })} accessibilityRole="button"
              accessibilityLabel={`${item.nom}, ${item.fonction}, ${item.lieu}`}
              style={({ pressed }) => ({ minHeight: CIBLE + 8, flexDirection: "row", alignItems: "center", gap: PAS * 3, padding: PAS * 3,
                borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, opacity: pressed ? 0.7 : 1 })}>
              <Avatar nom={item.nom} taille={44} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[TYPO.corps, { fontWeight: "600" }]}>{item.nom}</Text>
                <Text style={TYPO.note}>{item.fonction} · {item.lieu}</Text>
              </View>
            </Pressable>
          );
          return index < 8 ? <Entree delai={index * 40}>{fiche}</Entree> : fiche;
        }}
      />
    </View>
  );
}
