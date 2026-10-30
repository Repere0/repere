/* MANDATS TERMINES QUE LES SOURCES D'ANNUAIRE NE DISENT PAS ENCORE — D32 (30/10/2026).
 *
 * Aucun fichier publie par Repere ne porte de date de fin de mandat : le Repertoire
 * national des elus, l'executif des regions et le fichier des deputes (construire_deputes.py
 * ecarte les mandats qui ont une dateFin) ne listent que les mandats en cours. Un elu
 * decede reste donc liste jusqu'a la prochaine mise a jour de la source.
 *
 * Cette liste, tenue a la main sur decision du CEO, ne contient que des faits publies par une
 * source officielle, avec son adresse. Une entree ne s'affiche que tant que la source
 * d'annuaire liste encore la personne : quand le RNE la retire, la phrase disparait d'elle-meme. */
export type MandatTermine = {
  insee: string; nom: string; nomAffiche: string; fonction: string;
  fin: string; motif?: string; source: string; sourceNom: string;
};

export const MANDATS_TERMINES: MandatTermine[] = [
  { insee: "77288", nom: "Henri MELLIER", nomAffiche: "Henri Mellier", fonction: "Conseiller communautaire",
    fin: "2026-10-25", motif: "décès",
    source: "https://www.melun.fr/actualites/1303-obseques-dhenri-mellier", sourceNom: "Ville de Melun" },
];

/* Les entrees de la commune dont la source d'annuaire porte encore le nom. */
export function mandatsTerminesListes(insee: string, listes: { nom?: string }[] | undefined): MandatTermine[] {
  const noms = new Set((listes || []).map(e => (e.nom || "").trim().toUpperCase()));
  return MANDATS_TERMINES.filter(m => m.insee === insee && noms.has(m.nom.toUpperCase()));
}
