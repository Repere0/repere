/* @repere/core — LA LECTURE D'UN SCRUTIN, SANS INTERFACE (29/09/2026).
 * Deplace depuis apps/web/src/lib/votes.jsx pour etre lu a l'identique par le
 * web et par l'application mobile. Aucun import de React, du DOM ou d'un
 * composant : ce fichier ne rend rien, il lit. `LigneVote`, qui rend, reste
 * dans l'application web. */
/* LA LECTURE D'UN SCRUTIN, ECRITE UNE SEULE FOIS.
 *
 * POURQUOI CE FICHIER EXISTE. Deux ecrans lisent les memes scrutins : « Qui
 * decide » les montre tous, « Ce qui a ete decide » les prend pour son fil
 * date. La recherche de commune avait deja ete derivee deux fois dans ce
 * produit, les deux copies avaient divergé, et « Évry » ne donnait plus aucun
 * resultat pendant des semaines (decision D-15). On ne refait pas cette
 * faute : la regle vit ici, les ecrans l'importent.
 *
 * Le banc echoue si `titreLisible` reapparait ailleurs.
 *
 * LE TRI SOLENNEL/DETAIL NE VIT PLUS ICI. Jusqu'au 17/09/2026, `estSolennel`
 * etait definie dans ce fichier et appelee par les deux ecrans pour ne garder
 * que les votes sur l'ensemble d'un texte (huit sur quatre-vingts). Le
 * BLOCKER M-2 a deplace ce filtre a l'ECRITURE (mono/scripts/extract-html.js) :
 * seuls les scrutins solennels sont desormais publies, donc plus aucun ecran
 * n'a besoin de refaire le tri — `cat.scrutins` est deja le bon sous-ensemble.
 * Le predicat `/solennel/i.test(sc.tv)` existe maintenant a un seul endroit,
 * dans extract-html.js — pas ici, parce que ce fichier de build ne peut pas
 * importer du JSX (React) sans transpilateur. */

import { dateFr } from "./format.js";

export const MOTS = { p: "Pour", c: "Contre", a: "Abstention" };
/* Deplace de QuiDecide.jsx le 28/09/2026 pour servir aussi a Aujourdhui.jsx : une seule regle d'ecriture des rangs. */
export function ordinal(n) { return n === 1 ? "1re" : n + "e"; }

/* L'INTITULE OFFICIEL, ALLEGE DE SA PROCEDURE — ET DE RIEN D'AUTRE.
 * On retire deux choses, toutes deux redondantes une fois la ligne mise en forme :
 * l'amorce « l'ensemble de la / du », et la parenthese de lecture, qui est
 * REAFFICHEE a cote de la date plutot que supprimee. Aucune reformulation, aucun
 * mot ajoute : le lien vers le scrutin officiel donne le texte integral. */
export function titreLisible(t) {
  let x = String(t || "").trim();
  x = x.replace(/^l'ensemble (?:de la|du|des|de l')\s*/i, "");
  x = x.replace(/\s*\((?:texte de la commission mixte paritaire|première lecture|nouvelle lecture|seconde délibération|lecture définitive)[^)]*\)\s*\.?\s*$/i, "");
  x = x.replace(/\.\s*$/, "");
  return x.charAt(0).toUpperCase() + x.slice(1);
}
export function procedure(t) {
  const m = /\((texte de la commission mixte paritaire|première lecture|nouvelle lecture|seconde délibération|lecture définitive)[^)]*\)\s*\.?\s*$/i.exec(String(t || ""));
  return m ? m[1].toLowerCase() : "";
}
export function decompte(d) {
  if (!d) return "";
  /* Un decompte incomplet le dit : jamais « null » ecrit a l'ecran (invariant 5). */
  const absent = v => v === null || v === undefined || String(v).trim() === "";
  if (absent(d.pour) || absent(d.contre) || absent(d.abstentions)) return "décompte non publié";
  const n = Number(d.abstentions);
  return `${d.pour} pour, ${d.contre} contre, ${d.abstentions} abstention${n > 1 ? "s" : ""}`;
}

