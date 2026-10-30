/* Donnees publiees, verifiees le 30/10/2026 : comptes OFGL 2025 de Melun (77288),
   scrutins.json (titre, date, n), scrutins/77.json (position « a »), deputes.json
   (entree 77-1). Figees ici : elles ne se mettent pas a jour. */
import { dateFr, lienScrutin, titreLisible } from "@repere/core";

export const CHIFFRE = { ville: "Melun", euros: "2 495 €", an: 2025 } as const;

export const VOTE = {
  depute: "Arnaud Saint-Martin",
  acteur: "PA841845",
  n: "8706",
  titre: "la proposition de loi organique visant à adapter l'autorité judiciaire à la lutte contre les violences sexuelles et intrafamiliales (première lecture).",
  date: "2026-10-13",
} as const;

export const LIEN_VOTE = lienScrutin("https://www.assemblee-nationale.fr/dyn/17/scrutins/", { n: VOTE.n }).url;

/* Textes de repli : repris tels quels si la capture d'image echoue. */
export const MSG_CHIFFRE = [
  "Melun : 2 495 € dépensés par habitant en 2025, selon l'OFGL.",
  "",
  "Résumé Repère, à partir des comptes publiés.",
].join("\n");

export const MSG_VOTE = [
  `${VOTE.depute} s'est abstenu.`,
  titreLisible(VOTE.titre),
  `Vote à l'Assemblée nationale, ${dateFr(VOTE.date)}.`,
  "",
  "Résumé Repère, à partir du scrutin publié. Le détail est dans l'application.",
  LIEN_VOTE,
].join("\n");
