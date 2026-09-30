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
  const d = new Date(iso);
  return jours[d.getDay()] + " " + dateFr(`${m[1]}-${m[2]}-${m[3]}`);
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
