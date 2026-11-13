/* L'ARRONDISSEMENT DE PARIS CHOISI — 13/11/2026. EN MÉMOIRE SEULEMENT : rien n'est écrit sur l'appareil (invariant 2 :
 * deux clés de stockage, rien d'autre) et rien ne part dans une adresse. Il s'oublie à la fermeture de l'application,
 * comme la série du quiz. Le lecteur le choisit sur la page de Paris, ou en cherchant Paris par un code postal. */
import { useSyncExternalStore } from "react";
import { arrondissementDuCodePostal, estParis } from "@repere/core";
import { chargerCodesPostaux } from "./donnees";

let courant: number | null = null;
const abonnes = new Set<() => void>();

export function choisirArrondissement(n: number | null) {
  if (n === courant) return;
  courant = n;
  abonnes.forEach(f => f());
}
export function useArrondissement(): number | null {
  return useSyncExternalStore(f => { abonnes.add(f); return () => { abonnes.delete(f); }; }, () => courant, () => null);
}

/* À l'ouverture d'une commune depuis la recherche : Paris cherché par « 75011 » ouvre Paris avec le 11e déjà choisi.
   Toute autre commune, ou Paris cherché par son nom, efface le choix précédent. */
export function noterArrondissement(insee: string, tape: string) {
  const cp = tape.trim();
  if (!estParis(insee) || !/^\d{5}$/.test(cp)) { choisirArrondissement(null); return; }
  chargerCodesPostaux().then((r: { donnees: unknown }) => choisirArrondissement(arrondissementDuCodePostal(r.donnees, cp))).catch(() => {});
}
