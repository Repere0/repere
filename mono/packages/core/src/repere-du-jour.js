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
 *   - pas de non-répétition sur 30 jours : elle exigerait 30 modèles par catégorie.
 *     La rotation sans mémoire (voir `tirages`) ne répète un fait qu'après un cycle
 *     complet : 6 jours pour le budget (12 modèles, 2 faits par jour), 7 pour les élus.
 *     Une mémoire exigerait une clé locale de plus, interdite par l'invariant 2 ;
 *     donc une clé locale de plus, interdite par l'invariant 2 ;
 *   - pas de faits « histoire » : aucune source historique n'est joignable ;
 *   - 19 modèles, pas 30 : on n'écrit pas de fait pour atteindre un nombre. */

import { dateFr } from "./format.js";
import { ordinal, decompte } from "./votes.js";
import { phrasePosition } from "./phrases.js";
import { parHabitant } from "./visuels.js";
import { visibleAuNiveau } from "./profil.js";

/* Échelon de chaque modèle : le vote et la circonscription sont nationaux (Assemblée) ;
   le budget et le maire sont locaux. Le réglage « Ma rue » écarte le national (profil.js). */
const NATIONAL = new Set(["e-circonscription", "e-partagee"]);
export const echelonDe = m => m.source === "scrutin" || NATIONAL.has(m.id) ? "france" : "ville";

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
  /* Évolutions entre deux exercices de la MÊME commune (V52) : un calcul, annoncé comme tel.
     Refusé faute de donnée : dotations de l'État, capacité d'autofinancement, dépenses de
     fonctionnement, charges de personnel au sens du compte (la ligne « comptes » ne les porte pas). */
  { id: "b-evolution-depenses", source: "comptes-calcul", texte: c => evolution(c, "depenses", "Les dépenses par habitant", "ont", "augmenté", "diminué") },
  { id: "b-evolution-recettes", source: "comptes-calcul", texte: c => evolution(c, "recettes", "Les recettes par habitant", "ont", "augmenté", "diminué") },
  { id: "b-evolution-dette", source: "comptes-calcul", texte: c => evolution(c, "dette", "La dette par habitant", "a", "augmenté", "diminué") },
];

/* Évolution en pourcentage d'un montant par habitant, entre l'exercice précédent et le dernier. */
function evolution(c, cle, sujet, verbe, haut, bas) {
  const p = c.precedent;
  if (!p || c.hab[cle] === null || p.hab[cle] === null || p.hab[cle] <= 0) return null;
  const pct = Math.round((c.hab[cle] - p.hab[cle]) / p.hab[cle] * 100);
  if (pct === 0) return null;
  const sens = pct > 0 ? `${verbe === "a" ? "a" : "ont"} ${haut}` : `${verbe === "a" ? "a" : "ont"} ${bas}`;
  return `${sujet} de ${c.nom} ${sens} de ${Math.abs(pct)} % entre ${p.an} et ${c.an}.`;
}

/* L'exercice qui précède le dernier, avec ses montants par habitant, s'il existe. */
export function exercicePrecedent(comptes, an) {
  if (!comptes || !an) return null;
  const ans = Object.keys(comptes).filter(a => /^\d{4}$/.test(a) && a < an).sort();
  for (let i = ans.length - 1; i >= 0; i--) {
    const hab = parHabitant(comptes[ans[i]]);
    if (hab && hab.depenses !== null) return { an: ans[i], hab: { recettes: nombre(hab.recettes), depenses: nombre(hab.depenses), dette: nombre(hab.dette) } };
  }
  return null;
}

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

/* ── ROTATION SANS MÉMOIRE (V51, correction) ──────────────────────────────
   Pourquoi pas un tirage au hasard par jour : mesuré sur 30 jours, 72 faits sur 90
   revenaient dans le mois et 14 étaient identiques à la veille. Pourquoi pas une
   liste des faits déjà montrés : elle exigerait une clé locale (invariant 2).

   Ici, pour une commune, les modèles disponibles de chaque catégorie forment une
   liste ordonnée (ordre fixe de MODELES). Un pas premier avec la longueur de la liste
   la parcourt sans répéter avant d'avoir tout vu. Le jour fixe la position : aucune
   donnée n'est stockée, et deux jours de suite donnent deux faits différents dès que
   la liste compte au moins trois modèles. Budget : deux faits par jour ; élus : un. */
export function pgcd(a, b) { while (b) [a, b] = [b, a % b]; return a; }

/* Pas multiplicatif premier avec n, tiré de la commune : 1 si n <= 2. */
export function pas(graine, n) {
  if (n <= 2) return 1;
  let s = 1 + (empreinte(graine) % (n - 1));
  while (pgcd(s, n) !== 1) s = (s % n) + 1;
  return s;
}

/* Nombre de jours depuis 1970, en calendrier local (pas d'effet de fuseau). */
export function jourEntier(date) {
  const [a, m, j] = cleDuJour(date).split("-").map(Number);
  return Math.round(Date.UTC(a, m - 1, j) / 86400000);
}

/* Les `k` modèles tirés de la liste pour ce jour : pas `k` positions consécutives de la
   marche, sans doublon. */
export function tirages(liste, graine, jour, k) {
  const n = liste.length;
  if (n === 0) return [];
  const off = empreinte(graine + "|off") % n;
  const s = pas(graine + "|pas", n);
  const choisis = [];
  for (let j = 0; j < k && choisis.length < n; j++) {
    const i = (off + (k * jour + j) * s) % n;
    if (!choisis.includes(liste[i])) choisis.push(liste[i]);
  }
  return choisis;
}

/* Trois faits, au plus : deux budgets et un élu quand ils existent, sinon ce qui reste.
   Rien n'est produit sans donnée. */
export function faitsDuJour({ nom, insee, date, exercice, rapportsComptes, fiche, vote, nbCircos, niveau, comptes }) {
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
    precedent: exercicePrecedent(comptes, an),
  };
  /* Ordre fixe de MODELES : la rotation ne dépend que de cet ordre, de la commune et du jour. */
  /* Le réglage d'échelon filtre AVANT la sélection : les trois faits viennent des modèles visibles. */
  const disponibles = MODELES
    .filter(m => niveau === undefined || visibleAuNiveau(niveau, echelonDe(m)))
    .map(m => ({ m, texte: m.texte(c) }))
    .filter(x => x.texte)
    .map(x => ({
      id: x.m.id,
      categorie: x.m.source === "comptes" || x.m.source === "comptes-calcul" ? "budget" : "elus",
      source: x.m.source, calcul: x.m.source === "comptes-calcul", echelon: echelonDe(x.m), texte: x.texte,
    }));
  const budget = disponibles.filter(p => p.categorie === "budget");
  const elus = disponibles.filter(p => p.categorie === "elus");
  const jour = jourEntier(date);
  const commune = insee || nom || "";
  const [b1, b2] = tirages(budget, commune + "|budget", jour, 2);
  const [e1] = tirages(elus, commune + "|elus", jour, 1);
  /* Ordre d'affichage : budget, élu, budget. Repli : si une catégorie manque, le reste
     vient de l'autre, dans l'ordre fixe, sans doublon. */
  const choisis = [b1, e1, b2].filter(Boolean);
  for (const p of disponibles) {
    if (choisis.length >= 3) break;
    if (!choisis.includes(p)) choisis.push(p);
  }
  return choisis.slice(0, 3);
}
