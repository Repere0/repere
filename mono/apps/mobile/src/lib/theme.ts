/* LE SYSTEME DE DESIGN DE REPERE MOBILE — refonte du 30/09/2026,
 * theme clair ET sombre depuis le 20/10/2026.
 *
 * COULEURS. Les cinq couleurs d'echelon viennent de @repere/data-utils
 * (invariant 7), jamais recopiees ici ; tout le reste est neutre, sous
 * l'amplitude de 24 sur les canaux RGB. Consequence assumee : l'identite passe
 * par la typographie, la composition et le mouvement, pas par une palette. Et
 * un vote n'a jamais de vert ni de rouge : pas de « bon » ni de « mauvais ».
 *
 * TYPOGRAPHIE. Bricolage Grotesque (OFL, embarquee dans l'application, jamais
 * chargee depuis un hote tiers — decision 4 du monorepo) pour les questions,
 * les noms de lieu et les grands nombres : c'est la voix de Repere. Le texte
 * courant reste dans la police du systeme (SF, Roboto) : la plus lisible sur
 * chaque telephone, et celle qui suit le mieux la taille de texte choisie par
 * le lecteur (Dynamic Type, taille de police Android).
 *
 * DEUX THEMES, UN SEUL POINT D'ENTREE. `couleurs`, `TYPO`, `TEINTES`,
 * `GRIS_VOTE` et `OMBRE` restent des objets qu'on importe comme avant : ce
 * sont des vues sur le theme courant, recalculees quand il change. Aucun ecran
 * n'a eu a changer une ligne. Les feuilles de style de module passent par
 * `feuille()`, sinon elles figeraient la couleur au chargement du module.
 * Les valeurs sombres sont celles du site (mono/packages/ui/src/tokens.css) :
 * un seul produit, une seule palette. */
import { useColorScheme } from "react-native";
import { ECHELONS } from "@repere/data-utils";

export type Echelon = keyof typeof ECHELONS;
export type Mode = "clair" | "sombre";

/* NEUTRES — mesures le 20/10/2026 (outils de mesure dans le test
   theme-sombre.test.mjs, qui refait le calcul) :
   amplitude RGB <= 17 partout, donc sous le plafond de 24 de l'invariant 7 ;
   contraste du texte >= 5,46:1 en sombre, >= 5,28:1 en clair. */
const NEUTRES: Record<Mode, Record<string, string>> = {
  clair: {
    /* DESIGN SYSTEM 2026 — decision du porteur du 20/10/2026, d'apres ses
       maquettes. Les neutres passent du beige chaud au gris-bleu lin : fond
       #F7FAFD, cartes blanches, encre ardoise #0F172A. L'invariant 7 (amplitude
       RGB <= 24 hors echelons) est leve par la meme decision : voir
       data-utils/invariants.js. */
    sol: "#F7FAFD", carte: "#FFFFFF", encre: "#0F172A", sourd: "#556576",
    trait: "#E8EEF3", voile: "#EEF2F6", blanc: "#ffffff", lien: "#0D3B43",
    /* LE BLOC APPUYE (« Qui décide chez vous ? », la fiche d'un élu) : le teal
       republicain, et le texte passe en clair dessus. */
    inverse: "#0D3B43", surInverse: "#FFFFFF", inverseDoux: "#BFD9DD",
    inverseAction: "#FFFFFF", surInverseAction: "#0D3B43",
  },
  sombre: {
    sol: "#0A1116", carte: "#111C23", encre: "#E8EFF4", sourd: "#94A8B6",
    trait: "#1E2E38", voile: "#17242C", blanc: "#ffffff", lien: "#5EC8BC",
    /* EN SOMBRE, INVERSER N'EST PAS ECLAIRER. Un bloc clair plein ecran dans
       une interface sombre eblouit. Le bloc appuye devient une surface
       SOULEVEE — le teal, assombri — et le texte y reste clair. */
    inverse: "#0D3B43", surInverse: "#FFFFFF", inverseDoux: "#A8C9CE",
    inverseAction: "#5EC8BC", surInverseAction: "#06222A",
  },
};

