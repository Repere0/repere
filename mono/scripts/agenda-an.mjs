/* CALENDRIER CITOYEN — ASSEMBLEE NATIONALE, deuxieme institution apres le
 * Senat (17/09/2026, calendrier-senat.mjs).
 *
 * MEME MODELE PAR EVENEMENT QUE LE SENAT (titre, debut, fin, categorie, lieu,
 * description, url), MAIS PAS LA MEME MECANIQUE DE COLLECTE — et c'est
 * volontaire, pas un raccourci. Le Senat expose un flux iCal en direct,
 * recupere par un fetch reseau au moment du build. L'Assemblee, elle, est
 * DEJA collectee chaque jour par outils/agenda_an.py (etape 2 de
 * pipeline.sh) dans outils/agenda_an.json : ce script LIT ce fichier deja
 * la, il ne refait pas une collecte reseau que la chaine a deja faite.
 *
 * POURQUOI SEULEMENT LES SEANCES PLENIERES, PAS LES 6554 REUNIONS DE LA
 * SOURCE. Mesure le 23/09/2026 sur l'archive reelle : la source melange
 * 5585 reunions de commission, 779 "seances" (dont seulement 632 sont
 * l'Assemblee elle-meme en seance publique - le reste, des seances
 * d'autres organes) et 190 "initiatives". Publier les 6554 noierait l'ecran
 * dans des reunions de commission sans objet lisible ("Commission des
 * affaires sociales - reunion"). Les 632 seances plenieres, elles, portent
 * un vrai ordre du jour (`j`, un tableau de lignes) dans 630 cas sur 632
 * (99,7%) - "Suite de la discussion du projet de loi de finances pour 2027",
 * pas un intitule generique. C'est la meme coupe valeur/bruit que solennel
 * fera plus tard pour les scrutins.
 *
 * PROVENANCE, PAS DE LIEN GENERIQUE INVENTE. Le champ `c` (code de compte-
 * rendu, ex. "CRSANR5L17S2027O1N001") suggere une page precise par seance,
 * mais son URL exacte n'a pas ete verifiee depuis ce poste (reseau source
 * inaccessible ici, comme documente ailleurs dans ce depot). Plutot que
 * deviner une URL qui pourrait renvoyer une 404, ce script pointe vers la
 * page d'agenda officielle et reelle de l'Assemblee - vraie, verifiable,
 * jamais fausse. Un lien par seance, plus precis, reste a construire une
 * fois l'URL confirmee sur le runner (mesure, pas suppose).
 *
 * DOCTRINE DU VIDE : les 2 seances sur 632 sans `j` restent affichees (la
 * seance a bien lieu, a la date et l'heure connues) mais le disent
 * honnetement plutot que d'inventer un intitule.
 *
 * Usage : node scripts/agenda-an.mjs [./data] [chemin vers outils/agenda_an.json]
 */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const ENTREE = process.argv[3] || "../outils/agenda_an.json";
const URL_AGENDA = "https://www.assemblee-nationale.fr/dyn/17/agenda";

function principal() {
  if (!fs.existsSync(ENTREE)) {
    console.warn(`::warning::agenda_an.json absent (${ENTREE}) - l'agenda de l'Assemblee ne sera pas publie, celui du Senat continue`);
    return;
  }
  let source;
  try { source = JSON.parse(fs.readFileSync(ENTREE, "utf8")); }
  catch (e) { console.error("agenda_an.json illisible : " + e.message); process.exitCode = 1; return; }

  if (source.v !== 1 || !Array.isArray(source.r) || !Array.isArray(source.org)) {
    console.error("::error::agenda_an.json n'a pas la forme attendue (v/r/org) - rien de publie plutot qu'une donnee mal lue");
    process.exitCode = 1;
    return;
  }

  const idxAssemblee = source.org.findIndex(o => Array.isArray(o) && o[0] === "ASSEMBLEE");
  if (idxAssemblee < 0) {
    console.warn("::warning::aucune instance ASSEMBLEE dans la table des organes - l'agenda de l'Assemblee ne sera pas publie");
    return;
  }

  /* FILTRE SUR LA DATE, A LA COLLECTE - PAS SEULEMENT A L'AFFICHAGE.
     La source porte 632 seances, passees et futures, depuis 2024 ; publier
     les 602 deja passees pesant chacune autant que les 30 a venir (mesure :
     ~14,2 Ko pour 30, donc ~300 Ko pour 632) grossirait l'onglet d'un ordre
     de grandeur pour un usage que "Ce qui se passe PROCHAINEMENT" ne
     demande pas. Le Senat a le meme comportement, par la forme meme de son
     flux (un calendrier ICS n'expose que l'avenir) ; ici il faut le dire
     explicitement, dans la meme intention. */
  const majDate = source.maj || new Date().toISOString().slice(0, 10);
  const seances = source.r.filter(r => r.t === "seance" && r.o === idxAssemblee && r.d >= majDate);

  const evenements = seances.map(s => {
    const lignes = Array.isArray(s.j) ? s.j.filter(Boolean) : [];
    const titre = lignes.length ? lignes[0] : "Séance publique — ordre du jour non encore publié";
    const description = lignes.length > 1
      ? "Également à l'ordre du jour : " + lignes.slice(1).join(" ; ")
      : null;
    return {
      titre,
      debut: s.d,
      fin: null,
      categorie: "Séance publique",
      lieu: null,
      description,
      url: URL_AGENDA,
    };
  });
  evenements.sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : 0));

  const paquet = {
    v: 1,
    source: {
      producteur: "Assemblée nationale",
      producteur_affiche: "Assemblée nationale — agenda des séances publiques",
      licence: "Licence ouverte",
      url: URL_AGENDA,
      releve_le: source.maj || new Date().toISOString().slice(0, 10),
    },
    evenements,
  };
  fs.mkdirSync(SORTIE, { recursive: true });
  fs.writeFileSync(path.join(SORTIE, "agenda-an.json"), JSON.stringify(paquet));
  const sansOrdreJour = evenements.filter(e => !e.description && /non encore publié/.test(e.titre)).length;
  console.log(`agenda-an.json          : ${evenements.length} seance(s) pleniere(s) retenue(s)`
    + (sansOrdreJour ? `, ${sansOrdreJour} sans ordre du jour publie` : ""));
  if (evenements.length) {
    console.log(`  du ${evenements[0].debut} au ${evenements[evenements.length - 1].debut}`);
  }
}

principal();
