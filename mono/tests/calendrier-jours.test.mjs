/* GARDE : UNE CASE DE JOUR DIT VRAI (17/10/2026).
 *
 * Mesure (export web, agenda de l'Assemblee releve le 13/10, lu le 17/10) : la frise de la
 * semaine annoncait « 13 octobre, 0 élément » alors que l'agenda publie deux seances ce
 * jour-la. Cause : le compte de chaque case est fait sur les rendez-vous A VENIR ; un jour
 * passe y vaut toujours zero, et se lisait comme un jour sans seance. Second defaut, au meme
 * endroit : le mois etait ecrit en dur (« ${numero} octobre »), faux des le 1er novembre.
 *
 * Regle (etatJourCalendrier, @repere/core) : un jour passe le dit ; un jour au-dela de
 * l'agenda publie le dit ; seul un jour couvert par l'agenda et sans rendez-vous est « aucun
 * rendez-vous publié ». Les dates sont tirees du fichier lui-meme : le controle ne se perime
 * pas a la collecte suivante.
 * Lancer : node --test tests/calendrier-jours.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { etatJourCalendrier, regrouperParJour } = await import("../packages/core/src/index.js");
const agenda = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "data", "agenda-an.json"), "utf8"));
const ev = agenda.evenements;
const jours = [...new Set(ev.map(e => e.debut.slice(0, 10)))].sort();
const horizon = jours[jours.length - 1];
const decaler = (iso, n) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10); };
const compte = iso => regrouperParJour(ev.filter(e => e.debut.startsWith(iso))).length;

test("un jour passe qui avait une seance ne se dit ni vide ni « 0 »", () => {
  const passe = jours[0];
  assert.ok(compte(passe) > 0, "l'agenda n'a pas de seance le premier jour publie : cas non teste");
  const aujourdhui = decaler(passe, 4);
  /* le compte vient des rendez-vous a venir, qui excluent ce jour : 0, comme a l'ecran */
  const e = etatJourCalendrier({ iso: passe, aujourdhui, nb: 0, horizon });
  assert.equal(e.etat, "passe");
  assert.doesNotMatch(e.libelle, /\b0\b|aucun/, e.libelle);
  assert.match(e.libelle, /jour passé/, e.libelle);
  assert.match(e.phrase, /ne montre que/, e.phrase);
});

test("un jour couvert par l'agenda, sans rendez-vous, est dit vide ; un jour avec rendez-vous les compte", () => {
  const debut = jours[0];
  let vide = null;
  for (let i = 1; decaler(debut, i) < horizon; i++) if (!compte(decaler(debut, i))) { vide = decaler(debut, i); break; }
  assert.ok(vide, "aucun jour sans seance dans l'agenda publie : cas non teste");
  const e = etatJourCalendrier({ iso: vide, aujourdhui: debut, nb: 0, horizon });
  assert.equal(e.etat, "vide", `${vide}`);
  assert.match(e.libelle, /aucun rendez-vous publié/, e.libelle);
  const plein = jours.find(j => j > debut);
  const p = etatJourCalendrier({ iso: plein, aujourdhui: debut, nb: compte(plein), horizon });
  assert.equal(p.etat, "publie");
  assert.match(p.libelle, new RegExp(`${compte(plein)} rendez-vous publiés?$`), p.libelle);
});

test("un jour apres la fin de l'agenda publie n'est pas un jour vide", () => {
  const apres = decaler(horizon, 3);
  const e = etatJourCalendrier({ iso: apres, aujourdhui: jours[0], nb: 0, horizon });
  assert.equal(e.etat, "non-publie");
  assert.doesNotMatch(e.libelle, /\b0\b|aucun/, e.libelle);
  assert.match(e.phrase, /s'arrête au/, e.phrase);
  const sans = etatJourCalendrier({ iso: apres, aujourdhui: jours[0], nb: 0, horizon: "" });
  assert.equal(sans.etat, "non-publie", "sans agenda, aucun jour n'est dit vide");
});

test("le libelle porte le vrai mois, pas « octobre » en dur", () => {
  const e = etatJourCalendrier({ iso: "2026-11-03", aujourdhui: "2026-10-17", nb: 2, horizon: "2026-11-17" });
  assert.match(e.libelle, /^mardi 3 novembre, 2 rendez-vous publiés$/, e.libelle);
});