/* LES COULEURS D'ACCENT — design system 2026, decision du porteur.
   Elles portent un SENS FIXE, jamais un jugement :
   - `accent` (emeraude) : ce qui est confirme, cofinance, valide ;
   - `energie` (ambre)   : recettes et investissements ;
   - `corail`            : la position « contre » d'un scrutin.
   MISE EN GARDE ECRITE AU PORTEUR LE 20/10/2026 : vert pour « pour » et rouge
   pour « contre » est le code couleur du bien et du mal. Repere l'avait refuse
   jusqu'ici (« un vote n'a jamais de vert ni de rouge »). Le porteur a tranche
   pour la lisibilite de ses maquettes ; la garde de neutralite se deplace donc
   sur le TEXTE : aucune phrase ne qualifie un vote, et les trois positions
   portent toujours leur libelle en toutes lettres a cote de la couleur. */
const ACCENTS: Record<Mode, Record<string, string>> = {
  clair: {
    primaire: "#0D3B43", accent: "#00A896", energie: "#F59E0B",
    corail: "#BE123C", abstention: "#94A3B8",
    /* MESURE DU 20/10/2026 : l'emeraude vive de la maquette (#00A896) tombe a
       2,72:1 sur son propre voile — illisible comme TEXTE. Elle reste la couleur
       des barres et des points, ou seul le contraste graphique (3:1) s'applique ;
       le texte sur fond emeraude prend cette version assombrie, mesuree a 5,50:1
       sur le voile et 6,03:1 sur blanc. */
    accentTexte: "#00705F",
    accentVoile: "#EBF7F5", energieVoile: "#FEF3E2", corailVoile: "#FDE8EE",
    primaireVoile: "#EEF2F6",
  },
  sombre: {
    primaire: "#5EC8BC", accent: "#2DD4BF", energie: "#FBBF24",
    corail: "#FB7185", abstention: "#94A3B8",
    /* en sombre, la version vive est deja lisible sur le voile sombre */
    accentTexte: "#2DD4BF",
    accentVoile: "#0E2A2B", energieVoile: "#2A2113", corailVoile: "#2E161D",
    primaireVoile: "#17242C",
  },
};

/* LA PALETTE CLAIRE, FIGEE. La carte de partage n'est pas de l'interface :
   c'est une image qui part dans une messagerie, lue par quelqu'un qui n'a
   jamais ouvert Repere, sur un fond que nous ne choisissons pas. Elle garde
   donc la marque en clair, quel que soit le theme du telephone. */
export const PALETTE_CLAIRE = Object.freeze({ ...ECHELONS, ...NEUTRES.clair, ...ACCENTS.clair }) as Readonly<Palette>;

/* L'ECHELON « FRANCE » N'EST PAS UNE COULEUR : c'est l'encre du produit
   (#1d1d1f, amplitude 2). En theme sombre l'encre change de bord, et lui avec —
   sinon le filet des cartes nationales disparait dans le fond : mesure 1,02:1
   sur le fond de carte, contre 3:1 exige (WCAG 2.4.11). Ce n'est pas un degel
   de l'invariant 7 : c'est le meme neutre, du bon cote. Le site a tranche
   ainsi (tokens.css, --e-france), le mobile suit. */
const ECHELONS_PAR_MODE: Record<Mode, Record<Echelon, string>> = {
  clair: { ...ECHELONS },
  sombre: { ...ECHELONS, france: NEUTRES.sombre.encre },
};

