/* SOURCES PARLEMENTAIRES : LES ETATS D'UN RELEVE, SANS RESEAU — 07/10/2026.
 *
 * Les epreuves de PR dependaient du site du Senat pour verifier... ce que fait
 * Repere quand le site du Senat tombe. On simule ici chaque reponse : flux
 * valide, panne reseau, 404, 500, page HTML en 200, flux tronque — sur un
 * runner neuf (aucun fichier precedent) et sur un dossier qui en a un.
 *
 * Ce que ces controles verrouillent :
 *   - un echec n'ecrit RIEN et ne fabrique aucun agenda ;
 *   - il dit vrai sur ce qui existe : un releve precedent date, ou aucun ;
 *   - un 404 n'est pas relance, une panne passagere l'est (borne) ;
 *   - une reponse 200 qui n'est pas un flux iCalendar est refusee.
 * L'independance Senat / Assemblee a l'ecran est mesuree dans runtime.test.mjs. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { releverSenat, phrasePrecedent } from "../scripts/calendrier-senat.mjs";

const ICS = [
  "BEGIN:VCALENDAR", "VERSION:2.0",
  "BEGIN:VEVENT", "UID:a", "SUMMARY:Séance publique", "DTSTART;TZID=Europe/Paris:20261008T143000",
  "CATEGORIES:Séance publique", "END:VEVENT",
  "BEGIN:VEVENT", "UID:b", "DTSTART;TZID=Europe/Paris:20261009T090000", "END:VEVENT",
  "END:VCALENDAR", "",
].join("\r\n");

const reponse = (status, corps = "") => ({ ok: status >= 200 && status < 300, status, text: async () => corps });
const dossierNeuf = () => fs.mkdtempSync(path.join(os.tmpdir(), "repere-senat-"));
const fichier = d => path.join(d, "calendrier-senat.json");
/* Un faux reseau qui rejoue une suite de reponses et compte les appels. */
function reseau(...suite) {
  const f = async () => {
    f.appels++;
    const r = suite[Math.min(f.appels - 1, suite.length - 1)];
    if (r instanceof Error) throw r;
    return r;
  };
  f.appels = 0;
  return f;
}
const sansAttente = { dormir: async () => {}, aujourdhui: "2026-10-07" };
const avecPrecedent = () => {
  const d = dossierNeuf();
  fs.writeFileSync(fichier(d), JSON.stringify({ v: 1, source: { producteur: "Sénat", releve_le: "2026-10-05" }, evenements: [{ titre: "x", debut: "2026-10-06T10:00:00" }] }));
  return d;
};

test("runner neuf + source OK : le flux est releve, date du jour, evenement incomplet rejete", async () => {
  const d = dossierNeuf();
  const r = await releverSenat({ fetchImpl: reseau(reponse(200, ICS)), sortie: d, ...sansAttente });
  assert.equal(r.etat, "servi");
  const j = JSON.parse(fs.readFileSync(fichier(d), "utf8"));
  assert.equal(j.source.releve_le, "2026-10-07");
  assert.equal(j.source.producteur, "Sénat");
  assert.equal(j.source.licence, "non précisée par le Sénat", "la licence non confirmee n'est pas devinee");
  assert.equal(j.evenements.length, 1, "l'evenement sans titre est rejete, pas complete");
  assert.equal(r.rejetes.length, 1);
});

test("runner neuf + source indisponible : aucun fichier ecrit, et l'absence de releve precedent est dite", async () => {
  const d = dossierNeuf();
  const net = reseau(new Error("ECONNRESET"));
  const r = await releverSenat({ fetchImpl: net, sortie: d, ...sansAttente });
  assert.equal(r.etat, "echec");
  assert.equal(net.appels, 3, "une panne reseau est relancee, dans une limite fixe");
  assert.equal(fs.existsSync(fichier(d)), false, "aucun agenda fabrique");
  assert.equal(r.precedent, null);
  assert.match(phrasePrecedent(r.precedent), /aucun releve precedent/);
  assert.doesNotMatch(phrasePrecedent(r.precedent), /hier|conserve/, "ne pretend pas qu'un releve d'hier existe");
});

test("source 404 : introuvable, pas relance", async () => {
  const d = dossierNeuf();
  const net = reseau(reponse(404, "Not Found"));
  const r = await releverSenat({ fetchImpl: net, sortie: d, ...sansAttente });
  assert.equal(r.etat, "introuvable");
  assert.equal(net.appels, 1);
  assert.equal(fs.existsSync(fichier(d)), false);
});

test("source HTTP 500 : echec relance, puis reussite a la deuxieme tentative", async () => {
  const d = dossierNeuf();
  const net = reseau(reponse(500), reponse(200, ICS));
  const r = await releverSenat({ fetchImpl: net, sortie: d, ...sansAttente });
  assert.equal(r.etat, "servi");
  assert.equal(net.appels, 2);
  assert.match(r.essais[0], /echec \(HTTP 500\)/);
});

test("source HTTP 500 persistante : echec nomme, rien ecrit", async () => {
  const d = dossierNeuf();
  const r = await releverSenat({ fetchImpl: reseau(reponse(503)), sortie: d, ...sansAttente });
  assert.equal(r.etat, "echec");
  assert.equal(r.cause, "HTTP 503");
  assert.equal(fs.existsSync(fichier(d)), false);
});

