import { dateFr } from "./format.js";
/* @repere/core — deplace depuis apps/web/src/lib/faits.js le 29/09/2026, sans
 * changement de logique, pour que le web et l'application mobile assemblent
 * exactement les memes faits. */
/* SORTI DE CeQuiADecide.jsx LE 18/09/2026, POUR LE PROTOTYPE "AUJOURD'HUI".
 *
 * Cette fonction assemble les DEUX familles de faits dates (un projet finance
 * par l'Etat, un vote solennel du depute) et les trie du plus recent au plus
 * ancien. Le prototype "Aujourd'hui" a besoin du MEME fait le plus recent que
 * le fil complet — jamais d'un calcul parallele qui pourrait un jour diverger
 * et montrer deux "faits les plus recents" differents pour la meme commune
 * selon l'ecran ouvert.
 *
 * LA SECURITE D'IMPUTATION VIT ICI, ET NULLE PART AILLEURS DESORMAIS : le nom
 * complet du depute (jamais le patronyme seul, voir la note "Gregoire" du
 * 14/09/2026 plus bas) et la reference `d.acteurRef` plutot que le nom pour
 * grouper les lignes d'un meme depute. Toute nouvelle vue qui a besoin de ces
 * faits appelle cette fonction ; elle ne relit jamais les fichiers a la main. */
import { positionsFiables, positionSur } from "./votes.js";

/* L'Etat ne publie pas le jour d'un projet, seulement l'exercice budgetaire. On
   le range donc au 31 decembre de son annee — apres les votes de cette annee —
   et l'ecran ecrit « en 2025 », jamais une date inventee. */
const finDAnnee = a => `${a}-12-31`;

/* UN PROJET ENGAGE AVANT UNE FUSION DE COMMUNES (29/09/2026). extract-html.js
   rattache a la commune d'aujourd'hui les projets d'un ancien code (table du
   Code officiel geographique) et marque la ligne `ancien_code` /
   `ancienne_commune`. L'Etat les avait engages pour l'ancienne commune : l'ecran
   doit le dire, jamais les attribuer en silence a la commune actuelle. Une seule
   formulation, ici, pour tous les ecrans qui montrent un projet. */
export function ancienneCommune(p) {
  if (!p || !p.ancien_code) return null;
  return p.ancienne_commune || `l'ancienne commune ${p.ancien_code}`;
}
export function noteRattachement(p) {
  const a = ancienneCommune(p);
  return a ? `Engagé pour ${a}, commune aujourd'hui rattachée à celle-ci.` : null;
}

/* LE FIL EDITORIAL — BLOCKER #3 DE LA MISSION DU 22/09/2026.
 *
 * CE QUE C'EST, TRACE JUSQU'A LA SOURCE. `data/evenements/*.md` (a la racine
 * du depot) porte une entete YAML (titre, date, echelon, source, source_nom,
 * confiance, valide) et un corps en deux parties, « Le fait » et « Ce que ca
 * change ». `outils/evenements.py` (Python, execute par outils/pipeline.sh,
 * jamais depuis ce poste) ne publie QUE les fichiers marques `valide: true`
 * a la main par un humain, avec une source dans une liste d'institutions
 * autorisees (jamais un media) — c'est ce geste humain qui rend vraie la
 * promesse « relu par un humain ». `evenements.json` est le resultat deja
 * filtre : chaque entree qui arrive ICI a deja passe cette porte.
 *
 * CE QUI N'EST PAS FAIT ICI : aucune ligne de ce fichier n'invente une
 * validation. Le champ `conf` (confiance : "verifie" ou "a_confirmer") est
 * transporte tel quel jusqu'a l'ecran, qui doit le distinguer — voir
 * CeQuiADecide.jsx. Ne jamais transformer "a_confirmer" en "verifie", et ne
 * jamais dire "detecte automatiquement" alors que le geste qui a produit
 * cette ligne est un humain qui a ecrit `valide: true` dans un fichier. */
function faitsEditoriaux(evenements, { dep, commune }) {
  if (!evenements || !Array.isArray(evenements.r)) return [];
  return evenements.r
    .filter(e => e.e === "france" || (e.insee && (e.insee === commune || e.insee === dep)))
    .map(e => ({ cle: "ed" + e.id, quand: e.d, rang: 2, echelon: e.e === "france" ? "france" : "ville",
                 type: "editorial", e }));
}

