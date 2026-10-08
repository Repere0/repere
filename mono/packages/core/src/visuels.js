/* @repere/core — CE QUE LES INFOGRAPHIES MONTRENT, CALCULE UNE SEULE FOIS
 * (30/09/2026, refonte de l'experience mobile).
 *
 * Une infographie est une affirmation. Chaque fonction de ce fichier rend les
 * nombres qu'une visualisation dessine ET le denominateur, l'unite, la periode
 * et la nature (donnee publiee ou calcul de Repere) qui l'accompagnent. L'ecran
 * dessine ; il ne calcule rien. Le site pourra dessiner les memes objets : une
 * barre ne peut pas dire deux choses selon l'appareil.
 *
 * Regles communes, verifiees par tests/core.test.mjs :
 *   - une part n'est calculee que si le denominateur est publie et positif ;
 *   - une part au-dela de 100 % n'est jamais dessinee (donnee incoherente) ;
 *   - rien ne compare deux territoires (invariant 3) ;
 *   - aucune valeur n'est qualifiee de bonne ou de mauvaise. */
import { valeur, pourCent } from "./comptes.js";
import { MOTS } from "./votes.js";

/* --- ce que decide chaque echelon (deplace de apps/web/src/lib/competences.js) --- */
/* LA REGLE D'ECRITURE : ne pas nommer l'institution, nommer ce qu'elle decide
   dans la vie du lecteur. Historique complet dans QuiDecide.jsx. */
export const COMPETENCES = {
  ville: "l'école primaire, la cantine, les permis de construire, la voirie et l'état civil",
  agglo: "les transports, les déchets, l'eau, et souvent les piscines et les médiathèques",
  dept: "les collèges, les routes départementales, les aides sociales et la protection de l'enfance",
  region: "les lycées, les trains du quotidien, la formation professionnelle et le développement économique",
  france: "les lois qui s'appliquent partout, et le budget de l'État",
};

/* L'INTERCOMMUNALITE N'EST PAS LA MEME PARTOUT — 07/10/2026.
   Mesure : la phrase nationale (« les transports, les dechets, l'eau... ») etait
   affichee pour toute intercommunalite. Elle est fausse en Ile-de-France :
     - les transports y sont organises par Ile-de-France Mobilites (code des
       transports, art. L1241-1), pas par l'intercommunalite ;
     - dans la Metropole du Grand Paris, les dechets menagers, l'eau et
       l'assainissement relevent de l'etablissement public territorial (EPT),
       pas de la Metropole (CGCT, art. L5219-5).
   Le modele est lu dans la DONNEE (code de region de l'index, nom de
   l'intercommunalite publie par le Repertoire national des elus), jamais une
   liste de communes ecrite ici. L'EPT de chaque commune n'est PAS dans les
   donnees de Repere : on dit qu'il existe et ce qu'il gere, sans inventer son
   nom. Paris n'appartient a aucun EPT : la phrase ne s'y affiche pas. */
