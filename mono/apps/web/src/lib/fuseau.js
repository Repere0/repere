/* L'APPAREIL EST-IL REGLE SUR UN AUTRE FUSEAU QUE PARIS ? — 08/10/2026.
 * Les agendas de l'Assemblee et du Senat sont publies a l'heure de Paris, et
 * Repere les affiche tels quels. Sur un appareil regle ailleurs (Antilles,
 * Reunion, Polynesie...), l'ecran le dit, comme l'application mobile
 * (ui/semaine.tsx). Aucune donnee n'est envoyee : la question est posee au
 * navigateur, sur l'appareil. */
export function horsParis() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone !== "Europe/Paris"; } catch { return false; }
}
export const PHRASE_HEURE_PARIS = "Jours et heures à l'heure de Paris, comme l'agenda publié.";
