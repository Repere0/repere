/* LA GARDE DU THEME SOMBRE (20/10/2026).
 *
 * Elle ne relit pas des valeurs recopiees : elle extrait les palettes du
 * fichier `src/lib/theme.ts` lui-meme et refait les calculs. Trois choses
 * qu'un banc vert laissait passer jusqu'ici :
 *
 *  1. l'invariant 7 — aucune couleur hors echelon ne depasse une amplitude RGB
 *     de 24 ; les teintes restent sous 20, comme en clair ;
 *  2. le contraste du texte, en clair ET en sombre (4,5:1, WCAG 1.4.3) ;
 *  3. LE PIEGE QUI A MOTIVE CE FICHIER : `StyleSheet.create({ color:
 *     couleurs.encre })` au niveau d'un module fige la couleur au chargement.
 *     L'ecran reste en clair pour toujours, sans qu'aucun test ne rougisse —
 *     parce que la couleur est juste, seulement prise au mauvais moment. Toute
 *     feuille de module qui importe le theme doit donc passer par `feuille()`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
/* La palette decidee, lue a sa source unique : si elle grossit, la garde le voit. */
const { PALETTE_INTERFACE } = await import("../../../packages/data-utils/src/invariants.js");
const theme = readFileSync(join(racine, "src/lib/theme.ts"), "utf8");

/* ---- mesures, refaites ici, jamais importees ---- */
const canaux = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const amplitude = h => { const c = canaux(h); return Math.max(...c) - Math.min(...c); };
const luminance = h => {
  const [r, g, b] = canaux(h).map(v => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a, b) => {
  const [h, l] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (h + 0.05) / (l + 0.05);
};

/* ---- extraction : le bloc d'un mode, puis ses paires nom/hexadecimal ---- */
function palette(declaration, mode) {
  const bloc = new RegExp(`${declaration}[\\s\\S]*?\\b${mode}:\\s*\\{([\\s\\S]*?)\\}`, "m").exec(theme);
  assert.ok(bloc, `palette « ${mode} » introuvable dans ${declaration}`);
  const trouve = {};
  for (const [, nom, hex] of bloc[1].matchAll(/(\w+):\s*"(#[0-9a-fA-F]{6})"/g)) trouve[nom] = hex;
  assert.ok(Object.keys(trouve).length >= 5, `palette « ${mode} » quasi vide : ${JSON.stringify(trouve)}`);
  return trouve;
}

const NEUTRES = { clair: palette("const NEUTRES", "clair"), sombre: palette("const NEUTRES", "sombre") };
const TEINTES = { clair: palette("const TEINTES_PAR_MODE", "clair"), sombre: palette("const TEINTES_PAR_MODE", "sombre") };

test("les deux themes existent, avec les memes jetons", () => {
  assert.deepEqual(Object.keys(NEUTRES.clair).sort(), Object.keys(NEUTRES.sombre).sort());
  assert.deepEqual(Object.keys(TEINTES.clair).sort(), Object.keys(TEINTES.sombre).sort());
  assert.equal(Object.keys(TEINTES.sombre).length, 5, "cinq echelons, pas un de plus");
});

test("invariant 7 — tout jeton est soit sous l'amplitude 24, soit dans la palette decidee", () => {
  /* 20/10/2026 : le porteur a decide une palette d'interface (gris-bleu lin,
     teal, emeraude, ambre, corail) d'apres ses maquettes. Elle est declaree une
     seule fois, dans data-utils/invariants.js, et la garde la relit : une
     couleur hors palette ET au-dessus de l'amplitude 24 reste refusee. C'est ce
     qui empeche la palette de s'elargir en silence, jeton par jeton. */
  for (const mode of ["clair", "sombre"]) {
    for (const [nom, hex] of Object.entries(NEUTRES[mode])) {
      assert.ok(amplitude(hex) <= 24 || PALETTE_INTERFACE.includes(hex.toLowerCase()),
        `${mode}.${nom} = ${hex} : amplitude ${amplitude(hex)} > 24 et absent de la palette decidee`);
    }
  }
});

test("invariant 7 — les teintes d'echelon restent sous une amplitude de 20", () => {
  for (const mode of ["clair", "sombre"]) {
    for (const [nom, hex] of Object.entries(TEINTES[mode])) {
      assert.ok(amplitude(hex) <= 20, `teinte ${mode}.${nom} = ${hex} : amplitude ${amplitude(hex)} > 20`);
    }
  }
});

test("contraste du texte — 4,5:1 dans les deux themes (WCAG 1.4.3)", () => {
  const paires = [["encre", "sol"], ["encre", "carte"], ["encre", "voile"], ["sourd", "sol"], ["sourd", "carte"], ["sourd", "voile"]];
  for (const mode of ["clair", "sombre"]) {
    for (const [texte, fond] of paires) {
      const r = contraste(NEUTRES[mode][texte], NEUTRES[mode][fond]);
      assert.ok(r >= 4.5, `${mode} : ${texte} sur ${fond} = ${r.toFixed(2)}:1, il faut 4,5`);
    }
  }
});

test("contraste du texte sur une teinte d'echelon — 4,5:1 dans les deux themes", () => {
  for (const mode of ["clair", "sombre"]) {
    for (const [nom, teinte] of Object.entries(TEINTES[mode])) {
      for (const texte of ["encre", "sourd"]) {
        const r = contraste(NEUTRES[mode][texte], teinte);
        assert.ok(r >= 4.5, `${mode} : ${texte} sur la teinte ${nom} = ${r.toFixed(2)}:1, il faut 4,5`);
      }
    }
  }
});

test("l'echelon « france » ne reste pas noir sur fond sombre", () => {
  /* #1d1d1f sur #141310 mesure 1,10:1 : un filet invisible. Le site a tranche
     (tokens.css) : en sombre, « france » est l'encre. Le mobile suit. */
  const bloc = /sombre:\s*\{\s*\.\.\.ECHELONS,\s*france:\s*([^}]*)\}/.exec(theme);
  assert.ok(bloc, "la bascule de l'echelon « france » en sombre a disparu de theme.ts");
  const r = contraste(NEUTRES.sombre.encre, NEUTRES.sombre.carte);
  assert.ok(r >= 3, `l'encre sombre doit etre visible sur la carte : ${r.toFixed(2)}:1`);
});

