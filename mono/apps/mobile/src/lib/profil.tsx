/* LE PROFIL DE LECTURE, EN MEMOIRE DE L'APPLICATION — 30/10/2026 (V26, ADR 0006).
 *
 * La lecture et l'ecriture sur ce telephone sont dans lib/memoire.ts (seul fichier qui
 * touche au stockage, invariant 2). Ce fichier porte l'etat de l'application et la
 * validation : il ne lit ni n'ecrit rien lui-meme.
 *
 * Absent = le lecteur n'a jamais repondu a l'accueil : c'est le declencheur de
 * l'onboarding (bienvenue). */
import { createContext, useContext, useState, type ReactNode } from "react";
import { PROFIL_DEFAUT, valideProfil } from "@repere/core";
import { ecrireProfilGarde, lireProfilGarde } from "./memoire";

export type Profil = {
  niveauZoom: string; tailleTexte: number; espacement: number; contraste: string;
  policeDyslexie: boolean; animationsReduites: boolean; modeDaltonien: boolean; masquerImages: boolean;
  /* D57 (V31) : thèmes d'intérêt choisis par le lecteur, parmi THEMES (@repere/core). */
  themes: string[];
};
/* valideProfil est en JavaScript (@repere/core) : son type est rendu ici, une fois. */
const valide = (x: unknown): Profil => valideProfil(x) as Profil;

/* null = absent. Un profil garde est valide champ par champ à la lecture. */
export function lireProfil(): Profil | null {
  const garde = lireProfilGarde();
  return garde === null ? null : valide(garde);
}

/* Rend true seulement si le profil est bien garde et se relit a l'identique. */
export function ecrireProfil(p: Profil): boolean {
  return ecrireProfilGarde(JSON.stringify(valide(p)));
}

type Etat = {
  profil: Profil | null; absent: boolean;
  enregistrer: (p: Profil) => void; passer: () => void; modifier: (m: Partial<Profil>) => void;
};

/* L'etat vit dans la racine (Coquille), qui en applique la lecture au theme avant
   de dessiner les ecrans : un changement de taille se voit sur tout l'ecran. */
export function useEtatProfil(): Etat {
  const [profil, setProfil] = useState<Profil | null>(() => lireProfil());
  const enregistrer = (p: Profil) => {
    const v = valide(p);
    /* Si l'ecriture echoue, le reglage vaut pour cette session seulement : rien ne le dit ailleurs. */
    ecrireProfil(v);
    setProfil(v);
  };
  /* D45 (V27) : « Passer » est un choix explicite : il garde les réglages par défaut. */
  const passer = () => enregistrer(valide(PROFIL_DEFAUT));
  const modifier = (m: Partial<Profil>) => enregistrer({ ...(profil ?? (PROFIL_DEFAUT as Profil)), ...m });
  return { profil, absent: profil === null, enregistrer, passer, modifier };
}

const Contexte = createContext<Etat>({
  profil: null, absent: true, enregistrer: () => {}, passer: () => {}, modifier: () => {},
});
export const FournisseurProfil = ({ valeur, children }: { valeur: Etat; children: ReactNode }) =>
  <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
export const useProfil = () => useContext(Contexte);
