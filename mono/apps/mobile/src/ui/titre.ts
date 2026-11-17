/* LES NIVEAUX DE TITRE (audit UI, vague 2, 16/11/2026).
 * Un écran porte UN titre de niveau 1 (sa question, son nom) ; les sections sont de niveau 2.
 * Les surtitres en capitales (Etiquette) ne sont plus des titres : ils précèdent le titre.
 * Sur le web, aria-level fait d'un rôle « header » un h2 ; sur iOS, VoiceOver lit « titre »
 * sans niveau, et la prop est ignorée. */
import type { TextProps } from "react-native";

export const niveauTitre = (niveau: 1 | 2 | 3 = 2): TextProps =>
  ({ accessibilityRole: "header", ...(niveau > 1 ? { "aria-level": niveau } : {}) }) as TextProps;
