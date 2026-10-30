/* LE SYSTEME DE DESIGN DE REPERE MOBILE — refonte du 30/09/2026, theme sombre du 29/10/2026.
 *
 * COULEURS. Les valeurs sont dans palette.ts (données pures, testées). Les cinq
 * couleurs d'échelon viennent de @repere/data-utils (invariant 7), jamais
 * recopiées ; le reste est neutre, sous l'amplitude de 24 sur les canaux RGB.
 * Un vote n'a jamais de vert ni de rouge : pas de « bon » ni de « mauvais ».
 *
 * TYPOGRAPHIE. Bricolage Grotesque (OFL, embarquée, jamais chargée depuis un hôte
 * tiers) pour les questions, les noms de lieu et les grands nombres. Le texte
 * courant reste dans la police du système, qui suit la taille choisie par le
 * lecteur (Dynamic Type, taille de police Android).
 *
 * DEUX THÈMES, UN SEUL POINT D'ENTRÉE. `couleurs`, `TYPO`, `TEINTES`, `GRIS_VOTE`
 * et `OMBRE` sont des vues sur le thème courant : on les importe comme des objets
 * ordinaires, et elles se recalculent quand le thème change. Les feuilles de style
 * de module passent par `feuille()` : sinon elles figeraient la couleur au
 * chargement du module.
 *
 * LE THÈME SUIT LE SYSTÈME (useColorScheme). Aucun choix manuel, donc aucune clé
 * de stockage nouvelle : l'invariant 2 (une seule clé locale) est préservé. */
import { useColorScheme } from "react-native";
import {
  NEUTRES_PAR_MODE, ECHELONS_PAR_MODE, TEINTES_PAR_MODE, OMBRE_PAR_MODE, COULEURS_VOTE,
  type Mode, type Echelon,
} from "./palette";

export type { Echelon, Mode } from "./palette";
export { PALETTE_CARTE } from "./palette";

/* Sens du vote (D24, ADR 0003) : vert pour, rouge contre, gris abstention. Identiques dans
   les deux themes ; la position est toujours aussi ecrite en toutes lettres. */
export const COULEUR_VOTE = { p: COULEURS_VOTE.votePour, c: COULEURS_VOTE.voteContre, a: COULEURS_VOTE.voteAbstention } as const;

export const CIBLE = 48;
export const PAS = 4;
export const RAYON = { carte: 18, bloc: 14, pastille: 999 } as const;

export const POLICE = {
  affiche: "BricolageGrotesque_800ExtraBold",
  titre: "BricolageGrotesque_600SemiBold",
} as const;

/* Durée des apparitions : courte, pour ne jamais retarder la lecture. */
export const DUREE = { apparition: 520, remplissage: 700 } as const;

/* ---- LE THÈME COURANT ------------------------------------------------- */

let mode: Mode = "clair";
/* Numéro de génération : il change à chaque bascule, et c'est lui qui invalide
   les vues et les feuilles de style. */
let generation = 0;

export const modeActuel = (): Mode => mode;
export const generationTheme = (): number => generation;

export function appliquerMode(m: Mode): void {
  if (m === mode) return;
  mode = m;
  generation += 1;
}

/* La lecture du profil (V26, bloc 3) : taille de base, espacement des lignes, contraste.
   Appliquee avant le dessin, comme le mode. Une valeur identique ne refait rien. */
export type Lecture = { taille: number; espacement: number; contraste: string };
let lecture: Lecture = { taille: 16, espacement: 1.5, contraste: "normal" };
export function appliquerLecture(l: Lecture): void {
  if (l.taille === lecture.taille && l.espacement === lecture.espacement && l.contraste === lecture.contraste) return;
  lecture = l;
  generation += 1;
}

