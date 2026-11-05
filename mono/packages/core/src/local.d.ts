/* LE LOCAL — types préparés le 05/11/2026, sans écran ni données réelles.
 *
 * Deux sujets : le conseil municipal (qui y siège, par groupe) et les délibérations.
 * Règles appliquées par les types eux-mêmes :
 * - invariant 4 : chaque objet publié porte sa Provenance (producteur, licence, URL, date) ;
 * - invariant 5 : une valeur inconnue est `null` ou un état « non_publie », jamais 0 ;
 * - majorité / opposition : AUCUNE source officielle ne la publie à ce jour (le Répertoire
 *   national des élus ne la porte pas). Le statut n'existe donc qu'avec sa propre source ;
 *   sans elle, il vaut « non_publie » et l'hémicycle ne colore rien.
 * Les exemples sont FICTIFS et vivent hors du paquet : mono/tests/fixtures/local-fictif.ts. */

export type Provenance = {
  producteur: string;
  licence: string;
  url: string;
  /** date du relevé, AAAA-MM-JJ */
  releve_le: string;
};

/* ── Hémicycle municipal ─────────────────────────────────────────────────── */

export type StatutGroupe =
  | { valeur: "majorite" | "opposition"; source: Provenance }
  | { valeur: "non_publie"; source: null };

export type GroupeMunicipal = {
  /** libellé tel que publié (nom de liste ou de groupe), jamais réécrit */
  libelle: string;
  sieges: number;
  statut: StatutGroupe;
};

export type ConseilMunicipal = {
  /** code INSEE de la commune */
  insee: string;
  commune: string;
  /** sièges du conseil ; null si la source ne le donne pas */
  effectif: number | null;
  /** vide si la source ne rattache les élus à aucun groupe */
  groupes: GroupeMunicipal[];
  /** sièges que la source ne rattache à aucun groupe ; null si inconnu */
  sansGroupe: number | null;
  source: Provenance;
};

/* ── Délibérations locales ───────────────────────────────────────────────── */

export type ResultatDeliberation =
  | {
      etat: "adoptee" | "rejetee";
      /** décomptes tels que publiés ; null si le document ne les donne pas (jamais 0 inventé) */
      pour: number | null;
      contre: number | null;
      abstention: number | null;
      /** « à l'unanimité » quand le document le dit ; sinon null */
      unanimite: boolean | null;
    }
  | { etat: "non_publie" };

export type DeliberationLocale = {
  insee: string;
  /** numéro tel que publié par la commune ; null s'il n'y en a pas */
  numero: string | null;
  /** titre officiel, recopié sans reformulation */
  titre: string;
  /** date de la séance, AAAA-MM-JJ */
  date: string;
  /** lien vers le PDF publié par la commune ; null si seul l'affichage en mairie existe */
  lienPdf: string | null;
  resultat: ResultatDeliberation;
  source: Provenance;
};
