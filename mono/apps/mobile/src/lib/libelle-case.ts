/* Libelle d'accessibilite d'une case de jour (calendrier de a-venir).
 * Le mois vient de la date, jamais d'un texte en dur : le 1er novembre se lit « novembre ». */
const MOIS_LONGS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function libelleCase(iso: string, nb: number): string {
  const mois = Number(iso.slice(5, 7));
  const numero = Number(iso.slice(8, 10));
  return `${numero} ${MOIS_LONGS[mois - 1]}, ${nb} élément${nb > 1 ? "s" : ""}`;
}
