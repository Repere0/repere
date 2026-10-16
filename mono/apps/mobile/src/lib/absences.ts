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
/* DOCTRINE DU VIDE, AVEC SON LIEN (16/10/2026) : plusieurs absences n'avaient qu'une
   phrase. Le lien est celui que la donnee publie elle-meme (index.json, agendas) : il
   n'est jamais recopie ici, il est passe par l'ecran ; sans adresse, pas de lien. */
const lienSi = (texte: string, url?: string | null) => (url ? { lien: { texte, url } } : {});
export const circoInconnue = (nom: string, url?: string | null) => ({
  titre: `Repère ne connaît pas la circonscription de ${nom}.`,
  corps: "La commune est absente de la table du ministère de l'Intérieur, souvent parce qu'elle a été créée après son dernier découpage. Repère ne devine pas.",
  ...lienSi("La table des circonscriptions du ministère", url),
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
export const agendaVide = (url?: string | null) => ({
  titre: "Aucune séance n'est annoncée sur la période relevée, ni au Sénat ni à l'Assemblée.",
  ...lienSi("L'agenda officiel de l'Assemblée nationale", url),
});
/* Le refus d'apparier deux releves (@repere/core) : la phrase du socle, et le lien
   vers les scrutins officiels, ou la position se lit sans risque d'erreur. */
export const refusAppariement = (r: { titre: string; corps: string }) => ({
  titre: r.titre, corps: r.corps, lien: { texte: "Les scrutins sur le site de l'Assemblée", url: SCRUTINS_AN },
});
export const REGION_PAS_ARRIVEE = "La liste des élus de la région n'est pas arrivée jusqu'ici.";
