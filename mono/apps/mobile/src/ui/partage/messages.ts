/* Textes de repli des cartes de partage : repris si la capture d'image echoue.
   Ils ne portent que les valeurs passees par l'ecran appelant. */
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

export function messageActu({ titre, source, lien }: { titre: string; source: string; lien: string }): string {
  return [
    titre,
    ...(source ? [`Source : ${source}.`] : []),
    "",
    "Résumé Repère, à partir de la source officielle citée. Le site officiel fait foi.",
    lien,
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
