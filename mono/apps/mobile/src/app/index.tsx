/* OUVERTURE ET CHOIX DE LA COMMUNE — 29/09/2026.
 *
 * Une question, un champ. La liste des communes de la beta (Ile-de-France)
 * arrive en un fichier ; la recherche et l'ordre des resultats sont ceux du
 * site, importes de @repere/core (trouverCommunes) : la meme saisie donne les
 * memes communes sur les deux supports. Les phrases de vide sont celles du
 * site, mot pour mot.
 *
 * 30/10/2026 — REFONTE VISUELLE A TITRE D'ESSAI (direction artistique, sombre).
 * Les cartes glissent horizontalement. La premiere (D18, 30/10/2026) lit la depense
 * par habitant dans les comptes OFGL publies : celle de la commune retenue, sinon
 * celle de Melun, annoncee comme un exemple. La seconde est un vote fige (depute
 * 77-1, scrutin 8706, verifie le 30/10/2026), annonce lui aussi comme un exemple.
 * Le partage n'est plus sur l'accueil : il est sur les ecrans de contexte (src/ui/partage). */
import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { mots, motsCible, correspond, trouverCommunes, departementDe, titreLisible, dernierExercice, evolution, parHabitant, dateFr, decompte, ordinal, positionSur, positionsFiables } from "@repere/core";
import { chargerCatalogueScrutins, chargerCommunesBeta, chargerDepartement, chargerDeputes, chargerIndex, chargerVotes, ETATS, PHRASES } from "../lib/donnees";
import { Bouton, Carte, Texte, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { feuille, CIBLE, PAS, POLICE, RAYON } from "../lib/theme";
import { ECHELONS_PAR_MODE, NEUTRES_PAR_MODE, OMBRE_PAR_MODE } from "../lib/palette";
import { groupeDe } from "../lib/groupes";
import { VOTE } from "../ui/partage/donnees";
import { SquelettesListe } from "../ui/squelette";
import { Logo } from "../ui/logo";
import { DatePublication } from "../ui/fraicheur";
import { DernieresPublications } from "../ui/dernieres-publications";
import { phrasesMoyenne, useMoyenneDepenses } from "../lib/moyenne";
import { COULEUR_VOTE } from "../lib/theme";
import { AvecPicto } from "../ui/picto";
import { libelleGroupe } from "../ui/badge-groupe";

/* L'accueil est sombre : il lit la palette sombre, quel que soit le choix d'affichage. */
const D = NEUTRES_PAR_MODE.sombre;
const E = ECHELONS_PAR_MODE.sombre;

type Ligne = [string, string, string[]];
type Beta = { communes: Record<string, string>; manquantes?: Record<string, string>; source?: { producteur?: string } };
type Index = { departements: { code: string; nom?: string }[]; agregats?: unknown[] };
/* Le chiffre de la carte « L'argent de … » (D18) : lu dans les comptes OFGL publies
   du departement, jamais ecrit dans le code. */
/* V13 bloc B : quatre couches. Le chiffre ; le contexte, DANS la commune (l'exercice
   precedent publie, seulement s'il suit et si le perimetre n'a pas change : core
   evolution) et la commune mediane de la region (D23, A1) ; la consequence,
   lue dans les memes comptes (salaires, investissement par habitant, publies par
   l'OFGL) ; la source. Une couche sans donnee n'est pas affichee. */
type Argent = { nom: string; an: string; depenses: number; avant: { an: string; depenses: number } | null; salaires: number | null; investissement: number | null };
/* D21 : le dernier vote publie du depute de la commune retenue. « partagee » : la commune
   est sur plusieurs circonscriptions, le depute depend de l'adresse (aucun n'est choisi). */
type VoteVu = { depute: string; acteur: string; circo: number; position: string; d: string; t: string; dec?: Record<string, string> } | { partagee: number };

/* V13 bloc C : une barre empilee, en vues (aucune bibliotheque). Trois gris de la palette
   sombre, jamais une couleur d'echelon ni de groupe (invariant 7) ; la legende en toutes
   lettres porte le sens, la barre ne fait que le montrer. Masquee au lecteur d'ecran :
   la phrase qui suit dit la meme chose. */
function Barre({ parts }: { parts: { cle: string; valeur: number; couleur: string }[] }) {
  return (
    <View style={s.barre} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {parts.filter(p => p.valeur > 0).map(p => <View key={p.cle} style={{ flex: p.valeur, backgroundColor: p.couleur }} />)}
    </View>
  );
}
const nombre = (x: unknown) => { const n = Number(x); return Number.isFinite(n) && n >= 0 && x !== null && String(x).trim() !== "" ? n : null; };
const POSITION_MOT: Record<string, string> = { p: "Pour", c: "Contre", a: "Abstention" };
/* Sans commune retenue, la carte montre un exemple, dit comme tel : Melun. */
const EXEMPLE = { insee: "77288", nom: "Melun" };
/* COMMUNES RECENTES, POUR LA SESSION SEULEMENT (bloc D, 30/10/2026) : une variable en
   memoire, perdue a la fermeture de l'application. Rien n'est ecrit sur le telephone :
   la seule cle locale reste repere.departement (invariant 2). */
const RECENTES: { insee: string; nom: string }[] = [];

/* La repartition du scrutin entier (pas la position seule) : pour, contre, abstention. */
function BarreVote({ dec }: { dec?: Record<string, string> | null }) {
  const p = dec ? nombre(dec.pour) : null, c = dec ? nombre(dec.contre) : null, a = dec ? nombre(dec.abstentions) : null;
  if (p === null || c === null || a === null || p + c + a === 0) return null;
  return (
    <View style={{ gap: PAS * 2 }}>
      <Barre parts={[{ cle: "p", valeur: p, couleur: COULEUR_VOTE.p }, { cle: "c", valeur: c, couleur: COULEUR_VOTE.c }, { cle: "a", valeur: a, couleur: COULEUR_VOTE.a }]} />
      <Text style={s.legende}>L'Assemblée : {decompte(dec)}.</Text>
    </View>
  );
}

/* Le sens du vote : un rond de couleur (D24, un fait) et la position en toutes lettres. */
function SensVote({ cle, texte }: { cle: string; texte: string }) {
  const couleur = COULEUR_VOTE[cle as keyof typeof COULEUR_VOTE];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
      {couleur ? <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: couleur }} /> : null}
      <Text style={s.vote}>{texte}</Text>
    </View>
  );
}

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
  const [argent, setArgent] = useState<Argent | null>(null);
  const [voteVu, setVoteVu] = useState<VoteVu | null>(null);
  const [decExemple, setDecExemple] = useState<Record<string, string> | null>(null);
  const [tout, setTout] = useState(false);
  const [recentes, setRecentes] = useState(() => [...RECENTES]);
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
  /* Toutes les communes de la beta, de A a Z : l'issue d'une recherche sans resultat. */
  const toutes = useMemo(() => (tout ? [...communes].sort((a, b) => a[1].localeCompare(b[1], "fr")) : []), [tout, communes]);
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
    const i = RECENTES.findIndex(x => x.insee === insee);
    if (i >= 0) RECENTES.splice(i, 1);
    RECENTES.unshift({ insee, nom });
    RECENTES.length = Math.min(RECENTES.length, 3);
    setRecentes([...RECENTES]);
    /* La recherche se referme une fois la commune choisie : au retour, l'accueil est propre. */
    setFiltre(""); setCherche(false); setTout(false);
    router.push("/chez-vous");
  };

  /* La commune retenue sur ce telephone, si le lecteur l'a demande
     (lib/memoire.ts). Son nom vient de la liste publiee : si elle n'y figure
     plus, on ne propose rien plutot qu'un code nu. */
  const nomRetenue = retenue && beta ? beta.communes[retenue.c] : undefined;

  /* D18 : la commune retenue si le lecteur l'a demande, sinon l'exemple. Si les comptes
     ne donnent pas de depense par habitant, la carte n'est pas affichee. */
  const cible = retenue && nomRetenue ? { insee: retenue.c, nom: nomRetenue } : EXEMPLE;
  useEffect(() => {
    if (!index || !index.agregats) return undefined;
    let vivant = true;
    const dep = departementDe(cible.insee);
    if (!dep) return undefined;
    const exempleIci = cible === EXEMPLE;
    Promise.all([
      chargerDepartement(dep),
      exempleIci ? null : chargerDeputes(), chargerCatalogueScrutins(), exempleIci ? null : chargerVotes(dep),
    ]).then(([r, de, ca, vo]) => {
      if (!vivant) return;
      /* LE VOTE (D21) : seulement pour la commune retenue, et seulement si les deux releves
         de l'Assemblee se correspondent (positionsFiables). Sinon, l'exemple, dit comme tel. */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fv = r.donnees ? (r.donnees as any).communes?.[cible.insee] : null;
      let vu: VoteVu | null = null;
      if (fv && de && ca && vo && de.donnees && ca.donnees && vo.donnees) {
        const circos = Array.isArray(fv.circo) ? fv.circo : fv.circo === null || fv.circo === undefined ? [] : [fv.circo];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cat = ca.donnees as any, pos = vo.donnees as any, deps = de.donnees as any;
        if (circos.length > 1) vu = { partagee: circos.length };
        else if (circos.length === 1 && positionsFiables(cat, pos)) {
          const d = deps.deputes && deps.deputes[dep + "-" + circos[0]];
          if (d && d.acteurRef) {
            const tries = [...cat.scrutins].sort((a: { d: string; n: string }, b: { d: string; n: string }) => (b.d + b.n.padStart(6, "0")).localeCompare(a.d + a.n.padStart(6, "0")));
            const sc = tries.find((x: { n: string }) => POSITION_MOT[positionSur(pos, d.acteurRef, x.n) as string]);
            if (sc) vu = { depute: [d.prenom, d.nom].filter(Boolean).join(" ") || d.nom, acteur: d.acteurRef, circo: Number(circos[0]), position: positionSur(pos, d.acteurRef, sc.n), d: sc.d, t: sc.t, dec: sc.dec };
          }
        }
      }
      setVoteVu(vu);
      /* Le decompte de l'exemple vient du catalogue publie, pas du code. */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scEx = ca && ca.donnees ? ((ca.donnees as any).scrutins || []).find((x: { n: string }) => x.n === VOTE.n) : null;
      setDecExemple(scEx && scEx.dec ? scEx.dec : null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fiche = r.donnees ? (r.donnees as any).communes?.[cible.insee] : null;
      const ex = fiche ? dernierExercice(fiche, index.agregats) : null;
      const hab = ex ? parHabitant(ex.ex) : null;
      const evo = fiche ? evolution(fiche, index.agregats) : null;
      const habAvant = evo && ex && !evo.perimetreChange && evo.an2 === ex.an ? parHabitant(fiche.comptes[evo.an1]) : null;
      setArgent(ex && hab && typeof hab.depenses === "number" ? {
        nom: cible.nom, an: ex.an, depenses: hab.depenses,
        avant: habAvant && typeof habAvant.depenses === "number" && evo ? { an: evo.an1, depenses: habAvant.depenses } : null,
        salaires: typeof hab.salaires === "number" ? hab.salaires : null,
        investissement: typeof hab.investissement === "number" ? hab.investissement : null,
      } : null);
    }).catch(() => { if (vivant) setArgent(null); });
    return () => { vivant = false; };
  }, [index, cible.insee, cible.nom]);
  const exemple = cible === EXEMPLE;
  /* D23, A1 : la commune mediane de la region, pour le meme exercice que le chiffre. */
  const moyenne = useMoyenneDepenses(index, departementDe(cible.insee), argent ? argent.an : null);
  const comparaison = argent && moyenne ? phrasesMoyenne(argent.nom, argent.depenses, moyenne) : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const urlComptes: string | null = (index as any)?.sources?.comptes?.url ?? null;

  const phrase = PHRASES[etat as keyof typeof PHRASES] as { titre: string; corps: string; action?: string } | undefined;

  /* PREMIERE OUVERTURE (D15, 30/10/2026) : aucune commune retenue sur ce telephone
     (cle unique repere.departement, invariant 2 : aucune autre cle). L'ecran devient
     l'accueil de bienvenue : grand logo, la phrase, et le champ deja ouvert. Pas
     d'ecran supplementaire : c'est cet ecran qui accueille. */
  const premiere = !retenue;
  const champOuvert = cherche || !!filtre || premiere;

  /* Les cartes glissent horizontalement : le chiffre, puis le vote. */
  const cartes = (
    <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} decelerationRate="fast" snapToInterval={pas}
              accessibilityLabel={argent ? "Cartes à faire défiler : l'argent de la commune, puis un vote" : "Un vote, à titre d'exemple"}
              contentContainerStyle={{ gap: PAS * 3 }}
              onMomentumScrollEnd={e => setPage(Math.round(e.nativeEvent.contentOffset.x / pas))}>
              {argent ? (
                <View style={{ width: larg }}>
                  <View style={s.carte}>
                    <AvecPicto picto="budget"><Text style={s.etiquette}>{exemple ? "Un exemple, en attendant votre commune" : "Votre commune"}</Text></AvecPicto>
                    {/* A3 (30/10/2026) : quatre lignes. Titre ; chiffre ; comparaison ; repartition.
                        Puis la source, en pied, cliquable. L'annee precedente et le detail des
                        depenses vivent dans le budget de la commune (argent.tsx). */}
                    <Text style={s.carteTitre}>L'argent de {argent.nom}</Text>
                    <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: PAS * 2 }}>
                      <Text style={s.chiffre}>{argent.depenses.toLocaleString("fr-FR")} €</Text>
                      <Text style={s.legende}>par habitant · {argent.an}</Text>
                    </View>
                    {comparaison ? <Text style={s.contexte}>{comparaison.rapport}</Text>
                      : argent.avant ? <Text style={s.contexte}>En {argent.avant.an} : {argent.avant.depenses.toLocaleString("fr-FR")} € par habitant</Text> : null}
                    {argent.salaires !== null && argent.investissement !== null && argent.salaires + argent.investissement <= argent.depenses ? (() => {
                      const sal = Math.round(argent.salaires / argent.depenses * 100);
                      const inv = Math.round(argent.investissement / argent.depenses * 100);
                      const aut = 100 - sal - inv;
                      return (
                        <View style={{ gap: PAS * 2 }}>
                          <Barre parts={[{ cle: "s", valeur: sal, couleur: D.encre }, { cle: "i", valeur: inv, couleur: D.sourd }, { cle: "a", valeur: aut, couleur: D.trait }]} />
                          <Text style={s.legende}>{sal} % salaires · {inv} % invest. · {aut} % autres</Text>
                        </View>
                      );
                    })() : null}
                    <Pressable onPress={() => { if (urlComptes) Linking.openURL(urlComptes); }} accessibilityRole="link"
                      accessibilityLabel="Source : comptes des communes publiés par l'OFGL, ouvre un site externe. Médiane et parts calculées par Repère."
                      style={({ pressed }) => ({ minHeight: 44, justifyContent: "center", opacity: pressed ? 0.7 : 1 })}>
                      <Text style={[s.legende, { fontSize: 13, textDecorationLine: urlComptes ? "underline" : "none" }]}>Source : OFGL · médiane et parts : calcul Repère</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <View style={{ width: larg }}>
                {voteVu && "depute" in voteVu ? (
                  <View style={s.carte}>
                    <AvecPicto picto="vote"><Text style={s.etiquette}>Le dernier vote publié de votre député</Text></AvecPicto>
                    <Text style={s.carteTitre}>{voteVu.depute}</Text>
                    {/* Groupe inconnu ici : badge gris, aucune couleur de parti (ADR 0001). */}
                    <View style={s.badge}><Text style={s.badgeTexte}>{libelleGroupe(groupeDe(voteVu.acteur))}</Text></View>
                    <Text style={s.legende}>Député de la {ordinal(voteVu.circo)} circonscription · {nomDep(departementDe(cible.insee) || "")}</Text>
                    <SensVote cle={voteVu.position} texte={POSITION_MOT[voteVu.position]} />
                    <BarreVote dec={voteVu.dec} />
                    <Text style={s.legende}>{dateFr(voteVu.d)} · {titreLisible(voteVu.t)} · source : Assemblée nationale</Text>
                  </View>
                ) : voteVu && "partagee" in voteVu ? (
                  <View style={s.carte}>
                    <Text style={s.etiquette}>Votre député</Text>
                    <Text style={s.carteTitre}>Il dépend de votre adresse</Text>
                    <Text style={s.legende}>{cible.nom} est partagée entre {voteVu.partagee} circonscriptions. Repère ne choisit pas un député à votre place : ses votes sont sur l'écran de la commune.</Text>
                  </View>
                ) : (
                  <View style={s.carte}>
                    <AvecPicto picto="vote"><Text style={s.etiquette}>Un exemple</Text></AvecPicto>
                    <Text style={s.carteTitre}>{VOTE.depute}</Text>
                    {/* Groupe inconnu ici : badge gris, aucune couleur de parti (ADR 0001). */}
                    <View style={s.badge}><Text style={s.badgeTexte}>{libelleGroupe(groupeDe(VOTE.acteur))}</Text></View>
                    <Text style={s.legende}>Député de la 1re circonscription de Seine-et-Marne</Text>
                    <SensVote cle="a" texte="S'est abstenu" />
                    <BarreVote dec={decExemple} />
                    <Text style={s.legende}>{dateFr(VOTE.date)} · {titreLisible(VOTE.titre)}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            <View style={s.points} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {(argent ? [0, 1] : [0]).map(i => <View key={i} style={[s.point, page === i && s.pointActif]} />)}
            </View>
    </>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: D.sol }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <FlatList
        data={tout && !cherches.length ? toutes : trouvees}
        keyExtractor={l => l[0]}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.page, { paddingTop: marges.top + PAS * 6, paddingBottom: marges.bottom + PAS * 6 }]}
        ListHeaderComponent={
          <View style={s.tete}>
            <DatePublication />
            <View style={s.haut}>
              {/* Le logo est une vue (ui/logo.tsx) : aucun fichier image dans assets/. */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 3 }}>
                {/* L'accueil est toujours sombre : la variante « sombre », pas l'encre du theme
                    (en mode clair, l'encre du theme est foncee et le logo disparaissait). */}
                {premiere ? null : <Logo size={48} variant="sombre" />}
                <Text style={s.marque} accessibilityLabel="Repère">Repère<Text style={{ color: E.ville }}>.</Text></Text>
              </View>
              {!champOuvert ? (
                <Pressable onPress={() => setCherche(true)} accessibilityRole="button" accessibilityLabel="Chercher une commune"
                  style={({ pressed }) => [s.chercher, pressed && { opacity: 0.7 }]}>
                  <Text style={s.chercherTexte}>Chercher une commune</Text>
                </Pressable>
              ) : null}
            </View>
            {/* LE PITCH : une citation, en grand. Demande du CEO (30/10/2026) : elle remplace le paragraphe. */}
            {premiere ? <View style={s.grandLogo}><Logo size={128} variant="sombre" /></View> : null}
            <Text style={[s.citation, premiere && { marginTop: PAS * 2 }]} accessibilityRole="header">L'application qui vous raccroche à votre citoyenneté française.</Text>

            {premiere ? null : <DernieresPublications />}
            {premiere ? null : cartes}

            {retenue && nomRetenue ? (
              <Carte echelon="ville" titre="Votre commune, sur ce téléphone">
                <Texte fort>{nomRetenue}</Texte>
                <Bouton texte={`Voir ce qui se passe à ${nomRetenue}`} onPress={() => ouvrir(retenue.c, nomRetenue)} />
                <Bouton texte={`Oublier ${nomRetenue}`} discret onPress={oublier} />
              </Carte>
            ) : null}
            {champOuvert ? (
              <>
                <Text style={s.question} nativeID="question">{retenue && nomRetenue ? "Une autre commune ?" : "Où habitez-vous ?"}</Text>
                <View style={s.champLigne}>
                  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.loupe}>
                    <View style={s.loupeRond} />
                    <View style={s.loupeManche} />
                  </View>
                <TextInput
                  value={filtre}
                  onChangeText={setFiltre}
                  placeholder="Tapez votre ville (ex: Melun...)"
                  placeholderTextColor={D.sourd}
                  autoCorrect={false}
                  autoCapitalize="none"
                  autoFocus={cherche && !premiere}
                  returnKeyType="search"
                  accessibilityLabel="Où habitez-vous ? Tapez le nom de votre commune"
                  accessibilityLabelledBy="question"
                  style={s.champ}
                />
                </View>
              </>
            ) : null}
            {etat === ETATS.EN_COURS ? <SquelettesListe n={3} hauteur={72} /> : null}
            {etat !== ETATS.SERVI && etat !== ETATS.EN_COURS && phrase ? (
              <Vide titre={phrase.titre} corps={phrase.corps}
                action="Réessayer" onAction={() => setEssai(n => n + 1)} />
            ) : null}
            {champOuvert && !cherches.length && !tout && recentes.length ? (
              <View style={{ gap: PAS * 2 }}>
                <Text style={s.note}>Ouvertes pendant cette session</Text>
                {recentes.map(c => (
                  <Pressable key={c.insee} onPress={() => ouvrir(c.insee, c.nom)} accessibilityRole="button"
                    accessibilityLabel={`${c.nom}, ouverte pendant cette session`}
                    style={({ pressed }) => [s.resultat, pressed && { opacity: 0.7 }]}>
                    <View style={s.pastille} />
                    <Text style={s.resultatNom}>{c.nom}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {tout && !cherches.length ? (
              <View style={{ gap: PAS * 2 }}>
                <Text style={s.question} accessibilityRole="header">Les {communes.length} communes de la bêta, de A à Z</Text>
                <Bouton texte="Fermer la liste" discret onPress={() => setTout(false)} />
              </View>
            ) : null}
            {etat === ETATS.SERVI && !cherches.length && !tout ? (
              <>
                <Text style={s.note}>La bêta couvre les {communes.length} communes d'Île-de-France qui ont une fiche.</Text>
                {/* CE QUE REPERE SAIT DE VOUS : rien. Phrase vraie a la lettre :
                    les adresses se composent par departement (client.js), et la
                    commune n'est gardee que sur demande (lib/memoire.ts). */}
                {/* Audit 5 s (V19) : une ligne ; l'explication complete est dans la FAQ. */}
                <Pressable onPress={() => router.push("/faq")} accessibilityRole="link"
                  accessibilityLabel="Pas de compte, pas d'e-mail. Pourquoi ? Ouvre les questions fréquentes"
                  style={({ pressed }) => [s.confiance, { minHeight: 48, justifyContent: "center" }, pressed && { opacity: 0.7 }]}>
                  <Text style={[s.note, { color: D.encre, fontWeight: "600" }]}>Pas de compte, pas d'e-mail. <Text style={{ textDecorationLine: "underline", fontWeight: "400", color: D.sourd }}>Pourquoi ?</Text></Text>
                </Pressable>
              </>
            ) : null}
            {/* V13 bloc D : sous le pitch et la recherche, au-dessus des cartes. Masquee sans fait de moins de 7 jours. */}
            {premiere && !cherches.length && !tout ? <DernieresPublications /> : null}
            {premiere && !cherches.length && !tout ? cartes : null}
            {manquante ? (
              <Vide titre={`${manquante[1]} existe bien en Île-de-France : c'est nous qui n'avons pas encore sa fiche.`}
                corps="Les données publiées que Repère lit ne contiennent pas de fiche pour cette commune. Ce n'est pas une erreur de votre part, et ce n'est pas la preuve que la commune n'existe pas."
                action="Chercher une autre commune" onAction={() => setFiltre("")} />
            ) : null}
            {rien ? (
              /* 08/10/2026 : « Rien ne correspond » laissait croire que la commune
                 n'existe pas. L'application ne couvre que l'Ile-de-France pendant la
                 beta : c'est une limite de couverture, pas une absence de donnees. */
              <Vide titre={`Aucune commune d'Île-de-France ne correspond à « ${filtre.trim()} ».`}
                corps="Pendant la bêta, l'application ne couvre que l'Île-de-France : pour une commune d'ailleurs, les données ne sont pas encore disponibles ici. Sinon, vérifiez l'orthographe du début du nom."
                action="Effacer la recherche" onAction={() => setFiltre("")} />
            ) : null}
            {rien ? (
              <Bouton texte="Voir toutes les communes d'Île-de-France" discret onPress={() => { setFiltre(""); setTout(true); }} />
            ) : null}

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
  marque: { fontFamily: POLICE.affiche, fontSize: 26, color: D.encre },
  chercher: { minHeight: CIBLE, borderRadius: 999, borderWidth: 1, borderColor: D.trait, paddingHorizontal: PAS * 4, justifyContent: "center" },
  chercherTexte: { fontSize: 15, fontWeight: "700", color: D.encre },
  grandLogo: { alignItems: "flex-start", marginTop: PAS * 4 },
  citation: { fontFamily: POLICE.affiche, fontSize: 38, lineHeight: 43, letterSpacing: -0.6, color: D.encre, marginTop: PAS * 4 },
  carte: { gap: PAS * 2, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: D.carte, borderWidth: 1, borderColor: D.trait },
  etiquette: { fontSize: 13, fontWeight: "700", color: D.sourd },
  carteTitre: { fontFamily: POLICE.titre, fontSize: 24, lineHeight: 30, color: D.encre },
  chiffre: { fontFamily: POLICE.affiche, fontSize: 64, lineHeight: 68, color: D.encre },
  vote: { fontFamily: POLICE.titre, fontSize: 22, lineHeight: 28, color: D.encre },
  legende: { fontSize: 15, lineHeight: 21, color: D.sourd },
  contexte: { fontSize: 15, lineHeight: 21, color: D.encre },
  barre: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", backgroundColor: D.voile, gap: 2 },
  badge: { alignSelf: "flex-start", paddingHorizontal: PAS * 2, paddingVertical: PAS, borderRadius: RAYON.bloc, backgroundColor: D.voile },
  badgeTexte: { fontSize: 13, fontWeight: "600", color: D.sourd },
  points: { flexDirection: "row", justifyContent: "center", gap: PAS * 2 },
  point: { width: 8, height: 8, borderRadius: 4, backgroundColor: D.trait },
  pointActif: { backgroundColor: E.ville },
  confiance: { gap: PAS, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: D.voile, marginTop: PAS * 2 },
  question: { fontFamily: POLICE.titre, fontSize: 24, lineHeight: 30, color: D.encre, marginTop: PAS * 6 },
  champLigne: {
    flexDirection: "row", alignItems: "center", minHeight: CIBLE + 8, borderRadius: 999, borderWidth: 1.5, borderColor: D.trait,
    backgroundColor: D.carte, paddingLeft: PAS * 4, ...OMBRE_PAR_MODE.sombre, shadowOpacity: 0.3,
  },
  loupe: { width: 18, height: 18, marginRight: PAS * 2 },
  loupeRond: { position: "absolute", top: 0, left: 0, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: D.sourd },
  loupeManche: { position: "absolute", right: 0, bottom: 1, width: 7, height: 2, borderRadius: 1, backgroundColor: D.sourd, transform: [{ rotate: "45deg" }] },
  champ: {
    flex: 1, minHeight: CIBLE + 8, paddingHorizontal: PAS * 2, fontSize: 18, color: D.encre, borderRadius: 999,
    /* Sur l'export web, le contour de focus par defaut du navigateur est orange :
       une sixieme couleur (invariant 7). Le focus reste visible, dans la couleur
       de la commune. Sans effet sur iOS et Android. */
    ...(Platform.OS === "web" ? { outlineColor: E.ville, outlineWidth: 2, outlineStyle: "solid" } : {}),
  },
  note: { fontSize: 15, color: D.sourd },
  resultat: {
    minHeight: CIBLE + 8, flexDirection: "row", alignItems: "center", gap: PAS * 3,
    paddingHorizontal: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: D.carte,
    ...OMBRE_PAR_MODE.sombre, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  pastille: { width: 10, height: 10, borderRadius: 5, backgroundColor: E.ville },
  resultatNom: { flex: 1, fontSize: 17, color: D.encre, fontWeight: "600" },
  resultatDep: { fontSize: 14, color: D.sourd, flexShrink: 1, textAlign: "right" },
}));
