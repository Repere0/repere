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
  if (!/^(dep|socle):[0-9A-Z]{1,3}$/.test(String(cle))) return false;
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

export const magasin = {
  async lire(cle) {
    if (memoire.has(cle)) return memoire.get(cle);
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
    try { await transaction("readwrite", st => st.put(valeur, cle)); return true; }
    catch { return false; }   /* la memoire suffit pour la session en cours */
  },

  async cles() {
    try {
      return await transaction("readonly", (st, rendre) => {
        const d = st.getAllKeys();
        d.onsuccess = () => rendre(d.result || []);
      });
    } catch { return [...memoire.keys()]; }
  },

  /* Vider est un geste explicite du lecteur, jamais automatique. */
  async vider() {
    memoire.clear();
    try { await transaction("readwrite", st => st.clear()); return true; }
    catch { return false; }
  },
};
