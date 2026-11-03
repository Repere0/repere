/* RECHERCHE GLOBALE — une question, un champ (V37, bloc 3, 31/10/2026).
 *
 * Ouverte par la loupe de l'accueil, en feuille qui monte. Trois sections, dans cet ordre :
 *   - Communes : la liste publiée (bêta, Île-de-France), recherche et ordre du site (trouverCommunes) ;
 *   - Élus : la liste de l'onglet « Élus » (députés, exécutifs régionaux), recherche tolérante aux fautes ;
 *   - Scrutins : titre et date, comme l'écran « Scrutins publics ».
 * Chaque résultat ouvre sa fiche. Aucune donnée nouvelle : chaque lecture est celle d'un écran existant,
 * mise en mémoire pour la session (lib/donnees). Ce qui n'est pas cherché ici : les maires et les
 * conseillers, rangés par département (l'onglet « Élus » le dit). */
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { correspond, dateFr, departementDe, motsCible, motsRecherche, titreLisible, trouverCommunes } from "@repere/core";
import { chargerCommunesBeta, chargerIndex, chargerScrutinsIndex, ETATS, PHRASES } from "../lib/donnees";
import { chargerFiches } from "../lib/annuaire";
import { useSelection } from "../lib/selection";
import { useProfil } from "../lib/profil";
import { Vide } from "../lib/composants";
import { couleurs, CIBLE, PAS, RAYON, TYPO } from "../lib/theme";
import { Loupe } from "../ui/loupe";
import type { Fiche } from "../types/annuaire";

/* Au plus cette quantité par section : le lecteur affine plutôt que de faire défiler une liste de mille lignes. */
const PAR_SECTION = 8;

type Ligne = [string, string, string[]]; /* [code INSEE, nom, mots de recherche] : la forme de trouverCommunes */
type Elu = Fiche & { cible: string[] };
type Scrutin = { n: string; t: string; d?: string; cible: string[] };
type Charge<T> = { etat: string; liste: T[] };
type Departement = { code: string; nom?: string };

const EN_COURS = ETATS.EN_COURS as string;

function Resultat({ etiquette, titre, detail, onPress }: { etiquette: string; titre: string; detail: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiquette}
      style={({ pressed }) => ({ minHeight: CIBLE + 8, justifyContent: "center", gap: 2, padding: PAS * 3,
        borderRadius: RAYON.bloc, backgroundColor: couleurs.carte, opacity: pressed ? 0.7 : 1 })}>
      <Text style={[TYPO.corps, { fontWeight: "600" }]}>{titre}</Text>
      <Text style={TYPO.note}>{detail}</Text>
    </Pressable>
  );
}

/* Une section : son titre, et soit ses résultats, soit l'état de sa source (chargement ou panne). */
function Section({ titre, source, total, children }: { titre: string; source: string; total: number; children: React.ReactNode }) {
  const phrase = PHRASES[source as keyof typeof PHRASES] as { titre: string } | undefined;
  return (
    <View style={{ gap: PAS * 2 }}>
      <Text style={TYPO.etiquette} accessibilityRole="header">{titre}{source === ETATS.SERVI && total ? ` · ${total}` : ""}</Text>
      {source === EN_COURS ? <Text style={TYPO.note}>Chargement…</Text> : null}
      {source !== EN_COURS && source !== ETATS.SERVI && phrase ? <Text style={TYPO.note}>{phrase.titre}</Text> : null}
      {source === ETATS.SERVI ? children : null}
      {source === ETATS.SERVI && total > PAR_SECTION ? (
        <Text style={TYPO.note}>Les {PAR_SECTION} premiers sur {total}. Affinez la recherche pour voir les autres.</Text>
      ) : null}
    </View>
  );
}

