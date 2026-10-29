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
  "assemblée nationale": {
    titre: "Assemblée nationale",
    corps: "Une des deux chambres du Parlement. Ses membres, les députés, sont élus directement dans les circonscriptions. Elle vote la loi avec le Sénat et contrôle l'action du gouvernement.",
  },
  "sénat": {
    titre: "Sénat",
    corps: "L'autre chambre du Parlement. Ses membres, les sénateurs, sont élus au suffrage indirect par un collège de grands électeurs : des députés, des sénateurs et des élus locaux (conseillers régionaux, conseillers départementaux et délégués des conseils municipaux, soit pas tous les conseillers municipaux). Il vote la loi avec l'Assemblée nationale.",
  },
  scrutin: {
    titre: "Scrutin",
    corps: "Vote organisé sur un texte ou une proposition. Lorsqu'il est public, la position de chaque député est enregistrée et publiée : c'est ce qui permet de savoir comment il a voté.",
  },
  séance: {
    titre: "Séance",
    corps: "Réunion au cours de laquelle une assemblée débat et vote sur les textes inscrits à son ordre du jour.",
  },
  "ordre du jour": {
    titre: "Ordre du jour",
    corps: "Liste des textes qu'une assemblée doit examiner pendant une séance, fixée à l'avance et modifiable.",
  },
  subvention: {
    titre: "Subvention",
    corps: "Somme versée par l'État ou une collectivité pour aider à financer un projet ou une activité, sans contrepartie directe de biens ou de services. Elle ne couvre souvent qu'une partie du coût total.",
  },
  investissement: {
    titre: "Investissement",
    corps: "Dépense qui crée ou améliore un bien durable : route, école, équipement. Elle se distingue du fonctionnement, qui couvre les dépenses courantes.",
  },
  fonctionnement: {
    titre: "Fonctionnement",
    corps: "Dépenses courantes d'une collectivité ou de l'État : salaires, énergie, entretien, fournitures. Elles reviennent chaque année, à la différence de l'investissement.",
  },
  préfet: {
    titre: "Préfet",
    corps: "Représentant de l'État dans un département ou une région. Il fait appliquer la loi au niveau local et contrôle la légalité des décisions des collectivités. Il n'est pas élu.",
  },
};

/* MOTS_ALIAS : au cas ou un texte affiche emploie une variante du mot (au
 * pluriel, ou avec un article) — la cle de recherche dans MOTS reste unique,
 * l'alias n'est qu'une facilite d'appel depuis un composant. */
/* Une cle n'est un mot que si l'objet la porte EN PROPRE : sans cela, « constructor »
 * ou « __proto__ » (heritees de tout objet) passeraient pour des definitions. */
const estMot = (cle) => typeof cle === "string" && Object.prototype.hasOwnProperty.call(GLOSSAIRE, cle);
export function definition(cle) {
  return estMot(cle) ? GLOSSAIRE[cle] : null;
}
/* Le titre a afficher pour un mot tapable, ou null : un mot sans definition n'est
 * jamais tapable (apps/mobile, Segments). Partage par le site et l'application. */
export function titreDuMot(cle) {
  const m = definition(cle);
  return m ? m.titre : null;
}
/* Les mots definis d'une phrase, une fois chacun, avec leur titre. L'application
 * les affiche SOUS la phrase, chacun dans une zone tactile de 44 px : un mot dans
 * la phrase ne fait que ~21 px de haut (refuse par le parcours navigateur de la CI,
 * 29/10/2026). */
export function motsDuTexte(segments) {
  const vus = new Set();
  const sortie = [];
  for (const s of segments || []) {
    const titre = s && s.mot ? titreDuMot(s.mot) : null;
    if (titre && !vus.has(s.mot)) {
      vus.add(s.mot);
      sortie.push({ mot: s.mot, titre });
    }
  }
  return sortie;
}
