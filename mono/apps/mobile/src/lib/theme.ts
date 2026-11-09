/* LE SYSTEME DE DESIGN DE REPERE MOBILE — refonte du 30/09/2026, theme sombre du 29/10/2026.
 *
 * COULEURS. Les valeurs sont dans palette.ts (données pures, testées). Les cinq
 * couleurs d'échelon viennent de @repere/data-utils (invariant 7), jamais recopiées.
 * Depuis le 09/11/2026 (invariant 7 amendé, « tout Stitch ») : neutres Néo-Civique (clair)
 * et Dark Luxury (sombre), accents d'interface (ACCENTS), votes émeraude / corail / ardoise
 * (COULEURS_VOTE) : ils codent un fait, jamais un jugement, et la position reste écrite.
 *
 * TYPOGRAPHIE (refonte « légère », porteur, 09/11/2026). Dans les deux thèmes : Manrope SemiBold
 * pour les titres (24 px au plus), DM Sans pour le texte (15 px), IBM Plex Mono pour les données. Toutes OFL, embarquées, jamais chargées
 * depuis un hôte tiers. Elles suivent la taille choisie par le lecteur : aucune taille n'est
 * plafonnée.
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
  NEUTRES_PAR_MODE, ECHELONS_PAR_MODE, TEINTES_PAR_MODE, OMBRE_PAR_MODE, COULEURS_VOTE, COULEURS_VOTE_DALTONIEN,
  ACCENTS_PAR_MODE, JAUGE_BUDGET_PAR_MODE,
  type Mode, type Echelon,
} from "./palette";

export type { Echelon, Mode } from "./palette";
export { PALETTE_CARTE } from "./palette";

/* Sens du vote (Stitch, 09/11/2026) : emeraude pour, corail contre, ardoise abstention.
   Identiques dans les deux themes ; la position est toujours aussi ecrite en toutes lettres. */
export const COULEUR_VOTE = { p: COULEURS_VOTE.votePour, c: COULEURS_VOTE.voteContre, a: COULEURS_VOTE.voteAbstention } as const;
export const COULEUR_VOTE_DALTONIEN = { p: COULEURS_VOTE_DALTONIEN.votePour, c: COULEURS_VOTE_DALTONIEN.voteContre, a: COULEURS_VOTE_DALTONIEN.voteAbstention } as const;

export const CIBLE = 48;
export const PAS = 4;
/* Stitch (09/11/2026) : cartes au rayon 20, cartouches au rayon 14. */
export const RAYON = { carte: 20, bloc: 14, pastille: 999 } as const;

/* DA premium (07/11/2026, décision du porteur) : Manrope pour les titres, DM Sans pour le
   texte, IBM Plex Mono pour les dates et les chiffres. Toutes sous licence SIL OFL,
   embarquées dans l'application (aucun hôte de polices, aucune requête réseau).
   Une famille par graisse : sous Android, fontWeight ne choisit pas une autre famille. */
type Polices = { affiche: string; titre: string; texte: string; texteMoyen: string; texteGras: string; donnee: string; donneeForte: string };
/* Stitch (09/11/2026) : une famille par thème. Le sombre garde celles du 07/11. */
export const POLICES_PAR_MODE: Readonly<Record<Mode, Polices>> = {
  /* Refonte « légère » (porteur, 09/11/2026) : les mêmes familles dans les deux thèmes. Titres en
     Manrope SemiBold (plus d'ExtraBold), texte en DM Sans, données en IBM Plex Mono. */
  clair: {
    affiche: "Manrope_600SemiBold",
    titre: "Manrope_600SemiBold",
    texte: "DMSans_400Regular",
    texteMoyen: "DMSans_500Medium",
    texteGras: "DMSans_700Bold",
    donnee: "IBMPlexMono_400Regular",
    donneeForte: "IBMPlexMono_600SemiBold",
  },
  sombre: {
    affiche: "Manrope_600SemiBold",
    titre: "Manrope_600SemiBold",
    texte: "DMSans_400Regular",
    texteMoyen: "DMSans_500Medium",
    texteGras: "DMSans_700Bold",
    donnee: "IBMPlexMono_400Regular",
    donneeForte: "IBMPlexMono_600SemiBold",
  },
};

/* Durée des apparitions : courte, pour ne jamais retarder la lecture. */
export const DUREE = { apparition: 520, remplissage: 700 } as const;

/* ---- LE THÈME COURANT ------------------------------------------------- */

let mode: Mode = "clair";
/* La police du thème courant : une vue, comme `couleurs` (déclarée plus bas). */
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
  const POLICE = POLICES_PAR_MODE[m];
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
    /* Refonte « légère » (porteur, 09/11/2026) : titres de 24 px au plus, texte de 15 px à interligne
       généreux, chiffres sans exagération. Les tailles suivent toujours le réglage du lecteur. */
    affiche: { fontFamily: POLICE.affiche, fontSize: sz(24), lineHeight: lh(30), color: couleurs.encre, letterSpacing: -0.3 },
    chiffre: { fontFamily: POLICE.donneeForte, fontSize: sz(28), lineHeight: lh(34), color: couleurs.encre, letterSpacing: -0.5 },
    /* 07/11/2026 : les nombres du décompte (StatCard). */
    stat: { fontFamily: POLICE.donneeForte, fontSize: sz(26), lineHeight: lh(32), color: couleurs.encre, letterSpacing: -0.5 },
    /* la question d'un écran */
    question: { fontFamily: POLICE.affiche, fontSize: sz(22), lineHeight: lh(28), color: couleurs.encre, letterSpacing: -0.2 },
    /* la réponse d'une carte */
    reponse: { fontFamily: POLICE.titre, fontSize: sz(17), lineHeight: lh(24), color: couleurs.encre },
    corps: { fontFamily: POLICE.texte, fontSize: sz(15), lineHeight: lh(24), color: couleurs.encre },
    note: { fontFamily: POLICE.texte, fontSize: sz(14), lineHeight: lh(22), color: couleurs.sourd },
    /* l'étiquette au-dessus d'une réponse, en capitales de style */
    etiquette: { fontFamily: POLICE.texteMoyen, fontSize: sz(13), lineHeight: lh(18), letterSpacing: 0.8, textTransform: "uppercase" as const, color: couleurs.sourd },
    micro: { fontFamily: POLICE.texte, fontSize: sz(13), lineHeight: lh(18), color: couleurs.sourd },
    /* une date ou une donnée chiffrée en ligne (frise, pastilles) */
    donnee: { fontFamily: POLICE.donnee, fontSize: sz(13), lineHeight: lh(18), color: couleurs.sourd },
  };
  /* Les trois gris d'une répartition de vote : ils se distinguent aussi par leur
     libellé et leur nombre, jamais par la couleur seule (accessibilité). */
  const GRIS_VOTE = { p: couleurs.encre, c: couleurs.sourd, a: couleurs.trait } as const;
  return { couleurs, TYPO, TEINTES: TEINTES_PAR_MODE[m], GRIS_VOTE, OMBRE: OMBRE_PAR_MODE[m], POLICE, ACCENTS: ACCENTS_PAR_MODE[m], JAUGE: JAUGE_BUDGET_PAR_MODE[m] };
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
export const POLICE: Polices = miroir(() => vue().POLICE);
/* Accents d'interface et jauge du budget du thème courant (invariant 7 amendé, 09/11/2026). */
export const ACCENTS: Vue["ACCENTS"] = miroir(() => vue().ACCENTS);
export const JAUGE: Vue["JAUGE"] = miroir(() => vue().JAUGE);

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
