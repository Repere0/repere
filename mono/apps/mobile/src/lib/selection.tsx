/* LA COMMUNE CHOISIE VIT EN MEMOIRE, PAS DANS L'ADRESSE — 29/09/2026.
 *
 * Une route « /commune/77/77001 » serait commode, mais sur la version web de
 * cette application un rechargement ou un lien partage enverrait ce code de
 * commune au serveur : exactement ce que l'invariant 2 interdit. La commune
 * reste donc dans l'etat de l'application.
 *
 * `retenue` est la commune que le lecteur a demande de garder sur ce
 * telephone (lib/memoire.ts) ; elle n'existe que s'il l'a demande. */
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { lire, oublier as oublierMemoire, retenir as retenirMemoire, type Retenue } from "./memoire";

export type Choix = { dep: string; insee: string; nom: string } | null;

type Valeur = {
  choix: Choix;
  choisir: (c: Choix) => void;
  retenue: Retenue | null;
  retenir: (c: NonNullable<Choix>) => boolean;
  oublier: () => void;
};

const Contexte = createContext<Valeur>({
  choix: null, choisir: () => {}, retenue: null, retenir: () => false, oublier: () => {},
});

export function FournisseurSelection({ children }: { children: ReactNode }) {
  const [choix, choisir] = useState<Choix>(null);
  const [retenue, setRetenue] = useState<Retenue | null>(() => lire());
  const retenir = useCallback((c: NonNullable<Choix>) => {
    const ok = retenirMemoire({ d: c.dep, c: c.insee });
    setRetenue(ok ? { d: c.dep, c: c.insee } : lire());
    return ok;
  }, []);
  const oublier = useCallback(() => { oublierMemoire(); setRetenue(lire()); }, []);
  return <Contexte.Provider value={{ choix, choisir, retenue, retenir, oublier }}>{children}</Contexte.Provider>;
}

export const useSelection = () => useContext(Contexte);
