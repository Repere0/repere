/* LES ABSENCES DE L'APPLICATION, CHACUNE AVEC SA PHRASE (invariant 5).
 * Deux causes d'absence, deux phrases : « le fichier n'est pas arrive » (panne,
 * on peut reessayer) n'est jamais « la source ne porte rien ». Reprises des
 * cartes de #46 et, pour le calendrier, mot pour mot de Calendrier.jsx. */
import { DGCL_URL } from "@repere/core";

export const PROJETS_PAS_ARRIVES = {
  titre: "Les projets financés par l'État ne sont pas arrivés jusqu'ici.",
  corps: "Le fichier existe, il n'a pas pu être chargé. Ce n'est pas une absence de projet.",
};
export const projetsAucun = (nom: string) => ({
  titre: `Aucun projet financé par l'État n'est publié pour ${nom} sur les années relevées.`,
  corps: "La source ne couvre que les dotations d'investissement de l'État : une commune finance aussi des projets par elle-même.",
  lien: { texte: "Projets financés par l'État — données publiques", url: DGCL_URL },
});
export const VOTES_PAS_ARRIVES = {
  titre: "Les votes de l'Assemblée ne sont pas arrivés jusqu'ici.",
  corps: "Les fichiers existent, ils n'ont pas pu être chargés. Ce n'est pas une absence de vote.",
};
export const circoInconnue = (nom: string) => ({
  titre: `Repère ne connaît pas la circonscription de ${nom}.`,
  corps: "La commune est absente de la table du ministère de l'Intérieur, souvent parce qu'elle a été créée après son dernier découpage. Repère ne devine pas.",
});
export const SCRUTINS_AN = "https://www.assemblee-nationale.fr/dyn/17/scrutins/";
export const VOTE_AUCUN = {
  titre: "Aucun vote solennel de votre député n'est porté par le relevé de l'Assemblée.",
  lien: { texte: "Les scrutins sur le site de l'Assemblée", url: SCRUTINS_AN },
};
export const AGENDA_PAS_ARRIVE = {
  titre: "Le calendrier n'est arrivé jusqu'à cet appareil pour aucune institution.",
  corps: "Il est republié chaque jour par Repère ; il n'a pas pu être chargé cette fois-ci.",
};
export const AGENDA_VIDE = {
  titre: "Aucune séance n'est annoncée sur la période relevée, ni au Sénat ni à l'Assemblée.",
};
export const REGION_PAS_ARRIVEE = "La liste des élus de la région n'est pas arrivée jusqu'ici.";
/* NON PUBLIE PAR REPERE — 06/10/2026. Le serveur a repondu que le fichier
   n'existe pas : Repere ne le publie pas pour ce departement (mesure du jour :
   projets pour les 8 departements d'Ile-de-France, votes pour les 104). Trois
   phrases a ne pas confondre : « pas arrive » (panne, reessayer), « aucun »
   (la source ne porte rien), et celle-ci, sans bouton : reessayer ne changerait
   rien. La liste des departements n'est pas ecrite ici : elle change. */
export const projetsNonPublies = (nomDep: string) => ({
  titre: `Repère ne publie pas encore les projets financés par l'État pour ${nomDep}.`,
  corps: "Ce n'est pas une absence de projet : Repère n'a pas encore traité ce département. La source officielle reste consultable.",
  lien: { texte: "Projets financés par l'État — données publiques", url: DGCL_URL },
});
export const votesNonPublies = (nomDep: string) => ({
  titre: `Repère ne publie pas encore les votes des députés pour ${nomDep}.`,
  corps: "Ce n'est pas une absence de vote : les scrutins sont publics sur le site de l'Assemblée nationale.",
  lien: { texte: "Les scrutins sur le site de l'Assemblée", url: SCRUTINS_AN },
});
