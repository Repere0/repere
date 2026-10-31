/* L'ANNUAIRE DES ÉLUS PUBLIÉS — une seule lecture, partagée (V37, bloc 3, 31/10/2026).
 *
 * Même contenu que l'onglet « Élus » : les députés (data/deputes.json, France entière) et
 * l'exécutif de chaque région (data/elus-regions/, 14 régions). Sorti de l'onglet pour que la
 * recherche globale lise exactement la même liste, sans requête de plus : lib/donnees met
 * chaque fichier en mémoire pour la session. */
import { chargerComptesRegions, chargerDeputes, chargerElusRegion, chargerIndex, ETATS } from "./donnees";
import type { Fiche } from "../types/annuaire";

/* Les 14 régions dont l'exécutif est publié : les fichiers de data/elus-regions/. */
export const REGIONS = ["01", "04", "11", "24", "27", "28", "32", "44", "52", "53", "75", "76", "84", "93"];

type Depute = { prenom: string; nom: string; dateDebut?: string };
type Source = { producteur?: string; licence?: string; releve_le?: string; maj?: string; url?: string };
type Index = { departements: { code: string; nom?: string }[] };
type FichierDeputes = { source?: Source; deputes?: Record<string, Depute> };
type FichierRegion = { code: string; elus?: { nom: string; fonction: string; debut?: string }[]; source?: Source };

const rang = (circo: string) => (Number(circo) === 1 ? "1re" : `${Number(circo)}e`);

export function construire(
  deputes: FichierDeputes,
  index: Index | null,
  noms: Record<string, string>,
  regions: (FichierRegion | null)[],
): Fiche[] {
  const nomDep = (code: string) => {
    const d = index && index.departements.find(x => x.code === code);
    return d && d.nom ? d.nom : "département " + code;
  };
  const sourceDeputes = deputes.source || {};
  const liste: Fiche[] = [];
  for (const [cle, d] of Object.entries(deputes.deputes || {})) {
    const [code, circo] = cle.split("-");
    liste.push({
      id: "dep-" + cle, nom: `${d.prenom} ${d.nom}`, fonction: "Député", lieu: `${nomDep(code)}, ${rang(circo)} circonscription`,
      depuis: d.dateDebut || "", producteur: sourceDeputes.producteur || "", licence: sourceDeputes.licence || "",
      maj: sourceDeputes.releve_le || "", url: sourceDeputes.url || "",
    });
  }
  for (const r of regions) {
    if (!r || !r.elus) continue;
    const src = r.source || {};
    r.elus.forEach((e, i) => liste.push({
      id: `reg-${r.code}-${i}`, nom: e.nom, fonction: e.fonction, lieu: `Région ${noms[r.code] || r.code}`,
      depuis: e.debut || "", producteur: src.producteur || "", licence: src.licence || "", maj: src.maj || "", url: src.url || "",
    }));
  }
  return liste.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

/* La liste des élus publiés, triée par nom. `etat` dit si le fichier des députés est arrivé ;
   sans lui, la liste est vide et l'écran écrit pourquoi (jamais une liste devinée). */
export async function chargerFiches(): Promise<{ etat: string; fiches: Fiche[] }> {
  const [dep, idx, comptes, ...regs] = await Promise.all([
    chargerDeputes(), chargerIndex(), chargerComptesRegions(),
    ...REGIONS.map(c => chargerElusRegion(c)),
  ]);
  const noms = ((comptes.donnees && (comptes.donnees as { noms_regions?: Record<string, string> }).noms_regions) || {}) as Record<string, string>;
  const reg = regs.map((r, i) => (r.donnees ? { code: REGIONS[i], ...(r.donnees as object) } : null));
  return {
    etat: dep.donnees ? ETATS.SERVI : dep.etat,
    fiches: dep.donnees ? construire(dep.donnees as FichierDeputes, (idx.donnees as Index) || null, noms, reg as (FichierRegion | null)[]) : [],
  };
}
