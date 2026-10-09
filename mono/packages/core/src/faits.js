/* @repere/core — deplace depuis apps/web/src/lib/faits.js le 29/09/2026, sans
 * changement de logique, pour que le web et l'application mobile assemblent
 * exactement les memes faits. */
/* SORTI DE CeQuiADecide.jsx LE 18/09/2026, POUR LE PROTOTYPE "AUJOURD'HUI".
 *
 * Cette fonction assemble les DEUX familles de faits dates (un projet finance
 * par l'Etat, un vote solennel du depute) et les trie du plus recent au plus
 * ancien. Le prototype "Aujourd'hui" a besoin du MEME fait le plus recent que
 * le fil complet — jamais d'un calcul parallele qui pourrait un jour diverger
 * et montrer deux "faits les plus recents" differents pour la meme commune
 * selon l'ecran ouvert.
 *
 * LA SECURITE D'IMPUTATION VIT ICI, ET NULLE PART AILLEURS DESORMAIS : le nom
 * complet du depute (jamais le patronyme seul, voir la note "Gregoire" du
 * 14/09/2026 plus bas) et la reference `d.acteurRef` plutot que le nom pour
 * grouper les lignes d'un meme depute. Toute nouvelle vue qui a besoin de ces
 * faits appelle cette fonction ; elle ne relit jamais les fichiers a la main. */
import { positionsFiables, positionSur } from "./votes.js";

/* L'Etat ne publie pas le jour d'un projet, seulement l'exercice budgetaire. On
   le range donc au 31 decembre de son annee — apres les votes de cette annee —
   et l'ecran ecrit « en 2025 », jamais une date inventee. */
const finDAnnee = a => `${a}-12-31`;

/* UN PROJET ENGAGE AVANT UNE FUSION DE COMMUNES (29/09/2026). extract-html.js
   rattache a la commune d'aujourd'hui les projets d'un ancien code (table du
   Code officiel geographique) et marque la ligne `ancien_code` /
   `ancienne_commune`. L'Etat les avait engages pour l'ancienne commune : l'ecran
   doit le dire, jamais les attribuer en silence a la commune actuelle. Une seule
   formulation, ici, pour tous les ecrans qui montrent un projet. */
export function ancienneCommune(p) {
  if (!p || !p.ancien_code) return null;
  return p.ancienne_commune || `l'ancienne commune ${p.ancien_code}`;
}
export function noteRattachement(p) {
  const a = ancienneCommune(p);
  return a ? `Engagé pour ${a}, commune aujourd'hui rattachée à celle-ci.` : null;
}

/* LE FIL EDITORIAL — BLOCKER #3 DE LA MISSION DU 22/09/2026.
 *
 * CE QUE C'EST, TRACE JUSQU'A LA SOURCE. `data/evenements/*.md` (a la racine
 * du depot) porte une entete YAML (titre, date, echelon, source, source_nom,
 * confiance, valide) et un corps en deux parties, « Le fait » et « Ce que ca
 * change ». `outils/evenements.py` (Python, execute par outils/pipeline.sh,
 * jamais depuis ce poste) ne publie QUE les fichiers marques `valide: true`
 * a la main par un humain, avec une source dans une liste d'institutions
 * autorisees (jamais un media) — c'est ce geste humain qui rend vraie la
 * promesse « relu par un humain ». `evenements.json` est le resultat deja
 * filtre : chaque entree qui arrive ICI a deja passe cette porte.
 *
 * CE QUI N'EST PAS FAIT ICI : aucune ligne de ce fichier n'invente une
 * validation. Le champ `conf` (confiance : "verifie" ou "a_confirmer") est
 * transporte tel quel jusqu'a l'ecran, qui doit le distinguer — voir
 * CeQuiADecide.jsx. Ne jamais transformer "a_confirmer" en "verifie", et ne
 * jamais dire "detecte automatiquement" alors que le geste qui a produit
 * cette ligne est un humain qui a ecrit `valide: true` dans un fichier. */
