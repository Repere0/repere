/* GARDE : les mots du glossaire sont relies a leur definition, une fois par texte
 * (15/10/2026). Mot entier, casse, accents et pluriel ignores ; un mot absent du
 * glossaire n'a jamais de lien ; un texte sans mot reste intact.
 * Lancer : node --test tests/termes-dictionnaire.test.mjs */
import { test } from "node:test";
import assert from "node:assert/strict";

const { termesDuTexte, GLOSSAIRE } = await import("../packages/core/src/index.js");
const reconstituer = segs => segs.map(x => x.t).join("");
const liens = segs => segs.filter(x => x.cle).map(x => [x.t, x.cle]);

test("un mot du glossaire est relie a sa definition, au bon endroit", () => {
  const t = "Votre commune est dans la 6e circonscription. Le 21 juillet 2026.";
  const segs = termesDuTexte(t);
  assert.deepEqual(liens(segs), [["circonscription", "circonscription"]]);
  assert.equal(reconstituer(segs), t, "le texte ne doit ni changer ni perdre de caractere");
});

test("le pluriel, la casse et les accents sont reconnus", () => {
  assert.deepEqual(liens(termesDuTexte("Meaux est partagée entre 3 circonscriptions.")), [["circonscriptions", "circonscription"]]);
  assert.deepEqual(liens(termesDuTexte("Une INTERCOMMUNALITE de 12 communes")), [["INTERCOMMUNALITE", "intercommunalité"]]);
  assert.deepEqual(liens(termesDuTexte("Des scrutins solennels")), [["scrutins solennels", "scrutin solennel"]]);
});

test("un mot seul dans un mot plus long n'est pas relie", () => {
  assert.deepEqual(liens(termesDuTexte("une circonscriptionnelle seule")), []);
});

test("un seul lien par mot et par texte", () => {
  const segs = termesDuTexte("Intercommunalité : la même intercommunalité que plus haut");
  assert.equal(liens(segs).length, 1);
  assert.equal(reconstituer(segs), "Intercommunalité : la même intercommunalité que plus haut");
});

test("un texte sans mot du glossaire reste un seul morceau", () => {
  assert.deepEqual(termesDuTexte("Aucun mot ici."), [{ t: "Aucun mot ici." }]);
  assert.deepEqual(termesDuTexte(""), []);
  assert.deepEqual(termesDuTexte(null), []);
});

test("chaque lien renvoie a une entree existante du glossaire", () => {
  const texte = Object.values(GLOSSAIRE).map(m => m.titre).join(" ; ");
  for (const [, cle] of liens(termesDuTexte(texte))) assert.ok(GLOSSAIRE[cle], `cle inconnue : ${cle}`);
});
