/* SIGLES DES GROUPES PARLEMENTAIRES (16/10/2026).
 *
 * Les couleurs publiées pour les groupes sont volontairement presque grises
 * (invariant 7 : aucune couleur politique) : elles ne permettent donc pas de
 * reconnaître un groupe. Le sigle, lui, le fait. Clés : les noms exacts publiés
 * par l'Assemblée (scripts/scrutins-details.mjs). Un nom absent de cette table
 * garde un point neutre, jamais un sigle inventé. */
export const SIGLES_GROUPES: Readonly<Record<string, string>> = Object.freeze({
  "Rassemblement National": "RN",
  "Ensemble pour la République": "EPR",
  "La France insoumise - Nouveau Front Populaire": "LFI-NFP",
  "Socialistes et apparentés": "SOC",
  "Droite Républicaine": "DR",
  "Écologiste et Social": "ECO",
  "Les Démocrates": "DEM",
  "Horizons & Indépendants": "HOR",
  "Libertés, Indépendants, Outre-mer et Territoires": "LIOT",
  "Gauche Démocrate et Républicaine": "GDR",
  "Union des droites pour la République": "UDR",
  "Députés non inscrits": "NI",
});
