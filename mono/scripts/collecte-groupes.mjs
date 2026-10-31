#!/usr/bin/env node
/* GROUPES POLITIQUES DES DEPUTES (V36, bloc 1, B2).
 *
 * Usage : node scripts/collecte-groupes.mjs <dossier AMO30 json> <dossier de sortie>
 *   ex. : node scripts/collecte-groupes.mjs ../data/brut_AMO30/json ./data
 *
 * Lit <dossier AMO30 json>/acteur/*.json et <dossier AMO30 json>/organe/*.json, et
 * ecrit <dossier de sortie>/deputes-groupes.json :
 *   { "PA722432": { "groupe": "EPR", "nom": "Prenom Nom" }, ... }
 * La liste des deputes vient de scripts/deputes.json (ecrit par outils/mono_donnees.py).
 *
 * LE TELECHARGEMENT N'EST PAS REFAIT ICI. outils/collecte.py telecharge l'archive AMO30
 * chaque jour (URL dans ce fichier-la) et la chaine la depile dans data/brut_AMO30/json.
 * Ce script lit ce depot. Il ne telecharge rien.
 *
 * LA REGLE. Pour chaque depute, on prend le mandat d'organe ouvert (sans dateFin) dont
 * l'organe est un groupe politique (codeType "GP"). S'il y en a plusieurs, le plus
 * recent (dateDebut). Aucun groupe trouve : "Inconnu". On ne devine jamais un groupe.
 *
 * REFUSER PLUTOT QU'ECRASER. Si moins de 90 % des deputes ont un groupe identifie, ou si
 * la lecture est vide, le script sort en erreur et n'ecrit rien : le fichier de la veille
 * reste en place.
 *
 * NON VERIFIE SUR L'ARCHIVE REELLE DANS LA SESSION QUI L'A ECRIT : la session n'a pas pu
 * telecharger AMO30 (voir BLOCAGES.md §38). Le code de type « GP » pour les groupes, et
 * les champs libelleAbrege / organeRef, sont supposes d'apres outils/agenda_an.py et
 * docs/schema_acteurs.md. Le seuil ci-dessus est ce qui protege si l'hypothese est fausse. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const INCONNU = "Inconnu";
export const SEUIL_GROUPES = 0.9;

const texte = v => (v && typeof v === "object" ? (v["#text"] ?? "") : (v ?? ""));
const liste = v => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);

/* Le libelle court du groupe ouvert le plus recent, ou null. Pur : aucun acces disque. */
export function groupeDuDepute(acteur, organes) {
  const ouverts = [];
  for (const m of liste(acteur?.mandats?.mandat)) {
    if (!m || typeof m !== "object" || texte(m.dateFin)) continue;
    const organe = organes.get(texte(m.organes?.organeRef));
    if (organe?.codeType !== "GP") continue;
    ouverts.push({ debut: texte(m.dateDebut), libelle: organe.libelle });
  }
  if (!ouverts.length) return null;
  ouverts.sort((a, b) => (a.debut < b.debut ? 1 : a.debut > b.debut ? -1 : 0));
  return ouverts[0].libelle || null;
}

/* acteurs : objets « acteur » deja lus ; organes : Map uid -> { codeType, libelle } ;
 * refs : identifiants PA des deputes a couvrir. Renvoie la table et si elle est fiable. */
export function groupesDesDeputes(acteurs, organes, refs) {
  const parUid = new Map(acteurs.map(a => [texte(a?.uid), a]));
  const sortie = {};
  let connus = 0;
  for (const ref of refs) {
    const a = parUid.get(ref);
    const ident = a?.etatCivil?.ident ?? {};
    const groupe = a ? groupeDuDepute(a, organes) : null;
    if (groupe) connus++;
    sortie[ref] = { groupe: groupe ?? INCONNU, nom: [ident.prenom, ident.nom].filter(Boolean).join(" ") };
  }
  const ok = refs.length > 0 && connus > 0 && connus / refs.length >= SEUIL_GROUPES;
  return { sortie, connus, total: refs.length, ok };
}

const lireJson = f => JSON.parse(fs.readFileSync(f, "utf8"));
const fichiers = d => fs.readdirSync(d).filter(f => f.endsWith(".json")).map(f => path.join(d, f));

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [amo, sortie = "./data"] = process.argv.slice(2);
  if (!amo) { console.error("usage : node scripts/collecte-groupes.mjs <dossier AMO30 json> <sortie>"); process.exit(2); }
  const dirActeur = path.join(amo, "acteur");
  const dirOrgane = path.join(amo, "organe");
  if (!fs.existsSync(dirActeur) || !fs.existsSync(dirOrgane)) {
    console.error(`groupes : ${dirActeur} ou ${dirOrgane} introuvable. Rien n'est ecrit.`);
    process.exit(1);
  }
  const organes = new Map();
  for (const f of fichiers(dirOrgane)) {
    const o = lireJson(f).organe ?? {};
    if (o.uid) organes.set(o.uid, { codeType: o.codeType, libelle: (o.libelleAbrege || o.libelle || "").trim() });
  }
  const acteurs = fichiers(dirActeur).map(f => lireJson(f).acteur ?? {});
  const deputesFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "deputes.json");
  const refs = Object.values(lireJson(deputesFile).deputes ?? {}).map(d => d.acteurRef).filter(Boolean);
  const { sortie: table, connus, total, ok } = groupesDesDeputes(acteurs, organes, refs);
  console.log(`groupes : ${connus} deputes sur ${total} rattaches a un groupe ; ${total - connus} en « ${INCONNU} » (${organes.size} organes lus)`);
  if (!ok) {
    console.error(`groupes : lecture insuffisante (seuil ${SEUIL_GROUPES * 100} %). Le fichier de la veille reste en place.`);
    process.exit(1);
  }
  fs.mkdirSync(sortie, { recursive: true });
  fs.writeFileSync(path.join(sortie, "deputes-groupes.json"), JSON.stringify(table, null, 1) + "\n");
}