/* PALETTE « B PARTIEL » — DECIDEE PAR LE PORTEUR LE 30/09/2026.
 * Les teintes d'echelon ne servent que la ou plusieurs echelons coexistent :
 * la chaine de decision de « Qui decide ? ». Ailleurs, un seul echelon parle et
 * une teinte ne distinguerait rien.
 * Les teintes sont le melange de la couleur d'echelon avec le fond de carte,
 * jusqu'a une amplitude <= 20 : sous le plafond de 24 de l'invariant 7.
 * LE TEXTE D'ACTION EST EN ENCRE, dans tout l'ecran. Mesure : les couleurs
 * d'echelon tombent sous 4,5:1 sur leur propre teinte (ville 4,34, agglo 3,24,
 * dept 4,32). La couleur ne porte donc jamais seule une action : elle sert aux
 * points, aux traits et aux barres. Un vote reste en gris.
 * EN SOMBRE, ville et agglo tombent a deux teintes voisines (#1a2c2e et
 * #1a2d2e) : le plafond d'amplitude les ecrase. La chaine de « Qui decide »
 * reste lisible parce que chaque maillon porte son libelle et son point ; la
 * teinte n'y est jamais le seul indice. */
const TEINTES_PAR_MODE: Record<Mode, Record<Echelon, string>> = {
  clair: { ville: "#dbeaee", agglo: "#e4f3f7", dept: "#f7ece4", region: "#efe7fb", france: "#ecebe8" },
  sombre: { ville: "#1a2c2e", agglo: "#1a2d2e", dept: "#2a2016", region: "#281d31", france: "#1d1c1c" },
};

/* 44 points : cible tactile minimale d'Apple, au-dessus des 48 dp d'Android
   une fois la marge interne comptee. Invariant de forme : jamais thematique. */
export const CIBLE = 48;
export const PAS = 4;
/* Design system 2026 : cartes a 20, blocs a 14 (maquettes du porteur). */
export const RAYON = { carte: 20, bloc: 14, pastille: 999 } as const;

export const POLICE = {
  affiche: "BricolageGrotesque_800ExtraBold",
  titre: "BricolageGrotesque_600SemiBold",
} as const;

/* Duree des apparitions : courte, pour ne jamais retarder la lecture. */
export const DUREE = { apparition: 520, remplissage: 700 } as const;

/* ---- LE THEME COURANT ------------------------------------------------- */

let mode: Mode = "clair";
/* Numero de generation : il change a chaque bascule, et c'est lui qui invalide
   les vues et les feuilles de style. */
let generation = 0;

export const modeActuel = (): Mode => mode;
export const generationTheme = (): number => generation;

export function appliquerMode(m: Mode): void {
  if (m === mode) return;
  mode = m;
  generation += 1;
}

function construire(m: Mode) {
  const n = NEUTRES[m];
  const couleurs = { ...ECHELONS_PAR_MODE[m], ...n, ...ACCENTS[m] } as Palette;
  const TYPO = {
    /* le nom de la commune, les grands nombres */
    affiche: { fontFamily: POLICE.affiche, fontSize: 36, lineHeight: 40, color: couleurs.encre, letterSpacing: -0.5 },
    chiffre: { fontFamily: POLICE.affiche, fontSize: 38, lineHeight: 44, color: couleurs.encre, letterSpacing: -0.5 },
    /* la question d'un ecran */
    question: { fontFamily: POLICE.affiche, fontSize: 34, lineHeight: 38, color: couleurs.encre, letterSpacing: -0.6 },
    /* la reponse d'une carte : lisible en trois secondes */
    reponse: { fontFamily: POLICE.titre, fontSize: 22, lineHeight: 28, color: couleurs.encre },
    corps: { fontSize: 16, lineHeight: 23, color: couleurs.encre },
    note: { fontSize: 15, lineHeight: 21, color: couleurs.sourd },
    /* etiquette : phrase normale, en gras, sans capitales de style (refonte du 16/10/2026) */
    etiquette: { fontSize: 14, lineHeight: 20, fontWeight: "700" as const, color: couleurs.sourd },
    micro: { fontSize: 13, lineHeight: 18, color: couleurs.sourd },
  };
  /* LES TROIS COULEURS D'UNE REPARTITION DE VOTE — design system 2026, decision
     du porteur du 20/10/2026 (ses maquettes). C'etaient trois gris jusque-la,
     parce qu'« un vote n'a jamais de vert ni de rouge » : le porteur a tranche
     pour la lisibilite. Le nom reste `GRIS_VOTE` pour ne pas toucher aux
     vingt-huit appels ; ce sont desormais l'emeraude, le corail et l'ardoise
     claire. La garde de neutralite se deplace sur le TEXTE : chaque position
     porte son libelle en toutes lettres a cote de sa couleur, et aucune phrase
     ne qualifie un vote. */
  const GRIS_VOTE = { p: couleurs.accent, c: couleurs.corail, a: couleurs.abstention };
  /* En sombre une ombre portee ne se voit pas : c'est l'opacite du noir qui
     creuse, pas la couleur de l'encre. */
  const OMBRE = m === "sombre"
    ? { shadowColor: "#000000", shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 }
    : { shadowColor: "#0F172A", shadowOpacity: 0.04, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 };
  return { couleurs, TYPO, TEINTES: TEINTES_PAR_MODE[m], GRIS_VOTE, OMBRE };
}

