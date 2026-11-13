/* LES SENATEURS (13/11/2026) : le lecteur de la source, eprouve sur un extrait RECOPIE de l'echantillon
 * que le runner a pris sur senat.fr le 13/11/2026 (le conteneur ne joint pas la source). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { collecter, groupesDuSenat, licenceDeLaPage, senateurPublie, SENATEURS_MIN } from "../scripts/collecte-senat.mjs";

/* Tel quel dans le journal du runner, champs abreges. */
const IACOVELLI = {
  matricule: "19591F", nom: "Iacovelli", prenom: "Xavier", tri: "IACOVELLI_XAVIER", civilite: "M.", feminise: false,
  serie: "1", siege: 1, url: "/senateur/iacovelli_xavier19591f.html", urlAvatar: "/senimg/iacovelli_xavier19591f_carre.jpg",
  twitter: "iacovellixavier", facebook: "https://www.facebook.com/iacoxavier",
  organismes: [
    { code: "COM-SOCI", type: "COMMISSION", libelle: "Commission des affaires sociales", ordre: 7003 },
    { code: "AUTRES-UIP", type: "AUTRE", libelle: "Groupe français de l'Union Interparlementaire (U.I.P.)", ordre: 60018 },
    { code: "ETUDES-1014", type: "ETUDE", libelle: "Groupe d'études Handicap", ordre: 50001 },
  ],
  groupe: { code: "LREM", libelle: "Groupe Rassemblement des démocrates, progressistes et indépendants", libelleCourt: "RDPI", ordre: 6, codeTypeAppartenance: "N" },
};
const faux = (i, sigle) => ({ matricule: "M" + i, nom: "Nom" + String(i).padStart(3, "0"), prenom: "Prénom", civilite: "Mme", siege: i,
  url: "/senateur/x" + i + ".html", urlAvatar: "/senimg/x" + i + ".jpg", organismes: [], groupe: { code: sigle, libelle: "Groupe " + sigle, libelleCourt: sigle } });
const beaucoup = (n = SENATEURS_MIN + 48) => Array.from({ length: n }, (_, i) => faux(i + 1, ["UCI", "SER", "Les Républicains", "RDPI"][i % 4]));
const PAGE = '<html><body><p>Les jeux de données sont diffusés sous <a href="/licence">Licence Ouverte 2.0</a>.</p></body></html>';

test("sénateur : nom, groupe, siège, commission et fiche officielle — et rien d'autre", () => {
  const s = senateurPublie(IACOVELLI);
  assert.deepEqual(s, { id: "19591F", nom: "Iacovelli", prenom: "Xavier", groupe: "RDPI", civilite: "M.", siege: 1,
    groupeLibelle: "Groupe Rassemblement des démocrates, progressistes et indépendants",
    commission: "Commission des affaires sociales", fiche: "https://www.senat.fr/senateur/iacovelli_xavier19591f.html" });
});

test("sénateur : la photo du Sénat n'est jamais reprise (D27, ADR 0004) ; ni Twitter ni Facebook", () => {
  const s = JSON.stringify(senateurPublie(IACOVELLI));
  for (const interdit of ["senimg", "urlAvatar", "twitter", "facebook", "_carre.jpg"]) assert.ok(!s.includes(interdit), `le champ « ${interdit} » est repris`);
});

test("sénateur : une entrée sans matricule ou sans nom est écartée, jamais réparée", () => {
  assert.equal(senateurPublie({ nom: "Sans matricule" }), null);
  assert.equal(senateurPublie({ matricule: "X", nom: "" }), null);
  assert.equal(senateurPublie(null), null);
  assert.equal(senateurPublie({ matricule: "X", nom: "Nom" }).groupe, "", "sans groupe publié : vide, jamais un groupe deviné");
});

test("groupes du Sénat : ordre alphabétique du sigle, « sans groupe » au bout, jamais par taille (invariant 3)", () => {
  const g = groupesDuSenat([faux(1, "UCI"), faux(2, "UCI"), faux(3, "UCI"), faux(4, "SER"), { ...senateurPublie(faux(5, "X")), groupe: "" }].map(x => x.id ? x : senateurPublie(x)));
  assert.deepEqual(g.map(x => x.sigle), ["SER", "UCI", "Non inscrit ou sans groupe publié"]);
  assert.deepEqual(g.map(x => x.sieges), [1, 3, 1]);
  const parTaille = [...g].sort((a, b) => b.sieges - a.sieges).map(x => x.sigle);
  assert.notDeepEqual(g.map(x => x.sigle), parTaille, "l'ordre affiché n'est pas celui des tailles");
});

test("licence : relevée sur la page du Sénat, jamais devinée", () => {
  assert.equal(licenceDeLaPage(PAGE), "Licence Ouverte 2.0");
  assert.equal(licenceDeLaPage('<p>diffusé sous licence ouverte</p>'), "Licence Ouverte");
  assert.equal(licenceDeLaPage("<p>réutilisation sous ODbL</p>"), "ODbL");
  assert.equal(licenceDeLaPage("<p>aucune mention</p>"), null);
});

test("sénateurs : refuser plutôt qu'écraser — trop peu, trop peu de groupes, ou aucune licence lisible", async () => {
  await assert.rejects(() => collecter(null, { brut: [IACOVELLI], pageLicence: PAGE }), /moins de 300/);
  await assert.rejects(() => collecter(null, { brut: {}, pageLicence: PAGE }), /n'est plus un tableau/);
  const sansGroupe = beaucoup().map((s, i) => (i % 5 ? s : { ...s, groupe: {} }));
  await assert.rejects(() => collecter(null, { brut: sansGroupe, pageLicence: PAGE }), /moins de 95 %/);
  await assert.rejects(() => collecter(null, { brut: beaucoup(), pageLicence: "<p>rien</p>" }), /aucune licence lisible/);
});

test("sénateurs : le fichier publié porte sa source, sa licence relevée et sa date", async () => {
  const f = await collecter(null, { brut: [...beaucoup(), IACOVELLI], pageLicence: PAGE });
  assert.equal(f.senateurs.length, SENATEURS_MIN + 49);
  assert.equal(f.source.producteur, "Sénat");
  assert.equal(f.source.licence, "Licence Ouverte 2.0");
  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(f.genere_le));
  assert.ok(f.groupes.length >= 4 && f.groupes.every(g => g.sigle && g.sieges > 0));
  assert.equal(f.senateurs[0].nom.localeCompare(f.senateurs[1].nom, "fr") <= 0, true, "liste rangée par nom");
  assert.ok(!JSON.stringify(f).includes("senimg"), "aucune photo du Sénat dans le fichier publié");
});
