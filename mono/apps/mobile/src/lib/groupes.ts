/* Le groupe politique d'un depute (V62, bloc 3). Lit data/deputes-groupes.json, produit chaque jour
   par scripts/collecte-groupes.mjs depuis l'archive AMO30 de l'Assemblee. Le fichier porte sa source
   et sa date ; sans elles, ou s'il est absent, tout depute reste « Inconnu » : jamais un faux groupe.
   Un depute absent de la table reste « Inconnu ». Voir docs/adr/0001-couleurs-partis.md. */
import { useEffect, useState } from "react";
import { chargerDeputesGroupes } from "./donnees";
import { COULEURS_GROUPES, NEUTRES_PAR_MODE, rapportContraste } from "./palette";

export const GROUPE_INCONNU = "Inconnu";

export type GroupeDepute = { groupe: string; nom?: string };
export type TableGroupes = Record<string, GroupeDepute>;

/* La table des groupes, ou null si le fichier n'est pas lisible ou n'emporte pas sa source. */
export async function lireGroupes(): Promise<TableGroupes | null> {
  try {
    const r = await chargerDeputesGroupes();
    const d = r.donnees as { source?: { producteur?: string; licence?: string }; genere_le?: string; groupes?: TableGroupes } | null;
    if (!d || !d.source || !d.source.producteur || !d.source.licence || !d.genere_le || !d.groupes) return null;
    return d.groupes;
  } catch {
    return null;
  }
}

/* La table, une fois lue ; null tant qu'elle ne l'est pas. */
export function useGroupes(): TableGroupes | null {
  const [t, setT] = useState<TableGroupes | null>(null);
  useEffect(() => {
    let vivant = true;
    lireGroupes().then(x => { if (vivant) setT(x); });
    return () => { vivant = false; };
  }, []);
  return t;
}

/* Le groupe d'un depute, par son identifiant de l'Assemblee (PAxxxx). Sans table, sans identifiant,
   ou sans entree : « Inconnu ». */
export function groupeDe(acteurRef?: string | null, table?: TableGroupes | null): string {
  if (!acteurRef || !table) return GROUPE_INCONNU;
  const g = table[acteurRef]?.groupe;
  return typeof g === "string" && g.trim() ? g.trim() : GROUPE_INCONNU;
}

/* Couleur du badge : celle du groupe, ou le gris « Inconnu » (jamais une couleur inventee). */
export function couleurGroupe(groupe: string): string {
  return COULEURS_GROUPES[groupe] ?? COULEURS_GROUPES[GROUPE_INCONNU];
}

/* Texte encre ou blanc, celui qui lit le mieux sur la couleur du badge. */
export function texteSur(fond: string): string {
  const { encre, blanc } = NEUTRES_PAR_MODE.clair;
  return rapportContraste(fond, encre) >= rapportContraste(fond, blanc) ? encre : blanc;
}

/* Bordure de l'avatar : la même teinte, plus sombre (70 % de chaque canal). Calculée, pas écrite en dur. */
export function bordureGroupe(fond: string): string {
  const canaux = [1, 3, 5].map(i => Math.round(parseInt(fond.slice(i, i + 2), 16) * 0.7));
  return "#" + canaux.map(v => v.toString(16).padStart(2, "0")).join("");
}
