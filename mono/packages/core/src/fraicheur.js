/* LA FRAICHEUR DITE AU LECTEUR — INVARIANT 9 (decision du porteur du 30/09/2026).
 *
 * « Repère peut afficher une donnée provenant du cache pour préserver l'accès
 * hors ligne. Mais il ne doit JAMAIS présenter une donnée ancienne comme si
 * elle était actuelle. »
 *
 * L'etat vient de packages/data-utils/src/client.js (`etatFraicheur`) : un seul
 * etat pour la session, lu par le site ET par l'application. Les phrases sont
 * ici, une seule fois, pour que les deux disent la meme chose (controle
 * « meme verite »).
 *
 *   actuelle   -> rien a dire : la date de publication, deja affichee, suffit.
 *   precedente -> une partie vient d'une publication anterieure : on le dit, avec
 *                 la date de cette publication quand on la connait.
 *   inconnue   -> le serveur n'a pas pu etre joint : on ne pretend pas que c'est
 *                 a jour, et on dit de quand date ce que l'on montre. */
import { dateFr } from "./format.js";

export function phraseFraicheur(e) {
  if (!e || e.etat === "actuelle" || !e.generation) return null;
  const date = e.depuis ? dateFr(String(e.depuis).slice(0, 10)) : null;
  if (e.etat === "precedente") {
    return {
      etat: "precedente",
      titre: date
        ? `Une partie de ces informations date de la publication du ${date}.`
        : "Une partie de ces informations date d'une publication précédente.",
      corps: "Repère n'a pas pu récupérer la plus récente. Elle s'affichera à votre prochaine connexion.",
    };
  }
  /* Deux causes, deux phrases (invariant 5) : l'appareil se sait hors
     connexion, ou il est connecte mais le serveur ne repond pas. */
  const cause = e.horsLigne ? "Vous êtes hors connexion" : "Repère n'a pas pu joindre le serveur";
  return {
    etat: "inconnue",
    titre: date
      ? `${cause} : ces informations viennent de la publication du ${date}.`
      : `${cause} : ces informations viennent d'une publication précédente.`,
    corps: "Une publication plus récente existe peut-être. Repère ne peut pas le vérifier sans connexion.",
  };
}