test("source repond 200 mais en HTML : invalide, jamais range comme un flux", async () => {
  const d = dossierNeuf();
  const r = await releverSenat({ fetchImpl: reseau(reponse(200, "<!DOCTYPE html><html><body>Maintenance</body></html>")), sortie: d, ...sansAttente });
  assert.equal(r.etat, "invalide");
  assert.match(r.cause, /pas un flux iCalendar/);
  assert.equal(fs.existsSync(fichier(d)), false);
});

test("flux tronque (sans END:VCALENDAR) : invalide", async () => {
  const d = dossierNeuf();
  const r = await releverSenat({ fetchImpl: reseau(reponse(200, ICS.slice(0, 80))), sortie: d, ...sansAttente });
  assert.equal(r.etat, "invalide");
  assert.equal(fs.existsSync(fichier(d)), false);
});

test("ancienne donnee reellement disponible + source KO : conservee intacte, avec SA date, pas celle du jour", async () => {
  const d = avecPrecedent();
  const avant = fs.readFileSync(fichier(d), "utf8");
  const r = await releverSenat({ fetchImpl: reseau(new Error("ETIMEDOUT")), sortie: d, ...sansAttente });
  assert.equal(r.etat, "echec");
  assert.equal(fs.readFileSync(fichier(d), "utf8"), avant, "le fichier precedent n'est ni touche ni re-date");
  assert.deepEqual(r.precedent, { releve_le: "2026-10-05", n: 1 });
  assert.match(phrasePrecedent(r.precedent), /2026-10-05/);
  assert.match(phrasePrecedent(r.precedent), /pas presente comme celui du jour/);
});

test("fichier precedent illisible + source KO : il n'est pas reutilise comme valide", async () => {
  const d = dossierNeuf();
  fs.writeFileSync(fichier(d), "<html>");
  const r = await releverSenat({ fetchImpl: reseau(reponse(404)), sortie: d, ...sansAttente });
  assert.equal(r.precedent.illisible, true);
  assert.match(phrasePrecedent(r.precedent), /illisible/);
});

test("le releve ne compose aucune adresse a partir d'un code de commune", () => {
  const src = fs.readFileSync(new URL("../scripts/calendrier-senat.mjs", import.meta.url), "utf8");
  const adresses = src.match(/https?:\/\/[^\s"'`]+/g) || [];
  assert.ok(adresses.every(u => /senat\.fr/.test(u)), adresses.join(" "));
  assert.ok(!/insee|commune/i.test(adresses.join(" ")));
});

/* LA SEMAINE AU PARLEMENT — 07/10/2026 (@repere/core, semaineParlement). */
test("semaine — sept jours, seances publiques comptees, votes solennels lus mot pour mot", async () => {
  const { semaineParlement } = await import("../packages/core/src/index.js");
  const ev = (debut, titre, description = null, categorie = "Séance publique") => ({ debut, titre, description, categorie });
  const agendaAN = { source: { producteur: "Assemblée nationale" }, evenements: [
    ev("2026-10-06T15:00", "Hier, hors fenêtre"),
    ev("2026-10-07T14:00", "Questions au Gouvernement"),
    ev("2026-10-07T10:00", "Audition", null, "Commission des lois"),
    ev("2026-10-13T15:00", "Questions au Gouvernement", "Également à l'ordre du jour : Vote solennel sur la proposition de loi X ; Débat sur la dette"),
    ev("2026-10-14T15:00", "Vote solennel sur le projet de loi Y, hors fenêtre"),
  ] };
  const m = new Date("2026-10-07T06:00:00Z");
  const r = semaineParlement({ agendaAN, cal: null, maintenant: m });
  assert.equal(r.jours.length, 7);
  assert.deepEqual(r.jours.map(j => j.date), ["2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13"]);
  assert.equal(r.jours[0].seances, 1, "une audition de commission n'est pas une seance publique");
  assert.equal(r.total, 2);
  assert.deepEqual(r.votesSolennels.map(v => v.texte), ["Vote solennel sur la proposition de loi X"], "mot pour mot, et seulement dans la fenetre");
  assert.deepEqual(r.institutions.map(x => x.institution), ["Assemblée nationale"], "le Senat absent n'est pas compte comme lu");
  // un vote solennel en titre de seance est retenu aussi
  const r2 = semaineParlement({ agendaAN: { evenements: [ev("2026-10-08T15:00", "Vote solennel sur la proposition de loi Z")] }, cal: null, maintenant: m });
  assert.equal(r2.votesSolennels.length, 1);
  // aucune institution lue : aucune semaine pretendue
  const vide = semaineParlement({ agendaAN: null, cal: null, maintenant: m });
  assert.equal(vide.institutions.length, 0);
  assert.equal(vide.total, 0);
  // le jour suit l'heure de Paris : 23 h 30 UTC le 6 = deja le 7 a Paris
  assert.equal(semaineParlement({ agendaAN, cal: null, maintenant: new Date("2026-10-06T23:30:00Z") }).jours[0].date, "2026-10-07");
  // les deux institutions se cumulent par jour, chacune comptee a part
  const cal = { evenements: [ev("2026-10-07T16:30", "Séance du Sénat")] };
  const r3 = semaineParlement({ agendaAN, cal, maintenant: m });
  assert.equal(r3.jours[0].seances, 2);
  assert.deepEqual(r3.jours[0].parInstitution, { "Assemblée nationale": 1, "Sénat": 1 });
});
