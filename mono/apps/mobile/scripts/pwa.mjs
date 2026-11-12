// PWA : manifeste, balises iOS et vercel.json, deduits de app.json (une seule source).
// Expo (Metro) ne produit plus de manifeste : ce script le fait apres `expo export`.
// Fonctions pures exportees pour etre eprouvees (tests/pwa.test.mjs).
import { readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

export function construireManifeste(appJson) {
  const w = appJson.expo.web, e = appJson.expo;
  return {
    name: w.name || e.name, short_name: w.shortName || e.name, description: w.description,
    lang: w.lang || "fr", start_url: "/", scope: "/", display: w.display || "standalone",
    orientation: w.orientation || "portrait", background_color: w.backgroundColor, theme_color: w.themeColor,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}

// viewport-fit=cover : sans lui, iOS ne donne pas les marges de securite et la barre
// d'etat translucide recouvrirait l'en-tete.
const BALISES = (nom, couleur) => [
  '<link rel="manifest" href="/manifest.json" />',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  `<meta name="apple-mobile-web-app-title" content="${nom}" />`,
  `<meta name="theme-color" content="${couleur}" />`,
].join("\n    ");

export function injecterBalises(html, appJson) {
  if (html.includes("apple-mobile-web-app-capable")) return html; // idempotent
  const w = appJson.expo.web;
  let sortie = html.replace(/(<meta name="viewport" content="[^"]*?)"/, (m, a) => (a.includes("viewport-fit") ? m : `${a}, viewport-fit=cover"`));
  sortie = sortie.replace("</head>", `  ${BALISES(w.shortName || appJson.expo.name, w.themeColor)}\n  </head>`);
  return sortie;
}

// Garde de fin de build : liste ce qui manque, vide si tout est la.
export function manques(html, manifeste) {
  const m = [];
  for (const t of ['rel="manifest"', 'rel="apple-touch-icon"', 'name="apple-mobile-web-app-capable" content="yes"',
    'name="apple-mobile-web-app-status-bar-style" content="black-translucent"', "viewport-fit=cover"]) if (!html.includes(t)) m.push(t);
  if (manifeste.display !== "standalone") m.push("display standalone");
  if (!manifeste.icons?.length) m.push("icones");
  return m;
}

export function appliquer(dossierApp, dist) {
  const appJson = JSON.parse(readFileSync(join(dossierApp, "app.json"), "utf8"));
  const manifeste = construireManifeste(appJson);
  writeFileSync(join(dist, "manifest.json"), JSON.stringify(manifeste, null, 2) + "\n");
  const f = join(dist, "index.html");
  writeFileSync(f, injecterBalises(readFileSync(f, "utf8"), appJson));
  // Vercel lit vercel.json dans le dossier deploye : `vercel deploy dist` ignorerait celui de la racine.
  copyFileSync(join(dossierApp, "vercel.json"), join(dist, "vercel.json"));
  const reste = manques(readFileSync(f, "utf8"), manifeste);
  if (reste.length) throw new Error("PWA incomplete : " + reste.join(", "));
}
