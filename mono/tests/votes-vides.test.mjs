/* VOTE VIDE : CINQ ETATS, CINQ PHRASES, AUCUNE CONFUSION — 29/10/2026.
 *
 * « Aucun vote » recouvrait des causes differentes : relevé non lu, relevé qui
 * ne s'apparie pas, commune sans circonscription, circonscription sans député
 * dans le fichier, et vraie absence de position dans le périmètre. Le site
 * affichait la même phrase pour les quatre premières. Ces tests fixent une règle
 * unique (core/votesVides.js) et empêchent qu'un état soit écrit comme un autre. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ETAT_VOTE, etatVoteVide, copieVoteVide, deriverAujourdhui } from "../packages/core/src/index.js";

const RACINE = path.resolve(import.meta.dirname, "..");
const data = f => { const p = path.join(RACINE, "data", f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null; };

const SC = (n, d) => ({ u: "U" + n, n: String(n), d, t: "texte " + n, s: "adopté", dec: {} });
const cat = {
  source: { releve_le: "2026-10-28", portee: "les 2 derniers scrutins solennels de test", producteur: "AN", licence: "LO", url: "https://ex.test" },
  scrutins: [SC(8434, "2026-10-13"), SC(8430, "2026-10-12")],
};
const pos = { releve_le: "2026-10-28", positions: { 8434: { PA1: "p" }, 8430: { PA1: "c" } } };
const deputes = { deputes: { "77-1": { acteurRef: "PA1", prenom: "Ana", nom: "Test" } } };
const fiche = { nom: "Testville", circo: 1 };

test("etat — relevé non lu : pas de catalogue, pas de positions ou pas de députés", () => {
  assert.equal(etatVoteVide({ fiche, dep: "77", cat: null, pos, deputes }), ETAT_VOTE.RELEVE_NON_LU);
  assert.equal(etatVoteVide({ fiche, dep: "77", cat, pos: null, deputes }), ETAT_VOTE.RELEVE_NON_LU);
  assert.equal(etatVoteVide({ fiche, dep: "77", cat, pos, deputes: null }), ETAT_VOTE.RELEVE_NON_LU);
});

test("etat — relevé lu mais qui ne s'apparie pas (scrutin inconnu, dates différentes)", () => {
  const inconnu = { ...pos, positions: { 9999: { PA1: "p" } } };
  assert.equal(etatVoteVide({ fiche, dep: "77", cat, pos: inconnu, deputes }), ETAT_VOTE.RELEVE_INCOHERENT);
  const autreDate = { ...pos, releve_le: "2026-10-01" };
  assert.equal(etatVoteVide({ fiche, dep: "77", cat, pos: autreDate, deputes }), ETAT_VOTE.RELEVE_INCOHERENT);
});

test("etat — commune sans circonscription dans la fiche", () => {
  assert.equal(etatVoteVide({ fiche: { nom: "X", circo: null }, dep: "77", cat, pos, deputes }), ETAT_VOTE.CIRCO_INCONNUE);
  assert.equal(etatVoteVide({ fiche: { nom: "X", circo: [] }, dep: "77", cat, pos, deputes }), ETAT_VOTE.CIRCO_INCONNUE);
});

test("etat — circonscription sans député dans le fichier des députés", () => {
  assert.equal(etatVoteVide({ fiche: { nom: "X", circo: 3 }, dep: "77", cat, pos, deputes }), ETAT_VOTE.CIRCO_SANS_DEPUTE);
  /* Commune à cheval : tant qu'une circonscription a son député, ce n'est pas « sans député ». */
  assert.equal(etatVoteVide({ fiche: { nom: "X", circo: [1, 3] }, dep: "77", cat, pos, deputes }), ETAT_VOTE.POSITION_ABSENTE);
});

test("etat — tout est lu, le député est là, aucune position dans le périmètre : position absente", () => {
  const sansPosition = { ...pos, positions: { 8434: { PA2: "p" }, 8430: { PA2: "c" } } };
  assert.equal(etatVoteVide({ fiche, dep: "77", cat, pos: sansPosition, deputes }), ETAT_VOTE.POSITION_ABSENTE);
});

