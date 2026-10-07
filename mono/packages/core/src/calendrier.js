/* @repere/core — LE CALENDRIER SE LIT PAR JOURNEE — 07/10/2026 (PR D de la refonte).
 *
 * MESURE (agenda de l'Assemblee releve le 5/10/2026) : 79 seances publiques, dont
 * 30 sur la seconde partie du projet de loi de finances, souvent trois le meme jour
 * (9 h, 15 h, 21 h 30), chacune ecrite en toutes lettres. L'ecran repetait trois
 * fois le meme intitule officiel, et les autres points de l'ordre du jour etaient
 * caches derriere « En savoir plus ».
 *
 * CE QUI CHANGE : les seances d'une meme institution sur un meme texte, LE MEME
 * JOUR, deviennent une seule ligne avec leurs heures. L'ordre du calendrier est
 * garde (chaque ligne est placee a sa premiere seance) ; rien n'est retire.
 *
 * CE QUI NE CHANGE PAS : l'intitule affiche est celui de la PREMIERE seance du
 * groupe, mot pour mot. La cle de regroupement retire seulement l'amorce de
 * procedure (« Suite de la discussion », « Discussion »), comme titreLisible ;
 * elle ne sert qu'a comparer, jamais a afficher.
 *
 * LES AUTRES POINTS DE L'ORDRE DU JOUR viennent du champ `description` quand il
 * suit la forme ecrite par scripts/agenda-an.mjs (« Également à l'ordre du jour :
 * A ; B »). Ils sont listes mot pour mot, sans doublon (au sens du texte), et sans le texte du
 * groupe lui-meme. Une description d'une autre forme (Senat) reste un texte libre. */

const AMORCE = /^(suite de la discussion|discussion)\s+/i;
const PREFIXE_POINTS = /^Également à l'ordre du jour\s*:\s*/;

export function cleTexte(titre) {
  return String(titre || "").trim().replace(AMORCE, "").toLowerCase();
}

export function pointsOrdreDuJour(description) {
  const d = String(description || "");
  if (!PREFIXE_POINTS.test(d)) return null;
  return d.replace(PREFIXE_POINTS, "").split(" ; ").map(t => t.trim()).filter(Boolean);
}

/* `evenements` : deja fusionnes et tries (chaque evenement porte `institution`).
   Renvoie des groupes dans l'ordre de leur premiere seance :
   { jour, institution, cle, titre, debut, heures[], seances, categorie, lieu,
     points[] | null, texteLibre | null, debuts[] } */
export function regrouperParJour(evenements) {
  const groupes = [];
  const index = new Map();
  for (const e of evenements || []) {
    const jour = String(e.debut || "").slice(0, 10);
    const k = [jour, e.institution || "", e.categorie || "", cleTexte(e.titre)].join("|");
    let g = index.get(k);
    if (!g) {
      g = { jour, institution: e.institution, cle: e.cle, source: e.source, titre: e.titre, debut: e.debut,
        categorie: e.categorie || null, lieu: e.lieu || null, debuts: [], points: null, textesLibres: [] };
      index.set(k, g);
      groupes.push(g);
    }
    g.debuts.push(e.debut);
    const pts = pointsOrdreDuJour(e.description);
    if (pts) {
      g.points = g.points || [];
      /* sans doublon AU SENS DU TEXTE : « Discussion de X » (9 h) et « Suite de la
         discussion de X » (15 h) sont un seul point ; la premiere forme est gardee. */
      for (const p of pts) {
        const c = cleTexte(p);
        if (c !== cleTexte(g.titre) && !g.points.some(q => cleTexte(q) === c)) g.points.push(p);
      }
    } else if (e.description && !g.textesLibres.includes(e.description)) {
      g.textesLibres.push(e.description);
    }
  }
  for (const g of groupes) g.seances = g.debuts.length;
  return groupes;
}

/* L'AGE D'UN RELEVE, EN JOURS ENTIERS (heure de Paris). La collecte releve chaque
   matin : 0 ou 1 jour est l'etat normal ; au-dela, au moins une collecte a manque
   et l'agenda a pu changer depuis. null si la date est absente ou illisible. */
export function ageReleve(releve_le, maintenant) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(releve_le || ""));
  if (!m) return null;
  const now = maintenant instanceof Date ? maintenant : new Date();
  const p = {};
  for (const x of new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now)) p[x.type] = x.value;
  const auj = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day));
  const rel = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Math.round((auj - rel) / 864e5);
}
export const AGE_RELEVE_NORMAL = 1;
