/* LA FRAICHEUR DITE AU LECTEUR — INVARIANT 9 (decision du porteur du 30/09/2026).
 *
 * « Repère peut afficher une donnée provenant du cache pour préserver l'accès
 * hors ligne. Mais il ne doit JAMAIS présenter une donnée ancienne comme si
 * elle était actuelle. »
 *
 * L'etat vient de packages/data-utils/src/client.js (`etatFraicheur`), un seul
 * pour la session, lu par le site ET par l'application. Les phrases sont ICI,
 * une fois : les deux surfaces disent la meme chose, et un controle
 * d'invariants refuse qu'elles soient reecrites ailleurs.
 *
 *   actuelle   -> rien a dire (null) : la date de publication, deja affichee, suffit ;
 *   precedente -> une partie vient d'une publication anterieure, dite avec sa date
 *                 quand on la connait ;
 *   nouvelle   -> une publication est parue pendant la lecture : proposee, jamais
 *                 imposee ;
 *   inconnue   -> pas de verification possible : on dit de quand date ce que l'on
 *                 montre, et pourquoi on ne peut pas verifier — hors connexion ou
 *                 serveur injoignable, deux causes, deux phrases (invariant 5). */
import { dateFr } from "./format.js";

const dateDe = v => (v ? dateFr(String(v).slice(0, 10)) : null);

export function phraseFraicheur(e) {
  if (!e || (e.etat !== "precedente" && e.etat !== "inconnue")) return null;
  const date = dateDe(e.depuis);
  if (e.nouvelle) {
    return {
      etat: "nouvelle",
      titre: "Une publication plus récente est disponible.",
      corps: date ? `Ce qui s'affiche date de la publication du ${date}.` : "Ce qui s'affiche date de la publication précédente.",
      action: "Mettre à jour",
    };
  }
  if (e.etat === "precedente") {
    return {
      etat: "precedente",
      titre: date
        ? `Une partie de ce qui s'affiche date de la publication du ${date}.`
        : "Une partie de ce qui s'affiche date d'une publication précédente.",
      corps: "Le réseau n'a pas permis de tout mettre à jour. Rien n'est inventé : ces données ont été publiées, mais ce ne sont pas les dernières.",
    };
  }
  const cause = e.horsLigne ? "Vous êtes hors connexion" : "Repère n'a pas pu joindre le serveur";
  return {
    etat: "inconnue",
    titre: date
      ? `${cause} : ce qui s'affiche vient de la publication du ${date}.`
      : `${cause} : ce qui s'affiche vient de la dernière publication reçue sur cet appareil.`,
    corps: "Une publication plus récente existe peut-être. Repère ne peut pas le vérifier sans connexion.",
  };
}
