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
import { noterArrondissement } from "../lib/arrondissement";
import { espacesFines } from "../ui/donnees";
import { useEffect, useMemo, useState } from "react";
import { FlatList, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { mots, motsCible, correspond, chercherCommunes, departementDe, titreLisible, dernierExercice, evolution, parHabitant, dateFr, decompte, ordinal, positionSur, positionsFiables } from "@repere/core";
import { chargerCatalogueScrutins, chargerCodesPostaux, chargerCommunesBeta, chargerDepartement, chargerDeputes, chargerIndex, chargerVotes, ETATS, PHRASES } from "../lib/donnees";
import { Bouton, Carte, Texte, Vide } from "../lib/composants";
import { useSelection } from "../lib/selection";
import { useProfil } from "../lib/profil";
import { feuille, ACCENTS, CIBLE, couleurs, FILET_TUILE, JAUGE, OMBRE, PAS, POLICE, RAYON, TYPO } from "../lib/theme";
import { useTheme } from "../lib/themeChoix";
import { Decideurs } from "../ui/decideurs";
import { ActuMairie } from "../ui/actu-mairie";
import { groupeDe, useGroupes } from "../lib/groupes";
import { VOTE } from "../ui/partage/donnees";
import { SquelettesListe } from "../ui/squelette";
import { Logo } from "../ui/logo";
import { ChipsThemes } from "../ui/chips-themes";
import { Ionicons } from "@expo/vector-icons";
import { RappelElection } from "../ui/rappel-election";
import { DatePublication } from "../ui/fraicheur";
import { DernieresPublications } from "../ui/dernieres-publications";
import { phrasesMoyenne, titreEcart, useMoyenneDepenses } from "../lib/moyenne";
import { useCouleurVote } from "../lib/couleur-vote";
import { AvecPicto } from "../ui/picto";
import { libelleGroupe } from "../ui/badge-groupe";
import { Details } from "../ui/details";
import { PourquoiJeVois } from "../ui/pourquoi";
import { SignalerErreur } from "../ui/contact";
import { ModaleExhaustif } from "../ui/modale-exhaustif";
import { METHODE_COMPTES, USAGE_PAR_HABITANT, srcVote } from "../lib/sources";
import { enfonce } from "../ui/mouvement";

/* 09/11/2026 (maquettes Stitch) : l'accueil suit le thème choisi (Néo-Civique clair par défaut,
   Dark Luxury en sombre). Il était sombre en toutes circonstances depuis le 30/10/2026. */
const D = couleurs;
const E = couleurs;

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
type VoteVu = { depute: string; acteur: string; circo: number; position: string; d: string; t: string; dec?: Record<string, string>; lien?: string } | { partagee: number };

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
/* NIVEAU 1 DU BUDGET (V28, bloc 3) : la phrase-conclusion est un calcul sur les montants lus,
   jamais un texte écrit à la main. Sans part des salaires, on garde le titre neutre. */
const accroche = (a: Argent) => a.salaires !== null && a.depenses > 0
  ? `Sur 100 € dépensés à ${a.nom}, ${Math.round(a.salaires / a.depenses * 100)} € vont aux salaires des agents.`
  : `L'argent de ${a.nom}`;
/* Sans commune retenue, la carte montre un exemple, dit comme tel : Melun. */
const EXEMPLE = { insee: "77288", nom: "Melun" };
/* COMMUNES RECENTES, POUR LA SESSION SEULEMENT (bloc D, 30/10/2026) : une variable en
   memoire, perdue a la fermeture de l'application. Rien n'est ecrit sur le telephone :
   la seule cle locale reste repere.departement (invariant 2). */
const RECENTES: { insee: string; nom: string }[] = [];

/* La repartition du scrutin entier (pas la position seule) : pour, contre, abstention. */
function BarreVote({ dec }: { dec?: Record<string, string> | null }) {
  const COULEUR_VOTE = useCouleurVote();
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
  const COULEUR_VOTE = useCouleurVote();
  const couleur = COULEUR_VOTE[cle as keyof typeof COULEUR_VOTE];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
      {couleur ? <View accessibilityElementsHidden importantForAccessibility="no" style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: couleur }} /> : null}
      <Text style={s.vote}>{texte}</Text>
    </View>
  );
}

/* CARTE DU VOTE (V28, bloc 4) — trois niveaux, un seul composant pour le député et pour l'exemple.
 * 1 : la phrase-conclusion, calculée à partir de la position lue ; le sens, en toutes lettres
 *     et avec un rond de couleur (jamais la couleur seule) ; la date et le titre du scrutin.
 * 2 (« Voir plus ») : le décompte du scrutin entier.
 * 3 (« Tout voir ») : le scrutin, le décompte écrit, la façon dont Repère lit la position, le lien. */
