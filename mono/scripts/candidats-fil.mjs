/* CANDIDATS AU FIL EDITORIAL — DETECTER ET PREPARER, JAMAIS VALIDER (06/10/2026).
 *
 * Ce script lit ce que Repere publie deja (catalogue des scrutins solennels,
 * faits valides, agenda de l'Assemblee) et liste, pour la redaction :
 *   1. les votes sur l'ENSEMBLE d'un texte deja tenus, sans fait valide ;
 *   2. les votes solennels ANNONCES par l'agenda officiel, a preparer.
 * Il ecarte les votes de procedure (motion de rejet, prolongation de seance,
 * amendement isole) : un fait Repere dit ce qu'un texte change, pas « le vote
 * du jour ».
 *
 * CE QU'IL NE FAIT PAS : il n'ecrit aucun fait, ne pose jamais `valide: true`,
 * ne resume aucun texte. La validation est humaine (docs/PROCESSUS_EDITORIAL.md).
 * Sortie : un tableau Markdown sur la sortie standard.
 *
 * Usage : node scripts/candidats-fil.mjs <dossier de donnees ou URL /data> */
import fs from "node:fs";
import path from "node:path";
import { estVoteDeTexte, faitDuScrutin } from "../packages/core/src/index.js";

const BASE = process.argv[2] || "data";
const lire = async f => {
  if (/^https?:/.test(BASE)) { const r = await fetch(BASE.replace(/\/$/, "") + "/" + f + "?verif=" + Date.now()); return r.ok ? r.json() : null; }
  const p = path.join(BASE, f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
};

const [cat, ev, an] = await Promise.all([lire("scrutins.json"), lire("evenements.json"), lire("agenda-an.json")]);
const lignes = [];
lignes.push("## Votes tenus sur l'ensemble d'un texte, sans fait validé", "", "| scrutin | date | texte | résultat | source |", "|---|---|---|---|---|");
let n1 = 0;
for (const sc of (cat && cat.scrutins) || []) {
  if (!estVoteDeTexte(sc.t) || faitDuScrutin(ev, sc)) continue;
  n1++;
  lignes.push(`| ${sc.n} | ${sc.d} | ${String(sc.t).replace(/\|/g, "/").slice(0, 120)} | ${sc.s || "?"} | https://www.assemblee-nationale.fr/dyn/17/scrutins/${sc.n} |`);
}
if (!n1) lignes.push("| — | — | aucun : chaque vote d'ensemble du catalogue a déjà son fait validé | — | — |");
lignes.push("", "## Votes solennels annoncés par l'agenda de l'Assemblée (à préparer)", "", "| date annoncée | texte | source de l'annonce |", "|---|---|---|");
const vus = new Set();
for (const e of (an && an.evenements) || []) {
  const t = ((e.titre || "") + " ; " + (e.description || "")).replace(/\s+/g, " ");
  for (const m of t.matchAll(/Vote solennel sur ([^;.]+)/gi)) {
    const k = e.debut.slice(0, 10) + "|" + m[1].trim();
    if (vus.has(k)) continue; vus.add(k);
    lignes.push(`| ${e.debut.slice(0, 10)} | ${m[1].trim().slice(0, 120)} | ${(an.source && an.source.url) || "agenda de l'Assemblée nationale"} |`);
  }
}
if (!vus.size) lignes.push("| — | aucun vote solennel annoncé sur la période relevée | — |");
lignes.push("", `*Relevé le ${new Date().toISOString().slice(0, 10)} sur ${BASE} — ${n1} vote(s) tenu(s) sans fait, ${vus.size} vote(s) annoncé(s). Aucun fait n'est écrit ni validé par ce script.*`);
console.log(lignes.join("\n"));