type Palette = Record<Echelon, string> & {
  sol: string; carte: string; encre: string; sourd: string;
  trait: string; voile: string; blanc: string; lien: string;
  inverse: string; surInverse: string; inverseDoux: string;
  inverseAction: string; surInverseAction: string;
  primaire: string; accent: string; energie: string; corail: string;
  abstention: string; accentTexte: string; accentVoile: string; energieVoile: string;
  corailVoile: string; primaireVoile: string;
};
type Vue = ReturnType<typeof construire>;

let vueCache: { gen: number; v: Vue } = { gen: -1, v: construire("clair") };
function vue(): Vue {
  if (vueCache.gen !== generation) vueCache = { gen: generation, v: construire(mode) };
  return vueCache.v;
}

/* Une vue sur le theme courant : on l'importe comme un objet ordinaire, elle
   lit la generation en cours a chaque acces. Les pieges `ownKeys` et
   `getOwnPropertyDescriptor` existent pour que `{ ...couleurs }` fonctionne. */
function miroir<T extends object>(lire: () => T): T {
  return new Proxy({} as T, {
    get: (_c, cle) => (lire() as Record<string | symbol, unknown>)[cle],
    has: (_c, cle) => cle in lire(),
    ownKeys: () => Reflect.ownKeys(lire()),
    getOwnPropertyDescriptor: (_c, cle) => {
      const d = Reflect.getOwnPropertyDescriptor(lire(), cle);
      return d ? { ...d, configurable: true } : undefined;
    },
  });
}

export const couleurs: Palette = miroir(() => vue().couleurs);
export const TYPO: Vue["TYPO"] = miroir(() => vue().TYPO);
export const TEINTES: Record<Echelon, string> = miroir(() => vue().TEINTES);
export const GRIS_VOTE: Vue["GRIS_VOTE"] = miroir(() => vue().GRIS_VOTE);
export const OMBRE: Vue["OMBRE"] = miroir(() => vue().OMBRE);

/* UNE FEUILLE DE STYLE DE MODULE. `StyleSheet.create({ ... couleurs.encre })`
   au niveau d'un module fige la couleur au chargement : la bascule de theme ne
   la touche plus jamais. `feuille()` refait la feuille quand la generation
   change, sans qu'aucun appel (`s.carte`) ait a changer de forme. */
export function feuille<T extends object>(creer: () => T): T {
  let gen = -1;
  let val: T = {} as T;
  const lire = (): T => {
    if (gen !== generation) { val = creer(); gen = generation; }
    return val;
  };
  return miroir(lire);
}

/* A appeler une seule fois, a la racine : le theme du systeme devient celui de
   l'application. Rend le mode, pour que la racine puisse remonter l'arbre
   (`key`) et que les feuilles deja rendues soient refaites. */
export function useModeSysteme(): Mode {
  const systeme = useColorScheme();
  const m: Mode = systeme === "dark" ? "sombre" : "clair";
  appliquerMode(m);
  return m;
}