export default function Recherche() {
  const { choisir } = useSelection();
  const { absent } = useProfil();
  const [filtre, setFiltre] = useState("");
  const [communes, setCommunes] = useState<Charge<Ligne>>({ etat: EN_COURS, liste: [] });
  const [elus, setElus] = useState<Charge<Elu>>({ etat: EN_COURS, liste: [] });
  const [scrutins, setScrutins] = useState<Charge<Scrutin>>({ etat: EN_COURS, liste: [] });
  const [departements, setDepartements] = useState<Departement[]>([]);

  useEffect(() => {
    let vivant = true;
    chargerCommunesBeta().then(r => {
      if (!vivant) return;
      const c = r.donnees as { communes: Record<string, string> } | null;
      setCommunes({
        etat: c ? ETATS.SERVI : r.etat,
        liste: c ? Object.entries(c.communes).map(([insee, nom]): Ligne => [insee, nom, motsCible(nom)]) : [],
      });
    });
    chargerIndex().then(r => {
      if (vivant && r.donnees) setDepartements((r.donnees as { departements: Departement[] }).departements);
    });
    chargerFiches().then(({ etat, fiches }) => {
      if (vivant) setElus({ etat, liste: fiches.map(f => ({ ...f, cible: motsCible(`${f.nom} ${f.fonction} ${f.lieu}`) })) });
    });
    chargerScrutinsIndex().then(r => {
      if (!vivant) return;
      const s = r.donnees as { scrutins: { n: string; t: string; d?: string }[] } | null;
      setScrutins({
        etat: s ? ETATS.SERVI : r.etat,
        liste: s ? s.scrutins.map(x => ({ ...x, cible: motsCible(titreLisible(x.t)) })) : [],
      });
    });
    return () => { vivant = false; };
  }, []);

  const cherches = motsRecherche(filtre);
  const resultats = useMemo(() => {
    if (!cherches.length) return null;
    const c = trouverCommunes(communes.liste, cherches);
    /* Mot à mot, au début des mots, comme les communes : la recherche tolérante aux fautes reste
       dans l'onglet « Élus ». Ici, « Melun » ne ramène pas « Mélin » ni « Meloni ». */
    const e = elus.liste.filter(x => correspond(cherches, x.cible));
    const s = scrutins.liste
      .filter(x => correspond(cherches, x.cible))
      .sort((a, b) => (b.d ?? "").localeCompare(a.d ?? ""));
    return { communes: c, elus: e, scrutins: s };
  }, [filtre, communes, elus, scrutins]);

  const nomDep = (insee: string) => {
    const code = departementDe(insee);
    const d = departements.find(x => x.code === code);
    return d && d.nom ? d.nom : `département ${code}`;
  };

  const ouvrirCommune = (insee: string, nom: string) => {
    const dep = departementDe(insee);
    if (!dep) return;
    choisir({ dep, insee, nom });
    /* Comme l'accueil : premier lancement sans profil -> les trois questions ; sinon la commune. */
    if (absent) router.replace("/bienvenue");
    else router.replace("/chez-vous");
  };

  const ouvrirElu = ({ cible, ...fiche }: Elu) => router.push({ pathname: "/annuaire-fiche", params: { ...fiche } });
  const ouvrirScrutin = (n: string) => router.push({ pathname: "/scrutins", params: { n } });
  /* L'accueil lit le paramètre « toutes » : il ouvre la liste complète des communes. */
  const voirToutes = () => router.navigate({ pathname: "/", params: { toutes: String(Date.now()) } });

  const tousCharges = [communes, elus, scrutins].every(x => x.etat !== EN_COURS);
  const rien = resultats !== null && resultats.communes.length + resultats.elus.length + resultats.scrutins.length === 0;
  /* Une source en panne ne se tait pas : « aucun résultat » ne vaut que si toutes ont répondu. */
  const pannes = [communes.etat, elus.etat, scrutins.etat].some(e => e !== ETATS.SERVI && e !== EN_COURS);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: PAS * 4, gap: PAS * 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, minHeight: CIBLE + 8, borderRadius: 999, borderWidth: 1.5,
        borderColor: couleurs.trait, backgroundColor: couleurs.carte, paddingLeft: PAS * 4 }}>
        <Loupe couleur={couleurs.sourd} />
        <TextInput value={filtre} onChangeText={setFiltre} placeholder="Commune, élu ou scrutin"
          placeholderTextColor={couleurs.sourd} autoCorrect={false} autoCapitalize="none" autoFocus returnKeyType="search"
          accessibilityLabel="Rechercher une commune, un élu ou un scrutin"
          style={{ flex: 1, minHeight: CIBLE + 8, paddingHorizontal: PAS * 2, fontSize: 17, color: couleurs.encre }} />
      </View>

      {resultats === null ? (
        <View style={{ gap: PAS * 2 }}>
          <Text style={TYPO.corps}>Tapez le nom d'une commune, d'un élu ou d'un scrutin.</Text>
          <Text style={TYPO.note}>
            Les communes publiées sont celles de la bêta (Île-de-France). Les élus publiés sont les députés et les exécutifs régionaux :
            l'onglet « Élus » dit ce qui n'y figure pas.
          </Text>
        </View>
      ) : null}

      {resultats !== null && rien && tousCharges ? (
        <View style={{ gap: PAS * 2 }}>
          <Vide titre={`Aucun résultat pour « ${filtre.trim()} ».`} action="Voir toutes les communes" onAction={voirToutes} />
          {pannes ? <Text style={TYPO.note}>Une source n'a pas répondu (voir plus haut) : ce résultat peut être incomplet.</Text> : null}
        </View>
      ) : null}

      {resultats !== null && (resultats.communes.length > 0 || communes.etat !== ETATS.SERVI) ? (
        <Section titre="Communes" source={communes.etat} total={resultats.communes.length}>
          {resultats.communes.slice(0, PAR_SECTION).map(([insee, nom]: Ligne) => (
            <Resultat key={insee} etiquette={`Commune : ${nom}, ${nomDep(insee)}. Choisir cette commune.`}
              titre={nom} detail={nomDep(insee)} onPress={() => ouvrirCommune(insee, nom)} />
          ))}
        </Section>
      ) : null}

      {resultats !== null && (resultats.elus.length > 0 || elus.etat !== ETATS.SERVI) ? (
        <Section titre="Élus" source={elus.etat} total={resultats.elus.length}>
          {resultats.elus.slice(0, PAR_SECTION).map(f => (
            <Resultat key={f.id} etiquette={`${f.nom}, ${f.fonction}, ${f.lieu}. Ouvrir la fiche.`}
              titre={f.nom} detail={`${f.fonction} · ${f.lieu}`} onPress={() => ouvrirElu(f)} />
          ))}
        </Section>
      ) : null}

      {resultats !== null && (resultats.scrutins.length > 0 || scrutins.etat !== ETATS.SERVI) ? (
        <Section titre="Scrutins" source={scrutins.etat} total={resultats.scrutins.length}>
          {resultats.scrutins.slice(0, PAR_SECTION).map(x => (
            <Resultat key={x.n} etiquette={`Scrutin n°${x.n}, ${x.d ? dateFr(x.d) : "date non fournie"}. Ouvrir le scrutin.`}
              titre={titreLisible(x.t)} detail={`${x.d ? dateFr(x.d) : "Date non fournie"} · n° ${x.n}`} onPress={() => ouvrirScrutin(x.n)} />
          ))}
        </Section>
      ) : null}
    </ScrollView>
  );
}
