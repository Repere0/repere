/* ORDRE DES FAITS ET VOTE LE PLUS RECENT — 07/10/2026 (fichier a part pour ne
   pas toucher core.test.mjs). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { deriverAujourdhui, ordreDesFaits } from "../packages/core/src/index.js";

const RACINE = path.resolve(import.meta.dirname, "..");
const data = f => { const p = path.join(RACINE, "data", f); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null; };

/* LE VOTE LE PLUS RECENT — 07/10/2026. Quatre votes le meme jour, le catalogue
   ne porte que la date : le numero de scrutin departage, dans l'ordre ou
   l'Assemblee les numerote. Le fichier est volontairement dans l'ordre inverse. */
test("core — le vote mis en avant est vraiment le plus recent, meme le meme jour", () => {
  const sc = (n, d) => ({ u: "U" + n, n: String(n), d, t: "texte " + n, s: "adopté", dec: {} });
  const cat = { scrutins: [sc(8430, "2026-07-21"), sc(8431, "2026-07-21"), sc(8433, "2026-07-21"), sc(8434, "2026-07-21"), sc(8427, "2026-07-20")] };
  const deputes = { deputes: { "93-7": { prenom: "Prénom", nom: "Nom", acteurRef: "PA1" } } };
  const deriver = positions => deriverAujourdhui({ fiche: { nom: "X", circo: 7 }, commune: "93000", dep: "93",
    index: { agregats: [], sources: {} }, projets: null, cat, pos: { positions }, deputes, cal: null, agendaAN: null, evenements: null });
  const tous = { 8430: { PA1: "a" }, 8431: { PA1: "p" }, 8433: { PA1: "c" }, 8434: { PA1: "c" }, 8427: { PA1: "c" } };
  // nominal : le dernier numero du dernier jour, pas le premier du fichier
  assert.equal(deriver(tous).dernierVote.sc.n, "8434");
  // le plus recent sans position : le precedent AVEC position, sans rien inventer
  const sansDernier = { ...tous }; delete sansDernier[8434];
  assert.equal(deriver(sansDernier).dernierVote.sc.n, "8433");
  // aucune position du depute : aucun vote mis en avant
  assert.equal(deriver({}).dernierVote, undefined);
  // la date passe avant le numero
  assert.equal(ordreDesFaits({ quand: "2026-07-21", rang: 1, type: "vote", sc: { n: "1" } }, { quand: "2026-07-20", rang: 1, type: "vote", sc: { n: "9999" } }) < 0, true);
  // numero illisible : on ne devine pas, l'ordre de la source est garde
  assert.equal(ordreDesFaits({ quand: "2026-07-21", rang: 1, type: "vote", sc: { n: "?" } }, { quand: "2026-07-21", rang: 1, type: "vote", sc: { n: "8434" } }), 0);
});

test("core — sur les donnees reelles : le vote mis en avant est le dernier numero du dernier jour", (t) => {
  const pq = data("departments/93.json"), dep = data("deputes.json"), cat = data("scrutins.json"), pos = data("scrutins/93.json"), index = data("index.json");
  if (!pq || !dep || !cat || !pos) return t.skip("donnees extraites absentes (lancer extract-html.js)");
  let vus = 0;
  for (const [commune, fiche] of Object.entries(pq.communes)) {
    if (typeof fiche.circo !== "number") continue;
    const d = dep.deputes["93-" + fiche.circo];
    if (!d) continue;
    const avec = cat.scrutins.filter(s => pos.positions[s.n] && pos.positions[s.n][d.acteurRef]);
    if (!avec.length) continue;
    const jour = avec.map(s => s.d).sort().pop();
    const attendu = String(Math.max(...avec.filter(s => s.d === jour).map(s => Number(s.n))));
    const a = deriverAujourdhui({ fiche, commune, dep: "93", index, projets: null, cat, pos, deputes: dep, cal: null, agendaAN: null, evenements: null });
    assert.equal(a.dernierVote && a.dernierVote.sc.n, attendu, fiche.nom);
    vus++;
  }
  assert.ok(vus > 10, "trop peu de communes mesurees : " + vus);
});

test("core — ordre : l'heure departage seulement quand les deux faits en ont une", () => {
  const v = (quand, n) => ({ quand, rang: 1, type: "vote", sc: { n: String(n) } });
  // heure disponible des deux cotes : l'heure decide, meme contre le numero
  assert.ok(ordreDesFaits(v("2026-07-21T21:30", 1), v("2026-07-21T15:00", 9)) < 0);
  // heure absente d'un cote : on ne suppose pas minuit, le numero decide
  assert.ok(ordreDesFaits(v("2026-07-21", 8434), v("2026-07-21T15:00", 8430)) < 0);
  assert.ok(ordreDesFaits(v("2026-07-21T15:00", 8430), v("2026-07-21", 8434)) > 0);
  // dates differentes : la date decide, avec ou sans heure
  assert.ok(ordreDesFaits(v("2026-07-21", 1), v("2026-07-20T23:59", 9999)) < 0);
  // tri complet d'un melange
  const l = [v("2026-07-20", 8427), v("2026-07-21", 8430), v("2026-07-21", 8434), v("2026-07-21", 8431)].sort(ordreDesFaits);
  assert.deepEqual(l.map(x => x.sc.n), ["8434", "8431", "8430", "8427"]);
});
