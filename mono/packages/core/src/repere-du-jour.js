/* @repere/core — « LE REPÈRE DU JOUR » (V51, 03/11/2026).
 *
 * Trois faits par jour pour une commune, tirés des données DÉJÀ publiées dans le
 * dépôt (budget OFGL, dernier vote du député, maire, circonscription). Aucune
 * donnée nouvelle, aucune source inventée : un modèle dont la donnée manque
 * n'est pas produit (doctrine du vide, invariant 5).
 *
 * Règles :
 *   - même commune et même jour : mêmes trois faits (déterministe) ;
 *   - jour suivant : une autre sélection (la graine change avec la date) ;
 *   - chaque fait porte sa source (categorie → source) et s'annonce comme calcul
 *     quand il en est un (invariant 4) ;
 *   - aucune mise en ordre de personnes ou de territoires, aucun point, aucune
 *     série (invariants 3 et 6).
 *
 * Ce qui N'EST PAS fait ici, et pourquoi (voir BLOCAGES.md §55) :
 *   - pas d'anti-répétition sur 30 jours : elle exigerait de stocker l'historique,
 *     donc une clé locale de plus, interdite par l'invariant 2 ;
 *   - pas de faits « histoire » : aucune source historique n'est joignable ;
 *   - 19 modèles, pas 30 : on n'écrit pas de fait pour atteindre un nombre. */

import { dateFr } from "./format.js";
import { ordinal, decompte } from "./votes.js";
import { phrasePosition } from "./phrases.js";
import { parHabitant } from "./visuels.js";

/* Empreinte FNV-1a 32 bits : stable d'une exécution à l'autre, même moteur ou non. */
export function empreinte(texte) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/* La date du jour, en composantes locales (le téléphone est à Paris pour la bêta). */
export function cleDuJour(date) {
  const d = date instanceof Date ? date : new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${j}`;
}

const nombre = x => typeof x === "number" && Number.isFinite(x) ? x : null;
const eur = n => Math.round(n).toLocaleString("fr-FR");
const trouve = (rapports, re) => (rapports || []).find(r => r && re.test(r.v || ""));

/* ── BUDGET — les montants par habitant sont PUBLIÉS (source « comptes ») ; les
   phrases dérivées (solde, rapports) sont des CALCULS (source « comptes-calcul »). ── */
const BUDGET = [
  { id: "b-recettes", source: "comptes", texte: c => c.hab.recettes !== null ? `En ${c.an}, ${c.nom} a encaissé ${eur(c.hab.recettes)} € par habitant.` : null },
  { id: "b-depenses", source: "comptes", texte: c => c.hab.depenses !== null ? `En ${c.an}, ${c.nom} a dépensé ${eur(c.hab.depenses)} € par habitant.` : null },
  { id: "b-dette", source: "comptes", texte: c => c.hab.dette !== null ? `En ${c.an}, la dette de ${c.nom} s'élève à ${eur(c.hab.dette)} € par habitant.` : null },
  { id: "b-investissement", source: "comptes", texte: c => c.hab.investissement !== null ? `En ${c.an}, ${c.nom} a consacré ${eur(c.hab.investissement)} € par habitant à l'investissement.` : null },
  { id: "b-salaires", source: "comptes", texte: c => c.hab.salaires !== null ? `En ${c.an}, ${c.nom} a versé ${eur(c.hab.salaires)} € par habitant à ses agents.` : null },
  { id: "b-impots", source: "comptes", texte: c => c.hab.impots !== null ? `En ${c.an}, les impôts et taxes représentent ${eur(c.hab.impots)} € par habitant à ${c.nom}.` : null },
  { id: "b-solde", source: "comptes-calcul", texte: c => {
      if (c.hab.recettes === null || c.hab.depenses === null) return null;
      const ecart = c.hab.recettes - c.hab.depenses;
      if (ecart === 0) return null;
      return ecart > 0
        ? `En ${c.an}, ${c.nom} a encaissé ${eur(ecart)} € par habitant de plus qu'elle n'a dépensé.`
        : `En ${c.an}, ${c.nom} a dépensé ${eur(-ecart)} € par habitant de plus qu'elle n'a encaissé.`;
    } },
  { id: "b-part-salaires", source: "comptes-calcul", texte: c => { const r = trouve(c.rapports, /salaires/); return r ? `Sur 100 € dépensés à ${c.nom} en ${c.an} : ${r.v}.` : null; } },
  { id: "b-part-investir", source: "comptes-calcul", texte: c => { const r = trouve(c.rapports, /investir/); return r ? `Sur 100 € dépensés à ${c.nom} en ${c.an} : ${r.v}.` : null; } },
  { id: "b-part-impots", source: "comptes-calcul", texte: c => { const r = trouve(c.rapports, /impôts/); return r ? `Sur 100 € encaissés à ${c.nom} : ${r.v}.` : null; } },
  { id: "b-dette-recettes", source: "comptes-calcul", texte: c => { const r = trouve(c.rapports, /mois de recettes/); return r ? `L'encours de dette de ${c.nom} représente ${r.v}.` : null; } },
  { id: "b-annee", source: "comptes", texte: c => c.an ? `Les comptes les plus récents de ${c.nom} sont ceux de ${c.an}.` : null },
];

