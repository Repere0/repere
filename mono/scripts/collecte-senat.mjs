#!/usr/bin/env node
/* LES SENATEURS (13/11/2026, decision du porteur : « l'onglet L'Assemblee devient Le Parlement »).
 *
 * Usage : node scripts/collecte-senat.mjs <dossier de sortie>
 *
 * FORME DE LA SOURCE (echantillon du runner, 13/11/2026, HTTP 200, 405 262 caracteres) :
 *   https://www.senat.fr/api-senat/senateurs.json -> un tableau de 348 objets
 *   { "matricule":"19591F", "nom":"Iacovelli", "prenom":"Xavier", "civilite":"M.", "serie":"1",
 *     "siege":1, "url":"/senateur/...html", "urlAvatar":"/senimg/..._carre.jpg",
 *     "organismes":[{ "code":"COM-SOCI", "type":"COMMISSION", "libelle":"...", "ordre":7003 }, ...],
 *     "groupe":{ "code":"LREM", "libelle":"Groupe ...", "libelleCourt":"RDPI", "ordre":6 } }
 *
 * CE QUI EST REPRIS : le nom, le groupe, le siege, la commission permanente, l'adresse de la fiche
 * officielle. RIEN D'AUTRE.
 *   - urlAvatar est LU ET JETE : les photos de Repere sont celles de Wikimedia Commons sous licence
 *     libre, avec leur credit (D27, ADR 0004 et 0008). Jamais celles d'une assemblee.
 *   - aucune donnee de presence ou d'absence, aucun patrimoine (invariant 8) : la source n'en porte
 *     pas, et rien ici n'en derive.
 *   - aucun tri par taille de groupe (invariant 3) : les groupes sortent dans l'ordre alphabetique de
 *     leur sigle, et le nombre de sieges est un fait affiche a cote, pas un rang.
 *
 * LA LICENCE N'EST PAS DEVINEE. Elle est relevee sur la page d'open data du Senat a chaque collecte
 * (LICENCES ci-dessous) ; si aucune mention n'y est trouvee, le script sort en erreur et n'ecrit rien,
 * plutot que de publier un chiffre sans sa licence (invariant 4). Une collecte bruyante vaut mieux
 * qu'une provenance inventee.
 *
 * REFUSER PLUTOT QU'ECRASER (skill ingerer-une-source) : sous SENATEURS_MIN senateurs, ou si moins de
 * PART_GROUPES d'entre eux portent un groupe, rien n'est ecrit ; le fichier de la veille reste.
 *
 * NON VERIFIE SUR LA SOURCE REELLE DANS LA SESSION QUI L'A ECRIT : le conteneur ne joint pas
 * senat.fr. Le lecteur est eprouve sur un extrait recopie de l'echantillon (tests/senat.test.mjs). */
import fs from "node:fs";
import path from "node:path";

export const SOURCE = "https://www.senat.fr/api-senat/senateurs.json";
/* La page de licence du Senat. La page des senateurs, elle, ne nomme PAS la licence : elle renvoie ici
   (verifie le 13/11/2026, apres un premier passage du runner qui a refuse de publier, comme prevu). */
export const PAGE_LICENCE = "https://data.senat.fr/licence/";
export const SENATEURS_MIN = 300;
export const PART_GROUPES = 0.95;

/* Les licences ouvertes que le Senat peut declarer. La premiere trouvee sur la page est retenue,
   telle qu'elle est ecrite. On ne connait pas la licence tant qu'on ne l'a pas lue. */
export const LICENCES = [
  { motif: /ETALAB[- ]Licence[- ]Ouverte[- ]v2\.0/i, nom: "Licence Ouverte 2.0" },
  { motif: /licence\s+ouverte[^<.,;]{0,20}(?:2\.0|v2)/i, nom: "Licence Ouverte 2.0" },
  { motif: /licence\s+ouverte/i, nom: "Licence Ouverte" },
  { motif: /\bODbL\b/i, nom: "ODbL" },
  { motif: /open\s+database\s+licen[cs]e/i, nom: "ODbL" },
  { motif: /\bCC[- ]?BY(?:[- ]?SA)?\b/i, nom: "Creative Commons BY" },
];

/* On cherche dans le texte VISIBLE et dans le HTML brut : le Senat nomme sa licence dans le nom du
   fichier qu'il met en lien (« ETALAB-Licence-Ouverte-v2.0 »), donc dans un attribut. Les motifs sont
   essayes du plus precis au plus vague : une page qui dit « v2.0 » ne sort pas « Licence Ouverte » tout court. */
export function licenceDeLaPage(html) {
  const brut = String(html || "");
  const texte = brut.replace(/<[^>]*>/g, " ");
  for (const l of LICENCES) if (l.motif.test(texte) || l.motif.test(brut)) return l.nom;
  return null;
}

