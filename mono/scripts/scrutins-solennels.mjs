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
 * DEUX FICHIERS, PAS UN - DECISION PRISE SUR MESURE, PAS SUR HYPOTHESE
 * (23/09/2026, decision produit : couche d'exploration dans "Ce qui se
 * passe", pas un ecran isole). Mesure reelle sur les trois options :
 *   A. tout embarque a l'ouverture de l'onglet  : +29,8 Ko immediats
 *   B. tout a la demande, aucun teaser          : +0 Ko, mais invisible
 *   C. teaser (8 recents) + detail complet      : +1,3 Ko immediats
 * B est invisible : sans indice, personne ne sait que les scrutins
 * existent. A double le poids de l'onglet pour un contenu que la plupart
 * des lecteurs ne consulteront jamais. C coute 4,7 % de plus que B a
 * l'ouverture et resout sa decouvrabilite - c'est le seul qui satisfait
 * a la fois "leger au premier chargement" et "on sait que c'est la".
 * `scrutins-solennels-recents.json` (Couche 1, ~1,3 Ko, charge avec
 * l'agenda AN et le Senat a l'ouverture de l'onglet) porte les 8 plus
 * recents, titre tronque, avec DEJA le lien source (l'utilisateur ne doit
 * jamais attendre le detail complet pour verifier a la source).
 * `scrutins-solennels.json` (Couche 2, ~29,8 Ko, les 95 depuis le debut de
 * la legislature) ne se charge qu'au clic "Voir tous les scrutins
 * recents" - inchange, c'etait deja son role.
 *
 * Usage : node scripts/scrutins-solennels.mjs [./data] [chemin vers data/brut_Scrutins]
 */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const ENTREE = process.argv[3] || "../data/brut_Scrutins";
const TYPES_RETENUS = new Set(["scrutin public solennel", "motion de censure"]);
const URL_SCRUTINS = "https://data.assemblee-nationale.fr/travaux-parlementaires/votes";
/* Un lien PRECIS par scrutin (pas la page generique) - verifie reellement
   dans les brouillons editoriaux existants (data/auto/*.md), qui pointent
   tous vers ce meme format ; contrairement au lien de secours de l'agenda
   AN (voir agenda-an.mjs), celui-ci n'est pas une supposition. */
const URL_SCRUTIN_UN = "https://www.assemblee-nationale.fr/dyn/17/scrutins/";
const NB_RECENTS = 8;

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
      url: `${URL_SCRUTIN_UN}${d.numero}`,
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

  /* COUCHE 1 - le teaser, meme releve_le que le detail complet (meme
     execution, meme instant) : les deux niveaux ne peuvent jamais diverger
     en fraicheur, contrairement a deux fichiers ecrits par deux scripts a
     des moments differents. Titre tronque a 70 caracteres pour rester un
     vrai teaser, pas une deuxieme copie du detail. */
  const recents = retenus.slice(-NB_RECENTS).map(r => ({
    n: r.numero,
    d: r.date,
    t: r.titre.length > 70 ? r.titre.slice(0, 67) + "..." : r.titre,
    ty: r.type === "motion de censure" ? "censure" : "solennel",
    url: r.url,
  }));
  const paquetRecents = { v: 1, source: paquet.source, recents };
  fs.writeFileSync(path.join(SORTIE, "scrutins-solennels-recents.json"), JSON.stringify(paquetRecents));
  console.log(`scrutins-solennels-recents.json : ${recents.length} teaser(s), `
    + Buffer.byteLength(JSON.stringify(paquetRecents)) + " octets");
}

principal();
