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
import { positionsFiables, positionSur } from "./votes.jsx";

/* L'Etat ne publie pas le jour d'un projet, seulement l'exercice budgetaire. On
   le range donc au 31 decembre de son annee — apres les votes de cette annee —
   et l'ecran ecrit « exercice 2025 », jamais une date inventee. */
const finDAnnee = a => `${a}-12-31`;

export function calculerFaits({ dep, fiche, projets, commune, cat, pos, deputes }) {
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
                     type: "vote", sc, position, qui: nomComplet, ref: d.acteurRef });
      }
    }
  }

  /* L'ORDRE, ET RIEN QUE LUI — voir CeQuiADecide.jsx pour la justification
     complete (invariant 3 : ni montant, ni echelon n'entre dans le tri). */
  faits.sort((a, b) => (a.quand < b.quand ? 1 : a.quand > b.quand ? -1 : a.rang - b.rang));
  return faits;
}
