/* Le client de données : chargement paresseux, cache, préchargement.
 *
 * TROIS ÉTAGES, dans cet ordre : mémoire, IndexedDB, réseau. Le réseau n'est
 * touché que si les deux premiers sont vides — c'est ce qui fait qu'un lecteur
 * hors ligne, revenu le lendemain, voit encore son département.
 *
 * UNE SEULE FONCTION COMPOSE LES ADRESSES. C'est délibéré : deux endroits qui
 * dérivent la même règle finissent toujours par diverger, et ici la règle est
 * un invariant — aucune adresse ne doit porter un code de commune.
 */
import { magasin, oublierMemoire } from "./store.js";
import { adresseFautive } from "./invariants.js";

export let BASE_DONNEES = "/data";

/* L'APPLICATION MOBILE LIT LES MEMES FICHIERS, SUR LE MEME HOTE (29/09/2026).
 * Le site les sert a cote de lui (« /data ») ; l'application, qui n'a pas
 * d'hote a elle, les lit a l'adresse publique du site. Seule la BASE change :
 * les chemins, la garde de chaque adresse (aucun code de commune) et la
 * lecture restent ceux de ce fichier, la seule fabrique d'adresses du produit.
 * Une base qui porterait elle-meme un code de commune est refusee. */
export function configurerBase(base) {
  const b = String(base || "").replace(/\/+$/, "");
  if (!/^(https:\/\/[a-z0-9.-]+(:\d+)?)?(\/[A-Za-z0-9_-]+)*$/.test(b) || adresseFautive(b + "/")) {
    throw new Error("base de donnees refusee : " + base);
  }
  BASE_DONNEES = b;
}

/* DETTE DE FRAICHEUR, FERMEE LE 22/09/2026 (mission phase 3.2, §7).
 *
 * LE DEFAUT TROUVE, EN TESTANT LE PORTAGE DES ELUS LE MEME JOUR : un onglet
 * qui avait deja visite Repere gardait dans IndexedDB un `index.json` mis en
 * cache AVANT l'ajout du champ `region_code` — et affichait "aucune donnee
 * regionale publiee" pour l'Ile-de-France, qui en a pourtant une. Rien ne
 * comparait jamais la FORME du cache a celle que le code qui tourne
 * s'attend a lire. Un navigateur revenu le lendemain d'un jour ou le schema
 * a change aurait garde ce mensonge indefiniment, sans qu'aucun message
 * d'erreur ne le signale — une panne silencieuse, la plus difficile a voir.
 *
 * LE MECANISME, MINIMAL : `index.json` porte deja un champ `v` (pose par
 * extract-html.js, jamais exploite jusqu'ici). SCHEMA_ATTENDU est LA MEME
 * VALEUR, mais figee dans le CODE CLIENT — donc dans le paquet JS construit
 * a un instant donne. Si le cache et le code divergent, le cache est
 * FAUX PAR CONSTRUCTION, pas seulement perime : on le jette entierement
 * (pas seulement l'index — un departement mis en cache la meme semaine
 * appartient a la meme generation de schema) et on repart au reseau.
 *
 * CE QUE CE MECANISME NE FAIT PAS : bumper SCHEMA_ATTENDU n'est pas
 * automatique et ne doit jamais l'etre — un changement qui ne touche pas la
 * FORME des donnees (un nouveau champ optionnel, une correction de contenu)
 * n'a pas besoin de vider le cache de tout le monde. C'est une decision
 * humaine, au moment ou une extraction change reellement de forme.
 *
 * DISTINCT DE `build_id` (voir extract-html.js) : SCHEMA_ATTENDU gouverne
 * la mise au rebut du cache ; `build_id` est une provenance informative
 * (quel commit a produit ces donnees), qui change tous les jours sans
 * jamais devoir vider quoi que ce soit — sinon la mise en cache perdrait
 * tout son sens. */
export const SCHEMA_ATTENDU = 1;

/* La SEULE fabrique d'adresses du produit. */
export function adresseDepartement(dep) {
  const d = String(dep).toUpperCase();
  if (!/^(\d{2,3}|2[AB])$/.test(d)) throw new Error("code de departement invalide : " + dep);
  const url = `${BASE_DONNEES}/departments/${d}.json`;
  /* Ceinture et bretelles : la garde relit ce qu'elle vient de composer. Le jour
     ou quelqu'un ajoutera un parametre, elle le verra. */
  if (adresseFautive(url)) throw new Error("adresse fautive composee : " + url);
  return url;
}
export function adresseIndex() { return `${BASE_DONNEES}/index.json`; }
/* Le fichier des deputes ne porte AUCUN code de commune, et n'est demande que
   par l'ecran qui l'affiche : la maille reste la circonscription. */
