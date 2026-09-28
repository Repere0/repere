import { useEffect, useState } from "react";
import {
  chargerProjets, chargerDeputes, chargerCatalogueScrutins, chargerVotes,
  chargerCalendrierSenat, chargerAgendaAN, chargerEvenements, ETATS,
} from "@repere/data-utils";
import { calculerFaits } from "./faits.js";
import { rapports, dernierExercice } from "./comptes.jsx";

/* SORTI DE Aujourdhui.jsx LE 19/09/2026, POUR POUVOIR CONSTRUIRE PLUSIEURS
 * DIRECTIONS UX SANS TRIPLER LE CHARGEMENT DES DONNEES. Trois ecrans
 * (journal, territoire, question) racontent les MEMES faits differemment ;
 * ils doivent lire exactement le meme calcul, jamais trois qui pourraient
 * un jour diverger — la lecon de lib/faits.js et lib/comptes.jsx, une fois
 * de plus. Ce fichier ne rend rien : il ne fait que charger et deriver. */
export function useAujourdhui(paquet, index, commune) {
  const [etat, setEtat] = useState(ETATS.EN_COURS);
  const [projets, setProjets] = useState(null);
  const [cat, setCat] = useState(null);
  const [pos, setPos] = useState(null);
  const [deputes, setDeputes] = useState(null);
  const [cal, setCal] = useState(null);
  const [agendaAN, setAgendaAN] = useState(null);
  const [evenements, setEvenements] = useState(null);

  const dep = paquet && paquet.d;
  const fiche = commune && paquet && paquet.communes ? paquet.communes[commune] : null;

  useEffect(() => {
    if (!dep || !commune) return undefined;
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    Promise.all([
      chargerProjets(dep), chargerDeputes(), chargerCatalogueScrutins(),
      chargerVotes(dep), chargerCalendrierSenat(), chargerEvenements(), chargerAgendaAN(),
    ]).then(([pr, de, c, v, ca, ev, an]) => {
      if (!vivant) return;
      setProjets(pr.donnees); setDeputes(de.donnees); setCat(c.donnees);
      setPos(v.donnees); setCal(ca.donnees); setEvenements(ev.donnees);
      setAgendaAN(an.donnees);
      setEtat(ETATS.SERVI);
    });
    return () => { vivant = false; };
  }, [dep, commune]);

  if (!fiche || etat === ETATS.EN_COURS) {
    return { etat, fiche, pret: false };
  }

  const nomCommune = fiche.nom || "";
  const faits = calculerFaits({ dep, fiche, projets, commune, cat, pos, deputes, evenements });
  const base = (cat && cat.url_scrutin) || "";
  const dernierVote = faits.find(f => f.type === "vote" && f.position);
  const dernierFait = faits[0];

  const agregats = (index && index.agregats) || [];
  const srcComptes = index && index.sources ? index.sources.comptes : null;
  const srcProjets = (index && index.sources && index.sources.projets) || null;
  const srcScrutins = (cat && cat.source) || null;
  const exercice = dernierExercice(fiche, agregats);
  const rr = exercice ? rapports(exercice.ex) : [];
  const rapportDette = rr[0];

  /* CE QUI ARRIVE : SENAT ET ASSEMBLEE, PAS LE SENAT SEUL — 28/09/2026.
   * Mesure en production ce jour-la : « Qu'est-ce qui arrive ? » n'affichait
   * qu'une audition de commission du Senat, parce que ce hook ne chargeait
   * que le calendrier du Senat. Les 30 seances publiques de l'Assemblee des
   * 30 jours suivants — dont l'ouverture de la session ordinaire — etaient
   * invisibles sur l'ecran qui pose la question. Meme fusion que
   * Calendrier.jsx : chaque evenement porte son institution et sa source,
   * posees ici, jamais dans le fichier de l'autre institution.
   * `prochain` et `srcCal` restent exposes pour les deux prototypes
   * (AujourdhuiJournal, AujourdhuiTerritoire), qui n'en lisent qu'un. */
  const maintenant = new Date().toISOString().slice(0, 16);
  const dansSeptJours = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16);
  const aVenir = [];
  for (const [inst, donnees] of [["Sénat", cal], ["Assemblée nationale", agendaAN]]) {
    if (!donnees || !Array.isArray(donnees.evenements)) continue;
    for (const e of donnees.evenements) {
      if (e.debut + ":00" >= maintenant + ":00") aVenir.push({ ...e, institution: inst, source: donnees.source || {} });
    }
  }
  aVenir.sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : 0));
  const cetteSemaine = aVenir.filter(e => e.debut <= dansSeptJours).slice(0, 3);
  const prochains = cetteSemaine.length ? cetteSemaine : aVenir.slice(0, 1);
  const prochain = aVenir[0];
  const srcCal = (prochain && prochain.source) || (cal && cal.source) || {};

  return {
    etat, pret: true, fiche, nomCommune, dep, base, faits,
    dernierVote, dernierFait, exercice, rapportsComptes: rr, rapportDette,
    prochain, prochains, prochainsDansLaSemaine: cetteSemaine.length > 0,
    srcComptes, srcProjets, srcScrutins, srcCal,
  };
}
