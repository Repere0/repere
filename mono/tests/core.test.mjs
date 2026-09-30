/* @repere/core — controles unitaires, en Node pur (29/09/2026).
 *
 * Le paquet est lu par le site ET par l'application mobile : une regression ici
 * se verrait sur les deux. Ces controles tournent sans navigateur, sur des
 * donnees reelles quand le build les a extraites (mono/data), sur des cas
 * construits sinon. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  dateFr, jourFr, euros, titreLisible, procedure, decompte, positionsFiables, positionSur,
  calculerFaits, valeur, rapports, dernierExercice, evolution, deriverAujourdhui,
  mots, motsCible, correspond, trouverCommunes,
} from "../packages/core/src/index.js";

const RACINE = path.resolve(import.meta.dirname, "..");
const data = f => { const p = path.join(RACINE, "data", f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null; };

test("core — aucune dependance d'interface, de reseau ou de stockage", () => {
  for (const f of fs.readdirSync(path.join(RACINE, "packages/core/src"))) {
    const s = fs.readFileSync(path.join(RACINE, "packages/core/src", f), "utf8");
    for (const interdit of [/from ["']react/, /document\./, /window\./, /\bfetch\(/, /indexedDB/, /localStorage/, /<[A-Z][A-Za-z]*[ >]/]) {
      assert.ok(!interdit.test(s.replace(/\/\*[\s\S]*?\*\//g, "")), `${f} utilise ${interdit.source}`);
    }
  }
});

test("core — les dates s'ecrivent comme on les dit", () => {
  assert.equal(dateFr("2026-10-01"), "1er octobre 2026");
  assert.equal(dateFr("2026-07-21"), "21 juillet 2026");
  assert.equal(jourFr("2026-10-01T09:00"), "jeudi 1er octobre 2026");
  assert.equal(euros(533466).replace(/\s/g, " "), "533 466 €");
});

test("core — un scrutin se lit sans rien reformuler", () => {
  const t = "l'ensemble du projet de loi relatif à la protection des enfants (première lecture)";
  assert.equal(titreLisible(t), "Projet de loi relatif à la protection des enfants");
  assert.equal(procedure(t), "première lecture");
  assert.equal(decompte({ pour: 378, contre: 7, abstentions: 173 }), "378 pour, 7 contre, 173 abstentions");
});

test("core — la garde d'appariement refuse deux releves qui ne se correspondent pas", () => {
  const cat = { scrutins: [{ n: "1" }, { n: "2" }], source: { releve_le: "2026-09-28" } };
  assert.equal(positionsFiables(cat, { positions: { 1: {} }, releve_le: "2026-09-28" }), true);
  assert.equal(positionsFiables(cat, { positions: { 3: {} }, releve_le: "2026-09-28" }), false);
  assert.equal(positionsFiables(cat, { positions: { 1: {} }, releve_le: "2026-09-27" }), false);
  assert.equal(positionSur({ positions: { 1: { PA1: "p" } } }, "PA1", "1"), "p");
  assert.equal(positionSur({ positions: { 1: { PA1: "p" } } }, "PA2", "1"), undefined);
});

test("core — un zero publie n'est pas une absence, et la dette se traduit en texte", () => {
  const ex = [1000, 500000, 500, 480000, 480, 0, 0, 100000, 100, 200000, 200, 300000, 300];
  assert.deepEqual(valeur(ex, 2), { m: 0, hab: 0, zero: true });
  assert.equal(valeur([1000, null, null], 0), null);
  const r = rapports([1000, 1200000, 1200, 1000000, 1000, 600000, 600, 100000, 100, 400000, 400, 500000, 500]);
  assert.equal(r[0].mot, "encours de dette");
  assert.ok(r[0].l.includes(r[0].mot), "le mot du dictionnaire n'est pas dans le libelle");
  assert.equal(r[0].v, "6,0 mois de recettes");
});

test("core — l'evolution refuse de soustraire deux territoires differents", () => {
  const agregats = [["Recettes totales", "Ce qu'elle encaisse"]];
  const stable = evolution({ comptes: { 2024: [1000, 100, 100], 2025: [1010, 150, 149] } }, agregats);
  assert.equal(stable.perimetreChange, false);
  assert.equal(stable.lignes[0].diff, 50);
  const fusion = evolution({ comptes: { 2024: [32426, 100, 3], 2025: [149781, 300, 2] } }, agregats);
  assert.equal(fusion.perimetreChange, true);
  assert.equal(evolution({ comptes: { 2021: [1, 1, 1], 2024: [1, 2, 2] } }, agregats), null);
});

test("core — sur les donnees reelles : les faits sont dans l'ordre du temps et le depute a son nom complet", (t) => {
  const pq = data("departments/93.json"), dep = data("deputes.json"), cat = data("scrutins.json");
  if (!pq || !dep || !cat) return t.skip("donnees extraites absentes (lancer extract-html.js)");
  const pos = data("scrutins/93.json"), projets = data("projets/93.json"), index = data("index.json");
  const [commune, fiche] = Object.entries(pq.communes).find(([c, f]) => typeof f.circo === "number" && projets && projets.communes[c]) || [];
  const faits = calculerFaits({ dep: "93", fiche, projets, commune, cat, pos, deputes: dep, evenements: null });
  assert.ok(faits.length > 0, "aucun fait pour " + fiche.nom);
  for (let i = 1; i < faits.length; i++) assert.ok(faits[i - 1].quand >= faits[i].quand, "faits hors de l'ordre du temps");
  for (const f of faits.filter(x => x.type === "vote")) assert.ok(/\s/.test(f.qui), `depute nomme par un seul mot : « ${f.qui} »`);
  const a = deriverAujourdhui({ fiche, commune, dep: "93", index, projets, cat, pos, deputes: dep,
    cal: null, agendaAN: { evenements: [{ debut: "2099-01-01T09:00", titre: "x", categorie: "Séance publique" }] }, evenements: null,
    maintenant: new Date("2098-12-30T00:00:00Z") });
  assert.equal(a.pret, true);
  assert.equal(a.nomCommune, fiche.nom);
  assert.equal(a.nbCircos, 1);
  assert.equal(a.prochains.length, 1);
  assert.equal(a.prochains[0].institution, "Assemblée nationale");
  assert.ok(a.dernierExercice === undefined, "deriverAujourdhui n'expose pas de fonction");
  assert.ok(a.exercice && dernierExercice(fiche, index.agregats).an === a.exercice.an);
});

test("core — la recherche ignore accents, traits d'union et apostrophes", () => {
  assert.ok(correspond(mots("evry"), motsCible("Évry-Courcouronnes")));
  assert.ok(correspond(mots("val doise"), motsCible("Val-d'Oise")));
  assert.ok(correspond(mots("pyrenees at"), motsCible("Pyrénées-Atlantiques")));
  assert.ok(!correspond(mots("paris"), motsCible("Pantin")));
});

test("recherche : « paris » donne Paris avant Cormeilles-en-Parisis (defaut du 13/09/2026)", () => {
  const liste = ["Cormeilles-en-Parisis", "Fontenay-en-Parisis", "Paris"].map((n, i) => ["0000" + i, n, motsCible(n)]);
  const r = trouverCommunes(liste, mots("paris"));
  assert.equal(r[0][1], "Paris");
  assert.equal(r.length, 3);
  assert.deepEqual(trouverCommunes(liste, []), []);
});

test("core — la phrase de refus d'appariement porte ses accents (texte affiché)", async () => {
  const { REFUS_APPARIEMENT } = await import("../packages/core/src/index.js");
  const { MOTS_A_ACCENTS } = await import("../packages/data-utils/src/invariants.js");
  const texte = REFUS_APPARIEMENT.titre + " " + REFUS_APPARIEMENT.corps;
  const fautes = MOTS_A_ACCENTS.filter(m => new RegExp("\\b" + m + "\\b").test(texte));
  assert.deepEqual(fautes, []);
});

test("phrases — les adjoints ne votent pas seuls le budget (CGCT L2312-1)", async () => {
  const { phraseAdjoints, texteDe } = await import("../packages/core/src/index.js");
  const t = texteDe(phraseAdjoints(3, "Jeanne DUPONT"));
  assert.match(t, /conseil municipal, qui vote le budget/);
  assert.doesNotMatch(t, /Ce sont eux qui votent le budget/);
});

test("phrases des comptes — trois absences, trois phrases, et le calcul s'annonce sans renvoyer a un montant absent", async () => {
  const m = await import("../packages/core/src/index.js");
  const a = m.comptesAbsents("Meaux"), i = m.comptesInsuffisants("2025");
  const e = m.comptesIncoherents("Meaux", m.phraseEcartes(["2025"], "Meaux"));
  assert.equal(new Set([a.titre, i.titre, e.titre]).size, 3);
  assert.match(e.corps, /des comptes pour 2025, mais leurs montants ne correspondent pas/);
  assert.equal(m.phraseEcartes([], "Meaux"), null);
  assert.deepEqual(m.exercicesEcartes({ comptes_ecartes: ["2024", "2021"] }, { an: "2021" }), ["2024"]);
  assert.equal(m.sousTitreRapports("2025", [1234]), "Ce que ça représente · comptes 2025 · 1 234 habitants".replace(" 234", " 234"));
  assert.doesNotMatch(m.introRapports({ detailPlusBas: false }), /plus bas/);
  assert.doesNotMatch(m.CALCUL_REPERE, /ci-dessus/);
  assert.match(m.CALCUL_REPERE, /ce n'est pas un chiffre publié/);
});

test("visuels — les nombres dessines sont ceux des phrases, et aucune part ne depasse 100 %", async () => {
  const m = await import("../packages/core/src/index.js");
  const ix = data("index.json");
  if (!ix) return;
  let vus = 0;
  for (const dep of ["75", "77", "93"]) {
    const pq = data(`departments/${dep}.json`);
    for (const c of Object.values(pq.communes)) {
      const e = m.dernierExercice(c, ix.agregats);
      if (!e) continue;
      const ch = m.chiffresComptes(e.ex);
      const texte = m.rapports(e.ex).map(o => o.v).join(" | ");
      if (ch.partSalaires !== null) assert.ok(texte.includes(ch.partSalaires + " € de salaires"), texte);
      if (ch.parJour !== null) assert.ok(texte.includes(ch.parJour.toLocaleString("fr-FR") + " € par jour"), texte);
      for (const k of ["partSalaires", "partInvestissement", "partImpots"]) {
        assert.ok(ch[k] === null || (ch[k] >= 0 && ch[k] <= 100), k + " hors bornes : " + ch[k]);
      }
      vus++;
    }
  }
  assert.ok(vus > 500, "trop peu de communes controlees : " + vus);
});

test("visuels — financement, vote, parcours d'une loi, chaine : denominateurs dits, rien d'invente", async () => {
  const m = await import("../packages/core/src/index.js");
  const f = m.financementProjet({ subvention: 726800, cout: 1533500 });
  assert.equal(f.partPct, 47); assert.equal(f.reste, 806700);
  assert.equal(m.financementProjet({ subvention: 10, cout: 5 }).part, null, "une subvention superieure au cout n'est pas dessinee");
  assert.equal(m.financementProjet({ subvention: 10 }).part, null);
  assert.equal(m.financementProjet({ subvention: 0, cout: 5 }), null);
  const r = m.repartitionVote({ dec: { pour: "359", contre: "1", abstentions: "81" } });
  assert.equal(r.total, 441);
  assert.equal(Math.round(r.segments.reduce((a, s) => a + s.part, 0) * 1000), 1000);
  assert.equal(m.repartitionVote({ dec: { pour: "x", contre: "1", abstentions: "1" } }), null);
  assert.match(m.phraseDenominateurVote(441), /ayant pris part au vote/);
  assert.equal(m.etapeDuScrutin("texte de la commission mixte paritaire"), "texte de la commission mixte paritaire");
  assert.equal(m.etapeDuScrutin("seconde délibération"), "première lecture");
  /* Defaut trouve sur capture le 30/09 : la cle sans accent ne correspondait
     jamais a procedure(), qui rend « première lecture » : aucune etape n'etait
     surlignee. On verifie donc sur les VRAIS intitules du catalogue. */
  const cat = data("scrutins.json");
  if (cat) {
    const etapes = cat.scrutins.map(sc => m.etapeDuScrutin(m.procedure(sc.t))).filter(Boolean);
    const avecProcedure = cat.scrutins.filter(sc => m.procedure(sc.t)).length;
    assert.equal(etapes.length, avecProcedure, "une procedure du catalogue n'a pas d'etape sur la frise");
    assert.ok(etapes.length > 0);
  }
  assert.equal(m.etapeDuScrutin(""), null, "sans procedure dans l'intitule, aucune etape n'est surlignee");
  assert.equal(m.datePublication({ genere_le: "2026-09-29" }), "2026-09-29");
  assert.equal(m.datePublication({}), null);
  const ch = m.chaineDecision({ fiche: { nom: "X", circo: null, canton: [] }, paquet: {}, index: null, deputes: null, elusRegion: null, dep: "77" });
  assert.deepEqual(ch.map(n => n.echelon), ["ville", "agglo", "dept", "region", "france"]);
  assert.ok(ch.every(n => n.personne === null), "sans source, personne n'est nomme");
});

