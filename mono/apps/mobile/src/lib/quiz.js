/* LE QUIZ DU DICTIONNAIRE CITOYEN (12/11/2026, décision du porteur).
 *
 * Une question, quatre propositions dont UNE vraie : « Qu'est-ce que X ? », la vraie proposition est la définition
 * de X (celle du dictionnaire, première phrase), les trois fausses sont les définitions d'AUTRES mots du même
 * dictionnaire. Rien n'est inventé : chaque proposition est un texte déjà publié, donc exact (pour un autre mot).
 * Le quiz ne porte que sur le vocabulaire institutionnel : les sigles de groupes politiques sont exclus, et aucune
 * question ne demande une opinion.
 *
 * Qualité des fausses réponses :
 *   - jamais un mot qui partage un mot de 4 lettres ou plus avec le mot demandé (« scrutin » / « scrutin solennel »,
 *     « conseiller municipal » / « conseiller départemental ») : deux définitions pourraient être vraies ;
 *   - jamais une définition qui cite le mot demandé (ce serait un indice) ni qui lui ressemble trop ;
 *   - de préférence du même thème (budget avec budget) : le choix reste difficile et cohérent.
 * `hasard` est injectable (tests) ; par défaut Math.random : l'ordre change à chaque ouverture. */

const SIGLES_DE_GROUPES = new Set(["ps", "lr", "rn", "lfi", "eelv", "epr", "pcf", "modem", "hor", "dem", "gdr", "liot", "udi"]);
const sansAccents = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const mots = s => sansAccents(s).match(/[a-z]{4,}/g) || [];

/* Mélange de Fisher-Yates, sans toucher au tableau d'origine. */
export function melanger(liste, hasard = Math.random) {
  const a = liste.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/* Les phrases d'un texte (coupe après « . », « ! », « ? » suivis d'une majuscule). */
const phrases = t => String(t || "").split(/(?<=[.!?])\s+(?=[A-ZÀ-ÖØ-Þ«"])/u).map(x => x.trim()).filter(Boolean);

/* La proposition affichée : la première phrase, et la suivante si la première est très courte. */
export function definitionCourte(corps) {
  const p = phrases(corps);
  if (!p.length) return "";
  let t = p[0];
  if (t.length < 70 && p[1] && (t + " " + p[1]).length <= 230) t = t + " " + p[1];
  return t;
}

/* `entrees` : [{ cle, titre, corps, categorie }]. Rend celles qu'un quiz peut poser. */
export function entreesDuQuiz(entrees) {
  return entrees.filter(e => e.titre && e.corps && !SIGLES_DE_GROUPES.has(sansAccents(e.cle)) && definitionCourte(e.corps).length >= 25);
}

const partageUnMot = (a, b) => { const mb = new Set(mots(b)); return mots(a).some(m => mb.has(m)); };

function trop_proche(a, b) {
  const ma = new Set(mots(a)), mb = new Set(mots(b));
  if (!ma.size || !mb.size) return false;
  let commun = 0; for (const m of ma) if (mb.has(m)) commun++;
  return commun / Math.min(ma.size, mb.size) > 0.5;
}

/* Une question sur le mot `cle`, ou null s'il n'y a pas assez de fausses réponses valables. */
export function construireQuestion(entrees, cle, hasard = Math.random) {
  const cible = entrees.find(e => e.cle === cle);
  if (!cible) return null;
  const bonne = definitionCourte(cible.corps);
  const titreCible = sansAccents(cible.titre);
  const valables = entrees.filter(e => e.cle !== cible.cle
    && !partageUnMot(e.titre, cible.titre)
    && !sansAccents(definitionCourte(e.corps)).includes(titreCible)
    && !trop_proche(definitionCourte(e.corps), bonne)
    && definitionCourte(e.corps) !== bonne);
  /* Même thème d'abord, dans un ordre aléatoire ; les autres ensuite. */
  const memeTheme = melanger(valables.filter(e => e.categorie === cible.categorie), hasard);
  const autres = melanger(valables.filter(e => e.categorie !== cible.categorie), hasard);
  const fausses = [];
  for (const e of [...memeTheme, ...autres]) {
    const d = definitionCourte(e.corps);
    if (fausses.some(f => f.texte === d || trop_proche(f.texte, d))) continue;
    fausses.push({ cle: e.cle, titre: e.titre, texte: d });
    if (fausses.length === 3) break;
  }
  if (fausses.length < 3) return null;
  const propositions = melanger([{ cle: cible.cle, titre: cible.titre, texte: bonne, juste: true }, ...fausses.map(f => ({ ...f, juste: false }))], hasard);
  return { cle: cible.cle, titre: cible.titre, enonce: `Qu'est-ce que « ${cible.titre} » ?`, propositions, explication: cible.corps };
}

/* Toutes les questions d'une session, dans un ordre aléatoire. */
export function sessionDuQuiz(entrees, hasard = Math.random) {
  const pool = entreesDuQuiz(entrees);
  return melanger(pool, hasard).map(e => construireQuestion(pool, e.cle, hasard)).filter(Boolean);
}
