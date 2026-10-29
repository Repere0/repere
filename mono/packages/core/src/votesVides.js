/* LE VIDE DU VOTE D'UN DEPUTE, EN CINQ ETATS — 29/10/2026.
 *
 * « Aucun vote » recouvrait cinq causes différentes. Une seule règle, partagée
 * par le site et l'application (invariant 5 : une absence de donnée produit une
 * phrase vraie, et un échec n'est jamais une absence) :
 *   RELEVE_NON_LU        le fichier des votes ou des députés n'est pas arrivé ;
 *   RELEVE_INCOHERENT    les deux relevés ne se correspondent pas (appariement refusé) ;
 *   CIRCO_INCONNUE       la commune n'a pas de circonscription dans la fiche ;
 *   CIRCO_SANS_DEPUTE    aucun député de la commune n'est dans le fichier des députés ;
 *   POSITION_ABSENTE     le relevé est lu, le député est identifié, mais il n'a
 *                        aucune position dans le périmètre publié.
 * Seul le dernier état dit « aucun vote » : les quatre autres disent ce qui manque.
 * Un non-vote n'est pas publié par l'Assemblée (outils/scrutins_an.py) : une
 * position absente ne veut pas dire que le député était absent. */
import { dateFr } from "./format.js";
import { positionsFiables, REFUS_APPARIEMENT } from "./votes.js";
import { POSITION_NON_PORTEE } from "./phrases.js";

export const ETAT_VOTE = Object.freeze({
  RELEVE_NON_LU: "releve-non-lu",
  RELEVE_INCOHERENT: "releve-incoherent",
  CIRCO_INCONNUE: "circo-inconnue",
  CIRCO_SANS_DEPUTE: "circo-sans-depute",
  POSITION_ABSENTE: "position-absente",
});

export const URL_SCRUTINS_AN = "https://www.assemblee-nationale.fr/dyn/17/scrutins/";

const circosDe = fiche => Array.isArray(fiche.circo) ? fiche.circo : (fiche.circo == null ? [] : [fiche.circo]);

/* L'état du vide quand AUCUN vote n'est affiché. Les données absentes valent null.
   Ordre : ce qui n'est pas lu, puis ce qui ne s'apparie pas, puis ce qui manque
   dans la fiche ou le fichier des députés, puis l'absence de position. */
export function etatVoteVide({ fiche, dep, cat, pos, deputes }) {
  if (!cat || !pos || !deputes || !deputes.deputes) return ETAT_VOTE.RELEVE_NON_LU;
  if (!positionsFiables(cat, pos)) return ETAT_VOTE.RELEVE_INCOHERENT;
  const circos = circosDe(fiche || {});
  if (circos.length === 0) return ETAT_VOTE.CIRCO_INCONNUE;
  /* Une commune à cheval : il suffit qu'une circonscription ait son député. */
  const identifies = circos.filter(c => { const d = deputes.deputes[dep + "-" + c]; return d && d.acteurRef; });
  if (identifies.length === 0) return ETAT_VOTE.CIRCO_SANS_DEPUTE;
  return ETAT_VOTE.POSITION_ABSENTE;
}

/** Le texte affiché pour chaque état. `releve` : date de récupération (ISO) ;
   `portee` : le périmètre écrit par la source (srcScrutins.portee).
   @param {string} etat  un des valeurs de ETAT_VOTE
   @param {{ nom?: string, releve?: string, portee?: string }} [o] */
export function copieVoteVide(etat, { nom = "", releve, portee } = {}) {
  const lien = { texte: "Les scrutins sur le site de l'Assemblée", url: URL_SCRUTINS_AN };
  switch (etat) {
    case ETAT_VOTE.RELEVE_NON_LU:
      return { titre: "Les votes de l'Assemblée ne sont pas arrivés jusqu'ici.",
        corps: "Le fichier n'a pas pu être chargé. Ce n'est pas une absence de vote.", lien };
    case ETAT_VOTE.RELEVE_INCOHERENT:
      return { titre: REFUS_APPARIEMENT.titre, corps: REFUS_APPARIEMENT.corps, lien };
    case ETAT_VOTE.CIRCO_INCONNUE:
      return { titre: nom ? `Repère ne connaît pas la circonscription de ${nom}.` : "Repère ne connaît pas la circonscription de cette commune.",
        corps: "Le fichier du ministère de l'Intérieur que Repère lit ne donne pas de circonscription pour cette commune. Repère ne devine pas.", lien };
    case ETAT_VOTE.CIRCO_SANS_DEPUTE:
      return { titre: nom ? `Le fichier des députés ne porte aucun député pour la circonscription de ${nom}.` : "Le fichier des députés ne porte aucun député pour cette circonscription.",
        corps: "Ce n'est pas une absence de vote : la donnée manque dans le fichier que Repère lit. Repère ne devine pas le député.", lien };
    case ETAT_VOTE.POSITION_ABSENTE:
      return { titre: "Aucun vote solennel trouvé dans les données disponibles.",
        corps: [
          `Ce que couvrent les données : ${portee || "la source ne l'indique pas"}.`,
          "Les données ne portent que sur les derniers votes, pas sur toute la législature.",
          releve ? `Données récupérées le ${dateFr(releve)}.` : "La date à laquelle ces données ont été récupérées n'est pas connue.",
          "Un vote solennel est un scrutin public, généralement sur le vote d'ensemble d'un texte majeur, c'est-à-dire le vote sur le texte entier (fiche « Votes » de l'Assemblée nationale, juillet 2024).",
          POSITION_NON_PORTEE,
        ].join("\n"),
        lien };
    default:
      /* Un état inconnu ou absent ne prend jamais le texte « Aucun » : on le dit. */
      return { titre: "Repère ne peut pas afficher le vote de ce député.",
        corps: "Une donnée attendue manque ou n'a pas le bon format. Ce n'est pas une absence de vote.", lien };
  }
}
