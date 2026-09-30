/* IndexedDB — et la règle qui la rend acceptable.
 *
 * POURQUOI CE FICHIER EST ÉCRIT COMME ÇA. L'invariant 2 de Repère interdit tout
 * stockage sur l'appareil hormis UNE clé nommée, et le banc de l'application
 * mono-fichier porte un contrôle « indexedDB jamais utilisé ». Ce contrôle ne
 * visait pas la technique : il visait le risque que le produit se mette à garder
 * des traces de son lecteur.
 *
 * On garde donc la protection en changeant sa forme : IndexedDB est autorisée
 * ICI, mais elle ne peut contenir QUE de la donnée publique déjà téléchargée
 * (des fichiers départementaux issus de sources ouvertes). Toute écriture est
 * filtrée par `estDonneePublique()`, et le test d'invariants vérifie qu'aucun
 * autre magasin n'existe.
 *
 * Ce que ce magasin ne contiendra JAMAIS : identité, commune choisie, historique
 * de navigation, préférences nominatives, horodatage d'usage. La commune choisie
 * par le lecteur reste dans l'unique clé localStorage, comme avant.
 *
 * Si IndexedDB n'est pas disponible (mode privé, quota, navigateur ancien), le
 * magasin bascule sur la Cache Storage du service worker, puis sur la mémoire.
 * Aucun de ces trois cas n'est une erreur pour le lecteur : il ne doit rien voir.
 */

export const BASE = "repere-donnees";
export const MAGASIN = "departements";   // le SEUL magasin autorisé
export const VERSION_BASE = 1;

/* La forme d'un paquet départemental. Une écriture qui ne la respecte pas est
   refusée : c'est la garde qui empêche ce magasin de devenir autre chose. */
export function estDonneePublique(cle, valeur) {
  /* « vote » rejoint « dep » et « socle » le 13/09/2026 : les positions de vote
     sont rangees par DEPARTEMENT, exactement comme les elus. La garde reste ce
     qu'elle est — au plus trois caracteres, majuscules et chiffres — pour qu'un
     code INSEE de commune (cinq caracteres) ne puisse pas y entrer.
     « reg » rejoint les trois le 22/09/2026 : le conseil regional, range par
     REGION (deux chiffres, jamais un departement ni une commune).
     « proj » rejoint les quatre le 30/09/2026 : les projets sont ranges par
     DEPARTEMENT (client.js les demande sous « proj:77 » depuis le 13/09). La
     garde les refusait, en silence : `ecrire` levait, l'appelant avalait
     l'erreur, et les projets n'etaient jamais gardes, pas meme en memoire —
     jamais disponibles hors ligne. Mesure en lisant le code, prouve par
     tests/donnees.test.mjs. */
  if (!/^(dep|vote|reg|proj|socle):[0-9A-Z]{1,3}$/.test(String(cle))) return false;
  if (!valeur || typeof valeur !== "object") return false;
  if ("insee" in valeur && !("communes" in valeur)) return false;
  const interdits = ["utilisateur", "user", "email", "id_client", "session",
                     "historique", "derniereVisite", "commune_choisie"];
  return !interdits.some(k => k in valeur);
}

function ouvrir() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("indexedDB absente"));
    const r = indexedDB.open(BASE, VERSION_BASE);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains(MAGASIN)) db.createObjectStore(MAGASIN);
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error || new Error("ouverture refusée"));
  });
}

async function transaction(mode, travail) {
  const db = await ouvrir();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(MAGASIN, mode);
      const st = tx.objectStore(MAGASIN);
      let sortie;
      travail(st, v => { sortie = v; });
      tx.oncomplete = () => resolve(sortie);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error || new Error("transaction annulée"));
    });
  } finally { db.close(); }
}

const memoire = new Map();

/* UN AUTRE SUPPORT QU'INDEXEDDB, SOUS LA MEME GARDE (30/09/2026).
 * L'application mobile n'a pas d'IndexedDB : elle fournit un stockage sur
 * disque (apps/mobile/src/lib/cache.ts) de meme forme — lire, ecrire, cles,
 * vider. La garde reste ICI, dans `magasin.ecrire`, avant tout appel au
 * support : un seul endroit decide de ce qui peut etre garde sur un appareil,
 * quel que soit l'appareil. Decision du porteur du 30/09/2026 : sur le
 * telephone, seulement des fichiers publics publies par Repere. */
let stockage = null;
/* La memoire de session seulement — pas le support. Pour les tests : simuler
   une application qu'on rouvre. */
export function oublierMemoire() { memoire.clear(); }
export function configurerStockage(s) {
  if (!s || ["lire", "ecrire", "cles", "vider"].some(m => typeof s[m] !== "function")) {
    throw new Error("stockage refuse : il faut lire, ecrire, cles et vider");
  }
  stockage = s;
}

export const magasin = {
  async lire(cle) {
    if (memoire.has(cle)) return memoire.get(cle);
    if (stockage) {
      try {
        const v = await stockage.lire(cle);
        /* Relu, donc revalide : un fichier que la garde refuserait n'est pas servi. */
        if (v !== undefined && v !== null && estDonneePublique(cle, v)) { memoire.set(cle, v); return v; }
      } catch { /* support illisible : on repart au reseau */ }
      return undefined;
    }
    try {
      const v = await transaction("readonly", (st, rendre) => {
        const d = st.get(cle);
        d.onsuccess = () => rendre(d.result);
      });
      if (v !== undefined) memoire.set(cle, v);
      return v;
    } catch { return memoire.get(cle); }
  },

  async ecrire(cle, valeur) {
    /* La garde passe AVANT le stockage, jamais après : une donnée refusée ne
       doit pas exister une milliseconde sur l'appareil du lecteur. */
    if (!estDonneePublique(cle, valeur)) {
      throw new Error(
        "refus d'ecriture : ce magasin ne recoit que de la donnee publique " +
        "departementale (cle recue : " + String(cle) + ")");
    }
    memoire.set(cle, valeur);
    if (stockage) { try { await stockage.ecrire(cle, valeur); return true; } catch { return false; } }
    try { await transaction("readwrite", st => st.put(valeur, cle)); return true; }
    catch { return false; }   /* la memoire suffit pour la session en cours */
  },

  async cles() {
    if (stockage) { try { return await stockage.cles(); } catch { return [...memoire.keys()]; } }
    try {
      return await transaction("readonly", (st, rendre) => {
        const d = st.getAllKeys();
        d.onsuccess = () => rendre(d.result || []);
      });
    } catch { return [...memoire.keys()]; }
  },

  /* Vider est un geste explicite du lecteur — OU un geste automatique du
     client.js quand le cache est FAUX PAR CONSTRUCTION (schema perime,
     SCHEMA_ATTENDU dans client.js, ajoute le 22/09/2026). Ce n'est jamais
     un menage de routine : la seule autre raison d'appeler ceci reste une
     demande explicite du lecteur. */
  async vider() {
    memoire.clear();
    if (stockage) { try { await stockage.vider(); return true; } catch { return false; } }
    try { await transaction("readwrite", st => st.clear()); return true; }
    catch { return false; }
  },
};
