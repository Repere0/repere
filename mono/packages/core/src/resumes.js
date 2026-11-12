/* LE RESUME « EN CLAIR » D'UN TEXTE VOTE — 12/11/2026 (note de conception des resumes, garde-fou 5).
 * Un resume ne s'affiche que s'il est valide PAR LE PORTEUR (`valide` vaut exactement true), qu'il a un
 * texte, et que sa source porte une adresse https et une date de releve (invariant 4). Sinon : null, et
 * l'ecran dit « Pas encore de resume pour ce texte » avec le lien officiel (invariant 5). */
export const MENTION_RESUME = "Rédigé avec l'assistance d'une IA, relu et validé par un humain.";
export const PAS_DE_RESUME = "Pas encore de résumé pour ce texte.";
export function resumeAffichable(r) {
  if (!r || r.valide !== true) return null;
  const texte = String(r.resume || "").trim();
  const src = r.source || {};
  if (!texte || !/^https:\/\//.test(src.url || "") || !/^\d{4}-\d{2}-\d{2}$/.test(src.releve_le || "")) return null;
  return { texte, producteur: src.producteur || "", url: src.url, releveLe: src.releve_le };
}
