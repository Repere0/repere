/* Garde de l'outil de photos (20/10/2026) : une image n'est prise que si la fiche la designe,
   jamais un logo, jamais une page d'erreur, jamais une adresse devinee. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { extraireImage, typeImageValide, extensionPour, lireRefs } from "../scripts/photos-institutionnelles.mjs";

const PAGE = "https://www2.assemblee-nationale.fr/deputes/fiche/OMC_PA330008";

test("la photo de la fiche est retenue, en adresse absolue, et le logo est ignore", () => {
  const html = `<header><img src="/static/photos/icone-photo.png" alt=""></header>
    <div><img class="photo" src="/static/tribun/17/photos/PA330008.jpg" alt="Xavier Breton"></div>`;
  assert.equal(extraireImage(html, PAGE), "https://www2.assemblee-nationale.fr/static/tribun/17/photos/PA330008.jpg");
});

test("une fiche sans photo reconnue ne donne aucune adresse : rien n'est devine", () => {
  assert.equal(extraireImage(`<img src="/static/logo.png"><img src="/pictos/mail.png">`, PAGE), null);
  assert.equal(extraireImage("<p>page vide</p>", PAGE), null);
});

test("une reponse n'est une photo que si elle est une image non vide", () => {
  assert.equal(typeImageValide("text/html; charset=utf-8", 5000), false, "une page d'erreur ne passe pas");
  assert.equal(typeImageValide("image/jpeg", 150), false, "une image vide ne passe pas");
  assert.equal(typeImageValide("image/jpeg", 5000), true);
  assert.equal(typeImageValide("image/png", 5000), true);
  assert.equal(extensionPour("image/png"), "png");
  assert.equal(extensionPour("image/jpeg"), "jpg");
});

test("chaque depute n'a qu'un identifiant, dans l'ordre", () => {
  const refs = lireRefs({ deputes: { "01-1": { acteurRef: "PA2" }, "01-2": { acteurRef: "PA1" }, "02-1": { acteurRef: "PA2" } } });
  assert.deepEqual(refs, ["PA1", "PA2"]);
});
