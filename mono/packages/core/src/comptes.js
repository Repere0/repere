/* @repere/core — LA LECTURE DES COMPTES, SANS INTERFACE (29/09/2026).
 * Deplace depuis apps/web/src/lib/comptes.jsx : valeur, population, pourCent,
 * rapports (en texte), dernierExercice, evolution. Le web habille `rapports`
 * (un mot du dictionnaire devient un bouton) ; le calcul, lui, n'existe qu'ici. */
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
   Aucun de ces rapports ne sort du territoire affiche — invariant 3.
   `mot` : le terme du dictionnaire contenu dans `l`, que chaque interface
   habille a sa maniere (bouton de definition sur le web). */
export function rapports(ex) {
  const v = i => valeur(ex, i);
  const [rec, dep, det, inv, sal, imp] = [0, 1, 2, 3, 4, 5].map(v);
  const nn = x => x && typeof x.m === "number" && x.m > 0;
  const out = [];
  if (nn(det) && nn(rec)) out.push({
    l: "Son encours de dette", mot: "encours de dette",
    v: (det.m / (rec.m / 12)).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " mois de recettes",
    d: "Si tout ce qui est encaissé allait au remboursement, il faudrait ce temps-là. Ce n'est pas ce qui se passe : une dette se rembourse sur des années, et un emprunt sert le plus souvent à payer un équipement qui durera plus longtemps que lui.",
  });
  if (nn(sal) && nn(dep)) out.push({
    l: "Sur 100 € dépensés", v: pourCent(sal.m, dep.m) + " € de salaires",
    d: "Ce sont les agents qui tiennent l'école, la cantine, l'état civil, les espaces verts. Une part élevée n'est pas un gaspillage : c'est souvent le signe d'une collectivité qui rend ses services elle-même plutôt que de les acheter à l'extérieur.",
  });
  if (nn(inv) && nn(dep)) out.push({
    l: "Sur 100 € dépensés", v: pourCent(inv.m, dep.m) + " € pour investir",
    d: "Investir, c'est payer ce qui durera : des travaux, des bâtiments, des équipements, et parfois une aide versée au projet d'un autre. Cette part bouge beaucoup d'une année à l'autre — haute l'année d'un chantier, basse ensuite. Une seule année ne dit rien d'une tendance.",
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

/* D'UN EXERCICE A L'AUTRE (29/09/2026) — l'ecran que la reprise du 16/09 designait
 * comme celui qui rendrait Repere utile, et pas seulement vrai : « deux montants
 * dates, la difference en euros, aucun pourcentage ».
 *
 * CE QUI EST COMPARE : les deux exercices publies les plus recents, s'ils se
 * suivent (2024 et 2025 aujourd'hui ; 2021 n'est jamais compare a 2024 — trois
 * ans d'ecart ne disent pas « depuis l'an dernier »).
 *
 * CE QUI N'EST PAS COMPARE : deux exercices dont la population differe de plus
 * de 10 %. Mesure : une population legale bouge de quelques pour cent par an ;
 * au-dela, le territoire a change (fusion de communes, comme Saint-Denis et
 * Pierrefitte au 1er janvier 2025) et la difference mesurerait la fusion, pas
 * la gestion. On le dit au lieu de soustraire.
 *
 * AUCUN POURCENTAGE, AUCUNE COULEUR DE JUGEMENT : une hausse n'est ni bonne ni
 * mauvaise. La difference est un calcul de Repere, annonce comme tel. */
export const SEUIL_PERIMETRE = 0.10;
export function evolution(c, agregats) {
  if (!c || !c.comptes) return null;
  const ans = Object.keys(c.comptes).filter(a => /^\d{4}$/.test(a)
    && agregats.some((_, j) => valeur(c.comptes[a], j))).sort();
  if (ans.length < 2) return null;
  const an2 = ans[ans.length - 1], an1 = ans[ans.length - 2];
  if (Number(an2) - Number(an1) !== 1) return null;
  const ex1 = c.comptes[an1], ex2 = c.comptes[an2];
  const p1 = population(ex1), p2 = population(ex2);
  const perimetreChange = !!(p1 && p2 && Math.abs(p2 - p1) / p1 > SEUIL_PERIMETRE);
  const lignes = agregats.map((a, i) => {
    const v1 = valeur(ex1, i), v2 = valeur(ex2, i);
    const m1 = v1 && typeof v1.m === "number" ? v1.m : null;
    const m2 = v2 && typeof v2.m === "number" ? v2.m : null;
    return { libelle: a[1], m1, m2, diff: m1 !== null && m2 !== null ? m2 - m1 : null };
  });
  return { an1, an2, p1, p2, perimetreChange, lignes };
}
