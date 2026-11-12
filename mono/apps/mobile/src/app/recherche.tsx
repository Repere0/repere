/* RECHERCHE GLOBALE — une question, un champ (V37, bloc 3, 31/10/2026).
 *
 * Ouverte par la loupe de l'accueil, en feuille qui monte. Trois sections, dans cet ordre :
 *   - Communes : la liste publiée (bêta, Île-de-France), recherche et ordre du site (trouverCommunes) ;
 *   - Élus : la liste de l'onglet « Élus » (députés, exécutifs régionaux), recherche tolérante aux fautes ;
 *   - Scrutins : titre et date, comme l'écran « Scrutins publics ».
 * Chaque résultat ouvre sa fiche. Aucune donnée nouvelle : chaque lecture est celle d'un écran existant,
 * mise en mémoire pour la session (lib/donnees). Ce qui n'est pas cherché ici : les maires et les
 * conseillers, rangés par département (l'onglet « Élus » le dit). */
import { CarteListe, Puces } from "../ui/donnees";
import { SquelettesListe } from "../ui/squelette";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { correspond, dateFr, departementDe, motsCible, motsRecherche, themesDuTexte, titreLisible, trouverCommunes } from "@repere/core";
import { chargerCommunesBeta, chargerIndex, chargerQuestionsGouvernementIndex, chargerScrutinsIndex, ETATS, PHRASES } from "../lib/donnees";
import { chargerFiches } from "../lib/annuaire";
import { useSelection } from "../lib/selection";
import { useProfil } from "../lib/profil";
import { Vide } from "../lib/composants";
import { couleurs, CIBLE, PAS, RAYON, TYPO } from "../lib/theme";
import { Loupe } from "../ui/loupe";
import { ChipsThemes } from "../ui/chips-themes";
import type { Fiche } from "../types/annuaire";

/* Au plus cette quantité par section : le lecteur affine plutôt que de faire défiler une liste de mille lignes. */
const PAR_SECTION = 8;

type Ligne = [string, string, string[]]; /* [code INSEE, nom, mots de recherche] : la forme de trouverCommunes */
type Elu = Fiche & { cible: string[] };
type Scrutin = { n: string; t: string; d?: string; cible: string[] };
type Question = { uid: string; n: string; d?: string; ministere: string | null; auteur?: { nom?: string | null }; cible: string[] };
type Charge<T> = { etat: string; liste: T[] };
type Departement = { code: string; nom?: string };

const EN_COURS = ETATS.EN_COURS as string;

/* 07/11/2026 : un résultat est une carte de liste (icône de sa catégorie, pression, chevron). */
function Resultat({ etiquette, titre, detail, onPress, icone }: { etiquette: string; titre: string; detail: string; onPress: () => void; icone: keyof typeof Ionicons.glyphMap }) {
  return (
    <CarteListe onPress={onPress} etiquette={etiquette} titre={titre} icone={icone}>
      <Text style={TYPO.note}>{detail}</Text>
    </CarteListe>
  );
}

