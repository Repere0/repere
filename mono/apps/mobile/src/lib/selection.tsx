/* LA COMMUNE CHOISIE VIT EN MEMOIRE, PAS DANS L'ADRESSE — 29/09/2026.
 *
 * Une route « /commune/77/77001 » serait commode, mais sur la version web de
 * cette application un rechargement ou un lien partage enverrait ce code de
 * commune au serveur : exactement ce que l'invariant 2 interdit. La commune
 * reste donc dans l'etat de l'application.
 *
 * `retenue` est la commune que le lecteur a demande de garder sur ce
 * telephone (lib/memoire.ts) ; elle n'existe que s'il l'a demande. */
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { jourParis } from "@repere/core";
import { lire, marquerVisite, oublier as oublierMemoire, retenir as retenirMemoire, type Retenue } from "./memoire";

export type Choix = { dep: string; insee: string; nom: string } | null;

type Valeur = {
  choix: Choix;
  choisir: (c: Choix) => void;
  retenue: Retenue | null;
  retenir: (c: NonNullable<Choix>) => boolean;
  oublier: () => void;
  /* le jour de la visite PRECEDENTE de la commune choisie, si elle est retenue
     (proposition du 08/10/2026) ; null sinon. Fige pour la session. */
  derniereVisite: string | null;
};

const Contexte = createContext<Valeur>({
  choix: null, choisir: () => {}, retenue: null, retenir: () => false, oublier: () => {}, derniereVisite: null,
});

export function FournisseurSelection({ children }: { children: ReactNode }) {
  const [choix, setChoix] = useState<Choix>(null);
  /* une seule lecture par commune et par session : rouvrir l'ecran ne change pas
     la date affichee (meme regle que le site, App.jsx) */
  const visites = useRef<Record<string, string | null>>({});
  const [derniereVisite, setDerniereVisite] = useState<string | null>(null);
  const choisir = useCallback((c: Choix) => {
    if (c && !(c.insee in visites.current)) visites.current[c.insee] = marquerVisite(c.insee, jourParis(new Date()));
    setDerniereVisite(c ? visites.current[c.insee] ?? null : null);
    setChoix(c);
  }, []);
  const [retenue, setRetenue] = useState<Retenue | null>(() => lire());
  const retenir = useCallback((c: NonNullable<Choix>) => {
    const ok = retenirMemoire({ d: c.dep, c: c.insee });
    setRetenue(ok ? { d: c.dep, c: c.insee } : lire());
    return ok;
  }, []);
  const oublier = useCallback(() => { oublierMemoire(); setRetenue(lire()); }, []);
  return <Contexte.Provider value={{ choix, choisir, retenue, retenir, oublier, derniereVisite }}>{children}</Contexte.Provider>;
}

export const useSelection = () => useContext(Contexte);
