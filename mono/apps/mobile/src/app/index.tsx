/* OUVERTURE ET CHOIX DE LA COMMUNE — 29/09/2026, chemin national le 06/10/2026.
 *
 * Une question, un champ. La liste des communes de la beta (Ile-de-France)
 * arrive en un fichier ; la recherche et l'ordre des resultats sont ceux du
 * site, importes de @repere/core (trouverCommunes) : la meme saisie donne les
 * memes communes sur les deux supports. Les phrases de vide sont celles du
 * site, mot pour mot.
 *
 * LE RESTE DE LA FRANCE (06/10/2026). Mesure en production : les 104
 * departements sont publies (elus, comptes, circonscriptions, votes), mais
 * « ustaritz » repondait « Rien ne correspond », parce que l'accueil ne
 * cherchait que dans la liste de l'Ile-de-France. Meme chemin que le site :
 * choisir son departement, puis sa commune dans le fichier de ce departement.
 * Aucune adresse ne porte un code de commune (invariant 2) : on telecharge le
 * fichier public du departement entier, comme pour l'Ile-de-France. Pas de
 * liste nationale des communes : elle n'est pas publiee, et ce chemin n'en a
 * pas besoin. */
import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { mots, motsCible, correspond, trouverCommunes, departementDe } from "@repere/core";
import { chargerCommunesBeta, chargerDepartement, chargerIndex, ETATS, PHRASES } from "../lib/donnees";
import { Bouton, Carte, Texte, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { couleurs, CIBLE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";

type Ligne = [string, string, string[]];
type Beta = { communes: Record<string, string>; manquantes?: Record<string, string>; source?: { producteur?: string } };
type Dep = { code: string; nom?: string; type?: string };
type Index = { departements: Dep[] };
type Paquet = { communes: Record<string, { nom: string }>; manquantes?: Record<string, string> };
/* « idf » : recherche directe ; « departements » : choisir le sien ;
   « departement » : chercher sa commune dans le departement choisi. */
type Mode = "idf" | "departements" | "departement";

const lignes = (o: Record<string, string> | undefined): Ligne[] =>
  o ? Object.entries(o).map(([insee, nom]) => [insee, nom, motsCible(nom)]) : [];

export default function Accueil() {
  const marges = useSafeAreaInsets();
  const { choisir, retenue, oublier } = useSelection();
  const [etat, setEtat] = useState<string>(ETATS.EN_COURS);
  const [beta, setBeta] = useState<Beta | null>(null);
  const [index, setIndex] = useState<Index | null>(null);
  const [filtre, setFiltre] = useState("");
  const [essai, setEssai] = useState(0);
  const [mode, setMode] = useState<Mode>("idf");
  const [depChoisi, setDepChoisi] = useState<string | null>(null);
  const [paquet, setPaquet] = useState<Paquet | null>(null);
  const [etatDep, setEtatDep] = useState<string>(ETATS.EN_COURS);
  const [essaiDep, setEssaiDep] = useState(0);
  const [nomRetenueHors, setNomRetenueHors] = useState<string | undefined>(undefined);

  useEffect(() => {
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    Promise.all([chargerCommunesBeta(), chargerIndex()]).then(([b, i]) => {
      if (!vivant) return;
      if (b.donnees) setBeta(b.donnees as Beta);
      if (i.donnees) setIndex(i.donnees as Index);
      setEtat(b.donnees ? ETATS.SERVI : b.etat);
    });
    return () => { vivant = false; };
  }, [essai]);

  /* Le fichier du departement choisi : un seul, celui que le lecteur a touche. */
  useEffect(() => {
    if (!depChoisi) return undefined;
    let vivant = true;
    setPaquet(null);
    setEtatDep(ETATS.EN_COURS);
    chargerDepartement(depChoisi).then(r => {
      if (!vivant) return;
      if (r.donnees) setPaquet(r.donnees as Paquet);
      setEtatDep(r.donnees ? ETATS.SERVI : r.etat);
    }).catch(() => { if (vivant) setEtatDep(ETATS.ECHEC); });
    return () => { vivant = false; };
  }, [depChoisi, essaiDep]);

  /* La commune retenue sur ce telephone, si le lecteur l'a demande
     (lib/memoire.ts). Son nom vient de la liste publiee : si elle n'y figure
     plus, on ne propose rien plutot qu'un code nu. Hors Ile-de-France, ce nom
     est lu dans le fichier de son departement — celui qu'on telechargerait de
     toute facon pour l'afficher. */
  const nomRetenueBeta = retenue && beta ? beta.communes[retenue.c] : undefined;
  useEffect(() => {
    if (!retenue || !beta || nomRetenueBeta) { setNomRetenueHors(undefined); return undefined; }
    let vivant = true;
    chargerDepartement(retenue.d).then(r => {
      const f = r.donnees && (r.donnees as Paquet).communes ? (r.donnees as Paquet).communes[retenue.c] : null;
      if (vivant) setNomRetenueHors(f && f.nom ? f.nom : undefined);
    }).catch(() => { /* rien a proposer : le lecteur retape sa commune */ });
    return () => { vivant = false; };
  }, [retenue, beta, nomRetenueBeta]);
  const nomRetenue = nomRetenueBeta || nomRetenueHors;

  const communesIdf = useMemo<Ligne[]>(() => lignes(beta ? beta.communes : undefined), [beta]);
  const manquantesIdf = useMemo<Ligne[]>(() => lignes(beta ? beta.manquantes : undefined), [beta]);
  const communesDep = useMemo<Ligne[]>(
    () => (paquet ? Object.entries(paquet.communes).map(([insee, f]) => [insee, f.nom, motsCible(f.nom)] as Ligne) : []),
    [paquet],
  );
  const manquantesDep = useMemo<Ligne[]>(() => lignes(paquet ? paquet.manquantes : undefined), [paquet]);

  const cherches = mots(filtre);
  const nomDep = (code: string) => {
    const d = index && index.departements.find(x => x.code === code);
    return d && d.nom ? d.nom : "département " + code;
  };
  const deps: Dep[] = index ? index.departements : [];
  /* Meme regle que le site (App.jsx) : le numero et le nom, sans accents. */
  const depsTrouves = cherches.length ? deps.filter(d => correspond(cherches, motsCible(d.code + " " + (d.nom || "")))) : deps;

  const enDep = mode === "departement";
  const liste = enDep ? communesDep : communesIdf;
  const trouvees = trouverCommunes(liste, cherches) as Ligne[];
  const manquante = cherches.length ? (enDep ? manquantesDep : manquantesIdf).find(([, , c]) => correspond(cherches, c)) : undefined;
  const rien = cherches.length > 0 && trouvees.length === 0 && !manquante;
  const ouLe = enDep && depChoisi ? nomDep(depChoisi) : "Île-de-France";

  const ouvrir = (insee: string, nom: string) => {
    choisir({ dep: departementDe(insee), insee, nom });
    router.push("/chez-vous");
  };
  const versDepartements = () => { setMode("departements"); setFiltre(""); };
  const choisirDep = (code: string) => { setDepChoisi(code); setMode("departement"); setFiltre(""); };
  const versIdf = () => { setMode("idf"); setDepChoisi(null); setFiltre(""); };

  const phrase = PHRASES[etat as keyof typeof PHRASES] as { titre: string; corps: string; action?: string } | undefined;
  const phraseDep = PHRASES[etatDep as keyof typeof PHRASES] as { titre: string; corps: string } | undefined;

  const question = mode === "departements" ? "Dans quel département ?"
    : enDep ? `Quelle commune, dans ${ouLe} ?`
    : retenue && nomRetenue ? "Une autre commune ?" : "Où habitez-vous ?";
  const etiquetteChamp = mode === "departements" ? "Dans quel département ? Tapez son nom ou son numéro"
    : `${question} Tapez le nom de votre commune`;

  const entete = (
    <View style={s.tete}>
      <Text style={s.marque}>Repère</Text>
      {/* CE QU'EST REPERE, EN UNE PHRASE ; POURQUOI C'EST UTILE, EN UNE LIGNE */}
      <Text style={TYPO.affiche} accessibilityRole="header">Ce qui se passe chez vous, expliqué simplement.</Text>
      <Text style={s.promesse}>Qui décide, où va l'argent, ce qu'a voté votre député, ce qui arrive. Chaque chiffre avec sa source officielle.</Text>
      {mode === "idf" && retenue && nomRetenue ? (
        <Carte echelon="ville" titre="Votre commune, sur ce téléphone">
          <Texte fort>{nomRetenue}</Texte>
          <Bouton texte={`Voir ce qui se passe à ${nomRetenue}`} onPress={() => ouvrir(retenue.c, nomRetenue)} />
          <Bouton texte={`Oublier ${nomRetenue}`} discret onPress={oublier} />
        </Carte>
      ) : null}
      {mode !== "idf" ? (
        <Pressable onPress={mode === "departement" ? versDepartements : versIdf} accessibilityRole="button"
          accessibilityLabel={mode === "departement" ? `Changer de département, département actuel : ${ouLe}` : "Revenir à la recherche en Île-de-France"}
          style={({ pressed }) => [s.retourMode, pressed && { opacity: 0.6 }]}>
          <Text style={s.lien}>‹ {mode === "departement" ? "Changer de département" : "Recherche en Île-de-France"}</Text>
        </Pressable>
      ) : null}
      <Text style={s.question} nativeID="question">{question}</Text>
      <TextInput
        value={filtre}
        onChangeText={setFiltre}
        placeholder={mode === "departements" ? "Pyrénées-Atlantiques, 64, Réunion…" : enDep ? "Le début du nom…" : "Bagnolet, Créteil, Meaux…"}
        placeholderTextColor={couleurs.sourd}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={etiquetteChamp}
        accessibilityLabelledBy="question"
        style={s.champ}
      />
      {etat !== ETATS.SERVI && phrase ? (
        <Vide titre={phrase.titre} corps={phrase.corps}
          action={etat === ETATS.EN_COURS ? undefined : "Réessayer"} onAction={() => setEssai(n => n + 1)} />
      ) : null}
      {enDep && etatDep !== ETATS.SERVI && phraseDep ? (
        <Vide titre={phraseDep.titre} corps={phraseDep.corps}
          action={etatDep === ETATS.EN_COURS ? undefined : "Réessayer"} onAction={() => setEssaiDep(n => n + 1)} />
      ) : null}
      {mode === "idf" && etat === ETATS.SERVI && !cherches.length ? (
        <>
          <Text style={s.note}>Recherche directe parmi les {communesIdf.length} communes d'Île-de-France qui ont une fiche. Ailleurs en France, choisissez d'abord votre département.</Text>
          {/* CE QUE REPERE SAIT DE VOUS : rien. Phrase vraie a la lettre :
              les adresses se composent par departement (client.js), et la
              commune n'est gardee que sur demande (lib/memoire.ts). */}
          <View style={s.confiance}>
            <Text style={[s.note, { color: couleurs.encre, fontWeight: "600" }]}>Pas de compte, pas d'e-mail.</Text>
            <Text style={s.note}>Repère ne sait pas qui vous êtes. Pour afficher votre commune, il télécharge le fichier public de tout votre département, et ne garde votre commune sur ce téléphone que si vous le lui demandez.</Text>
          </View>
        </>
      ) : null}
      {mode === "departements" && cherches.length > 0 && depsTrouves.length === 0 ? (
        <Vide titre={`Aucun département publié ne correspond à « ${filtre.trim()} ».`}
          corps={`Repère publie ${deps.length} départements et collectivités d'outre-mer. Essayez le début du nom, ou le numéro.`} />
      ) : null}
      {mode !== "departements" && manquante ? (
        <Vide titre={`${manquante[1]} existe bien ${enDep ? "dans ce département" : "en Île-de-France"} : c'est nous qui n'avons pas encore sa fiche.`}
          corps="Le Répertoire national des élus ne porte aucune ligne pour cette commune. Ce n'est pas une erreur de votre part, et ce n'est pas la preuve que la commune n'existe pas." />
      ) : null}
      {mode !== "departements" && rien && (!enDep || etatDep === ETATS.SERVI) ? (
        <Vide titre={enDep ? `Aucune commune de ${ouLe} ne correspond à « ${filtre.trim()} ».` : `Aucune commune d'Île-de-France ne correspond à « ${filtre.trim()} ».`}
          corps={enDep ? "Tapez le début du nom de votre commune, ou changez de département." : "Votre commune est peut-être ailleurs en France : choisissez d'abord son département."}
          action={enDep ? undefined : "Choisir mon département"} onAction={enDep ? undefined : versDepartements} />
      ) : null}
    </View>
  );

  /* Hors de la recherche directe, le chemin vers le reste de la France reste a
     portee de doigt sous les resultats : une commune hors Ile-de-France ne
     doit jamais sembler inconnue parce qu'un homonyme francilien s'affiche. */
  const pied = mode === "idf" && etat === ETATS.SERVI && !rien ? (
    <Pressable onPress={versDepartements} accessibilityRole="button" accessibilityLabel="Votre commune n'est pas en Île-de-France ? Choisir votre département"
      style={({ pressed }) => [s.resultat, s.versFrance, pressed && { backgroundColor: couleurs.voile }]}>
      <Text style={[s.resultatNom, { color: couleurs.lien }]}>Pas en Île-de-France ? Choisir votre département</Text>
      <Text style={[s.lien]} accessibilityElementsHidden importantForAccessibility="no">›</Text>
    </Pressable>
  ) : null;

  if (mode === "departements") {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <FlatList
          data={depsTrouves}
          keyExtractor={d => d.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[s.page, { paddingTop: marges.top + PAS * 6, paddingBottom: marges.bottom + PAS * 6 }]}
          ListHeaderComponent={entete}
          renderItem={({ item: d }) => (
            <Pressable onPress={() => choisirDep(d.code)} accessibilityRole="button"
              accessibilityLabel={`${d.nom || "département " + d.code}, ${d.code}`}
              accessibilityHint="Ouvre la liste des communes de ce département"
              style={({ pressed }) => [s.resultat, pressed && { backgroundColor: couleurs.voile }]}>
              <Text style={s.resultatNom}>{d.nom || "département " + d.code}</Text>
              <Text style={s.resultatDep}>{d.code}</Text>
            </Pressable>
          )}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        data={trouvees}
        keyExtractor={l => l[0]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.page, { paddingTop: marges.top + PAS * 6, paddingBottom: marges.bottom + PAS * 6 }]}
        ListHeaderComponent={entete}
        ListFooterComponent={pied}
        renderItem={({ item: [insee, nom] }) => (
          <Pressable
            onPress={() => ouvrir(insee, nom)}
            accessibilityRole="button"
            accessibilityLabel={`${nom}, ${nomDep(departementDe(insee))}`}
            accessibilityHint="Ouvre ce qui se passe dans cette commune"
            style={({ pressed }) => [s.resultat, pressed && { backgroundColor: couleurs.voile }]}
          >
            <View style={s.pastille} />
            <Text style={s.resultatNom}>{nom}</Text>
            <Text style={s.resultatDep}>{nomDep(departementDe(insee))}</Text>
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { paddingHorizontal: PAS * 4, gap: PAS * 2, maxWidth: 640, width: "100%", alignSelf: "center" },
  tete: { gap: PAS * 3, marginBottom: PAS * 2 },
  marque: { fontFamily: POLICE.affiche, fontSize: 22, color: couleurs.ville, marginBottom: PAS * 4 },
  confiance: { gap: PAS, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.voile, marginTop: PAS * 2 },
  promesse: { fontSize: 17, lineHeight: 24, color: couleurs.encre },
  question: { fontFamily: POLICE.titre, fontSize: 24, lineHeight: 30, color: couleurs.encre, marginTop: PAS * 6 },
  champ: {
    minHeight: CIBLE + 8, borderRadius: RAYON.bloc, borderWidth: 1.5, borderColor: couleurs.trait,
    backgroundColor: couleurs.carte, paddingHorizontal: PAS * 4, fontSize: 18, color: couleurs.encre,
    /* Sur l'export web, le contour de focus par defaut du navigateur est orange :
       une sixieme couleur (invariant 7). Le focus reste visible, dans la couleur
       de la commune. Sans effet sur iOS et Android. */
    ...(Platform.OS === "web" ? { outlineColor: couleurs.ville, outlineWidth: 2, outlineStyle: "solid" } : {}),
  },
  note: { fontSize: 15, color: couleurs.sourd },
  lien: { fontSize: 16, fontWeight: "700", color: couleurs.lien },
  retourMode: { alignSelf: "flex-start", minHeight: CIBLE, justifyContent: "center", marginTop: PAS * 2 },
  resultat: {
    minHeight: CIBLE + 8, flexDirection: "row", alignItems: "center", gap: PAS * 3,
    paddingHorizontal: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte,
  },
  versFrance: { marginTop: PAS * 2, borderWidth: 1, borderColor: couleurs.trait },
  pastille: { width: 10, height: 10, borderRadius: 5, backgroundColor: couleurs.ville },
  resultatNom: { flex: 1, fontSize: 17, color: couleurs.encre, fontWeight: "600" },
  resultatDep: { fontSize: 14, color: couleurs.sourd, flexShrink: 1, textAlign: "right" },
});