export function adresseDeputes() { return `${BASE_DONNEES}/deputes.json`; }
/* LE CATALOGUE DES SCRUTINS : ce sur quoi on a vote, sans aucune position.
   Commun a toute la France, demande une seule fois, et seulement par l'ecran
   qui affiche les votes. */
export function adresseScrutins() { return `${BASE_DONNEES}/scrutins.json`; }
/* L'INDEX DE LA BETA : nom de commune -> code INSEE, pour les huit departements
   d'Ile-de-France. Il ne sert QU'A trouver un departement : le code INSEE ne
   sort jamais de la memoire du navigateur, et aucune adresse n'est composee avec
   lui. C'est ce que garde `adresseFautive`. */
export function adresseCommunesBeta() { return `${BASE_DONNEES}/communes-beta.json`; }
/* LES COMPTES REGIONAUX : un seul petit fichier, commun a toute la France —
   comme scrutins.json. Les comptes DEPARTEMENTAUX, eux, vivent directement
   dans chaque paquet departemental (`adresseDepartement`) : un departement ne
   pese que 1,4 Ko de plus, et le paquet est deja telecharge pour toute autre
   raison. Une region couvre plusieurs departements — la dupliquer dans chacun
   coalescerait plus cher que ce seul fichier, encore une fois commun a la
   France entiere et jamais adresse par code de commune ou de departement. Il
   ne part qu'a l'ouverture de « Ou va l'argent ». */
export function adresseComptesRegions() { return `${BASE_DONNEES}/comptes-regions.json`; }
/* LE CONSEIL REGIONAL, UN FICHIER PAR REGION — jamais un fichier France
   entiere (mesure le 22/09/2026 : 148 Ko pour 14 regions contre 17 Ko pour
   la seule Ile-de-France, voir extract-html.js). Le code de region n'est
   PAS un code de commune ni un code de departement : deux caracteres qui
   ne peuvent jamais coincider avec un code INSEE a cinq chiffres, la meme
   propriete que la garde `adresseFautive` verifie ailleurs. */
export function adresseElusRegion(code) {
  const c = String(code);
  if (!/^\d{2}$/.test(c)) throw new Error("code de region invalide : " + code);
  const url = `${BASE_DONNEES}/elus-regions/${c}.json`;
  if (adresseFautive(url)) throw new Error("adresse fautive composee : " + url);
  return url;
}
/* LE CALENDRIER CITOYEN, PILOTE SENAT : un seul fichier, commun a toute la
   France — un agenda parlementaire n'est pas une donnee territoriale, et ne
   porte donc jamais de code de departement ni de commune. */
export function adresseCalendrierSenat() { return `${BASE_DONNEES}/calendrier-senat.json`; }
export function adresseAgendaAN() { return `${BASE_DONNEES}/agenda-an.json`; }
export function adresseScrutinsSolennels() { return `${BASE_DONNEES}/scrutins-solennels.json`; }
/* COUCHE 1, PAS COUCHE 2 — le teaser (8 plus recents, titre tronque) que
   "Ce qui se passe" charge d'emblee avec le Senat et l'Assemblee, PAS le
   detail complet des 95 (celui-ci n'arrive qu'au clic "Voir tous les
   scrutins recents", via chargerScrutinsSolennels ci-dessus). Mesure le
   23/09/2026 : 1,3-1,9 Ko contre 29,8 Ko pour le fichier complet — c'est
   cet ecart qui justifie deux fichiers plutot qu'un. */
