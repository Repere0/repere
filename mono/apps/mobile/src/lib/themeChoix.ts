/* LE CHOIX D'AFFICHAGE DU LECTEUR (systeme, clair, sombre), partage avec tout l'arbre.
 * Le choix vit en memoire, pour la session en cours : il n'est ecrit nulle part.
 * Le stockage local est une decision a part (invariant 2, une seule cle). */
import { createContext, useContext } from "react";
import type { ChoixTheme, Mode } from "./theme";

export type ValeurTheme = { choix: ChoixTheme; setChoix: (c: ChoixTheme) => void; mode: Mode };

const Ctx = createContext<ValeurTheme>({ choix: "systeme", setChoix: () => {}, mode: "clair" });

export const FournisseurTheme = Ctx.Provider;
export const useTheme = (): ValeurTheme => useContext(Ctx);
