/* CASSE D'UN NOM D'INSTITUTION (13/10/2026).
 *
 * Certaines sources écrivent les noms en capitales : « CA DU PAYS DE MEAUX ».
 * Un nom déjà écrit (« Ca Du Pays De Meaux » après une première mise en forme
 * ratée, ou « Conseil départemental ») n'est jamais touché. Les sigles connus
 * restent en capitales, les petits mots restent en minuscules. */
const PARTICULES = new Set(["de", "du", "des", "la", "le", "les", "et", "en", "sur", "d'"]);
const SIGLES = new Set(["CA", "CC", "CU", "EPCI", "MGP", "IDF"]);

export function casseNom(s: string | undefined): string | undefined {
  if (!s || s !== s.toUpperCase()) return s;
  return s
    .toLowerCase()
    .split(" ")
    .map((m, i) => {
      const majuscules = m.toUpperCase();
      if (SIGLES.has(majuscules)) return majuscules;
      if (i > 0 && PARTICULES.has(m)) return m;
      return m.charAt(0).toUpperCase() + m.slice(1);
    })
    .join(" ");
}
