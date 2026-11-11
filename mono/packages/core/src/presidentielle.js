/* LA PRÉSIDENTIELLE 2027 — lecture stricte des fichiers publiés (09/11/2026).
 *
 * Une seule règle pour le script de collecte ET pour l'application (deux endroits qui dérivent la
 * même règle finissent par diverger) : une entrée mal formée, ou un débat / une réunion sans
 * l'adresse de sa source, est ÉCARTÉE et comptée, jamais corrigée ni devinée.
 * Schéma : types/elections.ts. */

const texte = x => typeof x === "string" && x.trim() !== "";
const url = x => typeof x === "string" && /^https:\/\/[^\s]+$/.test(x);
const dateIso = x => typeof x === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(x) && !Number.isNaN(Date.parse(x));
const jour = x => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x);

/* 12/11/2026 (décision du porteur, exception à la règle du 10/11) : une candidature DÉCLARÉE (`statut: "declare"`),
   relevée dans la presse, n'est publiée qu'avec au moins deux sources, chacune avec son producteur, son adresse
   https et sa date. Sans cela elle est écartée comme toute entrée mal formée. Sans `statut`, c'est l'entrée
   d'avant (liste officielle), inchangée. */
const sourceDeclaration = s => !!s && texte(s.producteur) && url(s.url) && jour(s.date);
export function candidatValide(c) {
  return !!c && texte(c.id) && texte(c.nom) && texte(c.prenom) && (c.parti === null || texte(c.parti))
    && (c.programmeUrl === undefined || url(c.programmeUrl))
    && (c.statut === undefined || c.statut === "officiel" || (c.statut === "declare" && Array.isArray(c.sources)
      && c.sources.length >= 2 && c.sources.every(sourceDeclaration)));
}
export function debatValide(d) {
  return !!d && texte(d.id) && dateIso(d.date) && texte(d.chaine) && texte(d.titre)
    && Array.isArray(d.participants) && d.participants.every(texte) && url(d.sourceUrl);
}
export function meetingValide(m) {
  return !!m && texte(m.id) && dateIso(m.date) && texte(m.ville) && texte(m.candidatId) && texte(m.lieu) && url(m.sourceUrl);
}
export function metaValide(m) {
  return !!m && jour(m.lastUpdate) && !!m.source && texte(m.source.producteur) && url(m.source.url);
}

/* `brut` : le contenu des quatre fichiers, chacun pouvant être null (pas arrivé). Rend les listes
   nettoyées, le nombre d'entrées écartées, et dit pour chaque fichier s'il a été lu. */
export function lirePresidentielle(brut) {
  const liste = (f, cle, ok) => {
    const lu = !!f && Array.isArray(f[cle]);
    const tout = lu ? f[cle] : [];
    const gardes = tout.filter(ok);
    return { lu, gardes, ecartes: tout.length - gardes.length };
  };
  const c = liste(brut && brut.candidats, "candidats", candidatValide);
  const d = liste(brut && brut.debats, "debats", debatValide);
  const m = liste(brut && brut.meetings, "meetings", meetingValide);
  /* Une réunion ne vaut que pour un candidat de la liste : sans lui, elle est écartée. */
  const ids = new Set(c.gardes.map(x => x.id));
  const meetings = m.gardes.filter(x => ids.has(x.candidatId));
  return {
    candidats: c.gardes, debats: d.gardes, meetings,
    meta: brut && metaValide(brut.meta) ? brut.meta : null,
    lus: { candidats: c.lu, debats: d.lu, meetings: m.lu },
    ecartes: c.ecartes + d.ecartes + m.ecartes + (m.gardes.length - meetings.length),
  };
}
