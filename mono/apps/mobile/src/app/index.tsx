/* OUVERTURE ET CHOIX DE LA COMMUNE — 29/09/2026.
 *
 * Une question, un champ. La liste des communes de la beta (Ile-de-France)
 * arrive en un fichier ; la recherche et l'ordre des resultats sont ceux du
 * site, importes de @repere/core (trouverCommunes) : la meme saisie donne les
 * memes communes sur les deux supports. Les phrases de vide sont celles du
 * site, mot pour mot.
 *
 * 30/10/2026 — REFONTE VISUELLE A TITRE D'ESSAI (direction artistique, sombre).
 * Les cartes du haut sont STATIQUES et glissent horizontalement : Melun (77288),
 * son chiffre par habitant 2025 (OFGL) et son dernier vote (député 77-1, scrutin
 * 8706). Valeurs verifiees dans data/ le 30/10/2026, figees dans le code.
 * Le partage d'image : src/ui/partage (carte 9:16, feuille de partage native). */
import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { mots, motsCible, correspond, trouverCommunes, departementDe, titreLisible } from "@repere/core";
import { chargerCommunesBeta, chargerIndex, ETATS, PHRASES } from "../lib/donnees";
import { Bouton, Carte, Texte, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { feuille, CIBLE, PAS, POLICE, RAYON } from "../lib/theme";
import { ECHELONS_PAR_MODE, NEUTRES_PAR_MODE } from "../lib/palette";
import { groupeDe } from "../lib/groupes";
import { MSG_CHIFFRE, MSG_VOTE, VOTE } from "../ui/partage/donnees";
import { usePartageStory } from "../ui/partage/use-partage-story";
import { ChiffreStory } from "../ui/partage/variantes/chiffre.story";
import { VoteStory } from "../ui/partage/variantes/vote.story";

/* L'accueil est sombre : il lit la palette sombre, quel que soit le choix d'affichage. */
const D = NEUTRES_PAR_MODE.sombre;
const E = ECHELONS_PAR_MODE.sombre;

function BoutonPartager({ etiquette, onPress }: { etiquette: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiquette}
      style={({ pressed }) => [s.partager, pressed && { opacity: 0.7 }]}>
      <Text style={s.partagerTexte}>Partager</Text>
    </Pressable>
  );
}

type Ligne = [string, string, string[]];
type Beta = { communes: Record<string, string>; manquantes?: Record<string, string>; source?: { producteur?: string } };
type Index = { departements: { code: string; nom?: string }[] };