/* LES POSITIONS SONT APPARIEES, ET L'APPARIEMENT EST VERIFIE.
 *
 * LE DEFAUT, TROUVE PAR LA RED TEAM LE 14/09/2026, ETAIT ARME ET NON DECLENCHE.
 * Les positions etaient stockees comme une CHAINE de caracteres dont le rang i
 * correspondait au rang i du catalogue. Or la decision D-12 prevoit explicitement
 * qu'un releve absent soit remplace par celui de la veille : « la chaine continue
 * avec le releve de la veille ». Le jour ou le catalogue gagne un scrutin et ou le
 * fichier des positions echoue, les deux fichiers n'auraient plus eu la meme
 * longueur, et TOUTES les positions affichees auraient glisse d'un rang —
 * « Pour » sur un texte rejete, sur un elu nomme, sans aucun signal.
 *
 * LE CORRECTIF DU 17/09/2026 (BLOCKER M-2) ELIMINE CETTE CLASSE DE DEFAUT A LA
 * RACINE : les positions sont desormais indexees par NUMERO DE SCRUTIN, jamais
 * par un rang de tableau — une position s'identifie par le scrutin qu'elle
 * concerne, elle ne peut plus glisser. La garde qui suit verifie qu'aucun
 * fichier de positions ne reference un scrutin absent du catalogue (un
 * decalage de collecte, pas un decalage de rang) et que les deux relevés
 * portent la meme date.
 *
 * Elle vit ici, et pas dans un ecran, parce que DEUX ecrans lisent ces positions.
 * Le banc echoue si une seconde definition apparait. */
export function positionsFiables(cat, pos) {
  if (!cat || !pos || !Array.isArray(cat.scrutins) || !pos.positions) return false;
  const numeros = new Set(cat.scrutins.map(sc => sc.n));
  for (const n of Object.keys(pos.positions)) {
    if (!numeros.has(n)) return false;
  }
  /* Deux dates de relevé differentes veulent dire deux collectes differentes,
     donc un alignement qui n'est plus garanti. */
  const dCat = (cat.source && cat.source.releve_le) || "";
  const dPos = pos.releve_le || "";
  if (dCat && dPos && dCat !== dPos) return false;
  return true;
}

/* La position d'un depute sur un scrutin donne — jamais un rang de tableau.
   `pos.positions` vaut { "8434": { "PA721908": "p" }, ... } : seuls les
   scrutins SOLENNELS y figurent (BLOCKER M-2). Un depute absent de la table
   d'un scrutin n'a simplement pas vote, et ce n'est jamais represente par un
   caractere de remplissage — l'absence de cle EST l'absence de position. */
export function positionSur(pos, acteurRef, scrutinN) {
  const table = pos && pos.positions && pos.positions[scrutinN];
  return table ? table[acteurRef] : undefined;
}

/* La phrase a afficher quand la garde refuse. Elle dit ce qui se passe, elle
   n'invente pas une panne, et elle renvoie a la source officielle. */
export const REFUS_APPARIEMENT = {
  titre: "Les votes ne sont pas affichés : les deux relevés de l'Assemblée ne se correspondent pas.",
  corps: "Le catalogue des scrutins et les positions des députés ont été relevés à des"
    + " dates différentes. Plutôt que d'afficher une position qui pourrait être celle"
    + " d'un autre scrutin, Repère n'affiche rien. Le reste de l'écran est complet.",
};

/* Un decompte absent n'est JAMAIS un zero (doctrine du vide). Number(null) et
   Number("") valent 0 : on teste l'absence avant toute conversion. */
export function decompteAbsent(v) {
  return v === null || v === undefined || String(v).trim() === "" || !Number.isFinite(Number(v));
}
export function nombreDecompte(v) {
  return decompteAbsent(v) ? "—" : Number(v).toLocaleString("fr-FR");
}
export function resultatDecompteCourt(dec) {
  return [
    decompteAbsent(dec.pour) ? null : `${nombreDecompte(dec.pour)} pour`,
    decompteAbsent(dec.contre) ? null : `${nombreDecompte(dec.contre)} contre`,
    decompteAbsent(dec.abstentions) ? null : `${nombreDecompte(dec.abstentions)} abstention${Number(dec.abstentions) > 1 ? "s" : ""}`,
  ].filter(Boolean).join(" · ");
}

/* DE QUOI PARLE LE TEXTE (05/11/2026). Le dossier legislatif d'un scrutin, tel que
   l'Assemblee le publie (objet.dossierLegislatif : intitule et reference), et qui a
   demande le scrutin public (demandeur.texte). Le lien est construit sur le format
   verifie le 05/11/2026 (www.assemblee-nationale.fr/dyn/17/dossiers/<reference>) et
   seulement pour une reference de la forme publiee : jamais un lien devine.
   Retourne null quand le scrutin ne porte aucun dossier (doctrine du vide : l'ecran
   dit alors une phrase vraie et renvoie au scrutin officiel). */