export function adresseScrutinsSolennelsRecents() { return `${BASE_DONNEES}/scrutins-solennels-recents.json`; }
export function adresseQuestionsGouvernementIndex() { return `${BASE_DONNEES}/questions-gouvernement-index.json`; }
export function adresseQuestionGouvernementLot(lot) {
  const n = Number(lot);
  if (!Number.isInteger(n) || n < 0 || n > 9999) throw new Error("lot QAG invalide : " + lot);
  const lotPadded = String(n).padStart(4, "0");
  return `${BASE_DONNEES}/questions-gouvernement/${lotPadded}.json`;
}
export function adresseScrutinsIndex() { return `${BASE_DONNEES}/scrutins-index.json`; }
export function adresseScrutinLot(lot) {
  const n = Number(lot);
  if (!Number.isInteger(n) || n < 0 || n > 9999) throw new Error("lot de scrutin invalide : " + lot);
  const lotPadded = String(n).padStart(4, "0");
  return `${BASE_DONNEES}/scrutins-details/${lotPadded}.json`;
}
/* LE FIL EDITORIAL — voir lib/faits.js pour la tracabilite complete (source
   YAML -> geste humain -> outils/evenements.py -> ce fichier). Un seul
   fichier pour la France entiere, jamais un code de commune dans l'adresse :
   les evenements a l'echelle d'une commune portent leur "insee" comme CLE a
   l'interieur du fichier, jamais comme parametre de la requete. */
export function adresseEvenements() { return `${BASE_DONNEES}/evenements.json`; }
/* LES POSITIONS, PAR DEPARTEMENT — jamais par depute, jamais par commune. Une
   adresse par depute dirait au serveur quel elu on regarde, donc, a une
   circonscription pres, ou l'on habite. Deuxieme et derniere fabrique
   d'adresses departementales : elle passe la meme garde que la premiere. */
export function adresseVotes(dep) {
  const d = String(dep).toUpperCase();
  if (!/^(\d{2,3}|2[AB])$/.test(d)) throw new Error("code de departement invalide : " + dep);
  const url = `${BASE_DONNEES}/scrutins/${d}.json`;
  if (adresseFautive(url)) throw new Error("adresse fautive composee : " + url);
  return url;
}
/* LES PROJETS FINANCES PAR L'ETAT, PAR DEPARTEMENT — et surtout pas par
   commune. C'est la seule donnee du produit qui soit propre a UNE commune et
   non a un territoire entier : une adresse par commune aurait donc dit au
   serveur, exactement, ou habite celui qui regarde. Le paquet departemental
   porte les projets de toutes ses communes, et le tri se fait dans le
   navigateur. Troisieme et derniere fabrique d'adresses departementales. */
export function adresseProjets(dep) {
  const d = String(dep).toUpperCase();
  if (!/^(\d{2,3}|2[AB])$/.test(d)) throw new Error("code de departement invalide : " + dep);
  const url = `${BASE_DONNEES}/projets/${d}.json`;
  if (adresseFautive(url)) throw new Error("adresse fautive composee : " + url);
  return url;
}

/* CE QUI A ETE RETIRE ICI, PUIS REMIS, ET POURQUOI.
 *
 * Un chargement de `data/deputes.json` vivait a cet endroit. Il partait au
 * reseau des l'ouverture de l'application — 87 Ko avant meme le choix d'un
 * departement — sans cache, sans test de coupure reseau, et l'ecran qui devait
 * l'afficher ne le lisait jamais. Surtout : ce fichier ne declarait ni
 * producteur, ni licence, ni date, alors que l'invariant 4 exige que chaque
 * information affichee porte sa source. Il a donc ete retire.
 *
 * Il revient le 28 aout 2026, avec les quatre choses qui lui manquaient : le
 * releve est versionne dans scripts/deputes.json avec son producteur, sa
 * licence, sa legislature et sa date, l'extraction refuse de publier un fichier
 * qui n'en porterait pas, et il traverse maintenant les trois etages — memoire,
 * IndexedDB, reseau — comme un departement. Il ne part QUE si le lecteur ouvre
 * « Qui decide » : le premier ecran ne le demande pas.
 */

const enVol = new Map();   /* dédoublonne les requêtes simultanées */

export const ETATS = Object.freeze({
  ABSENT: "absent", EN_COURS: "en cours", SERVI: "servi",
  ECHEC: "echec", HORS_LIGNE: "hors ligne", INTROUVABLE: "introuvable",
  INVALIDE: "invalide",
});

