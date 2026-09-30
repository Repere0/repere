/* LE SYSTEME DE DESIGN DE REPERE MOBILE — refonte du 30/09/2026.
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
 * le lecteur (Dynamic Type, taille de police Android). */
import { ECHELONS } from "@repere/data-utils";

export type Echelon = keyof typeof ECHELONS;

/* PALETTE « B PARTIEL » — DECIDEE PAR LE PORTEUR LE 30/09/2026.
 * Les cartes restent blanches. Les teintes d'echelon ne servent que la ou
 * plusieurs echelons coexistent : la chaine de decision de « Qui decide ? ».
 * Ailleurs, un seul echelon parle et une teinte ne distinguerait rien.
 * Les teintes sont le melange de la couleur d'echelon avec le blanc, jusqu'a
 * une amplitude <= 20 : sous le plafond de 24 de l'invariant 7.
 * LE TEXTE D'ACTION EST EN ENCRE, dans tout l'ecran. Mesure : les couleurs
 * d'echelon tombent sous 4,5:1 sur leur propre teinte (ville 4,34, agglo 3,24,
 * dept 4,32). La couleur ne porte donc jamais seule une action : elle sert aux
 * points, aux traits et aux barres. Un vote reste en gris. */
export const TEINTES: Record<Echelon, string> = {
  ville: "#dbeaee", agglo: "#e4f3f7", dept: "#f7ece4", region: "#efe7fb", france: "#ecebe8",
};

export const couleurs = {
  ...ECHELONS,
  sol: "#f2efe9",
  carte: "#ffffff",
  encre: "#1a1917",
  sourd: "#6b675f",
  trait: "#ddd8ce",
  voile: "#ece8e0",
  blanc: "#ffffff",
  /* le texte d'une action (« Comprendre ce vote › ») : en encre, voir plus haut */
  lien: "#1a1917",
} as const;

/* Les trois gris d'une repartition de vote, du plus fonce au plus clair : ils
   se distinguent aussi par leur libelle et leur nombre, jamais par la couleur
   seule (accessibilite). */
export const GRIS_VOTE = { p: couleurs.encre, c: couleurs.sourd, a: couleurs.trait } as const;

/* 44 points : cible tactile minimale d'Apple, au-dessus des 48 dp d'Android
   une fois la marge interne comptee. */
export const CIBLE = 48;
export const PAS = 4;
export const RAYON = { carte: 22, bloc: 14, pastille: 999 } as const;

export const POLICE = {
  affiche: "BricolageGrotesque_800ExtraBold",
  titre: "BricolageGrotesque_600SemiBold",
} as const;

export const TYPO = {
  /* le nom de la commune, les grands nombres */
  affiche: { fontFamily: POLICE.affiche, fontSize: 40, lineHeight: 44, color: couleurs.encre, letterSpacing: -0.5 },
  chiffre: { fontFamily: POLICE.affiche, fontSize: 44, lineHeight: 50, color: couleurs.encre, letterSpacing: -0.5 },
  /* la question d'un ecran */
  question: { fontFamily: POLICE.affiche, fontSize: 30, lineHeight: 34, color: couleurs.encre, letterSpacing: -0.3 },
  /* la reponse d'une carte : lisible en trois secondes */
  reponse: { fontFamily: POLICE.titre, fontSize: 22, lineHeight: 28, color: couleurs.encre },
  corps: { fontSize: 17, lineHeight: 24, color: couleurs.encre },
  note: { fontSize: 15, lineHeight: 21, color: couleurs.sourd },
  /* l'etiquette au-dessus d'une reponse, en capitales de style */
  etiquette: { fontSize: 13, lineHeight: 18, fontWeight: "700" as const, letterSpacing: 0.8, textTransform: "uppercase" as const, color: couleurs.sourd },
  micro: { fontSize: 13, lineHeight: 18, color: couleurs.sourd },
} as const;

export const OMBRE = {
  shadowColor: couleurs.encre, shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 2,
} as const;

/* Duree des apparitions : courte, pour ne jamais retarder la lecture. */
export const DUREE = { apparition: 520, remplissage: 700 } as const;
