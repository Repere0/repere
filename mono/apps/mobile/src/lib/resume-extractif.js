/* RÉSUMÉ EXTRACTIF D'UNE RÉPONSE DU GOUVERNEMENT (12/11/2026, décision du porteur).
 *
 * Pas de serveur, pas de modèle : un calcul déterministe, dans l'appareil, qui CHOISIT deux ou trois phrases
 * de la réponse et les recopie telles quelles, dans leur ordre d'origine. Rien n'est reformulé, rien n'est
 * ajouté : une phrase affichée est une phrase de l'Assemblée. L'écran l'annonce comme un calcul de Repère
 * (invariant 4) et garde la réponse complète à un geste.
 *
 * Méthode : découpage en phrases (sans couper « M. », « Mme », « n° », « art. »…) ; on écarte les formules de
 * politesse ; chaque phrase reçoit un score = fréquence, dans toute la réponse, des mots porteurs de sens
 * qu'elle contient (hors mots outils), plus un point pour un chiffre (un montant, une date) ; la première
 * phrase de fond est favorisée (c'est là que la réponse commence). Les phrases de plus haute note sont gardées, puis
 * remises dans l'ordre du texte. Réponse courte (3 phrases ou moins) : elle est rendue entière, car la
 * résumer n'apporterait rien. */

const ABREVIATIONS = /\b(?:M|Mme|Mmes|MM|Mlle|Dr|Pr|St|Ste|n|nos?|art|arts|al|cf|etc|p|pp|env|vol|ex|av|bd|sec|min|Md|Mds|Me|Mr)\.$/i;
const POLITESSE = /^(?:merci|monsieur|madame|mesdames|messieurs|chère|cher|permettez|je vous remercie|je tiens à (?:vous )?remercier|vous m'avez interrogé|vous m’avez interrogé|bonjour)/i;
const OUTILS = new Set(("le la les un une des du de d l au aux à a et ou mais donc or ni car que qu qui quoi dont où ce cet cette ces se s sa son ses leur leurs ma mon mes ta ton tes " +
  "notre nos votre vos nous vous je j tu il elle ils elles on y en ne n pas plus très aussi comme sur sous dans par pour avec sans entre vers chez est sont été être avait ont avoir fait faire " +
  "cela ceci ça celui celle ceux elles si lors alors ainsi même mêmes tout tous toute toutes bien peu moins ici là cadre").split(" "));

export function phrases(texte) {
  const t = String(texte || "").replace(/\s+/g, " ").trim();
  if (!t) return [];
  const brut = t.split(/(?<=[.!?…])\s+(?=[«"“A-ZÀ-ÖØ-Þ0-9])/u);
  const sortie = [];
  for (const morceau of brut) {
    const precedent = sortie[sortie.length - 1];
    /* « M. » ou « n° 3. » en fin de morceau : la phrase continue. */
    if (precedent && (ABREVIATIONS.test(precedent) || /\b[A-ZÀ-Þ]\.$/.test(precedent))) sortie[sortie.length - 1] = precedent + " " + morceau;
    else sortie.push(morceau);
  }
  return sortie;
}

const mots = (p) => p.toLocaleLowerCase("fr").match(/[a-zà-ÿœ]+/gu)?.filter(m => m.length > 2 && !OUTILS.has(m)) ?? [];

/* Renvoie { phrases: string[], complet: boolean } : `complet` vaut vrai quand la réponse est rendue entière. */
export function resumeExtractif(texte, max = 3) {
  const toutes = phrases(texte);
  if (toutes.length <= max) return { phrases: toutes, complet: true };
  const fond = toutes.map((p, i) => ({ p, i })).filter(({ p }) => p.length >= 40 && !POLITESSE.test(p));
  if (fond.length <= max) return { phrases: fond.map(x => x.p), complet: false };
  const frequence = new Map();
  for (const { p } of fond) for (const m of new Set(mots(p))) frequence.set(m, (frequence.get(m) || 0) + 1);
  const notes = fond.map(({ p, i }, rang) => {
    const ms = [...new Set(mots(p))];
    const base = ms.reduce((a, m) => a + (frequence.get(m) > 1 ? frequence.get(m) : 0), 0) / Math.sqrt(ms.length || 1);
    const chiffre = /\d/.test(p) ? 1 : 0;
    const premiere = rang === 0 ? 1.5 : 0;
    const longue = p.length > 320 ? -2 : 0;
    return { p, i, note: base + chiffre + premiere + longue };
  });
  const gardees = notes.sort((a, b) => b.note - a.note || a.i - b.i).slice(0, max).sort((a, b) => a.i - b.i);
  return { phrases: gardees.map(x => x.p), complet: false };
}
