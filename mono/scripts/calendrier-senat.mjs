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

/* LE RELEVE RESEAU EST UNE FONCTION, ET ELLE EST TESTEE SANS RESEAU — 07/10/2026.
 * Constat des epreuves #130 a #145 : le flux du Senat tombe par moments (4 runs
 * sur 16). Une seule tentative, puis un message « le releve d'hier reste »...
 * alors que mono/data/ n'est pas versionne et qu'un runner GitHub est neuf a
 * chaque fois : il n'y avait JAMAIS de releve d'hier. Le message mentait.
 *
 * Ce qui change :
 *   - quelques tentatives espacees pour une panne passagere (reseau, 5xx,
 *     page HTML a la place du flux) ; aucune pour un 404 : le fichier est
 *     introuvable, reessayer ne le fera pas apparaitre ;
 *   - quatre causes nommees, les memes mots que ETATS dans data-utils/client.js :
 *     « echec » (reseau ou serveur), « introuvable » (404), « invalide » (repond,
 *     mais pas un flux iCalendar), et « servi » ;
 *   - en cas d'echec, RIEN n'est ecrit, et le script dit ce qui existe vraiment :
 *     un releve precedent dans le dossier de sortie (avec sa date), ou aucun.
 *     Il ne fabrique jamais un agenda, ni vide ni de secours. */
export const ATTENTES_MS = [0, 15000, 45000];

function precedent(sortie) {
  const f = path.join(sortie, "calendrier-senat.json");
  if (!fs.existsSync(f)) return null;
  try {
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    if (!j || !j.source || !Array.isArray(j.evenements)) return { illisible: true };
    return { releve_le: j.source.releve_le || null, n: j.evenements.length };
  } catch { return { illisible: true }; }
}

export function phrasePrecedent(p) {
  if (!p) return "aucun releve precedent sur ce runner : le calendrier du Senat sera ABSENT de cette publication (rien n'est fabrique a sa place)";
  if (p.illisible) return "un fichier precedent existe mais est illisible : il n'est pas reutilise comme s'il etait valide";
  return `le releve precedent est conserve tel quel, date du ${p.releve_le || "(date inconnue)"} (${p.n} evenement(s)) — il n'est pas presente comme celui du jour`;
}

/* LA VRAIE CAUSE D'UN « fetch failed » — 08/10/2026. Du 06 au 08/10/2026, les
   collectes ont toutes ecrit « reseau : fetch failed » trois fois : c'est le
   message generique de fetch (undici), la cause (DNS, connexion refusee, delai,
   certificat) est dans `e.cause`, et elle n'etait jamais lue. Sans elle, le
   calendrier du Senat est absent de la production sans qu'on sache pourquoi.
   On nomme aussi Repere aupres du serveur (User-Agent) et on borne l'attente. */
export function causeReseau(e) {
  if (!e) return "inconnue";
  const base = e.name === "TimeoutError" ? "delai depasse (" + DELAI_MS / 1000 + " s)" : (e.message || String(e));
  const c = e.cause;
  if (!c) return base;
  const detail = [c.code, c.message].filter(Boolean).filter((x, i, t) => t.indexOf(x) === i).join(" : ");
  return detail ? base + " — " + detail : base;
}
const UA = "Repere/1.0 (collecte quotidienne de l'agenda public)";
const DELAI_MS = 30000;

async function uneTentative(fetchImpl, url) {
  let rep;
  try { rep = await fetchImpl(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(DELAI_MS) }); }
  catch (e) { return { etat: "echec", cause: "reseau : " + causeReseau(e), passagere: true }; }
  if (rep.status === 404 || rep.status === 410) return { etat: "introuvable", cause: "HTTP " + rep.status, passagere: false };
  if (!rep.ok) return { etat: "echec", cause: "HTTP " + rep.status, passagere: rep.status >= 500 || rep.status === 429 };
  const texte = await rep.text();
  /* UN 200 N'EST PAS UN FLUX. Une page de maintenance en HTML repond 200 ;
     on exige l'en-tete RFC 5545, pas un type MIME que les serveurs remplissent mal. */
  if (!/^\uFEFF?BEGIN:VCALENDAR/.test(texte.trimStart()) || !/END:VCALENDAR/.test(texte)) {
    const debut = texte.trimStart().slice(0, 40).replace(/\s+/g, " ");
    return { etat: "invalide", cause: "la reponse n'est pas un flux iCalendar (debut : « " + debut + " »)", passagere: true };
  }
  return { etat: "servi", texte };
}

export async function releverSenat({ fetchImpl = fetch, sortie = "./data", attentes = ATTENTES_MS,
  dormir = ms => new Promise(r => setTimeout(r, ms)), aujourdhui = new Date().toISOString().slice(0, 10) } = {}) {
  const essais = [];
  let r = null;
  for (const ms of attentes) {
    if (ms) await dormir(ms);
    r = await uneTentative(fetchImpl, URL_ICS);
    essais.push(r.etat + (r.cause ? " (" + r.cause + ")" : ""));
    if (r.etat === "servi" || !r.passagere) break;
  }
  if (r.etat !== "servi") {
    return { etat: r.etat, cause: r.cause, essais, precedent: precedent(sortie) };
  }
  const brut = parseIcs(r.texte);

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
      releve_le: aujourdhui,
    },
    evenements,
  };
  fs.mkdirSync(sortie, { recursive: true });
  fs.writeFileSync(path.join(sortie, "calendrier-senat.json"), JSON.stringify(paquet));
  return { etat: "servi", essais, evenements, rejetes };
}

async function principal() {
  const sortie = process.argv[2] || "./data";
  const r = await releverSenat({ sortie });
  if (r.etat !== "servi") {
    console.error(`::warning::calendrier du Senat non releve — ${r.etat} : ${r.cause} ; tentatives : ${r.essais.join(" | ")}`);
    console.error(`calendrier du Senat : ${phrasePrecedent(r.precedent)}`);
    process.exitCode = 1;
    return;
  }
  console.log(`calendrier-senat.json  : ${r.evenements.length} evenement(s) retenu(s)`
    + (r.rejetes.length ? `, ${r.rejetes.length} rejete(s) sans titre ou sans date` : "")
    + (r.essais.length > 1 ? ` (apres ${r.essais.length} tentatives : ${r.essais.slice(0, -1).join(" | ")})` : ""));
  if (r.evenements.length) {
    console.log(`  du ${r.evenements[0].debut} au ${r.evenements[r.evenements.length - 1].debut}`);
  }
}

/* Lance seulement en ligne de commande : importe par les tests, rien ne part au reseau. */
if (import.meta.url === `file://${process.argv[1]}`) principal();
