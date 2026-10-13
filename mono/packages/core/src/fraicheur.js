/* FRAICHEUR DE LA PUBLICATION, DITE EN PHRASE (beta, 13/10/2026).
 *
 * Invariant 9 : une donnee gardee sur l'appareil peut etre affichee, mais jamais
 * presentee comme actuelle si elle ne l'est pas. Trois etats, toujours distincts
 * a l'ecran :
 *   du-jour     : publiee aujourd'hui ;
 *   hier        : publiee la veille ;
 *   precedente  : plus ancienne ; Repere ne peut pas affirmer qu'elle est la derniere ;
 *   inconnue    : pas de date lisible ; on ne pretend pas que c'est a jour.
 * Les dates sont des « AAAA-MM-JJ » a l'heure de Paris (jourParis). */

/* Ecart en jours entiers entre deux dates « AAAA-MM-JJ », calcule en UTC : aucun decalage de fuseau. */
function ecartJours(de, a) {
  const [y1, m1, d1] = de.split("-").map(Number);
  const [y2, m2, d2] = a.split("-").map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
}

export function fraicheurPublication(publie, aujourdhui) {
  if (!publie || !/^\d{4}-\d{2}-\d{2}$/.test(publie)) {
    return { etat: "inconnue", jours: null, phrase: "Repère ne peut pas dire quand ces fichiers ont été publiés." };
  }
  const jours = Math.max(0, ecartJours(publie, aujourdhui));
  if (jours === 0) return { etat: "du-jour", jours, phrase: "Publication du jour." };
  if (jours === 1) return { etat: "hier", jours, phrase: "Publication d'hier." };
  return {
    etat: "precedente",
    jours,
    /* Vraie en ligne comme hors ligne : le bandeau de fraicheur (ui/fraicheur.tsx) dit, lui,
       si la publication a pu etre verifiee. Cette phrase ne le pretend jamais. */
    phrase: `Publication précédente, il y a ${jours} jours.`,
  };
}
