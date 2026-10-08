/* @repere/core — ECRIRE UNE DATE COMME ON LA DIT (29/09/2026).
 * Deplace depuis packages/ui/src/composants.jsx : « 1er octobre 2026 »,
 * « jeudi 1er octobre 2026 ». Le web et le mobile ecrivent les dates de la meme
 * facon ; packages/ui les re-exporte. */
/* « mise a jour du 2026-07-29 » est une date de machine. Vu sur une capture : un
   ecran qui explique des comptes publics ne peut pas ecrire ses dates en ISO. */
export function dateFr(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v || ""));
  if (!m) return v;
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
                "août", "septembre", "octobre", "novembre", "décembre"];
  return Number(m[3]) + (m[3] === "01" ? "er" : "") + " " + mois[Number(m[2]) - 1] + " " + m[1];
}

/* Deplace de Calendrier.jsx le 28/09/2026 pour servir aussi a Aujourdhui.jsx : « jeudi 1er octobre 2026 »,
   jamais « jeudi 1 octobre » comme le produisait toLocaleDateString. */
export function jourFr(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  if (!m) return "";
  const jours = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  /* LE JOUR DE LA SEMAINE SE LIT SUR LA DATE ECRITE, PAS SUR L'HORLOGE DE L'APPAREIL
     — 07/10/2026. `new Date("2026-10-08").getDay()` lit minuit UTC puis le convertit
     a l'heure locale : en Guadeloupe (UTC-4) ou a Tahiti (UTC-10), on affichait
     « mercredi 8 octobre 2026 » pour un jeudi. Le nom du jour suit desormais
     l'annee, le mois et le jour de la chaine, comme le reste de la phrase. */
  const j = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
  return jours[j] + " " + dateFr(`${m[1]}-${m[2]}-${m[3]}`);
}


/* Un montant en euros, a la francaise : « 533 466 € ». */
export function euros(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " €";
}

/* « 9 h », « 15 h 30 » (typographie francaise), depuis une date ISO locale. */
export function heureFr(iso) {
  const m = /T(\d{2}):(\d{2})/.exec(iso || "");
  if (!m) return "";
  return Number(m[1]) + " h" + (m[2] === "00" ? "" : " " + m[2]);
}

/* « jeu. », « ven. » : le nom court d'un jour, lu sur la date ecrite (jamais sur
   l'horloge de l'appareil, voir jourFr) et sans dependre d'Intl, inegal selon
   les moteurs JavaScript des telephones. 07/10/2026. */
export function jourCourt(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  if (!m) return "";
  return ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."][new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay()];
}
