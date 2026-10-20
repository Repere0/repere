/* GARDE SUR LA DONNEE PUBLIEE (15/10/2026) : une commune partagee entre plusieurs
 * circonscriptions n'a pas UN depute, et une commune sans circonscription publiee ne
 * recoit aucune circonscription deduite. Lit les fiches reelles (data/departments) et
 * la chaine reelle (chaineDecision), pas des fixtures.
 * Lancer : node --test tests/circos-reelles.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DONNEES = join(dirname(fileURLToPath(import.meta.url)), "..", "data");
const { chaineDecision, phraseCirconscription } = await import("../packages/core/src/index.js");
const lire = f => JSON.parse(readFileSync(join(DONNEES, f), "utf8"));
const index = lire("index.json");
const deputes = lire("deputes.json");

const communes = [];
for (const f of readdirSync(join(DONNEES, "departments")).filter(n => n.endsWith(".json")).sort()) {
  const dep = JSON.parse(readFileSync(join(DONNEES, "departments", f), "utf8"));
  for (const [code, fiche] of Object.entries(dep.communes)) communes.push({ code, dep: dep.d, fiche });
}

/* La case « Qui decide » de l'echelon France, telle que la chaine la calcule. */
const echelonFrance = c => chaineDecision({ fiche: c.fiche, paquet: {}, index, deputes, elusRegion: null, dep: c.dep })
  .find(n => n.echelon === "france");

test("donnee : chaque circonscription publiee est un entier de 1 a 577, sans doublon", () => {
  for (const c of communes) {
    const circos = Array.isArray(c.fiche.circo) ? c.fiche.circo : (c.fiche.circo == null ? [] : [c.fiche.circo]);
    for (const n of circos) assert.ok(Number.isInteger(n) && n >= 1 && n <= 577, `${c.fiche.nom} : circonscription ${n}`);
    assert.equal(new Set(circos).size, circos.length, `${c.fiche.nom} : circonscription en double`);
  }
});

test("une commune a plusieurs circonscriptions : aucun depute n'est nomme, et la phrase donne le bon nombre", () => {
  const multi = communes.filter(c => Array.isArray(c.fiche.circo) && c.fiche.circo.length > 1);
  assert.ok(multi.length > 0, "aucune commune a plusieurs circonscriptions dans la donnee : le cas n'est plus teste");
  for (const c of multi) {
    const n = c.fiche.circo.length;
    assert.equal(echelonFrance(c).personne, null, `${c.fiche.nom} (${c.fiche.circo.join(", ")}) : un depute est nomme`);
    const phrase = phraseCirconscription({ nbCircos: n, nomCommune: c.fiche.nom, nomDep: "" }, c.fiche.circo[0]);
    assert.ok(phrase.includes(`partagée entre ${n} circonscriptions`), `${c.fiche.nom} : nombre faux (« ${phrase} »)`);
  }
});

test("une commune sans circonscription publiee ne recoit pas de circonscription deduite", () => {
  const sans = communes.filter(c => c.fiche.circo == null || (Array.isArray(c.fiche.circo) && c.fiche.circo.length === 0));
  for (const c of sans) {
    assert.equal(echelonFrance(c).personne, null, `${c.fiche.nom} : un depute est nomme sans circonscription publiee`);
  }
});

/* CHEZ VOUS : QUI EST LA PERSONNE QUI A VOTE (17/10/2026). Mesure : la phrase de Chez vous
   disait « Votre commune est dans la 6e circonscription. Le 21 juillet 2026, Béatrice
   Roullaud a voté pour. » sans dire qui est cette personne pour le lecteur. Une seule
   regle (phraseVoteChezVous, dans le socle), lue sur la donnee reelle : la commune ->
   sa circonscription (fiche) -> le depute de CETTE circonscription (deputes.json) ->
   son vote (deriverAujourdhui). Aucun numero de scrutin n'est fige ici : le vote affiche
   change a chaque collecte, la chaine, elle, ne doit jamais casser. */
const { deriverAujourdhui, phraseVoteChezVous, texteDe, ordinal } = await import("../packages/core/src/index.js");
const pourCommune = (dep, insee) => {
  const paquet = lire(`departments/${dep}.json`);
  return deriverAujourdhui({ fiche: paquet.communes[insee], commune: insee, dep, index, projets: null,
    cat: lire("scrutins.json"), pos: lire(`scrutins/${dep}.json`), deputes, cal: null, agendaAN: null,
    evenements: null, maintenant: new Date() });
};

test("Chez vous, circonscription unique (Meaux) : la phrase dit qui represente la circonscription, et c'est la personne qui a vote", () => {
  const d = pourCommune("77", "77284");
  assert.equal(d.nbCircos, 1, "Meaux n'a plus une seule circonscription : choisir une autre commune temoin");
  const v = d.dernierVote;
  assert.ok(v, "aucun vote avec position pour Meaux dans la donnee : la regle n'est pas testee");
  const fiche = lire("departments/77.json").communes["77284"];
  assert.equal(v.circo, fiche.circo, "le vote n'est pas celui de la circonscription de la commune");
  const dep = deputes.deputes[`77-${fiche.circo}`];
  assert.equal(v.qui, `${dep.prenom} ${dep.nom}`, "la personne du vote n'est pas le depute de cette circonscription");
  const p = texteDe(phraseVoteChezVous(d, v));
  /* 20/10/2026 : une reponse, pas un paragraphe. La phrase portait le lien au
     lecteur, le numero de circonscription, la date ET la position — 117 caracteres,
     quatre lignes a 360 px. Numero et date sont passes dans la note de la carte.
     Ce que la garde protege toujours : la personne est nommee, le lien a la commune
     est dit, la position est dite, et aucun accord de genre n'est devine. */
  assert.ok(p.startsWith(`${v.qui}, qui représente ${d.nomCommune} à l'Assemblée, a voté `), p);
  assert.match(p, /a voté (pour|contre|l'abstention)\.$/, p);
  assert.doesNotMatch(p, /représentée|élue|députée/, `un genre est deviné : ${p}`);
  assert.ok(p.length < 90, `la phrase reste longue (${p.length} caractères) : ${p}`);
});

test("Chez vous, plusieurs circonscriptions (Paris) : aucun depute personnel n'est designe", () => {
  const d = pourCommune("75", "75056");
  assert.ok(d.nbCircos > 1, "Paris n'a plus plusieurs circonscriptions dans la donnee");
  const v = d.dernierVote;
  assert.ok(v, "aucun vote d'exemple pour Paris : le cas n'est pas teste");
  const p = texteDe(phraseVoteChezVous(d, v));
  assert.ok(p.includes(`Paris est partagée entre ${d.nbCircos} circonscriptions`), p);
  assert.match(p, /dépend de votre adresse, que Repère ne demande pas/, p);
  assert.ok(!p.includes(v.qui), `un depute est presente comme celui du lecteur : « ${p} »`);
  assert.doesNotMatch(p, /représentée|votre député a voté/i, p);
});

test("Chez vous, nom du depute absent : la phrase ne nomme personne et ne l'invente pas", () => {
  const p = texteDe(phraseVoteChezVous({ nbCircos: 1, nomCommune: "X" }, { circo: 3, qui: "", position: "p", sc: { d: "2026-07-21" } }));
  assert.equal(p, "Le député de la 3e circonscription a voté pour.");
  assert.doesNotMatch(p, /représenté|représentée/, p);
});