test("copie — chaque état a son titre ; aucun titre d'un état de données n'est « Aucun vote »", () => {
  const titres = Object.values(ETAT_VOTE).map(e => copieVoteVide(e, { nom: "Testville", releve: "2026-10-28", portee: "P" }).titre);
  assert.equal(new Set(titres).size, titres.length, "deux états ont le même titre");
  for (const e of Object.values(ETAT_VOTE)) {
    const c = copieVoteVide(e, { nom: "Testville", releve: "2026-10-28", portee: "P" });
    assert.ok(c.titre && c.corps, `${e} : titre ou corps vide`);
    assert.doesNotMatch(c.titre + " " + c.corps, /undefined|null|NaN/, `${e} : valeur vide écrite`);
    if (e !== ETAT_VOTE.POSITION_ABSENTE) {
      assert.doesNotMatch(c.titre, /^Aucun/, `${e} : un état de données ne doit pas s'annoncer « Aucun »`);
    }
  }
  assert.match(copieVoteVide(ETAT_VOTE.POSITION_ABSENTE, { releve: "2026-10-28", portee: "P" }).titre, /^Aucun vote solennel/);
});

test("copie — un relevé non lu ou une donnée manquante ne se présente jamais comme une absence", () => {
  for (const e of [ETAT_VOTE.RELEVE_NON_LU, ETAT_VOTE.CIRCO_SANS_DEPUTE]) {
    const c = copieVoteVide(e, { nom: "Testville" });
    assert.match(c.corps, /Ce n'est pas une absence de vote/, `${e} : la phrase doit le dire`);
  }
  const incoherent = copieVoteVide(ETAT_VOTE.RELEVE_INCOHERENT, {});
  assert.doesNotMatch(incoherent.titre + incoherent.corps, /absence|Aucun/);
});

test("copie — la position absente dit le périmètre, la date, et qu'un non-vote n'est pas une absence", () => {
  const c = copieVoteVide(ETAT_VOTE.POSITION_ABSENTE, { releve: "2026-10-28", portee: "les 2 derniers scrutins solennels de test" });
  assert.match(c.corps, /Ce que couvrent les données : les 2 derniers scrutins solennels de test\./);
  assert.match(c.corps, /Données récupérées le 28 octobre 2026\./);
  assert.match(c.corps, /Les données ne portent que sur les derniers votes, pas sur toute la législature\./);
  assert.match(c.corps, /Une position non portée n'est pas une absence/);
  const sans = copieVoteVide(ETAT_VOTE.POSITION_ABSENTE, { portee: "" });
  assert.match(sans.corps, /la source ne l'indique pas/);
  assert.match(sans.corps, /La date à laquelle ces données ont été récupérées n'est pas connue/);
  assert.doesNotMatch(sans.corps, /undefined|null/);
});

test("copie — le nom de la commune apparaît dans les états qui parlent de circonscription", () => {
  assert.match(copieVoteVide(ETAT_VOTE.CIRCO_INCONNUE, { nom: "Meaux" }).titre, /Meaux/);
  assert.match(copieVoteVide(ETAT_VOTE.CIRCO_SANS_DEPUTE, { nom: "Meaux" }).titre, /Meaux/);
});

test("derivation — deriverAujourdhui expose l'état du vide, et null quand un vote existe", () => {
  const sortie = deriverAujourdhui({ fiche, commune: "77000", dep: "77", index: { agregats: [], sources: {} },
    projets: null, cat, pos, deputes, cal: null, agendaAN: null, evenements: null });
  assert.equal(sortie.dernierVote && sortie.dernierVote.sc.n, "8434");
  assert.equal(sortie.etatVote, null, "un vote existe : aucun état de vide");
  const sansLeRelevé = deriverAujourdhui({ fiche, commune: "77000", dep: "77", index: { agregats: [], sources: {} },
    projets: null, cat: null, pos: null, deputes: null, cal: null, agendaAN: null, evenements: null });
  assert.equal(sansLeRelevé.dernierVote, undefined);
  assert.equal(sansLeRelevé.etatVote, ETAT_VOTE.RELEVE_NON_LU);
});

test("donnees reelles — une commune de Seine-et-Marne : l'état du vide est cohérent avec le vote affiché", (t) => {
  const pq = data("departments/77.json"), dep = data("deputes.json"), cat2 = data("scrutins.json"), pos2 = data("scrutins/77.json"), index = data("index.json");
  if (!pq || !dep || !cat2 || !pos2) return t.skip("donnees extraites absentes");
  const commune = Object.keys(pq.communes).find(c => pq.communes[c].circo != null);
  const sortie = deriverAujourdhui({ fiche: pq.communes[commune], commune, dep: "77", index, projets: null,
    cat: cat2, pos: pos2, deputes: dep, cal: null, agendaAN: null, evenements: null });
  assert.equal(sortie.dernierVote !== undefined, sortie.etatVote === null, "vote affiché ⇔ pas d'état de vide");
});

/* PASSE DU 29/10/2026 (soir) : reprise des cas limites. Chacun est écrit ROUGE
   avant la correction : un nom vide ne doit pas produire « de . », un état
   inconnu ne doit jamais s'annoncer « Aucun », et la circonscription inconnue ne
   doit pas inventer une cause que la source ne donne pas. */
test("copie — commune partagée : l'état dit qu'aucun député n'est choisi, sans « Aucun » ni nom inventé", () => {
  assert.equal(ETAT_VOTE.CIRCO_PARTAGEE, "circo-partagee");
  const c = copieVoteVide(ETAT_VOTE.CIRCO_PARTAGEE, { nom: "Exemple-sur-Seine" });
  assert.match(c.titre, /partagée entre plusieurs circonscriptions/);
  assert.match(c.corps, /pas.*votre adresse|votre adresse/);
  assert.doesNotMatch(c.titre, /Aucun/, "le titre ne dit jamais « Aucun vote »");
  assert.doesNotMatch(c.corps, /Aucun vote|aucun vote/);
});

test("copie — nom de commune vide : aucune phrase « de . » ni « de  »", () => {
  for (const e of [ETAT_VOTE.CIRCO_INCONNUE, ETAT_VOTE.CIRCO_SANS_DEPUTE]) {
    const c = copieVoteVide(e, { nom: "" });
    assert.doesNotMatch(c.titre, / de \.|de\s{2}|de $/, `${e} : titre incomplet « ${c.titre} »`);
    assert.match(c.titre, /cette (commune|circonscription)/, `${e} : repli attendu`);
  }
});

test("copie — un état inconnu ou absent (null) ne s'annonce jamais « Aucun vote »", () => {
  for (const e of [null, undefined, "etat-inconnu"]) {
    const c = copieVoteVide(e, { releve: "2026-10-28", portee: "P" });
    assert.doesNotMatch(c.titre, /^Aucun/, `${String(e)} : ne doit pas dire « Aucun »`);
    assert.match(c.corps, /Ce n'est pas une absence de vote/, `${String(e)} : la phrase doit le dire`);
  }
});

test("copie — la circonscription inconnue n'invente aucune cause que la source ne donne pas", () => {
  const c = copieVoteVide(ETAT_VOTE.CIRCO_INCONNUE, { nom: "Meaux" });
  assert.doesNotMatch(c.corps, /créée|découpage|après|dernier/, "cause non sourcée");
  assert.match(c.corps, /Repère ne devine pas/);
});

/* Lisibilité, par la structure du texte : la position absente porte cinq
   informations distinctes ; elles ne forment pas un seul bloc. Un saut de ligne
   entre elles ne change aucun mot. Écrit rouge avant correction. */
test("copie — la position absente est en paragraphes séparés, pas en un seul bloc", () => {
  const c = copieVoteVide(ETAT_VOTE.POSITION_ABSENTE, { releve: "2026-10-28", portee: "P" });
  assert.equal(c.corps.split("\n").length, 5, "cinq paragraphes attendus : périmètre, durée, date, définition, non-vote");
  assert.match(c.corps.split("\n")[0], /^Ce que couvrent les données : P\.$/);
  assert.match(c.corps.split("\n")[4], /Une position non portée n'est pas une absence/);
});

/* ÉLU : LE VOTE DE CETTE PERSONNE, ET NON DE LA COMMUNE. Passe du 29/10/2026 (soir).
   La fiche d'un élu affichait « Aucun vote publié » pour tout vide, et le dernier
   vote de la COMMUNE (toutes circonscriptions) pour l'élu nommé. Écrit rouge avant
   correction : etatVotePersonne n'existe pas encore. */
import { etatVotePersonne } from "../packages/core/src/votesVides.js";
const faitsAvec = (qui, position = "p") => [{ type: "vote", position, qui, sc: { t: "texte", d: "2026-10-13", n: "8434", s: "adopté", dec: {} } }];

test("élu — échec de chargement : relevé non lu, jamais une absence", () => {
  assert.equal(etatVotePersonne({ fiche, dep: "77", cat: null, pos, deputes, faits: [], nom: "Ana Test" }), ETAT_VOTE.RELEVE_NON_LU);
});

test("élu — relevé non apparié : incohérent, jamais une absence", () => {
  const inconnu = { ...pos, positions: { 9999: { PA1: "p" } } };
  assert.equal(etatVotePersonne({ fiche, dep: "77", cat, pos: inconnu, deputes, faits: [], nom: "Ana Test" }), ETAT_VOTE.RELEVE_INCOHERENT);
});

test("élu — commune sans circonscription, circonscription sans député : états distincts", () => {
  assert.equal(etatVotePersonne({ fiche: { nom: "X", circo: null }, dep: "77", cat, pos, deputes, faits: [], nom: "Ana Test" }), ETAT_VOTE.CIRCO_INCONNUE);
  assert.equal(etatVotePersonne({ fiche: { nom: "X", circo: 3 }, dep: "77", cat, pos, deputes, faits: [], nom: "Ana Test" }), ETAT_VOTE.CIRCO_SANS_DEPUTE);
});

test("élu — nom absent du fichier des députés : « élu non identifié », jamais « aucun vote »", () => {
  const e = etatVotePersonne({ fiche, dep: "77", cat, pos, deputes, faits: [], nom: "Quelqu'un Autre" });
  assert.equal(e, ETAT_VOTE.ELU_NON_IDENTIFIE);
  const c = copieVoteVide(e, { nom: "Quelqu'un Autre" });
  assert.doesNotMatch(c.titre + c.corps, /^Aucun|Aucun vote/, "un élu non identifié n'a pas d'absence de vote à annoncer");
  assert.match(c.corps, /Ce n'est pas une absence de vote/);
});

test("élu — son vote est trouvé : pas d'état de vide (la fiche affiche ce vote)", () => {
  assert.equal(etatVotePersonne({ fiche, dep: "77", cat, pos, deputes, faits: faitsAvec("Ana Test"), nom: "Ana Test" }), null);
});

test("élu — identifié sans position : position absente, pas une absence d'activité", () => {
  assert.equal(etatVotePersonne({ fiche, dep: "77", cat, pos, deputes, faits: [], nom: "Ana Test" }), ETAT_VOTE.POSITION_ABSENTE);
});

test("élu — RÉGRESSION : le vote d'un autre député de la commune ne compte pas pour cet élu", () => {
  // La commune a un vote, mais celui d'une autre personne : l'élu nommé n'a pas de vote.
  assert.equal(etatVotePersonne({ fiche, dep: "77", cat, pos, deputes, faits: faitsAvec("Autre Personne"), nom: "Ana Test" }), ETAT_VOTE.POSITION_ABSENTE);
});

test("élu — la dérivation expose etatVotePour(nom), même règle que etatVotePersonne", () => {
  const sortie = deriverAujourdhui({ fiche, commune: "77000", dep: "77", index: { agregats: [], sources: {} },
    projets: null, cat, pos: { ...pos, positions: { 8434: { PA2: "p" } } }, deputes, cal: null, agendaAN: null, evenements: null });
  assert.equal(typeof sortie.etatVotePour, "function");
  assert.equal(sortie.etatVotePour("Ana Test"), ETAT_VOTE.POSITION_ABSENTE);
  assert.equal(sortie.etatVotePour("Quelqu'un Autre"), ETAT_VOTE.ELU_NON_IDENTIFIE);
});
