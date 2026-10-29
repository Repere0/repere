/* THEME — CONTROLES DETERMINISTES, SANS APPAREIL — 29/10/2026.
 *
 * Ce fichier mesure ce qu'on peut mesurer sans écran : contrastes WCAG,
 * amplitude RGB (invariant 7), valeurs claires inchangées, feuilles de style de
 * module passées par feuille(), couleurs littérales hors du thème, thème du
 * système branché à la racine. Il ne prouve PAS l'aspect visuel : cela reste à
 * vérifier sur appareil (voir AUDIT_THEMES_ACCESSIBILITE.md).
 *
 * Le test importe palette.ts directement (Node 22 exécute le TypeScript sans
 * compilation) : il mesure les vraies valeurs, pas une copie. */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ECHELONS } from "@repere/data-utils";
import { NEUTRES_PAR_MODE, TEINTES_PAR_MODE, ECHELONS_PAR_MODE, OMBRE_PAR_MODE } from "../src/lib/palette.ts";

const RACINE = path.resolve(import.meta.dirname, "..");
const SRC = path.join(RACINE, "src");

/* ---- mesures WCAG ----------------------------------------------------- */
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
function luminance(h) {
  const c = hex(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contraste(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}
const amplitude = h => { const c = hex(h); return Math.max(...c) - Math.min(...c); };

/* ---- 1. valeurs claires : inchangees par rapport a main -------------- */
test("theme — le clair garde les valeurs de l'application (aucune régression de la version claire)", () => {
  const n = NEUTRES_PAR_MODE.clair;
  assert.deepEqual(
    { sol: n.sol, carte: n.carte, encre: n.encre, sourd: n.sourd, trait: n.trait, voile: n.voile, lien: n.lien },
    { sol: "#F5F2EC", carte: "#FFFFFF", encre: "#171614", sourd: "#625E57", trait: "#DDD8D0", voile: "#ECE8E1", lien: "#1a1917" },
  );
  assert.deepEqual(TEINTES_PAR_MODE.clair, {
    ville: "#dbeaee", agglo: "#e4f3f7", dept: "#f7ece4", region: "#efe7fb", france: "#ecebe8",
  });
  assert.deepEqual(ECHELONS_PAR_MODE.clair, { ...ECHELONS }, "le clair garde les cinq couleurs d'echelon, France comprise");
  assert.equal(OMBRE_PAR_MODE.clair.shadowColor, "#171614");
});

/* ---- 2. contrastes du texte, dans les deux modes -------------------- */
const PAIRES_TEXTE = [["encre", "sol"], ["encre", "carte"], ["encre", "voile"], ["sourd", "sol"], ["sourd", "carte"], ["sourd", "voile"], ["lien", "carte"]];
for (const m of ["clair", "sombre"]) {
  test(`theme ${m} — tout texte tient 4,5:1 WCAG AA sur son fond`, () => {
    const n = NEUTRES_PAR_MODE[m];
    const echecs = PAIRES_TEXTE
      .map(([t, f]) => ({ paire: `${t} sur ${f}`, ratio: contraste(n[t], n[f]) }))
      .filter(x => x.ratio < 4.5)
      .map(x => `${x.paire} = ${x.ratio.toFixed(2)}`);
    assert.deepEqual(echecs, [], `contrastes insuffisants (${m}) : ${echecs.join(" | ")}`);
  });
  test(`theme ${m} — le texte encre tient 4,5:1 sur chaque teinte d'echelon`, () => {
    const n = NEUTRES_PAR_MODE[m];
    const echecs = Object.entries(TEINTES_PAR_MODE[m])
      .map(([k, t]) => ({ k, ratio: contraste(n.encre, t) }))
      .filter(x => x.ratio < 4.5)
      .map(x => `${x.k} = ${x.ratio.toFixed(2)}`);
    assert.deepEqual(echecs, [], `teintes illisibles (${m}) : ${echecs.join(" | ")}`);
  });
}

/* ---- 3. elements non textuels (points, traits, barres) : 3:1 --------- */
/* Exception connue et MESUREE, non corrigee : en sombre, l'echelon « region »
   (#6d28d9, fixe par l'invariant 7) tombe a 2,37:1 sur la carte. Les cinq
   couleurs d'echelon sont gelees ; la changer est une decision du fondateur. Le
   test fige la valeur : si elle bouge, il echoue et oblige a relire. */
const EXCEPTIONS_NON_TEXTE = { "sombre:region": 2.37 };
for (const m of ["clair", "sombre"]) {
  test(`theme ${m} — chaque echelon atteint 3:1 sur la carte, exception documentee exceptee`, () => {
    const carte = NEUTRES_PAR_MODE[m].carte;
    const echecs = [];
    for (const [k, c] of Object.entries(ECHELONS_PAR_MODE[m])) {
      const r = contraste(c, carte);
      const cle = `${m}:${k}`;
      if (r < 3) {
        if (EXCEPTIONS_NON_TEXTE[cle] === undefined) echecs.push(`${k} = ${r.toFixed(2)}`);
        else assert.equal(r.toFixed(2), EXCEPTIONS_NON_TEXTE[cle].toFixed(2), `exception ${cle} a change : relire la decision`);
      }
    }
    assert.deepEqual(echecs, [], `echelons sous 3:1 (${m}) : ${echecs.join(" | ")}`);
  });
}

/* ---- 4. invariant 7 : neutres et teintes sous l'amplitude 24 --------- */
for (const m of ["clair", "sombre"]) {
  test(`theme ${m} — neutres et teintes restent sous l'amplitude RGB 24 (invariant 7)`, () => {
    const fautes = [
      ...Object.entries(NEUTRES_PAR_MODE[m]).filter(([, v]) => amplitude(v) > 24).map(([k, v]) => `${k} ${v}`),
      ...Object.entries(TEINTES_PAR_MODE[m]).filter(([k, v]) => k !== "france" && amplitude(v) > 24).map(([k, v]) => `teinte ${k} ${v}`),
    ];
    assert.deepEqual(fautes, [], `amplitude > 24 (${m}) : ${fautes.join(" | ")}`);
  });
}

/* ---- 5. le sombre n'utilise aucun vert ni rouge pour le vote ---------- */
test("theme sombre — les trois gris de vote restent des neutres (pas de vert ni de rouge)", () => {
  for (const m of ["clair", "sombre"]) {
    const n = NEUTRES_PAR_MODE[m];
    for (const c of [n.encre, n.sourd, n.trait]) {
      const { r, g, b } = { r: hex(c)[0], g: hex(c)[1], b: hex(c)[2] };
      assert.ok(Math.max(r, g, b) - Math.min(r, g, b) <= 24, `${c} n'est pas un neutre (${m})`);
    }
  }
});

/* ---- 6. statique : feuilles de module et couleurs litterales ---------- */
function fichiers(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? fichiers(p) : (/\.tsx?$/.test(e.name) ? [p] : []);
  });
}
const lire = f => fs.readFileSync(f, "utf8");
const sansCommentaires = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");

