#!/usr/bin/env node
/* VERIFICATEUR DE SANTE DES SOURCES — pose le 22/09/2026.
 *
 * POURQUOI EN NODE ET PAS EN PYTHON, ALORS QUE outils/ EST PYTHON PARTOUT
 * AILLEURS. Ce poste de developpement n'a AUCUN Python installe (verifie :
 * `python`, `python3`, `py` sont tous absents, en Bash comme en PowerShell).
 * Une regle du projet compte plus que la convention de langage : « ne jamais
 * ecrire un controle qu'on n'a pas vu tirer ». Un script Python ecrit ici
 * serait invisible jusqu'au premier run sur le runner GitHub — exactement le
 * defaut que ce chantier est charge de detecter chez les AUTRES sources. Node
 * est deja present (ubuntu-latest l'embarque, comme le documente collecte.yml)
 * et c'est ce que ce poste peut executer et VERIFIER reellement, tout de suite.
 *
 * CE QUE CE SCRIPT FAIT : pour chaque source du registre qui porte une URL,
 * une requete HEAD (repli sur GET si HEAD echoue ou n'est pas supporte),
 * lecture de Last-Modified/ETag/Content-Length quand le serveur les rend, et
 * comparaison avec ce que le registre CROIT savoir. Il ne telecharge jamais
 * un fichier entier : la sonde ne doit pas couter plus que l'information
 * qu'elle rapporte (objectif 7 de la mission : ne pas telecharger a l'aveugle).
 *
 * CE QUE CE SCRIPT NE FAIT PAS : il ne modifie jamais sources.json. Un
 * controle qui reecrit ses propres hypotheses en meme temps qu'il les teste
 * ne prouve plus rien — voir CLAUDE.md, "une garde qui trebuche sur son
 * propre commentaire", meme famille de piege. Le rapport est un fichier a
 * part (data/journal_sante_sources.json), relisible, jamais la reference.
 *
 * Usage :
 *   node outils/registre/verifier_sources.mjs             (toutes les sources)
 *   node outils/registre/verifier_sources.mjs rne ofgl_comptes   (une liste)
 *   node outils/registre/verifier_sources.mjs --hors-ligne (relit le dernier
 *     journal sans requete reseau — pour verifier ce script sans reseau)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..", "..");
const REGISTRE = path.join(ICI, "sources.json");
const JOURNAL = path.join(RACINE, "data", "journal_sante_sources.json");
const DELAI_MS = 15000;

function chargerRegistre() {
  const brut = fs.readFileSync(REGISTRE, "utf8");
  return JSON.parse(brut);
}

/* Une reponse de quelques centaines d'octets n'est pas un jeu de donnees :
   c'est une page d'erreur deguisee. Meme heuristique que outils/collecte.py
   (seuil 10000 octets), reprise ici pour ne pas inventer une deuxieme regle. */
const SEUIL_TAILLE_SUSPECTE = 10000;

/* La cadence declaree d'une source, en jours — EXPORTEE pour que rapport.mjs
   juge la fraicheur de la DERNIERE COLLECTE REPERE avec la meme regle que
   celle-ci juge la fraicheur de la SOURCE elle-meme. Deux endroits qui
   dériveraient chacun leur propre seuil finiraient par diverger — la lecon
   deja apprise sur lib/faits.js et lib/comptes.jsx, redite ici. */
export const CADENCES_JOURS_PAR_CLE = { quotidienne: 1, annuelle: 366, figee: null };

