/* UN GROUPE DE L'ASSEMBLÉE (07/11/2026, maillage) : ses députés, ouverts depuis un badge de groupe.
 *
 * Données : data/deputes-groupes.json (AMO30, nom et groupe des 577 députés), avec sa source.
 * Ordre : ALPHABÉTIQUE par nom de famille, jamais par une mesure (invariant 3).
 * Une ligne ouvre la fiche de l'élu ; hors de votre département, la fiche n'a que ce que
 * Repère publie (pas de votes) et le dit. Sans fichier : la phrase vraie (invariant 5).
 *
 * 13/11/2026 (test sur iPhone) : depuis « Le Parlement », sans commune choisie, la fiche
 * s'ouvrait sur « Aucune commune n'est choisie ». La fiche « Qui décide » (/elu) lit en effet le
 * paquet de la commune pour les VOTES : sans commune, elle n'a rien a montrer. On ouvre donc
 * l'annuaire (/annuaire-fiche), qui ne depend d'aucune commune — identite, groupe, photo libre et
 * source — et on garde /elu quand une commune est choisie, parce qu'elle y ajoute les votes.
 *
 * 13/11/2026 aussi : la photo libre dans la liste (D27). Elle vit dans photos-elus/{dep}.json, un
 * fichier PAR DEPARTEMENT, d'environ 130 Ko : un groupe de 123 deputes en toucherait des dizaines,
 * soit plusieurs mega-octets pour des vignettes de 40 px. La liste est donc virtualisee : seules les
 * lignes visibles demandent le fichier de leur departement. Sans photo publiee : les initiales.
 *
 * 13/11/2026, soir (test sur iPhone : « on ne peut pas remonter quand on est en bas ») : cette
 * FlatList etait IMBRIQUEE dans le ScrollView de `Page`. Deux conteneurs de defilement l'un dans
 * l'autre : sur le web, le defilement se bloque. La FlatList EST donc l'ecran — un seul conteneur,
 * la virtualisation gardee, et le defilement natif revient. L'en-tete et le pied passent par
 * ListHeaderComponent / ListFooterComponent. */
import { FlatList, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { couleurGroupe, groupeDe, GROUPE_INCONNU, useFichierGroupes } from "../lib/groupes";
import { Vide } from "../lib/composants";
import { Page, Question } from "../ui/page";
import { AvatarElu, CreditPhotoElu } from "../ui/avatar";
import { CarteListe, StatCard } from "../ui/donnees";
import { PastilleSource } from "../ui/source";
import { SquelettesListe } from "../ui/squelette";
import { couleurs, feuille, PAS, TYPO } from "../lib/theme";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BoutonCopierLien } from "../ui/partage/partager-texte";
import { useEffect, useState } from "react";
import { chargerDeputes } from "../lib/donnees";
import { useSelection } from "../lib/selection";

const famille = (nom: string) => nom.split(/\s+/).slice(1).join(" ") || nom;

/* OU VA UNE LIGNE. Avec une commune choisie : /elu, qui ajoute les votes lus dans le paquet de la
   commune. Sans commune : /annuaire-fiche, qui n'en depend pas. Jamais l'ecran qui dirait seulement
   « Aucune commune n'est choisie » : ce n'est pas une reponse a « qui est ce depute ». */
function ouvrir(m: { ref: string; nom: string }, dep: string | undefined, g: string, fichier: { source: { producteur: string; licence: string; url?: string }; genere_le: string }, avecCommune: boolean) {
  if (avecCommune) {
    return { pathname: "/elu" as const, params: { nom: m.nom, echelon: "france", niveau: "Assemblée nationale", role: "Député", institution: "Assemblée nationale" } };
  }
  return {
    pathname: "/annuaire-fiche" as const,
    params: {
      id: m.ref, nom: m.nom, fonction: "Députée ou député", lieu: "Assemblée nationale", depuis: "",
      ref: m.ref, dep: dep || "",
      producteur: fichier.source.producteur, licence: fichier.source.licence, url: fichier.source.url || "", maj: fichier.genere_le,
    },
  };
}

/* ref d'acteur -> code de departement, depuis deputes.json (un seul fichier national). Sert a trouver
   le bon fichier de photos ; sans entree, pas de photo, et des initiales. */
