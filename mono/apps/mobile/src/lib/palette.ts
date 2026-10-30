/* LA PALETTE DE REPERE MOBILE, EN DONNEES PURES — 29/10/2026.
 *
 * Deux thèmes : clair (valeurs de l'application depuis le 30/09/2026, inchangées)
 * et sombre (ajouté le 29/10/2026). Ce module ne dépend d'aucun composant : il
 * est lu par theme.ts ET directement par les tests (tests/theme.test.mjs), qui
 * vérifient les contrastes et l'amplitude sur les vraies valeurs.
 *
 * INVARIANTS RESPECTÉS :
 * - les cinq couleurs d'échelon viennent de @repere/data-utils (invariant 7),
 *   jamais recopiées ici ; seule la couleur « France » change de bord en
 *   sombre (c'est l'encre du produit, voir ECHELONS_PAR_MODE) ;
 * - tout le reste est neutre, amplitude RGB <= 24 (invariant 7) ;
 * - aucune couleur de vote n'est ajoutée : un vote reste en gris, sans vert ni
 *   rouge (les trois positions portent leur libellé en toutes lettres).
 *
 * LE THÈME SOMBRE N'EST PAS LA PALETTE 2026 DE LA BRANCHE ux/theme-sombre-20-10 :
 * celle-ci change aussi le clair (fond bleu-gris, accents émeraude, corail pour
 * « contre »). Elle n'est pas reprise ici : elle touche à l'invariant 7 et à la
 * neutralité du vote, et relève d'une décision du fondateur (DECISIONS). */
import { ECHELONS } from "@repere/data-utils";

export type Mode = "clair" | "sombre";
export type Echelon = keyof typeof ECHELONS;

export type Neutres = {
  sol: string; carte: string; encre: string; sourd: string;
  trait: string; voile: string; blanc: string; lien: string;
};

/* Neutres du clair : valeurs de main, inchangées. */
const NEUTRES_CLAIR: Neutres = {
  sol: "#F5F2EC", carte: "#FFFFFF", encre: "#171614", sourd: "#625E57",
  trait: "#DDD8D0", voile: "#ECE8E1", blanc: "#ffffff", lien: "#1a1917",
};

/* Neutres du sombre : même famille chaude que le clair (pas de bleu), mesurés
   dans tests/theme.test.mjs. Texte encre sur sol 16:1 ; sourd sur carte 7,6:1. */
const NEUTRES_SOMBRE: Neutres = {
  sol: "#161513", carte: "#1F1D1A", encre: "#F3F0EA", sourd: "#B5AEA3",
  trait: "#3B3832", voile: "#2A2823", blanc: "#ffffff", lien: "#F3F0EA",
};

/* Les échelons : identiques dans les deux thèmes, sauf « France ». */
export const ECHELONS_PAR_MODE: Record<Mode, Record<Echelon, string>> = {
  clair: { ...ECHELONS },
  sombre: { ...ECHELONS, france: NEUTRES_SOMBRE.encre },
};

/* Teintes d'échelon : fond de carte + quelques pour cent de l'échelon. Chacune
   reste sous l'amplitude 24 (invariant 7) et porte un texte encre à plus de
   12:1. Clair : valeurs de main, inchangées. */
export const TEINTES_PAR_MODE: Record<Mode, Record<Echelon, string>> = {
  clair: { ville: "#dbeaee", agglo: "#e4f3f7", dept: "#f7ece4", region: "#efe7fb", france: "#ecebe8" },
  sombre: { ville: "#1D2728", agglo: "#1C2B2C", dept: "#2E2218", region: "#281E31", france: "#1D1C1B" },
};

export const NEUTRES_PAR_MODE: Record<Mode, Neutres> = { clair: NEUTRES_CLAIR, sombre: NEUTRES_SOMBRE };

/* Ombres : en sombre, l'ombre se voit par l'opacité du noir, pas par l'encre. */
export const OMBRE_PAR_MODE = {
  clair: { shadowColor: "#171614", shadowOpacity: 0.045, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 1 },
  sombre: { shadowColor: "#000000", shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
} as const;

/* La palette claire, figée : la carte de partage est une image qui part dans
   une messagerie, sur un fond que nous ne choisissons pas. Elle garde la marque
   en clair, quel que soit le thème du téléphone. */
export const PALETTE_CLAIRE = Object.freeze({
  ...ECHELONS_PAR_MODE.clair, ...NEUTRES_CLAIR,
});

/* Contraste WCAG entre deux couleurs hexadécimales (D17). Sert à décider si un
   point d'échelon doit recevoir un contour clair pour rester distinct de sa carte. */
const canal = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function luminance(h: string): number {
  const c = canal(h).map(v => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function rapportContraste(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/* Seuil des éléments non textuels (WCAG 1.4.11). En dessous, le point d'échelon
   reçoit un contour de l'encre (un trait, pas une couleur nouvelle). */
export const SEUIL_POINT = 3;

/* Voile derriere la fenetre de reglage d'affichage (assombrit l'ecran dessous). */
export const VOILE_MODAL = "rgba(0,0,0,0.4)";
