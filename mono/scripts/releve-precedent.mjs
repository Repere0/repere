/* LE RELEVE PRECEDENT, QUAND UNE SOURCE NE REPOND PAS (06/10/2026).
 *
 * Mesure : la collecte du 06/10/2026 (run 37461827718) s'est arretee parce que
 * le Senat n'avait pas repondu ; RIEN n'a ete publie, ni les elus, ni les
 * comptes, ni les votes. L'avertissement disait « le releve d'hier reste » :
 * faux sur le runner, ou mono/data est refait a neuf a chaque execution.
 *
 * Ce script reprend le fichier que Repere a PUBLIE la derniere fois :
 *   - relu avant usage (forme attendue, date de releve lisible) ;
 *   - la DATE REELLE du releve est conservee (`source.releve_le`), jamais
 *     remplacee par celle du jour : l'application l'affiche au-dela de deux
 *     jours (« Calendrier relevé le … ») ;
 *   - marque `source.reutilise_le` (date du jour) et `source.reutilise: true`,
 *     pour que personne — banc, ecran, relecture — ne le prenne pour un
 *     releve du jour ;
 *   - aucune donnee n'est fabriquee : sans fichier precedent lisible, rien
 *     n'est ecrit, et le script le dit (code 2).
 * Quand la source revient, son script reecrit le fichier : la marque disparait
 * d'elle-meme.
 *
 * Usage : node scripts/releve-precedent.mjs <dossier de sortie> <nom du fichier> [url de base publiee]
 * Codes : 0 repris ; 2 aucun releve precedent lisible (rien n'est ecrit). */
import fs from "node:fs";
import path from "node:path";

const [SORTIE = "./data", NOM = "calendrier-senat.json", BASE = process.env.REPERE_PUBLIE || "https://repereapp.netlify.app/data"] = process.argv.slice(2);
const AUJOURDHUI = (process.env.REPERE_AUJOURDHUI || new Date().toISOString()).slice(0, 10);
const url = BASE.replace(/\/$/, "") + "/" + NOM + "?verif=" + Date.now();

let j;
try {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  j = await r.json();
} catch (e) {
  console.error(`::warning::${NOM} : aucun releve precedent lisible (${e.message}) — rien n'est ecrit, aucune donnee n'est inventee`);
  process.exit(2);
}
/* la forme commune des releves publies : une source datee et au moins une
   liste (evenements, scrutins, recents…) */
const releve = j && j.source ? String(j.source.releve_le || "") : "";
const aUneListe = j && typeof j === "object" && Object.values(j).some(Array.isArray);
if (!aUneListe || !/^\d{4}-\d{2}-\d{2}$/.test(releve.slice(0, 10))) {
  console.error(`::warning::${NOM} : le releve precedent n'a pas la forme attendue — rien n'est ecrit`);
  process.exit(2);
}
/* la marque d'origine du releve reutilise est conservee si elle existe deja
   (plusieurs jours de panne) : la premiere date de reutilisation n'importe pas,
   seule compte la date reelle du releve, qui ne bouge jamais ici */
j.source = { ...j.source, releve_le: releve, reutilise: true, reutilise_le: AUJOURDHUI };
fs.mkdirSync(SORTIE, { recursive: true });
fs.writeFileSync(path.join(SORTIE, NOM), JSON.stringify(j));
const age = Math.floor((Date.parse(AUJOURDHUI + "T00:00:00Z") - Date.parse(releve.slice(0, 10) + "T00:00:00Z")) / 864e5);
console.log(`::warning::${NOM} : la source n'a pas repondu ; releve publie du ${releve.slice(0, 10)} repris (${age} jour(s)), marque « reutilise »`);