/* Une section : son titre, et soit ses résultats, soit l'état de sa source (chargement ou panne). */
function Section({ titre, source, total, children }: { titre: string; source: string; total: number; children: React.ReactNode }) {
  const phrase = PHRASES[source as keyof typeof PHRASES] as { titre: string } | undefined;
  return (
    <View style={{ gap: PAS * 2 }}>
      <Text style={TYPO.etiquette} accessibilityRole="header">{titre}{source === ETATS.SERVI && total ? ` · ${total}` : ""}</Text>
      {source === EN_COURS ? <SquelettesListe n={2} hauteur={64} /> : null}
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
  /* 12/11/2026 (porteur) : un thème, choisi sur l'accueil ou ici, filtre les scrutins et les questions. */
  const params = useLocalSearchParams<{ theme?: string }>();
  const [theme, setTheme] = useState<string | null>(params.theme ?? null);
  const [questions, setQuestions] = useState<Charge<Question>>({ etat: EN_COURS, liste: [] });
  /* Le focus se lit sur la pastille entière (filet en encre), pas sur un rectangle dans la pastille. */
  const [focus, setFocus] = useState(false);
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
    chargerQuestionsGouvernementIndex().then(r => {
      if (!vivant) return;
      const q = r.donnees as { questions: { uid: string; n: string; d?: string; ministere: string | null; auteur?: { nom?: string | null } }[] } | null;
      setQuestions({ etat: q ? ETATS.SERVI : r.etat, liste: q ? q.questions.map(x => ({ ...x, cible: motsCible(`${x.auteur?.nom ?? ""} ${x.ministere ?? ""}`) })) : [] });
    });
    return () => { vivant = false; };
  }, []);

  const cherches = motsRecherche(filtre);
  const resultats = useMemo(() => {
    if (!cherches.length && !theme) return null;
    /* Un thème est un rangement par mots-clés des TITRES (core/themes.js) : il ne s'applique ni aux communes ni aux
       élus, qui ne sont pas rangés par thème. Avec un thème, seuls les scrutins et les questions sont montrés. */
    const duTheme = (texte: string) => !theme || (themesDuTexte(texte) as string[]).includes(theme);
    const c = theme ? [] : trouverCommunes(communes.liste, cherches);
    /* Mot à mot, au début des mots, comme les communes : la recherche tolérante aux fautes reste
       dans l'onglet « Élus ». Ici, « Melun » ne ramène pas « Mélin » ni « Meloni ». */
    const e = theme ? [] : elus.liste.filter(x => correspond(cherches, x.cible));
    const s = scrutins.liste
      .filter(x => duTheme(titreLisible(x.t)) && (!cherches.length || correspond(cherches, x.cible)))
      .sort((a, b) => (b.d ?? "").localeCompare(a.d ?? ""));
    const q = theme ? questions.liste
      .filter(x => duTheme(x.ministere ?? "") && (!cherches.length || correspond(cherches, x.cible)))
      .sort((a, b) => (b.d ?? "").localeCompare(a.d ?? "")) : [];
    return { communes: c, elus: e, scrutins: s, questions: q };
  }, [filtre, theme, communes, elus, scrutins, questions]);

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

  const tousCharges = [communes, elus, scrutins, questions].every(x => x.etat !== EN_COURS);
  const rien = resultats !== null && resultats.communes.length + resultats.elus.length + resultats.scrutins.length + resultats.questions.length === 0;
  /* Une source en panne ne se tait pas : « aucun résultat » ne vaut que si toutes ont répondu. */
  const pannes = [communes.etat, elus.etat, scrutins.etat, questions.etat].some(e => e !== ETATS.SERVI && e !== EN_COURS);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: couleurs.sol }} keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: PAS * 4, gap: PAS * 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2, minHeight: CIBLE + 8, borderRadius: 999, borderWidth: 1.5,
        borderColor: focus ? couleurs.encre : couleurs.trait, backgroundColor: couleurs.carte, paddingLeft: PAS * 4 }}>
        <Loupe couleur={couleurs.sourd} />
        <TextInput value={filtre} onChangeText={setFiltre} placeholder="Commune, élu ou scrutin"
          placeholderTextColor={couleurs.sourd} autoCorrect={false} autoCapitalize="none" autoFocus returnKeyType="search"
          accessibilityLabel="Rechercher une commune, un élu ou un scrutin"
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{ flex: 1, minHeight: CIBLE + 8, paddingHorizontal: PAS * 2, fontSize: 17, color: couleurs.encre, outlineStyle: "none" } as object} />
      </View>

      <ChipsThemes actif={theme} choisir={setTheme} />
      {theme ? (
        <Text style={TYPO.note}>Thème « {theme} » : les scrutins et les questions au Gouvernement dont le titre ou le ministère en parle. Le rangement se fait par mots-clés : il peut oublier ou se tromper. Les communes et les élus ne sont pas rangés par thème.</Text>
      ) : null}

      {resultats === null ? (
        <View style={{ gap: PAS * 2 }}>
          <Text style={TYPO.corps}>Tapez le nom d'une commune, d'un élu ou d'un scrutin.</Text>
          <Puces items={[
            { icone: "location-outline", texte: "Les communes publiées sont celles de la bêta (Île-de-France)." },
            { icone: "people-outline", texte: "Les élus publiés sont les députés et les exécutifs régionaux : l'onglet « Élus » dit ce qui n'y figure pas." },
            { icone: "stats-chart-outline", texte: "Les scrutins sont ceux de l'Assemblée nationale publiés par Repère." },
          ]} />
        </View>
      ) : null}

      {resultats !== null && rien && tousCharges ? (
        <View style={{ gap: PAS * 2 }}>
          <Vide titre={filtre.trim() ? `Aucun résultat pour « ${filtre.trim()} »${theme ? ` dans le thème ${theme}` : ""}.` : `Aucun scrutin ni question pour le thème « ${theme} » dans les données publiées.`} action="Voir toutes les communes" onAction={voirToutes} />
          {pannes ? <Text style={TYPO.note}>Une source n'a pas répondu (voir plus haut) : ce résultat peut être incomplet.</Text> : null}
        </View>
      ) : null}

      {resultats !== null && (resultats.communes.length > 0 || communes.etat !== ETATS.SERVI) ? (
        <Section titre="Communes" source={communes.etat} total={resultats.communes.length}>
          {resultats.communes.slice(0, PAR_SECTION).map(([insee, nom]: Ligne) => (
            <Resultat key={insee} icone="location-outline" etiquette={`Commune : ${nom}, ${nomDep(insee)}. Choisir cette commune.`}
              titre={nom} detail={nomDep(insee)} onPress={() => ouvrirCommune(insee, nom)} />
          ))}
        </Section>
      ) : null}

      {resultats !== null && (resultats.elus.length > 0 || elus.etat !== ETATS.SERVI) ? (
        <Section titre="Élus" source={elus.etat} total={resultats.elus.length}>
          {resultats.elus.slice(0, PAR_SECTION).map(f => (
            <Resultat key={f.id} icone="person-outline" etiquette={`${f.nom}, ${f.fonction}, ${f.lieu}. Ouvrir la fiche.`}
              titre={f.nom} detail={`${f.fonction} · ${f.lieu}`} onPress={() => ouvrirElu(f)} />
          ))}
        </Section>
      ) : null}

      {resultats !== null && (resultats.scrutins.length > 0 || scrutins.etat !== ETATS.SERVI) ? (
        <Section titre="Scrutins" source={scrutins.etat} total={resultats.scrutins.length}>
          {resultats.scrutins.slice(0, PAR_SECTION).map(x => (
            <Resultat key={x.n} icone="stats-chart-outline" etiquette={`Scrutin n°${x.n}, ${x.d ? dateFr(x.d) : "date non fournie"}. Ouvrir le scrutin.`}
              titre={titreLisible(x.t)} detail={`${x.d ? dateFr(x.d) : "Date non fournie"} · n° ${x.n}`} onPress={() => ouvrirScrutin(x.n)} />
          ))}
        </Section>
      ) : null}

      {resultats !== null && theme && (resultats.questions.length > 0 || questions.etat !== ETATS.SERVI) ? (
        <Section titre="Questions au Gouvernement" source={questions.etat} total={resultats.questions.length}>
          {resultats.questions.slice(0, PAR_SECTION).map(x => (
            <Resultat key={x.uid} icone="chatbubbles-outline" etiquette={`Question n°${x.n}, ${x.d ? dateFr(x.d) : "date non fournie"}, ${x.ministere ?? "ministère non précisé"}. Ouvrir la question.`}
              titre={x.ministere ?? "Ministère non précisé"} detail={`${x.d ? dateFr(x.d) : "Date non fournie"} · ${x.auteur?.nom ?? "Auteur non identifié"} · n° ${x.n}`}
              onPress={() => router.push({ pathname: "/scrutins", params: { mode: "qag", question: x.uid } })} />
          ))}
        </Section>
      ) : null}
    </ScrollView>
  );
}
