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
  /* SIGLES DE LA VIE PUBLIQUE (30/10/2026). Titres et définitions vérifiés contre les
     textes et les sites officiels ; les sigles de partis politiques n'y figurent pas
     (règle « aucun mot ne nomme un camp »). */
  an: {
    titre: "AN (Assemblée nationale)",
    corps: "Abréviation de l'Assemblée nationale, l'une des deux chambres du Parlement. Ses députés sont élus directement dans les circonscriptions.",
  },
  pjl: {
    titre: "PJL (projet de loi)",
    corps: "Texte de loi présenté par le gouvernement et déposé devant le Parlement. Il se distingue de la proposition de loi, qui vient des parlementaires.",
  },
  ppl: {
    titre: "PPL (proposition de loi)",
    corps: "Texte de loi déposé par des parlementaires, et non par le gouvernement. Il suit ensuite la même procédure parlementaire qu'un projet de loi.",
  },
  plf: {
    titre: "PLF (projet de loi de finances)",
    corps: "Texte que le gouvernement dépose chaque année, à l'automne, pour fixer les recettes et les dépenses de l'État pour l'année suivante.",
  },
  plfr: {
    titre: "PLFR (projet de loi de finances rectificative)",
    corps: "Texte qui modifie en cours d'année le budget de l'État voté dans la loi de finances.",
  },
  plfss: {
    titre: "PLFSS (projet de loi de financement de la sécurité sociale)",
    corps: "Texte que le gouvernement dépose chaque année, à l'automne, pour fixer les recettes et les dépenses de la sécurité sociale.",
  },
  lolf: {
    titre: "LOLF (loi organique relative aux lois de finances)",
    corps: "Loi organique de 2001, appliquée au budget de l'État depuis le 1er janvier 2006. Elle présente le budget par missions, programmes et actions.",
  },
  "loi organique": {
    titre: "Loi organique",
    corps: "Loi qui précise l'application de la Constitution sur un point donné. Elle suit une procédure plus stricte qu'une loi ordinaire, et le Conseil constitutionnel la contrôle avant sa promulgation.",
  },
  "49.3": {
    titre: "49.3 (article 49, alinéa 3 de la Constitution)",
    corps: "Le Premier ministre engage la responsabilité du gouvernement sur un texte, qui est alors adopté sans vote, sauf si une motion de censure est votée. Cette procédure peut être utilisée sans limite pour le budget et le financement de la sécurité sociale, et pour un autre texte par session ordinaire.",
  },
  "motion de censure": {
    titre: "Motion de censure",
    corps: "Texte déposé par des parlementaires pour renverser le gouvernement. Elle doit être votée à la majorité des membres de l'Assemblée nationale pour aboutir.",
  },
  cmp: {
    titre: "CMP (commission mixte paritaire)",
    corps: "Commission de sept députés et sept sénateurs chargée de chercher un texte commun lorsque les deux assemblées ne se sont pas mises d'accord.",
  },
  amendement: {
    titre: "Amendement",
    corps: "Proposition de modification d'un texte en cours d'examen. Un parlementaire ou le gouvernement peut en déposer, et il est voté ou rejeté.",
  },
  qag: {
    titre: "QAG (questions au gouvernement)",
    corps: "Temps de séance où des parlementaires interrogent oralement les membres du gouvernement. Les questions et les réponses sont publiées au compte rendu.",
  },
  qe: {
    titre: "QE (question écrite)",
    corps: "Question posée par écrit par un parlementaire à un ministre. La réponse est publiée au Journal officiel.",
  },
  qpc: {
    titre: "QPC (question prioritaire de constitutionnalité)",
    corps: "Question posée au cours d'un procès pour contester une loi en vigueur au motif qu'elle porte atteinte aux droits et libertés garantis par la Constitution. Applicable depuis le 1er mars 2010.",
  },
  cc: {
    titre: "CC (Conseil constitutionnel)",
    corps: "Institution qui veille à la conformité des lois à la Constitution. Elle examine les lois organiques avant leur promulgation et peut être saisie des autres lois.",
  },
  ce: {
    titre: "CE (Conseil d'État)",
    corps: "Juridiction administrative suprême, qui conseille aussi le gouvernement. Il donne son avis sur les projets de loi et sur les décrets.",
  },
  cese: {
    titre: "CESE (Conseil économique, social et environnemental)",
    corps: "Assemblée consultative composée de représentants de la société civile. Elle donne des avis sur les projets de loi et sur les questions économiques, sociales et environnementales.",
  },
  cnil: {
    titre: "CNIL (Commission nationale de l'informatique et des libertés)",
    corps: "Autorité administrative indépendante qui veille à la protection des données personnelles, dans les fichiers publics comme privés.",
  },
  "commission permanente": {
    titre: "Commission permanente",
    corps: "Groupe de parlementaires spécialisé dans un domaine, comme les finances ou les lois. Un texte y est examiné avant d'arriver dans l'hémicycle.",
  },
  "commission d'enquête": {
    titre: "Commission d'enquête",
    corps: "Groupe de parlementaires créé pour enquêter sur des faits précis. Elle peut entendre des personnes et demander des documents.",
  },
  "procédure accélérée": {
    titre: "Procédure accélérée",
    corps: "Le gouvernement peut demander qu'un texte ne soit examiné qu'une fois par assemblée, avant la commission mixte paritaire. Elle est prévue par l'article 45 de la Constitution.",
  },
  ordonnance: {
    titre: "Ordonnance",
    corps: "Texte pris par le gouvernement dans un domaine que le Parlement lui a délégué par une loi. Elle n'a valeur de loi qu'une fois ratifiée par le Parlement.",
  },
  "décret": {
    titre: "Décret",
    corps: "Texte réglementaire pris par le Premier ministre ou par le président de la République. Il précise l'application d'une loi, et ne peut pas la contredire.",
  },
  rapporteur: {
    titre: "Rapporteur",
    corps: "Parlementaire chargé d'examiner un texte au nom de sa commission, et de présenter ses conclusions en séance.",
  },
  referendum: {
    titre: "Référendum",
    corps: "Vote direct des électeurs sur une question. La Constitution en prévoit les cas, notamment à son article 11.",
  },
  maire: {
    titre: "Maire",
    corps: "Élu à la tête de la commune. Il exécute les délibérations du conseil municipal, et il est officier d'état civil.",
  },
  "conseiller municipal": {
    titre: "Conseiller municipal",
    corps: "Élu du conseil municipal. Le conseil vote le budget de la commune et délibère sur ses affaires.",
  },
  "conseiller départemental": {
    titre: "Conseiller départemental",
    corps: "Élu du conseil départemental, qui représente un canton. Le département gère notamment l'aide sociale et les collèges.",
  },
  bp: {
    titre: "BP (budget primitif)",
    corps: "Premier budget voté pour une année par la collectivité, avant le début de l'exercice. Il peut être modifié ensuite par des décisions modificatives.",
  },
  ca: {
    titre: "CA (compte administratif)",
    corps: "Bilan de l'année écoulée, établi par l'exécutif de la collectivité. Il constate ce qui a été réellement dépensé et encaissé, et il est voté par le conseil.",
  },
  dgf: {
    titre: "DGF (dotation globale de fonctionnement)",
    corps: "Somme versée par l'État aux collectivités territoriales pour leur fonctionnement, sans affectation précise.",
  },
  epci: {
    titre: "EPCI (établissement public de coopération intercommunale)",
    corps: "Structure qui regroupe plusieurs communes pour exercer des compétences en commun : communauté de communes, communauté d'agglomération, communauté urbaine ou métropole.",
  },
  crc: {
    titre: "CRC (chambre régionale des comptes)",
    corps: "Juridiction financière qui contrôle les comptes des collectivités et des établissements publics de sa région.",
  },
  ofgl: {
    titre: "OFGL (Observatoire des finances et de la gestion publique locales)",
    corps: "Organisme qui publie des données sur les finances des collectivités locales, à partir des comptes que celles-ci transmettent.",
  },
  insee: {
    titre: "INSEE (Institut national de la statistique et des études économiques)",
    corps: "Institut public qui produit les statistiques officielles sur la population et l'économie, dont les codes officiels des communes.",
  },
  hatvp: {
    titre: "HATVP (Haute Autorité pour la transparence de la vie publique)",
    corps: "Autorité indépendante qui reçoit et contrôle les déclarations de certains responsables publics, et qui publie une partie de ces déclarations.",
  },
  tva: {
    titre: "TVA (taxe sur la valeur ajoutée)",
    corps: "Impôt indirect payé à chaque étape de la production et de la vente, et répercuté sur le prix payé par le consommateur.",
  },
  csg: {
    titre: "CSG (contribution sociale généralisée)",
    corps: "Prélèvement sur la plupart des revenus, qui finance la protection sociale. Il est proportionnel aux revenus.",
  },
  crds: {
    titre: "CRDS (contribution pour le remboursement de la dette sociale)",
    corps: "Prélèvement sur une assiette proche de celle de la CSG, destiné à rembourser la dette de la sécurité sociale.",
  },
  ars: {
    titre: "ARS (agence régionale de santé)",
    corps: "Établissement public de l'État, présent dans chaque région, qui organise l'offre de santé et régule l'hôpital et les soins de ville.",
  },
  ue: {
    titre: "UE (Union européenne)",
    corps: "Union politique et économique d'États européens. Ses règles s'imposent en partie au droit national.",
  },
  ocde: {
    titre: "OCDE (Organisation de coopération et de développement économiques)",
    corps: "Organisation internationale d'États, qui publie des études et des statistiques comparées sur les économies et les politiques publiques.",
  },
  pac: {
    titre: "PAC (politique agricole commune)",
    corps: "Politique de l'Union européenne qui encadre l'agriculture et soutient les revenus des agriculteurs, en partie par des aides financées par le budget européen.",
  },
  rsa: {
    titre: "RSA (revenu de solidarité active)",
    corps: "Prestation sociale qui complète les revenus des personnes sans ressources suffisantes. Son versement relève des départements et son financement est partagé avec l'État.",
  },
  apl: {
    titre: "APL (aide personnalisée au logement)",
    corps: "Aide versée pour réduire le loyer ou la mensualité d'un prêt immobilier, selon les revenus et la situation du ménage.",
  },
  caf: {
    titre: "CAF (caisse d'allocations familiales)",
    corps: "Organisme qui verse les prestations familiales et certaines aides au logement, dans chaque département.",
  },
  cpam: {
    titre: "CPAM (caisse primaire d'assurance maladie)",
    corps: "Organisme de la sécurité sociale qui rembourse les soins et gère l'assurance maladie des salariés, dans chaque département.",
  },
  urssaf: {
    titre: "URSSAF (Unions de recouvrement des cotisations de sécurité sociale et d'allocations familiales)",
    corps: "Organisme qui encaisse les cotisations sociales des employeurs et des travailleurs indépendants.",
  },
  ehpad: {
    titre: "EHPAD (établissement d'hébergement pour personnes âgées dépendantes)",
    corps: "Établissement qui accueille des personnes âgées en perte d'autonomie, avec un hébergement et des soins.",
  },
  ter: {
    titre: "TER (train express régional)",
    corps: "Train régional, organisé et financé par la région. Ses tarifs et ses dessertes sont décidés au niveau régional.",
  },
  ccas: {
    titre: "CCAS (centre communal d'action sociale)",
    corps: "Établissement public rattaché à la commune, qui mène son action sociale locale : aide aux personnes en difficulté, aide aux personnes âgées.",
  },
  detr: {
    titre: "DETR (dotation d'équipement des territoires ruraux)",
    corps: "Subvention versée par l'État à des communes et intercommunalités rurales pour financer des équipements.",
  },
  fctva: {
    titre: "FCTVA (fonds de compensation pour la TVA)",
    corps: "Remboursement d'une partie de la TVA payée par les collectivités sur leurs dépenses d'investissement. Il est versé par l'État.",
  },
  sdis: {
    titre: "SDIS (service départemental d'incendie et de secours)",
    corps: "Établissement public du département qui organise les pompiers et les secours. Il est financé en partie par les communes et le département.",
  },
  plh: {
    titre: "PLH (programme local de l'habitat)",
    corps: "Document par lequel une intercommunalité programme la construction et la rénovation de logements sur son territoire, pour plusieurs années.",
  },
  scot: {
    titre: "SCOT (schéma de cohérence territoriale)",
    corps: "Document d'urbanisme qui fixe les grandes orientations d'aménagement d'un territoire regroupant plusieurs communes, pour plusieurs années.",
  },
  plu: {
    titre: "PLU (plan local d'urbanisme)",
    corps: "Document qui fixe, à l'échelle d'une commune ou d'une intercommunalité, les règles d'utilisation des sols et de construction.",
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
