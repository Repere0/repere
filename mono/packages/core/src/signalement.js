/* SIGNALER UNE ERREUR SUR UNE INFORMATION (beta, 13/10/2026).
 *
 * Un courriel prerempli, ouvert dans la messagerie du lecteur : Repere ne
 * recoit rien, ne retient rien, ne sait pas qui ecrit. Le destinataire est le
 * contact public du projet (deja affiche sur le site). Le courriel nomme la
 * source, sa date et son lien, pour que le retour soit exploitable ; il ne
 * contient ni le nom de la commune choisie ni aucun identifiant. */
import { dateFr } from "./format.js";

export const CONTACT_REPERE = "repere0@protonmail.com";

export function courrielSignalement(source) {
  const s = source || {};
  const date = s.maj ? dateFr(s.maj) : s.releve ? `relevée le ${dateFr(s.releve)}` : null;
  const corps = [
    "Bonjour,",
    "",
    "Je signale une erreur sur une information de Repère.",
    "",
    `Source : ${s.producteur || "non précisée"}`,
    date ? `Date : ${date}` : null,
    s.url ? `Lien : ${s.url}` : null,
    "",
    "Ce que je vois, et ce qui devrait être écrit :",
    "",
  ].filter(l => l !== null).join("\n");
  const sujet = "Repère — signalement d'une erreur";
  return `mailto:${CONTACT_REPERE}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
}
