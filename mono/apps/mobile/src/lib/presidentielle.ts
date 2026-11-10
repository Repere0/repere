/* LES DONNÉES DE LA PRÉSIDENTIELLE 2027 (09/11/2026) : les quatre fichiers publiés
 * (presidentielle-2027/candidats, debats, meetings, meta), lus ensemble et contrôlés par la règle de
 * @repere/core (lirePresidentielle). Trois états par liste, jamais confondus :
 *   - pas arrivée (fichier absent, hors ligne) : `lus.x` est faux, l'écran propose de réessayer ;
 *   - arrivée et vide : l'écran dit que rien n'est encore publié ;
 *   - arrivée et remplie. */
import { useCallback, useEffect, useState } from "react";
import { lirePresidentielle } from "@repere/core";
import type { PresidentialData } from "@repere/core";
import { chargerPresidentielle } from "./donnees";

export type EtatPresidentielle = PresidentialData & {
  lus: { candidats: boolean; debats: boolean; meetings: boolean };
  charge: boolean;
  reessayer: () => void;
};

const FICHIERS = ["candidats", "debats", "meetings", "meta"] as const;

export function usePresidentialData(): EtatPresidentielle {
  const [essai, setEssai] = useState(0);
  const [etat, setEtat] = useState<Omit<EtatPresidentielle, "reessayer">>({
    candidats: [], debats: [], meetings: [], meta: null, lus: { candidats: false, debats: false, meetings: false }, charge: false,
  });
  useEffect(() => {
    let vivant = true;
    Promise.all(FICHIERS.map(f => chargerPresidentielle(f).then((r: { donnees: unknown }) => r.donnees ?? null).catch(() => null)))
      .then(([candidats, debats, meetings, meta]) => {
        if (!vivant) return;
        const lu = lirePresidentielle({ candidats, debats, meetings, meta });
        setEtat({ candidats: lu.candidats, debats: lu.debats, meetings: lu.meetings, meta: lu.meta, lus: lu.lus, charge: true });
      });
    return () => { vivant = false; };
  }, [essai]);
  const reessayer = useCallback(() => setEssai(n => n + 1), []);
  return { ...etat, reessayer };
}