const REF_DOSSIER = /^DLR5L17N\d+$/;
/* Vrai si le releve a LU le dossier de ce scrutin (marqueur dq) : alors l'absence d'intitule
   est une absence dans la source. Faux : le releve ne lisait pas encore ce champ, et
   l'ecran ne doit rien affirmer. */
export const dossierReleve = sc => !!sc && sc.dq === 1;

/* LES ETAPES DU TEXTE (05/11/2026) : les actes dates du dossier legislatif, tels que
   l'Assemblee les publie (libelles recopies, aucune reformulation). [] quand le releve
   n'en porte pas : l'ecran n'affiche alors pas la section. Une etape sans date ISO ou
   sans libelle est ecartee, jamais completee. */
export function etapesDuScrutin(sc) {
  if (!sc || !Array.isArray(sc.et)) return [];
  return sc.et
    .filter(e => e && typeof e.d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.d) && typeof e.l === "string" && e.l.trim())
    .map(e => ({ date: e.d, fin: typeof e.f === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.f) && e.f > e.d ? e.f : null, libelle: e.l.trim(), lien: null }));
}
export function dossierDuScrutin(sc) {
  if (!sc || typeof sc.dl !== "string" || !sc.dl.trim()) return null;
  const ref = typeof sc.dr === "string" && REF_DOSSIER.test(sc.dr) ? sc.dr : null;
  return {
    intitule: sc.dl.trim(),
    url: ref ? `https://www.assemblee-nationale.fr/dyn/17/dossiers/${ref}` : null,
    demandeur: typeof sc.dm === "string" && sc.dm.trim() ? sc.dm.trim() : null,
  };
}

/* CE QU'IL FAUT RETENIR (07/11/2026) : une phrase ECRITE PAR UN GABARIT a partir du seul
 * decompte officiel, jamais d'un avis. Quatre cas, dans cet ordre :
 *  - aucune voix contre ni abstention : unanimite des deputes ayant pris part au vote ;
 *  - aucune voix contre, des abstentions : « sans aucune voix contre » (PAS « unanimite ») ;
 *  - aucune voix pour : « sans aucune voix pour » ;
 *  - sinon : l'ecart pour/contre, annonce comme un calcul de Repere (invariant 4).
 * Decompte incomplet : null, et l'encart n'existe pas (invariant 5). */
export function retenirDuScrutin(sc) {
  const dec = sc && sc.dec;
  if (!dec || decompteAbsent(dec.pour) || decompteAbsent(dec.contre) || decompteAbsent(dec.abstentions)) return null;
  const p = Number(dec.pour), c = Number(dec.contre), a = Number(dec.abstentions);
  if (p + c + a <= 0) return null;
  const n = v => v.toLocaleString("fr-FR");
  const sort = sc.s === "adopté" ? "Adopté" : sc.s === "rejeté" ? "Rejeté" : "Scrutin";
  const abst = `${n(a)} député${a > 1 ? "s se sont abstenus" : " s'est abstenu"}`;
  if (c === 0 && a === 0 && p > 0) return { phrase: `${sort} à l'unanimité des ${n(p)} députés ayant pris part au vote.`, calcul: false };
  if (c === 0 && p > 0) return { phrase: `${sort} sans aucune voix contre. ${abst}.`, calcul: false };
  if (p === 0 && c > 0) return { phrase: `${sort} sans aucune voix pour.${a ? " " + abst + "." : ""}`, calcul: false };
  const e = Math.abs(p - c);
  if (e === 0) return { phrase: `Autant de voix pour que de voix contre : ${n(p)} de chaque côté.`, calcul: false };
  return {
    phrase: `${sort} avec ${n(e)} voix ${p > c ? "pour" : "contre"} de plus que ${p > c ? "contre" : "pour"}.`,
    calcul: true,
  };
}

/* La ligne de metadonnees sous le titre, sans le decompte (il est affiche en grand). */
export function metaScrutin(sc) {
  const proc = procedure(sc.t);
  const sort = sc.s === "adopté" ? "Texte adopté" : sc.s === "rejeté" ? "Texte rejeté" : "Scrutin";
  return `${sort} le ${dateFr(sc.d)}${proc ? " · " + proc.charAt(0).toUpperCase() + proc.slice(1) : ""}`;
}
