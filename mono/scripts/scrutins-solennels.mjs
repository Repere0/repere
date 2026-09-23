/* SCRUTINS SOLENNELS — les votes qui comptent, sur toute la legislature.
 *
 * MESURE AVANT DE CODER, PAS SUPPOSE. L'archive complete (8434 scrutins,
 * data/brut_Scrutins, mesuree le 23/09/2026 sur le depot reel) contient
 * TROIS categories, pas deux : 8339 "scrutin public ordinaire" (des
 * amendements et sous-amendements, pour la plupart), 72 "scrutin public
 * solennel" (l'adoption ou le rejet formel d'un texte entier), et 23
 * "motion de censure" (l'existence meme du gouvernement). Ensemble : 95
 * scrutins sur 8434, soit 1,1 % de l'archive - PAS 10 % comme un premier
 * echantillon de 80 scrutins recents (une seule semaine tres active) le
 * suggerait a tort. C'est exactement pour cette raison que la mesure se
 * fait sur l'archive complete, jamais sur un echantillon recent.
 *
 * POURQUOI PAS LE MECANISME "80 DERNIERS" DE scrutins_an.py. Ce script est
 * INDEPENDANT, pas une modification de scrutins_an.py (deja prouve, deja en
 * production) : une fenetre glissante n'a pas de sens ici, puisque le but
 * est de garder TOUS les scrutins solennels DEPUIS LE DEBUT de la
 * legislature, pas seulement les plus recents. Melanger les deux logiques
 * dans un seul script aurait rendu l'un ou l'autre plus fragile a tester.
 *
 * CE QUE CE FICHIER NE FAIT PAS ENCORE, DELIBEREMENT : aucune position par
 * depute (qui a vote pour/contre) - seulement les chiffres agreges
 * (pour/contre/abstentions) deja publics et deja denominalises a la
 * source. Relier chaque scrutin solennel a la position de VOTRE depute
 * demande de reutiliser la table d'acteurs deja construite pour les 80
 * scrutins ordinaires (mono/scripts/scrutins.json) - une extension
 * naturelle, mais une decision de portee separee, pas empilee ici.
 *
 * Usage : node scripts/scrutins-solennels.mjs [./data] [chemin vers data/brut_Scrutins]
 */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const ENTREE = process.argv[3] || "../data/brut_Scrutins";
const TYPES_RETENUS = new Set(["scrutin public solennel", "motion de censure"]);
const URL_SCRUTINS = "https://data.assemblee-nationale.fr/travaux-parlementaires/votes";

function fichiersJson(dir) {
  let res = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) res = res.concat(fichiersJson(p));
    else if (e.name.endsWith(".json")) res.push(p);
  }
  return res;
}

function principal() {
  if (!fs.existsSync(ENTREE)) {
    console.warn(`::warning::${ENTREE} absent - les scrutins solennels ne seront pas publies`);
    return;
  }
  const fichiers = fichiersJson(ENTREE);
  const retenus = [];
  let totalSource = 0;
  for (const f of fichiers) {
    let d;
    try { d = JSON.parse(fs.readFileSync(f, "utf8")).scrutin; }
    catch { continue; }
    if (!d || !d.dateScrutin) continue;
    totalSource++;
    const type = d.typeVote && d.typeVote.libelleTypeVote;
    if (!TYPES_RETENUS.has(type)) continue;
    const dec = (d.syntheseVote && d.syntheseVote.decompte) || {};
    retenus.push({
      numero: d.numero || null,
      date: (d.dateScrutin || "").slice(0, 10),
      titre: d.titre || d.objet?.libelle || "",
      type,
      sort: (d.sort && d.sort.libelle) || "",
      pour: dec.pour != null ? Number(dec.pour) : null,
      contre: dec.contre != null ? Number(dec.contre) : null,
      abstentions: dec.abstentions != null ? Number(dec.abstentions) : null,
    });
  }
  retenus.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.numero || "").localeCompare(b.numero || "", "fr", { numeric: true })));

  const paquet = {
    v: 1,
    source: {
      producteur: "Assemblée nationale",
      producteur_affiche: "Assemblée nationale — scrutins publics",
      licence: "Licence Ouverte 2.0",
      url: URL_SCRUTINS,
      portee: "scrutins publics solennels et motions de censure, depuis le début de la 17e législature",
      releve_le: new Date().toISOString().slice(0, 10),
    },
    total_source: totalSource,
    scrutins: retenus,
  };
  fs.mkdirSync(SORTIE, { recursive: true });
  fs.writeFileSync(path.join(SORTIE, "scrutins-solennels.json"), JSON.stringify(paquet));
  const parType = {};
  for (const r of retenus) parType[r.type] = (parType[r.type] || 0) + 1;
  console.log(`scrutins-solennels.json : ${retenus.length} retenu(s) sur ${totalSource} scrutins publics`
    + " (" + Object.entries(parType).map(([t, n]) => n + " " + t).join(", ") + ")");
  if (retenus.length) console.log(`  du ${retenus[0].date} au ${retenus[retenus.length - 1].date}`);
}

principal();
