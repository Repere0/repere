/* LE NOM DE CHAQUE ECRAN, UNE SEULE FOIS — 07/10/2026.
 *
 * Mesure avant ce fichier : le calendrier portait quatre noms (« Ce qui se
 * passe », « Le calendrier », « Ce qui arrive au Parlement », « Au Parlement »),
 * les decisions deux (« Ce qui a ete decide », « Toutes les decisions »),
 * l'accueil deux (« Aujourd'hui » sur le site, « Chez vous » sur le telephone).
 * Un lecteur qui clique « Le calendrier » et arrive sur « Ce qui se passe » se
 * demande s'il est au bon endroit.
 *
 * Le site (barre d'ecrans, boutons d'« Aujourd'hui ») et l'application
 * (en-tetes, boutons de retour, « Aller plus loin ») lisent ces libelles ici.
 * Les TITRES de contenu (« Ce qui se passe prochainement », « D'ou viennent ces
 * informations ? ») restent des phrases-reponses propres a chaque ecran.
 *
 * Decision du porteur (07/10/2026) : l'accueil s'appelle « Aujourd'hui » sur le
 * site ET sur le telephone. Le nom du calendrier n'est PAS encore tranche : ses
 * libelles restent ceux d'avant ce fichier, ecrits dans chaque ecran, jusqu'a
 * sa decision. */
export const LIBELLES = Object.freeze({
  aujourdhui: "Aujourd'hui",
  decide: "Ce qui a été décidé",
  qui: "Qui décide",
  argent: "Où va l'argent",
  sources: "Sources",
});
