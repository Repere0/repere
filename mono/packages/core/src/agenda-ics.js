/* EXPORTER UNE SEANCE VERS L'AGENDA DU TELEPHONE (beta, 13/10/2026).
 *
 * Un fichier .ics, cree sur l'appareil puis confie a la feuille de partage : le
 * lecteur choisit son agenda. Repere ne recoit rien, ne retient rien.
 *
 * Doctrine :
 *   - l'heure vient de la source, convertie de l'heure de Paris en UTC ;
 *   - une fin publiee est recopiee, une fin absente n'est jamais devinee ;
 *   - une seance sans heure n'est pas exportee (une heure inventee serait fausse) ;
 *   - la source et sa date sont dans la description, comme sur l'ecran.
 *
 * Les dates d'agenda sont ecrites en heure de Paris SANS fuseau
 * (« 2026-10-13T15:00 »). La regle d'ete europeenne est celle de la directive
 * 2000/84/CE : l'heure d'ete court du dernier dimanche de mars, 01:00 UTC, au
 * dernier dimanche d'octobre, 01:00 UTC. */
import { dateFr } from "./format.js";

/* Dernier dimanche du mois (mois de 0 a 11), a 01:00 UTC, en millisecondes. */
function dernierDimanche(annee, mois) {
  const dernier = new Date(Date.UTC(annee, mois + 1, 0));
  return Date.UTC(annee, mois, dernier.getUTCDate() - dernier.getUTCDay(), 1);
}

/* Heure de Paris sans fuseau -> instant UTC, en millisecondes. */
function instantParis(naif) {
  const [date, heure] = String(naif).split("T");
  const [annee, mois, jour] = date.split("-").map(Number);
  const [heures, minutes] = heure.split(":").map(Number);
  const local = Date.UTC(annee, mois - 1, jour, heures, minutes);
  const ete = local - 2 * 3600e3 >= dernierDimanche(annee, 2) && local - 2 * 3600e3 < dernierDimanche(annee, 9);
  return local - (ete ? 2 : 1) * 3600e3;
}

/* Format iCalendar : 20261013T130000Z. */
const compact = ms => new Date(ms).toISOString().slice(0, 19).replace(/[-:]/g, "") + "Z";

export function heureParisVersUtc(naif) {
  return compact(instantParis(naif));
}

/* Echappement du texte iCalendar (RFC 5545, section 3.3.11). */
const echapper = s => String(s)
  .replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/* Un caractere UTF-8 : son nombre d'octets. */
const octets = c => {
  const cp = c.codePointAt(0);
  return cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4;
};

/* Repliage : pas plus de 75 octets par ligne ; la suite commence par une espace
   (qui compte pour un octet, d'ou 74 ensuite). On ne coupe jamais un caractere. */
function replier(ligne) {
  const morceaux = [];
  let courant = "";
  let compte = 0;
  let limite = 75;
  for (const c of ligne) {
    const n = octets(c);
    if (compte + n > limite) {
      morceaux.push(courant);
      courant = "";
      compte = 0;
      limite = 74;
    }
    courant += c;
    compte += n;
  }
  morceaux.push(courant);
  return morceaux.join("\r\n ");
}

const slug = s => String(s || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Nom du fichier partage : lisible, sans accent ni espace. */
export function nomFichierIcs(g) {
  return `seance-${g.jour}-${slug(g.institution) || "agenda"}.ics`;
}

/* Une seance : un evenement. Pas d'heure de debut, pas d'evenement. */
function evenement(g, i, maintenant) {
  const debut = g.debuts[i];
  if (!debut || !String(debut).includes("T")) return [];
  const fin = g.fins && g.fins[i];
  const src = g.source || {};
  const description = [
    g.categorie || null,
    g.points && g.points.length ? "Ordre du jour : " + g.points.join(" ; ") : null,
    src.producteur ? `Source : ${src.producteur}` : null,
    src.releve_le ? `relevé le ${dateFr(src.releve_le)}` : null,
    src.url ? `Lien : ${src.url}` : null,
    "Vérifiez l'horaire sur le site officiel avant de vous déplacer",
  ].filter(Boolean).join(". ");
  const lignes = [
    "BEGIN:VEVENT",
    `UID:${heureParisVersUtc(debut)}-${slug(g.institution)}-${slug(g.titre).slice(0, 40)}@repere`,
    `DTSTAMP:${compact(maintenant)}`,
    `DTSTART:${heureParisVersUtc(debut)}`,
  ];
  if (fin && String(fin) >= String(debut)) lignes.push(`DTEND:${heureParisVersUtc(fin)}`);
  lignes.push(`SUMMARY:${echapper(g.titre)}`);
  lignes.push(`DESCRIPTION:${echapper(description)}`);
  if (g.lieu) lignes.push(`LOCATION:${echapper(g.lieu)}`);
  if (src.url) lignes.push(`URL:${src.url}`);
  lignes.push("END:VEVENT");
  return lignes.map(replier);
}

/* Le fichier complet d'un groupe de seances (une ligne du calendrier). */
export function icsSeance(g, maintenant = new Date()) {
  const t = maintenant.getTime();
  const corps = g.debuts.flatMap((_, i) => evenement(g, i, t));
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Repère//Agenda citoyen//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...corps,
    "END:VCALENDAR",
  ].join("\r\n") + "\r\n";
}