export function calculerFaits({ dep, fiche, projets, commune, cat, pos, deputes, evenements }) {
  const faits = [];
  if (!fiche) return faits;

  const listeProjets = (projets && projets.communes && projets.communes[commune]) || [];
  for (const p of listeProjets) {
    faits.push({ cle: "p" + p.annee + p.intitule, quand: finDAnnee(p.annee), rang: 0,
                 echelon: "ville", type: "projet", p });
  }

  /* Le vote du depute de CETTE commune, et d'aucun autre. Une commune a cheval
     sur deux circonscriptions porte une liste : on prend les deux. */
  const circos = Array.isArray(fiche.circo) ? fiche.circo
                 : (fiche.circo === null || fiche.circo === undefined ? [] : [fiche.circo]);
  const apparie = positionsFiables(cat, pos);
  if (cat && cat.scrutins && pos && pos.positions && deputes && deputes.deputes && apparie) {
    for (const circo of circos) {
      const d = deputes.deputes[dep + "-" + circo];
      if (!d || !d.acteurRef) continue;
      /* LE NOM COMPLET, ET JAMAIS LE PATRONYME SEUL — voir CeQuiADecide.jsx
         (historique complet, 14/09/2026 : Emmanuel GREGOIRE / Olivia Gregoire). */
      const nomComplet = [d.prenom, d.nom].filter(Boolean).join(" ") || d.nom || "";
      for (const sc of cat.scrutins) {
        const position = positionSur(pos, d.acteurRef, sc.n);
        faits.push({ cle: "v" + circo + sc.u, quand: sc.d, rang: 1, echelon: "france",
                     type: "vote", sc, position, qui: nomComplet, ref: d.acteurRef, circo });
      }
    }
  }

  faits.push(...faitsEditoriaux(evenements, { dep, commune }));

  /* L'ORDRE, ET RIEN QUE LUI — voir CeQuiADecide.jsx pour la justification
     complete (invariant 3 : ni montant, ni echelon n'entre dans le tri). */
  faits.sort((a, b) => (a.quand < b.quand ? 1 : a.quand > b.quand ? -1 : a.rang - b.rang));
  return faits;
}

/* LE FAIT EDITORIAL D'UN SCRUTIN (06/10/2026). Les faits valides par la
 * redaction sur un vote de l'Assemblee portent la page du scrutin comme
 * source (`src` = …/scrutins/<numero>). C'est par elle, et par rien d'autre,
 * qu'un fait est relie au vote qu'il explique : jamais par un titre proche.
 * `conf` est transmis tel quel : l'ecran dit « relu et validé » seulement
 * pour "verifie". */
export function faitDuScrutin(evenements, sc) {
  if (!evenements || !Array.isArray(evenements.r) || !sc || !sc.n) return null;
  const fin = "/scrutins/" + String(sc.n);
  return evenements.r.find(e => typeof e.src === "string" && e.src.replace(/\/+$/, "").endsWith(fin)) || null;
}
/* La premiere phrase des grands axes : ce que le premier coup d'oeil retient.
   Le reste se deplie. Coupure sur « . » suivi d'une majuscule, jamais au
   milieu d'une parenthese ou d'un nombre. */
export function premierePhrase(t) {
  const s = String(t || "").replace(/\s+/g, " ").trim();
  const m = s.match(/^(.+?[.!?])\s+(?=[A-ZÀÂÉÈÊÎÔÛÇ])/);
  return m ? m[1] : s;
}
/* Ou en est le texte, selon le fait valide : le paragraphe « Résultat du
   scrutin … » quand il dit que le texte n'est pas definitif. */
export function etatDuTexte(e) {
  if (!e || !e.txt) return null;
  const p = String(e.txt).split(/\n\s*\n/).map(x => x.trim()).find(x => /^Résultat du scrutin/.test(x));
  /* la date ISO du fichier, ecrite comme le reste de l'application */
  return p ? p.replace(/\b(\d{4}-\d{2}-\d{2})\b/g, x => dateFr(x)) : null;
}

/* LE FIL EDITORIAL, CONTROLE DE BOUT EN BOUT (06/10/2026).
 * Relu sur le fichier PUBLIE (evenements.json, cle `r`), sans reutiliser une
 * ligne du script qui l'a ecrit (outils/evenements.py). Rend la liste des
 * defauts, chacun nomme ; vide = le fil est sain.
 *
 * Pourquoi par NOM D'HOTE et non par sous-chaine : la porte Python acceptait
 * toute adresse contenant « assemblee-nationale.fr » quelque part
 * (« https://exemple.com/?assemblee-nationale.fr » passait) — le piege du
 * « garde-fou qui filtre sur une sous-chaine » (CONTEXTE § 9).
 * La liste est celle de outils/evenements.py ; l'elargir est une decision. */