/* Les phrases de la doctrine du vide. Chaque état a la sienne, et elles disent
   des choses DIFFÉRENTES : confondre « pas encore arrivé » avec « la source ne
   le porte pas » ferait mentir le produit à l'endroit où il demande d'être cru.
   QUATRE CAUSES D'ECHEC, QUATRE PHRASES (30/09/2026) : le reseau n'a pas
   abouti (ECHEC), l'appareil se sait hors ligne (HORS_LIGNE), le fichier
   manque (INTROUVABLE, 404), ou le serveur a repondu autre chose qu'un jeu de
   donnees (INVALIDE : page HTML servie en 200, JSON illisible). Jusqu'ici ce
   dernier cas disait « Repère n'a pas réussi à joindre le serveur » : faux, le
   serveur avait repondu. */
export const PHRASES = Object.freeze({
  [ETATS.EN_COURS]: {
    titre: "Chargement des données de votre département.",
    corps: "Quelques centaines de kilo-octets. Ensuite, Repère fonctionne sans réseau.",
  },
  [ETATS.ECHEC]: {
    titre: "Repère n'a pas réussi à joindre le serveur.",
    corps: "Pour afficher les données de votre département, vérifiez votre connexion et réessayez.",
    action: "Réessayer",
  },
  [ETATS.HORS_LIGNE]: {
    titre: "Vous êtes hors ligne, et ce département n'a jamais été téléchargé sur cet appareil.",
    corps: "Il le sera à votre prochaine connexion. Rien ne se perdra entre-temps.",
  },
  [ETATS.INTROUVABLE]: {
    titre: "Ce département ne figure pas dans le découpage publié.",
    corps: "Le réseau fonctionne : c'est le fichier qui manque, et c'est de notre côté.",
    lien: { texte: "Voir la source officielle", url: "https://www.data.gouv.fr/" },
  },
  [ETATS.INVALIDE]: {
    titre: "Le serveur a répondu, mais pas avec les données attendues.",
    corps: "Le réseau fonctionne : c'est le fichier publié qui pose problème, et c'est de notre côté.",
    action: "Réessayer",
  },
});

/* TOUJOURS UNE VERSION A JOUR, JAMAIS UNE COPIE PRISE POUR NEUVE (30/09/2026).
   Chaque demande passe outre les caches HTTP et celui du service worker
   (`cache: "no-cache"`, que sw.js sert reseau d'abord). Faille trouvee apres
   #58 : un fichier absent du magasin etait demande sans cette consigne ; le
   service worker rendait alors sa vieille copie, que ce client notait comme
   « generation courante » — une donnee ancienne presentee comme actuelle.
   Quand le reseau echoue, sw.js rend sa copie en la MARQUANT (en-tete
   x-repere-secours) : ce client la sert, mais comme publication precedente. */
async function auReseau(url, delaiMs) {
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), delaiMs);
  let rep;
  try {
    rep = await fetch(url, { credentials: "omit", signal: ctrl.signal, cache: "no-cache" });
  } catch (e) {
    clearTimeout(minuteur);
    throw e;   /* reseau coupe, delai depasse : ECHEC */
  }
  try {
    if (rep.status === 404) { const e = new Error("introuvable"); e.etat = ETATS.INTROUVABLE; throw e; }
    if (!rep.ok) throw new Error("HTTP " + rep.status);
    const type = rep.headers.get("content-type") || "";
    /* Une page d'erreur renvoyée en 200 par un hébergeur n'est pas un jeu de
       données. Le produit a déjà été cassé une fois par ce cas exact. */
    if (type.indexOf("json") === -1) { const e = new Error("type inattendu : " + type); e.etat = ETATS.INVALIDE; throw e; }
    let donnees;
    try { donnees = await rep.json(); }
    catch (err) { const e = new Error("JSON illisible : " + err.message); e.etat = ETATS.INVALIDE; throw e; }
    return { donnees, secours: !!(rep.headers.get("x-repere-secours")) };
  } finally { clearTimeout(minuteur); }
}

const horsLigne = () => typeof navigator !== "undefined" && navigator.onLine === false;

