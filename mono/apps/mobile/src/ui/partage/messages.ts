/* Textes de repli des cartes de partage : repris si la capture d'image echoue.
   Ils ne portent que les valeurs passees par l'ecran appelant. */
export const VERBE: Record<string, string> = {
  p: "a voté pour.",
  c: "a voté contre.",
  a: "s'est abstenu.",
};

export function messageChiffre({ ville, euros, an, producteur }: { ville: string; euros: string; an: string | number; producteur: string }): string {
  return [
    `${ville} : ${euros} dépensés par habitant en ${an}, selon ${producteur}.`,
    "",
    "Résumé Repère, à partir des comptes publiés.",
  ].join("\n");
}

export function messageVote({ phrase, titre, date, lien }: { phrase: string; titre: string; date: string; lien: string | null }): string {
  return [
    phrase,
    titre,
    `Vote à l'Assemblée nationale, ${date}.`,
    "",
    "Résumé Repère, à partir du scrutin publié. Le détail est dans l'application.",
    ...(lien ? [lien] : []),
  ].join("\n");
}

export function messageElu({ nom, fonction, lieu, depuis, producteur, lien }: {
  nom: string; fonction: string; lieu: string; depuis: string; producteur: string; lien: string | null;
}): string {
  return [
    [nom, fonction, lieu].filter(Boolean).join(", ") + ".",
    ...(depuis ? [depuis] : []),
    "",
    `Fiche Repère, à partir des données de ${producteur}.`,
    ...(lien ? [lien] : []),
  ].join("\n");
}

export function messageAgenda({ titre, quand, lien }: { titre: string; quand: string; lien: string | null }): string {
  return [
    `À venir au Parlement : ${titre}`,
    `${quand}.`,
    "",
    "Résumé Repère, à partir de l'agenda publié. L'agenda peut changer : le site officiel fait foi.",
    ...(lien ? [lien] : []),
  ].join("\n");
}
