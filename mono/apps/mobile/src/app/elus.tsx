/* « ÉLUS » : l'annuaire des élus publiés par Repère (30/10/2026).
 *
 * CE QUI Y EST : les deputes (data/deputes.json, mandats ouverts, France entiere) et
 * l'executif de chaque region (data/elus-regions/, 14 regions).
 * CE QUI N'Y EST PAS, ET L'ECRAN LE DIT :
 *   - les maires, adjoints et conseillers municipaux, et les conseillers departementaux
 *     et regionaux : leurs donnees sont rangees par departement, pas encore indexees ;
 *   - le groupe politique des exécutifs régionaux (celui des députés vient de la table de l'Assemblée) ;
 *   - une photo, quand Wikimedia Commons n'en a pas sous licence libre (D27) : les initiales.
 * 09/11/2026 : filtres par fonction ; photo libre et badge de groupe dans chaque ligne.
 * Recherche par nom, departement ou fonction. La recherche par ville n'est pas offerte :
 * les circonscriptions ne portent pas le nom des villes dans les donnees publiees. */
import { MARQUE_DEFILEMENT } from "../lib/defilement-ios";
import { useBasSur } from "../ui/page";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { Entree } from "../ui/entree";
import { router, Stack } from "expo-router";
import { correspondFlou, motsCible, motsRecherche } from "@repere/core";
import { ETATS, PHRASES } from "../lib/donnees";
import { chargerFiches } from "../lib/annuaire";
import { Vide } from "../lib/composants";
import { couleurs, CIBLE, PAS, RAYON, TYPO } from "../lib/theme";
import { AvatarElu } from "../ui/avatar";
import { CarteListe, Puces } from "../ui/donnees";
import { Loupe } from "../ui/loupe";
import { DatePublication } from "../ui/fraicheur";
import { SquelettesListe } from "../ui/squelette";
import type { Fiche } from "../types/annuaire";
import { ScrollView } from "react-native";
import { groupeDe, useGroupes, type TableGroupes, GROUPE_INCONNU } from "../lib/groupes";
import { BadgeGroupe } from "../ui/badge-groupe";
import { enfonce } from "../ui/mouvement";

/* LES FILTRES PAR FONCTION (porteur, 09/11/2026). L'annuaire porte les députés et les exécutifs
   régionaux ; sénateurs et conseillers départementaux n'y sont pas encore : le filtre le dit. */
type Filtre = "tous" | "deputes" | "senateurs" | "regionaux" | "departementaux";
const FILTRES: { cle: Filtre; texte: string }[] = [
  { cle: "tous", texte: "Tous" }, { cle: "deputes", texte: "Députés" }, { cle: "senateurs", texte: "Sénateurs" },
  { cle: "regionaux", texte: "Régionaux" }, { cle: "departementaux", texte: "Départementaux" },
];
const ABSENTS: Partial<Record<Filtre, string>> = {
  senateurs: "Les sénateurs ne sont pas encore dans l'annuaire de Repère : leurs données ne sont pas publiées dans l'application.",
  departementaux: "Les conseillers départementaux ne sont pas encore dans l'annuaire : leurs données sont rangées par département. Ils sont nommés sur l'écran « Qui décide » de chaque commune.",
};
const deFiltre = (f: Filtre, x: Fiche) => f === "tous" || (f === "deputes" && x.id.startsWith("dep-")) || (f === "regionaux" && x.id.startsWith("reg-"));

/* Une ligne : la photo libre (D27) si elle existe, sinon les initiales ; le groupe politique du
   député en badge (couleur et sigle, invariant 7 : identification seulement). */
function LigneElu({ item, groupes }: { item: Fiche; groupes: TableGroupes | null }) {
  const groupe = item.ref ? groupeDe(item.ref, groupes) : null;
  return (
    <CarteListe onPress={() => router.push({ pathname: "/annuaire-fiche", params: { ...item } })}
      etiquette={`${item.nom}, ${item.fonction}, ${item.lieu}`} titre={item.nom}
      gauche={<AvatarElu nom={item.nom} taille={44} groupe={groupe} echelon={item.ref ? "france" : "region"} dep={item.dep} cle={item.ref} />}>
      <Text style={TYPO.note}>{item.fonction} · {item.lieu}</Text>
      {groupe && groupe !== GROUPE_INCONNU ? <View style={{ flexDirection: "row" }}><BadgeGroupe groupe={groupe} /></View> : null}
    </CarteListe>
  );
}