/* LA GENERATION DES DONNEES — CE QUI FAIT QU'UN CACHE SE RAFRAICHIT (30/09/2026).
 *
 * LE DEFAUT, TROUVE EN LISANT CE FICHIER : chaque chargement lisait le magasin
 * d'abord et ne touchait JAMAIS le reseau si le magasin repondait. Seul un
 * changement de schema (decision humaine, SCHEMA_ATTENDU) le vidait. Un
 * lecteur venu une fois gardait donc pour toujours les elus et les comptes de
 * sa premiere visite, alors que la chaine publie chaque nuit : un maire change,
 * un exercice corrige, rien ne lui parvenait. Et le service worker, qui sert
 * lui aussi le cache d'abord, avait une visite de retard.
 *
 * LA REGLE : `index.json` est redemande au reseau a chaque ouverture (17 Ko).
 * Sa date de construction (`build.construit_le`) est la GENERATION courante.
 * Chaque fichier garde note de la generation sous laquelle il a ete recu
 * (cle `socle:GEN` du magasin, qui passe la garde). Un fichier d'une autre
 * generation est redemande au reseau ; si le reseau echoue, le fichier garde
 * est servi quand meme, marque `perime`, pour que l'ecran puisse le dire —
 * jamais un ecran vide a la place d'une donnee presente.
 *
 * HORS LIGNE, rien ne change : l'index garde donne la generation, et tout ce
 * qui a ete recu sous elle est servi depuis l'appareil. */
/* INVARIANT 9 — FRAICHEUR (decision du porteur, 30/09/2026). Trois etats,
 * toujours distinguables a l'ecran :
 *   ACTUELLE    l'index vient du reseau (la publication courante est connue)
 *               et rien de ce qui est affiche n'est d'une generation anterieure ;
 *   PRECEDENTE  au moins un fichier affiche date d'une publication precedente
 *               (le reseau n'a pas permis de le mettre a jour), ou une
 *               publication plus recente est parue depuis l'ouverture ;
 *   INCONNUE    l'index n'a pas pu etre verifie aupres du serveur : on ne
 *               pretend pas que c'est a jour.
 * EN_COURS tant que l'index n'a pas repondu (rien a dire encore). Le site et
 * l'application affichent les MEMES phrases (PHRASES_FRAICHEUR). */
export const FRAICHEUR = Object.freeze({
  EN_COURS: "en cours", ACTUELLE: "actuelle", PRECEDENTE: "precedente", INCONNUE: "inconnue",
});
export const PHRASES_FRAICHEUR = Object.freeze({
  [FRAICHEUR.PRECEDENTE]: {
    titre: "Une partie de ce qui s'affiche date d'une publication précédente.",
    corps: "Le réseau n'a pas permis de tout mettre à jour. Rien n'est inventé : ces données ont été publiées, mais ce ne sont pas les dernières.",
  },
  [FRAICHEUR.INCONNUE]: {
    titre: "Repère n'a pas pu vérifier s'il existe une publication plus récente.",
    corps: "Sans connexion au serveur, ce qui s'affiche est la dernière publication reçue sur cet appareil.",
  },
  nouvelle: {
    titre: "Une publication plus récente est disponible.",
    corps: "Ce qui s'affiche date de la publication précédente.",
    action: "Mettre à jour",
  },
});
let indexVerifie = null;                 /* null : pas encore de reponse */
let nouvelleParue = false;
const clesPrecedentes = new Set();
const abonnes = new Set();
function annoncer() { const e = etatFraicheur(); abonnes.forEach(f => { try { f(e); } catch { /* un abonne en faute n'en prive pas les autres */ } }); }
export function etatFraicheur() {
  if (indexVerifie === null) return { etat: FRAICHEUR.EN_COURS, nouvelle: false, generation: GENERATION };
  if (nouvelleParue) return { etat: FRAICHEUR.PRECEDENTE, nouvelle: true, generation: GENERATION };
  if (!indexVerifie) return { etat: FRAICHEUR.INCONNUE, nouvelle: false, generation: GENERATION };
  return { etat: clesPrecedentes.size ? FRAICHEUR.PRECEDENTE : FRAICHEUR.ACTUELLE, nouvelle: false, generation: GENERATION };
}
export function surFraicheur(f) { abonnes.add(f); return () => abonnes.delete(f); }
function marquer(cle, precedente) {
  const avant = clesPrecedentes.has(cle);
  if (precedente) clesPrecedentes.add(cle); else clesPrecedentes.delete(cle);
  if (avant !== precedente) annoncer();
}

/* REVERIFIER EN COURS DE ROUTE — un onglet ou une application ouverts
   plusieurs jours ne redemandaient jamais l'index (faille F-2, 30/09/2026).
   Appele au retour du lecteur (onglet redevenu visible, application revenue
   au premier plan). Rend true si une publication plus recente est parue : ce
   qui est a l'ecran date alors de la precedente, et l'ecran le dit. Jamais de
   rechargement automatique : le lecteur decide. */
