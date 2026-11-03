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
import { chargerAgregatsRegionaux, chargerDepartement } from "./donnees";

export type Moyenne = { mediane: number; n: number; total: number; an: string; region: string };
type Dep = { code: string; region?: string; region_code?: string | null };
const enCours = new Map<string, Promise<Moyenne | null>>();

/* V15 bloc 4 : d'abord le fichier pre-calcule par la chaine de publication
   (agregats-regionaux.json, environ 1 Ko compresse). S'il manque (publication anterieure
   a ce fichier), repli : le calcul sur les departements de la region, comme avant. */
type Agregats = { regions?: Record<string, { nom?: string; exercices?: Record<string, { mediane: number; n: number; total: number }> }> };
function calculer(deps: Dep[], region: string, an: string, code: string, recalcul: boolean): Promise<Moyenne | null> {
  if (__DEV__) console.time(`comparaison ${code} ${an}`);
  const fin = <T,>(v: T) => { if (__DEV__) console.timeEnd(`comparaison ${code} ${an}`); return v; };
  return chargerAgregatsRegionaux().then(r => {
    const e = r.donnees ? (r.donnees as Agregats).regions?.[code]?.exercices?.[an] : undefined;
    if (e && typeof e.mediane === "number") return fin({ mediane: e.mediane, n: e.n, total: e.total, an, region });
    /* V20 : sans fichier pre-calcule, le recalcul (tous les departements de la region, ~250 Ko
       compresses en IDF) n'est fait que si l'ecran le demande expressement (budget). */
    return recalcul ? recalculer(deps, region, an).then(fin) : fin(null);
  }).catch(() => (recalcul ? recalculer(deps, region, an).then(fin) : fin(null)));
}
function recalculer(deps: Dep[], region: string, an: string): Promise<Moyenne | null> {
  return Promise.all(deps.map(d => chargerDepartement(d.code))).then(rs => {
    /* Un departement qui n'arrive pas : pas de moyenne partielle presentee comme regionale. */
    if (rs.some(r => !r.donnees)) return null;
    /* A1 : la mediane, pas la moyenne (tiree par les petits villages). */
    const m = medianeParHabitant(rs.map(r => r.donnees), 1, an);
    return m ? { mediane: m.mediane, n: m.n, total: m.total, an, region } : null;
  }).catch(() => null);
}

/* agregat 1 : « Dépenses totales » (ordre des agregats publies dans l'index). */
/* « recalcul » (V20) : faux sur l'accueil (premier lancement leger), vrai sur le budget. */
export function useMoyenneDepenses(index: { departements?: Dep[] } | null | undefined, dep: string | null, an: string | null, recalcul = false): Moyenne | null {
  const [m, setM] = useState<Moyenne | null>(null);
  useEffect(() => {
    setM(null);
    const liste = index && Array.isArray(index.departements) ? index.departements : [];
    const moi = liste.find(d => d.code === dep);
    if (!moi || !moi.region_code || !moi.region || !an) return undefined;
    const deps = liste.filter(d => d.region_code === moi.region_code);
    const cle = moi.region_code + "|" + an + (recalcul ? "|r" : "");
    if (!enCours.has(cle)) enCours.set(cle, calculer(deps, moi.region, an, moi.region_code, recalcul));
    let vivant = true;
    enCours.get(cle)!.then(v => { if (vivant) setM(v); });
    return () => { vivant = false; };
  }, [index, dep, an, recalcul]);
  return m;
}

/* « d'Île-de-France », « de la région Normandie » */
const deRegion = (r: string) => (r === "Île-de-France" ? "d'Île-de-France" : `de la région ${r}`);
export const fr1 = (x: number) => x.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: x % 1 ? 1 : 0 });

/* A1 / A3 : la comparaison a la commune mediane. « fois » arrondi au dixieme ; entre 0,95 et
   1,05 on dit « comme ». Aucun mot de jugement (invariant 3 amende). */
/* TITRE-CONCLUSION (V29 bloc 4) : l'écart à la commune médiane, en euros par habitant, calculé
   sur les montants lus. Pas de « de plus » ni « de moins » écrits à la main : le signe décide. */
export function titreEcart(valeur: number, m: Moyenne): string {
  const ecart = Math.round(valeur - m.mediane);
  const dr = deRegion(m.region);
  if (Math.abs(ecart) < 1) return `Comme la commune médiane ${dr}`;
  const somme = `${Math.abs(ecart).toLocaleString("fr-FR")} €`;
  return ecart > 0
    ? `${somme} de plus par habitant que la commune médiane ${dr}`
    : `${somme} de moins par habitant que la commune médiane ${dr}`;
}

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
