/* Les catégories du dictionnaire, partagées par le dictionnaire et le quiz (12/11/2026). */
export type Categorie = "Institutions" | "Budget" | "Élections" | "Élus";
export const CATEGORIES: Categorie[] = ["Institutions", "Budget", "Élections", "Élus"];
export const CATEGORIE_DE: Record<string, Categorie> = {
  exercice: "Budget", "encours de dette": "Budget", subvention: "Budget", investissement: "Budget", fonctionnement: "Budget",
  plf: "Budget", plfr: "Budget", plfss: "Budget", lolf: "Budget", bp: "Budget", ca: "Budget", dgf: "Budget", crc: "Budget",
  ofgl: "Budget", tva: "Budget", csg: "Budget", crds: "Budget", detr: "Budget", fctva: "Budget",
  circonscription: "Élections", referendum: "Élections", scrutin: "Élections", "scrutin solennel": "Élections",
  mandat: "Élus", "adjoint au maire": "Élus", maire: "Élus", "conseiller municipal": "Élus", "conseiller départemental": "Élus",
  "groupe parlementaire": "Élus", rapporteur: "Élus", ps: "Élus", lr: "Élus", rn: "Élus", lfi: "Élus", eelv: "Élus", epr: "Élus",
  pcf: "Élus", modem: "Élus", hor: "Élus", dem: "Élus", gdr: "Élus", liot: "Élus", udi: "Élus",
};

export const categorieDuMot = (cle: string): string => CATEGORIE_DE[cle] || "Institutions";