export async function sonder(source) {
  const url = source.url_telechargement || source.url_api || source.url;
  const rec = {
    id: source.id,
    nom: source.nom,
    url_sondee: url || null,
    verifie_le: new Date().toISOString(),
    status: "NOT_COLLECTED",
    warnings: [],
    errors: [],
  };
  if (!url) {
    rec.status = "SOURCE_NOT_PUBLISHED";
    rec.errors.push("aucune URL exploitable dans le registre pour cette source");
    return rec;
  }

  let reponse;
  const debut = Date.now();
  try {
    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), DELAI_MS);
    try {
      reponse = await fetch(url, { method: "HEAD", redirect: "follow", signal: controleur.signal });
    } finally {
      clearTimeout(minuteur);
    }
    /* Certains serveurs (dont data.gouv.fr sur ses redirections de resource)
       renvoient 405/501 a HEAD alors que GET fonctionne. On ne retente PAS un
       GET complet par defaut (cout reseau) — sauf pour ce cas precis, connu. */
    if (reponse.status === 405 || reponse.status === 501) {
      rec.warnings.push("HEAD refusee (HTTP " + reponse.status + "), tentative GET");
      const controleur2 = new AbortController();
      const minuteur2 = setTimeout(() => controleur2.abort(), DELAI_MS);
      try {
        reponse = await fetch(url, { method: "GET", redirect: "follow", signal: controleur2.signal });
      } finally {
        clearTimeout(minuteur2);
      }
    }
  } catch (e) {
    rec.status = "SOURCE_UNAVAILABLE";
    rec.errors.push((e.name === "AbortError" ? "delai depasse (" + DELAI_MS + " ms)" : e.message));
    rec.secondes = Math.round((Date.now() - debut) / 10) / 100;
    return rec;
  }
  rec.secondes = Math.round((Date.now() - debut) / 10) / 100;
  rec.http = reponse.status;

  if (reponse.status >= 400) {
    rec.status = "SOURCE_UNAVAILABLE";
    rec.errors.push("HTTP " + reponse.status);
    return rec;
  }
  if (reponse.status >= 300) {
    rec.warnings.push("redirection non resolue en HTTP " + reponse.status);
  }

  const dernierModif = reponse.headers.get("last-modified");
  const etag = reponse.headers.get("etag");
  const taille = reponse.headers.get("content-length");

  rec.last_source_update = dernierModif ? new Date(dernierModif).toISOString() : null;
  rec.etag = etag || null;
  rec.taille_annoncee_octets = taille ? Number(taille) : null;

  if (taille && Number(taille) < SEUIL_TAILLE_SUSPECTE) {
    rec.status = "DATA_INVALID";
    rec.warnings.push("taille annoncee suspecte (" + taille + " octets, seuil " + SEUIL_TAILLE_SUSPECTE + ")");
  }

  /* SIGNALER UNE SOURCE QUI A BOUGE, PAS SEULEMENT UNE SOURCE EN PANNE.
     Objectif 14 de la mission. On compare a ce que sources.json CROIT savoir
     — pas a la derniere execution de ce script, pour ne pas accumuler une
     derive silencieuse ou chaque run se compare au precedent plutot qu'a la
     reference ecrite. */
  if (source.derniere_maj_connue && rec.last_source_update) {
    const connue = new Date(source.derniere_maj_connue).getTime();
    const observee = new Date(rec.last_source_update).getTime();
    if (Number.isFinite(connue) && observee > connue) {
      rec.warnings.push(
        "la source a ete mise a jour depuis la derniere verification du registre ("
        + source.derniere_maj_connue + " -> " + rec.last_source_update + ")");
    }
  }

  /* FRAICHEUR ANORMALE : la source annonce une cadence, et le dernier
     Last-Modified observe la contredit largement. Seuils volontairement
     larges (x3 la cadence annoncee) pour ne pas crier au loup sur un jour de
     retard normal — voir objectif 2, "date de MaJ anormalement ancienne". */
  const CADENCES_JOURS = CADENCES_JOURS_PAR_CLE;
  const cadenceBrute = (source.frequence_maj_annoncee || "").split(" ")[0];
  const seuilJours = CADENCES_JOURS[cadenceBrute];
  if (seuilJours && rec.last_source_update) {
    const ageJours = (Date.now() - new Date(rec.last_source_update).getTime()) / 86400000;
    if (ageJours > seuilJours * 3) {
      rec.warnings.push(
        "fraicheur anormale : source mise a jour il y a " + Math.round(ageJours)
        + " jours pour une cadence annoncee '" + source.frequence_maj_annoncee + "'");
    }
  }

  rec.status = rec.errors.length ? "SOURCE_UNAVAILABLE"
    : rec.warnings.some(w => w.startsWith("taille annoncee suspecte")) ? "DATA_INVALID"
    : "READY";
  return rec;
}

async function main() {
  const args = process.argv.slice(2);
  const horsLigne = args.includes("--hors-ligne");
  const cles = args.filter(a => !a.startsWith("--"));

  const registre = chargerRegistre();
  const sources = registre.sources.filter(s => !cles.length || cles.includes(s.id));
  if (!sources.length) {
    console.error("aucune source ne correspond a " + JSON.stringify(cles));
    process.exit(2);
  }

  let resultats;
  if (horsLigne) {
    if (!fs.existsSync(JOURNAL)) {
      console.error("--hors-ligne demande, mais aucun journal precedent a relire : " + JOURNAL);
      process.exit(2);
    }
    const precedent = JSON.parse(fs.readFileSync(JOURNAL, "utf8"));
    resultats = precedent.resultats.filter(r => !cles.length || cles.includes(r.id));
    console.log("(relecture hors ligne du journal du " + precedent.execute_le + ")");
  } else {
    resultats = [];
    for (const s of sources) {
      resultats.push(await sonder(s));
    }
  }

  for (const r of resultats) {
    const marque = r.status === "READY" ? "  ok  " : r.status === "SOURCE_UNAVAILABLE" ? " ECHEC" : " ALERTE";
    console.log(marque + " | " + r.id.padEnd(28) + r.status
      + (r.http ? " (HTTP " + r.http + ")" : "")
      + (r.secondes != null ? " " + r.secondes + "s" : ""));
    for (const w of r.warnings || []) console.log("         warning: " + w);
    for (const e of r.errors || []) console.log("         erreur : " + e);
  }

  if (!horsLigne) {
    fs.mkdirSync(path.dirname(JOURNAL), { recursive: true });
    fs.writeFileSync(JOURNAL, JSON.stringify({
      execute_le: new Date().toISOString(),
      resultats,
    }, null, 1));
    console.log("\njournal ecrit : " + path.relative(RACINE, JOURNAL));
  }

  const echecs = resultats.filter(r => r.status === "SOURCE_UNAVAILABLE").length;
  const alertes = resultats.filter(r => r.status !== "READY" && r.status !== "SOURCE_UNAVAILABLE").length;
  console.log(resultats.length + " source(s) sondee(s), " + echecs + " echec(s), " + alertes + " alerte(s).");
  process.exit(echecs ? 1 : 0);
}

if (path.resolve(process.argv[1] || "") === path.resolve(fileURLToPath(import.meta.url))) {
  main();
}
