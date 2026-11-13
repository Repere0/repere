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

/* LES GROUPES A CERNER (07/11/2026) : deux couleurs de groupe trop proches (distance RVB sous
 * `seuil`) se confondent sur l'hemicycle. Le second de chaque paire, dans l'ordre affiche, recoit
 * un contour : la palette (invariant 7) n'est pas modifiee. Mesure sur palette.ts le 07/11/2026 :
 * DEM/EPR 46, GDR/LFI 48, HOR/LR 58, LIOT/Inconnu 0 (meme gris). */
export function groupesACerner(groupes, couleurDe, seuil = 60) {
  const rvb = h => [1, 3, 5].map(i => parseInt(String(h).slice(i, i + 2), 16));
  const d = (a, b) => Math.hypot(...rvb(a).map((v, i) => v - rvb(b)[i]));
  const cernes = new Set();
  groupes.forEach((g, i) => {
    if (groupes.slice(0, i).some(p => !cernes.has(p) && d(couleurDe(p), couleurDe(g)) < seuil)) cernes.add(g);
  });
  return cernes;
}

/* ─── LE PLAN RÉEL DE L'HÉMICYCLE (13/11/2026, décision du porteur) ───────────────────────────────────
 * Tant que le plan publié par l'Assemblée n'est pas lisible, l'arc ci-dessus reste : des sièges inventés,
 * rangés par ordre alphabétique de groupe, et l'écran l'écrit. Quand il l'est, chaque point est la VRAIE
 * place d'un député dans la salle : le creux du perchoir, les travées, tout vient de la source.
 *
 * L'ORDRE DE LA LÉGENDE SUIT ALORS LA SALLE, de la gauche vers la droite vue du perchoir. Ce n'est pas
 * un rang (invariant 3) : personne n'est « premier », rien n'est trié par taille ni par valeur ; c'est
 * la description d'un lieu, comme le plan lui-même, et l'écran dit d'où elle vient. */

/* Les sièges du plan, chacun avec le groupe de son occupant : [{ x, y, groupe }].
 * `groupeDe(acteur)` rend le groupe d'un député, ou l'inconnu. Un siège vide (personne ne l'occupe) est
 * écarté : un point sans député serait un fait faux. */
export function siegesDuPlan(plan, groupeDe, inconnu = "Inconnu") {
  if (!plan || !Array.isArray(plan.sieges)) return [];
  return plan.sieges
    .filter(s => s && s.acteur && Number.isFinite(s.x) && Number.isFinite(s.y))
    .map(s => ({ x: s.x, y: s.y, groupe: groupeDe(s.acteur) || inconnu }));
}

/* Les groupes du plan, de la gauche vers la droite : [{ groupe, sieges }].
 * La place d'un groupe est la moyenne des x de ses sièges ; à égalité (deux groupes mêlés), l'ordre
 * alphabétique départage, pour que la liste ne bouge pas d'une publication à l'autre. */
export function groupesDansLaSalle(sieges, inconnu = "Inconnu") {
  const par = new Map();
  for (const s of sieges || []) {
    const g = par.get(s.groupe) || { groupe: s.groupe, sieges: 0, somme: 0 };
    g.sieges++; g.somme += s.x;
    par.set(s.groupe, g);
  }
  return [...par.values()]
    .map(g => ({ groupe: g.groupe, sieges: g.sieges, place: g.somme / g.sieges }))
    .sort((a, b) => (a.groupe === inconnu) - (b.groupe === inconnu) || a.place - b.place || a.groupe.localeCompare(b.groupe, "fr"))
    .map(({ groupe, sieges }) => ({ groupe, sieges }));
}