export default function Elus() {
  const [etat, setEtat] = useState<string>(ETATS.EN_COURS);
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [filtre, setFiltre] = useState("");
  const [fonction, setFonction] = useState<Filtre>("tous");
  const groupes = useGroupes();
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
    () => (cherches.length ? fiches.filter(f => correspondFlou(cherches, motsCible(`${f.nom} ${f.fonction} ${f.lieu}`))) : fiches).filter(f => deFiltre(fonction, f)),
    [fiches, filtre, fonction],
  );
  const phrase = PHRASES[etat as keyof typeof PHRASES] as { titre: string; corps: string; action?: string } | undefined;

  const bas = useBasSur();
  return (
    <View style={{ flex: 1, backgroundColor: couleurs.sol }}>
      <Stack.Screen options={{ title: "Élus" }} />
      <FlatList
        {...MARQUE_DEFILEMENT}
        data={etat === ETATS.SERVI && !ABSENTS[fonction] ? trouves : []}
        keyExtractor={f => f.id}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        contentContainerStyle={{ padding: PAS * 4, paddingBottom: bas, gap: PAS * 2 }}
        ListHeaderComponent={
          <View style={{ gap: PAS * 3 }}>
            <DatePublication />
            <Text style={TYPO.affiche} accessibilityRole="header">Élus</Text>
            <Text style={TYPO.note}>Les députés et les exécutifs régionaux publiés par Repère. Chaque nom porte sa source.</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, minHeight: CIBLE + 8, borderRadius: 999, borderWidth: 1.5,
              borderColor: couleurs.trait, backgroundColor: couleurs.carte, paddingLeft: PAS * 4 }}>
              <Loupe couleur={couleurs.sourd} />
              <TextInput value={filtre} onChangeText={setFiltre} placeholder="Nom, département ou fonction"
                placeholderTextColor={couleurs.sourd} autoCorrect={false} autoCapitalize="none" returnKeyType="search"
                accessibilityLabel="Chercher un élu : nom, département ou fonction"
                style={{ flex: 1, minHeight: CIBLE + 8, paddingHorizontal: PAS * 2, fontSize: 17, color: couleurs.encre }} />
            </View>
            {/* Filtres par fonction : des pastilles qui défilent (cinq libellés ne tiennent pas en une ligne à 360 px). */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: PAS * 2 }}
              accessibilityRole="tablist" accessibilityLabel="Filtrer par fonction">
              {FILTRES.map(o => {
                const on = fonction === o.cle;
                return (
                  <Pressable key={o.cle} onPress={() => setFonction(o.cle)} accessibilityRole="tab" accessibilityState={{ selected: on }}
                    accessibilityLabel={o.texte}
                    style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: PAS * 4, justifyContent: "center", borderRadius: 999,
                      borderWidth: 1, borderColor: on ? couleurs.encre : couleurs.trait, backgroundColor: on ? couleurs.encre : couleurs.carte, ...enfonce(pressed) })}>
                    <Text style={[TYPO.note, { color: on ? couleurs.sol : couleurs.encre }]}>{o.texte}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {ABSENTS[fonction] ? <Vide titre={ABSENTS[fonction] as string} corps="Repère n'affiche que ce qu'il publie, avec sa source." /> : null}
            {etat === ETATS.SERVI && !ABSENTS[fonction] ? (
              <View style={{ flexDirection: "row" }}>
                {/* Variante A : le compteur n'est pas la réponse de l'écran ; une ligne discrète suffit. */}
                <Text style={TYPO.note}>{trouves.length.toLocaleString("fr-FR")} élu{trouves.length > 1 ? "s" : ""} affiché{trouves.length > 1 ? "s" : ""}</Text>
              </View>
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
          etat === ETATS.SERVI && !ABSENTS[fonction] ? (
            <View style={{ gap: PAS * 2, marginTop: PAS * 4 }}>
              <Text style={TYPO.etiquette}>Ce qui n'est pas dans cet annuaire, et pourquoi</Text>
              <Puces items={[
                { icone: "home-outline", texte: "Les maires, adjoints et conseillers municipaux, et les conseillers départementaux et régionaux : leurs données sont rangées par département et ne sont pas encore dans l'annuaire." },
                { icone: "flag-outline", texte: "Le groupe politique est publié pour les députés (table de l'Assemblée nationale), pas pour les exécutifs régionaux." },
                { icone: "image-outline", texte: "Photos : Wikimedia Commons, sous licence libre. L'auteur et la licence de chaque photo sont sur la fiche de l'élu. Sans photo libre, les initiales." },
              ]} />
            </View>
          ) : undefined
        }
        /* Les huit premieres fiches apparaissent en cascade (40 ms entre deux) ; les suivantes
           s'affichent d'emblee, pour qu'une liste qui defile ne clignote pas. */
        renderItem={({ item, index }) => {
          const fiche = <LigneElu item={item} groupes={groupes} />;
          return index < 8 ? <Entree delai={index * 40}>{fiche}</Entree> : fiche;
        }}
      />
    </View>
  );
}