export const SOURCE_TRANSPORTS_IDF = { producteur: "Code des transports, article L1241-1", url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000023086525" };
export const SOURCE_EPT = { producteur: "Code général des collectivités territoriales, article L5219-5", url: "https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633" };
const norme = t => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function estMetropoleGrandParis(agglo) {
  return /metropole du grand paris/.test(norme(agglo && agglo.nom));
}
export function competencesIntercommunalite({ agglo, regionCode, dep }) {
  const idf = String(regionCode || "") === "11";
  const mgp = estMetropoleGrandParis(agglo);
  if (mgp) {
    return {
      decide: "des politiques menées à l'échelle de toute la métropole",
      precisions: [
        ...(String(dep) !== "75" ? ["Votre commune fait aussi partie d'un établissement public territorial, qui gère notamment les déchets ménagers, l'eau et l'assainissement. Repère n'a pas encore son nom."] : []),
        "En Île-de-France, les transports en commun sont organisés par Île-de-France Mobilités.",
      ],
      sources: [...(String(dep) !== "75" ? [SOURCE_EPT] : []), SOURCE_TRANSPORTS_IDF],
    };
  }
  if (idf) {
    return {
      decide: "les déchets, l'eau, et souvent les piscines et les médiathèques",
      precisions: ["En Île-de-France, les transports en commun sont organisés par Île-de-France Mobilités."],
      sources: [SOURCE_TRANSPORTS_IDF],
    };
  }
  return { decide: COMPETENCES.agglo, precisions: [], sources: [] };
}

/* --- l'argent -------------------------------------------------------------- */

/* Les nombres des rapports de comptes.js (rapports() les ecrit en phrases avec
   les MEMES formules : un test verifie que les deux concordent). */
export function chiffresComptes(ex) {
  const v = i => valeur(ex, i);
  const [rec, dep, det, inv, sal, imp] = [0, 1, 2, 3, 4, 5].map(v);
  const nn = x => !!(x && typeof x.m === "number" && x.m > 0);
  const borne = p => (p >= 0 && p <= 100 ? p : null);
  return {
    detteMois: nn(det) && nn(rec) ? det.m / (rec.m / 12) : null,
    partSalaires: nn(sal) && nn(dep) ? borne(pourCent(sal.m, dep.m)) : null,
    partInvestissement: nn(inv) && nn(dep) ? borne(pourCent(inv.m, dep.m)) : null,
    partImpots: nn(imp) && nn(rec) ? borne(pourCent(imp.m, rec.m)) : null,
    parJour: nn(dep) ? Math.round(dep.m / 365) : null,
    depenses: nn(dep) ? dep.m : null,
    recettes: nn(rec) ? rec.m : null,
    dette: det && typeof det.m === "number" ? det.m : null,
  };
}

/* Un projet finance par l'Etat : la subvention rapportee au cout declare du
   projet, tous deux publies par la DGCL. La part est un calcul de Repere. Le
   reste n'est attribue a personne : la source ne dit pas qui le paie. */
export function financementProjet(p) {
  if (!p || typeof p.subvention !== "number" || p.subvention <= 0) return null;
  const cout = typeof p.cout === "number" && p.cout > 0 ? p.cout : null;
  const part = cout && p.subvention <= cout ? p.subvention / cout : null;
  return {
    subvention: p.subvention,
    cout,
    part,
    partPct: part === null ? null : Math.round(part * 100),
    reste: cout && part !== null ? cout - p.subvention : null,
  };
}
export const NOTE_FINANCEMENT = "Le reste du coût n'est pas détaillé par la source : elle ne dit pas qui le paie.";

/* Nom complet d'un dispositif (DETR, DSIL, DPV…), tel que la source le publie. */
export const nomDispositif = (projets, code) =>
  (projets && projets.dispositifs && projets.dispositifs[code]) || code || "";

/* --- le vote --------------------------------------------------------------- */

/* La repartition d'un scrutin sur les deputes QUI ONT PRIS PART au vote
   (pour + contre + abstention, publies par l'Assemblee). Ce n'est pas la
   composition de l'Assemblee : le denominateur est dit a l'ecran. */
export function repartitionVote(sc) {
  if (!sc || !sc.dec) return null;
  const n = k => { const x = Number(sc.dec[k]); return Number.isFinite(x) && x >= 0 ? x : null; };
  const pour = n("pour"), contre = n("contre"), abst = n("abstentions");
  if (pour === null || contre === null || abst === null) return null;
  const total = pour + contre + abst;
  if (total <= 0) return null;
  return {
    total,
    segments: [
      { cle: "p", libelle: "Pour", nombre: pour, part: pour / total },
      { cle: "c", libelle: "Contre", nombre: contre, part: contre / total },
      { cle: "a", libelle: "Abstention", nombre: abst, part: abst / total },
    ],
  };
}
export const phraseDenominateurVote = total =>
  `Sur ${total.toLocaleString("fr-FR")} députés ayant pris part au vote. Ceux qui n'ont pas voté ne sont pas comptés.`;

export function motPosition(position) {
  const m = MOTS[position];
  return m ? (m === "Abstention" ? "abstention" : m.toLowerCase()) : null;
}

/* LE PARCOURS D'UNE LOI — pedagogie generale, sourcee (Constitution, art. 45).
   L'etape surlignee vient de la PROCEDURE ecrite dans l'intitule officiel du
   scrutin (votes.js, procedure()) ; rien n'est suppose au-dela. On ne dit pas
   par quelle chambre le texte a commence : l'intitule ne le porte pas. */
export const CONSTITUTION_45_URL = "https://www.conseil-constitutionnel.fr/le-bloc-de-constitutionnalite/texte-integral-de-la-constitution-du-4-octobre-1958-en-vigueur";
export const ETAPES_LOI = [
  { cle: "depot", titre: "Dépôt", texte: "Un texte est déposé par le Gouvernement (projet de loi) ou par des parlementaires (proposition de loi)." },
  { cle: "première lecture", titre: "Première lecture", texte: "Chaque assemblée l'examine une première fois, en commission puis en séance, et peut le modifier." },
  { cle: "nouvelle lecture", titre: "Navette", texte: "Tant que les deux assemblées ne l'adoptent pas dans les mêmes termes, le texte passe de l'une à l'autre." },
  { cle: "texte de la commission mixte paritaire", titre: "Commission mixte paritaire", texte: "En cas de désaccord, sept députés et sept sénateurs cherchent une version commune, que chaque assemblée vote ensuite." },
  { cle: "lecture définitive", titre: "Lecture définitive", texte: "Si le désaccord persiste, le Gouvernement peut demander à l'Assemblée nationale de statuer définitivement." },
  { cle: "promulgation", titre: "Promulgation", texte: "Une fois adoptée, la loi est promulguée par le président de la République et publiée au Journal officiel." },
];
/* « seconde délibération » : un nouveau vote demande dans la meme lecture. */
export function etapeDuScrutin(procedureTexte) {
  const p = String(procedureTexte || "").toLowerCase();
  if (p === "seconde délibération") return "première lecture";
  return ETAPES_LOI.some(e => e.cle === p) ? p : null;
}

/* --- qui decide ------------------------------------------------------------ */

/* « Mon canton d'abord » (regle du site, QuiDecide.jsx) : l'elu du canton de la
   commune passe avant le president ; sans lien de canton, le premier du
   conseil tel que la source le range (en pratique le president). */
export function teteDepartement(paquet, fiche) {
  const conseil = (paquet && paquet.conseil_departemental) || [];
  if (!conseil.length) return null;
  const mesCantons = (fiche && fiche.canton) || [];
  const duCanton = mesCantons.length ? conseil.filter(e => mesCantons.includes(e.canton)) : [];
  const cantonNom = duCanton.length ? ((paquet.cantons || {})[duCanton[0].canton] || null) : null;
  return { tete: duCanton.length ? duCanton[0] : conseil[0], duCanton, cantonNom, taille: conseil.length };
}

/* LES ELUS DU CANTON, TOUS — 07/10/2026. Mesure : chaque canton elit un BINOME
   (loi du 17 mai 2013), et sur 1 262 communes de la beta, plus de 1 200 ont deux
   conseillers departementaux. La chaine n'en nommait qu'un (`tete`), le premier
   dans l'ordre de la source : choisir un elu sur deux, sans le dire, n'est pas
   neutre. Desormais :
     - commune reliee a un canton : TOUS les elus de ses cantons, dans l'ordre
       de la source, au meme rang ;
     - plusieurs cantons (grandes communes) : leur nombre et celui des cantons,
       les noms restant dans `personnes` ;
     - pas de lien de canton : le premier du conseil, comme avant (en pratique
       le president), avec sa fonction.
   La source ne porte qu'un elu pour un canton ? On nomme celui-la, sans en
   inventer un second. */
export function elusDepartement(paquet, fiche) {
  const td = teteDepartement(paquet, fiche);
  if (!td) return null;
  if (!td.duCanton.length) {
    return { elus: [td.tete], parCanton: false, nbCantons: 0, cantonNom: null,
      nom: td.tete.nom, role: td.tete.fonction || "Conseil départemental" };
  }
  const elus = td.duCanton;
  const nbCantons = new Set(elus.map(e => e.canton)).size;
  if (elus.length === 1) {
    return { elus, parCanton: true, nbCantons, cantonNom: td.cantonNom, nom: elus[0].nom,
      role: `${elus[0].fonction || "Conseil départemental"}${td.cantonNom ? " · canton de " + td.cantonNom : ""}` };
  }
  if (nbCantons === 1) {
    return { elus, parCanton: true, nbCantons, cantonNom: td.cantonNom, nom: listeFr(elus.map(e => e.nom)),
      role: `Vos ${elus.length} conseillers départementaux${td.cantonNom ? " · canton de " + td.cantonNom : ""}` };
  }
  return { elus, parCanton: true, nbCantons, cantonNom: null, nom: `${elus.length} conseillers départementaux`,
    role: `Élus sur les ${nbCantons} cantons de la commune` };
}

/* « A », « A et B », « A, B et C ». */
export function listeFr(noms) {
  const l = (noms || []).filter(Boolean);
  if (l.length <= 1) return l[0] || "";
  return l.slice(0, -1).join(", ") + " et " + l[l.length - 1];
}

/* La chaine des echelons, de la commune a l'Assemblee. Un niveau sans
   personne nommee par la source garde sa place et le dit (invariant 5). */
export function chaineDecision({ fiche, paquet, index, deputes, elusRegion, dep }) {
  if (!fiche) return [];
  const depIndex = index && Array.isArray(index.departements) ? index.departements.find(x => x.code === dep) : null;
  const circos = Array.isArray(fiche.circo) ? fiche.circo : (fiche.circo == null ? [] : [fiche.circo]);
  const dd = deputes && deputes.deputes ? circos.map(c => ({ circo: c, d: deputes.deputes[dep + "-" + c] })) : [];
  const ed = elusDepartement(paquet, fiche);
  const region = elusRegion && Array.isArray(elusRegion.elus) && elusRegion.elus.length ? elusRegion.elus[0] : null;
  return [
    { echelon: "ville", niveau: "Commune", institution: "Conseil municipal", lieu: fiche.nom,
      personne: fiche.maire && fiche.maire.nom ? { nom: fiche.maire.nom, role: "Maire" } : null,
      decide: COMPETENCES.ville },
    { echelon: "agglo", niveau: "Intercommunalité", institution: fiche.agglo && fiche.agglo.nom ? fiche.agglo.nom : "Intercommunalité",
      lieu: null,
      personne: null,
      delegues: fiche.agglo && Array.isArray(fiche.agglo.delegues) ? fiche.agglo.delegues.length : 0,
      ...(() => { const ci = competencesIntercommunalite({ agglo: fiche.agglo, regionCode: depIndex && depIndex.region_code, dep });
        return { decide: ci.decide, precisions: ci.precisions, sources: ci.sources }; })() },
    { echelon: "dept", niveau: "Département", institution: "Conseil départemental", lieu: depIndex ? depIndex.nom : null,
      personne: ed ? { nom: ed.nom, role: ed.role } : null,
      personnes: ed ? ed.elus.map(e => ({ nom: e.nom, role: e.fonction || "Conseil départemental" })) : [],
      decide: COMPETENCES.dept },
    { echelon: "region", niveau: "Région", institution: "Conseil régional", lieu: depIndex ? depIndex.region : null,
      personne: region ? { nom: region.nom, role: region.fonction } : null,
      decide: COMPETENCES.region },
    { echelon: "france", niveau: "Assemblée nationale", institution: "Assemblée nationale",
      lieu: circos.length ? circos.map(c => `${c === 1 ? "1re" : c + "e"} circonscription`).join(", ") : null,
      personne: dd.length && dd[0].d ? { nom: [dd[0].d.prenom, dd[0].d.nom].filter(Boolean).join(" "), role: "À l'Assemblée nationale pour votre circonscription" } : null,
      autresCircos: dd.length > 1 ? dd.length - 1 : 0,
      decide: COMPETENCES.france },
  ];
}

/* --- la fraicheur ---------------------------------------------------------- */

/* La date de publication des fichiers, lue dans l'index, jamais l'horloge du
   telephone. */
export function datePublication(index) {
  const g = index && (index.genere_le || index.build);
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(String(g || ""));
  return m ? m[1] : null;
}

/* --- les grands nombres, lisibles d'un coup d'oeil (spike du 30/09/2026) ---- */

/* « 121,3 M€ », « 726 800 € ». Arrondi dit par `arrondi: true` : l'ecran
   l'annonce (le lecteur d'ecran lit la valeur exacte). */
export function montantCourt(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const a = Math.abs(n);
  if (a >= 1e9) return { texte: (n / 1e9).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " Md€", arrondi: true };
  if (a >= 1e6) return { texte: (n / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " M€", arrondi: true };
  return { texte: Math.round(n).toLocaleString("fr-FR") + " €", arrondi: false };
}

/* Une part en mots, pour la phrase humaine. N'arrondit jamais au-dela de 3
   points de la VRAIE fraction (un tiers = 33,33) : 47 % -> « près de la
   moitié », 30 % -> rien (3,33 points d'un tiers). partReperee rend null hors
   des reperes : la phrase passe alors aux euros (« Pour 100 €, 30 € … »), la
   forme retenue le 16/09 ; partEnMots garde le pourcentage exact. */
const REPERES_PART = [
  [25, "un quart", "près d'un quart", "un peu plus d'un quart"],
  [100 / 3, "un tiers", "près d'un tiers", "un peu plus d'un tiers"],
  [50, "la moitié", "près de la moitié", "un peu plus de la moitié"],
  [200 / 3, "deux tiers", "près des deux tiers", "un peu plus des deux tiers"],
  [75, "trois quarts", "près des trois quarts", "un peu plus des trois quarts"],
  [100, "la totalité", "près de la totalité", null],
];
export function partReperee(pct) {
  if (typeof pct !== "number" || pct < 0 || pct > 100) return null;
  for (const [v, exact, presDe, plus] of REPERES_PART) {
    if (Math.abs(pct - v) < 0.5) return exact;
    if (pct < v && v - pct <= 3) return presDe;
    if (pct > v && pct - v <= 3 && plus) return plus;
  }
  return null;
}
export function partEnMots(pct) {
  if (typeof pct !== "number" || pct < 0 || pct > 100) return null;
  return partReperee(pct) || pct + " %";
}

/* Les montants PAR HABITANT publies par l'OFGL (deuxieme colonne de chaque
   agregat) : une donnee officielle, pas un calcul de Repere. */
export function parHabitant(ex) {
  const h = i => { const x = valeur(ex, i); return x && typeof x.hab === "number" ? x.hab : null; };
  return { recettes: h(0), depenses: h(1), dette: h(2), investissement: h(3), salaires: h(4), impots: h(5) };
}

/* LES DELEGUES D'UNE COMMUNE A SON INTERCOMMUNALITE, SANS EN DISTINGUER UN AU
 * HASARD — 08/10/2026. Le site affichait le PREMIER delegue en grand et repliait
 * les autres. La source les range par fonction (presidence, vice-presidences,
 * puis conseillers : extract-html.js, rangFonction) ; mais dans 4 656 communes le
 * premier n'est qu'un conseiller communautaire parmi d'autres, distingue par
 * l'ordre du fichier. Meme defaut que le binome du canton (#84).
 * Regle :
 *   - jusqu'a REPLI_DELEGUES delegues : tous visibles, au meme rang ;
 *   - au-dela (Marseille en envoie 100) : restent visibles ceux qui ont une
 *     FONCTION ecrite par la source (president, vice-president...) ; TOUS les
 *     conseillers sont dans un repli qui dit leur nombre. Aucun n'est choisi.
 * L'ordre est celui de l'extraction (par fonction, puis celui du RNE), et l'ecran
 * le dit : c'est Repere qui range par fonction, pas la source. */
export const REPLI_DELEGUES = 8;
const CONSEILLER = /^conseill[eè]re? communautaire$/i;
export function delegationIntercommunalite(delegues) {
  const tous = Array.isArray(delegues) ? delegues : [];
  if (tous.length <= REPLI_DELEGUES) return { visibles: tous, replies: [], total: tous.length };
  const visibles = tous.filter(e => e.fonction && !CONSEILLER.test(e.fonction.trim()));
  const replies = tous.filter(e => !visibles.includes(e));
  return { visibles, replies, total: tous.length };
}
