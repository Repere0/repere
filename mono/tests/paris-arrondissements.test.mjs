/* PARIS PAR ARRONDISSEMENT (17/11/2026) : la collecte n'écrit que ce qu'elle lit sûrement.
   Fixtures construites sur docs/schema_circos_bv.md (colonnes réelles de la table des bureaux). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { arrondissementsDe, circonscriptionsParArrondissement, lireCsv, mairesParArrondissement } from "../scripts/collecte-paris-arrondissements.mjs";

const ENTETE = "codeDepartement,nomDepartement,codeCirconscription,nomCirconscription,codeCommune,nomCommune,numeroBureauVote,codeBureauVote";
const bureau = (arr, n, circ) => `75,Paris,${circ},${Number(circ.slice(2))}ème circonscription,75056,Paris,${String(arr).padStart(2, "0")}${String(n).padStart(2, "0")},75056_${String(arr).padStart(2, "0")}${String(n).padStart(2, "0")}`;
const tous = (extra = []) => lireCsv([ENTETE, "01,Ain,0104,4ème circonscription,01001,L'Abergement,0001,01001_0001",
  ...Array.from({ length: 20 }, (_, i) => bureau(i + 1, 1, `75${String((i % 18) + 1).padStart(2, "0")}`)), ...extra].join("\n"));

test("bureaux : chaque arrondissement reçoit ses circonscriptions, un arrondissement partagé les garde toutes", () => {
  const r = circonscriptionsParArrondissement(tous([bureau(11, 2, "7506"), bureau(11, 3, "7507")]));
  assert.equal(r.raison, null);
  assert.deepEqual(r.par["11"], ["75-6", "75-7", "75-11"].sort((x, y) => Number(x.slice(3)) - Number(y.slice(3))));
  assert.equal(Object.keys(r.par).length, 20);
});

test("bureaux : un numéro illisible ou un arrondissement manquant = rien d'écrit", () => {
  assert.match(circonscriptionsParArrondissement(tous([`75,Paris,7501,1ère,75056,Paris,9901,75056_9901`])).raison, /illisible/);
  const sans20 = lireCsv([ENTETE, ...Array.from({ length: 19 }, (_, i) => bureau(i + 1, 1, "7501"))].join("\n"));
  assert.match(circonscriptionsParArrondissement(sans20).raison, /sans bureau : 20/);
  assert.match(circonscriptionsParArrondissement(lireCsv("a,b\n1,2")).raison, /colonnes attendues absentes/);
});

test("RNE : arrondissement lu au code INSEE ou au libellé, Paris Centre vaut pour les 1er à 4e", () => {
  assert.deepEqual(arrondissementsDe("75111", ""), ["11"]);
  assert.deepEqual(arrondissementsDe("", "Paris 1er"), ["1"]);
  assert.deepEqual(arrondissementsDe("", "Paris Centre"), ["1", "2", "3", "4"]);
  assert.equal(arrondissementsDe("75056", "Paris"), null);
  assert.equal(arrondissementsDe("93066", "Saint-Denis"), null);
});

const TETE_RNE = "Code de la commune;Libellé de la commune;Nom de l'élu;Prénom de l'élu;Code sexe;Date de naissance;Libellé de la fonction;Date de début de la fonction";
const ligneRne = (code, lib, nom, fn) => `${code};${lib};${nom};Anne;F;01/01/1970;${fn};03/07/2020`;
test("RNE : un maire par arrondissement, adjoints ignorés, seuls nom, fonction et date gardés", () => {
  const lignes = [ligneRne("", "Paris Centre", "CENTRE", "Maire de secteur"),
    ...Array.from({ length: 16 }, (_, i) => ligneRne(`751${String(i + 5).padStart(2, "0")}`, `Paris ${i + 5}e`, `NOM${i + 5}`, "Maire d'arrondissement")),
    ligneRne("75111", "Paris 11e", "ADJOINT", "1er adjoint au maire d'arrondissement")];
  const r = mairesParArrondissement(lireCsv([TETE_RNE, ...lignes].join("\n")));
  assert.equal(r.raison, null);
  assert.deepEqual(r.par["2"], { maire: "Anne CENTRE", fonction: "Maire de secteur", debut: "03/07/2020" });
  assert.equal(r.par["11"].maire, "Anne NOM11");
  assert.ok(!JSON.stringify(r.par).includes("1970"), "jamais la date de naissance");
});

test("RNE : moins de 16 arrondissements sûrs = rien d'écrit ; deux maires pour un arrondissement = aucun", () => {
  const peu = mairesParArrondissement(lireCsv([TETE_RNE, ligneRne("75105", "Paris 5e", "A", "Maire d'arrondissement")].join("\n")));
  assert.equal(peu.par, null);
  const lignes = Array.from({ length: 20 }, (_, i) => ligneRne(`751${String(i + 1).padStart(2, "0")}`, "", `N${i}`, "Maire d'arrondissement"));
  const r = mairesParArrondissement(lireCsv([TETE_RNE, ...lignes, ligneRne("75107", "", "AUTRE", "Maire d'arrondissement")].join("\n")));
  assert.equal(r.par["7"], undefined);
  assert.equal(Object.keys(r.par).length, 19);
});

test("RNE : la description de Paris compte secteurs et fonctions, sans aucun nom d'élu", async () => {
  const { resumeParis } = await import("../scripts/collecte-paris-arrondissements.mjs");
  const table = lireCsv("Code du département;Code de la commune;Libellé du secteur;Nom de l'élu;Prénom de l'élu;Libellé de la fonction\n"
    + "75;75056;Paris Secteur 11;FICTIF;Un;Maire d'arrondissement\n75;75056;Paris Secteur 11;FICTIF;Deux;\n13;13055;Marseille Secteur 1;FICTIF;Trois;\n");
  const r = resumeParis(table);
  assert.equal(r.lignes, 2);
  assert.deepEqual(r.secteurs, { "Paris Secteur 11": 2 });
  assert.deepEqual(r.fonctions, { "Maire d'arrondissement": 1, "(vide)": 1 });
  assert.ok(!JSON.stringify(r).includes("FICTIF"), "aucun nom d'élu dans la description");
});
