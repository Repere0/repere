import { useEffect, useState } from "react";
import {
  chargerProjets, chargerDeputes, chargerCatalogueScrutins, chargerVotes,
  chargerCalendrierSenat, chargerEvenements, ETATS,
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
  const [evenements, setEvenements] = useState(null);

  const dep = paquet && paquet.d;
  const fiche = commune && paquet && paquet.communes ? paquet.communes[commune] : null;

  useEffect(() => {
    if (!dep || !commune) return undefined;
    let vivant = true;
    setEtat(ETATS.EN_COURS);
    Promise.all([
      chargerProjets(dep), chargerDeputes(), chargerCatalogueScrutins(),
      chargerVotes(dep), chargerCalendrierSenat(), chargerEvenements(),
    ]).then(([pr, de, c, v, ca, ev]) => {
      if (!vivant) return;
      setProjets(pr.donnees); setDeputes(de.donnees); setCat(c.donnees);
      setPos(v.donnees); setCal(ca.donnees); setEvenements(ev.donnees);
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

  const aVenir = cal && Array.isArray(cal.evenements)
    ? cal.evenements.filter(e => e.debut + ":00" >= new Date().toISOString().slice(0, 16))
    : [];
  const prochain = aVenir[0];
  const srcCal = (cal && cal.source) || {};

  return {
    etat, pret: true, fiche, nomCommune, dep, base, faits,
    dernierVote, dernierFait, exercice, rapportsComptes: rr, rapportDette,
    prochain, srcComptes, srcProjets, srcScrutins, srcCal,
  };
}
