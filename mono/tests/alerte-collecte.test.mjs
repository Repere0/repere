// Alerte de collecte (12/11/2026) : une étape non bloquante qui avertit deux JOURS de suite alerte.
// Règle pure de outils/alerte_collecte.mjs ; l'ouverture de l'issue (gh) n'est pas jouée ici.
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculer, cle, corps, SEUIL } from "../../outils/alerte_collecte.mjs";

const M = "presidentielle 2027 non publiee (fichier mal forme ou absent)";

test("un seul jour d'échec n'alerte pas ; le deuxième jour alerte", () => {
  const j1 = calculer(null, [M], "2026-11-10");
  assert.equal(j1.alertes.length, 0);
  const j2 = calculer(j1.etat, [M], "2026-11-11");
  assert.equal(j2.alertes.length, 1);
  assert.equal(j2.alertes[0].jours, SEUIL);
  assert.equal(j2.alertes[0].depuis, "2026-11-10");
});

test("deux runs le même jour ne comptent qu'un jour", () => {
  const a = calculer(null, [M], "2026-11-10");
  const b = calculer(a.etat, [M, M], "2026-11-10");
  assert.equal(b.etat.etapes[cle(M)].jours, 1);
  assert.equal(b.alertes.length, 0);
});

test("une étape rétablie disparaît de l'état : la série repart de zéro", () => {
  const j1 = calculer(null, [M], "2026-11-10");
  const j2 = calculer(j1.etat, [], "2026-11-11");
  assert.deepEqual(j2.etat.etapes, {});
  assert.equal(calculer(j2.etat, [M], "2026-11-12").alertes.length, 0);
});

test("la clé ignore les nombres qui changent d'un jour à l'autre", () => {
  assert.equal(cle("12 sources en echec le 2026-11-10"), cle("3 sources en echec le 2026-11-11"));
  const j2 = calculer(calculer(null, ["12 sources en echec"], "2026-11-10").etat, ["3 sources en echec"], "2026-11-11");
  assert.equal(j2.alertes.length, 1);
});

test("le corps de l'issue nomme l'étape, sa durée et le run", () => {
  const j2 = calculer(calculer(null, [M], "2026-11-10").etat, [M], "2026-11-11");
  const t = corps(j2.alertes, "https://exemple/run/1", "2026-11-11");
  assert.match(t, /presidentielle 2027 non publiee/);
  assert.match(t, /depuis le 2026-11-10/);
  assert.match(t, /https:\/\/exemple\/run\/1/);
});
