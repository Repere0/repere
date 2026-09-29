/* LA COMMUNE CHOISIE VIT EN MEMOIRE, PAS DANS L'ADRESSE — 29/09/2026.
 *
 * Une route « /commune/77/77001 » serait commode, mais sur la version web de
 * cette application un rechargement ou un lien partage enverrait ce code de
 * commune au serveur : exactement ce que l'invariant 2 interdit. La commune
 * reste donc dans l'etat de l'application.
 *
 * Elle n'est PAS gardee d'une ouverture a l'autre : se souvenir de la commune
 * du lecteur sur son appareil est une decision produit en attente (voir
 * docs/architecture/decisions.md, D-M3). */
import { createContext, useContext, useState, type ReactNode } from "react";

export type Choix = { dep: string; insee: string; nom: string } | null;

const Contexte = createContext<{ choix: Choix; choisir: (c: Choix) => void }>({
  choix: null,
  choisir: () => {},
});

export function FournisseurSelection({ children }: { children: ReactNode }) {
  const [choix, choisir] = useState<Choix>(null);
  return <Contexte.Provider value={{ choix, choisir }}>{children}</Contexte.Provider>;
}

export const useSelection = () => useContext(Contexte);
