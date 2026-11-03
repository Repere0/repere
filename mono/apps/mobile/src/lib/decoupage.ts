/* LE DÉCOUPAGE ADMINISTRATIF (V59, bloc 1.1) — commune → EPCI, EPT, département, région, population.
 *
 * Lit data/decoupage-idf.json (un seul fichier, huit départements d'Île-de-France), produit par
 * scripts/construire-decoupage-idf.mjs à partir du paquet npm officiel @etalab/decoupage-administratif
 * 6.0.0 (publié le 09/03/2026). Chaque entrée porte son code INSEE ; le fichier porte sa source et
 * sa date de publication. Une commune absente du fichier, ou un champ null, reste « non disponible » :
 * jamais une valeur devinée. */
import { useEffect, useState } from "react";
import { chargerDecoupageIdf } from "./donnees";

export type LienEpci = { code: string; nom: string; type: string };
export type LienEpt = { code: string; nom: string };

export type CommuneDecoupage = {
  codeInsee: string;
  nom: string;
  departement: string;
  region: string;
  epci: LienEpci | null;
  ept: LienEpt | null;
  population: number | null;
};

export type DecoupageIdf = {
  v: number;
  source: { producteur: string; licence: string; url: string; paquet: string; publie_le: string; portee: string };
  departements: Record<string, string | null>;
  regions: Record<string, string | null>;
  nombre_communes: number;
  communes: CommuneDecoupage[];
};

/* Le fichier est lu une fois par session, puis gardé par le socle partagé. Sans réseau et sans
   copie, le résultat est null : l'écran qui l'affiche doit alors écrire « non disponible ». */
export async function lireDecoupage(): Promise<DecoupageIdf | null> {
  try {
    const r = await chargerDecoupageIdf();
    const d = r.donnees as DecoupageIdf | null;
    return d && Array.isArray(d.communes) ? d : null;
  } catch {
    return null;
  }
}

/* La fiche d'une commune, par son code INSEE. Index construit une fois par fichier. */
const index = new WeakMap<DecoupageIdf, Map<string, CommuneDecoupage>>();
export function decoupageDe(d: DecoupageIdf | null, codeInsee: string | null | undefined): CommuneDecoupage | null {
  if (!d || !codeInsee) return null;
  let carte = index.get(d);
  if (!carte) {
    carte = new Map(d.communes.map(c => [c.codeInsee, c] as const));
    index.set(d, carte);
  }
  return carte.get(codeInsee) ?? null;
}

/* La commune choisie, depuis le fichier du découpage. null tant qu'il n'est pas lu, ou hors d'Île-de-France. */
export function useDecoupage(codeInsee: string | null | undefined): CommuneDecoupage | null {
  const [d, setD] = useState<DecoupageIdf | null>(null);
  useEffect(() => {
    let vivant = true;
    if (codeInsee) lireDecoupage().then(x => { if (vivant) setD(x); });
    return () => { vivant = false; };
  }, [codeInsee]);
  return decoupageDe(d, codeInsee);
}
