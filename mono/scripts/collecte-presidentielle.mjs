/* COLLECTE DE LA PRÉSIDENTIELLE 2027 — ébauche du 09/11/2026.
 *
 * AUJOURD'HUI : aucune source n'est branchée. Le script relit les quatre fichiers versionnés de
 * data/presidentielle-2027/ (tenus à la main, validés par le porteur), les contrôle avec la règle
 * de @repere/core (lirePresidentielle) et les recopie dans les données publiées. Une entrée mal
 * formée, ou sans l'adresse de sa source, fait ÉCHOUER le script : on ne publie pas un fichier
 * dont une partie serait silencieusement écartée.
 *
 * PLUS TARD (à décider avec le porteur, skill ingerer-une-source) :
 *   - candidats : la liste arrêtée par le Conseil constitutionnel (publiée au Journal officiel) ;
 *   - débats : les annonces des chaînes ou de l'Arcom ;
 *   - réunions publiques : les sites de campagne. Aucune de ces sources n'a encore de format relu.
 *
 * Usage : node scripts/collecte-presidentielle.mjs <dossier de sortie> [dossier source]
 * Aucun réseau. */
import fs from "node:fs";
import path from "node:path";
import { lirePresidentielle } from "../packages/core/src/presidentielle.js";

export const FICHIERS = ["candidats", "debats", "meetings", "meta"];

export function controler(dossierSource) {
  const brut = {};
  for (const f of FICHIERS) {
    const p = path.join(dossierSource, f + ".json");
    if (!fs.existsSync(p)) throw new Error(`fichier absent : ${p}`);
    brut[f] = JSON.parse(fs.readFileSync(p, "utf8"));
  }
  const lu = lirePresidentielle(brut);
  for (const f of ["candidats", "debats", "meetings"]) if (!lu.lus[f]) throw new Error(`${f}.json ne porte pas la liste « ${f} »`);
  if (!lu.meta) throw new Error("meta.json : lastUpdate (AAAA-MM-JJ) et source (producteur, url https) sont obligatoires");
  if (lu.ecartes > 0) throw new Error(`${lu.ecartes} entrée(s) mal formée(s) ou sans source : rien n'est publié`);
  return { brut, lu };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const sortie = process.argv[2];
  const source = process.argv[3] || path.resolve(import.meta.dirname, "../../data/presidentielle-2027");
  if (!sortie) { console.error("usage : node scripts/collecte-presidentielle.mjs <dossier de sortie> [dossier source]"); process.exit(2); }
  const { brut, lu } = controler(source);
  const cible = path.join(sortie, "presidentielle-2027");
  fs.mkdirSync(cible, { recursive: true });
  for (const f of FICHIERS) fs.writeFileSync(path.join(cible, f + ".json"), JSON.stringify(brut[f]));
  console.log(`présidentielle 2027 : ${lu.candidats.length} candidat(s), ${lu.debats.length} débat(s), ${lu.meetings.length} réunion(s), vérifié le ${lu.meta.lastUpdate}`);
}
