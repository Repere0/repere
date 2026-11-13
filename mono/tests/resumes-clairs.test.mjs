// Résumés « En clair » (12/11/2026) : contrôles hors ligne du brouillon, et publication des seuls résumés validés.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { brouillon, controlerResume, empreinte, inventaire, publier } from "../scripts/resumes-clairs.mjs";
import { resumeAffichable, resumePour } from "../packages/core/src/index.js";

const TEXTE = `Projet de loi de finances pour 2027. L'article 3 crée une aide de 1 500 euros pour les communes de moins de 3 500 habitants.
Le Gouvernement remet un rapport au Parlement avant le 1er octobre 2027. Le texte est présenté par Mme Dupont-Martin, au nom de la commission des finances.`;
const BON = "Le texte crée une aide de 1 500 euros pour les communes de moins de 3 500 habitants. Le Gouvernement doit remettre un rapport au Parlement avant le 1er octobre 2027.";
const URL = "https://www.assemblee-nationale.fr/dyn/17/dossiers/DLR5L17N51670";
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "resumes-"));

test("un résumé fidèle passe", () => {
  assert.deepEqual(controlerResume(BON, TEXTE), { ok: true, erreurs: [] });
});

test("un nombre absent du texte officiel fait refuser le brouillon (« 45 » n'est pas dans « 1945 »)", () => {
  const c = controlerResume(BON.replace("1 500", "2 500"), TEXTE);
  assert.ok(!c.ok); assert.match(c.erreurs.join("|"), /nombre absent du texte officiel : 2500/);
  assert.ok(!controlerResume("Le texte crée une aide de 50 euros pour les communes concernées par la mesure.", TEXTE).ok, "50 n'est pas 1 500 ni 3 500");
});

test("un nom propre absent du texte officiel fait refuser ; un nom présent passe, trait d'union compris", () => {
  assert.match(controlerResume(BON + " Le texte sera examiné par le Sénat.", TEXTE).erreurs.join("|"), /nom propre absent du texte officiel : Sénat/);
  assert.ok(controlerResume(BON + " Le texte est présenté par Mme Dupont-Martin.", TEXTE).ok);
});

test("un mot de jugement fait refuser", () => {
  for (const mot of ["importante", "historique", "enfin", "controversée"])
    assert.match(controlerResume(BON + ` C'est une mesure ${mot}.`, TEXTE).erreurs.join("|"), /mot de jugement/, mot);
});

test("brouillon : écrit valide:false avec l'empreinte du texte ; refusé, il n'écrit rien", () => {
  const d = tmp();
  const f = brouillon({ dossier: "DLR5L17N51670", texte: TEXTE, resume: BON, url: URL, scrutins: [9759], jour: "2026-11-12", sortie: d });
  assert.equal(f.valide, false); assert.equal(f.source.sha256, empreinte(TEXTE)); assert.deepEqual(f.scrutins, ["9759"]);
  assert.equal(resumeAffichable(f), null, "un brouillon n'est jamais affichable");
  const d2 = tmp();
  assert.throws(() => brouillon({ dossier: "DLR5L17N51670", texte: TEXTE, resume: BON + " Large majorité de 400 voix.", url: URL, jour: "2026-11-12", sortie: d2 }), /brouillon refuse/);
  assert.deepEqual(fs.readdirSync(d2), []);
  assert.throws(() => brouillon({ dossier: "x", texte: TEXTE, resume: BON, url: URL, jour: "2026-11-12", sortie: d2 }), /reference/);
  assert.throws(() => brouillon({ dossier: "DLR5L17N51670", texte: TEXTE, resume: BON, url: "http://x", jour: "2026-11-12", sortie: d2 }), /https/);
});

test("publier : rien tant que le porteur n'a pas validé ; validé, par dossier et par scrutin ; texte modifié, écarté", () => {
  const d = tmp(), data = tmp();
  brouillon({ dossier: "DLR5L17N51670", texte: TEXTE, resume: BON, url: URL, scrutins: [9759], jour: "2026-11-12", sortie: d });
  let b = publier(data, { dossier: d, jour: "2026-11-13" });
  assert.equal(b.publies, 0); assert.equal(b.brouillons, 1);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(data, "resumes-clairs.json"), "utf8")).resumes, {});
  /* Le porteur valide, à la main. */
  const f = path.join(d, "DLR5L17N51670.json"); const r = JSON.parse(fs.readFileSync(f, "utf8"));
  fs.writeFileSync(f, JSON.stringify({ ...r, valide: true, valide_le: "2026-11-13" }));
  b = publier(data, { dossier: d, jour: "2026-11-13" });
  const pub = JSON.parse(fs.readFileSync(path.join(data, "resumes-clairs.json"), "utf8")).resumes;
  assert.equal(b.publies, 1);
  assert.equal(resumeAffichable(pub["DLR5L17N51670"]).texte, BON);
  assert.equal(pub["scrutin:9759"].dossier, "DLR5L17N51670");
  const index = { resumes: pub };
  assert.equal(resumeAffichable(resumePour(index, { dossier: "DLR5L17N51670" })).texte, BON);
  assert.equal(resumeAffichable(resumePour(index, { scrutin: 9759 })).texte, BON);
  assert.equal(resumePour(index, { dossier: "DLR5L17N1", scrutin: 1 }), null);
  assert.equal(resumePour(index, { dossier: "__proto__" }), null);
  assert.equal(resumePour(null, { scrutin: 9759 }), null);
  /* Le texte officiel change : le résumé validé n'est plus publié. */
  fs.writeFileSync(path.join(d, "textes", "DLR5L17N51670.txt"), TEXTE.replace("1 500", "1 800"));
  b = publier(data, { dossier: d, jour: "2026-11-14" });
  assert.equal(b.publies, 0); assert.equal(b.ecartes.length, 1);
  assert.match(inventaire(d)[0].defauts.join("|"), /a change depuis le brouillon/);
});

test("les fichiers versionnés (data/resumes) : aucun résumé validé en défaut", () => {
  const rouges = inventaire().filter(x => x.valide && x.defauts.length);
  assert.deepEqual(rouges.map(x => `${x.fichier} : ${x.defauts.join(" ; ")}`), []);
});