test("visuels — grands nombres et parts en mots : jamais plus de 3 points d'arrondi", async () => {
  const m = await import("../packages/core/src/index.js");
  assert.equal(m.montantCourt(121272659).texte, "121,3 M€");
  assert.equal(m.montantCourt(121272659).arrondi, true);
  assert.equal(m.montantCourt(726800).arrondi, false);
  assert.equal(m.partEnMots(47), "près de la moitié");
  assert.equal(m.partEnMots(52), "un peu plus de la moitié");
  assert.equal(m.partEnMots(31), "près d'un tiers");
  assert.equal(m.partEnMots(30), "30 %", "3,33 points d'un tiers : trop loin pour le dire en mots");
  assert.equal(m.partEnMots(33), "un tiers");
  assert.equal(m.partReperee(45), null, "hors des reperes, la phrase passe aux euros");
  assert.equal(m.partReperee(47), "près de la moitié");
  assert.equal(m.partEnMots(60), "60 %", "hors des reperes, le pourcentage exact");
  for (let p = 0; p <= 100; p++) {
    const t = m.partEnMots(p);
    /* Les VRAIES fractions : un tiers vaut 33,33, pas 33 (30/09/2026 : la
       premiere version comparait a 33 et laissait dire « près d'un tiers » pour
       30 %, soit 3,33 points). */
    const vraie = { "un quart": 25, "un tiers": 100 / 3, "la moitié": 50, "deux tiers": 200 / 3, "trois quarts": 75, "la totalité": 100 };
    const cle = Object.keys(vraie).find(k => t.endsWith(k));
    if (cle) assert.ok(Math.abs(vraie[cle] - p) <= 3, `${p} % dit « ${t} »`);
  }
  const ph = m.parHabitant([1000, 10, 11, 20, 22, null, null]);
  assert.equal(ph.recettes, 11); assert.equal(ph.dette, null);
});
