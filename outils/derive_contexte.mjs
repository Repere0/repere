#!/usr/bin/env node
/*
 * derive_contexte.mjs — le contexte des agents dit-il encore la verite ?
 *
 * POURQUOI (29/09/2026). Le contexte charge a chaque session (CLAUDE.md, qui
 * importait les 482 lignes de CONTEXTE_PROJET.md) avait derive sans que rien ne
 * le signale : en-tete « 26 aout » un mois apres, `outils/ofgl.py` annonce le
 * 16/09 et present sur aucune branche, onze commits restes dans un bundle. Un
 * contexte faux est pire qu'un contexte absent : l'agent le croit.
 *
 * CE QUE CE SCRIPT VERIFIE, sans reseau et sans dependance :
 *   ERREURS (code de sortie 1) :
 *     E1 CLAUDE.md depasse 120 lignes, ou importe un fichier (@chemin) ;
 *     E2 AGENTS.md n'est pas une copie exacte de CLAUDE.md ;
 *     E3 le bloc des invariants a change sans que .claude/invariants.sha256
 *        suive (un invariant ne change que sur decision du porteur, et ce
 *        changement doit se voir dans la PR) ;
 *     E4 un chemin cite dans CLAUDE.md ou une skill n'existe pas ;
 *     E5 une skill sans en-tete name/description, ou dont le nom differe du dossier.
 *   AVERTISSEMENTS (n'echouent pas) :
 *     A1 un chemin cite dans CONTEXTE_PROJET.md n'existe pas (le document garde
 *        volontairement une partie historique ; a relire, pas a corriger en aveugle) ;
 *     A2 l'en-tete « Derniere mise a jour » de CONTEXTE_PROJET.md a plus de 14 jours
 *        de retard sur le dernier commit du depot ;
 *     A3 des mesures datees de plus de 45 jours sont encore citees.
 *
 * USAGE : node outils/derive_contexte.mjs            (verifie)
 *         node outils/derive_contexte.mjs --sceller  (reecrit l'empreinte des
 *         invariants : a ne lancer QUE sur decision explicite du porteur)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (p) => readFileSync(join(RACINE, p), "utf8");
const erreurs = [];
const avertissements = [];

const MOIS = { janvier: 1, fevrier: 2, "février": 2, mars: 3, avril: 4, mai: 5, juin: 6,
  juillet: 7, aout: 8, "août": 8, septembre: 9, octobre: 10, novembre: 11,
  decembre: 12, "décembre": 12 };

/* ---------- E1 : taille et imports de CLAUDE.md ---------- */
const claude = lire("CLAUDE.md");
const nbLignes = claude.split("\n").length;
if (nbLignes > 120) erreurs.push(`E1 CLAUDE.md fait ${nbLignes} lignes (plafond 120) : deplacer le detail dans CONTEXTE_PROJET.md ou une skill`);
for (const l of claude.split("\n")) {
  if (/^\s*@\S+/.test(l)) erreurs.push(`E1 CLAUDE.md importe « ${l.trim()} » : ce fichier serait charge en entier a chaque session`);
}

/* ---------- E2 : AGENTS.md copie exacte ---------- */
if (!existsSync(join(RACINE, "AGENTS.md"))) erreurs.push("E2 AGENTS.md absent (Codex ne lit que lui)");
else if (lire("AGENTS.md") !== claude) erreurs.push("E2 AGENTS.md differe de CLAUDE.md : recopier CLAUDE.md a l'identique (cp CLAUDE.md AGENTS.md)");

/* ---------- E3 : empreinte des invariants ---------- */
const m = claude.match(/<!-- INVARIANTS:DEBUT -->([\s\S]*?)<!-- INVARIANTS:FIN -->/);
const cheminSceau = ".claude/invariants.sha256";
if (!m) erreurs.push("E3 bloc INVARIANTS:DEBUT / INVARIANTS:FIN introuvable dans CLAUDE.md");
else {
  const empreinte = createHash("sha256").update(m[1].replace(/\r\n/g, "\n").trim()).digest("hex");
  if (process.argv.includes("--sceller")) {
    writeFileSync(join(RACINE, cheminSceau), empreinte + "\n");
    console.log(`empreinte des invariants scellee : ${empreinte}`);
  } else if (!existsSync(join(RACINE, cheminSceau))) {
    erreurs.push(`E3 ${cheminSceau} absent`);
  } else if (lire(cheminSceau).trim() !== empreinte) {
    erreurs.push(`E3 les invariants de CLAUDE.md ont change sans decision scellee (attendu ${lire(cheminSceau).trim().slice(0, 12)}…, trouve ${empreinte.slice(0, 12)}…). Si le porteur l'a decide : node outils/derive_contexte.mjs --sceller, et le dire dans la PR`);
  }
}

