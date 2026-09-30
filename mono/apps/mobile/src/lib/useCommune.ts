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
 * Refonte du 30/09/2026 : l'accueil montre aussi « ce qui arrive » (agenda de
 * l'Assemblee, calendrier du Senat — fichiers produits CHAQUE JOUR par la
 * chaine, jamais embarques) et « qui decide » jusqu'a la region (un petit
 * fichier par region). Chacun porte son propre etat : un calendrier absent ne
 * fait jamais dire « aucune seance annoncee ». Les faits editoriaux restent
 * hors de cet ecran.
 *
 * La DERIVATION reste celle du site (@repere/core) : ce crochet ne calcule
 * aucun fait. */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createElement } from "react";
import { deriverAujourdhui, positionsFiables } from "@repere/core";
import {
  chargerIndex, chargerDepartement, chargerProjets, chargerDeputes, chargerCatalogueScrutins,
  chargerVotes, chargerElusRegion, chargerCalendrierSenat, chargerAgendaAN, ETATS,
} from "./donnees";
import type { Choix } from "./selection";
import type {
  Deputes, ElusRegion, IndexPublie, PaquetDepartement, PaquetProjets, Source,
} from "@repere/core/domaine";

/* Ce que l'accueil derive d'une commune (@repere/core, deriverAujourdhui). Les
   fichiers publies, eux, sont types par le modele de domaine (domaine.d.ts),
   verifie contre les fichiers reels par tests/forme.test.mjs. */
export type Aujourdhui = ReturnType<typeof deriverAujourdhui>;

export type EtatCommune =
  | { etat: string; pret: false }
  | {
      etat: string; pret: true; d: Aujourdhui; srcElus: Source | null;
      index: IndexPublie; paquet: PaquetDepartement; projets: PaquetProjets | null; deputes: Deputes | null; elusRegion: ElusRegion | null;
      /* true si le fichier est arrive ; false : il n'est PAS arrive (panne), ce qui n'est pas une absence */
      projetsLus: boolean; votesLus: boolean; votesFiables: boolean; regionLue: boolean;
      /* le calendrier : arrive pour au moins une institution */
      agendaLu: boolean;
    };

const arrive = (r: { etat: string }) => r.etat === ETATS.SERVI;

export function useCommune(choix: Choix, essai: number): EtatCommune {
  const [etat, setEtat] = useState<EtatCommune>({ etat: ETATS.EN_COURS, pret: false });

  useEffect(() => {
    if (!choix) return undefined;
    let vivant = true;
    setEtat({ etat: ETATS.EN_COURS, pret: false });
    const { dep, insee } = choix;
    (async () => {
      const [ix, pq, pr, de, c, v, ca, an] = await Promise.all([
        chargerIndex(), chargerDepartement(dep), chargerProjets(dep),
        chargerDeputes(), chargerCatalogueScrutins(), chargerVotes(dep),
        chargerCalendrierSenat(), chargerAgendaAN(),
      ]);
      if (!vivant) return;
      const paquet = pq.donnees as PaquetDepartement | null;
      const fiche = paquet && paquet.communes ? paquet.communes[insee] : null;
      /* Sans le departement, rien a montrer. Sans l'index, les sources des
         elus manqueraient : un nom sans source n'est pas affiche (invariant 4). */
      if (!fiche) { setEtat({ etat: pq.donnees ? ETATS.INTROUVABLE : pq.etat, pret: false }); return; }
      if (!ix.donnees) { setEtat({ etat: ix.etat, pret: false }); return; }
      const index = ix.donnees as IndexPublie;
      const depIndex = Array.isArray(index.departements) ? index.departements.find(x => x.code === dep) : null;
      const reg = depIndex && depIndex.region_code ? await chargerElusRegion(depIndex.region_code) : { etat: ETATS.INTROUVABLE, donnees: null };
      if (!vivant) return;
      const votesLus = arrive(de) && arrive(c) && arrive(v);
      const d = deriverAujourdhui({
        fiche, commune: insee, dep, index,
        projets: arrive(pr) ? pr.donnees : null,
        cat: votesLus ? c.donnees : null, pos: votesLus ? v.donnees : null, deputes: votesLus ? de.donnees : null,
        cal: arrive(ca) ? ca.donnees : null, agendaAN: arrive(an) ? an.donnees : null,
        evenements: null, maintenant: new Date(),
      });
      setEtat({
        etat: ETATS.SERVI, pret: true, d,
        srcElus: index.sources ? index.sources.elus : null,
        index, paquet: paquet as PaquetDepartement,
        projets: arrive(pr) ? (pr.donnees as PaquetProjets) : null, deputes: arrive(de) ? (de.donnees as Deputes) : null,
        elusRegion: arrive(reg) ? (reg.donnees as ElusRegion) : null,
        projetsLus: arrive(pr), votesLus, regionLue: arrive(reg),
        votesFiables: votesLus ? positionsFiables(c.donnees, v.donnees) : true,
        agendaLu: arrive(ca) || arrive(an),
      });
    })().catch(() => {
      if (vivant) setEtat({ etat: ETATS.ECHEC, pret: false });
    });
    return () => { vivant = false; };
  }, [choix, essai]);

  return etat;
}

/* Une seule lecture par commune, partagee par l'accueil et les ecrans de
   detail : ouvrir « Ou va l'argent » ne recharge rien. */
const Contexte = createContext<{ r: EtatCommune; reessayer: () => void }>({
  r: { etat: ETATS.EN_COURS, pret: false }, reessayer: () => {},
});
export function FournisseurCommune({ choix, children }: { choix: Choix; children: ReactNode }) {
  const [essai, setEssai] = useState(0);
  const r = useCommune(choix, essai);
  return createElement(Contexte.Provider, { value: { r, reessayer: () => setEssai(n => n + 1) } }, children);
}
export const useCommuneChoisie = () => useContext(Contexte);
