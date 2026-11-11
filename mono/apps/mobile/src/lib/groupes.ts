/* Le groupe politique d'un depute (V62, bloc 3). Lit data/deputes-groupes.json, produit chaque jour
   par scripts/collecte-groupes.mjs depuis l'archive AMO30 de l'Assemblee. Le fichier porte sa source
   et sa date ; sans elles, ou s'il est absent, tout depute reste « Inconnu » : jamais un faux groupe.
   Un depute absent de la table reste « Inconnu ». Voir docs/adr/0001-couleurs-partis.md. */
import { useEffect, useState } from "react";
import { memeNom } from "@repere/core";
import { chargerDeputesGroupes } from "./donnees";
import { COULEURS_GROUPES, NEUTRES_PAR_MODE, rapportContraste } from "./palette";

export const GROUPE_INCONNU = "Inconnu";

export type GroupeDepute = { groupe: string; nom?: string };
export type TableGroupes = Record<string, GroupeDepute>;

/* La table des groupes, ou null si le fichier n'est pas lisible ou n'emporte pas sa source. */
export type FichierGroupes = { source: { producteur: string; licence: string; url?: string }; genere_le: string; groupes: TableGroupes };

export async function lireFichierGroupes(): Promise<FichierGroupes | null> {
  try {
    const r = await chargerDeputesGroupes();
    const d = r.donnees as { source?: { producteur?: string; licence?: string }; genere_le?: string; groupes?: TableGroupes } | null;
    if (!d || !d.source || !d.source.producteur || !d.source.licence || !d.genere_le || !d.groupes) return null;
    return d as FichierGroupes;
  } catch {
    return null;
  }
}

export async function lireGroupes(): Promise<TableGroupes | null> {
  return (await lireFichierGroupes())?.groupes ?? null;
}

/* Le fichier entier (avec sa source et sa date) : undefined pendant la lecture, null s'il n'est pas publié. */
export function useFichierGroupes(): FichierGroupes | null | undefined {
  const [t, setT] = useState<FichierGroupes | null | undefined>(undefined);
  useEffect(() => {
    let vivant = true;
    lireFichierGroupes().then(x => { if (vivant) setT(x); });
    return () => { vivant = false; };
  }, []);
  return t;
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
/* Libellés qui désignent un même groupe (décision CEO D207, 03/11/2026) : la France insoumise, dans
   l'Assemblée, porte le libellé « LFI-NFP ». Ramenés à « LFI » : même couleur, même nom affiché.
   La palette reste à 12 couleurs (invariant 7) ; aucune couleur n'est ajoutée ici. */
const ALIAS_GROUPE: Readonly<Record<string, string>> = Object.freeze({ "LFI-NFP": "LFI", NFP: "LFI" });

export function groupeDe(acteurRef?: string | null, table?: TableGroupes | null): string {
  if (!acteurRef || !table) return GROUPE_INCONNU;
  const g = table[acteurRef]?.groupe;
  if (typeof g !== "string" || !g.trim()) return GROUPE_INCONNU;
  const libelle = g.trim();
  return ALIAS_GROUPE[libelle] ?? libelle;
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

/* Le libellé long d'un groupe (fichiers de scrutins, organes AMO) vers son sigle de palette.ts
   (07/11/2026). Les fichiers de scrutins portent encore des gris d'avant D99 : l'application
   prend la couleur d'identification de palette.ts. Groupe absent de la table : gris « Inconnu ». */
const SIGLE_DU_NOM: Record<string, string> = {
  "Rassemblement National": "RN",
  "Ensemble pour la République": "EPR",
  "La France insoumise - Nouveau Front Populaire": "LFI",
  "Socialistes et apparentés": "SOC",
  "Droite Républicaine": "LR",
  "Écologiste et Social": "LÉ",
  "Les Démocrates": "DEM",
  "Horizons & Indépendants": "HOR",
  "Libertés, Indépendants, Outre-mer et Territoires": "LIOT",
  "Gauche Démocrate et Républicaine": "GDR",
  "Députés non inscrits": "NI",
};
export const sigleDuNom = (nom: string): string => SIGLE_DU_NOM[nom] || GROUPE_INCONNU;

/* Un député retrouvé par son nom complet dans deputes.json : son identifiant de l'Assemblée et SON
   département (clé « 94-10 »). Une seule fonction pour la fiche et pour « Qui décide » : le même
   député y a le même groupe, donc le même avatar. Introuvable : null, rien n'est deviné. */
export function deputeParNom(deputes: unknown, nom: string): { ref: string | undefined; dep: string } | null {
  const table = ((deputes as { deputes?: Record<string, { prenom?: string; nom?: string; acteurRef?: string }> } | null)?.deputes) || {};
  const e = Object.entries(table).find(([, x]) => memeNom([x.prenom, x.nom].filter(Boolean).join(" "), nom));
  return e ? { ref: e[1].acteurRef, dep: e[0].split("-")[0] } : null;
}
