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
import { moyenneParHabitant } from "@repere/core";
import { chargerDepartement } from "./donnees";

export type Moyenne = { moyenne: number; n: number; total: number; an: string; region: string };
type Dep = { code: string; region?: string; region_code?: string | null };
const enCours = new Map<string, Promise<Moyenne | null>>();

function calculer(deps: Dep[], region: string, an: string): Promise<Moyenne | null> {
  return Promise.all(deps.map(d => chargerDepartement(d.code))).then(rs => {
    /* Un departement qui n'arrive pas : pas de moyenne partielle presentee comme regionale. */
    if (rs.some(r => !r.donnees)) return null;
    const m = moyenneParHabitant(rs.map(r => r.donnees), 1, an);
    return m ? { moyenne: m.moyenne, n: m.n, total: m.total, an, region } : null;
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

export function phrasesMoyenne(nom: string, valeur: number, m: Moyenne) {
  const ecart = valeur - m.moyenne;
  const e = Math.abs(ecart).toLocaleString("fr-FR");
  return {
    moyenne: `Moyenne des ${m.n.toLocaleString("fr-FR")} communes de la région ${m.region} en ${m.an} : ${m.moyenne.toLocaleString("fr-FR")} € par habitant.`,
    /* La phrase d'ecart se lit seule (elle vient en premier, en gras). */
    ecart: ecart === 0 ? `${nom} : comme la moyenne de la région ${m.region}.` : `${nom} : ${e} € ${ecart > 0 ? "de plus" : "de moins"} que la moyenne de la région ${m.region}.`,
    note: "Calcul Repère : moyenne simple, chaque commune compte pour une, quelle que soit sa taille.",
  };
}