export async function verifierPublication() {
  const avant = GENERATION;
  indexSession = null;
  const r = await chargerIndex();
  if (r.depuis === "reseau" && avant && GENERATION && GENERATION !== avant) {
    nouvelleParue = true; annoncer(); return true;
  }
  return false;
}
/* Le lecteur a demande la mise a jour : l'ecran va relire sous la nouvelle
   generation. */
export function publicationPriseEnCompte() {
  if (nouvelleParue) { nouvelleParue = false; annoncer(); }
}

const CLE_GENERATIONS = "socle:GEN";
let GENERATION = null;
let indexSession = null;       /* l'index de cette session, une fois etabli */
let indexEnCours = null;
let fileGenerations = Promise.resolve();
const generationDe = ix => (ix && ix.build && ix.build.construit_le) || (ix && ix.genere_le) || null;

async function generationsGardees() {
  const g = await magasin.lire(CLE_GENERATIONS).catch(() => null);
  return g && g.cles && typeof g.cles === "object" ? g.cles : {};
}
/* Les notes de generation s'ecrivent l'une apres l'autre : huit fichiers recus
   en meme temps ne doivent pas s'ecraser mutuellement leur note. */
function noterGeneration(cle) {
  const g = GENERATION;
  if (!g) return Promise.resolve();
  fileGenerations = fileGenerations.then(async () => {
    const cles = await generationsGardees();
    await magasin.ecrire(CLE_GENERATIONS, { cles: { ...cles, [cle]: g } }).catch(() => {});
  }).catch(() => {});
  return fileGenerations;
}

/* L'INDEX : redemande au reseau a chaque session, le magasin en secours.
 *
 * Il survit a la coupure, comme les departements (defaut mesure et corrige le
 * 22/09 : sans lui, hors ligne, l'application affichait « Repere n'a pas reussi
 * a joindre le serveur » au-dessus de donnees presentes). La garde de schema
 * reste : un index en cache dont le schema ne correspond plus a SCHEMA_ATTENDU
 * est FAUX PAR CONSTRUCTION, et tout le magasin est jete. */
export async function chargerIndex({ delaiMs = 8000 } = {}) {
  if (indexSession) return indexSession;
  if (indexEnCours) return indexEnCours;
  indexEnCours = (async () => {
    const cle = "socle:IDX";
    let enCache = await magasin.lire(cle);
    if (enCache && enCache.v !== SCHEMA_ATTENDU) {
      /* `enCache.v` peut manquer (cache d'avant ce champ) : `!==` le traite
         comme un schema different, ce qui est voulu. Un echec de `vider()`
         n'empeche pas de continuer : la lecture reseau republiera sous les
         memes cles. */
      await magasin.vider().catch(() => {});
      enCache = null;
    }
    const retenir = (r) => {
      GENERATION = generationDe(r.donnees);
      if (r.depuis === "reseau") indexSession = r;
      indexVerifie = r.depuis === "reseau";
      annoncer();
      return r;
    };
    if (horsLigne()) {
      if (enCache) return retenir({ etat: ETATS.SERVI, donnees: enCache, depuis: "cache" });
      indexVerifie = false; annoncer();
      return { etat: ETATS.HORS_LIGNE, donnees: null };
    }
    try {
      /* Avec un index garde, on n'attend pas le reseau plus de trois secondes. */
      const { donnees, secours } = await auReseau(adresseIndex(), enCache ? Math.min(delaiMs, 3000) : delaiMs);
      /* La copie de secours du service worker n'est pas une verification. */
      if (secours) return retenir({ etat: ETATS.SERVI, donnees: enCache || donnees, depuis: "cache" });
      await magasin.ecrire(cle, donnees).catch(() => {});
      return retenir({ etat: ETATS.SERVI, donnees, depuis: "reseau" });
    } catch (e) {
      if (enCache) return retenir({ etat: ETATS.SERVI, donnees: enCache, depuis: "cache", raison: e.message });
      indexVerifie = false; annoncer();
      return { etat: e.etat || ETATS.ECHEC, donnees: null, raison: e.message };
    }
  })();
  try { return await indexEnCours; } finally { indexEnCours = null; }
}

