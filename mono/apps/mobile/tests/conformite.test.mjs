/* CONFORMITE APP STORE — non-regression (30/10/2026).
 *
 * Ce qui part dans l'application ou dans les documents de soumission ne doit contenir
 * ni texte de remplissage, ni repere de travail, ni apostrophe typographique, ni
 * couleur ecrite en dur hors de la palette, ni identifiant d'application decide sans
 * le porteur. Les controles portent sur le texte des fichiers, pas sur leur rendu. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const MOBILE = new URL("..", import.meta.url).pathname;     // mono/apps/mobile/
const DOCS = path.resolve(MOBILE, "../../../docs");           // docs/ a la racine du depot

function fichiers(dir, ext) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return fichiers(p, ext);
    return ext.some(x => e.name.endsWith(x)) ? [p] : [];
  });
}
const SRC = fichiers(path.join(MOBILE, "src"), [".ts", ".tsx"]);
const lignes = f => fs.readFileSync(f, "utf8").split("\n").map((texte, i) => ({ f: path.relative(MOBILE, f), n: i + 1, texte }));
const toutes = SRC.flatMap(lignes);
const commentaire = t => /^\s*(\/\*|\*|\/\/|\{\/\*)/.test(t);

test("aucun texte de remplissage ni repere de travail dans le code", () => {
  const trouves = toutes.filter(l => /lorem ipsum|\bTODO\b|\bXXX\b|\bFIXME\b/i.test(l.texte));
  assert.deepEqual(trouves.map(l => `${l.f}:${l.n}`), []);
});

test("aucune apostrophe typographique (U+2019) dans le code", () => {
  const trouves = toutes.filter(l => l.texte.includes("\u2019"));
  assert.deepEqual(trouves.map(l => `${l.f}:${l.n}`), []);
});

test("aucune couleur ecrite en dur hors de palette.ts", () => {
  const hors = toutes.filter(l => l.f !== path.join("src", "lib", "palette.ts")
    && (/#[0-9a-fA-F]{3,8}\b/.test(l.texte) || /\brgba?\(|\bhsla?\(/.test(l.texte)
      || /(color|Color)\s*[:=]\s*["'](white|black|red|green|blue|gray|grey)["']/.test(l.texte)));
  assert.deepEqual(hors.map(l => `${l.f}:${l.n}`), []);
});

test("le nom de l'application garde son accent dans le texte visible", () => {
  /* « Repere » sans accent n'est tolere que dans les commentaires. */
  const trouves = toutes.filter(l => !commentaire(l.texte) && /\bRepere\b/.test(l.texte));
  assert.deepEqual(trouves.map(l => `${l.f}:${l.n}`), []);
});

test("app.json : chiffrement, suivi et identifiant conformes a la decision", () => {
  const expo = JSON.parse(fs.readFileSync(path.join(MOBILE, "app.json"), "utf8")).expo;
  assert.equal(expo.ios.config.usesNonExemptEncryption, false);
  assert.equal(expo.ios.privacyManifests.NSPrivacyTracking, false);
  assert.deepEqual(expo.ios.privacyManifests.NSPrivacyTrackingDomains, []);
  assert.deepEqual(expo.ios.privacyManifests.NSPrivacyCollectedDataTypes, []);
  /* L'identifiant d'application est un placeholder : il ne doit pas etre ecrit sans accord du porteur. */
  assert.equal("bundleIdentifier" in expo.ios, false);
});

test("la politique de confidentialite existe, et l'ecran et le document disent la meme chose", () => {
  const doc = fs.readFileSync(path.join(DOCS, "privacy-policy.md"), "utf8");
  const ecran = fs.readFileSync(path.join(MOBILE, "src", "app", "confidentialite.tsx"), "utf8");
  for (const cle of ["repere.departement", "Oublier", "Ce que Repère ne fait pas"]) {
    assert.ok(doc.includes(cle), `docs/privacy-policy.md ne contient pas « ${cle} »`);
    assert.ok(ecran.includes(cle), `confidentialite.tsx ne contient pas « ${cle} »`);
  }
  const reglages = fs.readFileSync(path.join(MOBILE, "src", "ui", "reglages.tsx"), "utf8");
  assert.ok(reglages.includes('"/confidentialite"'), "le lien Confidentialité des reglages ne mene pas a l'ecran");
});

test("les documents de soumission ne contiennent pas de remplissage", () => {
  for (const nom of ["privacy-policy.md", "app-store-metadata.md"]) {
    const t = fs.readFileSync(path.join(DOCS, nom), "utf8");
    assert.doesNotMatch(t, /lorem ipsum|\bTODO\b|\bXXX\b/i, nom);
    assert.doesNotMatch(t, /\u2019/, nom);
  }
});

test("l'entrée d'écran dure entre 100 et 300 ms (règle des animations)", () => {
  const t = fs.readFileSync(path.join(MOBILE, "src", "ui", "entree.tsx"), "utf8");
  const m = /duration:\s*(\d+)/.exec(t);
  assert.ok(m, "durée absente de src/ui/entree.tsx");
  const ms = Number(m[1]);
  assert.ok(ms <= 300, `durée ${ms} ms : plus de 300 ms`);
  assert.ok(ms >= 100, `durée ${ms} ms : moins de 100 ms`);
});
