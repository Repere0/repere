/* LE REPÈRE DU JOUR — préparation des faits pour l'écran (V52, 03/11/2026).
 *
 * Les faits sont calculés dans @repere/core (faitsDuJour). Ce module ne fait que les
 * relier aux données de la commune déjà lues, et aux sources affichées à côté. Le
 * bandeau de « Chez vous », la page complète et l'écran lui-même passent par ici :
 * ils montrent donc les mêmes faits, le même jour. */
import { avecHistoire, faitsDuJour } from "@repere/core";
import { historiqueDe } from "./histoire-communes";
import type { EtatCommune } from "./useCommune";
import { srcComptes, srcComptesPublies, srcElus, srcVote } from "./sources";
import type { InfoSource } from "../ui/source";

export type FaitDuJour = {
  id: string;
  categorie: string;
  source: string;
  calcul: boolean;
  texte: string | null;
};

export type SourcesDuJour = Record<string, InfoSource | null>;

export type Pret = Extract<EtatCommune, { pret: true }>;

export function repereDuJourPour(r: Pret, nom: string, insee: string, niveau: string): { faits: FaitDuJour[]; sources: SourcesDuJour } {
  const { d } = r;
  const maintenant = new Date();
  const base = faitsDuJour({
    nom, insee, date: maintenant, exercice: d.exercice, rapportsComptes: d.rapportsComptes,
    fiche: d.fiche, vote: d.dernierVote, nbCircos: d.nbCircos, niveau,
    comptes: d.fiche && d.fiche.comptes,
  }) as FaitDuJour[];
  /* V55 (D158) : un jour sur trois, le fait historique de la commune prend la troisième place. */
  const histoire = historiqueDe(insee);
  const faits = avecHistoire(base, histoire, maintenant) as FaitDuJour[];
  const sources: SourcesDuJour = {
    comptes: srcComptesPublies(d),
    "comptes-calcul": srcComptes(d),
    scrutin: d.dernierVote && d.dernierVote.sc ? srcVote(d, d.dernierVote.sc) : null,
    elus: srcElus(r.srcElus),
    histoire: histoire ? {
      producteur: histoire.source, licence: "CC BY-SA 4.0", url: histoire.lien, releve: histoire.verifie,
      usage: "Fait tiré de l'article Wikipédia cité, relu à cette date.",
    } : null,
  };
  return { faits, sources };
}

/* Un fait sans texte, ou sans source affichable, n'est PAS montré : aucun chiffre sans sa source
   (invariant 4). */
export function faitsAffichables(faits: FaitDuJour[], sources: SourcesDuJour): { f: FaitDuJour & { texte: string }; src: InfoSource }[] {
  return faits
    .filter(f => !!f.texte)
    .map(f => ({ f: { ...f, texte: f.texte as string }, src: sources[f.source] ?? null }))
    .filter((x): x is { f: FaitDuJour & { texte: string }; src: InfoSource } => x.src !== null && !!x.src.producteur);
}
