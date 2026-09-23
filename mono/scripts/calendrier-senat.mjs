/* CALENDRIER CITOYEN — PILOTE SENAT, premiere source reelle.
 *
 * POURQUOI LE SENAT D'ABORD. Verifie le 16/09/2026 par un agent dedie puis
 * mesure a nouveau ici : senat.fr/aglae/Global/ical.ics est un vrai flux
 * iCalendar (RFC 5545), avec des evenements dates, titres et categorises
 * (« Commission », « Seance publique »). C'est le format le plus favorable
 * rencontre pour ce chantier — aucun scraping HTML fragile, un format
 * standard que le Senat documente et maintient lui-meme.
 *
 * LA LICENCE N'EST PAS ACQUISE, ET C'EST DIT PLUTOT QU'ARRONDI. Les jeux de
 * donnees du Senat sur data.gouv.fr sont tous en Licence Ouverte (fr-lo) —
 * mais ce flux ICS precis, publie directement sur senat.fr pour un usage de
 * calendrier (presse, agenda public), n'y figure pas comme jeu de donnees
 * declare. Le producteur et la date de releve sont surs ; la licence est
 * ecrite « non precisee par le Senat » jusqu'a confirmation — jamais une
 * licence devinee par analogie avec les autres jeux du meme producteur.
 *
 * CE QUI EST PUBLIE, ET CE QUI NE L'EST PAS. Seuls les champs deja publics
 * dans le flux (titre, dates, categorie, lieu, description, url generique)
 * sont repris — aucune deduction, aucun enrichissement. Un evenement dont le
 * titre ou les dates manquent est rejete, pas complete a moitie.
 *
 * Usage : node scripts/calendrier-senat.mjs [./data]
 */
import fs from "node:fs";
import path from "node:path";

const SORTIE = process.argv[2] || "./data";
const URL_ICS = "https://www.senat.fr/aglae/Global/ical.ics";

/* UN PARSEUR MINIMAL, PAS UNE DEPENDANCE DE PLUS. Le projet a deja retire
 * framer-motion pour deux proprietes CSS (voir packages/ui/src/amicro.jsx) —
 * la meme discipline s'applique ici. RFC 5545 est verbeux mais le sous-
 * ensemble dont on a besoin (VEVENT, quelques champs scalaires, le depliage
 * de ligne sur `\n ` ou `\n\t`, l'echappement `\,` `\;` `\n`) se tient en une
 * cinquantaine de lignes. */
function deplierLignes(texte) {
  return texte.replace(/\r\n/g, "\n").split("\n").reduce((lignes, ligne) => {
    if (/^[ \t]/.test(ligne) && lignes.length) lignes[lignes.length - 1] += ligne.slice(1);
    else lignes.push(ligne);
    return lignes;
  }, []);
}
function decoder(v) {
  return String(v || "")
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}
function dateIcs(v) {
  // Forme locale « 20261001T150000 » (avec TZID:Europe/Paris a cote) — pas de Z.
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})$/.exec(v || "");
  if (!m) return null;
  const [, aa, mm, jj, hh, mi, ss] = m;
  return `${aa}-${mm}-${jj}T${hh}:${mi}:${ss}`;
}
function parseIcs(texte) {
  const lignes = deplierLignes(texte);
  const evenements = [];
  let courant = null;
  for (const ligne of lignes) {
    if (ligne === "BEGIN:VEVENT") { courant = {}; continue; }
    if (ligne === "END:VEVENT") { if (courant) evenements.push(courant); courant = null; continue; }
    if (!courant) continue;
    const i = ligne.indexOf(":");
    if (i < 0) continue;
    const cle = ligne.slice(0, i).split(";")[0];
    const valeur = ligne.slice(i + 1);
    if (cle === "SUMMARY") courant.titre = decoder(valeur);
    else if (cle === "DTSTART") courant.debut = dateIcs(valeur);
    else if (cle === "DTEND") courant.fin = dateIcs(valeur);
    else if (cle === "CATEGORIES") courant.categorie = decoder(valeur);
    else if (cle === "LOCATION") courant.lieu = decoder(valeur);
    else if (cle === "DESCRIPTION") courant.description = decoder(valeur);
    else if (cle === "URL") courant.url = valeur.trim();
    else if (cle === "UID") courant.id = valeur.trim();
  }
  return evenements;
}

async function principal() {
  const reponse = await fetch(URL_ICS);
  if (!reponse.ok) {
    console.error(`::error::le flux iCal du Senat a repondu ${reponse.status}`);
    process.exitCode = 1;
    return;
  }
  const texte = await reponse.text();
  const brut = parseIcs(texte);

  /* DOCTRINE DU VIDE APPLIQUEE A LA COLLECTE : un evenement sans titre ou
   * sans date de debut n'est pas devine, il est rejete et compte. */
  const rejetes = [];
  const evenements = [];
  for (const e of brut) {
    if (!e.titre || !e.debut) { rejetes.push(e.id || "(sans identifiant)"); continue; }
    evenements.push({
      titre: e.titre,
      debut: e.debut,
      fin: e.fin || null,
      categorie: e.categorie || null,
      lieu: e.lieu || null,
      description: e.description || null,
      url: e.url || "https://www.senat.fr/agenda.html",
    });
  }
  evenements.sort((a, b) => (a.debut < b.debut ? -1 : a.debut > b.debut ? 1 : 0));

  const paquet = {
    v: 1,
    source: {
      producteur: "Sénat",
      producteur_affiche: "Sénat — agenda public (flux Aglaé)",
      licence: "non précisée par le Sénat",
      url: "https://www.senat.fr/agenda.html",
      url_flux: URL_ICS,
      releve_le: new Date().toISOString().slice(0, 10),
    },
    evenements,
  };
  fs.mkdirSync(SORTIE, { recursive: true });
  fs.writeFileSync(path.join(SORTIE, "calendrier-senat.json"), JSON.stringify(paquet));
  console.log(`calendrier-senat.json  : ${evenements.length} evenement(s) retenu(s)`
    + (rejetes.length ? `, ${rejetes.length} rejete(s) sans titre ou sans date` : ""));
  if (evenements.length) {
    console.log(`  du ${evenements[0].debut} au ${evenements[evenements.length - 1].debut}`);
  }
}

principal();
