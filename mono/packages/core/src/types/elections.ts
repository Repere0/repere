/* L'ÉLECTION PRÉSIDENTIELLE 2027 — le schéma des fichiers publiés (09/11/2026, demande du porteur).
 *
 * Quatre fichiers, versionnés dans data/presidentielle-2027/ (racine du dépôt), recopiés dans les
 * données publiées par mono/scripts/collecte-presidentielle.mjs :
 *   candidats.json  { candidats: PresidentialCandidate[] }
 *   debats.json     { debats: PresidentialDebate[] }
 *   meetings.json   { meetings: PresidentialMeeting[] }
 *   meta.json       PresidentialMeta
 * Un fichier VIDE est un état normal : la liste officielle des candidats n'existe pas tant que le
 * Conseil constitutionnel ne l'a pas arrêtée. L'écran dit alors l'absence (invariant 5).
 *
 * RÈGLES PORTÉES PAR LES TYPES :
 * - invariant 4 : un débat ou une réunion n'existe qu'avec l'adresse de la source qui l'annonce
 *   (`sourceUrl`, obligatoire) ; la source des candidats est dans meta.json ;
 * - invariant 3 : l'ordre des candidats est celui du fichier, donc de la liste officielle ; aucun
 *   champ de rang, de score ou de sondage ;
 * - `couleurParti` et `photoUrl` sont acceptés par le schéma mais NE SONT PAS AFFICHÉS : l'invariant 7
 *   réserve les couleurs politiques à l'identification des élus, et une photo ne peut venir que de
 *   Wikimedia Commons sous licence libre, servie par Repère (D27, ADR 0004), jamais d'une adresse
 *   externe (invariant 1). Les afficher demande une décision du porteur. */

export type PresidentialCandidate = {
  id: string;
  nom: string;
  prenom: string;
  /** le parti ou mouvement qui présente le candidat, tel que la source l'écrit ; null si aucun */
  parti: string | null;
  /** non affiché (invariant 7) : voir l'en-tête */
  couleurParti?: string;
  programmeUrl?: string;
  /** 12/11/2026 : « declare » = candidature annoncée, relevée dans la presse (pas la liste officielle) ; « officiel » =
   *  liste du Conseil constitutionnel. Absent = « officiel ». Un « declare » exige au moins deux `sources`. */
  statut?: "declare" | "officiel";
  sources?: { producteur: string; url: string; date: string }[];
  /** non affiché (D27, invariant 1) : voir l'en-tête */
  photoUrl?: string;
};

export type PresidentialDebate = {
  id: string;
  /** date et heure ISO 8601, avec fuseau */
  date: string;
  chaine: string;
  titre: string;
  /** identifiants de candidats (PresidentialCandidate.id) */
  participants: string[];
  /** l'annonce officielle (chaîne, Arcom) : obligatoire */
  sourceUrl: string;
};

export type PresidentialMeeting = {
  id: string;
  /** date et heure ISO 8601, avec fuseau */
  date: string;
  ville: string;
  candidatId: string;
  lieu: string;
  /** l'annonce (site de campagne du candidat) : obligatoire */
  sourceUrl: string;
};

export type PresidentialSource = { producteur: string; url: string; licence?: string };

export type PresidentialMeta = {
  /** date de la dernière vérification ou mise à jour, AAAA-MM-JJ */
  lastUpdate: string;
  /** la source de la liste des candidats */
  source: PresidentialSource;
  /** une phrase sur l'état de la collecte, affichable telle quelle */
  note?: string;
};

export type PresidentialData = {
  candidats: PresidentialCandidate[];
  debats: PresidentialDebate[];
  meetings: PresidentialMeeting[];
  meta: PresidentialMeta | null;
};

/** Une source de la collecte automatique (data/presidentielle-2027/sources.json, 10/11/2026).
 *  Lue par mono/scripts/collecte-presidentielle.mjs, jamais publiée ni lue par l'application. */
export type PresidentialCollectSource = {
  id: string;
  type: "candidats" | "debats" | "meetings";
  /** "rss" : jamais publié, toujours au brouillon (un flux ne date pas l'événement) */
  format: "json" | "rss";
  /** https uniquement */
  url: string;
  producteur: string;
  /** true : écrit dans les fichiers publiés ; sinon data/auto/presidentielle-brouillon.md, à relire */
  publier: boolean;
  /** chemin pointé du tableau dans la réponse ("data.items") ; absent : la réponse est le tableau */
  liste?: string;
  /** champ du schéma -> clé de la source, ou valeur fixe. Un champ non donné par la source reste absent. */
  champs?: Record<string, string | { fixe: unknown }>;
};
