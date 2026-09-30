/* LE MODELE DE DOMAINE DE REPERE — 01/10/2026.
 *
 * Les formes que la donnee prend entre la source et l'ecran, relevees sur les
 * fichiers REELLEMENT publies (mono/data, mesure du 01/10/2026), pas devinees.
 * tests/forme.test.mjs verifie a chaque build que les fichiers ont toujours
 * cette forme : un type faux ferait taire le compilateur a tort.
 *
 * MINIMAL PAR CHOIX. Pas un type par mot du produit :
 *   - le FINANCEMENT d'un projet n'est pas une entite, ce sont deux champs du
 *     Projet (subvention, cout) ;
 *   - la DEPENSE est une ligne d'un Exercice de comptes ;
 *   - un FAIT (relu par un humain) et un rendez-vous d'agenda ne sont pas le
 *     meme concept : le premier engage Repere, le second est recopie.
 *
 * LA PROVENANCE VOYAGE AVEC LA DONNEE : chaque fichier porte sa Source (qui
 * publie, sous quelle licence, quand), l'index porte la Publication de Repere
 * (quand Repere a construit ces fichiers), et le client ajoute la Fraicheur
 * (actuelle, precedente, inconnue — invariant 9). Trois dates, jamais melangees :
 * celle du fait, celle de la source, celle de Repere. Type seulement : aucun
 * code n'est engendre, le site (JavaScript) n'en depend pas. */

/** « 2026-09-30 » ou horodatage ISO complet. */
export type DateIso = string;

/* ---------------------------------------------------------------- provenance */

/** Qui publie une donnee, sous quelle licence, et quand. */
export interface Source {
  producteur: string;
  licence: string;
  url?: string;
  /** date de publication ou de mise a jour DE LA SOURCE */
  maj?: DateIso;
  mis_a_jour_le?: DateIso;
  /** date a laquelle la chaine de Repere l'a relevee */
  releve_le?: DateIso;
  portee?: string;
  legislature?: number;
  producteur_citoyen?: string;
  exercices?: string[];
  decoupage?: string;
}

/** Quand Repere a construit les fichiers (porte par index.json). */
export interface Publication {
  v: number;
  genere_le: DateIso;
  build?: { commit: string; commit_court: string; construit_le: DateIso; sante?: Record<string, boolean> };
}

/** Invariant 9 : ce que le lecteur doit savoir de l'age de ce qu'il lit. */
export type EtatFraicheur = "en cours" | "actuelle" | "precedente" | "inconnue";
export interface Fraicheur {
  etat: EtatFraicheur;
  /** une publication plus recente est parue pendant la lecture */
  nouvelle: boolean;
  /** la publication de Repere que la session connait */
  generation: DateIso | null;
  /** de quand date ce qui est a l'ecran (la plus ancienne copie servie) */
  depuis: DateIso | null;
  horsLigne: boolean;
}

/** Ce que rend un chargement : la donnee, ou pourquoi elle n'est pas la. */
export type EtatChargement = "absent" | "en cours" | "servi" | "echec" | "hors ligne" | "introuvable" | "invalide";
export interface Charge<T> {
  etat: EtatChargement;
  donnees: T | null;
  depuis?: "cache" | "reseau";
  /** servie faute de mieux : une publication plus recente existe, ou n'a pas pu etre verifiee */
  perime?: boolean;
  raison?: string;
}

/* ---------------------------------------------------------------- territoires */

export type Echelon = "ville" | "agglo" | "dept" | "region" | "france";

export interface DepartementIndex {
  code: string; nom: string; type?: string; region?: string; region_code?: string;
  communes: number; octets: number;
}

/** Les sources declarees par l'index : une par famille de donnees. */
export interface SourcesIndex {
  elus: Source; comptes: Source; circonscriptions: Source;
  communes?: Source; deputes?: Source; scrutins?: Source; projets?: Source; evenements?: Source;
  /** decoupage administratif : plusieurs producteurs */
  territoires?: Source[];
}

export interface IndexPublie extends Publication {
  sources: SourcesIndex;
  /** les six lignes de comptes : [libelle de la source, libelle en francais courant] */
  agregats: [string, string][];
  departements: DepartementIndex[];
}

/* ---------------------------------------------------------------- elus */

export interface Elu { nom: string; fonction: string; debut?: DateIso; canton?: number }

/* ---------------------------------------------------------------- argent */

/** Un exercice publie : [population, montant, par habitant] puis cinq autres
 *  paires, dans l'ordre de IndexPublie.agregats. null = absent de la source
 *  ou ecarte (regle V-1) — jamais un zero invente. */
export type Exercice = (number | null)[];
/** Les exercices d'un territoire, par annee (« 2024 »). */
export type Comptes = Record<string, Exercice>;

/* ---------------------------------------------------------------- commune */

export interface Commune {
  nom: string;
  maire?: Elu;
  adjoints: number | null;
  /** une circonscription, plusieurs (Paris : 118 communes a cheval), ou inconnue (11 communes) */
  circo: number | number[] | null;
  comptes?: Comptes;
  /** exercices publies mais ecartes : montants incoherents avec la population (regle V-2) */
  comptes_ecartes?: string[];
  agglo?: { nom: string; delegues: Elu[] } | null;
  canton?: number[];
}

export interface PaquetDepartement {
  d: string;
  communes: Record<string, Commune>;
  /** communes officielles absentes des sources : code -> nom */
  manquantes?: Record<string, string>;
  comptes_departement?: Comptes;
  conseil_departemental?: Elu[];
  cantons?: Record<string, string>;
}

export interface ElusRegion { v: number; source: Source; elus: Elu[] }

/* ---------------------------------------------------------------- projets */

/** Un projet aide par l'Etat. Le financement n'est pas une entite : ce sont
 *  `subvention` et `cout`, publies par la source. */
export interface Projet {
  annee: number;
  dispositif: string;
  intitule: string;
  subvention: number;
  cout?: number | null;
  /** commune deleguee : le projet a ete engage sous son ancien code */
  ancien_code?: string;
  ancienne_commune?: string;
}
export interface PaquetProjets {
  v: number; d: string; mis_a_jour_le: DateIso; releve_le: DateIso;
  exercices: string[]; dispositifs: Record<string, string>;
  communes: Record<string, Projet[]>;
}

/* ---------------------------------------------------------------- parlement */

export interface Depute { prenom: string; nom: string; acteurRef: string; dateDebut?: DateIso }
/** cle : « 77-6 » (departement, numero de circonscription) */
export interface Deputes { v: number; source: Source; deputes: Record<string, Depute> }

/** p pour, c contre, a abstention — une POSITION, jamais une presence (invariant 8). */
export type Position = "p" | "c" | "a";
export interface Scrutin {
  u: string; n: string; d: DateIso; t: string; s: string; sl: string; tv: string;
  dec: { pour: string; contre: string; abstentions: string };
  nv?: string;
}
export interface CatalogueScrutins {
  v: number; source: Source; url_scrutin: string; ecarte: string; total_source: number; scrutins: Scrutin[];
}
export interface PositionsDepartement {
  v: number; d: string; releve_le: DateIso;
  /** numero de scrutin -> acteur -> position */
  positions: Record<string, Record<string, Position>>;
}

/* ---------------------------------------------------------------- fil */

/** Un fait valide par un humain (data/evenements/*.md, valide: true). */
export interface Fait {
  id: string; t: string; d: DateIso; e: string; src: string; srcn: string;
  axes?: string; conf?: string; insee?: string; txt?: string;
}
export interface Evenements { v: number; maj: DateIso; r: Fait[] }
