/* LES ABSENCES DE L'APPLICATION, CHACUNE AVEC SA PHRASE (invariant 5).
 * Deux causes d'absence, deux phrases : « le fichier n'est pas arrive » (panne,
 * on peut reessayer) n'est jamais « la source ne porte rien ». Reprises des
 * cartes de #46 et, pour le calendrier, mot pour mot de Calendrier.jsx. */
import { DGCL_URL, dateFr } from "@repere/core";

export const PROJETS_PAS_ARRIVES = {
  titre: "Les projets financés par l'État ne sont pas arrivés jusqu'ici.",
  corps: "Le fichier existe, il n'a pas pu être chargé. Ce n'est pas une absence de projet.",
};
/* Les exercices de la source, en clair (« 2024 et 2025 »), dans l'ordre croissant.
   Une liste vide ou absente ne produit aucune année : la phrase reste sans année. */
export const listerExercices = (exercices?: string[]): string => {
  const ex = [...new Set((exercices || []).filter(e => /^\d{4}$/.test(e)))].sort();
  if (ex.length === 0) return "";
  if (ex.length === 1) return ex[0];
  return `${ex.slice(0, -1).join(", ")} et ${ex[ex.length - 1]}`;
};
export const projetsAucun = (nom: string, exercices?: string[], publieLe?: string) => {
  const ex = listerExercices(exercices);
  return {
    titre: ex
      ? `Aucun projet financé par l'État n'est publié pour ${nom} sur les années budgétaires ${ex} couvertes par la source.`
      : `Aucun projet financé par l'État n'est publié pour ${nom} dans la source.`,
    corps: "La source ne couvre que les dotations d'investissement de l'État : une commune finance aussi des projets par elle-même. Les autres années budgétaires ne sont pas couvertes."
      + (publieLe ? ` Données publiées le ${dateFr(publieLe)}.` : ""),
    lien: { texte: "Projets financés par l'État — données publiques", url: DGCL_URL },
  };
};
export const VOTES_PAS_ARRIVES = {
  titre: "Les votes de l'Assemblée ne sont pas arrivés jusqu'ici.",
  corps: "Les fichiers existent, ils n'ont pas pu être chargés. Ce n'est pas une absence de vote.",
};
export const circoInconnue = (nom: string) => ({
  titre: `Repère ne connaît pas la circonscription de ${nom}.`,
  corps: "La commune est absente de la table du ministère de l'Intérieur, souvent parce qu'elle a été créée après son dernier découpage. Repère ne devine pas.",
});
export const SCRUTINS_AN = "https://www.assemblee-nationale.fr/dyn/17/scrutins/";
/* Le périmètre connu : les scrutins SOLENNELS de la 17e législature, à la date du
   relevé (scripts/mono_donnees.py, champ portee). La période n'est pas une plage de
   dates : sans date de relevé, la phrase le dit au lieu de l'inventer. */
export const voteAucun = (releve?: string, portee?: string) => ({
  titre: "Aucun vote solennel trouvé dans les données disponibles.",
  /* Le périmètre est celui que la SOURCE écrit (srcScrutins.portee), pas une supposition. */
  corps: [
    `Périmètre des données : ${portee || "non indiqué par la source"}.`,
    "Les données ne portent que sur les derniers votes, pas sur toute la législature.",
    releve ? `Relevé le ${dateFr(releve)}.` : "Repère ne connaît pas la date de relevé.",
    "Un vote solennel est un scrutin public, généralement sur le vote d'ensemble d'un texte majeur (fiche « Votes » de l'Assemblée nationale, juillet 2024).",
  ].join(" "),
  lien: { texte: "Les scrutins sur le site de l'Assemblée", url: SCRUTINS_AN },
});
export const AGENDA_PAS_ARRIVE = {
  titre: "Le calendrier n'est arrivé jusqu'à cet appareil pour aucune institution.",
  corps: "Il est republié chaque jour par Repère ; il n'a pas pu être chargé cette fois-ci.",
};
export const AGENDA_VIDE = {
  titre: "Aucune séance n'est annoncée sur la période relevée, ni au Sénat ni à l'Assemblée.",
};
export const REGION_PAS_ARRIVEE = "La liste des élus de la région n'est pas arrivée jusqu'ici.";