/* Charge un département. Ne relance JAMAIS toute seule après un échec : une
   relance invisible dans un tunnel est un cul-de-sac pour le lecteur. */
export async function chargerDepartement(dep, { delaiMs = 8000 } = {}) {
  return chargerSocle("dep:" + String(dep).toUpperCase(), adresseDepartement(dep), delaiMs);
}

/* LES DÉPUTÉS, comme l'index et les départements : mémoire, magasin, réseau.
 *
 * Un seul fichier pour toute la France — 53 Ko —, demandé une seule fois, et
 * seulement par l'écran « Qui décide ». Hors ligne sans l'avoir jamais reçu, on
 * ne ment pas : l'état revient HORS_LIGNE et l'écran écrit une phrase, pas un
 * nom deviné. */
export async function chargerDeputes({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:DEP", adresseDeputes(), delaiMs);
}

/* LE CATALOGUE ET LES POSITIONS, memoire -> IndexedDB -> reseau, comme le reste.
 *
 * Deux fichiers et non un seul : le catalogue (28 Ko) est le meme pour tout le
 * monde, les positions d'un departement pesent moins de deux kilo-octets. Un
 * lecteur qui change de commune dans son departement ne retelecharge rien.
 *
 * Ils ne partent QUE si le lecteur deplie « Comment il a vote » : ni le premier
 * ecran, ni « Qui decide » a l'ouverture ne les demandent. */
/* 11 Ko compresses, demandes au premier ecran et une seule fois. C'est ce qui
   permet de taper « Bagnolet » sans savoir qu'on habite dans le 93 : voir la
   mesure des dix etapes en tete de scripts/extract-html.js. */
export async function chargerCommunesBeta({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:CMB", adresseCommunesBeta(), delaiMs);
}
export async function chargerComptesRegions({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:CTR", adresseComptesRegions(), delaiMs);
}
export async function chargerElusRegion(code, { delaiMs = 8000 } = {}) {
  return chargerSocle("reg:" + String(code).toUpperCase(), adresseElusRegion(code), delaiMs);
}
export async function chargerCatalogueScrutins({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:SCR", adresseScrutins(), delaiMs);
}
export async function chargerVotes(dep, { delaiMs = 8000 } = {}) {
  return chargerSocle("vote:" + String(dep).toUpperCase(), adresseVotes(dep), delaiMs);
}
export async function chargerProjets(dep, { delaiMs = 8000 } = {}) {
  return chargerSocle("proj:" + String(dep).toUpperCase(), adresseProjets(dep), delaiMs);
}
export async function chargerCalendrierSenat({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:CAL", adresseCalendrierSenat(), delaiMs);
}
export async function chargerAgendaAN({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:AGA", adresseAgendaAN(), delaiMs);
}
export async function chargerScrutinsSolennels({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:SOL", adresseScrutinsSolennels(), delaiMs);
}
export async function chargerScrutinsSolennelsRecents({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:SOR", adresseScrutinsSolennelsRecents(), delaiMs);
}
export async function chargerQuestionsGouvernementIndex({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:QGI", adresseQuestionsGouvernementIndex(), delaiMs);
}
export async function chargerQuestionGouvernementLot(lot, { delaiMs = 8000 } = {}) {
  return chargerSocle("socle:QGL:" + String(lot), adresseQuestionGouvernementLot(lot), delaiMs);
}
export async function chargerScrutinsIndex({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:SOI", adresseScrutinsIndex(), delaiMs);
}
export async function chargerScrutinLot(lot, { delaiMs = 8000 } = {}) {
  return chargerSocle("socle:SOLT:" + String(lot), adresseScrutinLot(lot), delaiMs);
}
export async function chargerEvenements({ delaiMs = 8000 } = {}) {
  return chargerSocle("socle:EVT", adresseEvenements(), delaiMs);
}

/* Le trajet commun des trois etages, ecrit UNE fois : memoire, magasin, reseau,
   avec la regle de generation ci-dessus. */
async function chargerSocle(cle, url, delaiMs) {
  /* La generation d'abord : sans elle, on ne sait pas si le magasin est a jour. */
  if (GENERATION === null) await chargerIndex().catch(() => {});
  const enCache = await magasin.lire(cle);
  const aJour = enCache && (GENERATION === null || (await generationsGardees())[cle] === GENERATION);
  if (aJour) { marquer(cle, false); return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" }; }
  if (enVol.has(cle)) return enVol.get(cle);
  /* Une copie d'une autre generation, servie faute de mieux : PRECEDENTE si
     l'on sait qu'une publication plus recente existe (index verifie) ; sinon
     l'etat INCONNUE de l'index le dit deja. */
  const faute = (donnees, raison) => {
    marquer(cle, indexVerifie === true);
    return { etat: ETATS.SERVI, donnees, depuis: "cache", perime: true, raison };
  };
  const promesse = (async () => {
    if (horsLigne()) {
      if (enCache) return faute(enCache);
      return { etat: ETATS.HORS_LIGNE, donnees: null };
    }
    try {
      const { donnees, secours } = await auReseau(url, delaiMs);
      if (secours) return faute(enCache || donnees, "copie de secours du service worker");
      await magasin.ecrire(cle, donnees).catch(() => {});
      await noterGeneration(cle);
      marquer(cle, false);
      return { etat: ETATS.SERVI, donnees, depuis: "reseau" };
    } catch (e) {
      /* Le reseau a echoue, mais une version precedente est la : on la sert,
         marquee, plutot qu'un ecran vide sur une donnee presente. */
      if (enCache) return faute(enCache, e.message);
      return { etat: e.etat || ETATS.ECHEC, donnees: null, raison: e.message };
    } finally { enVol.delete(cle); }
  })();
  enVol.set(cle, promesse);
  return promesse;
}

/* Pour les tests seulement : simuler une application qu'on rouvre (generation,
   index, requetes en vol, memoire de session). Le support — disque ou
   IndexedDB — n'est pas touche : c'est ce qui survit a une reouverture. */
export function nouvelleSessionPourTest() {
  GENERATION = null; indexSession = null; indexEnCours = null; enVol.clear();
  indexVerifie = null; nouvelleParue = false; clesPrecedentes.clear();
  oublierMemoire();
  fileGenerations = Promise.resolve();
}

/* Préchargement : quand le navigateur est inactif, et JAMAIS en réseau mesuré.
   Un préchargement qui consomme le forfait de quelqu'un sans le lui demander
   est un abus, même s'il rend l'application plus rapide.
 *
 * DEUX GARDES AJOUTEES, ET LA MESURE QUI LES A IMPOSEES. Le prechargement se
 * declenchait au survol ET au focus, sans delai ni plafond. Au clavier, traverser
 * la liste des cent quatre territoires met le focus sur chacun d'eux : cent
 * quatre paquets departementaux mis en file, une centaine de kilo-octets chacun,
 * une douzaine de mega-octets pour quelqu'un qui cherchait simplement le sien a
 * la tabulation. La fonction violait donc exactement ce que son commentaire
 * interdit.
 *
 *   1. UNE INTENTION A LA FOIS. Chaque appel annule le precedent : il faut que
 *      le survol ou le focus SE POSE un quart de seconde pour que quoi que ce
 *      soit parte. Traverser la liste ne declenche plus rien.
 *   2. UN PLAFOND. Un lecteur a un departement, parfois deux quand il hesite.
 *      Au-dela de trois paquets reellement telecharges d'avance, on s'arrete et
 *      on attend un vrai clic. Les lectures qui viennent du cache ne comptent
 *      pas : elles ne coutent rien.
 */
const DELAI_INTENTION = 250;
const PLAFOND_PRECHARGEMENTS = 3;
let minuteurIntention = null;
let prechargesAuReseau = 0;

export function annulerPrechargement() {
  if (minuteurIntention !== null) { clearTimeout(minuteurIntention); minuteurIntention = null; }
}

export function prechargerDepartement(dep) {
  if (typeof navigator === "undefined") return;
  const c = navigator.connection;
  if (c && (c.saveData || /2g/.test(c.effectiveType || ""))) return;
  if (prechargesAuReseau >= PLAFOND_PRECHARGEMENTS) return;

  annulerPrechargement();
  minuteurIntention = setTimeout(() => {
    minuteurIntention = null;
    const lancer = () => chargerDepartement(dep)
      .then(r => { if (r && r.depuis === "reseau") prechargesAuReseau++; })
      .catch(() => {});
    if (typeof requestIdleCallback === "function") requestIdleCallback(lancer, { timeout: 2000 });
    else setTimeout(lancer, 300);
  }, DELAI_INTENTION);
}
