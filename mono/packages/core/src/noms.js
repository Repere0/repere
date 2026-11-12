/* COMPARER DES NOMS DE PERSONNES (12/11/2026).
 *
 * « Repère ne retrouve pas … dans le fichier des députés » venait d'une égalité stricte entre deux écritures
 * du même nom : « Jean-Éric DUPONT » (annuaire) contre « Jean Eric Dupont » (fichier des députés), ou
 * « NOM Prénom » contre « Prénom NOM ». Une seule règle, pour le cœur et pour l'application :
 *   - sans accents (NFD, marques retirées), sans casse ;
 *   - tirets, apostrophes (droite ou typographique), points et espaces insécables comptent pour une espace ;
 *   - l'ORDRE des mots ne compte pas (« DUPONT Jean » = « Jean Dupont »), leur ensemble oui.
 * Jamais de comparaison floue : un mot de plus ou de moins, ou une faute, ne s'apparie pas. Repère ne devine pas. */
export function cleNom(nom) {
  return String(nom ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[-‐‑–—'’`.  _,]/g, " ")
    .split(/\s+/).filter(Boolean).sort().join(" ");
}

/* Vrai si les deux écritures désignent le même nom complet. Un nom vide ne correspond à rien. */
export function memeNom(a, b) {
  const ka = cleNom(a);
  return ka !== "" && ka === cleNom(b);
}