test("theme — aucune feuille de style de module ne fige une couleur au chargement", () => {
  const fautes = [];
  for (const f of fichiers(SRC)) {
    const s = sansCommentaires(lire(f));
    if (/^const \w+ = StyleSheet\.create\(/m.test(s)) fautes.push(path.relative(RACINE, f));
  }
  assert.deepEqual(fautes, [], "feuilles figees (utiliser feuille(() => StyleSheet.create(...))) : " + fautes.join(", "));
});

test("theme — aucune couleur litterale hors du systeme de theme", () => {
  const exclus = new Set([path.join(SRC, "lib", "palette.ts"), path.join(SRC, "lib", "theme.ts")]);
  const fautes = [];
  for (const f of fichiers(SRC)) {
    if (exclus.has(f)) continue;
    const s = sansCommentaires(lire(f));
    const m = s.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(/g);
    if (m) fautes.push(`${path.relative(RACINE, f)} : ${m.join(", ")}`);
  }
  assert.deepEqual(fautes, [], "couleurs en dur : " + fautes.join(" | "));
});

test("theme — la racine suit le theme du systeme et adapte la barre d'etat", () => {
  const racine = lire(path.join(SRC, "app", "_layout.tsx"));
  assert.match(racine, /useModeSysteme\(\)/, "la racine doit lire le theme du systeme");
  assert.match(racine, /style=\{mode === "sombre" \? "light" : "dark"\}/, "barre d'etat claire en sombre");
  const app = JSON.parse(lire(path.join(RACINE, "app.json")));
  assert.equal(app.expo.userInterfaceStyle, "automatic", "app.json doit suivre le systeme, pas forcer le clair");
});

/* Invariant 2 : une seule clé locale (repere.departement), lue et écrite par un
   seul module, memoire.ts. Le thème suit le système : il n'a donc aucune clé. */
test("theme — aucune clé de stockage pour le thème ; seul memoire.ts touche au stockage (invariant 2)", () => {
  const fautes = [];
  for (const f of fichiers(SRC)) {
    const s = sansCommentaires(lire(f));
    if (/repere\.theme|theme[A-Za-z]*Cle|CLE_THEME/i.test(s)) fautes.push(`cle de theme dans ${path.relative(RACINE, f)}`);
    const memoire = path.basename(f) === "memoire.ts";
    if (!memoire && /AsyncStorage|localStorage|SecureStore|SQLite/.test(s)) fautes.push(`stockage hors memoire.ts : ${path.relative(RACINE, f)}`);
  }
  assert.deepEqual(fautes, []);
});

/* Un champ de saisie sans couleur de texte prend le noir du système : illisible
   en thème sombre. Chaque champ doit porter `color:` dans son style, ou un style
   nommé qui le porte. */
test("theme — chaque champ de saisie fixe sa couleur de texte (lisible dans les deux thèmes)", () => {
  const fautes = [];
  for (const f of fichiers(SRC)) {
    const s = sansCommentaires(lire(f));
    for (const m of s.matchAll(/<TextInput\b[\s\S]*?\/>/g)) {
      const bloc = m[0];
      const nom = (bloc.match(/style=\{s\.(\w+)\}/) || [])[1];
      let porte = /color:/.test(bloc);
      if (!porte && nom) {
        const def = s.match(new RegExp(`\\b${nom}:\\s*\\{([^}]*)\\}`));
        porte = !!def && /\bcolor:/.test(def[1]);
      }
      if (!porte) fautes.push(`${path.relative(RACINE, f)} : ${bloc.slice(0, 60).replace(/\s+/g, " ")}`);
    }
  }
  assert.deepEqual(fautes, [], "champs sans couleur de texte : " + fautes.join(" | "));
});

test("theme — les cartes de partage restent sur la palette claire (image sortante)", () => {
  /* brut : les marqueurs « CARTE 1 » et « CARTE 2 » sont dans des commentaires JSX */
  const s = lire(path.join(SRC, "app", "partager.tsx"));
  const a = s.indexOf("CARTE 1");
  const b = s.indexOf("CARTE 2");
  assert.ok(a > 0 && b > a, "bornes des cartes introuvables");
  const fin = s.indexOf("\n            </View>\n", b);
  const cartes = s.slice(a, fin);
  assert.equal((cartes.match(/couleurs\./g) || []).length, 0, "une carte lit encore le thème courant");
  assert.match(cartes, /<Logo c=\{cl\} \/>/, "le logo des cartes doit prendre la palette claire");
});

/* userInterfaceStyle « automatic » n'agit sur Android qu'avec expo-system-ui
   (avertissement de `expo prebuild`, 29/10/2026). La dépendance doit être déclarée. */
test("theme — userInterfaceStyle exige expo-system-ui, et la dépendance est déclarée", () => {
  const appJson = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "app.json"), "utf8"));
  const pkg = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "package.json"), "utf8"));
  if (appJson.expo && appJson.expo.userInterfaceStyle) {
    assert.ok(pkg.dependencies && pkg.dependencies["expo-system-ui"],
      "userInterfaceStyle est défini sans expo-system-ui : le thème ne suit pas le système sur Android");
  }
});