export default function Accueil() {
  const marges = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { choisir, retenue, oublier } = useSelection();
  const [etat, setEtat] = useState<string>(ETATS.EN_COURS);
  const [beta, setBeta] = useState<Beta | null>(null);
  const [index, setIndex] = useState<Index | null>(null);
  const [filtre, setFiltre] = useState("");
  const [cherche, setCherche] = useState(false);
  const [page, setPage] = useState(0);
  const [essai, setEssai] = useState(0);
  const partageChiffre = usePartageStory(MSG_CHIFFRE);
  const partageVote = usePartageStory(MSG_VOTE);
  /* Une carte occupe toute la largeur de lecture ; la suivante commence apres un ecart. */
  const larg = Math.min(width, 640) - PAS * 8;
  const pas = larg + PAS * 3;

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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: D.sol }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        data={trouvees}
        keyExtractor={l => l[0]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.page, { paddingTop: marges.top + PAS * 6, paddingBottom: marges.bottom + PAS * 6 }]}
        ListHeaderComponent={
          <View style={s.tete}>
            <View style={s.haut}>
              <Text style={s.marque}>Repère</Text>
              {!cherche && !filtre ? (
                <Pressable onPress={() => setCherche(true)} accessibilityRole="button" accessibilityLabel="Chercher une commune"
                  style={({ pressed }) => [s.chercher, pressed && { opacity: 0.7 }]}>
                  <Text style={s.chercherTexte}>Chercher une commune</Text>
                </Pressable>
              ) : null}
            </View>
            {/* CE QU'EST REPERE, EN UNE PHRASE ; POURQUOI C'EST UTILE, EN UNE LIGNE */}
            <Text style={s.titre} accessibilityRole="header">Ce qui se passe chez vous.</Text>
            <Text style={s.promesse}>Qui décide, où va l'argent, ce qu'a voté votre député, ce qui arrive. Chaque chiffre avec sa source officielle.</Text>

            {/* Les cartes glissent horizontalement : le chiffre, puis le vote. */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={pas}
              contentContainerStyle={{ gap: PAS * 3 }}
              onMomentumScrollEnd={e => setPage(Math.round(e.nativeEvent.contentOffset.x / pas))}>
              <View style={{ width: larg }}>
                <View style={s.carte}>
                  <Text style={s.etiquette}>Le chiffre du jour</Text>
                  <Text style={s.carteTitre}>L'argent de Melun</Text>
                  <Text style={s.chiffre}>2 495 €</Text>
                  <Text style={s.legende}>dépensés par habitant en 2025 · source : OFGL</Text>
                  <BoutonPartager etiquette="Partager le chiffre de Melun"
                    onPress={partageChiffre.partager} />
                </View>
              </View>
              <View style={{ width: larg }}>
                <View style={s.carte}>
                  <Text style={s.etiquette}>Dernier vote enregistré</Text>
                  <Text style={s.carteTitre}>Arnaud Saint-Martin</Text>
                  {/* Groupe inconnu ici : badge gris, aucune couleur de parti (ADR 0001). */}
                  <View style={s.badge}><Text style={s.badgeTexte}>Groupe : {groupeDe(VOTE.acteur)}</Text></View>
                  <Text style={s.legende}>Député de la 1re circonscription de Seine-et-Marne</Text>
                  <Text style={s.vote}>S'est abstenu</Text>
                  <Text style={s.legende}>13 octobre 2026 · {titreLisible(VOTE.titre)}</Text>
                  <BoutonPartager etiquette="Partager le vote d'Arnaud Saint-Martin"
                    onPress={partageVote.partager} />
                </View>
              </View>
            </ScrollView>
            <View style={s.points} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {[0, 1].map(i => <View key={i} style={[s.point, page === i && s.pointActif]} />)}
            </View>

            {retenue && nomRetenue ? (
              <Carte echelon="ville" titre="Votre commune, sur ce téléphone">
                <Texte fort>{nomRetenue}</Texte>
                <Bouton texte={`Voir ce qui se passe à ${nomRetenue}`} onPress={() => ouvrir(retenue.c, nomRetenue)} />
                <Bouton texte={`Oublier ${nomRetenue}`} discret onPress={oublier} />
              </Carte>
            ) : null}
            {cherche || filtre ? (
              <>
                <Text style={s.question} nativeID="question">{retenue && nomRetenue ? "Une autre commune ?" : "Où habitez-vous ?"}</Text>
                <TextInput
                  value={filtre}
                  onChangeText={setFiltre}
                  placeholder="Tapez votre ville (ex: Melun...)"
                  placeholderTextColor={D.sourd}
                  autoCorrect={false}
                  autoCapitalize="none"
                  autoFocus={cherche}
                  returnKeyType="search"
                  accessibilityLabel="Où habitez-vous ? Tapez le nom de votre commune"
                  accessibilityLabelledBy="question"
                  style={s.champ}
                />
              </>
            ) : null}
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
                  <Text style={[s.note, { color: D.encre, fontWeight: "600" }]}>Pas de compte, pas d'e-mail.</Text>
                  <Text style={s.note}>Repère ne sait pas qui vous êtes. Pour afficher votre commune, il télécharge le fichier public de tout votre département, et ne garde votre commune sur ce téléphone que si vous le lui demandez.</Text>
                </View>
              </>
            ) : null}
            {manquante ? (
              <Vide titre={`${manquante[1]} existe bien en Île-de-France : c'est nous qui n'avons pas encore sa fiche.`}
                corps="Les données publiées que Repère lit ne contiennent pas de fiche pour cette commune. Ce n'est pas une erreur de votre part, et ce n'est pas la preuve que la commune n'existe pas." />
            ) : null}
            {rien ? (
              /* 08/10/2026 : « Rien ne correspond » laissait croire que la commune
                 n'existe pas. L'application ne couvre que l'Ile-de-France pendant la
                 beta : c'est une limite de couverture, pas une absence de donnees. */
              <Vide titre={`Aucune commune d'Île-de-France ne correspond à « ${filtre.trim()} ».`}
                corps="Pendant la bêta, l'application ne couvre que l'Île-de-France : pour une commune d'ailleurs, les données ne sont pas encore disponibles ici. Sinon, vérifiez l'orthographe du début du nom." />
            ) : null}

            {/* Hors ecran : les cartes de partage, capturees au moment du partage. */}
            <View style={s.cache} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <ChiffreStory refCarte={partageChiffre.carte} />
              <VoteStory refCarte={partageVote.carte} />
            </View>
          </View>
        }
        renderItem={({ item: [insee, nom] }) => (
          <Pressable
            onPress={() => ouvrir(insee, nom)}
            accessibilityRole="button"
            accessibilityLabel={`${nom}, ${nomDep(departementDe(insee) || "")}`}
            accessibilityHint="Ouvre ce qui se passe dans cette commune"
            style={({ pressed }) => [s.resultat, pressed && { backgroundColor: D.voile }]}
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

const s = feuille(() => StyleSheet.create({
  page: { paddingHorizontal: PAS * 4, gap: PAS * 2, maxWidth: 640, width: "100%", alignSelf: "center" },
  tete: { gap: PAS * 3, marginBottom: PAS * 2 },
  haut: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  marque: { fontFamily: POLICE.affiche, fontSize: 22, color: D.encre },
  chercher: { minHeight: CIBLE, borderRadius: RAYON.bloc, borderWidth: 1, borderColor: D.trait, paddingHorizontal: PAS * 3, justifyContent: "center" },
  chercherTexte: { fontSize: 15, fontWeight: "700", color: D.encre },
  titre: { fontFamily: POLICE.affiche, fontSize: 44, lineHeight: 48, color: D.encre },
  carte: { gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: D.carte, borderWidth: 1, borderColor: D.trait },
  etiquette: { fontSize: 13, fontWeight: "700", color: D.sourd },
  carteTitre: { fontFamily: POLICE.titre, fontSize: 24, lineHeight: 30, color: D.encre },
  chiffre: { fontFamily: POLICE.affiche, fontSize: 64, lineHeight: 68, color: D.encre },
  vote: { fontFamily: POLICE.titre, fontSize: 22, lineHeight: 28, color: D.encre },
  legende: { fontSize: 15, lineHeight: 21, color: D.sourd },
  badge: { alignSelf: "flex-start", paddingHorizontal: PAS * 2, paddingVertical: PAS, borderRadius: RAYON.bloc, backgroundColor: D.voile },
  badgeTexte: { fontSize: 13, fontWeight: "600", color: D.sourd },
  partager: { minHeight: CIBLE, borderRadius: RAYON.bloc, borderWidth: 1, borderColor: D.trait, alignItems: "center", justifyContent: "center", paddingHorizontal: PAS * 4 },
  partagerTexte: { fontSize: 16, fontWeight: "700", color: D.encre },
  points: { flexDirection: "row", justifyContent: "center", gap: PAS * 2 },
  point: { width: 8, height: 8, borderRadius: 4, backgroundColor: D.trait },
  pointActif: { backgroundColor: E.ville },
  cache: { position: "absolute", left: -10000, top: 0 },
  confiance: { gap: PAS, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: D.voile, marginTop: PAS * 2 },
  promesse: { fontSize: 17, lineHeight: 24, color: D.encre },
  question: { fontFamily: POLICE.titre, fontSize: 24, lineHeight: 30, color: D.encre, marginTop: PAS * 6 },
  champ: {
    minHeight: CIBLE + 8, borderRadius: RAYON.bloc, borderWidth: 1.5, borderColor: D.trait,
    backgroundColor: D.carte, paddingHorizontal: PAS * 4, fontSize: 18, color: D.encre,
    /* Sur l'export web, le contour de focus par defaut du navigateur est orange :
       une sixieme couleur (invariant 7). Le focus reste visible, dans la couleur
       de la commune. Sans effet sur iOS et Android. */
    ...(Platform.OS === "web" ? { outlineColor: E.ville, outlineWidth: 2, outlineStyle: "solid" } : {}),
  },
  note: { fontSize: 15, color: D.sourd },
  resultat: {
    minHeight: CIBLE + 8, flexDirection: "row", alignItems: "center", gap: PAS * 3,
    paddingHorizontal: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: D.carte,
  },
  pastille: { width: 10, height: 10, borderRadius: 5, backgroundColor: E.ville },
  resultatNom: { flex: 1, fontSize: 17, color: D.encre, fontWeight: "600" },
  resultatDep: { fontSize: 14, color: D.sourd, flexShrink: 1, textAlign: "right" },
}));
