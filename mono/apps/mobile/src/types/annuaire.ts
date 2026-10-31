/* La fiche d'un élu telle que la liste la passe à la fiche détaillée (paramètres de route).
 * Un seul endroit : si un champ change de nom, le compilateur le signale dans les deux écrans. */
export type Fiche = {
  id: string; nom: string; fonction: string; lieu: string; depuis: string;
  producteur: string; licence: string; maj: string; url: string;
};