/* ---- le piege : une feuille de module qui fige la couleur ---- */
function fichiers(dossier) {
  return readdirSync(dossier).flatMap(n => {
    const p = join(dossier, n);
    return statSync(p).isDirectory() ? fichiers(p) : (/\.tsx?$/.test(n) ? [p] : []);
  });
}

test("toute feuille de style de module passe par feuille()", () => {
  const coupables = [];
  for (const p of fichiers(join(racine, "src"))) {
    const relatif = p.slice(racine.length + 1);
    /* theme.ts est le lieu de la definition : il parle de StyleSheet.create
       dans un commentaire, il ne l'appelle pas. */
    if (relatif === "src/lib/theme.ts") continue;
    const src = readFileSync(p, "utf8");
    const debut = src.indexOf("StyleSheet.create(");
    if (debut < 0) continue;
    /* On ne regarde que CE QUE CONTIENT la feuille : un ecran peut nommer
       `TYPO.question` dans son JSX et n'avoir que des marges dans sa feuille
       (src/ui/page.tsx). Une feuille sans couleur n'a rien a rafraichir. */
    const feuilleTexte = src.slice(debut);
    if (!/\b(couleurs|TYPO|OMBRE|TEINTES|GRIS_VOTE)\./.test(feuilleTexte)) continue;
    const nues = src.match(/StyleSheet\.create\(/g).length;
    const enveloppees = (src.match(/feuille\(\(\) => StyleSheet\.create\(/g) || []).length;
    if (enveloppees < nues) coupables.push(relatif);
  }
  assert.deepEqual(coupables, [], `ces feuilles figeraient la couleur au chargement du module : ${coupables.join(", ")}`);
});

test("le telephone decide du theme — app.json", () => {
  const app = JSON.parse(readFileSync(join(racine, "app.json"), "utf8"));
  assert.equal(app.expo.userInterfaceStyle, "automatic",
    "avec « light », le systeme ne peut plus passer l'application en sombre");
});

test("la racine suit le theme du systeme et remonte l'arbre", () => {
  const racineSrc = readFileSync(join(racine, "src/app/_layout.tsx"), "utf8");
  assert.match(racineSrc, /useModeSysteme\(\)/, "la racine n'applique pas le theme du systeme");
  assert.match(racineSrc, /key=\{mode\}/, "sans `key`, les feuilles deja rendues gardent l'ancien theme");
  assert.doesNotMatch(racineSrc, /StatusBar style="dark"/, "la barre d'etat reste en clair");
});
