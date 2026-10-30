/* LA MOYENNE RÉGIONALE D'UN MONTANT PAR HABITANT — 30/10/2026 (D23, ADR 0002).
 *
 * Lit les fichiers publics de chaque departement de la region (les memes que l'ecran
 * d'une commune ; invariant 2 : aucune adresse ne porte un code de commune), puis
 * @repere/core (moyenneParHabitant) calcule une moyenne SIMPLE : chaque commune compte
 * pour une. Le calcul est fait une fois par region et par exercice, puis garde en memoire
 * pour la session (rien n'est ecrit sur le telephone).
 *
 * Les phrases disent « plus que », « moins que », « comme » : jamais un rang, jamais un
 * jugement (invariant 3 amende). */
import { useEffect, useState } from "react";
import { medianeParHabitant } from "@repere/core";
import { chargerDepartement } from "./donnees";

export type Moyenne = { mediane: number; n: number; total: number; an: string; region: string };
type Dep = { code: string; region?: string; region_code?: string | null };
const enCours = new Map<string, Promise<Moyenne | null>>();

function calculer(deps: Dep[], region: string, an: string): Promise<Moyenne | null> {
  return Promise.all(deps.map(d => chargerDepartement(d.code))).then(rs => {
    /* Un departement qui n'arrive pas : pas de moyenne partielle presentee comme regionale. */
    if (rs.some(r => !r.donnees)) return null;
    /* A1 : la mediane, pas la moyenne (tiree par les petits villages). */
    const m = medianeParHabitant(rs.map(r => r.donnees), 1, an);
    return m ? { mediane: m.mediane, n: m.n, total: m.total, an, region } : null;
  }).catch(() => null);
}

/* agregat 1 : « Dépenses totales » (ordre des agregats publies dans l'index). */
export function useMoyenneDepenses(index: { departements?: Dep[] } | null | undefined, dep: string | null, an: string | null): Moyenne | null {
  const [m, setM] = useState<Moyenne | null>(null);
  useEffect(() => {
    setM(null);
    const liste = index && Array.isArray(index.departements) ? index.departements : [];
    const moi = liste.find(d => d.code === dep);
    if (!moi || !moi.region_code || !moi.region || !an) return undefined;
    const deps = liste.filter(d => d.region_code === moi.region_code);
    const cle = moi.region_code + "|" + an;
    if (!enCours.has(cle)) enCours.set(cle, calculer(deps, moi.region, an));
    let vivant = true;
    enCours.get(cle)!.then(v => { if (vivant) setM(v); });
    return () => { vivant = false; };
  }, [index, dep, an]);
  return m;
}

/* « d'Île-de-France », « de la région Normandie » */
const deRegion = (r: string) => (r === "Île-de-France" ? "d'Île-de-France" : `de la région ${r}`);
export const fr1 = (x: number) => x.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: x % 1 ? 1 : 0 });

/* A1 / A3 : la comparaison a la commune mediane. « fois » arrondi au dixieme ; entre 0,95 et
   1,05 on dit « comme ». Aucun mot de jugement (invariant 3 amende). */
export function phrasesMoyenne(nom: string, valeur: number, m: Moyenne) {
  const r = Math.round((valeur / m.mediane) * 10) / 10;
  const dr = deRegion(m.region);
  return {
    court: `Médiane ${m.region} : ${m.mediane.toLocaleString("fr-FR")} €`,
    position: r >= 1.05 ? `${nom} est au-dessus de la commune médiane ${dr}.` : r <= 0.95 ? `${nom} est en dessous de la commune médiane ${dr}.` : `${nom} est au niveau de la commune médiane ${dr}.`,
    rapport: r >= 0.95 && r <= 1.05 ? `Comme la commune médiane ${dr}` : `${fr1(r)} fois la commune médiane ${dr}`,
    note: `Calcul Repère : sur ${m.n.toLocaleString("fr-FR")} communes en ${m.an}, la moitié dépense moins de ${m.mediane.toLocaleString("fr-FR")} € par habitant, l'autre moitié plus.`,
  };
}
