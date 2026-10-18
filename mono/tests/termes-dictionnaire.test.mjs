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

test("« vote solennel » mène à la même définition que « scrutin solennel »", () => {
  assert.deepEqual(liens(termesDuTexte("Vote solennel sur un texte.")), [["Vote solennel", "scrutin solennel"]]);
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

/* 17/10/2026 : la definition disait « Ses elus ne sont pas elus directement par vous ».
   C'est faux dans les communes de 1 000 habitants ou plus : les conseillers
   communautaires y sont elus au suffrage universel direct, sur le meme bulletin que le
   conseil municipal (« flechage », code electoral art. L273-6 et suivants ; source :
   collectivites-locales.gouv.fr, « Les conseillers communautaires »). En dessous de
   1 000 habitants, ce sont des conseillers municipaux designes dans l'ordre du tableau
   (art. L273-11), y compris apres la loi du 21 mai 2025. */
test("intercommunalite : le mode d'election dit les deux cas, sans contre-verite", () => {
  const d = GLOSSAIRE["intercommunalité"].corps;
  assert.doesNotMatch(d, /pas élus directement/, "faux pour les communes de 1 000 habitants ou plus");
  assert.match(d, /1\s000 habitants/, "le seuil qui change le mode d'election est nomme");
  assert.match(d, /même bulletin/, "le flechage est dit en mots simples");
  assert.match(d, /ordre du tableau/, "le cas des petites communes est dit aussi");
  /* 17/10/2026 : dans la Metropole du Grand Paris, une partie des conseillers de territoire
     (EPT) est designee par le conseil municipal (reponse du Gouvernement, question ecrite
     AN n° 16989, 15e legislature) : la regle generale ne vaut pas partout en Ile-de-France. */
  assert.match(d, /Métropole du Grand Paris/, "l'exception francilienne est signalee");
});

/* 17/10/2026 : le calendrier annonce le 20/10 le « Vote solennel sur le projet de loi de
   finances pour 2027 (premiere partie) ». Rien ne disait ce qu'est une loi de finances, ni
   ce qu'est sa « premiere partie ». Source : Assemblee nationale, « Budget et securite
   sociale » (assemblee-nationale.fr/dyn/budget-et-securite-sociale), lue le 17/10/2026. */
test("projet de loi de finances : l'intitule du calendrier mene a sa definition", () => {
  const t = "Vote solennel sur le projet de loi de finances pour 2027 (première partie).";
  assert.deepEqual(liens(termesDuTexte(t)), [
    ["Vote solennel", "scrutin solennel"],
    ["projet de loi de finances", "projet de loi de finances"],
  ]);
  const d = GLOSSAIRE["projet de loi de finances"].corps;
  assert.match(d, /budget de l.État/);
  assert.match(d, /première partie/, "la premiere partie, votee le 20/10, est expliquee");
  assert.match(d, /70 jours/);
  /* 17/10/2026 (relecture) : la premiere partie n'est pas le budget complet. */
  assert.match(d, /n.adopte pas le budget/, "voter la premiere partie n'est pas adopter le budget");
  assert.match(d, /vote final/, "le texte entier est vote a la fin");
  assert.match(d, /recettes/); assert.match(d, /plafonds des dépenses/);
  assert.match(d, /Sécurité sociale fait l.objet d.un autre texte/, "le budget de l'Etat n'est pas celui de la Securite sociale");
});
