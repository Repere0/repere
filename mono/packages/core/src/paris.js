/* PARIS ET SES ARRONDISSEMENTS — 13/11/2026 (décision du porteur : voir Paris en entier ET choisir son arrondissement).
 *
 * Ce que Repère sait : Paris est UNE commune (75056). Ses comptes, son maire, ses projets sont ceux de la Ville entière.
 * Ce que l'arrondissement change : la mairie de proximité. Depuis juillet 2020, les 1er, 2e, 3e et 4e arrondissements
 * forment un seul secteur, « Paris Centre », avec une seule mairie (loi du 28 février 2017 ; source : paris.fr).
 * Ce que Repère NE publie PAS encore par arrondissement : le maire d'arrondissement et le député. Rien n'est inventé :
 * l'écran le dit (invariant 5). Les sources à brancher sont décrites dans docs/paris-arrondissements.md. */
export const PARIS = "75056";
export const estParis = insee => insee === PARIS;

export const ARRONDISSEMENTS = Array.from({ length: 20 }, (_, i) => i + 1);
/* « 1er », « 2e » … « 20e ». */
export const ordinalArrondissement = n => (n === 1 ? "1er" : `${n}e`);
export const nomArrondissement = n => `Paris ${ordinalArrondissement(n)}`;

/* La mairie de proximité : « Paris Centre » pour les quatre premiers, sinon celle de l'arrondissement. */
export function mairieArrondissement(n) {
  if (!ARRONDISSEMENTS.includes(n)) return null;
  return n <= 4
    ? { nom: "Mairie de Paris Centre", detail: "Une seule mairie pour les 1er, 2e, 3e et 4e arrondissements, depuis juillet 2020." }
    : { nom: `Mairie du ${ordinalArrondissement(n)} arrondissement`, detail: null };
}

/* L'arrondissement d'un code postal, LU dans codes-postaux.json (La Poste range chaque code sous le code INSEE de
   l'arrondissement, 75101 à 75120 ; la collecte le garde dans `arrondissements`). Fichier absent ou code inconnu : null.
   On ne déduit rien du code postal lui-même : « 75116 » est dans le 16e, pas dans un « 116e ». */
export function arrondissementDuCodePostal(codesPostaux, codePostal) {
  const t = codesPostaux && codesPostaux.arrondissements;
  const insee = t && Object.prototype.hasOwnProperty.call(t, codePostal) ? t[codePostal] : null;
  const n = typeof insee === "string" && /^751(0[1-9]|1\d|20)$/.test(insee) ? Number(insee.slice(3)) : null;
  return n && ARRONDISSEMENTS.includes(n) ? n : null;
}