function construire(m: Mode) {
  const n = NEUTRES_PAR_MODE[m];
  /* Contraste « élevé » et « très élevé » : le gris secondaire devient l'encre. Aucune
     couleur nouvelle (invariant 7). Le palier « très élevé » n'atteint pas 10:1 : BLOCAGES 25. */
  const sourd = lecture.contraste === "normal" ? n.sourd : n.encre;
  const couleurs = { ...ECHELONS_PAR_MODE[m], ...n, sourd };
  /* Taille et espacement : chaque taille de base est multipliee (base 16 = 1). */
  const ech = lecture.taille / 16;
  const esp = lecture.espacement / 1.5;
  const sz = (x: number) => Math.round(x * ech);
  const lh = (x: number) => Math.round(x * ech * esp);
  const TYPO = {
    /* le nom de la commune, les grands nombres */
    affiche: { fontFamily: POLICE.affiche, fontSize: sz(36), lineHeight: lh(40), color: couleurs.encre, letterSpacing: -0.5 },
    chiffre: { fontFamily: POLICE.affiche, fontSize: sz(38), lineHeight: lh(44), color: couleurs.encre, letterSpacing: -0.5 },
    /* la question d'un écran */
    question: { fontFamily: POLICE.affiche, fontSize: sz(28), lineHeight: lh(33), color: couleurs.encre, letterSpacing: -0.3 },
    /* la réponse d'une carte : lisible en trois secondes */
    reponse: { fontFamily: POLICE.titre, fontSize: sz(20), lineHeight: lh(26), color: couleurs.encre },
    corps: { fontSize: sz(16), lineHeight: lh(23), color: couleurs.encre },
    note: { fontSize: sz(15), lineHeight: lh(21), color: couleurs.sourd },
    /* l'étiquette au-dessus d'une réponse, en capitales de style */
    etiquette: { fontSize: sz(13), lineHeight: lh(18), fontWeight: "700" as const, letterSpacing: 0.8, textTransform: "uppercase" as const, color: couleurs.sourd },
    micro: { fontSize: sz(13), lineHeight: lh(18), color: couleurs.sourd },
  };
  /* Les trois gris d'une répartition de vote : ils se distinguent aussi par leur
     libellé et leur nombre, jamais par la couleur seule (accessibilité). */
  const GRIS_VOTE = { p: couleurs.encre, c: couleurs.sourd, a: couleurs.trait } as const;
  return { couleurs, TYPO, TEINTES: TEINTES_PAR_MODE[m], GRIS_VOTE, OMBRE: OMBRE_PAR_MODE[m] };
}

type Palette = Record<Echelon, string> & {
  sol: string; carte: string; encre: string; sourd: string;
  trait: string; voile: string; blanc: string; lien: string; ancien: string;
};
type Vue = ReturnType<typeof construire>;

let vueCache: { gen: number; v: Vue } = { gen: -1, v: construire("clair") };
function vue(): Vue {
  if (vueCache.gen !== generation) vueCache = { gen: generation, v: construire(mode) };
  return vueCache.v;
}

/* Une vue sur le thème courant : on l'importe comme un objet ordinaire, elle lit
   la génération en cours à chaque accès. Les pièges `ownKeys` et
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
   au niveau d'un module fige la couleur au chargement : la bascule de thème ne la
   toucherait plus jamais. `feuille()` refait la feuille quand la génération
   change, sans qu'aucun appel (`s.carte`) ait à changer de forme. */
export function feuille<T extends object>(creer: () => T): T {
  let gen = -1;
  let val: T = {} as T;
  const lire = (): T => {
    if (gen !== generation) { val = creer(); gen = generation; }
    return val;
  };
  return miroir(lire);
}

/* Le choix d'affichage du lecteur : le systeme, ou un mode fixe. */
export type ChoixTheme = "systeme" | "clair" | "sombre";

/* Le mode du systeme. Sans effet de bord : la racine le lit, puis applique le choix. */
export function useModeSysteme(): Mode {
  const systeme = useColorScheme();
  return systeme === "dark" ? "sombre" : "clair";
}

/* Le mode effectif (choix du lecteur, sinon systeme), applique au theme courant.
   A appeler une seule fois, a la racine, a chaque rendu. */
export function appliquerChoix(choix: ChoixTheme, systeme: Mode): Mode {
  const m: Mode = choix === "systeme" ? systeme : choix;
  appliquerMode(m);
  return m;
}
