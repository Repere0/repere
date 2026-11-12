#!/usr/bin/env node
/* ALERTE DE COLLECTE — 12/11/2026 (decision du porteur : « deux jours de suite = une issue »).
 *
 * LE TROU FERME ICI. La chaine (outils/pipeline.sh) a des etapes NON BLOQUANTES : elles avertissent et
 * la collecte reste verte. Du 10 au 12/11/2026, la presidentielle n'a jamais ete publiee et personne ne
 * l'a su. L'issue « etat de la collecte quotidienne » (outils/sante_publique.sh) ne dit que l'etat de la
 * publication, et changer son titre n'envoie aucun courriel.
 *
 * CE QUE FAIT CE SCRIPT, deux modes :
 *   --etapes <fichier des avertissements>   (apres la chaine, AVANT le commit)
 *       met a jour data/etat_collecte.json : pour chaque avertissement, depuis quand et combien de JOURS
 *       de suite. Une etape qui n'avertit plus disparait de l'etat. A partir de SEUIL jours : alerte.
 *   --run <succes|echec> <url du run>       (a la fin du job)
 *       un run en echec dont le run precedent sur main, un autre jour, a aussi echoue : alerte.
 *       (Un run en echec ne committe rien : son etat ne peut pas vivre dans le depot, on le lit par l'API.)
 * L'ALERTE est UNE issue GitHub, ouverte (donc notifiee par courriel au proprietaire, a qui elle est
 * assignee), mise a jour sans bruit les jours suivants, commentee et fermee au retour a la normale.
 * Issue plutot que webhook : aucun secret neuf, aucun service tiers, visible depuis un telephone.
 *
 * Aucune dependance : node et gh, deja sur le runner. GH_TOKEN et GITHUB_REPOSITORY dans l'environnement. */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

export const SEUIL = 2;
export const TITRE = "[ALERTE] collecte : en échec depuis au moins 2 jours";
const FICHIER_ETAT = "data/etat_collecte.json";

/* La cle d'une etape est son message, sans les parties qui changent d'un jour a l'autre (nombres, dates). */
export const cle = message => String(message).replace(/\d+/g, "N").replace(/\s+/g, " ").trim().slice(0, 160);

/* REGLE PURE (testee dans mono/tests/alerte-collecte.test.mjs).
   precedent : { etapes: { [cle]: { message, depuis, vu_le, jours } } } ; avertissements : string[] ; jour : AAAA-MM-JJ.
   Deux runs le meme jour ne comptent qu'un jour. Un jour sans run (panne de GitHub) ne remet pas a zero. */
export function calculer(precedent, avertissements, jour) {
  const avant = (precedent && precedent.etapes) || {};
  const etapes = {};
  for (const message of avertissements) {
    const k = cle(message);
    if (!k || etapes[k]) continue;
    const a = avant[k];
    etapes[k] = a
      ? { message, depuis: a.depuis, vu_le: jour, jours: a.vu_le === jour ? a.jours : a.jours + 1 }
      : { message, depuis: jour, vu_le: jour, jours: 1 };
  }
  const alertes = Object.values(etapes).filter(e => e.jours >= SEUIL);
  return { etat: { v: 1, maj: jour, etapes }, alertes };
}

export function corps(alertes, urlRun, jour) {
  return [
    `Relevé du ${jour}. Ces étapes de la collecte échouent depuis au moins ${SEUIL} jours. La collecte reste verte, mais ce qu'elles produisent n'est plus publié ou plus rafraîchi.`,
    "",
    ...alertes.map(e => `- **${e.jours} jours** (depuis le ${e.depuis}) : ${e.message}`),
    "",
    `Dernier run : ${urlRun || "inconnu"}`,
    "",
    "Cette issue se ferme seule quand tout est rétabli. Outil : `outils/alerte_collecte.mjs`.",
  ].join("\n");
}

const gh = (...args) => execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
function issueOuverte() {
  const n = gh("issue", "list", "--state", "open", "--search", `in:title "${TITRE}"`, "--json", "number,title", "--jq", `[.[] | select(.title == "${TITRE}")][0].number // empty`);
  return n || null;
}
function publier(alertes, urlRun, jour) {
  const texte = corps(alertes, urlRun, jour);
  const n = issueOuverte();
  if (alertes.length && !n) {
    const proprio = (process.env.GITHUB_REPOSITORY || "").split("/")[0];
    try { gh("issue", "create", "--title", TITRE, "--body", texte, "--assignee", proprio); }
    catch { gh("issue", "create", "--title", TITRE, "--body", texte); }   /* proprietaire non assignable : l'issue s'ouvre quand meme */
    console.log(`::error title=Alerte de collecte::${alertes.length} étape(s) en échec depuis au moins ${SEUIL} jours : issue ouverte.`);
  } else if (alertes.length) {
    gh("issue", "edit", n, "--body", texte);
    console.log(`::warning::alerte de collecte toujours ouverte (issue #${n}), ${alertes.length} étape(s).`);
  } else if (n) {
    gh("issue", "close", n, "--comment", `Rétabli le ${jour} : plus aucune étape en échec depuis ${SEUIL} jours. ${urlRun || ""}`);
    console.log(`::notice::alerte de collecte fermée (issue #${n}).`);
  }
}

function main() {
  const [mode, a, b] = process.argv.slice(2);
  const jour = new Date().toISOString().slice(0, 10);
  const urlRun = process.env.URL_RUN || "";
  if (mode === "--etapes") {
    const lignes = fs.existsSync(a) ? fs.readFileSync(a, "utf8").split("\n").map(l => l.trim()).filter(Boolean) : [];
    let precedent = null;
    try { precedent = JSON.parse(fs.readFileSync(FICHIER_ETAT, "utf8")); } catch { /* premier passage */ }
    const { etat, alertes } = calculer(precedent, lignes, jour);
    fs.writeFileSync(FICHIER_ETAT, JSON.stringify(etat, null, 1) + "\n");
    console.log(`alerte de collecte : ${lignes.length} avertissement(s) aujourd'hui, ${alertes.length} depuis au moins ${SEUIL} jours`);
    publier(alertes, urlRun, jour);
  } else if (mode === "--run") {
    if (a !== "echec") return;
    /* Le run precedent TERMINE sur main (le run en cours n'est pas « completed »). */
    const prec = JSON.parse(gh("run", "list", "--workflow", "collecte.yml", "--branch", "main", "--status", "completed", "--limit", "1", "--json", "conclusion,createdAt,url"))[0];
    if (!prec || prec.conclusion !== "failure" || prec.createdAt.slice(0, 10) === jour) {
      console.log("alerte de collecte : run en échec, mais pas deux jours de suite");
      return;
    }
    publier([{ message: `la collecte entière a échoué (run précédent en échec : ${prec.url})`, depuis: prec.createdAt.slice(0, 10), jours: SEUIL }], b || urlRun, jour);
  } else {
    console.error("usage : alerte_collecte.mjs --etapes <fichier> | --run <succes|echec> <url>");
    process.exit(2);
  }
}
if (import.meta.url === `file://${process.argv[1]}`) main();
