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
import { magasin } from "./store.js";
import { adresseFautive } from "./invariants.js";

export const BASE_DONNEES = "/data";

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
/* LE CALENDRIER CITOYEN, PILOTE SENAT : un seul fichier, commun a toute la
   France — un agenda parlementaire n'est pas une donnee territoriale, et ne
   porte donc jamais de code de departement ni de commune. */
export function adresseCalendrierSenat() { return `${BASE_DONNEES}/calendrier-senat.json`; }
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
});

/* Les phrases de la doctrine du vide. Chaque état a la sienne, et elles disent
   des choses DIFFÉRENTES : confondre « pas encore arrivé » avec « la source ne
   le porte pas » ferait mentir le produit à l'endroit où il demande d'être cru. */
export const PHRASES = Object.freeze({
  [ETATS.EN_COURS]: {
    titre: "Chargement des données de votre département.",
    corps: "Quelques centaines de kilo-octets, une seule fois. Ensuite, Repère fonctionne sans réseau.",
  },
  [ETATS.ECHEC]: {
    titre: "Repère n'a pas réussi à joindre le serveur.",
    corps: "Les élus de votre département existent, ils ne sont pas arrivés jusqu'ici.",
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
});

async function auReseau(url, delaiMs) {
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), delaiMs);
  try {
    const rep = await fetch(url, { credentials: "omit", signal: ctrl.signal });
    if (rep.status === 404) { const e = new Error("introuvable"); e.etat = ETATS.INTROUVABLE; throw e; }
    if (!rep.ok) throw new Error("HTTP " + rep.status);
    const type = rep.headers.get("content-type") || "";
    /* Une page d'erreur renvoyée en 200 par un hébergeur n'est pas un jeu de
       données. Le produit a déjà été cassé une fois par ce cas exact. */
    if (type.indexOf("json") === -1) throw new Error("type inattendu : " + type);
    return await rep.json();
  } finally { clearTimeout(minuteur); }
}

/* Charge un département. Ne relance JAMAIS toute seule après un échec : une
   relance invisible dans un tunnel est un cul-de-sac pour le lecteur. */
export async function chargerDepartement(dep, { delaiMs = 8000 } = {}) {
  const cle = "dep:" + String(dep).toUpperCase();
  const enCache = await magasin.lire(cle);
  if (enCache) return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" };

  if (enVol.has(cle)) return enVol.get(cle);

  const promesse = (async () => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { etat: ETATS.HORS_LIGNE, donnees: null };
    }
    try {
      const donnees = await auReseau(adresseDepartement(dep), delaiMs);
      await magasin.ecrire(cle, donnees).catch(() => {});
      return { etat: ETATS.SERVI, donnees, depuis: "reseau" };
    } catch (e) {
      return { etat: e.etat || ETATS.ECHEC, donnees: null, raison: e.message };
    } finally { enVol.delete(cle); }
  })();

  enVol.set(cle, promesse);
  return promesse;
}

/* L'INDEX SURVIT A LA COUPURE, COMME LES DEPARTEMENTS.
 *
 * Il ne le faisait pas : il n'etait garde qu'en memoire, donc perdu au premier
 * rechargement. Mesure hors ligne, serveur eteint : le departement revenait bien
 * du magasin, mais la liste des departements, elle, manquait — et l'application
 * affichait « Repere n'a pas reussi a joindre le serveur » avec un bouton
 * Reessayer, au-dessus de donnees parfaitement presentes. Le message mentait sur
 * l'etat reel, et le lecteur ne pouvait plus changer de departement hors ligne.
 *
 * La cle `socle:IDX` passe deja la garde du magasin (`^(dep|socle):[0-9A-Z]{1,3}$`)
 * et le controle runtime l'accepte : rien n'est assoupli ici, l'index est
 * simplement range ou il aurait toujours du l'etre. */
export async function chargerIndex({ delaiMs = 8000 } = {}) {
  const cle = "socle:IDX";
  const enCache = await magasin.lire(cle);
  if (enCache) return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" };
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { etat: ETATS.HORS_LIGNE, donnees: null };
  }
  try {
    const donnees = await auReseau(adresseIndex(), delaiMs);
    await magasin.ecrire(cle, donnees).catch(() => {});
    return { etat: ETATS.SERVI, donnees, depuis: "reseau" };
  } catch (e) {
    return { etat: e.etat || ETATS.ECHEC, donnees: null, raison: e.message };
  }
}

/* LES DÉPUTÉS, comme l'index et les départements : mémoire, IndexedDB, réseau.
 *
 * Un seul fichier pour toute la France — 53 Ko —, demandé une seule fois, et
 * seulement par l'écran « Qui décide ». Hors ligne sans l'avoir jamais reçu, on
 * ne ment pas : l'état revient HORS_LIGNE et l'écran écrit une phrase, pas un
 * nom deviné. */
export async function chargerDeputes({ delaiMs = 8000 } = {}) {
  const cle = "socle:DEP";
  const enCache = await magasin.lire(cle);
  if (enCache) return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" };
  if (enVol.has(cle)) return enVol.get(cle);

  const promesse = (async () => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { etat: ETATS.HORS_LIGNE, donnees: null };
    }
    try {
      const donnees = await auReseau(adresseDeputes(), delaiMs);
      await magasin.ecrire(cle, donnees).catch(() => {});
      return { etat: ETATS.SERVI, donnees, depuis: "reseau" };
    } catch (e) {
      return { etat: e.etat || ETATS.ECHEC, donnees: null, raison: e.message };
    } finally { enVol.delete(cle); }
  })();

  enVol.set(cle, promesse);
  return promesse;
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

/* Le trajet commun des trois etages, ecrit UNE fois. Les quatre chargements
   au-dessus le repetaient mot pour mot ; la quatrieme copie est celle de trop. */
async function chargerSocle(cle, url, delaiMs) {
  const enCache = await magasin.lire(cle);
  if (enCache) return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" };
  if (enVol.has(cle)) return enVol.get(cle);
  const promesse = (async () => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      return { etat: ETATS.HORS_LIGNE, donnees: null };
    }
    try {
      const donnees = await auReseau(url, delaiMs);
      await magasin.ecrire(cle, donnees).catch(() => {});
      return { etat: ETATS.SERVI, donnees, depuis: "reseau" };
    } catch (e) {
      return { etat: e.etat || ETATS.ECHEC, donnees: null, raison: e.message };
    } finally { enVol.delete(cle); }
  })();
  enVol.set(cle, promesse);
  return promesse;
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
