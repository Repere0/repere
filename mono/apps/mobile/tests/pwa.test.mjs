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
