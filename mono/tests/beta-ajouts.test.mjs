/* TROIS AJOUTS DE LA BETA (13/10/2026) : le courriel de signalement, l'export
 * d'une seance vers l'agenda du telephone (.ics), et la regle de conversion
 * d'heure qui le sous-tend.
 *
 * POURQUOI CES CONTROLES. Un export .ics qui decale d'une heure, ou qui invente
 * une heure de fin, dit faux a la personne qui le met dans son agenda. Ces
 * controles tournent sans reseau et sans navigateur ; le rendu sur telephone
 * reste a verifier a la main (voir la PR). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { heureParisVersUtc, icsSeance, nomFichierIcs } from "../packages/core/src/agenda-ics.js";
import { courrielSignalement, CONTACT_REPERE } from "../packages/core/src/signalement.js";

/* Lit les parametres d'une URL mailto, decodes. */
const parametres = url => Object.fromEntries(
  url.split("?")[1].split("&").map(p => {
    const i = p.indexOf("=");
    return [p.slice(0, i), decodeURIComponent(p.slice(i + 1).replace(/\+/g, " "))];
  }),
);

/* Le contenu d'un .ics, lignes depliees (RFC 5545 : une ligne qui commence par un espace continue la precedente). */
const deplie = ics => ics.replace(/\r\n[ \t]/g, "").split("\r\n").filter(Boolean);

test("signalement : un courriel au contact du projet, qui nomme la source et son lien", () => {
  const u = courrielSignalement({ producteur: "Assemblée nationale", url: "https://www.assemblee-nationale.fr/dyn/17/agenda", maj: "2026-10-13" });
  assert.ok(u.startsWith("mailto:" + CONTACT_REPERE + "?"), "le destinataire est le contact du projet");
  const p = parametres(u);
  assert.match(p.subject, /Repère/);
  assert.match(p.body, /Assemblée nationale/);
  assert.match(p.body, /https:\/\/www\.assemblee-nationale\.fr\/dyn\/17\/agenda/);
  assert.match(p.body, /Ce que je vois/);
});

test("signalement : sans lien ni date, le courriel reste utilisable et n'ecrit ni undefined ni null", () => {
  const p = parametres(courrielSignalement({ producteur: "OFGL" }));
  assert.match(p.body, /OFGL/);
  assert.doesNotMatch(p.body, /undefined|null/);
});

test("signalement : aucune adresse personnelle ni code de commune dans le courriel", () => {
  const u = courrielSignalement({ producteur: "Sénat", url: "https://www.senat.fr/agenda.html", releve: "2026-10-13" });
  assert.equal(CONTACT_REPERE, "repere0@protonmail.com");
  assert.equal(u.split("?")[0], "mailto:" + CONTACT_REPERE, "seul le contact du projet est destinataire");
  assert.doesNotMatch(u, /gmail|77284/);
});

test("heure de Paris : +2 en ete, +1 en hiver, et les deux passages d'heure de 2026", () => {
  assert.equal(heureParisVersUtc("2026-10-13T15:00"), "20261013T130000Z", "en ete (+2)");
  assert.equal(heureParisVersUtc("2026-01-13T15:00"), "20260113T140000Z", "en hiver (+1)");
  assert.equal(heureParisVersUtc("2026-03-29T03:00"), "20260329T010000Z", "apres le passage a l'heure d'ete du 29 mars");
  assert.equal(heureParisVersUtc("2026-03-29T01:30"), "20260329T003000Z", "avant le passage a l'heure d'ete du 29 mars");
  assert.equal(heureParisVersUtc("2026-10-25T12:00"), "20261025T110000Z", "apres le retour a l'heure d'hiver du 25 octobre");
});

const groupe = {
  jour: "2026-10-13", institution: "Assemblée nationale", titre: "Questions au Gouvernement, séance du jour",
  debut: "2026-10-13T15:00", debuts: ["2026-10-13T15:00", "2026-10-13T21:30"], fins: [null, "2026-10-13T23:00"],
  categorie: "Séance publique", lieu: "Salle Lamartine", points: ["Débat sur la dette"], textesLibres: [],
  source: { producteur: "Assemblée nationale", url: "https://www.assemblee-nationale.fr/dyn/17/agenda", releve_le: "2026-10-13" },
};
const maintenant = new Date("2026-10-13T08:00:00Z");

test("agenda : une seance par heure de debut, sans fin inventee", () => {
  const ics = icsSeance(groupe, maintenant);
  const lignes = deplie(ics);
  assert.equal(lignes[0], "BEGIN:VCALENDAR");
  assert.equal(lignes[lignes.length - 1], "END:VCALENDAR");
  const evenements = [];
  let ouvert = null;
  for (const l of lignes) {
    if (l === "BEGIN:VEVENT") ouvert = [];
    else if (l === "END:VEVENT") { evenements.push(ouvert); ouvert = null; }
    else if (ouvert) ouvert.push(l);
  }
  assert.equal(evenements.length, 2, "deux seances, deux evenements");
  assert.ok(evenements[0].includes("DTSTART:20261013T130000Z"), "debut heure de Paris -> UTC");
  assert.ok(!evenements[0].some(l => l.startsWith("DTEND")), "pas de fin publiee : pas de DTEND");
  assert.ok(evenements[1].includes("DTEND:20261013T210000Z"), "fin publiee : DTEND convertie");
});

test("agenda : fins de ligne CRLF partout, et chaque ligne tient en 75 octets", () => {
  const ics = icsSeance(groupe, maintenant);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n"));
  assert.equal(ics.replace(/\r\n/g, "").includes("\n"), false, "aucun retour seul");
  for (const l of ics.split("\r\n").filter(Boolean)) {
    assert.ok(Buffer.byteLength(l, "utf8") <= 75, `ligne trop longue : ${l.slice(0, 40)}`);
  }
});

test("agenda : virgules echappees, texte long replie sans rien perdre", () => {
  const ics = icsSeance(groupe, maintenant);
  assert.ok(deplie(ics).includes("SUMMARY:Questions au Gouvernement\\, séance du jour"), "la virgule du titre est echappee");
  const long = { ...groupe, points: ["Débat sur la dette publique et les finances locales, avec un long intitulé qui doit être replié proprement"] };
  const depli = deplie(icsSeance(long, maintenant)).join("\n");
  assert.ok(depli.includes("Débat sur la dette publique et les finances locales\\, avec un long intitulé"), "le texte replié se relit en entier");
});

test("agenda : la source et sa date sont dans la description", () => {
  const depli = deplie(icsSeance(groupe, maintenant)).join("\n");
  assert.ok(depli.includes("Source : Assemblée nationale"));
  assert.ok(depli.includes("https://www.assemblee-nationale.fr/dyn/17/agenda"));
  assert.ok(depli.includes("relevé le 13 octobre 2026"));
});

test("agenda : identifiant stable pour une meme seance, horodatage fixe pour le controle", () => {
  const a = deplie(icsSeance(groupe, maintenant)).find(l => l.startsWith("UID:"));
  const b = deplie(icsSeance(groupe, maintenant)).find(l => l.startsWith("UID:"));
  assert.equal(a, b);
  assert.ok(deplie(icsSeance(groupe, maintenant)).includes("DTSTAMP:20261013T080000Z"));
});

test("agenda : nom de fichier lisible, sans accent ni espace", () => {
  assert.equal(nomFichierIcs(groupe), "seance-2026-10-13-assemblee-nationale.ics");
});