const VERBE_VOTE: Record<string, string> = { p: "a voté pour", c: "a voté contre", a: "s'est abstenu" };
/* « 503 députés ont voté pour, aucun contre » : calculé sur le décompte publié ; sans décompte, rien. */
function titreScrutin(dec?: Record<string, string> | null): string | null {
  const p = nombre(dec?.pour), c = nombre(dec?.contre);
  if (p === null || c === null) return null;
  const pour = `${p.toLocaleString("fr-FR")} député${p > 1 ? "s" : ""} ${p > 1 ? "ont" : "a"} voté pour`;
  return c === 0 ? `${pour}, aucun contre` : `${pour}, ${c.toLocaleString("fr-FR")} contre`;
}
function CarteVote({ etiquette, nom, acteur, ligne, position, dec, date, titre, lien, exemple = false }: {
  etiquette: string; nom: string; acteur: string; ligne: string; position: string | null; dec?: Record<string, string> | null;
  date: string; titre: string; lien?: string; exemple?: boolean;
}) {
  const [tout, setTout] = useState(false);
  const groupes = useGroupes();
  return (
    <View style={s.carte}>
      <AvecPicto picto="vote"><Text style={s.etiquette}>{etiquette}</Text></AvecPicto>
      {/* V29 bloc 4 : le titre dit ce que le scrutin a donné, calculé sur son décompte ; le nom du député suit. */}
      <Text style={s.carteTitre}>{titreScrutin(dec) ?? (position ? `${nom} ${VERBE_VOTE[position] ?? "a voté"}.` : `${nom} : position non lue`)}</Text>
      {titreScrutin(dec) && position ? <Text style={[s.legende, { fontWeight: "600" }]}>{nom} {VERBE_VOTE[position] ?? "a voté"}.</Text> : null}
      {/* Groupe inconnu ici : badge gris, aucune couleur de parti (ADR 0001). */}
      <View style={s.badge}><Text style={s.badgeTexte}>{libelleGroupe(groupeDe(acteur, groupes))}</Text></View>
      <Text style={s.legende}>{ligne}</Text>
      {position ? <SensVote cle={position} texte={POSITION_MOT[position]} /> : <Text style={s.legende}>Le relevé de l'Assemblée ne donne pas de position vérifiable pour ce scrutin.</Text>}
      <View style={{ flexDirection: "row", alignItems: "center", gap: PAS }}>
        <Text style={[s.legende, { flex: 1 }]}>{date} · {titre}</Text>
        <PourquoiJeVois etiquette={exemple ? "l'exemple de vote" : `le vote de ${nom}`} couleur={D.encre} fond={D.voile}
          p={{ source: { texte: exemple ? `Assemblée nationale, scrutin n° ${VOTE.n} du ${date}` : `Assemblée nationale, scrutin du ${date}`, lien },
            calcul: "Repère affiche la position du député et le décompte tels que l'Assemblée les publie pour ce scrutin. La position n'est retenue que si les deux relevés de l'Assemblée se correspondent ; sinon, aucune position n'est affichée.",
            ici: exemple ? "Exemple : affiché tant que votre commune n'est pas choisie, pour montrer la carte." : "Affiché parce que c'est le dernier vote publié de votre député." }} />
      </View>
      <Details titre="Décompte du scrutin" couleur={D.encre} lien={D.encre}>
        <BarreVote dec={dec} />
      </Details>
      <Pressable onPress={() => setTout(true)} accessibilityRole="button"
        accessibilityLabel={`Tout voir sur le vote de ${nom} : scrutin, décompte, lecture, lien officiel`}
        style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", ...enfonce(pressed) })}>
        <Text style={[s.legende, { fontSize: 14 }]}>Tout voir : scrutin et lecture</Text>
      </Pressable>
      <SignalerErreur contexte={`le vote de ${nom}`} donnee={`${date} · ${titre} · ${exemple ? "exemple" : nom}`} />
      <ModaleExhaustif titre={`Vote de ${nom}`} visible={tout} onFermer={() => setTout(false)} sections={[
        { titre: "Le scrutin", contenu: `${date} · ${titre}`, source: "Assemblée nationale" },
        { titre: "Le décompte", contenu: dec ? decompte(dec) : "Le décompte n'est pas publié pour ce scrutin." },
        { titre: "Comment Repère lit la position", contenu: exemple
          ? "Cet exemple est figé : scrutin n° " + VOTE.n + ", vérifié le 30/10/2026. Repère ne l'affiche pas comme le vote d'un député de votre commune."
          : "Repère n'affiche la position d'un député que si les deux relevés de l'Assemblée nationale se correspondent. Sinon, la carte ne montre aucune position." },
        { titre: "Lien officiel", contenu: lien
          ? <Pressable onPress={() => Linking.openURL(lien)} accessibilityRole="link" accessibilityLabel="Le scrutin sur le site de l'Assemblée nationale, ouvre un site externe"
              style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
              <Text style={TYPO.corps}>Le scrutin sur le site de l'Assemblée nationale (site externe)</Text>
            </Pressable>
          : "Aucun lien officiel vérifié pour ce scrutin." },
      ]} />
    </View>
  );
}

/* Les trois accès rapides de l'accueil (07/11/2026) : mêmes écrans, mêmes noms qu'avant. */
/* router.push écrit en toutes lettres : le contrôle de parcours (tests/parcours.test.mjs) le lit. */
/* Couleur de chaque tuile : celle d'un échelon (une section), jamais d'un parti (invariant 7). */
const ACCES: { ouvrir: () => void; texte: string; etiquette: string; icone: keyof typeof Ionicons.glyphMap; couleur: string }[] = [
  /* 09/11/2026 (porteur) : la tuile ouvre la page de la présidentielle ; le guide « Ma voix » y est à un geste. */
  { ouvrir: () => router.push("/presidentielle-2027"), texte: "Présidentielle 2027", etiquette: "Présidentielle 2027 : candidats, débats, réunions publiques, comment voter", icone: "flag", couleur: couleurs.dept },
  { ouvrir: () => router.push("/pour-vous"), texte: "Pour vous", etiquette: "Pour vous : ce qui a été publié selon votre vue", icone: "bookmark", couleur: couleurs.region },
  { ouvrir: () => router.push("/scrutins"), texte: "L'Assemblée", etiquette: "L'Assemblée : sa composition et ses votes publics", icone: "business", couleur: couleurs.france },
];

/* UN SEUL ACCUEIL (11/11/2026, audit d'architecture). Avec une commune gardée sur le téléphone,
   l'application s'ouvre sur « Aujourd'hui » : cet écran-ci redevient ce qu'il est, le choix de la
   commune, atteint par « ‹ Communes ». Une seule fois par lancement, et jamais pendant la première
   ouverture (les trois questions de bienvenue). */
let OUVERTURE_A_FAIRE = true;

export default function Accueil() {
  const groupesAccueil = useGroupes();
  const { mode: modeTheme, setChoix: choisirTheme } = useTheme(); /* l'accueil suit le thème : il se redessine quand le lecteur en change */
  const marges = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { choix, choisir, retenue, oublier } = useSelection();
  const { absent, profil } = useProfil();
  const prenom = profil ? profil.prenom : "";
  /* 13/11/2026 (porteur, ADR 0009) : au premier lancement (aucun profil gardé), l'accueil laisse la place à la
     question du prénom, juste après l'écran de démarrage. Une fois, et seulement depuis l'accueil : un lien
     ouvert sur une page précise n'est jamais détourné. */
  useEffect(() => { if (absent) router.replace("/bienvenue"); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  const [etat, setEtat] = useState<string>(ETATS.EN_COURS);
  const [beta, setBeta] = useState<Beta | null>(null);
  const [index, setIndex] = useState<Index | null>(null);
  const [filtre, setFiltre] = useState("");
  const [champActif, setChampActif] = useState(false);
  const [cherche, setCherche] = useState(false);
  const [page, setPage] = useState(0);
  const [essai, setEssai] = useState(0);
  const [argent, setArgent] = useState<Argent | null>(null);
  /* Le maire de la commune affichée, lu dans la même fiche que les comptes (RNE). */
  const [maire, setMaire] = useState<string | null>(null);
  const [voteVu, setVoteVu] = useState<VoteVu | null>(null);
  const [decExemple, setDecExemple] = useState<Record<string, string> | null>(null);
  /* V29 bloc 2a : la position de l'exemple, lue du relevé de l'Assemblée (null si non lisible). */
  const [positionExemple, setPositionExemple] = useState<string | null>(null);
  const [tout, setTout] = useState(false);
  /* V37 bloc 3 : « Voir toutes les communes » (recherche globale) ouvre la liste complète.
     Le paramètre porte un horodatage : une nouvelle demande est toujours prise en compte. */
  const params = useLocalSearchParams<{ toutes?: string }>();
  useEffect(() => {
    if (params.toutes) { setFiltre(""); setTout(true); }
  }, [params.toutes]);
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
  /* 12/11/2026 (porteur) : code postal, « st denis », faute de frappe (« melum » -> « Vouliez-vous dire Melun ? »). */
  const [codesPostaux, setCodesPostaux] = useState<Record<string, string[]> | null>(null);
  const cpTape = /^\d{5}$/.test(filtre.trim());
  useEffect(() => {
    if (!cpTape || codesPostaux) return undefined;
    let vivant = true;
    chargerCodesPostaux().then(r => {
      const c = (r.donnees as { codes?: Record<string, string[]> } | null)?.codes;
      if (vivant && c) setCodesPostaux(c);
    });
    return () => { vivant = false; };
  }, [cpTape, codesPostaux]);
  const recherche = useMemo(() => chercherCommunes(communes, filtre, { codesPostaux }), [communes, filtre, codesPostaux]);
  const trouvees = recherche.resultats as Ligne[];
  const suggestions = recherche.suggestions as Ligne[];
  const manquante = cherches.length && !recherche.codePostal ? manquantes.find(([, , c]) => correspond(cherches, c)) : undefined;
  const rien = (cherches.length > 0 || !!recherche.codePostal) && trouvees.length === 0 && !manquante && suggestions.length === 0;
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
    noterArrondissement(insee, filtre);
    const i = RECENTES.findIndex(x => x.insee === insee);
    if (i >= 0) RECENTES.splice(i, 1);
    RECENTES.unshift({ insee, nom });
    RECENTES.length = Math.min(RECENTES.length, 3);
    setRecentes([...RECENTES]);
    /* La recherche se referme une fois la commune choisie : au retour, l'accueil est propre. */
    setFiltre(""); setCherche(false); setTout(false);
    /* Sans profil (arrivée par un lien, sans passer par l'accueil) : la question du prénom, une seule fois. */
    if (absent) router.replace("/bienvenue");
    else router.push("/chez-vous");
  };

  /* La commune retenue sur ce telephone, si le lecteur l'a demande
     (lib/memoire.ts). Son nom vient de la liste publiee : si elle n'y figure
     plus, on ne propose rien plutot qu'un code nu. */
  const nomRetenue = retenue && beta ? beta.communes[retenue.c] : undefined;
  useEffect(() => {
    if (!beta) return;
    const ouvrirIci = OUVERTURE_A_FAIRE && retenue && nomRetenue && !params.toutes && !absent;
    OUVERTURE_A_FAIRE = false;
    if (ouvrirIci) ouvrir(retenue.c, nomRetenue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beta]);

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
      exempleIci ? null : chargerDeputes(), chargerCatalogueScrutins(), chargerVotes(dep),
    ]).then(([r, de, ca, vo]) => {
      if (!vivant) return;
      /* LE VOTE (D21) : seulement pour la commune retenue, et seulement si les deux releves
         de l'Assemblee se correspondent (positionsFiables). Sinon, l'exemple, dit comme tel. */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fv = r.donnees ? (r.donnees as any).communes?.[cible.insee] : null;
      setMaire(fv && fv.maire && typeof fv.maire.nom === "string" ? fv.maire.nom : null);
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
            if (sc) vu = { depute: [d.prenom, d.nom].filter(Boolean).join(" ") || d.nom, acteur: d.acteurRef, circo: Number(circos[0]), position: positionSur(pos, d.acteurRef, sc.n), d: sc.d, t: sc.t, dec: sc.dec, lien: srcVote(r.donnees as any, sc)?.url ?? undefined };
          }
        }
      }
      setVoteVu(vu);
      /* Le decompte de l'exemple vient du catalogue publie, pas du code. */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scEx = ca && ca.donnees ? ((ca.donnees as any).scrutins || []).find((x: { n: string }) => x.n === VOTE.n) : null;
      setDecExemple(scEx && scEx.dec ? scEx.dec : null);
      /* V29 bloc 2a : la position de l'exemple vient du relevé, comme pour un vrai député. Si les deux relevés
         ne se correspondent pas, pas de position : la carte le dit. */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const posEx: any = ca && ca.donnees && vo && vo.donnees && positionsFiables(ca.donnees as any, vo.donnees as any)
        ? positionSur(vo.donnees as any, VOTE.acteur, VOTE.n) : undefined;
      setPositionExemple(posEx === "p" || posEx === "c" || posEx === "a" ? posEx : null);
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
  /* La répartition des montants par habitant (salaires, investissement, autres) : seulement si elle s'additionne. */
  const repartition = argent && argent.salaires !== null && argent.investissement !== null && argent.salaires + argent.investissement <= argent.depenses
    ? { sal: Math.round(argent.salaires / argent.depenses * 100), inv: Math.round(argent.investissement / argent.depenses * 100), aut: 0 }
    : null;
  if (repartition) repartition.aut = 100 - repartition.sal - repartition.inv;
  const [budgetTout, setBudgetTout] = useState(false);

  const phrase = PHRASES[etat as keyof typeof PHRASES] as { titre: string; corps: string; action?: string } | undefined;

  /* PREMIERE OUVERTURE (D15, 30/10/2026) : aucune commune retenue sur ce telephone
     (cle unique repere.departement, invariant 2 : aucune autre cle). L'ecran devient
     l'accueil de bienvenue : grand logo, la phrase, et le champ deja ouvert. Pas
     d'ecran supplementaire : c'est cet ecran qui accueille. */
  const premiere = !retenue;
  const champOuvert = cherche || !!filtre || premiere;

  /* Le député montré : celui de la commune retenue, sinon celui de l'exemple (dit comme tel). */
  const deputeVu = voteVu && "depute" in voteVu ? { nom: voteVu.depute, circo: voteVu.circo, ref: voteVu.acteur } : exemple && !voteVu ? { nom: VOTE.depute, circo: 1, ref: VOTE.acteur as string } : null;
  const depCible = departementDe(cible.insee);
  /* Les cartes glissent horizontalement : le chiffre, puis le vote. Au-dessus (refonte « légère »,
     09/11/2026) : les décideurs du quotidien et la dernière publication de la mairie. */
  const cartes = (
    <>
            <Decideurs titre={exemple ? `Décideurs du quotidien · exemple : ${cible.nom}` : "Décideurs de votre quotidien"}
              maire={maire} depute={deputeVu ? deputeVu.nom : null} circo={deputeVu ? deputeVu.circo : null}
              groupeDepute={deputeVu ? groupeDe(deputeVu.ref, groupesAccueil) : null}
              photos={{ maire: maire && depCible ? { dep: depCible, cle: "M" + cible.insee } : null,
                depute: deputeVu && depCible ? { dep: depCible, cle: deputeVu.ref } : null }} />
            {!exemple ? <ActuMairie insee={cible.insee} nom={cible.nom} /> : null}
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
                    {/* NIVEAU 1 (V28, bloc 3) : l'accroche calculée, le chiffre, la source.
                        NIVEAU 2 (« Voir plus ») : comparaison à la médiane régionale, année précédente,
                        répartition. NIVEAU 3 (« Tout voir ») : méthode, source, lien officiel.
                        Rien n'est retiré : ce qui était affiché reste à un geste. */}
                    <Text style={s.carteTitre}>{accroche(argent)}</Text>
                    <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", columnGap: PAS * 2 }}>
                      <Text style={s.chiffre}>{espacesFines(`${argent.depenses.toLocaleString("fr-FR")} €`)}</Text>
                      <Text style={s.legende}>par habitant · {argent.an}</Text>
                      <PourquoiJeVois etiquette={`le montant de ${argent.nom}`} couleur={D.encre} fond={D.voile}
                        p={{ source: { texte: `Observatoire des finances et de la gestion publique locales (OFGL), comptes ${argent.an}${(index as any)?.sources?.comptes?.maj ? `, publiés le ${dateFr((index as any).sources.comptes.maj)}` : ""}`, lien: urlComptes },
                          calcul: USAGE_PAR_HABITANT,
                          ici: `Affiché parce que ce sont les comptes publiés les plus récents pour ${argent.nom} (${argent.an}).` }} />
                    </View>
                    {/* 07/11/2026 (maquette Stitch) : la jauge segmentée sort du « Voir plus » ; sa légende
                        écrit chaque part (la couleur ne porte jamais seule le sens). */}
                    {repartition ? (
                      <View style={{ gap: PAS * 2 }}>
                        <Barre parts={[{ cle: "s", valeur: repartition.sal, couleur: JAUGE.salaires }, { cle: "i", valeur: repartition.inv, couleur: JAUGE.investissement }, { cle: "a", valeur: repartition.aut, couleur: JAUGE.autres }]} />
                        <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: PAS * 4, rowGap: PAS }}>
                          {[[JAUGE.salaires, `${repartition.sal} € salaires`], [JAUGE.investissement, `${repartition.inv} € investissement`], [JAUGE.autres, `${repartition.aut} € autres`]].map(([c, l]) => (
                            <View key={l} style={{ flexDirection: "row", alignItems: "center", gap: PAS }}>
                              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c, borderWidth: 1, borderColor: D.trait }} />
                              <Text style={s.legende}>{l}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}
                    {comparaison || argent.avant || repartition ? (
                      <Details titre={moyenne ? titreEcart(argent.depenses, moyenne) : "Le détail des dépenses"} couleur={D.encre} lien={D.encre}>
                        {moyenne ? (
                          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <Text style={s.contexte}>{comparaison ? comparaison.rapport : ""}</Text>
                            <PourquoiJeVois etiquette={`la comparaison à la commune médiane`} couleur={D.encre} fond={D.voile}
                              p={{ source: { texte: `Observatoire des finances et de la gestion publique locales (OFGL), comptes ${moyenne.an}`, lien: urlComptes },
                                calcul: `Repère classe les ${moyenne.n.toLocaleString("fr-FR")} communes de la région pour ${moyenne.an} selon leur dépense par habitant. La médiane est celle de la commune du milieu : la moitié dépense moins, l'autre moitié plus. Repère calcule cette médiane ; l'OFGL ne la publie pas.`,
                                ici: `Affiché parce que ${argent.nom} est la commune retenue et que ses comptes ${moyenne.an} sont publiés, comme ceux des communes de sa région.` }} />
                          </View>
                        ) : null}
                        {argent.avant ? <Text style={s.contexte}>En {argent.avant.an} : {argent.avant.depenses.toLocaleString("fr-FR")} € par habitant</Text> : null}
                      </Details>
                    ) : null}
                    <Pressable onPress={() => setBudgetTout(true)} accessibilityRole="button"
                      accessibilityLabel={`Tout voir sur le budget de ${argent.nom} : méthode, sources, lien officiel`}
                      style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", alignSelf: "flex-start", ...enfonce(pressed) })}>
                      <Text style={[s.legende, { fontSize: 14 }]}>Tout voir : méthode et sources</Text>
                    </Pressable>
                    <SignalerErreur contexte={`le budget de ${argent.nom}`} donnee={`${argent.depenses.toLocaleString("fr-FR")} € par habitant en ${argent.an}`} />
                    <ModaleExhaustif titre={`Budget de ${argent.nom}`} visible={budgetTout} onFermer={() => setBudgetTout(false)} sections={[
                      { titre: "Le montant", contenu: `${argent.depenses.toLocaleString("fr-FR")} € par habitant en ${argent.an}. ${USAGE_PAR_HABITANT}`, source: "Observatoire des finances et de la gestion publique locales (OFGL)" },
                      { titre: "La répartition", contenu: repartition ? `Sur 100 € dépensés : ${repartition.sal} € vont aux salaires des agents, ${repartition.inv} € aux investissements, ${repartition.aut} € aux autres dépenses.` : "Les comptes publiés ne permettent pas de calculer cette répartition.", source: "Observatoire des finances et de la gestion publique locales (OFGL)" },
                      { titre: "Comment Repère calcule", contenu: METHODE_COMPTES },
                      { titre: "La comparaison", contenu: comparaison ? comparaison.note : "Pas de commune médiane calculable pour ce budget." },
                      { titre: "Source officielle", contenu: urlComptes
                        ? <Pressable onPress={() => Linking.openURL(urlComptes)} accessibilityRole="link" accessibilityLabel="Les comptes publiés, sur le site de l'OFGL, ouvre un site externe"
                            style={({ pressed }) => ({ minHeight: CIBLE, justifyContent: "center", ...enfonce(pressed) })}>
                            <Text style={TYPO.corps}>Les comptes publiés, sur le site de l'OFGL (site externe)</Text>
                          </Pressable>
                        : "Aucun lien officiel publié." },
                    ]} />
                    <Pressable onPress={() => { if (urlComptes) Linking.openURL(urlComptes); }} accessibilityRole="link"
                      accessibilityLabel="Source : comptes des communes publiés par l'OFGL, ouvre un site externe. Médiane et parts calculées par Repère."
                      style={({ pressed }) => ({ minHeight: 44, justifyContent: "center", ...enfonce(pressed) })}>
                      <Text style={[s.legende, { fontSize: 14 }]}>Source : OFGL · médiane et parts : calcul Repère</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              <View style={{ width: larg }}>
                {voteVu && "depute" in voteVu ? (
                  <CarteVote etiquette="Le dernier vote publié de votre député" nom={voteVu.depute} acteur={voteVu.acteur}
                    ligne={`Député de la ${ordinal(voteVu.circo)} circonscription · ${nomDep(departementDe(cible.insee) || "")}`}
                    position={voteVu.position} dec={voteVu.dec} date={dateFr(voteVu.d)} titre={titreLisible(voteVu.t)} lien={voteVu.lien} />
                ) : voteVu && "partagee" in voteVu ? (
                  <View style={s.carte}>
                    <Text style={s.etiquette}>Votre député</Text>
                    <Text style={s.carteTitre}>Il dépend de votre adresse</Text>
                    <Text style={s.legende}>{cible.nom} est partagée entre {voteVu.partagee} circonscriptions. Repère ne choisit pas un député à votre place : ses votes sont sur l'écran de la commune.</Text>
                  </View>
                ) : (
                  <CarteVote etiquette="Un exemple" nom={VOTE.depute} acteur={VOTE.acteur}
                    ligne="Député de la 1re circonscription de Seine-et-Marne" position={positionExemple} dec={decExemple}
                    date={dateFr(VOTE.date)} titre={titreLisible(VOTE.titre)} exemple />
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
            {/* L'EN-TÊTE (07/11/2026, refonte de la zone haute) : une barre (marque à gauche, deux
                outils à droite), une ligne d'état discrète (date des données, vue), puis le pitch,
                UNE action principale (chercher une commune) et trois accès rapides en tuiles.
                Avant : sept éléments empilés, quatre styles de lien, le logo seul au milieu. */}
            <View style={s.barreHaut}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: PAS * 2 }}>
                {/* Le logo vit dans la marque, une seule fois (brief V47) ; il ne flotte plus au milieu du hero. */}
                {/* Le logo de Repère tel quel (ui/logo.tsx) : anneau, anneau intermédiaire gris, point.
                    La variante « mono » (sans anneau gris) avait été posée ici par erreur le 09/11/2026. */}
                <Logo size={26} variant={modeTheme} />
                <Text style={s.marque} accessibilityLabel="Repère">Repère<Text style={{ color: E.ville }}>.</Text></Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* 12/11/2026 (porteur) : la bascule clair / sombre, à un geste dès l'accueil. */}
                <Pressable onPress={() => choisirTheme(modeTheme === "sombre" ? "clair" : "sombre")} accessibilityRole="button"
                  accessibilityLabel={modeTheme === "sombre" ? "Passer en mode clair" : "Passer en mode sombre"}
                  style={({ pressed }) => [s.outil, pressed && enfonce(true)]}>
                  <Ionicons name={modeTheme === "sombre" ? "sunny-outline" : "moon-outline"} size={22} color={D.encre} accessible={false} importantForAccessibility="no" />
                </Pressable>
                <Pressable onPress={() => router.push("/confort-lecture")} accessibilityRole="link" accessibilityLabel="Confort de lecture"
                  style={({ pressed }) => [s.outil, pressed && enfonce(true)]}>
                  <Ionicons name="text-outline" size={22} color={D.encre} />
                </Pressable>
                {/* V37 bloc 3 : la recherche globale (communes, élus, scrutins). */}
                <Pressable onPress={() => router.push("/recherche")} accessibilityRole="button"
                  accessibilityLabel="Ouvrir la recherche : communes, élus, scrutins"
                  style={({ pressed }) => [s.outil, pressed && enfonce(true)]}>
                  <Ionicons name="search-outline" size={22} color={D.encre} />
                </Pressable>
              </View>
            </View>
            {/* Invariant 9 : la date des données reste visible, en tête, sans prendre la place du contenu. */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", columnGap: PAS * 3 }}>
              <DatePublication />
            </View>
            {/* LE PITCH : une citation, en grand. Demande du CEO (30/10/2026) : elle remplace le paragraphe.
                07/11/2026 (porteur) : titre court, les deux questions du produit, mot pour mot. */}
            {/* 07/11/2026 (porteur, refonte globale) : plus de slogan ; la recherche devient le héros.
                Le titre reste pour le lecteur d'écran (un écran sans titre est une impasse). */}
            <Text style={s.titreCache} accessibilityRole="header">Repère, accueil</Text>
            {/* Maquette Stitch « Recherche » (09/11/2026) : l'accroche, au-dessus de la recherche. */}
            {/* 13/11/2026 (ADR 0009) : le prénom, s'il a été donné. Il vient de repere.profil, jamais du réseau. */}
            {prenom ? <Text style={[s.accroche, { fontFamily: POLICE.affiche, color: D.encre }]} testID="bonjour">Bonjour {prenom}</Text> : null}
            <Text style={s.accroche}>Ce qui se passe chez vous, expliqué simplement.</Text>
            {!champOuvert ? (
              <Pressable onPress={() => setCherche(true)} accessibilityRole="button" accessibilityLabel="Chercher une commune"
                style={({ pressed }) => [s.chercher, pressed && enfonce(true)]}>
                <Ionicons name="search" size={24} color={D.encre} accessible={false} importantForAccessibility="no" />
                <Text style={s.chercherTexte}>Chercher une commune</Text>
              </Pressable>
            ) : null}
            {/* 12/11/2026 (porteur) : les thèmes en un geste ; la recherche s'ouvre filtrée. */}
            <ChipsThemes />
            <View style={s.tuiles}>
              {ACCES.map(a => (
                <Pressable key={a.texte} onPress={a.ouvrir} accessibilityRole="link" accessibilityLabel={a.etiquette}
                  style={({ pressed }) => [s.tuile, pressed && enfonce(true)]}>
                  {/* Refonte (porteur, 09/11/2026) : plus de fond coloré ; l'icône au contour, dans l'encre. */}
                  <Ionicons name={`${a.icone}-outline` as keyof typeof Ionicons.glyphMap} size={22} color={D.encre} accessible={false} importantForAccessibility="no" />
                  <Text style={s.tuileTexte}>{a.texte}</Text>
                </Pressable>
              ))}
            </View>

            {/* 12/11/2026 (porteur) : le quiz, bien visible. Remplace la bannière « moins de 18 ans », qui menait à la même page que la
                tuile « Présidentielle 2027 » (doublon) ; le guide « Ma voix » reste à un geste sur cette page. */}
            <Pressable onPress={() => router.push("/quiz")} accessibilityRole="link"
              accessibilityLabel="Testez votre culture civique : jouer au quiz"
              style={({ pressed }) => [s.jeunes, pressed && enfonce(true)]}>
              <Ionicons name="school-outline" size={22} color={ACCENTS.autorite} accessible={false} importantForAccessibility="no" />
              <View style={{ flex: 1 }}>
                <Text style={s.tuileTexte}>Testez votre culture civique</Text>
                <Text style={s.note}>Quatre définitions, une seule juste.</Text>
              </View>
              <Text style={[s.tuileTexte, { color: ACCENTS.autorite }]}>Jouer ›</Text>
            </Pressable>

            {/* V37 bloc 6 : le rappel de la prochaine élection, s'il tombe dans les 180 jours. */}
            {premiere ? null : <View style={{ marginTop: PAS * 4 }}><RappelElection /></View>}
            {premiere ? null : <DernieresPublications />}
            {premiere ? null : cartes}

            {retenue && nomRetenue ? (
              <Carte echelon="ville" titre="Votre commune, sur cet appareil">
                <Texte fort>{nomRetenue}</Texte>
                <Bouton texte={`Voir ce qui se passe à ${nomRetenue}`} onPress={() => ouvrir(retenue.c, nomRetenue)} />
                <Bouton texte={`Oublier ${nomRetenue}`} discret onPress={oublier} />
              </Carte>
            ) : null}
            {champOuvert ? (
              <>
                <Text style={s.question} nativeID="question">{retenue && nomRetenue ? "Une autre commune ?" : "Où habitez-vous ?"}</Text>
                <View style={[s.champLigne, champActif && Platform.OS === "web" && { borderColor: E.ville }]}>
                  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={s.loupe}>
                    <View style={s.loupeRond} />
                    <View style={s.loupeManche} />
                  </View>
                <TextInput
                  value={filtre}
                  onChangeText={setFiltre}
                  onFocus={() => setChampActif(true)}
                  onBlur={() => setChampActif(false)}
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
                    style={({ pressed }) => [s.resultat, pressed && enfonce(true)]}>
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
                {/* Maquette Stitch : les réassurances en pied. « Compris en 4 secondes » n'est pas
                    repris : ce n'est pas mesuré. « Données certifiées » devient « publiques et sourcées ». */}
                <View style={s.reassurances}>
                  {([["person-remove-outline", "Aucun compte"], ["document-text-outline", "Données publiques, chacune avec sa source"]] as [keyof typeof Ionicons.glyphMap, string][]).map(([i, t]) => (
                    <View key={t} style={s.reassurance}>
                      <Ionicons name={i} size={18} color={ACCENTS.autorite} accessible={false} importantForAccessibility="no" />
                      <Text style={[s.note, { color: D.encre, flex: 1 }]}>{t}</Text>
                    </View>
                  ))}
                </View>
                {/* CE QUE REPERE SAIT DE VOUS : rien. Phrase vraie a la lettre :
                    les adresses se composent par departement (client.js), et la
                    commune n'est gardee que sur demande (lib/memoire.ts). */}
                {/* Audit 5 s (V19) : une ligne ; l'explication complete est dans la FAQ. */}
                <Pressable onPress={() => router.push("/faq")} accessibilityRole="link"
                  accessibilityLabel="Pas de compte, pas d'e-mail. Pourquoi ? Ouvre les questions fréquentes"
                  style={({ pressed }) => [s.confiance, { minHeight: 48, justifyContent: "center" }, pressed && enfonce(true)]}>
                  <Text style={[s.note, { color: D.encre, fontWeight: "500" }]}>Pas de compte, pas d'e-mail. <Text style={{ fontWeight: "400", color: D.sourd }}>Pourquoi ?</Text></Text>
                </Pressable>
                {/* V29 bloc 1 (audit D51) : phrase retirée de l'accueil en V20, réintégrée au niveau 2. */}
                <Details titre="Repère ne sait pas qui vous êtes" couleur={D.encre} lien={D.encre}>
                  <Text style={[s.note, { color: D.sourd }]}>Pour afficher votre commune, il télécharge le fichier public de tout votre département, et ne garde votre commune sur cet appareil que si vous le lui demandez.</Text>
                </Details>
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
            {suggestions.length ? (
              /* Une suggestion se propose, elle ne s'applique jamais seule : un toucher met le nom dans le champ. */
              <View accessibilityLiveRegion="polite" style={{ gap: PAS * 2 }}>
                <Text style={s.legende}>Aucune commune ne s'écrit ainsi. Vouliez-vous dire…</Text>
                {suggestions.map(([insee, nom]) => <Bouton key={insee} texte={nom} discret onPress={() => setFiltre(nom)} />)}
              </View>
            ) : null}
            {recherche.codePostal && trouvees.length === 0 && !manquante ? (
              recherche.codePostal.disponible
                ? <Vide titre={`Aucune commune d'Île-de-France pour le code postal ${recherche.codePostal.saisi}.`}
                    corps="Pendant la bêta, l'application ne couvre que l'Île-de-France. Vous pouvez aussi taper le nom de la commune."
                    action="Effacer la recherche" onAction={() => setFiltre("")} />
                : <Vide titre="La recherche par code postal n'est pas encore disponible."
                    corps="Tapez le nom de la commune : Repère la retrouve même avec une faute de frappe."
                    action="Effacer la recherche" onAction={() => setFiltre("")} />
            ) : null}
            {rien && !recherche.codePostal ? (
              /* 08/10/2026 : « Rien ne correspond » laissait croire que la commune
                 n'existe pas. L'application ne couvre que l'Ile-de-France pendant la
                 beta : c'est une limite de couverture, pas une absence de donnees. */
              <Vide titre={`Aucune commune d'Île-de-France ne correspond à « ${filtre.trim()} ».`}
                corps="Pendant la bêta, l'application ne couvre que l'Île-de-France : pour une commune d'ailleurs, les données ne sont pas encore disponibles ici. Sinon, vérifiez l'orthographe du début du nom."
                action="Effacer la recherche" onAction={() => setFiltre("")} />
            ) : null}
            {rien && !recherche.codePostal ? (
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
  /* Taille 26 : la pastille « Chercher » passe sous le logo au lieu de sortir de la marge. */
  barreHaut: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  outil: { width: CIBLE, height: CIBLE, alignItems: "center", justifyContent: "center" },
  tuiles: { flexDirection: "row", flexWrap: "wrap", gap: PAS * 2 },
  /* Fond D.voile : la teinte demandée par le porteur à 3 unités près, sans couleur hors palette. */
  tuile: { width: "48%", flexGrow: 1, minHeight: 76, gap: PAS * 2, padding: PAS * 3, borderRadius: RAYON.bloc, backgroundColor: D.carte, ...(Platform.OS === "web" ? { borderWidth: 1, borderColor: FILET_TUILE.filet } : {}), justifyContent: "space-between" },
  tuileTexte: { fontFamily: POLICE.titre, fontSize: 14, lineHeight: 20, color: D.encre },
  marque: { fontFamily: POLICE.affiche, fontSize: 20, color: D.encre },
  /* L'action principale : plus haute, filet plus marqué (refonte du 09/11/2026). */
  chercher: { minHeight: 60, borderRadius: RAYON.bloc, backgroundColor: D.carte, borderWidth: 1.5, borderColor: D.sourd, paddingHorizontal: PAS * 5, flexDirection: "row", alignItems: "center", gap: PAS * 3, marginTop: PAS * 4, ...OMBRE },
  titreCache: { position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 },
  tuileIcone: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  chercherTexte: { fontFamily: POLICE.titre, fontSize: 17, color: D.encre },
  citation: { fontFamily: POLICE.affiche, fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: D.encre, marginTop: PAS * 6 },
  carte: { gap: PAS * 3, padding: PAS * 5, borderRadius: RAYON.carte, backgroundColor: D.carte, ...OMBRE },
  etiquette: { fontSize: 14, fontWeight: "500", color: D.sourd },
  carteTitre: { fontFamily: POLICE.titre, fontSize: 17, lineHeight: 24, color: D.encre },
  chiffre: { fontFamily: POLICE.donneeForte, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: D.encre },
  vote: { fontFamily: POLICE.titre, fontSize: 17, lineHeight: 24, color: D.encre },
  legende: { fontFamily: POLICE.texte, fontSize: 14, lineHeight: 22, color: D.sourd },
  contexte: { fontSize: 15, lineHeight: 21, color: D.encre },
  /* Refonte « légère » : une jauge fine. */
  barre: { flexDirection: "row", height: 6, borderRadius: 3, overflow: "hidden", backgroundColor: D.voile, gap: 2 },
  badge: { alignSelf: "flex-start", paddingHorizontal: PAS * 2, paddingVertical: PAS, borderRadius: RAYON.bloc, backgroundColor: D.voile },
  badgeTexte: { fontSize: 14, fontWeight: "500", color: D.sourd },
  points: { flexDirection: "row", justifyContent: "center", gap: PAS * 2 },
  point: { width: 8, height: 8, borderRadius: 4, backgroundColor: D.trait },
  pointActif: { backgroundColor: E.ville },
  confiance: { gap: PAS, padding: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: D.voile, marginTop: PAS * 2 },
  question: { fontFamily: POLICE.titre, fontSize: 20, lineHeight: 26, color: D.encre, marginTop: PAS * 6 },
  champLigne: {
    flexDirection: "row", alignItems: "center", minHeight: CIBLE + 8, borderRadius: 999, borderWidth: 1.5, borderColor: D.trait,
    backgroundColor: D.carte, paddingLeft: PAS * 4, ...OMBRE,
  },
  loupe: { width: 18, height: 18, marginRight: PAS * 2 },
  loupeRond: { position: "absolute", top: 0, left: 0, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: D.sourd },
  loupeManche: { position: "absolute", right: 0, bottom: 1, width: 7, height: 2, borderRadius: 1, backgroundColor: D.sourd, transform: [{ rotate: "45deg" }] },
  champ: {
    flex: 1, minHeight: CIBLE + 8, paddingHorizontal: PAS * 2, fontSize: 18, color: D.encre, borderRadius: 999,
    /* Sur l'export web, le contour de focus par defaut du navigateur est orange :
       une sixieme couleur (invariant 7). Le contour de l'INPUT est supprime : la barre ENTIERE
       (loupe comprise) prend la couleur de la commune au focus (12/11/2026, Safari : le trait
       interne laissait la loupe en dehors). Sans effet sur iOS et Android. */
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as object) : {}),
  },
  note: { fontFamily: POLICE.texte, fontSize: 14, lineHeight: 22, color: D.sourd },
  accroche: { fontFamily: POLICE.affiche, fontSize: 22, lineHeight: 30, letterSpacing: -0.2, color: D.encre, marginTop: PAS * 4 },
  jeunes: { minHeight: CIBLE + 16, flexDirection: "row", alignItems: "center", gap: PAS * 3, padding: PAS * 4, borderRadius: RAYON.carte, backgroundColor: ACCENTS.fondCivique, borderWidth: 1, borderColor: D.trait },
  reassurances: { gap: PAS * 2 },
  reassurance: { flexDirection: "row", alignItems: "center", gap: PAS * 2 },
  resultat: {
    minHeight: CIBLE + 8, flexDirection: "row", alignItems: "center", gap: PAS * 3,
    paddingHorizontal: PAS * 4, borderRadius: RAYON.bloc, backgroundColor: D.carte,
    ...OMBRE,
  },
  pastille: { width: 10, height: 10, borderRadius: 5, backgroundColor: E.ville },
  resultatNom: { flex: 1, fontSize: 17, color: D.encre, fontWeight: "500" },
  resultatDep: { fontSize: 14, color: D.sourd, flexShrink: 1, textAlign: "right" },
}));
