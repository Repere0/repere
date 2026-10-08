/* OUVERTURE ET CHOIX DE LA COMMUNE — 29/09/2026.
 *
 * Une question, un champ. La liste des communes de la beta (Ile-de-France)
 * arrive en un fichier ; la recherche et l'ordre des resultats sont ceux du
 * site, importes de @repere/core (trouverCommunes) : la meme saisie donne les
 * memes communes sur les deux supports. Les phrases de vide sont celles du
 * site, mot pour mot. */
import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { mots, motsCible, correspond, trouverCommunes, departementDe } from "@repere/core";
import { chargerCommunesBeta, chargerIndex, ETATS, PHRASES } from "../lib/donnees";
import { Bouton, Carte, Texte, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { couleurs, CIBLE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";

type Ligne = [string, string, string[]];
type Beta = { communes: Record<string, string>; manquantes?: Record<string, string>; source?: { producteur?: string } };
type Index = { departements: { code: string; nom?: string }[] };

export default function Accueil() {
  const marges = useSafeAreaInsets();
  const { choisir, retenue, oublier } = useSelection();
  const [etat, setEtat] = useState<string>(ETATS.EN_COURS);
  const [beta, setBeta] = useState<Beta | null>(null);
  const [index, setIndex] = useState<Index | null>(null);
  const [filtre, setFiltre] = useState("");
  const [essai, setEssai] = useState(0);

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

  const communes = useMemo<Ligne[]>(
    () => (beta ? Object.entries(beta.communes).map(([insee, nom]) => [insee, nom, motsCible(nom)]) : []),
    [beta],
  );
  const manquantes = useMemo<Ligne[]>(
    () => (beta && beta.manquantes ? Object.entries(beta.manquantes).map(([insee, nom]) => [insee, nom, motsCible(nom)]) : []),
    [beta],
  );
  const cherches = mots(filtre);
  const trouvees = trouverCommunes(communes, cherches) as Ligne[];
  const manquante = cherches.length ? manquantes.find(([, , c]) => correspond(cherches, c)) : undefined;
  const rien = cherches.length > 0 && trouvees.length === 0 && !manquante;
  /* Le departement se lit par @repere/core (departementDe), comme sur le site :
     trois chiffres outre-mer (971...), deux ailleurs, 2A/2B en Corse. */
  const nomDep = (code: string) => {
    const d = index && index.departements.find(x => x.code === code);
    return d && d.nom ? d.nom : "département " + code;
  };

  const ouvrir = (insee: string, nom: string) => {
    const dep = departementDe(insee);
    if (!dep) return;
    choisir({ dep, insee, nom });
    router.push("/chez-vous");
  };

  /* La commune retenue sur ce telephone, si le lecteur l'a demande
     (lib/memoire.ts). Son nom vient de la liste publiee : si elle n'y figure
     plus, on ne propose rien plutot qu'un code nu. */
  const nomRetenue = retenue && beta ? beta.communes[retenue.c] : undefined;

  const phrase = PHRASES[etat as keyof typeof PHRASES] as { titre: string; corps: string; action?: string } | undefined;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        data={trouvees}
        keyExtractor={l => l[0]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.page, { paddingTop: marges.top + PAS * 6, paddingBottom: marges.bottom + PAS * 6 }]}
        ListHeaderComponent={
          <View style={s.tete}>
            <Text style={s.marque}>Repère</Text>
            {/* CE QU'EST REPERE, EN UNE PHRASE ; POURQUOI C'EST UTILE, EN UNE LIGNE */}
            <Text style={TYPO.affiche} accessibilityRole="header">Ce qui se passe chez vous, expliqué simplement.</Text>
            <Text style={s.promesse}>Qui décide, où va l'argent, ce qu'a voté votre député, ce qui arrive. Chaque chiffre avec sa source officielle.</Text>
            {retenue && nomRetenue ? (
              <Carte echelon="ville" titre="Votre commune, sur ce téléphone">
                <Texte fort>{nomRetenue}</Texte>
                <Bouton texte={`Voir ce qui se passe à ${nomRetenue}`} onPress={() => ouvrir(retenue.c, nomRetenue)} />
                <Bouton texte={`Oublier ${nomRetenue}`} discret onPress={oublier} />
              </Carte>
            ) : null}
            <Text style={s.question} nativeID="question">{retenue && nomRetenue ? "Une autre commune ?" : "Où habitez-vous ?"}</Text>
            <TextInput
              value={filtre}
              onChangeText={setFiltre}
              placeholder="Bagnolet, Créteil, Meaux…"
              placeholderTextColor={couleurs.sourd}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Où habitez-vous ? Tapez le nom de votre commune"
              accessibilityLabelledBy="question"
              style={s.champ}
            />
            {etat !== ETATS.SERVI && phrase ? (
              <Vide titre={phrase.titre} corps={phrase.corps}
                action={etat === ETATS.EN_COURS ? undefined : "Réessayer"} onAction={() => setEssai(n => n + 1)} />
            ) : null}
            {etat === ETATS.SERVI && !cherches.length ? (
              <>
                <Text style={s.note}>La bêta couvre les {communes.length} communes d'Île-de-France qui ont une fiche.</Text>
                {/* CE QUE REPERE SAIT DE VOUS : rien. Phrase vraie a la lettre :
                    les adresses se composent par departement (client.js), et la
                    commune n'est gardee que sur demande (lib/memoire.ts). */}
                <View style={s.confiance}>
                  <Text style={[s.note, { color: couleurs.encre, fontWeight: "600" }]}>Pas de compte, pas d'e-mail.</Text>
                  <Text style={s.note}>Repère ne sait pas qui vous êtes. Pour afficher votre commune, il télécharge le fichier public de tout votre département, et ne garde votre commune sur ce téléphone que si vous le lui demandez.</Text>
                </View>
              </>
            ) : null}
            {manquante ? (
              <Vide titre={`${manquante[1]} existe bien en Île-de-France : c'est nous qui n'avons pas encore sa fiche.`}
                corps="Le Répertoire national des élus ne porte aucune ligne pour cette commune. Ce n'est pas une erreur de votre part, et ce n'est pas la preuve que la commune n'existe pas." />
            ) : null}
            {rien ? (
              <Vide titre={`Rien ne correspond à « ${filtre.trim()} ».`}
                corps="Tapez le début du nom de votre commune. La bêta couvre pour l'instant l'Île-de-France." />
            ) : null}
          </View>
        }
        renderItem={({ item: [insee, nom] }) => (
          <Pressable
            onPress={() => ouvrir(insee, nom)}
            accessibilityRole="button"
            accessibilityLabel={`${nom}, ${nomDep(departementDe(insee) || "")}`}
            accessibilityHint="Ouvre ce qui se passe dans cette commune"
            style={({ pressed }) => [s.resultat, pressed && { backgroundColor: couleurs.voile }]}
          >
            <View style={s.pastille} />
            <Text style={s.resultatNom}>{nom}</Text>
            <Text style={s.resultatDep}>{nomDep(departementDe(insee) || "")}</Text>
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
  resultat: {
    minHeight: CIBLE + 8, flexDirection: "row", alignItems: "center", gap: PAS * 3,
    paddingHorizontal: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte,
  },
  pastille: { width: 10, height: 10, borderRadius: 5, backgroundColor: couleurs.ville },
  resultatNom: { flex: 1, fontSize: 17, color: couleurs.encre, fontWeight: "600" },
  resultatDep: { fontSize: 14, color: couleurs.sourd, flexShrink: 1, textAlign: "right" },
});
