/* HISTOIRE DES COMMUNES (V55, D158) — faits datés pour « Le Repère du jour ».
 *
 * Règle : un fait n'entre ici que s'il figure, mot pour mot ou presque, dans l'article
 * Wikipédia (fr) de la commune, et que cet article est cité avec son adresse. Pas de fait
 * de mémoire. Une commune sans fait vérifiable n'a pas d'entrée.
 *
 * Vérification : chaque phrase a été retrouvée dans l'article lu le 3 novembre 2026
 * (champ « verifie »). Les phrases ont été relues une à une dans la page, pas recopiées
 * d'une source tierce. Une date qui ne figurait pas dans le corps mais dans une note de
 * l'article (Évry-Courcouronnes) est écrite telle quelle.
 *
 * Écarté après vérification : le praxinoscope de Montreuil (1876 dans l'article, 1877 pour
 * le brevet selon d'autres sources : contradiction, on ne tranche pas).
 *
 * Licence des textes Wikipédia : CC BY-SA 4.0. Chaque fait est une phrase courte, avec le
 * lien vers l'article : pas de copie de paragraphe. */

export type FaitHistorique = {
  annee: number;
  /* la phrase complète, avec la date : c'est elle qui s'affiche */
  fait: string;
  /* titre de la source, tel qu'il est écrit dans la pastille */
  source: string;
  lien: string;
  /* date à laquelle l'article a été lu (AAAA-MM-JJ) */
  verifie: string;
};

const VERIFIE = "2026-11-03";
const wiki = (titre: string) => `https://fr.wikipedia.org/wiki/${encodeURI(titre)}`;
const source = (commune: string) => `Wikipédia (fr), article « ${commune} »`;

export const HISTOIRE_COMMUNES: Record<string, FaitHistorique[]> = {
  "75056": [{ annee: 1973, fait: "En 1973, le boulevard périphérique, qui entoure Paris, est terminé.", source: source("Paris"), lien: wiki("Paris"), verifie: VERIFIE }],
  "78646": [{ annee: 1623, fait: "En 1623, le roi Louis XIII fait construire un rendez-vous de chasse à Versailles.", source: source("Versailles"), lien: wiki("Versailles"), verifie: VERIFIE }],
  "77288": [{ annee: 1359, fait: "En 1359, le dauphin Charles se décide à délivrer Melun.", source: source("Melun"), lien: wiki("Melun"), verifie: VERIFIE }],
  "77284": [{ annee: 1150, fait: "En 1150, Guillaume le Gros fonde l'abbaye de Meaux.", source: source("Meaux"), lien: wiki("Meaux"), verifie: VERIFIE }],
  "94028": [{ annee: 1418, fait: "En 1418, le village, sous occupation anglo-bourguignonne, est mis à sac et laissé en ruines.", source: source("Créteil"), lien: wiki("Créteil"), verifie: VERIFIE }],
  "92012": [{ annee: 1926, fait: "En 1926, la commune prend le nom de Boulogne-Billancourt.", source: source("Boulogne-Billancourt"), lien: wiki("Boulogne-Billancourt"), verifie: VERIFIE }],
  "93066": [{ annee: 1806, fait: "En 1806, Napoléon Ier consacre l'ancienne église à la sépulture des empereurs.", source: source("Saint-Denis"), lien: wiki("Saint-Denis_(Seine-Saint-Denis)"), verifie: VERIFIE }],
  "92050": [{ annee: 1247, fait: "En 1247, le roi Louis IX signe la charte d'affranchissement des serfs de Nanterre.", source: source("Nanterre"), lien: wiki("Nanterre"), verifie: VERIFIE }],
  "95018": [{ annee: 1941, fait: "En 1941, l'église Notre-Dame d'Argenteuil, ouverte en 1862, est détruite.", source: source("Argenteuil"), lien: wiki("Argenteuil"), verifie: VERIFIE }],
  "93048": [{ annee: 1859, fait: "En 1859, Montreuil incorpore une partie de la commune de Charonne.", source: source("Montreuil"), lien: wiki("Montreuil_(Seine-Saint-Denis)"), verifie: VERIFIE }],
  "91228": [{ annee: 2018, fait: "Un arrêté préfectoral du 12 octobre 2018 crée la commune nouvelle d'Évry-Courcouronnes.", source: source("Évry-Courcouronnes"), lien: wiki("Évry-Courcouronnes"), verifie: VERIFIE }],
  "95127": [{ annee: 1994, fait: "En 1994, la gare de Cergy-le-Haut est inaugurée.", source: source("Cergy"), lien: wiki("Cergy"), verifie: VERIFIE }],
  "94081": [{ annee: 1910, fait: "De terribles inondations, consécutives à la crue de la Seine de 1910, mettent la ville à rude épreuve.", source: source("Vitry-sur-Seine"), lien: wiki("Vitry-sur-Seine"), verifie: VERIFIE }],
  "92025": [{ annee: 1160, fait: "La plus ancienne mention de Colombes date de 1160.", source: source("Colombes"), lien: wiki("Colombes"), verifie: VERIFIE }],
  "92004": [{ annee: 1899, fait: "Le 15 octobre 1899, l'hôtel de ville d'Asnières-sur-Seine est inauguré.", source: source("Asnières-sur-Seine"), lien: wiki("Asnières-sur-Seine"), verifie: VERIFIE }],
  "93005": [{ annee: 1903, fait: "Le 5 janvier 1903, la ville devient Aulnay-sous-Bois.", source: source("Aulnay-sous-Bois"), lien: wiki("Aulnay-sous-Bois"), verifie: VERIFIE }],
  "92063": [{ annee: 1584, fait: "En 1584, Antoine de Portugal, exilé en France, pose la première pierre d'une nouvelle église à Rueil.", source: source("Rueil-Malmaison"), lien: wiki("Rueil-Malmaison"), verifie: VERIFIE }],
  "94017": [{ annee: 1490, fait: "En 1490, pendant la guerre de Cent Ans, les Armagnacs brûlent le château fort de Champigny.", source: source("Champigny-sur-Marne"), lien: wiki("Champigny-sur-Marne"), verifie: VERIFIE }],
  "93001": [{ annee: 1111, fait: "En 1111, les serfs d'Aubervilliers sont affranchis.", source: source("Aubervilliers"), lien: wiki("Aubervilliers"), verifie: VERIFIE }],
  "95585": [{ annee: 1567, fait: "En 1567, les huguenots détruisent Sarcelles lors de leur retrait après la bataille de Saint-Denis.", source: source("Sarcelles"), lien: wiki("Sarcelles"), verifie: VERIFIE }],
};

/* Le fait historique d'une commune, ou null. Un seul fait par commune pour l'instant. */
export function historiqueDe(insee: string): FaitHistorique | null {
  return HISTOIRE_COMMUNES[insee]?.[0] ?? null;
}
