/* EXEMPLES FICTIFS pour les types du local (packages/core/src/local.d.ts), 05/11/2026.
 * Commune, groupes, délibérations et sources sont INVENTÉS : rien ici n'est publié ni
 * importé par une application. Code INSEE « 00000 » et domaine « .invalid » réservés,
 * pour qu'aucune donnée fictive ne puisse passer pour réelle. Le contrôle :
 * npx tsc --noEmit --strict mono/tests/fixtures/local-fictif.ts (garde : tests/local-types.test.mjs). */
import type { ConseilMunicipal, DeliberationLocale, Provenance } from "../../packages/core/src/local";

const FICTIVE: Provenance = {
  producteur: "Source fictive (exemple de test)",
  licence: "aucune — exemple",
  url: "https://exemple.invalid/source",
  releve_le: "2026-11-05",
};

/** Cas courant attendu : aucune source ne dit qui est majorité ou opposition. */
export const conseilSansStatut = {
  insee: "00000",
  commune: "Exempleville (fictive)",
  effectif: 29,
  groupes: [
    { libelle: "Liste A (fictive)", sieges: 23, statut: { valeur: "non_publie", source: null } },
    { libelle: "Liste B (fictive)", sieges: 6, statut: { valeur: "non_publie", source: null } },
  ],
  sansGroupe: 0,
  source: FICTIVE,
} satisfies ConseilMunicipal;

/** Cas où une source publie le statut : il porte alors sa propre provenance. */
export const conseilAvecStatut = {
  ...conseilSansStatut,
  groupes: [
    { libelle: "Liste A (fictive)", sieges: 23, statut: { valeur: "majorite", source: FICTIVE } },
    { libelle: "Liste B (fictive)", sieges: 6, statut: { valeur: "opposition", source: FICTIVE } },
  ],
} satisfies ConseilMunicipal;

export const deliberations = [
  {
    insee: "00000", numero: "2026-001", titre: "Délibération fictive n° 1 (exemple)", date: "2026-10-01",
    lienPdf: "https://exemple.invalid/deliberation-1.pdf",
    resultat: { etat: "adoptee", pour: 25, contre: 4, abstention: null, unanimite: false },
    source: FICTIVE,
  },
  {
    insee: "00000", numero: null, titre: "Délibération fictive n° 2 (exemple)", date: "2026-10-01",
    lienPdf: null,
    resultat: { etat: "non_publie" },
    source: FICTIVE,
  },
] satisfies DeliberationLocale[];
