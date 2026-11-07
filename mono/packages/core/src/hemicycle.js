/* L'HEMICYCLE (07/11/2026) : la composition de l'Assemblee, dessinee en sieges.
 *
 * ORDRE DES GROUPES : ALPHABETIQUE (sigle), « Inconnu » en dernier. Jamais par taille :
 * ranger des partis par leur nombre de sieges est un tri numerique de partis (invariant 3).
 * La place d'un groupe sur l'arc ne dit donc ni sa place reelle dans la salle, ni une
 * position politique ; l'ecran l'ecrit. Le nombre de sieges de chaque groupe est un fait
 * (table AMO30), affiche a cote du sigle. Aucun libelle majorite / opposition. */

/* noms : le groupe de chaque depute (deja normalise). Retourne [{ groupe, sieges }]. */
export function compositionGroupes(noms, inconnu = "Inconnu") {
  const n = new Map();
  for (const g of noms || []) if (typeof g === "string" && g) n.set(g, (n.get(g) || 0) + 1);
  return [...n].map(([groupe, sieges]) => ({ groupe, sieges }))
    .sort((a, b) => (a.groupe === inconnu) - (b.groupe === inconnu) || a.groupe.localeCompare(b.groupe, "fr"));
}

/* n sieges sur `rangs` arcs concentriques, rayon exterieur 1, interieur `creux`.
 * Retourne [{ x, y }] (x de -1 a 1, y de 0 a 1, vers le haut), de la gauche vers la droite :
 * les groupes, pris dans l'ordre, occupent chacun un secteur. */
export function siegesHemicycle(n, rangs = 8, creux = 0.4) {
  if (!(n > 0)) return [];
  const r = Array.from({ length: rangs }, (_, i) => creux + (1 - creux) * (rangs === 1 ? 1 : i / (rangs - 1)));
  const somme = r.reduce((a, b) => a + b, 0);
  const parRang = r.map(x => Math.floor((n * x) / somme));
  for (let i = rangs - 1, reste = n - parRang.reduce((a, b) => a + b, 0); reste > 0; i = (i + rangs - 1) % rangs, reste--) parRang[i]++;
  const s = [];
  r.forEach((rayon, i) => {
    const k = parRang[i];
    for (let j = 0; j < k; j++) {
      const a = Math.PI * (1 - (k === 1 ? 0.5 : j / (k - 1)));
      s.push({ x: rayon * Math.cos(a), y: rayon * Math.sin(a), a });
    }
  });
  return s.sort((p, q) => q.a - p.a || Math.hypot(p.x, p.y) - Math.hypot(q.x, q.y)).map(({ x, y }) => ({ x, y }));
}