/* ── ÉLUS ET VOTES — source « scrutin » (Assemblée nationale) ou « elus » (RNE). ── */
const ELUS = [
  { id: "e-circonscription", source: "elus", texte: c => c.vote && c.vote.circo ? `${c.nom} est dans la ${ordinal(c.vote.circo)} circonscription.` : null },
  { id: "e-partagee", source: "elus", texte: c => c.nbCircos > 1 ? `${c.nom} est partagée entre ${c.nbCircos} circonscriptions : votre député dépend de votre adresse.` : null },
  { id: "e-maire", source: "elus", texte: c => c.maire ? `Le maire de ${c.nom} est ${c.maire}.` : null },
  { id: "e-vote", source: "scrutin", texte: c => {
      const v = c.vote;
      if (!v || !v.sc || !v.sc.d) return null;
      const phrase = phrasePosition(v.position, v.qui).map(s => s.t).join("");
      if (/ne porte pas de position/.test(phrase)) return null;
      /* La phrase commence par un nom propre : on ne la met pas en minuscule. */
      return `Le ${dateFr(v.sc.d)} : ${phrase}`;
    } },
  { id: "e-titre", source: "scrutin", texte: c => c.vote && c.vote.sc && c.vote.sc.t && c.vote.sc.d ? `Le texte voté le ${dateFr(c.vote.sc.d)} : « ${c.vote.sc.t} ».` : null },
  { id: "e-decompte", source: "scrutin", texte: c => {
      const v = c.vote;
      if (!v || !v.sc || !v.sc.dec || !v.sc.d) return null;
      const d = decompte(v.sc.dec);
      return d && d !== "décompte non publié" ? `À l'Assemblée, le ${dateFr(v.sc.d)} : ${d}.` : null;
    } },
  { id: "e-scrutin-numero", source: "scrutin", texte: c => c.vote && c.vote.sc && c.vote.sc.n && c.vote.sc.d ? `Scrutin n° ${c.vote.sc.n} de l'Assemblée nationale, le ${dateFr(c.vote.sc.d)}.` : null },
];

export const MODELES = [...BUDGET, ...ELUS];

/* Trois faits, au plus : un budget et un élu quand ils existent, puis le reste,
   dans un ordre tiré de (commune, jour). Rien n'est produit sans donnée. */
export function faitsDuJour({ nom, insee, date, exercice, rapportsComptes, fiche, vote, nbCircos }) {
  /* exercice : { an, ex } tel que produit par dernierExercice() ; le budget par habitant
     se lit ici, dans la même fonction que le site. */
  const an = exercice && exercice.an ? exercice.an : null;
  const hab = exercice && exercice.ex ? parHabitant(exercice.ex)
    : { recettes: null, depenses: null, dette: null, investissement: null, salaires: null, impots: null };
  const c = {
    nom: nom || "",
    an,
    hab: {
      recettes: nombre(hab.recettes), depenses: nombre(hab.depenses), dette: nombre(hab.dette),
      investissement: nombre(hab.investissement), salaires: nombre(hab.salaires), impots: nombre(hab.impots),
    },
    rapports: rapportsComptes || [],
    maire: fiche && fiche.maire && fiche.maire.nom ? fiche.maire.nom : null,
    vote: vote || null,
    nbCircos: typeof nbCircos === "number" ? nbCircos : 0,
  };
  const graine = cleDuJour(date) + "|" + (insee || "");
  const produits = MODELES
    .map(m => ({ m, texte: m.texte(c) }))
    .filter(x => x.texte)
    .map(x => ({ id: x.m.id, categorie: x.m.source === "comptes" || x.m.source === "comptes-calcul" ? "budget" : "elus", source: x.m.source, calcul: x.m.source === "comptes-calcul", texte: x.texte, rang: empreinte(graine + "|" + x.m.id) }))
    .sort((a, b) => a.rang - b.rang);
  const choisis = [];
  for (const cat of ["budget", "elus"]) {
    const premier = produits.find(p => p.categorie === cat && !choisis.includes(p));
    if (premier) choisis.push(premier);
  }
  for (const p of produits) {
    if (choisis.length >= 3) break;
    if (!choisis.includes(p)) choisis.push(p);
  }
  return choisis.slice(0, 3).map(({ rang, ...f }) => f);
}
