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

export async function chargerIndex({ delaiMs = 8000 } = {}) {
  const cle = "socle:IDX";
  const enCache = await magasin.lire(cle);
  if (enCache) return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" };
  try {
    const donnees = await auReseau(adresseIndex(), delaiMs);
    /* L'index n'est pas un paquet departemental : on le garde en memoire seule,
       plutot que d'assouplir la garde du magasin pour lui faire une place. */
    return { etat: ETATS.SERVI, donnees, depuis: "reseau" };
  } catch (e) {
    return { etat: e.etat || ETATS.ECHEC, donnees: null, raison: e.message };
  }
}

/* Préchargement : quand le navigateur est inactif, et JAMAIS en réseau mesuré.
   Un préchargement qui consomme le forfait de quelqu'un sans le lui demander
   est un abus, même s'il rend l'application plus rapide. */
export function prechargerDepartement(dep) {
  if (typeof navigator === "undefined") return;
  const c = navigator.connection;
  if (c && (c.saveData || /2g/.test(c.effectiveType || ""))) return;
  const lancer = () => chargerDepartement(dep).catch(() => {});
  if (typeof requestIdleCallback === "function") requestIdleCallback(lancer, { timeout: 2000 });
  else setTimeout(lancer, 300);
}
