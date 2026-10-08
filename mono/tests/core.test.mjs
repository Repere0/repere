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
  mots, motsCible, correspond, trouverCommunes, elusDepartement, chaineDecision, listeFr, departementDe,
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

test("core — le jour de la semaine ne depend pas du fuseau de l'appareil (outre-mer)", async () => {
  /* Le site couvre l'outre-mer : un lecteur en Guadeloupe lisait « mercredi
     8 octobre » pour un jeudi. On rejoue jourFr dans quatre fuseaux. */
  const { execFileSync } = await import("node:child_process");
  const mod = path.join(RACINE, "packages/core/src/format.js");
  const script = `import(${JSON.stringify("file://" + mod)}).then(m => console.log(JSON.stringify(["2026-10-08", "2026-10-08T09:00:00", "2026-11-01", "2027-04-10"].map(m.jourFr))))`;
  const attendu = ["jeudi 8 octobre 2026", "jeudi 8 octobre 2026", "dimanche 1er novembre 2026", "samedi 10 avril 2027"];
  for (const tz of ["Europe/Paris", "America/Guadeloupe", "Pacific/Tahiti", "Pacific/Noumea"]) {
    const sortie = execFileSync(process.execPath, ["--input-type=module", "-e", script], { env: { ...process.env, TZ: tz } }).toString();
    assert.deepEqual(JSON.parse(sortie), attendu, tz);
  }
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

/* EXERCICE DU RATIO D'« AUJOURD'HUI » — 07/10/2026. Le chiffre et son annee sortent
   du meme exercice, dans @repere/core ; les quatre cas que l'ecran doit tenir. */
test("core — le rapport d'Aujourd'hui porte l'exercice de ses comptes, jamais une annee inventee", () => {
  const agregats = [["Recettes"], ["Depenses"], ["Dette"]];
  const base = { nom: "Essai", circo: 1 };
  // [population, recettes m, h, depenses m, h, dette m, h]
  const ex = [1000, 1200, 1200, 1100, 1100, 1600, 1600];
  const deriver = fiche => deriverAujourdhui({ fiche, commune: "00000", dep: "93", index: { agregats, sources: {} },
    projets: null, cat: null, pos: null, deputes: null, cal: null, agendaAN: null, evenements: null });
  // 1. exercice present : l'annee est celle des comptes
  const a = deriver({ ...base, comptes: { 2025: ex } });
  assert.equal(a.rapportDette.an, "2025");
  assert.equal(a.rapportDette.l, "Son encours de dette");
  assert.equal(a.rapportDette.v, "16,0 mois de recettes");
  // 2. aucun exercice publie : aucun rapport, donc aucune annee a afficher
  assert.equal(deriver({ ...base }).rapportDette, undefined);
  assert.equal(deriver({ ...base, comptes: { inconnu: ex } }).rapportDette, undefined, "une cle qui n'est pas une annee n'en devient pas une");
  // 3. exercice present mais sans donnee financiere utilisable : rien
  assert.equal(deriver({ ...base, comptes: { 2025: [1000, null, null, null, null, null, null] } }).rapportDette, undefined);
  // 4. deux publications differentes : l'ecran suit l'exercice reellement fourni
  assert.equal(deriver({ ...base, comptes: { 2024: ex } }).rapportDette.an, "2024");
  assert.equal(deriver({ ...base, comptes: { 2024: ex, 2025: ex } }).rapportDette.an, "2025");
  // le dernier exercice vide ne prete pas son annee au precedent
  assert.equal(deriver({ ...base, comptes: { 2024: ex, 2025: [1000, null, null, null, null, null, null] } }).rapportDette.an, "2024");
});

/* L'INTERCOMMUNALITE EN ILE-DE-FRANCE — 07/10/2026. La phrase nationale disait
   que l'intercommunalite decide des transports : faux en Ile-de-France (IDFM), et
   dans la Metropole du Grand Paris les dechets et l'eau relevent de l'EPT. */
test("core — ce que decide l'intercommunalite depend du territoire, lu dans la donnee", async () => {
  const { competencesIntercommunalite, chaineDecision, COMPETENCES } = await import("../packages/core/src/index.js");
  const mgp = { nom: "Metropole Du Grand Paris", delegues: [{ nom: "X" }] };
  // Metropole du Grand Paris, hors Paris : ni transports ni dechets attribues a la Metropole, l'EPT est nomme comme existant
  const a = competencesIntercommunalite({ agglo: mgp, regionCode: "11", dep: "93" });
  assert.doesNotMatch(a.decide, /transports|déchets|eau/);
  assert.ok(a.precisions.some(t => /établissement public territorial/.test(t) && /déchets ménagers, l'eau et l'assainissement/.test(t)));
  assert.ok(a.precisions.some(t => /Île-de-France Mobilités/.test(t)));
  assert.ok(a.precisions.every(t => !/Est Ensemble|Plaine Commune/.test(t)), "aucun nom d'EPT invente");
  assert.equal(a.sources.length, 2);
  // Paris : membre de la Metropole, d'aucun EPT
  const p = competencesIntercommunalite({ agglo: mgp, regionCode: "11", dep: "75" });
  assert.ok(p.precisions.every(t => !/territorial/.test(t)));
  // autre intercommunalite d'Ile-de-France : pas de transports
  const idf = competencesIntercommunalite({ agglo: { nom: "Ca Pays De Meaux" }, regionCode: "11", dep: "77" });
  assert.doesNotMatch(idf.decide, /transports/);
  assert.ok(idf.precisions.some(t => /Île-de-France Mobilités/.test(t)));
  // commune d'Ile-de-France sans intercommunalite publiee : meme regle, rien d'invente
  assert.doesNotMatch(competencesIntercommunalite({ agglo: null, regionCode: "11", dep: "77" }).decide, /transports/);
  // hors Ile-de-France : la phrase nationale, inchangee
  const ail = competencesIntercommunalite({ agglo: { nom: "Ca Du Pays Basque" }, regionCode: "75", dep: "64" });
  assert.equal(ail.decide, COMPETENCES.agglo);
  assert.deepEqual(ail.precisions, []);
  // region inconnue (index absent) : rien de specifique n'est affirme
  assert.equal(competencesIntercommunalite({ agglo: mgp, regionCode: undefined, dep: "93" }).precisions.length, 2, "la Metropole se reconnait a son nom, meme sans index");
  // la chaine, lue par le mobile, porte la meme regle
  const index = { departements: [{ code: "93", nom: "Seine-Saint-Denis", region_code: "11" }] };
  const n = chaineDecision({ fiche: { nom: "X", agglo: mgp }, paquet: {}, index, deputes: null, elusRegion: null, dep: "93" }).find(x => x.echelon === "agglo");
  assert.doesNotMatch(n.decide, /transports/);
  assert.equal(n.precisions.length, 2);
});

test("core — sur les donnees reelles : aucune commune d'Ile-de-France ne lit que son intercommunalite decide des transports", async (t) => {
  const { chaineDecision } = await import("../packages/core/src/index.js");
  const index = data("index.json");
  if (!index) return t.skip("donnees extraites absentes (lancer extract-html.js)");
  let vus = 0;
  for (const d of ["75", "77", "78", "91", "92", "93", "94", "95"]) {
    const pq = data(`departments/${d}.json`);
    if (!pq) continue;
    for (const fiche of Object.values(pq.communes)) {
      const n = chaineDecision({ fiche, paquet: pq, index, deputes: null, elusRegion: null, dep: d }).find(x => x.echelon === "agglo");
      assert.doesNotMatch(n.decide, /transports/, fiche.nom);
      assert.ok(n.precisions.some(x => /Île-de-France Mobilités/.test(x)), fiche.nom);
      vus++;
    }
  }
  assert.ok(vus > 1200, "trop peu de communes mesurees : " + vus);
});

test("core — « a venir » se juge a l'heure de Paris, comme les agendas, pas a l'heure UTC", async () => {
  /* 07/10/2026 : `toISOString()` (UTC) etait compare a des seances publiees a
     l'heure de Paris. A 15 h 30 a Paris, la seance de 14 h restait « a venir ». */
  const { minuteParis } = await import("../packages/core/src/aujourdhui.js");
  assert.equal(minuteParis(new Date("2026-10-07T13:30:00Z")), "2026-10-07T15:30", "heure d'ete : UTC+2");
  assert.equal(minuteParis(new Date("2026-12-01T13:30:00Z")), "2026-12-01T14:30", "heure d'hiver : UTC+1");
  assert.equal(minuteParis(new Date("2026-10-06T22:30:00Z")), "2026-10-07T00:30", "minuit passe a Paris : deja le lendemain");
  const fiche = { nom: "Témoin", circo: null };
  const agendaAN = { source: { producteur: "Assemblée nationale" }, evenements: [
    { debut: "2026-10-07T14:00", titre: "Séance de 14 h, déjà passée à 15 h 30", categorie: "Séance publique" },
    { debut: "2026-10-07T16:00", titre: "Séance de 16 h, à venir", categorie: "Séance publique" },
  ] };
  const a = deriverAujourdhui({ fiche, commune: "00000", dep: "93", index: { agregats: [], sources: {} },
    projets: null, cat: null, pos: null, deputes: null, cal: null, agendaAN, evenements: null,
    maintenant: new Date("2026-10-07T13:30:00Z") });
  assert.deepEqual(a.prochains.map(e => e.titre), ["Séance de 16 h, à venir"], "la seance de 14 h n'est plus annoncee a 15 h 30");
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

test("core — aucun delegue d'intercommunalite n'est mis en avant par le seul ordre du fichier", async (t) => {
  const { delegationIntercommunalite, REPLI_DELEGUES } = await import("../packages/core/src/visuels.js");
  const cons = n => ({ nom: "C" + n, fonction: "Conseiller communautaire" });
  const trois = delegationIntercommunalite([cons(1), cons(2), cons(3)]);
  assert.equal(trois.visibles.length, 3, "trois conseillers : tous visibles");
  const gros = [{ nom: "P", fonction: "Président du conseil communautaire" }, { nom: "V", fonction: "1er Vice-président du conseil communautaire" },
    ...Array.from({ length: 20 }, (_, i) => cons(i))];
  const g = delegationIntercommunalite(gros);
  assert.deepEqual(g.visibles.map(e => e.nom), ["P", "V"], "au-dela du seuil : seules les fonctions ecrites restent visibles");
  assert.equal(g.replies.length, 20);
  const sansFonction = delegationIntercommunalite(Array.from({ length: 12 }, (_, i) => cons(i)));
  assert.equal(sansFonction.visibles.length, 0, "douze conseillers : aucun n'est choisi pour etre montre");
  assert.equal(delegationIntercommunalite(undefined).total, 0);
  /* sur toutes les communes publiees : rien ne se perd, et aucun conseiller n'est
     montre seul quand les autres sont replies */
  const dossier = path.join(RACINE, "data", "departments");
  if (!fs.existsSync(dossier)) { t.skip("donnees non extraites"); return; }
  let n = 0;
  for (const f of fs.readdirSync(dossier).filter(x => x.endsWith(".json"))) {
    for (const c of Object.values(JSON.parse(fs.readFileSync(path.join(dossier, f), "utf8")).communes || {})) {
      const d = (c.agglo && c.agglo.delegues) || [];
      if (!d.length) continue;
      n++;
      const r = delegationIntercommunalite(d);
      assert.equal(r.visibles.length + r.replies.length, d.length, c.nom);
      if (d.length <= REPLI_DELEGUES) assert.equal(r.replies.length, 0, c.nom);
      else assert.ok(r.visibles.every(e => !/^conseill[eè]re? communautaire$/i.test(e.fonction)), c.nom);
    }
  }
  assert.ok(n > 10000, n + " communes avec delegues");
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

/* LES ELUS DU CANTON — 07/10/2026. Chaque canton elit un binome ; la chaine n'en
   nommait qu'un. Cas fabriques, puis les vraies donnees des huit departements. */
test("core — tous les elus du canton sont nommes, au meme rang", () => {
  const conseil = [
    { nom: "Présidente P", fonction: "Président du conseil départemental", canton: 9 },
    { nom: "Alain A", fonction: "1er Vice-président du conseil départemental", canton: 1 },
    { nom: "Béatrice B", fonction: "Conseiller départemental", canton: 1 },
    { nom: "Claire C", fonction: "Conseiller départemental", canton: 2 },
    { nom: "Denis D", fonction: "Conseiller départemental", canton: 2 },
  ];
  const paquet = { conseil_departemental: conseil, cantons: { 1: "Est", 2: "Ouest" } };
  // nominal : un canton, deux elus, aucun mis devant l'autre
  const bin = elusDepartement(paquet, { canton: [1] });
  assert.deepEqual(bin.elus.map(e => e.nom), ["Alain A", "Béatrice B"]);
  assert.equal(bin.nom, "Alain A et Béatrice B");
  assert.equal(bin.role, "Vos 2 conseillers départementaux · canton de Est");
  // la chaine que lit l'application mobile porte les deux
  const ch = chaineDecision({ fiche: { nom: "X", canton: [1] }, paquet, index: null, deputes: null, elusRegion: null, dep: "00" });
  const dept = ch.find(n => n.echelon === "dept");
  assert.equal(dept.personne.nom, "Alain A et Béatrice B");
  assert.deepEqual(dept.personnes.map(e => e.nom), ["Alain A", "Béatrice B"]);
  // plusieurs cantons : le nombre, les noms restent disponibles
  const multi = elusDepartement(paquet, { canton: [1, 2] });
  assert.equal(multi.nom, "4 conseillers départementaux");
  assert.equal(multi.role, "Élus sur les 2 cantons de la commune");
  assert.equal(multi.elus.length, 4);
  // source incomplete : un seul elu publie pour le canton, aucun second invente
  const seul = elusDepartement({ ...paquet, conseil_departemental: conseil.filter(e => e.nom !== "Béatrice B") }, { canton: [1] });
  assert.equal(seul.elus.length, 1);
  assert.equal(seul.nom, "Alain A");
  assert.match(seul.role, /canton de Est/);
  // pas de lien de canton : le premier du conseil, avec sa fonction
  const sans = elusDepartement(paquet, { canton: [] });
  assert.equal(sans.nom, "Présidente P");
  assert.equal(sans.parCanton, false);
  // canton inconnu du conseil : on ne pretend pas qu'il a des elus
  assert.equal(elusDepartement(paquet, { canton: [42] }).parCanton, false);
  // aucun conseil publie : rien, pas un nom
  assert.equal(elusDepartement({ conseil_departemental: [] }, { canton: [1] }), null);
  assert.equal(chaineDecision({ fiche: { nom: "X" }, paquet: {}, index: null, deputes: null, elusRegion: null, dep: "00" }).find(n => n.echelon === "dept").personne, null);
  assert.equal(listeFr(["A"]), "A");
  assert.equal(listeFr(["A", "B", "C"]), "A, B et C");
});

test("core — sur les donnees reelles : la chaine nomme chaque elu du canton de chaque commune", (t) => {
  let vus = 0;
  for (const d of ["77", "78", "91", "92", "93", "94", "95"]) {
    const pq = data(`departments/${d}.json`);
    if (!pq) return t.skip("donnees extraites absentes (lancer extract-html.js)");
    const conseil = pq.conseil_departemental || [];
    for (const fiche of Object.values(pq.communes)) {
      const attendus = conseil.filter(e => (fiche.canton || []).includes(e.canton)).map(e => e.nom);
      if (!attendus.length) continue;
      const dept = chaineDecision({ fiche, paquet: pq, index: null, deputes: null, elusRegion: null, dep: d }).find(n => n.echelon === "dept");
      assert.deepEqual(dept.personnes.map(e => e.nom), attendus, `${fiche.nom} (${d})`);
      if (attendus.length === 2) assert.equal(dept.personne.nom, attendus.join(" et "), fiche.nom);
      vus++;
    }
  }
  assert.ok(vus > 1000, "trop peu de communes mesurees : " + vus);
});

test("core — le departement se lit sur le code INSEE, outre-mer et Corse compris", () => {
  assert.equal(departementDe("77284"), "77");
  assert.equal(departementDe("2A004"), "2A");
  assert.equal(departementDe("2b033"), "2B");
  assert.equal(departementDe("97101"), "971", "outre-mer : trois chiffres, pas « 97 »");
  assert.equal(departementDe("97502"), "975");
  assert.equal(departementDe("98735"), "987");
  for (const faux of ["", "7728", "772840", "../77", null, "2C004"]) assert.equal(departementDe(faux), null, String(faux));
  /* Sur les donnees publiees : chaque commune de chaque paquet retombe sur son
     paquet. Sans donnees extraites, le controle le dit au lieu de passer en silence. */
  const dossier = path.join(RACINE, "data", "departments");
  if (!fs.existsSync(dossier)) { console.log("# departementDe : donnees non extraites, controle sur cas construits seulement"); return; }
  let n = 0;
  const faux = [];
  for (const f of fs.readdirSync(dossier).filter(x => /^[0-9AB]{2,3}\.json$/.test(x))) {
    const dep = f.replace(".json", "");
    for (const insee of Object.keys(JSON.parse(fs.readFileSync(path.join(dossier, f), "utf8")).communes || {})) {
      n++;
      if (departementDe(insee) !== dep) faux.push(insee + " -> " + departementDe(insee) + " (paquet " + dep + ")");
    }
  }
  assert.ok(n > 30000, "toutes les communes publiees sont lues (" + n + ")");
  assert.deepEqual(faux.slice(0, 10), [], faux.length + " commune(s) hors de leur paquet");
});

test("core — l'explication des salaires ne prete pas au departement ni a la region les services d'une commune", async () => {
  const { rapports } = await import("../packages/core/src/comptes.js");
  /* exercice fabrique : recettes, depenses, dette, investissement, salaires, impots */
  const ex = [1000, 1000000, 1000, 900000, 900, 100000, 100, 200000, 200, 300000, 300, 400000, 400];
  const sal = n => (rapports(ex, n).find(o => /salaires/.test(o.v)) || {}).d || "";
  assert.match(sal("commune"), /l'école, la cantine/);
  for (const n of ["departement", "region"]) {
    assert.ok(sal(n), n + " : la part des salaires existe");
    assert.doesNotMatch(sal(n), /école|cantine|état civil/, n);
  }
  assert.match(sal(undefined), /l'école, la cantine/, "par defaut, la commune");
});
