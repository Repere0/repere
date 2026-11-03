/* LE PREFET DE REGION D'ILE-DE-FRANCE — donnee sourcee, saisie a la main le 13/10/2026.
 *
 * Source : préfecture de la région d'Île-de-France, page « Prise de fonction de Georges
 * François Leclerc, préfet de la région d'Île-de-France, préfet de Paris ». Le titre de la
 * page est vérifié ; la date du décret de nomination ne l'est pas, et Repère ne l'affiche pas.
 *
 * CE QUE CELA NE DIT PAS. C'est le préfet de REGION (et de Paris). Chacun des autres
 * départements d'Ile-de-France a son propre préfet, qui n'est PAS celui-ci : leur
 * liste n'est pas encore publiée ici, et l'écran le dit au lieu de répéter ce nom. */
export const PREFET_IDF = {
  nom: "Georges-François Leclerc",
  titre: "Préfet de la région d'Île-de-France et préfet de Paris",
  /* Date du dernier contrôle consigné du TITRE de la page (saisie du 13/10/2026).
     Une nouvelle tentative de contrôle, le 29/10/2026, a échoué (erreur côté site) :
     la date affichée est donc celle du dernier contrôle réussi, pas une date du jour. */
  titreControleLe: "13/10/2026",
  url: "https://www.prefectures-regions.gouv.fr/ile-de-france/Region-et-institutions/La-prefecture-de-Paris-et-d-Ile-de-France/Organisation-et-organigramme/Prise-de-fonction-de-Georges-Francois-Leclerc-prefet-de-la-region-d-Ile-de-France-prefet-de-Paris",
  departements: ["75", "77", "78", "91", "92", "93", "94", "95"],
};

/* Le prefet de region n'est montre que pour les departements d'Ile-de-France. */
export const prefetDeRegion = (dep: string) => (PREFET_IDF.departements.includes(dep) ? PREFET_IDF : null);
