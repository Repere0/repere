/* LE CALENDRIER, PARTAGE ENTRE LA LISTE ET LE DETAIL D'UN RENDEZ-VOUS (16/10/2026).
 *
 * Un rendez-vous est un groupe de @repere/core (regrouperParJour) : un texte, une
 * institution, un jour. La liste et le detail relisent le MEME regroupement, donc
 * ouvrent le MEME rendez-vous. Aucune heure n'est inventee ici : une fin absente
 * reste une absence (« heure de fin non précisée »). */
import { heureFr } from "@repere/core";

export type Ev = { titre: string; debut: string; institution: string; categorie?: string; lieu?: string; description?: string; fin?: string; source: Record<string, string> };

export type Groupe = {
  jour: string; institution: string; titre: string; debut: string; debuts: string[]; fins?: (string | null)[]; seances: number;
  categorie: string | null; lieu: string | null; points: string[] | null; textesLibres: string[]; source: Record<string, string>;
};

export const INSTITUTIONS = ["Assemblée nationale", "Sénat"];

/* Heure de debut et de fin de chaque seance, au meme rang. Fin absente : on l'ecrit
   comme une absence (doctrine du vide, invariant 5), on ne la devine jamais. */
export function heuresDuGroupe(g: Groupe): string {
  return g.debuts.map((x, i) => {
    const debut = heureFr(x);
    if (!debut) return "";
    const fin = g.fins && g.fins[i] ? heureFr(g.fins[i] as string) : "";
    return fin ? `${debut} à ${fin}` : `${debut}, heure de fin non précisée`;
  }).filter(Boolean).join(" · ");
}

/* Un horaire par seance, lisible seul : « 9 h à 10 h » ou « 9 h, heure de fin non précisée ». */
export function horairesDuGroupe(g: Groupe): string[] {
  return g.debuts.map((x, i) => {
    const debut = heureFr(x);
    if (!debut) return "";
    const fin = g.fins && g.fins[i] ? heureFr(g.fins[i] as string) : "";
    return fin ? `${debut} à ${fin}` : `${debut}, heure de fin non précisée`;
  }).filter(Boolean);
}

/* Les parametres qui designent un rendez-vous dans l'ecran de detail. */
export function parametresRendezVous(g: Groupe) {
  return { jour: g.jour, institution: g.institution, categorie: g.categorie || "", titre: g.titre };
}
