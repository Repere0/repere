/* LE REPÈRE DU JOUR — contrôles du rituel quotidien (V51, 03/11/2026).
 *
 * Les données de test sont construites au format réel des comptes (tableau plat
 * [population, montant, par habitant, ...]) et les rapports sont calculés par la
 * vraie fonction rapports() : un test qui fabrique son propre texte ne prouve rien.
 * Usage : node --test tests/repere-du-jour.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";
import { faitsDuJour, empreinte, cleDuJour, MODELES, rapports } from "../packages/core/src/index.js";

/* Comptes fictifs mais de forme réelle : une commune « Testville » de 10 000 habitants. */
const EX = [10000,
  12000000, 1200,   // 0 recettes
  11000000, 1100,   // 1 dépenses
  5000000, 500,     // 2 dette
  2000000, 200,     // 3 investissement
  4000000, 400,     // 4 salaires
  6000000, 600];    // 5 impôts et taxes

const EXERCICE = { an: 2025, ex: EX };
const FICHE = { maire: { nom: "Jean Dupont" } };
const VOTE = {
  position: "p", qui: "Xavier Breton", circo: 1,
  sc: { d: "2026-07-15", t: "Projet de loi de test", n: "8706", dec: { pour: "300", contre: "250", abstentions: "10" } },
};
const RAPPORTS = rapports(EX);
const CONTEXTE = (date, extra = {}) => ({
  nom: "Testville", insee: "77999", date, exercice: EXERCICE, rapportsComptes: RAPPORTS,
  fiche: FICHE, vote: VOTE, nbCircos: 1, ...extra,
});
const jour = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0);

test("repere du jour — empreinte FNV-1a stable (valeur de référence de « a »)", () => {
  assert.equal(empreinte("a"), 0xe40c292c);
});

test("repere du jour — même commune, même jour : mêmes trois faits", () => {
  const a = faitsDuJour(CONTEXTE(jour(2026, 11, 3)));
  const b = faitsDuJour(CONTEXTE(jour(2026, 11, 3)));
  assert.deepEqual(a, b);
  assert.ok(a.length >= 1 && a.length <= 3, "trois faits au plus");
});

test("repere du jour — le fait change de jour en jour", () => {
  const textes = new Set();
  for (let j = 1; j <= 10; j++) {
    textes.add(faitsDuJour(CONTEXTE(jour(2026, 11, j))).map(f => f.texte).join("|"));
  }
  assert.ok(textes.size >= 3, `sur dix jours, au moins trois sélections différentes (obtenu ${textes.size})`);
});

test("repere du jour — rotation sans mémoire : deux jours de suite, aucun fait repris à son emplacement ; un même fait revient après 6 jours au moins", () => {
  /* Fixture : 12 modèles budget (2 par jour) et 6 modèles élus (1 par jour) ; intervalle
     mesuré sur 30 jours = 6 jours pour chaque emplacement (voir repere-du-jour.js). */
  const seq = [];
  for (let j = 1; j <= 30; j++) seq.push(faitsDuJour(CONTEXTE(jour(2026, 11, j))).map(f => f.id));
  for (let j = 0; j < 29; j++) {
    for (const rang of [0, 1, 2]) {
      assert.notEqual(seq[j][rang], seq[j + 1][rang], `emplacement ${rang} identique les jours ${j + 1} et ${j + 2}`);
    }
  }
  for (const rang of [0, 1, 2]) {
    const dernier = {};
    let mini = Infinity;
    seq.forEach((s, i) => {
      const id = s[rang];
      if (id === undefined) return;
      if (dernier[id] !== undefined) mini = Math.min(mini, i - dernier[id]);
      dernier[id] = i;
    });
    assert.ok(mini >= 6, `emplacement ${rang} : un fait revient après ${mini} jour(s), au moins 6 attendus`);
  }
});

test("repere du jour — « Ma rue » : aucun fait national (vote, circonscription) ; trois faits tant qu'il y a des modèles locaux", () => {
  for (let j = 1; j <= 30; j++) {
    const faits = faitsDuJour({ ...CONTEXTE(jour(2026, 11, j)), niveau: "rue" });
    assert.ok(faits.every(f => f.echelon !== "france"), `le ${j} novembre, un fait national sort en « Ma rue » : ${faits.map(f => f.id).join(", ")}`);
    assert.equal(faits.length, 3, `le ${j} novembre : trois faits attendus en « Ma rue » (obtenu ${faits.length})`);
  }
  /* Sans réglage (undefined), tout est proposé : le national reste dans le choix. */
  const tous = [];
  for (let j = 1; j <= 30; j++) tous.push(...faitsDuJour(CONTEXTE(jour(2026, 11, j))).map(f => f.echelon));
  assert.ok(tous.includes("france"), "sans réglage, le national doit pouvoir apparaître");
});

