/* RAPPEL UNE HEURE AVANT UNE SEANCE (beta, 13/10/2026).
 *
 * Repere ne programme rien lui-meme : l'application confie le rappel au telephone,
 * qui le garde. Repere ne retient rien.
 *
 * Doctrine : jamais de rappel pour un moment deja passe, ni a moins d'une heure ;
 * l'heure annoncee est celle de Paris ; la source est nommee, comme a l'ecran. */

const AVANCE_MS = 60 * 60e3;

/* L'heure de Paris, au format français (« 15:00 »). */
export function heureParis(date) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Paris" }).format(date);
}

/* `seance` : un evenement de seancesAgenda (debut en Date). Renvoie null si le rappel
   tomberait dans le passe ou moins d'une heure avant le debut. */
export function rappelSeance(seance, maintenant) {
  const declenchement = new Date(seance.debut.getTime() - AVANCE_MS);
  if (declenchement.getTime() <= maintenant.getTime()) return null;
  const source = seance.producteur ? ` Source : ${seance.producteur}.` : "";
  return {
    date: declenchement,
    titre: `Dans une heure : ${seance.titre}`,
    corps: `Commence à ${heureParis(seance.debut)}, heure de Paris.${source}`,
  };
}