function useDepartementParRef(): Record<string, string> {
  const [t, setT] = useState<Record<string, string>>({});
  useEffect(() => {
    let vivant = true;
    chargerDeputes().then(r => {
      const table = (r.donnees as { deputes?: Record<string, { acteurRef?: string }> } | null)?.deputes || {};
      const out: Record<string, string> = {};
      for (const [cle, d] of Object.entries(table)) if (d && d.acteurRef) out[d.acteurRef] = String(cle).split("-")[0];
      if (vivant) setT(out);
    }).catch(() => {});
    return () => { vivant = false; };
  }, []);
  return t;
}

export default function Groupe() {
  const { g = GROUPE_INCONNU } = useLocalSearchParams<{ g?: string }>();
  const fichier = useFichierGroupes();
  const depParRef = useDepartementParRef();
  const { choix } = useSelection();
  const marges = useSafeAreaInsets();
  const titre = g === GROUPE_INCONNU ? "Groupe non publié" : g;
  if (fichier === null) {
    return (
      <Page sansDate>
        <Stack.Screen options={{ title: titre }} />
        <Question etiquette="Groupe à l'Assemblée nationale" question={titre} />
        <Vide titre="La liste des députés par groupe n'est pas encore sur cet appareil." corps="Elle vient de la table des groupes de l'Assemblée nationale, publiée chaque matin par Repère." />
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
  const source = (
    <PastilleSource source={{ producteur: fichier.source.producteur, licence: fichier.source.licence, url: fichier.source.url, releve: fichier.genere_le }} />
  );
  if (!membres.length) {
    return (
      <Page sansDate>
        <Stack.Screen options={{ title: titre }} />
        <Question etiquette="Groupe à l'Assemblée nationale" question={titre} />
        <Vide titre="Aucun député de ce groupe dans la table publiée." corps="La table des groupes de l'Assemblée ne rattache aucun député à ce groupe à cette date." />
        {source}
      </Page>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: couleurs.sol }}>
      <Stack.Screen options={{ title: titre }} />
      <FlatList
        data={membres}
        keyExtractor={m => m.ref}
        initialNumToRender={12}
        windowSize={5}
        contentContainerStyle={[s.liste, { paddingBottom: marges.bottom + PAS * 8 }]}
        ListHeaderComponent={
          <View style={{ gap: PAS * 3, marginBottom: PAS * 3 }}>
            <Question etiquette="Groupe à l'Assemblée nationale" question={titre} />
            <View style={{ flexDirection: "row" }}>
              <StatCard valeur={String(membres.length)} libelle={membres.length > 1 ? "députés" : "député"} couleur={couleurGroupe(g)} />
            </View>
            <Text style={TYPO.micro}>Ordre alphabétique des noms de famille.</Text>
          </View>
        }
        ListFooterComponent={<View style={{ marginTop: PAS * 4, gap: PAS * 3 }}>{source}<View style={{ alignSelf: "flex-start" }}><BoutonCopierLien /></View></View>}
        ItemSeparatorComponent={() => <View style={{ height: PAS * 2 }} />}
        renderItem={({ item: m }) => (
          <CarteListe titre={m.nom} etiquette={`${m.nom}, ouvrir sa fiche`}
            gauche={<AvatarElu nom={m.nom} taille={40} groupe={g} echelon="france" dep={depParRef[m.ref]} cle={m.ref} />}
            onPress={() => router.push(ouvrir(m, depParRef[m.ref], g, fichier, !!choix))}>
            {/* D27 (ADR 0004) : une photo ne s'affiche jamais sans son credit. Sans photo publiee, rien. */}
            <CreditPhotoElu nom={m.nom} dep={depParRef[m.ref]} cle={m.ref} />
          </CarteListe>
        )}
      />
    </View>
  );
}

const s = feuille(() => StyleSheet.create({
  /* Les memes marges que `Page`, parce que la liste prend sa place comme conteneur de defilement. */
  liste: { paddingHorizontal: PAS * 4, paddingTop: PAS * 4, maxWidth: 640, width: "100%", alignSelf: "center" },
}));
