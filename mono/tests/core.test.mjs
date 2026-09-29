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
  mots, motsCible, correspond,
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
