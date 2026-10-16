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
/* « du Sénat », « de l'Assemblée nationale » : une seule ecriture, liste et detail. */
export const deInstitution = (i: string) => (i === "Sénat" ? "du Sénat" : "de l'Assemblée nationale");

/* CE QUE LE CALENDRIER MONTRE (16/10/2026) : ce qui a commence aujourd'hui, puis ce
   qui est a venir. Mesure : a 15 h 04, la seance de 15 h avait disparu, alors que la
   source ne publie pas son heure de fin. La liste ET le detail lisent cette fonction :
   un rendez-vous commence s'ouvre encore. */
export function rendezVousAffiches(d: { aVenir?: Ev[]; commenceesAujourdhui?: Ev[] }): Ev[] {
  return [...(d.commenceesAujourdhui || []), ...(d.aVenir || [])];
}

/* Ce que la ligne dit d'un rendez-vous dont la premiere seance a commence : le fait, et
   la fin si la source la publie. Jamais « en cours » : Repere ne le sait pas. */
export function etatCommence(g: Groupe, maintenant: string): string | null {
  if (!(g.debut < maintenant)) return null;
  const fin = g.fins && g.fins[0] ? heureFr(g.fins[0] as string) : "";
  return fin ? `a déjà commencé, fin annoncée à ${fin}` : "a déjà commencé, heure de fin non précisée";
}

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
