/* LA LANGUE DU CITOYEN — une seule table, pour ne pas refaire l'erreur du
 * monolithe : `DEFS` et `DICO` y coexistent, redefinissent en partie les memes
 * mots (delegation, scrutin, enquete publique...) avec des textes qui ont
 * fini par diverger. Ici, une seule cle par mot, et le composant <Mot> comme
 * le futur ecran "Comprendre" (s'il existe un jour) liront la meme table.
 *
 * CHAQUE DEFINITION EST EXACTE SUR LE PLAN INSTITUTIONNEL, PAS SIMPLIFIEE
 * JUSQU'A DEVENIR FAUSSE. Deux ou trois phrases, jamais un cours. Aucun mot
 * ne nomme une personne ni un camp — la neutralite du produit et l'interdiction
 * de ranger des territoires ou des personnes s'appliquent aussi au glossaire. */
export const GLOSSAIRE = {
  circonscription: {
    titre: "Circonscription",
    corps: "Territoire dans lequel les électeurs élisent un député à l'Assemblée nationale. La France en compte 577 ; le découpage actuel date de 2010. Une commune peut être partagée entre plusieurs circonscriptions.",
  },
  mandat: {
    titre: "Mandat",
    corps: "Période pendant laquelle un élu exerce la fonction pour laquelle il a été élu. Sa durée et ses conditions de fin sont fixées par la loi, pas par l'élu lui-même.",
  },
  exercice: {
    titre: "Exercice budgétaire",
    corps: "Année de référence sur laquelle une collectivité prévoit puis exécute ses recettes et dépenses. Un même montant peut différer d'un exercice à l'autre : ce n'est jamais un chiffre figé dans le temps.",
  },
  "encours de dette": {
    titre: "Encours de dette",
    corps: "Capital restant à rembourser par la collectivité à une date donnée, hors intérêts déjà payés. Rapporté aux recettes de fonctionnement, il donne un ordre de grandeur, pas une alerte.",
  },
  "scrutin solennel": {
    titre: "Scrutin solennel",
    corps: "Vote à l'Assemblée nationale portant sur l'ensemble d'un texte (et non sur un article de détail), dont la position de chaque député est enregistrée et publiée officiellement.",
  },
  "groupe parlementaire": {
    titre: "Groupe parlementaire",
    corps: "Formation qui réunit des parlementaires déclarés ensemble, à partir d'un seuil de membres. Un groupe parlementaire n'est pas un parti : il peut en réunir plusieurs, et des députés y siègent sans appartenir à aucun.",
  },
  intercommunalité: {
    titre: "Intercommunalité",
    corps: "Regroupement de communes qui exerce ensemble certaines compétences (transports, déchets, eau…). Ses élus ne sont pas élus directement par vous : ce sont vos conseillers municipaux qui y siègent.",
  },
  "conseil départemental": {
    titre: "Conseil départemental",
    corps: "Assemblée élue du département. Elle décide notamment des collèges, des routes départementales et d'une partie des aides sociales.",
  },
  "conseil régional": {
    titre: "Conseil régional",
    corps: "Assemblée élue de la région. Elle décide notamment des lycées, des trains express régionaux et de la formation professionnelle.",
  },
  "adjoint au maire": {
    titre: "Adjoint au maire",
    corps: "Conseiller municipal élu par le conseil pour exercer des fonctions déléguées par le maire. Leur nombre est plafonné à 30 % de l'effectif du conseil.",
  },
};

/* MOTS_ALIAS : au cas ou un texte affiche emploie une variante du mot (au
 * pluriel, ou avec un article) — la cle de recherche dans MOTS reste unique,
 * l'alias n'est qu'une facilite d'appel depuis un composant. */
export function definition(cle) {
  return GLOSSAIRE[cle] || null;
}

/* LES MOTS D'UN TEXTE QUI ONT UNE DEFINITION (15/10/2026). Renvoie le texte coupe en
 * morceaux : { t } pour du texte, { t, cle } pour le premier emploi d'un mot du
 * glossaire. Un seul lien par mot et par texte (sinon le texte est souligne partout) ;
 * mot entier seulement (« circonscriptionnelle » ne compte pas), casse, accents et
 * pluriel en « s » ignores. Un mot absent du glossaire n'a jamais de lien. */
const sansAccent = c => c.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
export function termesDuTexte(texte) {
  const src = String(texte || "");
  if (!src) return [];
  /* Forme normalisee caractere par caractere, avec la position d'origine de chacun :
     la casse et les accents changent la longueur, pas le rang. */
  const norm = []; const pos = [];
  let i = 0;
  for (const c of src) { const n = sansAccent(c); for (const k of n) { norm.push(k); pos.push(i); } i += c.length; }
  const forme = norm.join("");
  const trouves = [];
  for (const cle of Object.keys(GLOSSAIRE)) {
    /* chaque mot peut prendre un « s » : « adjoints au maires » et « scrutins solennels » */
    const motif = sansAccent(cle).split(" ").map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "s?").join(" ");
    const re = new RegExp(`(^|[^a-z0-9])(${motif})(?=$|[^a-z0-9])`);
    const m = re.exec(forme);
    if (!m) continue;
    trouves.push({ debut: m.index + m[1].length, fin: m.index + m[0].length, cle });
  }
  trouves.sort((a, b) => a.debut - b.debut);
  const segments = []; let curseur = 0;
  for (const x of trouves) {
    if (x.debut < curseur) continue;
    const debutOrig = pos[x.debut];
    const finOrig = pos[x.fin - 1] + 1;
    if (debutOrig > curseur) segments.push({ t: src.slice(curseur, debutOrig) });
    segments.push({ t: src.slice(debutOrig, finOrig), cle: x.cle });
    curseur = finOrig;
  }
  if (curseur < src.length) segments.push({ t: src.slice(curseur) });
  return segments;
}
