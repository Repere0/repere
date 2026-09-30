/* LE MODELE DE DOMAINE DIT-IL LA VERITE SUR LES FICHIERS PUBLIES ? — 01/10/2026.
 *
 * packages/core/src/domaine.d.ts decrit la forme des fichiers de mono/data.
 * TypeScript fait confiance a cette description ; ce test verifie qu'elle est
 * vraie, fichier par fichier, sur les donnees reellement extraites. Un type
 * qui ment serait pire que pas de type : il ferait taire le compilateur sur
 * une absence que l'ecran doit dire (invariant 5).
 *
 * Les controles portent sur ce que le code LIT : champs obligatoires, types,
 * valeurs permises (position p/c/a, jamais une presence — invariant 8). */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const DATA = path.resolve(import.meta.dirname, "../data");
const lire = f => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const existe = f => fs.existsSync(path.join(DATA, f));
const estDate = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v);
const estSource = s => s && typeof s.producteur === "string" && s.producteur && typeof s.licence === "string" && s.licence;
const estExercice = e => Array.isArray(e) && e.length === 13 && e.every(v => v === null || typeof v === "number");
const echantillon = (liste, n = 30) => liste.filter((_, i) => i % Math.max(1, Math.floor(liste.length / n)) === 0);

test("forme — data/ est extrait (sinon ce test ne mesure rien)", () => {
  assert.ok(existe("index.json"), "lancer scripts/extract-html.js avant : sans donnees, aucune forme n'est verifiee");
});

test("forme — IndexPublie : publication, sources, agregats, departements", () => {
  const ix = lire("index.json");
  assert.equal(typeof ix.v, "number");
  assert.ok(estDate(ix.genere_le));
  if (ix.build) assert.ok(estDate(ix.build.construit_le), "build.construit_le est la generation (invariant 9)");
  for (const k of ["elus", "comptes", "circonscriptions"]) assert.ok(estSource(ix.sources[k]), "source " + k);
  if (ix.sources.territoires) assert.ok(Array.isArray(ix.sources.territoires) && ix.sources.territoires.every(estSource));
  assert.equal(ix.agregats.length, 6, "six lignes de comptes");
  assert.ok(ix.agregats.every(a => Array.isArray(a) && a.length === 2 && a.every(x => typeof x === "string")));
  assert.ok(ix.departements.length >= 100);
  for (const d of ix.departements) {
    assert.ok(typeof d.code === "string" && typeof d.nom === "string" && Number.isInteger(d.communes) && Number.isInteger(d.octets), JSON.stringify(d));
  }
});

test("forme — PaquetDepartement et Commune, sur tous les departements", () => {
  const ix = lire("index.json");
  let n = 0, circoListe = 0, circoNulle = 0;
  for (const { code } of ix.departements) {
    if (!existe(`departments/${code}.json`)) continue;
    const p = lire(`departments/${code}.json`);
    assert.equal(typeof p.d, "string");
    for (const [insee, c] of Object.entries(p.communes)) {
      n++;
      const ou = `${code}/${insee}`;
      assert.equal(typeof c.nom, "string", ou);
      if (c.maire) assert.ok(typeof c.maire.nom === "string" && typeof c.maire.fonction === "string", ou + " maire");
      assert.ok(c.adjoints === null || Number.isInteger(c.adjoints), ou + " adjoints");
      assert.ok(c.circo === null || Number.isInteger(c.circo) || (Array.isArray(c.circo) && c.circo.every(Number.isInteger)), ou + " circo");
      if (Array.isArray(c.circo)) circoListe++;
      if (c.circo === null) circoNulle++;
      if (c.comptes) for (const [an, ex] of Object.entries(c.comptes)) {
        assert.ok(/^\d{4}$/.test(an) && estExercice(ex), ou + " exercice " + an);
      }
      if (c.comptes_ecartes) assert.ok(c.comptes_ecartes.every(a => /^\d{4}$/.test(a)), ou + " ecartes");
      if (c.agglo) assert.ok(typeof c.agglo.nom === "string" && Array.isArray(c.agglo.delegues), ou + " agglo");
    }
    if (p.comptes_departement) assert.ok(Object.values(p.comptes_departement).every(estExercice), code + " comptes du departement");
    if (p.conseil_departemental) assert.ok(p.conseil_departemental.every(e => typeof e.nom === "string" && typeof e.fonction === "string"));
  }
  assert.ok(n > 30000, "trop peu de communes lues (" + n + ") : ce test ne mesure presque rien");
  /* Les deux cas que le type annonce existent vraiment : sinon il ment dans l'autre sens. */
  assert.ok(circoListe > 0, "aucune commune a cheval sur plusieurs circonscriptions : le type number[] ne sert plus");
  assert.ok(circoNulle > 0, "aucune commune sans circonscription : le type null ne sert plus");
});

test("forme — Projets : subvention et cout, jamais une entite Financement", () => {
  const fichiers = fs.readdirSync(path.join(DATA, "projets"));
  assert.ok(fichiers.length > 0);
  for (const f of fichiers) {
    const p = lire("projets/" + f);
    assert.ok(estDate(p.mis_a_jour_le) && estDate(p.releve_le), f);
    for (const [insee, liste] of Object.entries(p.communes)) for (const x of liste) {
      assert.ok(Number.isInteger(x.annee) && typeof x.intitule === "string" && typeof x.subvention === "number", f + "/" + insee);
      assert.ok(x.cout === undefined || x.cout === null || typeof x.cout === "number", f + "/" + insee + " cout");
    }
  }
});

test("forme — Parlement : deputes, catalogue, positions p/c/a seulement (invariant 8)", () => {
  const dep = lire("deputes.json");
  assert.ok(estSource(dep.source));
  for (const [cle, d] of echantillon(Object.entries(dep.deputes), 60)) {
    assert.ok(/^[0-9AB]{2,3}-\d+$/.test(cle) && typeof d.nom === "string" && typeof d.acteurRef === "string", cle);
  }
  const cat = lire("scrutins.json");
  assert.ok(estSource(cat.source));
  for (const s of cat.scrutins) {
    assert.ok(typeof s.n === "string" && estDate(s.d) && typeof s.t === "string" && s.dec && "pour" in s.dec && "contre" in s.dec, s.n);
  }
  const valeurs = new Set();
  for (const f of fs.readdirSync(path.join(DATA, "scrutins"))) {
    for (const acteurs of Object.values(lire("scrutins/" + f).positions)) for (const v of Object.values(acteurs)) valeurs.add(v);
  }
  assert.deepEqual([...valeurs].sort(), ["a", "c", "p"].filter(v => valeurs.has(v)),
    "une position hors de p/c/a est apparue (" + [...valeurs].join(",") + ") : une presence ou une absence n'a rien a faire ici");
});

test("forme — Elus de region et fil : sources et dates", () => {
  for (const f of fs.readdirSync(path.join(DATA, "elus-regions"))) {
    const r = lire("elus-regions/" + f);
    assert.ok(estSource(r.source) && r.elus.every(e => typeof e.nom === "string" && typeof e.fonction === "string"), f);
  }
  if (existe("evenements.json")) {
    const e = lire("evenements.json");
    assert.ok(estDate(e.maj));
    for (const x of e.r) assert.ok(typeof x.id === "string" && estDate(x.d) && typeof x.src === "string" && x.src, x.id);
  }
});
