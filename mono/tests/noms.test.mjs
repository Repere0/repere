// COMPARER DES NOMS (12/11/2026) : « Repère ne retrouve pas … » ne doit plus venir d'une différence d'écriture.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleNom, memeNom, etatVotePersonne, ETAT_VOTE } from "../packages/core/src/index.js";

test("memeNom : accents, casse, tirets, apostrophes et ordre des mots ne comptent pas", () => {
  assert.ok(memeNom("Jean-Éric DUPONT", "Jean Eric Dupont"));
  assert.ok(memeNom("DUPONT Jean-Éric", "jean-eric dupont"), "ordre nom/prénom");
  assert.ok(memeNom("Sophie D’Aubigny", "Sophie D'AUBIGNY"), "apostrophe typographique");
  assert.ok(memeNom("Marie Le Pen", "marie le pen"), "espaces insécables");
  assert.ok(memeNom("Léa  Balage El Mariky", "Lea Balage-El-Mariky"), "tirets et espaces doubles");
});

test("memeNom : jamais flou — un mot de plus, de moins ou une faute ne s'apparie pas ; un nom vide ne correspond à rien", () => {
  assert.equal(memeNom("Jean Dupont", "Jean Dupond"), false);
  assert.equal(memeNom("Jean Dupont", "Jean Marc Dupont"), false);
  assert.equal(memeNom("Dupont", "Jean Dupont"), false, "le patronyme seul n'est pas le nom complet");
  assert.equal(memeNom("", ""), false);
  assert.equal(memeNom(null, undefined), false);
  assert.equal(cleNom("Éloïse-Anne ROUX"), "anne eloise roux");
});

const deputes = { deputes: { "75-1": { prenom: "Jean-Éric", nom: "Dupont", acteurRef: "PA1" } } };
const cat = { scrutins: [{ n: "1", d: "2026-11-01", u: "u1" }] };
const pos = { positions: { "1": { PA1: "p" } } };
const base = { fiche: { circo: 1 }, dep: "75", cat, pos, deputes };

test("fiche d'élu : le nom écrit autrement que dans le fichier des députés est retrouvé (plus de « Repère ne retrouve pas »)", () => {
  const faits = [{ type: "vote", position: "p", qui: "Jean-Éric Dupont" }];
  for (const ecriture of ["Jean-Éric Dupont", "JEAN ERIC DUPONT", "DUPONT Jean-Eric", "jean éric dupont"]) {
    assert.notEqual(etatVotePersonne({ ...base, faits, nom: ecriture }), ETAT_VOTE.ELU_NON_IDENTIFIE, ecriture);
  }
  assert.equal(etatVotePersonne({ ...base, faits, nom: "Jean-Éric Dupont" }), null, "il a un vote : pas de vide");
  assert.equal(etatVotePersonne({ ...base, faits: [], nom: "Eric DUPONT Jean" }), ETAT_VOTE.POSITION_ABSENTE, "identifié, sans vote : vraie absence");
  assert.equal(etatVotePersonne({ ...base, faits: [], nom: "Quelqu'un Dautre" }), ETAT_VOTE.ELU_NON_IDENTIFIE, "un autre nom n'est pas deviné");
});

import { demandeVotesElu } from "../packages/core/src/votesVides.js";
test("action citoyenne : un mailto sans destinataire deviné, au message neutre", () => {
  const d = demandeVotesElu("Jean Dupont");
  assert.match(d.url, /^mailto:\?subject=/, "aucune adresse n'est devinée");
  const corps = decodeURIComponent(d.url.split("&body=")[1]);
  assert.match(corps, /Pouvez-vous m'indiquer où consulter vos positions de vote/);
  assert.doesNotMatch(corps, /n'avez pas voté|absent|scandale|exigeons|honte/i, "ni accusation ni pression");
  assert.ok(!/@/.test(d.url), "pas d'adresse");
});