const HOTES_OFFICIELS = ["legifrance.gouv.fr", "assemblee-nationale.fr", "senat.fr", "conseil-constitutionnel.fr",
  "vie-publique.fr", "data.gouv.fr", "journal-officiel.gouv.fr", "hatvp.fr", "ccomptes.fr", "insee.fr", "gouvernement.fr"];
export function sourceOfficielle(url) {
  let u; try { u = new URL(String(url)); } catch { return false; }
  if (u.protocol !== "https:") return false;
  const h = u.hostname.toLowerCase();
  if (h.endsWith(".gouv.fr") || h === "gouv.fr") return true;
  if (HOTES_OFFICIELS.some(d => h === d || h.endsWith("." + d))) return true;
  /* deliberations d'une collectivite, publiees sur son propre site en .fr */
  return h.endsWith(".fr") && /^\/deliberations(\/|$)/.test(u.pathname);
}
/* UN VOTE QUI MERITE UN FAIT (06/10/2026) : le vote sur l'ENSEMBLE d'un texte.
   Un vote de procedure (motion de rejet, prolongation de seance, amendement,
   article) ne dit pas ce qu'un texte change : il n'est pas candidat
   (scripts/candidats-fil.mjs). Mesure sur data/auto : 8423 « prolonger la
   séance au delà de minuit » y etait propose. */
const PROCEDURE = /motion de rejet|motion de renvoi|prolonger la séance|^l'amendement|^le sous-amendement|^l'article/i;
export const estVoteDeTexte = t => /^l'ensemble\b/i.test(String(t || "").trim()) && !PROCEDURE.test(String(t || "").trim());
const numeroScrutin = url => { const m = String(url || "").replace(/\/+$/, "").match(/assemblee-nationale\.fr\/dyn\/\d+\/scrutins\/(\d+)$/); return m ? m[1] : null; };
export function controlerFaits(evenements, catalogue, maintenant = new Date()) {
  const defauts = [];
  if (!evenements || !Array.isArray(evenements.r)) return ["fichier sans liste « r » : aucun fait ne serait lu"];
  const dates = new Map(((catalogue && catalogue.scrutins) || []).map(s => [String(s.n), s.d]));
  const ids = new Set(), parScrutin = new Map();
  for (const e of evenements.r) {
    const id = e && e.id ? e.id : "(sans id)";
    if (ids.has(id)) defauts.push(`${id} : identifiant en double`);
    ids.add(id);
    if (!e.t || !String(e.t).trim()) defauts.push(`${id} : titre absent`);
    if (!e.axes || !String(e.axes).trim()) defauts.push(`${id} : grands axes absents`);
    if (!["verifie", "a_confirmer"].includes(e.conf)) defauts.push(`${id} : confiance inconnue (${e.conf})`);
    if (!["ville", "agglo", "departement", "region", "france"].includes(e.e)) defauts.push(`${id} : échelon inconnu (${e.e})`);
    if (e.e !== "france" && !e.insee) defauts.push(`${id} : fait local sans territoire`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(e.d)) || Number.isNaN(Date.parse(e.d + "T00:00:00Z"))) defauts.push(`${id} : date illisible (${e.d})`);
    else if (Date.parse(e.d + "T00:00:00Z") > maintenant.getTime()) defauts.push(`${id} : date dans le futur (${e.d})`);
    if (!sourceOfficielle(e.src)) defauts.push(`${id} : source absente ou non officielle (${e.src})`);
    if (e.axes_src && !sourceOfficielle(e.axes_src)) defauts.push(`${id} : source des axes non officielle (${e.axes_src})`);
    const n = numeroScrutin(e.src);
    if (n) {
      if (parScrutin.has(n)) defauts.push(`${id} : deuxième fait pour le scrutin ${n} (déjà ${parScrutin.get(n)})`);
      parScrutin.set(n, id);
      if (/^scrutin-/.test(id) && !id.endsWith("-" + n)) defauts.push(`${id} : l'identifiant ne porte pas le numéro de sa source (${n})`);
      if (dates.has(n) && dates.get(n) !== e.d) defauts.push(`${id} : date ${e.d} différente de celle du scrutin ${n} (${dates.get(n)})`);
    }
  }
  return defauts;
}
