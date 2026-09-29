/* CHARGER CE QU'IL FAUT POUR UNE COMMUNE, ET DIRE CE QUI MANQUE — 29/09/2026.
 *
 * Sorti de app/chez-vous.tsx pour deux raisons mesurees a l'audit de #45 :
 *
 * 1. UN ECHEC PARTIEL SE FAISAIT PASSER POUR UNE ABSENCE. Si le fichier des
 *    projets ou celui des votes n'arrivait pas (reseau coupe au mauvais
 *    moment), l'ecran affichait « Aucun projet finance par l'Etat n'est
 *    publie » ou « Aucun vote solennel ... n'est porte par le releve » :
 *    une phrase fausse, sur une donnee qui existe (invariant 5 : deux causes
 *    d'absence, deux phrases). Chaque source porte maintenant son etat, et
 *    l'ecran distingue « pas arrive » de « la source ne le dit pas ».
 * 2. UNE PROMESSE REJETEE LAISSAIT L'ECRAN EN CHARGEMENT POUR TOUJOURS. Les
 *    chargeurs ne rejettent pas, mais une exception levee avant eux (code de
 *    departement refuse par la fabrique d'adresses) n'etait pas rattrapee.
 *
 * Seuls les fichiers que l'ecran affiche sont demandes : le calendrier du
 * Senat, l'agenda de l'Assemblee et les faits editoriaux ne servent pas a
 * cette tranche (deriverAujourdhui les accepte absents). Moins de requetes,
 * moins de pannes possibles sur un reseau mobile.
 *
 * La DERIVATION reste celle du site (@repere/core) : ce crochet ne calcule
 * aucun fait. */
import { useEffect, useState } from "react";
import { deriverAujourdhui, positionsFiables } from "@repere/core";
import {
  chargerIndex, chargerDepartement, chargerProjets, chargerDeputes, chargerCatalogueScrutins,
  chargerVotes, ETATS,
} from "./donnees";
import type { Choix } from "./selection";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Ouvert = any; /* fichiers publies non types : chaque absence est traitee comme une absence */

export type EtatCommune =
  | { etat: string; pret: false }
  | {
      etat: string; pret: true; d: Ouvert; srcElus: Ouvert;
      /* true si le fichier est arrive ; false : il n'est PAS arrive (panne), ce qui n'est pas une absence */
      projetsLus: boolean; votesLus: boolean; votesFiables: boolean;
    };

const arrive = (r: { etat: string }) => r.etat === ETATS.SERVI;

export function useCommune(choix: Choix, essai: number): EtatCommune {
  const [etat, setEtat] = useState<EtatCommune>({ etat: ETATS.EN_COURS, pret: false });

  useEffect(() => {
    if (!choix) return undefined;
    let vivant = true;
    setEtat({ etat: ETATS.EN_COURS, pret: false });
    const { dep, insee } = choix;
    Promise.all([
      chargerIndex(), chargerDepartement(dep), chargerProjets(dep),
      chargerDeputes(), chargerCatalogueScrutins(), chargerVotes(dep),
    ]).then(([ix, pq, pr, de, c, v]) => {
      if (!vivant) return;
      const paquet: Ouvert = pq.donnees;
      const fiche = paquet && paquet.communes ? paquet.communes[insee] : null;
      /* Sans le departement, rien a montrer. Sans l'index, les sources des
         elus manqueraient : un nom sans source n'est pas affiche (invariant 4). */
      if (!fiche) { setEtat({ etat: pq.donnees ? ETATS.INTROUVABLE : pq.etat, pret: false }); return; }
      if (!ix.donnees) { setEtat({ etat: ix.etat, pret: false }); return; }
      const index: Ouvert = ix.donnees;
      const votesLus = arrive(de) && arrive(c) && arrive(v);
      const d = deriverAujourdhui({
        fiche, commune: insee, dep, index,
        projets: arrive(pr) ? pr.donnees : null,
        cat: votesLus ? c.donnees : null, pos: votesLus ? v.donnees : null, deputes: votesLus ? de.donnees : null,
        cal: null, agendaAN: null, evenements: null, maintenant: new Date(),
      });
      setEtat({
        etat: ETATS.SERVI, pret: true, d,
        srcElus: index.sources ? index.sources.elus : null,
        projetsLus: arrive(pr), votesLus,
        votesFiables: votesLus ? positionsFiables(c.donnees, v.donnees) : true,
      });
    }).catch(() => {
      if (vivant) setEtat({ etat: ETATS.ECHEC, pret: false });
    });
    return () => { vivant = false; };
  }, [choix, essai]);

  return etat;
}
