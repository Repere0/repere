/* LA COMMUNE CHOISIE VIT EN MEMOIRE, PAS DANS L'ADRESSE — 29/09/2026.
 *
 * Une route « /commune/77/77001 » serait commode, mais sur la version web de
 * cette application un rechargement ou un lien partage enverrait ce code de
 * commune au serveur : exactement ce que l'invariant 2 interdit. La commune
 * reste donc dans l'etat de l'application.
 *
 * `retenue` est la commune que le lecteur a demande de garder sur ce
 * telephone (lib/memoire.ts) ; elle n'existe que s'il l'a demande. */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { lire, oublier as oublierMemoire, retenir as retenirMemoire, type Retenue } from "./memoire";
import { chargerCommunesBeta } from "./donnees";

export type Choix = { dep: string; insee: string; nom: string } | null;

type Valeur = {
  choix: Choix;
  choisir: (c: Choix) => void;
  retenue: Retenue | null;
  retenir: (c: NonNullable<Choix>) => boolean;
  oublier: () => void;
  /* La commune gardee, pendant qu'on retrouve son nom dans la liste publiee : « en_cours », puis
     « echec » si la liste n'arrive pas (audit UI du 16/11/2026). Sans commune gardee : « aucune ». */
  restauration: Restauration;
  relancer: () => void;
};

export type Restauration = "aucune" | "en_cours" | "echec" | "introuvable";

const Contexte = createContext<Valeur>({
  choix: null, choisir: () => {}, retenue: null, retenir: () => false, oublier: () => {},
  restauration: "aucune", relancer: () => {},
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
  /* V31 : la commune gardée redevient la commune choisie dès le démarrage, quel que soit
     l'écran d'entrée (lien direct compris). Son nom vient de la liste publiée. */
  const [restauration, setRestauration] = useState<Restauration>("aucune");
  const [essai, setEssai] = useState(0);
  const relancer = useCallback(() => setEssai(n => n + 1), []);
  useEffect(() => {
    if (choix || !retenue) { setRestauration("aucune"); return undefined; }
    let annule = false;
    setRestauration("en_cours");
    chargerCommunesBeta().then(r => {
      if (annule) return;
      const nom = (r.donnees as { communes: Record<string, string> } | undefined)?.communes[retenue.c];
      if (nom) choisir({ dep: retenue.d, insee: retenue.c, nom });
      /* Pas de liste du tout : un echec de chargement. Une liste sans la commune : elle n'y est plus. */
      else setRestauration(r.donnees ? "introuvable" : "echec");
    }).catch(() => { if (!annule) setRestauration("echec"); });
    return () => { annule = true; };
  }, [choix, retenue, essai]);
  return <Contexte.Provider value={{ choix, choisir, retenue, retenir, oublier, restauration, relancer }}>{children}</Contexte.Provider>;
}

export const useSelection = () => useContext(Contexte);
