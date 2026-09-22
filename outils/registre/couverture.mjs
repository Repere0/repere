#!/usr/bin/env node
/* MESURE DE COUVERTURE TERRITORIALE — pose le 22/09/2026.
 *
 * OBJECTIF 3 DE LA MISSION : mesurer reellement la couverture IDF, jamais la
 * supposer. Ce script ne re-derive AUCUNE donnee : il relit ce que
 * mono/scripts/extract-html.js a deja produit dans mono/data/, exactement
 * comme le fait l'application. Une mesure de couverture qui recalculerait
 * ses propres chiffres a cote du produit pourrait un jour diverger du
 * produit reel — la lecon de lib/faits.js et lib/comptes.jsx, redite une
 * fois de plus.
 *
 * LA REFERENCE DES COMMUNES EST mono/data/communes-beta.json : c'est deja le
 * fichier que l'application charge pour la recherche par commune. Aucun
 * deuxieme referentiel n'est introduit. Identifiant utilise : le code INSEE,
 * jamais un rapprochement par nom (objectif 3 : "jamais de rapprochement
 * approximatif sur le seul nom si un identifiant officiel existe").
 *
 * Usage : node outils/registre/couverture.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, "..", "..");
const DONNEES = path.join(RACINE, "mono", "data");
const SORTIE = path.join(RACINE, "data", "couverture_territoriale.json");

function lireJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/* Les trois sources qui portent un code INSEE et sont deja extraites
   localement. `champ` dit comment reconnaitre une commune COUVERTE — pas
   seulement presente dans le fichier, mais porteuse d'une valeur exploitable. */
const SOURCES_TERRITORIALES = [
  { id: "rne", couvre: c => !!(c && c.maire && c.maire.nom) },
  { id: "circos_ministere", couvre: c => c && c.circo !== null && c.circo !== undefined },
  { id: "ofgl_comptes", couvre: c => !!(c && c.comptes && Object.keys(c.comptes).length > 0) },
];

export function mesurer(dossierDonnees) {
  const beta = lireJSON(path.join(dossierDonnees, "communes-beta.json"));
  const departements = beta.departements;
  const attendues = new Map(Object.entries(beta.communes)); // insee -> nom officiel

  const parSource = {};
  for (const s of SOURCES_TERRITORIALES) {
    parSource[s.id] = { attendues: attendues.size, trouvees: 0, absentes: [], inconnues: [] };
  }

  const inseeVus = new Set();
  for (const dep of departements) {
    const chemin = path.join(dossierDonnees, "departments", dep + ".json");
    if (!fs.existsSync(chemin)) {
      for (const s of SOURCES_TERRITORIALES) {
        parSource[s.id].absentes.push(...[...attendues.keys()].filter(i => i.startsWith(dep)));
      }
      continue;
    }
    const paquet = lireJSON(chemin);
    for (const [insee, commune] of Object.entries(paquet.communes || {})) {
      inseeVus.add(insee);
      if (!attendues.has(insee)) {
        for (const s of SOURCES_TERRITORIALES) parSource[s.id].inconnues.push(insee);
        continue;
      }
      for (const s of SOURCES_TERRITORIALES) {
        if (s.couvre(commune)) parSource[s.id].trouvees++;
        else parSource[s.id].absentes.push(insee);
      }
    }
  }
  // Communes attendues jamais rencontrees dans aucun fichier departemental.
  for (const insee of attendues.keys()) {
    if (!inseeVus.has(insee)) {
      for (const s of SOURCES_TERRITORIALES) {
        if (!parSource[s.id].absentes.includes(insee)) parSource[s.id].absentes.push(insee);
      }
    }
  }

  /* HOMONYMES : deux communes attendues qui partagent le meme libelle officiel.
     Detection explicite demandee par l'objectif 3 — jamais laissee implicite. */
  const parNom = new Map();
  for (const [insee, nom] of attendues) {
    if (!parNom.has(nom)) parNom.set(nom, []);
    parNom.get(nom).push(insee);
  }
  const homonymes = [...parNom.entries()].filter(([, liste]) => liste.length > 1)
    .map(([nom, liste]) => ({ nom, insee: liste }));

  const resultat = {
    genere_le: new Date().toISOString(),
    reference: "mono/data/communes-beta.json",
    departements,
    communes_attendues: attendues.size,
    homonymes,
    sources: {},
  };
  for (const s of SOURCES_TERRITORIALES) {
    const p = parSource[s.id];
    const doublons = p.absentes.length + p.trouvees > attendues.size
      ? p.absentes.length + p.trouvees - attendues.size : 0;
    resultat.sources[s.id] = {
      attendues: p.attendues,
      trouvees: p.trouvees,
      absentes: p.absentes.length,
      absentes_liste: p.absentes.slice(0, 20),
      inconnues: [...new Set(p.inconnues)],
      taux_couverture: Math.round((p.trouvees / p.attendues) * 1000) / 10,
    };
  }
  return resultat;
}

function main() {
  const resultat = mesurer(DONNEES);
  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  fs.writeFileSync(SORTIE, JSON.stringify(resultat, null, 1));

  console.log("communes attendues (reference IDF) : " + resultat.communes_attendues);
  if (resultat.homonymes.length) {
    console.log("homonymes detectes : " + resultat.homonymes.map(h => h.nom).join(", "));
  }
  for (const [id, m] of Object.entries(resultat.sources)) {
    console.log(id.padEnd(20) + m.trouvees + "/" + m.attendues + " (" + m.taux_couverture + "%)"
      + (m.inconnues.length ? " — " + m.inconnues.length + " code(s) INSEE inconnu(s)" : ""));
  }
  console.log("\nrapport ecrit : " + path.relative(RACINE, SORTIE));
}

/* Ne s'execute que lance directement (`node couverture.mjs`), jamais quand
   les tests importent `mesurer` — mono/tests/ n'a pas ce garde parce que ses
   scripts n'exportent rien ; celui-ci le doit. */
if (path.resolve(process.argv[1] || "") === path.resolve(fileURLToPath(import.meta.url))) {
  main();
}
