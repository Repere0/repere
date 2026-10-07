import { useEffect, useState } from "react";
import {
  chargerProjets, chargerDeputes, chargerCatalogueScrutins, chargerVotes,
  chargerCalendrierSenat, chargerAgendaAN, chargerEvenements, ETATS,
} from "@repere/data-utils";
import { deriverAujourdhui } from "@repere/core";
import { rapports } from "./comptes.jsx";

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

  /* LA DERIVATION VIT DANS @repere/core DEPUIS LE 29/09/2026 (deriverAujourdhui) :
     ce crochet ne fait plus que charger. `rapportsComptes` et `rapportDette` sont
     remplaces par leur version web (un mot du dictionnaire y devient un bouton). */
  const d = deriverAujourdhui({ fiche, commune, dep, index, projets, cat, pos, deputes, cal, agendaAN, evenements });
  const rr = d.exercice ? rapports(d.exercice.ex) : [];
  /* La version web du rapport (mot du dictionnaire en bouton) garde l'exercice
     attache par @repere/core : l'annee n'est jamais recalculee ici. */
  const rapportDette = d.rapportDette && rr[0] ? { ...rr[0], an: d.rapportDette.an } : undefined;
  return { ...d, etat, rapportsComptes: rr, rapportDette };
}