/* LOGO DE REPERE (29/10/2026). L'icone iOS doit etre carree, 1024 px, sans
   transparence ; le fond du demarrage et de l'icone adaptative Android suit la
   tuile du logo, et non l'ancien bleu-vert (#0e7490), qui jurait avec lui.
   Le logo est plein cadre (aucune tuile arrondie intégrée : iOS applique seul son masque). */
test("logo — icone iOS carree 1024 px sans transparence ; fonds du demarrage et Android = tuile du logo", () => {
  const app = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "..", "app.json"), "utf8")).expo;
  const tuile = "#F7F7F9";
  assert.equal(app.splash.backgroundColor, tuile, "fond du demarrage : ancienne couleur");
  assert.equal(app.android.adaptiveIcon.backgroundColor, tuile, "fond adaptatif Android : ancienne couleur");
  const png = fs.readFileSync(path.join(import.meta.dirname, "..", "assets", "icon.png"));
  assert.equal(png.readUInt32BE(16), 1024, "largeur de l'icone");
  assert.equal(png.readUInt32BE(20), 1024, "hauteur de l'icone");
  assert.notEqual(png[25], 4, "icone iOS : canal alpha interdit (type de couleur RGBA)");
  assert.notEqual(png[25], 6, "icone iOS : canal alpha interdit (type de couleur RGBA)");
});
