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
  calculerFaits, valeur, rapports, dernierExercice, evolution, deriverAujourdhui, phraseSemaineParlement,
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

/* 06/10/2026 : « voici les séances publiques » s'affichait au-dessus de
   commissions, quand la semaine comptait moins de trois seances. La phrase
   doit dire ce qui est montre, dans les trois cas. */
test("core — « Au Parlement » ne nomme séance publique que ce qui l'est", () => {
  const semaine = (cats) => deriverAujourdhui({
    fiche: { nom: "Test" }, commune: "93001", dep: "93", index: { departements: [], agregats: [] },
    projets: null, cat: null, pos: null, deputes: null, evenements: null,
    agendaAN: null, cal: { evenements: cats.map((c, i) => ({ debut: `2099-01-0${i + 1}T09:00`, titre: "r" + i, categorie: c })) },
    maintenant: new Date("2098-12-31T12:00:00Z"),
  });
  const sansSeance = semaine(["Commission", "Commission", "Commission", "Commission"]);
  const p0 = phraseSemaineParlement(sansSeance);
  assert.equal(sansSeance.seancesMontrees, 0);
  assert.match(p0, /Aucun n'est classé en séance publique/);
  assert.ok(!/Voici les \d+ premiers que/.test(p0), p0);

  const une = semaine(["Commission", "Séance publique", "Commission", "Commission"]);
  assert.equal(une.seancesMontrees, 1);
  assert.match(phraseSemaineParlement(une), /Voici le seul que .* classent en séance publique, puis les 2 premiers autres rendez-vous\./);

  const toutes = semaine(["Séance publique", "Séance publique", "Séance publique", "Séance publique", "Commission"]);
  assert.equal(toutes.seancesMontrees, 3);
  assert.match(phraseSemaineParlement(toutes), /^5 rendez-vous annoncés au Parlement cette semaine\. Voici les 3 premiers que l'Assemblée nationale et le Sénat classent en séance publique\.$/);
  assert.ok(toutes.prochains.every(e => e.categorie === "Séance publique"));

  const peu = semaine(["Commission", "Séance publique"]);
  assert.equal(phraseSemaineParlement(peu), "2 rendez-vous annoncés au Parlement cette semaine.");
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

/* Import a part (et non dans la liste du haut) : la PR « Au Parlement » modifie
   la liste du haut ; deux PR qui touchent la meme ligne ne se fusionnent pas. */
import { departementDe } from "../packages/core/src/index.js";

/* 06/10/2026 : le mobile composait le departement par insee.slice(0, 2), faux
   outre-mer. La regle du socle doit rester celle du script qui ECRIT les
   fichiers par departement : on relit la fonction du script, on compare. */
test("core — departementDe : outre-mer compris, et la meme regle que extract-html.js", () => {
  const cas = { "77284": "77", "64547": "64", "2A004": "2A", "2B033": "2B", "97101": "971", "97411": "974",
    "97611": "976", "97502": "975", "98818": "988", "01001": "01", "75056": "75" };
  for (const [insee, dep] of Object.entries(cas)) assert.equal(departementDe(insee), dep, insee);
  const src = fs.readFileSync(path.join(import.meta.dirname, "../scripts/extract-html.js"), "utf8");
  const m = src.match(/export function departementDe\(insee\) \{[\s\S]*?\n\}/);
  assert.ok(m, "departementDe introuvable dans scripts/extract-html.js");
  const duScript = new Function("return " + m[0].replace(/^export /, ""))();
  for (const insee of Object.keys(cas)) assert.equal(departementDe(insee), duScript(insee), "divergence sur " + insee);
});

test("core — « st » et « ste » trouvent Saint et Sainte, sans perdre Strasbourg", () => {
  const liste = [["93066", "Saint-Denis", motsCible("Saint-Denis")], ["91549", "Sainte-Geneviève-des-Bois", motsCible("Sainte-Geneviève-des-Bois")],
    ["67482", "Strasbourg", motsCible("Strasbourg")], ["94068", "Saint-Maur-des-Fossés", motsCible("Saint-Maur-des-Fossés")]];
  assert.deepEqual(trouverCommunes(liste, mots("st denis")).map(l => l[1]), ["Saint-Denis"]);
  assert.deepEqual(trouverCommunes(liste, mots("ste genevieve")).map(l => l[1]), ["Sainte-Geneviève-des-Bois"]);
  assert.ok(trouverCommunes(liste, mots("st")).some(l => l[1] === "Strasbourg"), "« st » ne trouve plus Strasbourg");
  assert.equal(trouverCommunes(liste, mots("st denis"))[0][1], "Saint-Denis");
});

/* 06/10/2026 : « nouveau » = absent de la version que l'appareil connaissait.
   Sans version precedente, rien n'est dit ; deux versions identiques : rien. */
import { changementsCommune } from "../packages/core/src/index.js";
test("core — changementsCommune ne dit « nouveau » que ce qui l'est", () => {
  const fiche = { nom: "X", maire: { nom: "A B" }, circo: 3, comptes: { 2024: [1], 2025: [1] } };
  const cat = { scrutins: [{ u: "U1", n: "1", d: "2026-07-01", t: "t", s: "adopté" }] };
  const deputes = { deputes: { "77-3": { prenom: "Jeanne", nom: "D", acteurRef: "PA1" } } };
  const pos = { positions: { 1: { PA1: "p" }, 2: { PA1: "c" } } };
  const projets = { communes: { "77001": [{ annee: 2025, dispositif: "DETR", intitule: "École", subvention: 10 }] } };
  const base = { fiche, cat, pos, deputes, projets };
  const tous = { dep: true, proj: true, scr: true, deputes: true };
  const appel = (apres, connus = tous, avant = base) => changementsCommune({ commune: "77001", dep: "77", avant, apres: { ...base, ...apres }, connus });

  assert.deepEqual(appel({}).changements, [], "deux versions identiques : rien de nouveau");
  assert.equal(appel({}).compare, true);
  const sansRien = appel({ fiche: { ...fiche, maire: { nom: "C D" } } }, { dep: false, proj: false, scr: false, deputes: false });
  assert.equal(sansRien.compare, false); assert.deepEqual(sansRien.changements, [], "sans version precedente, rien n'est affirme");

  const vote = appel({ cat: { scrutins: [...cat.scrutins, { u: "U2", n: "2", d: "2026-10-14", t: "t2", s: "adopté" }] } });
  assert.deepEqual(vote.changements.map(c => c.type + ":" + (c.fait && c.fait.sc.n)), ["vote:2"]);
  assert.equal(appel({ fiche: { ...fiche, maire: { nom: "C D" } } }).changements[0].type, "maire");
  assert.deepEqual(appel({ fiche: { ...fiche, maire: null } }).changements, [], "un nom absent n'est pas un changement de maire");
  assert.equal(appel({ deputes: { deputes: { "77-3": { prenom: "Paul", nom: "E", acteurRef: "PA1" } } } }).changements[0].type, "depute");
  assert.deepEqual(appel({ fiche: { ...fiche, comptes: { ...fiche.comptes, 2026: [1] } } }).changements, [{ type: "comptes", an: "2026" }]);
  const pj = appel({ projets: { communes: { "77001": [...projets.communes["77001"], { annee: 2026, dispositif: "DSIL", intitule: "Gymnase", subvention: 5 }] } } });
  assert.deepEqual(pj.changements.map(c => c.type + ":" + c.p.intitule), ["projet:Gymnase"]);
  /* plusieurs circonscriptions : un decompte, jamais un depute nomme */
  const multi = appel({ fiche: { ...fiche, circo: [1, 3] }, cat: { scrutins: [...cat.scrutins, { u: "U2", n: "2", d: "2026-10-14", t: "t2", s: "adopté" }] } }, tous, { ...base, fiche: { ...fiche, circo: [1, 3] } });
  assert.deepEqual(multi.changements.map(c => c.type), ["votes"]);
  /* une famille non comparee ne parle pas, les autres si */
  const partiel = appel({ fiche: { ...fiche, maire: { nom: "C D" } }, cat: { scrutins: [{ u: "U9", n: "9", d: "2026-10-14", t: "t", s: "adopté" }] } }, { ...tous, scr: false });
  assert.deepEqual(partiel.changements.map(c => c.type), ["maire"]);
});

/* 06/10/2026 : le fait valide d'un scrutin, et sa nouveaute. */
import { faitDuScrutin, premierePhrase, etatDuTexte } from "../packages/core/src/index.js";
test("core — faits éditoriaux : reliés par la page du scrutin, nouveaux seulement s'ils l'ont été", () => {
  const ev = { r: [
    { id: "scrutin-2026-07-21-8430", t: "Protection des enfants", d: "2026-07-21", e: "france", conf: "verifie", src: "https://www.assemblee-nationale.fr/dyn/17/scrutins/8430",
      axes: "Le texte porte sur la protection de l'enfance. Il encadre la durée des placements (un an pour les moins de 3 ans).",
      txt: "Résultat du scrutin : adopté, le 2026-07-21. Le texte n'est pas la loi définitive.\n\nPour : 378" },
    { id: "autre", t: "Protection des enfants (titre proche)", d: "2026-07-21", e: "france", conf: "a_confirmer", src: "https://exemple.fr/84300" },
  ] };
  assert.equal(faitDuScrutin(ev, { n: "8430" }).id, "scrutin-2026-07-21-8430");
  assert.equal(faitDuScrutin(ev, { n: "843" }), null, "un numero proche ne relie pas");
  assert.equal(faitDuScrutin(null, { n: "8430" }), null);
  assert.equal(premierePhrase(ev.r[0].axes), "Le texte porte sur la protection de l'enfance.");
  assert.equal(premierePhrase("Une seule phrase (3,5 %) sans coupure"), "Une seule phrase (3,5 %) sans coupure");
  assert.equal(etatDuTexte(ev.r[0]), "Résultat du scrutin : adopté, le 21 juillet 2026. Le texte n'est pas la loi définitive.");
  const base = { fiche: { nom: "X", circo: 1 }, evenements: { r: [ev.r[0]] } };
  const avecNouveau = { ...base, evenements: { r: [...ev.r, { id: "cc-x", t: "Décision", d: "2026-08-14", e: "france", conf: "verifie", src: "https://cc.fr" }] } };
  const c = changementsCommune({ commune: "77001", dep: "77", avant: base, apres: avecNouveau, connus: { evt: true } });
  assert.deepEqual(c.changements.map(x => x.type + ":" + x.e.id), ["editorial:cc-x"], "seul le fait verifie et absent avant est nouveau");
  const sans = changementsCommune({ commune: "77001", dep: "77", avant: base, apres: avecNouveau, connus: { evt: false } });
  assert.deepEqual(sans.changements, [], "sans version precedente du fil, rien n'est nouveau");
});

/* 06/10/2026 : le fil editorial controle de bout en bout. Chaque defaut est
   fabrique et doit etre nomme ; puis le fil reellement extrait doit etre sain. */
import { controlerFaits, sourceOfficielle } from "../packages/core/src/index.js";
test("core — controlerFaits nomme chaque défaut du fil éditorial", () => {
  const bon = { id: "scrutin-2026-07-21-8430", t: "T", d: "2026-07-21", e: "france", conf: "verifie", axes: "A.", src: "https://www.assemblee-nationale.fr/dyn/17/scrutins/8430" };
  const cat = { scrutins: [{ n: "8430", d: "2026-07-21" }] };
  const quand = new Date("2026-10-06T00:00:00Z");
  assert.deepEqual(controlerFaits({ r: [bon] }, cat, quand), []);
  const un = (modif) => controlerFaits({ r: [{ ...bon, ...modif }] }, cat, quand);
  assert.match(un({ src: "https://exemple.com/?assemblee-nationale.fr" })[0], /non officielle/, "une sous-chaine ne suffit plus");
  assert.match(un({ src: "http://www.assemblee-nationale.fr/dyn/17/scrutins/8430" })[0], /non officielle/, "http refuse");
  assert.match(un({ conf: "auto" })[0], /confiance inconnue/);
  assert.match(un({ axes: " " })[0], /grands axes absents/);
  assert.match(un({ d: "2026-07-20" })[0], /différente de celle du scrutin/);
  assert.match(un({ d: "2027-01-01" })[0], /futur/);
  assert.match(un({ id: "scrutin-2026-07-21-8431" })[0], /ne porte pas le numéro/);
  assert.match(un({ e: "ville" })[0], /sans territoire/);
  assert.match(un({ axes_src: "https://journal.example/axes" })[0], /axes non officielle/);
  assert.ok(controlerFaits({ r: [bon, { ...bon }] }, cat, quand).some(x => /en double/.test(x)));
  assert.ok(controlerFaits({ r: [bon, { ...bon, id: "autre" }] }, cat, quand).some(x => /deuxième fait pour le scrutin 8430/.test(x)));
  assert.match(controlerFaits({ evenements: [bon] }, cat, quand)[0], /sans liste « r »/, "la mauvaise cle est un defaut, pas un fil vide");
  assert.ok(sourceOfficielle("https://www.prefectures-regions.gouv.fr/x") && sourceOfficielle("https://www.senat.fr/leg/pjl25-911.html"));
  assert.ok(sourceOfficielle("https://www.ville-meaux.fr/deliberations/2026") && !sourceOfficielle("https://www.ville-meaux.fr/actualites"));
});
test("données — le fil éditorial extrait est sain (aucun fait sans source ni validation)", (t) => {
  const ev = data("evenements.json"), cat = data("scrutins.json");
  if (!ev) return t.skip("evenements.json absent des donnees extraites");
  const defauts = controlerFaits(ev, cat);
  assert.deepEqual(defauts, [], defauts.join("\n"));
});
test("core — la liste des sources officielles du socle couvre celle de outils/evenements.py", () => {
  const py = fs.readFileSync(path.join(import.meta.dirname, "../../outils/evenements.py"), "utf8");
  const m = py.match(/DOMAINES = \(([\s\S]*?)\n\)/);
  assert.ok(m, "DOMAINES introuvable dans outils/evenements.py");
  const doms = [...m[1].matchAll(/"([^"]+)"/g)].map(x => x[1]).filter(d => !d.startsWith("."));
  const manque = doms.filter(d => !sourceOfficielle("https://" + d + "/x"));
  assert.deepEqual(manque, [], "deux listes qui derivent : " + manque.join(", "));
});
import { estVoteDeTexte } from "../packages/core/src/index.js";
test("core — seul le vote sur l'ensemble d'un texte est candidat au fil", () => {
  assert.ok(estVoteDeTexte("l'ensemble du projet de loi de finances pour 2027"));
  assert.ok(estVoteDeTexte("L'ensemble de la proposition de loi relative au droit à l'aide à mourir (lecture définitive)."));
  for (const t of ["La motion de rejet préalable, déposée par Mme X, du projet de loi …", "La proposition du Gouvernement de prolonger la séance en cours au delà de minuit",
    "L'amendement n° 7 du Gouvernement au projet de loi …", "Le sous-amendement n° 2 de Mme Y", "l'article 12 de la proposition de loi …", ""])
    assert.equal(estVoteDeTexte(t), false, t);
});
