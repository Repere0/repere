// Garde PWA : manifeste standalone, balises iOS, rewrite Vercel qui ne masque pas les donnees.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { construireManifeste, injecterBalises, manques } from "../scripts/pwa.mjs";

const app = JSON.parse(readFileSync(new URL("../app.json", import.meta.url), "utf8"));
const HTML = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" /></head><body></body></html>';

test("le manifeste est standalone, avec icônes présentes sur disque", () => {
  const m = construireManifeste(app);
  assert.equal(m.display, "standalone");
  assert.equal(m.start_url, "/");
  for (const i of m.icons) assert.ok(existsSync(new URL("../public" + i.src, import.meta.url)), i.src);
  assert.ok(existsSync(new URL("../public/apple-touch-icon.png", import.meta.url)));
});

test("les balises iOS et viewport-fit=cover sont injectées, une seule fois", () => {
  const h = injecterBalises(HTML, app);
  assert.deepEqual(manques(h, construireManifeste(app)), []);
  assert.equal(injecterBalises(h, app), h);
});

test("la garde voit une balise manquante", () => {
  assert.ok(manques(HTML, construireManifeste(app)).length > 0);
  assert.ok(manques(HTML.replace("</head>", "</head>"), { display: "browser", icons: [] }).includes("display standalone"));
});

test("vercel.json : tout va vers index.html sauf data/, _expo/, assets/", () => {
  const v = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  const r = v.rewrites[0];
  assert.equal(r.destination, "/index.html");
  const re = new RegExp("^" + r.source + "$");
  for (const ok of ["/elu", "/scrutins/12", "/recherche"]) assert.ok(re.test(ok), ok);
  for (const non of ["/data/communes.json", "/_expo/static/js/web/x.js", "/assets/a.png"]) assert.ok(!re.test(non), non);
});

test("le service worker : liste et version écrites, /data/ jamais intercepté", async () => {
  const { preparerSw } = await import("../scripts/pwa.mjs");
  const src = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
  const a = preparerSw(src, ["/", "/index.html", "/_expo/a.js"]);
  assert.ok(!a.includes("__VERSION__") && a.includes('"/_expo/a.js"'));
  assert.notEqual(a, preparerSw(src, ["/", "/index.html", "/_expo/b.js"]), "la version doit suivre la liste");
  assert.ok(/pathname\.startsWith\("\/data\/"\)/.test(src), "les données doivent passer sans cache (invariants 2 et 9)");
  assert.throws(() => preparerSw("const VERSION = 1;", []));
});

test("la garde voit l'enregistrement du service worker manquant", () => {
  const h = injecterBalises(HTML, app);
  assert.ok(h.includes("serviceWorker.register('/sw.js')"));
  assert.ok(manques(h.replace("serviceWorker.register('/sw.js')", ""), construireManifeste(app)).length > 0);
});

test("vercel.json : sw.js jamais gardé par le CDN", () => {
  const v = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  const h = v.headers.find(x => x.source === "/sw.js");
  assert.match(h.headers[0].value, /no-cache/);
});

test("node_modules : dossier renommé et adresses réécrites (Vercel ne l'envoie jamais)", async () => {
  const { deplacerNodeModules, restesNodeModules } = await import("../scripts/pwa.mjs");
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync: lire, existsSync: existe } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const d = mkdtempSync(join(tmpdir(), "pwa-"));
  mkdirSync(join(d, "assets/node_modules/@expo-google-fonts/manrope"), { recursive: true });
  mkdirSync(join(d, "_expo/static/js/web"), { recursive: true });
  writeFileSync(join(d, "assets/node_modules/@expo-google-fonts/manrope/m.ttf"), "x");
  writeFileSync(join(d, "_expo/static/js/web/e.js"), 'm.exports={uri:"/assets/node_modules/@expo-google-fonts/manrope/m.ttf"}');
  assert.ok(restesNodeModules(d).length > 0, "la garde doit voir node_modules");
  deplacerNodeModules(d);
  assert.ok(existe(join(d, "assets/vendor/@expo-google-fonts/manrope/m.ttf")));
  assert.ok(lire(join(d, "_expo/static/js/web/e.js"), "utf8").includes('"/assets/vendor/@expo-google-fonts/manrope/m.ttf"'));
  assert.deepEqual(restesNodeModules(d), []);
});

test("Vercel relié à Git : les réglages de build vivent dans vercel.json, app.json dit metro + single", () => {
  const v = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
  assert.equal(v.buildCommand, "npm run build:web");
  assert.equal(v.outputDirectory, "dist");
  assert.equal(v.installCommand, "npm ci --no-audit --no-fund", "apps/mobile est hors de l espace pnpm : npm ci sur son verrou");
  assert.ok(!/pnpm/.test(v.installCommand + v.buildCommand), "aucun pnpm : mobile a sa propre installation");
  assert.equal(app.expo.web.bundler, "metro");
  assert.equal(app.expo.web.output, "single");
});