function faitsEditoriaux(evenements, { dep, commune }) {
  if (!evenements || !Array.isArray(evenements.r)) return [];
  return evenements.r
    .filter(e => e.e === "france" || (e.insee && (e.insee === commune || e.insee === dep)))
    .map(e => ({ cle: "ed" + e.id, quand: e.d, rang: 2, echelon: e.e === "france" ? "france" : "ville",
                 type: "editorial", e }));
}

export function calculerFaits({ dep, fiche, projets, commune, cat, pos, deputes, evenements }) {
  const faits = [];
  if (!fiche) return faits;

  const listeProjets = (projets && projets.communes && projets.communes[commune]) || [];
  for (const p of listeProjets) {
    faits.push({ cle: "p" + p.annee + p.intitule, quand: finDAnnee(p.annee), rang: 0,
                 echelon: "ville", type: "projet", p });
  }

  /* Le vote du depute de CETTE commune, et d'aucun autre. Une commune a cheval
     sur deux circonscriptions porte une liste : on prend les deux. */
  const circos = Array.isArray(fiche.circo) ? fiche.circo
                 : (fiche.circo === null || fiche.circo === undefined ? [] : [fiche.circo]);
  const apparie = positionsFiables(cat, pos);
  if (cat && cat.scrutins && pos && pos.positions && deputes && deputes.deputes && apparie) {
    for (const circo of circos) {
      const d = deputes.deputes[dep + "-" + circo];
      if (!d || !d.acteurRef) continue;
      /* LE NOM COMPLET, ET JAMAIS LE PATRONYME SEUL — voir CeQuiADecide.jsx
         (historique complet, 14/09/2026 : Emmanuel GREGOIRE / Olivia Gregoire). */
      const nomComplet = [d.prenom, d.nom].filter(Boolean).join(" ") || d.nom || "";
      for (const sc of cat.scrutins) {
        const position = positionSur(pos, d.acteurRef, sc.n);
        faits.push({ cle: "v" + circo + sc.u, quand: sc.d, rang: 1, echelon: "france",
                     type: "vote", sc, position, qui: nomComplet, ref: d.acteurRef, circo });
      }
    }
  }

  faits.push(...faitsEditoriaux(evenements, { dep, commune }));

  /* L'ORDRE, ET RIEN QUE LUI — voir CeQuiADecide.jsx pour la justification
     complete (invariant 3 : ni montant, ni echelon n'entre dans le tri). */
  faits.sort(ordreDesFaits);
  return faits;
}

/* LE PLUS RECENT D'ABORD, ET UNE REGLE POUR LE MEME JOUR — 07/10/2026.
   Mesure : le 21/07/2026, quatre votes solennels le meme jour ; le catalogue ne
   porte que la date, pas l'heure. Le tri gardait alors l'ordre du fichier, et
   « Aujourd'hui » mettait en avant le premier vote de la journee (8430) au lieu
   du dernier (8434) : un artefact de tri qui ressemblait a un choix editorial.
   Regle explicite : date decroissante, puis, entre deux faits du meme jour, le
   rang (projet, vote, fait relu), puis, entre deux votes du meme jour, le NUMERO
   de scrutin decroissant - l'Assemblee nationale numerote ses scrutins dans
   l'ordre ou ils ont lieu, c'est la seule donnee qui demontre l'ordre dans la
   journee. Numero illisible : l'ordre de la source est garde, rien n'est devine. */
export function ordreDesFaits(a, b) {
  /* Le JOUR d'abord ; l'heure seulement si les deux faits en portent une
     (« 2026-07-21T15:00 » contre « 2026-07-21 » : une heure absente n'est pas
     « minuit », on ne la compare pas). 07/10/2026. */
  const ja = String(a.quand || "").slice(0, 10), jb = String(b.quand || "").slice(0, 10);
  if (ja !== jb) return ja < jb ? 1 : -1;
  const ha = String(a.quand || "").slice(11), hb = String(b.quand || "").slice(11);
  if (ha && hb && ha !== hb) return ha < hb ? 1 : -1;
  if (a.rang !== b.rang) return a.rang - b.rang;
  if (a.type === "vote" && b.type === "vote") {
    const na = Number(a.sc && a.sc.n), nb = Number(b.sc && b.sc.n);
    if (Number.isFinite(na) && Number.isFinite(nb) && na !== nb) return nb - na;
  }
  return 0;
}