/* ---------- E4 / A1 : chemins cites ---------- */
function cheminsCites(texte) {
  const out = new Set();
  for (const [, brut] of texte.matchAll(/`([^`\n]+)`/g)) {
    const c = brut.trim();
    if (/\s|=|:/.test(c)) continue;                      // une commande, une variable, un schema d'URL
    if (/[*<>{}|$]|NN|AAAA|\.\.\.|…/.test(c)) continue;  // un motif, pas un fichier
    if (/^(\/|~)/.test(c)) continue;                     // chemin hors depot
    if (!/\//.test(c) && !/\.(md|mjs|js|jsx|py|sh|yml|yaml|json|html|bat|txt)$/.test(c)) continue;
    out.add(c.replace(/\/$/, "").replace(/[.,;:]$/, ""));
  }
  return [...out];
}
/* Un nom nu (`decouper.py`) se cherche partout dans le depot ; les sorties de
   build, absentes d'un depot propre, ne sont pas des fichiers manquants. */
const SORTIES_ENGENDREES = ["dist", "mono/data", "mono/apps/web/dist", "site_engendre"];
let fichiersSuivis = [];
try { fichiersSuivis = execSync("git ls-files", { cwd: RACINE, maxBuffer: 64e6 }).toString().split("\n"); } catch { /* hors git */ }
const nomsSuivis = new Set(fichiersSuivis.map(f => f.split("/").pop()));
const existe = (c) => SORTIES_ENGENDREES.includes(c)
  || existsSync(join(RACINE, c)) || existsSync(join(RACINE, "mono", c))
  || (!c.includes("/") && nomsSuivis.has(c));

const skillsDir = join(RACINE, ".claude", "skills");
const skills = existsSync(skillsDir) ? readdirSync(skillsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name) : [];
const aVerifierStrict = [["CLAUDE.md", claude], ...skills.map(s => [`.claude/skills/${s}/SKILL.md`, lire(`.claude/skills/${s}/SKILL.md`)])];
for (const [f, t] of aVerifierStrict) {
  for (const c of cheminsCites(t)) if (!existe(c)) erreurs.push(`E4 ${f} cite \`${c}\`, introuvable dans le depot`);
}
const contexte = existsSync(join(RACINE, "CONTEXTE_PROJET.md")) ? lire("CONTEXTE_PROJET.md") : "";
const absentsContexte = cheminsCites(contexte).filter(c => !existe(c));
if (absentsContexte.length) avertissements.push(`A1 CONTEXTE_PROJET.md cite ${absentsContexte.length} chemin(s) introuvable(s) : ${absentsContexte.map(c => "`" + c + "`").join(", ")}`);

/* ---------- E5 : en-tete des skills ---------- */
if (!skills.length) erreurs.push("E5 aucune skill dans .claude/skills/");
for (const s of skills) {
  const t = lire(`.claude/skills/${s}/SKILL.md`);
  const fm = t.match(/^---\n([\s\S]*?)\n---/);
  const nom = fm && fm[1].match(/^name:\s*(.+)$/m);
  const desc = fm && fm[1].match(/^description:\s*(.+)$/m);
  if (!fm || !nom || !desc) erreurs.push(`E5 .claude/skills/${s}/SKILL.md : en-tete name/description manquant`);
  else if (nom[1].trim() !== s) erreurs.push(`E5 .claude/skills/${s}/SKILL.md : name « ${nom[1].trim()} » differe du dossier « ${s} »`);
}

/* ---------- A2 / A3 : dates ---------- */
function dateFr(j, mois, a) {
  const n = MOIS[mois.toLowerCase()];
  return n ? new Date(Date.UTC(+a, n - 1, +j)) : null;
}
let dernierCommit = null;
try { dernierCommit = new Date(execSync("git log -1 --format=%cI", { cwd: RACINE }).toString().trim()); } catch { /* hors depot git */ }
const entete = contexte.match(/Dernière mise à jour :\*\*\s*(\d{1,2})(?:er)?\s+(\p{L}+)\s+(\d{4})/u);
if (entete && dernierCommit) {
  const d = dateFr(entete[1], entete[2], entete[3]);
  const retard = d && Math.floor((dernierCommit - d) / 864e5);
  if (retard > 14) avertissements.push(`A2 CONTEXTE_PROJET.md dit « Derniere mise a jour : ${entete[1]} ${entete[2]} ${entete[3]} », ${retard} jours avant le dernier commit du depot`);
}
const reference = dernierCommit || new Date();
const vieilles = [];
contexte.split("\n").forEach((l, i) => {
  for (const x of l.matchAll(/mesur\p{L}*\s+le\s+(\d{1,2})(?:er)?\s+(\p{L}+)\s+(\d{4})/gu)) {
    const d = dateFr(x[1], x[2], x[3]);
    if (d && (reference - d) / 864e5 > 45) vieilles.push(`l.${i + 1} (${x[1]} ${x[2]})`);
  }
});
if (vieilles.length) avertissements.push(`A3 CONTEXTE_PROJET.md cite ${vieilles.length} mesure(s) de plus de 45 jours : ${vieilles.join(", ")} — a remesurer ou a marquer comme historiques`);

/* ---------- sortie ---------- */
console.log("== derive du contexte des agents ==");
for (const e of erreurs) console.log("ERREUR  " + e);
for (const a of avertissements) console.log("attention " + a);
if (!erreurs.length && !avertissements.length) console.log("rien a signaler");
console.log(`bilan : ${erreurs.length} erreur(s), ${avertissements.length} avertissement(s)`);
process.exit(erreurs.length ? 1 : 0);
