/* ÉLECTIONS NATIONALES À VENIR (V30, bloc 2). Dates écrites dans le code, pas dans data/ :
 * mono/data/ n'est pas versionné, donc un fichier de données n'arriverait jamais à la publication.
 *
 * Vérifié le 30/10/2026 :
 *   - présidentielle : premier tour le 18 avril 2027, second tour le 2 mai 2027 (service-public.gouv.fr,
 *     page « Élection 2027 », et LCP) ;
 *   - législatives : aucune date fixée à cette date (LCP). Le brief indiquait « juin 2027 » : non vérifié,
 *     donc non écrit. Les élections passées (municipales 2026, sénatoriales 2026) ne sont pas listées.
 * À reverifier avant chaque publication : une date peut être fixée par décret. */
export const ELECTIONS_VERIFIEES_LE = "2026-10-30";
export const ELECTIONS_SOURCE = {
  producteur: "Service-public.gouv.fr",
  url: "https://www.service-public.gouv.fr/particuliers/actualites/A15053?lang=fr",
};

export type Election = { date: string | null; type: "presidentielle" | "legislatives"; titre: string; description: string };

export const ELECTIONS: Election[] = [
  {
    date: "2027-04-18",
    type: "presidentielle",
    titre: "Élection présidentielle : premier tour",
    description: "Premier tour le dimanche 18 avril 2027. Second tour le dimanche 2 mai 2027. Outre-mer, le vote a lieu les samedis 17 avril et 1er mai 2027 pour tenir compte du décalage horaire.",
  },
  {
    date: null,
    type: "legislatives",
    titre: "Élections législatives 2027",
    description: "Aucune date n'est fixée à ce jour. La dernière élection législative s'est tenue à l'été 2024.",
  },
];

/* LA PROCHAINE ÉLECTION À RAPPELER SUR L'ACCUEIL (V37, bloc 6).
 * Seulement si la date tombe dans les 180 prochains jours, jour J compris. Au-delà, ou sans date fixée,
 * rien n'est affiché : pas de compte à rebours vers une date qui n'existe pas encore. */
export const FENETRE_RAPPEL_JOURS = 180;
export function prochaineElection(aujourdhui: Date): { election: Election; jours: number } | null {
  const ce = Date.UTC(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate());
  let plusProche: { election: Election; jours: number } | null = null;
  for (const election of ELECTIONS) {
    if (!election.date) continue;
    const [a, m, j] = election.date.split("-").map(Number);
    const jours = Math.round((Date.UTC(a, m - 1, j) - ce) / 86_400_000);
    if (jours < 0 || jours > FENETRE_RAPPEL_JOURS) continue;
    if (!plusProche || jours < plusProche.jours) plusProche = { election, jours };
  }
  return plusProche;
}
