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
import { Bouton, Carte, LienAction, Texte, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { Marque } from "../ui/marque";
import { feuille, couleurs, CIBLE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";

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
  /* Champ actif : la recherche passe en haut (16/10/2026). Mesure a 375 x 667 : le
     slogan et la promesse restaient au-dessus du champ ; avec le clavier ouvert
     (~260 pt), les resultats tombaient dessous. */
  const [actif, setActif] = useState(false);
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
  const enRecherche = actif || cherches.length > 0;
  /* Une commune francilienne reellement publiee, pour voir l'application hors couverture. */
  const exemple = communes.find(([insee]) => insee === "77284");
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
            {/* Le logo en grand sur l'ecran d'accueil (16/10/2026) : etait le mot seul, en petit. */}
            <View style={{ marginBottom: enRecherche ? 0 : PAS * 3 }}>{enRecherche ? <Marque /> : <Marque grande />}</View>
            {/* CE QU'EST REPERE, EN UNE PHRASE ; POURQUOI C'EST UTILE, EN UNE LIGNE. Replie
                pendant la recherche : le lecteur l'a deja lu, il cherche sa commune. */}
            {enRecherche ? null : (
              <>
                <Text style={TYPO.affiche} accessibilityRole="header">Ce qui se passe chez vous, expliqué simplement.</Text>
                <Text style={s.promesse}>Qui décide, où va l'argent, ce qu'a voté votre député, ce qui arrive. Chaque chiffre avec sa source officielle.</Text>
              </>
            )}
            {retenue && nomRetenue && !enRecherche ? (
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
              onFocus={() => setActif(true)}
              onBlur={() => setActif(false)}
              placeholder="Bagnolet, Créteil, Meaux…"
              placeholderTextColor={couleurs.sourd}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              accessibilityLabel="Où habitez-vous ? Tapez le nom de votre commune"
              accessibilityLabelledBy="question"
              style={s.champ}
            />
            <LienAction texte="Vous avez moins de 18 ans ?" etiquette="Vous avez moins de 18 ans ? Lire les repères utiles"
              onPress={() => router.push("/avant-18")} />
            {etat !== ETATS.SERVI && phrase ? (
              <Vide titre={phrase.titre} corps={phrase.corps}
                action={etat === ETATS.EN_COURS ? undefined : "Réessayer"} onAction={() => setEssai(n => n + 1)} />
            ) : null}
            {etat === ETATS.SERVI && !cherches.length ? (
              <>
                <Text style={s.note}>{`La bêta couvre les ${communes.length.toLocaleString("fr-FR")} communes d'Île\u2011de\u2011France qui ont une fiche.`}</Text>
                {/* CE QUE REPERE SAIT DE VOUS : rien, en une ligne (16/10/2026, audit
                    Lovable). L'explication technique (fichier public de tout le
                    departement, commune gardee seulement sur demande) passe dans
                    « Sources », section « Ce que Repère sait de vous » : elle reste vraie
                    et trouvable, sans peser sur le premier ecran. */}
                <Text style={[s.note, { color: couleurs.encre }]}>Pas de compte, pas d'e-mail : Repère ne sait pas qui vous êtes.</Text>
              </>
            ) : null}
            {manquante ? (
              <Vide titre={`${manquante[1]} existe bien en Île-de-France : c'est nous qui n'avons pas encore sa fiche.`}
                corps="Le Répertoire national des élus ne porte aucune ligne pour cette commune. Ce n'est pas une erreur de votre part, et ce n'est pas la preuve que la commune n'existe pas." />
            ) : null}
            {rien ? (
              /* 08/10/2026 : « Rien ne correspond » laissait croire que la commune
                 n'existe pas. L'application ne couvre que l'Ile-de-France pendant la
                 beta : c'est une limite de couverture, pas une absence de donnees. */
              /* 16/10/2026 (audit Lovable) : un exemple, seulement si Meaux est dans la liste
                 publiee, et dit comme tel ; le choix n'est fait que si le lecteur touche le
                 bouton, et rien ne laisse croire que sa commune est couverte. */
              <Vide titre={`Aucune commune d'Île-de-France ne correspond à « ${filtre.trim()} ».`}
                corps="Pendant la bêta, l'application ne couvre que l'Île-de-France : pour une commune d'ailleurs, les données ne sont pas encore disponibles ici. Sinon, vérifiez l'orthographe du début du nom."
                action={exemple ? `Voir un exemple\u00a0: ${exemple[1]}` : undefined}
                onAction={exemple ? () => ouvrir(exemple[0], exemple[1]) : undefined} />
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
            {/* Le nom d'abord, le departement dessous (16/10/2026) : a droite, il
                coupait les noms longs (« Montceaux-lès- / Meaux », capture 375 px). */}
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.resultatNom}>{nom}</Text>
              <Text style={s.resultatDep}>{nomDep(departementDe(insee) || "")}</Text>
            </View>
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const s = feuille(() => StyleSheet.create({
  page: { paddingHorizontal: PAS * 4, gap: PAS * 2, maxWidth: 640, width: "100%", alignSelf: "center" },
  tete: { gap: PAS * 3, marginBottom: PAS * 2 },
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
    paddingHorizontal: PAS * 4, paddingVertical: PAS * 2, borderRadius: RAYON.bloc, backgroundColor: couleurs.carte,
  },
  pastille: { width: 10, height: 10, borderRadius: 5, backgroundColor: couleurs.ville },
  resultatNom: { fontSize: 17, lineHeight: 22, color: couleurs.encre, fontWeight: "600" },
  resultatDep: { fontSize: 14, lineHeight: 19, color: couleurs.sourd },
}));
