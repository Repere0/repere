import React from "react";
import { Mot } from "@repere/ui";

/* SORTI DE OuVaArgent.jsx LE 18/09/2026, POUR LE PROTOTYPE "AUJOURD'HUI".
 *
 * Le piege que ce fichier evite est nomme dans CLAUDE.md : deux endroits qui
 * derivent la meme regle finissent par diverger sans que personne ne le
 * decide. Le prototype a besoin de la MEME traduction (l'encours de dette en
 * mois de recettes, la part de salaires...) que l'ecran "Ou va l'argent" —
 * pas d'une deuxieme version qui pourrait un jour dire autre chose pour le
 * meme exercice de la meme commune. Une seule fonction, deux appelants. */

/* Le tableau plat des comptes : [population, montant0, parHab0, montant1, ...].
   Voir OuVaArgent.jsx pour l'historique de la garde zero/absence (15/09/2026). */
export function valeur(ex, i) {
  if (!Array.isArray(ex)) return null;
  const m = ex[1 + i * 2], h = ex[2 + i * 2];
  const mm = typeof m === "number" ? m : null;
  const hh = typeof h === "number" ? h : null;
  return mm === null && hh === null ? null : { m: mm, hab: hh, zero: mm === 0 };
}
export const population = ex => (Array.isArray(ex) && ex[0] > 0 ? ex[0] : null);
export const pourCent = (a, b) => Math.round((a / b) * 100);

/* TRADUIRE, pas afficher. Chaque phrase porte ce qu'elle NE veut PAS dire.
   Aucun de ces rapports ne sort du territoire affiche — invariant 3. */
export function rapports(ex) {
  const v = i => valeur(ex, i);
  const [rec, dep, det, inv, sal, imp] = [0, 1, 2, 3, 4, 5].map(v);
  const nn = x => x && typeof x.m === "number" && x.m > 0;
  const out = [];
  if (nn(det) && nn(rec)) out.push({
    l: <>Son <Mot cle="encours de dette">encours de dette</Mot></>,
    v: (det.m / (rec.m / 12)).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " mois de recettes",
    d: "Si tout ce qui est encaissé allait au remboursement, il faudrait ce temps-là. Ce n'est pas ce qui se passe : une dette se rembourse sur des années, et un emprunt sert le plus souvent à payer un équipement qui durera plus longtemps que lui.",
  });
  if (nn(sal) && nn(dep)) out.push({
    l: "Sur 100 € dépensés", v: pourCent(sal.m, dep.m) + " € de salaires",
    d: "Ce sont les agents qui tiennent l'école, la cantine, l'état civil, les espaces verts. Une part élevée n'est pas un gaspillage : c'est souvent le signe d'une collectivité qui rend ses services elle-même plutôt que de les acheter à l'extérieur.",
  });
  if (nn(inv) && nn(dep)) out.push({
    l: "Sur 100 € dépensés", v: pourCent(inv.m, dep.m) + " € d'investissement",
    d: "Les travaux et les équipements : une école, une voirie, une salle. Cette part bouge beaucoup d'une année à l'autre — haute l'année d'un chantier, basse ensuite. Une seule année ne dit rien d'une tendance.",
  });
  if (nn(imp) && nn(rec)) {
    const p = pourCent(imp.m, rec.m);
    out.push({
      l: "Sur 100 € encaissés", v: p + " € d'impôts et taxes",
      d: `Les ${100 - p} € restants viennent d'ailleurs : dotations versées par l'État, subventions d'autres collectivités, sommes payées par les usagers de certains services. Repère ne détaille pas cette composition — le fichier ne la porte pas.`,
    });
  }
  if (nn(dep)) out.push({
    l: "Ses dépenses", v: Math.round(dep.m / 365).toLocaleString("fr-FR") + " € par jour",
    d: "Moyenne sur l'année, pas un rythme réel : les dépenses d'une collectivité sont très irrégulières. C'est une façon de rendre un total annuel imaginable, rien de plus.",
  });
  return out;
}

/* Le dernier exercice qui porte au moins un montant — meme regle que
   OuVaArgent.jsx, pour ne jamais choisir un exercice different du meme ecran. */
export function dernierExercice(c, agregats) {
  if (!c || !c.comptes) return null;
  const ans = Object.keys(c.comptes).filter(a => /^\d{4}$/.test(a)).sort();
  for (let i = ans.length - 1; i >= 0; i--) {
    if (agregats.some((_, j) => valeur(c.comptes[ans[i]], j))) return { an: ans[i], ex: c.comptes[ans[i]] };
  }
  return null;
}