test("repere du jour — évolution entre deux exercices : sens écrit, calcul annoncé, rien sans exercice précédent", () => {
  /* Même disposition que EX : [population, recettes, /hab, dépenses, /hab, dette, /hab, ...].
     2024 : recettes 1080 /hab, dépenses 1000 /hab, dette 550 /hab. 2025 (EX) : 1200, 1100, 500. */
  const EX24 = [10000, 10800000, 1080, 10000000, 1000, 5500000, 550, 2000000, 200, 4000000, 400, 6000000, 600];
  const comptes = { "2024": EX24, "2025": EX };
  const textes = [];
  for (let j = 1; j <= 30; j++) {
    textes.push(...faitsDuJour({ ...CONTEXTE(jour(2026, 11, j)), comptes }).map(f => f));
  }
  const tous = textes.map(f => f.texte);
  assert.ok(tous.includes("Les dépenses par habitant de Testville ont augmenté de 10 % entre 2024 et 2025."), "hausse des dépenses absente sur 30 jours");
  assert.ok(tous.includes("Les recettes par habitant de Testville ont augmenté de 11 % entre 2024 et 2025."), "hausse des recettes absente sur 30 jours");
  assert.ok(tous.includes("La dette par habitant de Testville a diminué de 9 % entre 2024 et 2025."), "baisse de la dette absente sur 30 jours");
  const calcules = textes.filter(f => /entre 2024 et 2025/.test(f.texte));
  assert.ok(calcules.every(f => f.calcul === true && f.source === "comptes-calcul"), "une évolution doit s'annoncer comme calcul");
  /* Sans exercice précédent : aucune évolution, jamais un zéro ni un pourcentage inventé. */
  for (let j = 1; j <= 30; j++) {
    const sans = faitsDuJour(CONTEXTE(jour(2026, 11, j))).map(f => f.texte);
    assert.ok(sans.every(t => !/entre \d{4} et/.test(t)), "une évolution apparaît sans exercice précédent");
  }
});

test("repere du jour — la clé du jour est locale et ne dépend que de la date", () => {
  assert.equal(cleDuJour(jour(2026, 11, 3)), "2026-11-03");
  assert.equal(cleDuJour(new Date(2026, 0, 9, 23, 59)), "2026-01-09");
});

test("repere du jour — aucune donnée inventée : sans budget ni vote, rien n'est produit", () => {
  const vide = faitsDuJour({ nom: "Testville", insee: "77999", date: jour(2026, 11, 3), exercice: null, rapportsComptes: [], fiche: {}, vote: null, nbCircos: 0 });
  assert.deepEqual(vide, []);
});

test("repere du jour — aucun texte ne laisse passer null, undefined ou NaN", () => {
  for (let j = 1; j <= 20; j++) {
    for (const f of faitsDuJour(CONTEXTE(jour(2026, 11, j)))) {
      assert.doesNotMatch(f.texte, /\b(null|undefined|NaN)\b/, f.texte);
    }
  }
});

test("repere du jour — chaque fait porte sa source ; les calculs s'annoncent comme tels", () => {
  const tous = [];
  for (let j = 1; j <= 30; j++) tous.push(...faitsDuJour(CONTEXTE(jour(2026, 11, j))));
  assert.ok(tous.length > 0);
  for (const f of tous) {
    assert.ok(["comptes", "comptes-calcul", "scrutin", "elus"].includes(f.source), f.source);
    assert.equal(f.calcul, f.source === "comptes-calcul", f.texte);
  }
});

test("repere du jour — budget et élu : chaque jour où les deux existent, les deux catégories sont présentes", () => {
  for (let j = 1; j <= 30; j++) {
    const fx = faitsDuJour(CONTEXTE(jour(2026, 11, j)));
    assert.ok(fx.some(f => f.categorie === "budget"), `jour ${j} : aucun fait budget`);
    assert.ok(fx.some(f => f.categorie === "elus"), `jour ${j} : aucun fait élu`);
  }
});

test("repere du jour — repli : sans budget, les faits viennent des élus seulement", () => {
  const fx = faitsDuJour(CONTEXTE(jour(2026, 11, 3), { exercice: null, rapportsComptes: [] }));
  assert.ok(fx.length > 0);
  assert.ok(fx.every(f => f.categorie === "elus"));
});

test("repere du jour — le vote garde le nom du député en capitales telles quelles (pas de minuscule)", () => {
  const tous = [];
  for (let j = 1; j <= 30; j++) tous.push(...faitsDuJour(CONTEXTE(jour(2026, 11, j))));
  const vote = tous.find(f => f.texte.includes("Xavier Breton"));
  assert.ok(vote, "un fait de vote nomme le député");
  assert.match(vote.texte, /Xavier Breton a voté/);
  assert.doesNotMatch(vote.texte, /xavier Breton/);
});

test("repere du jour — solde budgétaire : les deux sens sont écrits, avec le bon signe", () => {
  const surplus = [10000, 12000000, 1200, 11000000, 1100];
  const deficit = [10000, 11000000, 1100, 12000000, 1200];
  /* La rotation (V51, correction) montre deux budgets par jour sur quatre disponibles : le
     solde n'est pas forcément le 3 novembre. On le cherche sur dix jours ; le signe, lui,
     reste contrôlé à chaque occurrence. */
  const pour = ex => {
    for (let j = 1; j <= 10; j++) {
      const t = faitsDuJour({ nom: "T", insee: "1", date: jour(2026, 11, j), exercice: { an: 2025, ex }, rapportsComptes: [], fiche: {}, vote: null, nbCircos: 0 })
        .map(f => f.texte).find(x => /de plus qu/.test(x));
      if (t) return t;
    }
    return undefined;
  };
  assert.match(pour(surplus), /a encaissé 100 € par habitant de plus qu'elle n'a dépensé/);
  assert.match(pour(deficit), /a dépensé 100 € par habitant de plus qu'elle n'a encaissé/);
});

test("repere du jour — au plus trois faits, et chaque modèle a un identifiant unique", () => {
  for (let j = 1; j <= 30; j++) assert.ok(faitsDuJour(CONTEXTE(jour(2026, 11, j))).length <= 3);
  const ids = MODELES.map(m => m.id);
  assert.equal(new Set(ids).size, ids.length, "identifiants uniques");
  assert.ok(MODELES.length >= 15, `au moins 15 modèles (obtenu ${MODELES.length})`);
});