const nettoyer = v => (typeof v === "string" ? v.trim() : "");
const absolu = u => (nettoyer(u).startsWith("http") ? nettoyer(u) : nettoyer(u) ? "https://www.senat.fr" + nettoyer(u) : undefined);

/* Un senateur de la source -> ce que Repere publie, ou null si l'entree n'est pas exploitable. */
export function senateurPublie(brut) {
  const id = nettoyer(brut && brut.matricule);
  const nom = nettoyer(brut && brut.nom), prenom = nettoyer(brut && brut.prenom);
  if (!id || !nom) return null;
  const g = (brut && brut.groupe) || {};
  const commission = ((brut && brut.organismes) || []).find(o => o && o.type === "COMMISSION");
  const s = { id, nom, prenom, groupe: nettoyer(g.libelleCourt) || nettoyer(g.code) || "" };
  const civilite = nettoyer(brut.civilite); if (civilite) s.civilite = civilite;
  const siege = Number(brut && brut.siege); if (Number.isFinite(siege) && siege > 0) s.siege = siege;
  const libelle = nettoyer(g.libelle); if (libelle) s.groupeLibelle = libelle;
  if (commission && nettoyer(commission.libelle)) s.commission = nettoyer(commission.libelle);
  const fiche = absolu(brut && brut.url); if (fiche) s.fiche = fiche;
  return s;
}

/* Les groupes, dans l'ordre alphabetique du sigle, « sans groupe » au bout (invariant 3 : aucun tri
   par taille). Le nombre de sieges est un fait, pas un rang. */
export function groupesDuSenat(senateurs, sansGroupe = "Non inscrit ou sans groupe publié") {
  const par = new Map();
  for (const s of senateurs) {
    const sigle = s.groupe || sansGroupe;
    const g = par.get(sigle) || { sigle, sieges: 0, libelle: s.groupe ? s.groupeLibelle : undefined };
    g.sieges++;
    if (!g.libelle && s.groupeLibelle) g.libelle = s.groupeLibelle;
    par.set(sigle, g);
  }
  return [...par.values()].sort((a, b) =>
    (a.sigle === sansGroupe) - (b.sigle === sansGroupe) || a.sigle.localeCompare(b.sigle, "fr"));
}

async function json(url) {
  const r = await fetch(url, { headers: { "user-agent": "Repere/1.0 (application civique ; contact via le depot)" } });
  if (!r.ok) throw new Error(`${url} : HTTP ${r.status}`);
  return r.json();
}

export async function collecter(sortie, { brut, pageLicence } = {}) {
  const liste = brut !== undefined ? brut : await json(SOURCE);
  if (!Array.isArray(liste)) throw new Error("senateurs : la source n'est plus un tableau ; rien n'est ecrit");
  const senateurs = liste.map(senateurPublie).filter(Boolean).sort((a, b) => a.nom.localeCompare(b.nom, "fr") || a.prenom.localeCompare(b.prenom, "fr"));
  if (senateurs.length < SENATEURS_MIN) throw new Error(`senateurs : ${senateurs.length} lus, moins de ${SENATEURS_MIN} ; rien n'est ecrit`);
  const avecGroupe = senateurs.filter(s => s.groupe).length;
  if (avecGroupe / senateurs.length < PART_GROUPES) throw new Error(`senateurs : ${avecGroupe}/${senateurs.length} avec un groupe (moins de ${Math.round(PART_GROUPES * 100)} %) ; rien n'est ecrit`);
  const html = pageLicence !== undefined ? pageLicence : await (await fetch(PAGE_LICENCE, { headers: { "user-agent": "Repere/1.0" } })).text().catch(() => "");
  const licence = licenceDeLaPage(html);
  if (!licence) throw new Error(`senateurs : aucune licence lisible sur ${PAGE_LICENCE} ; rien n'est ecrit (invariant 4 : pas de chiffre sans sa licence)`);
  const fichier = {
    v: 1,
    genere_le: new Date().toISOString().slice(0, 10),
    source: { producteur: "Sénat", licence, url: SOURCE },
    groupes: groupesDuSenat(senateurs),
    senateurs,
  };
  if (sortie) {
    fs.mkdirSync(sortie, { recursive: true });
    fs.writeFileSync(path.join(sortie, "senateurs.json"), JSON.stringify(fichier) + "\n");
  }
  return fichier;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const f = await collecter(process.argv[2] || "./data");
  console.log(`senateurs.json : ${f.senateurs.length} senateurs, ${f.groupes.length} groupes (source ${f.source.producteur}, ${f.source.licence})`);
}
