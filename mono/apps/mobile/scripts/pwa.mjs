// PWA : manifeste, balises iOS et vercel.json, deduits de app.json (une seule source).
// Expo (Metro) ne produit plus de manifeste : ce script le fait apres `expo export`.
// Fonctions pures exportees pour etre eprouvees (tests/pwa.test.mjs).
import { readFileSync, writeFileSync, copyFileSync, readdirSync, statSync, existsSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

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

const ENREGISTRE = "<script>if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});});}</script>";

export function injecterBalises(html, appJson) {
  if (html.includes("apple-mobile-web-app-capable")) return html.includes("serviceWorker.register") ? html : html.replace("</head>", `  ${ENREGISTRE}\n  </head>`); // idempotent
  const w = appJson.expo.web;
  let sortie = html.replace(/(<meta name="viewport" content="[^"]*?)"/, (m, a) => (a.includes("viewport-fit") ? m : `${a}, viewport-fit=cover"`));
  sortie = sortie.replace("</head>", `  ${BALISES(w.shortName || appJson.expo.name, w.themeColor)}\n    ${ENREGISTRE}\n  </head>`);
  return sortie;
}

// Garde de fin de build : liste ce qui manque, vide si tout est la.
export function manques(html, manifeste) {
  const m = [];
  for (const t of ['rel="manifest"', 'rel="apple-touch-icon"', 'name="apple-mobile-web-app-capable" content="yes"',
    'name="apple-mobile-web-app-status-bar-style" content="black-translucent"', "viewport-fit=cover"]) if (!html.includes(t)) m.push(t);
  if (!html.includes("serviceWorker.register('/sw.js')")) m.push("enregistrement du service worker");
  if (manifeste.display !== "standalone") m.push("display standalone");
  if (!manifeste.icons?.length) m.push("icones");
  return m;
}

// POURQUOI : Expo range les polices et les icones sous assets/node_modules/. La CLI Vercel (et d'autres
// hebergeurs) n'envoie JAMAIS un dossier nomme node_modules : en ligne, polices et icones repondent 404
// (texte en Times New Roman, icones en carres vides) alors que tout marche en local.
// On renomme le dossier et on reecrit les adresses du JavaScript. Les noms de fichiers restent empreintes.
export function deplacerNodeModules(dist) {
  const src = join(dist, "assets", "node_modules");
  if (existsSync(src)) renameSync(src, join(dist, "assets", "vendor"));
  const parcourir = d => { for (const n of readdirSync(d)) { const f = join(d, n);
    if (statSync(f).isDirectory()) parcourir(f);
    else if (/\.(js|json|html|css)$/.test(n)) { const t = readFileSync(f, "utf8");
      if (t.includes("/assets/node_modules/")) writeFileSync(f, t.split("/assets/node_modules/").join("/assets/vendor/")); } } };
  parcourir(dist);
}

// Garde : aucun chemin ni adresse ne doit encore contenir node_modules.
export function restesNodeModules(dist) {
  const reste = [];
  const parcourir = d => { for (const n of readdirSync(d)) { const f = join(d, n);
    if (n === "node_modules") reste.push(relative(dist, f));
    if (statSync(f).isDirectory()) parcourir(f);
    else if (/\.(js|json|html|css)$/.test(n) && readFileSync(f, "utf8").includes("/assets/node_modules/")) reste.push(relative(dist, f)); } };
  parcourir(dist);
  return reste;
}

// Tout ce que le build produit hors /data : l'interface complete, jamais les donnees.
export function fichiersCoquille(dist) {
  const sortie = ["/", "/index.html", "/manifest.json", "/apple-touch-icon.png", "/icon-192.png", "/icon-512.png", "/favicon.ico"];
  const parcourir = d => { for (const n of readdirSync(d)) { const f = join(d, n);
    if (statSync(f).isDirectory()) parcourir(f); else sortie.push("/" + relative(dist, f).split(sep).join("/").split("/").map(encodeURIComponent).join("/")); } };
  for (const d of ["_expo", "assets"]) parcourir(join(dist, d));
  return sortie;
}

// Ecrit la liste et la version dans sw.js. La version change si la liste ou le sw change.
export function preparerSw(sw, fichiers) {
  const liste = /const A_PRECHARGER = \[[^\]]*\];/;
  if (!liste.test(sw) || !sw.includes("__VERSION__")) throw new Error("sw.js : A_PRECHARGER ou __VERSION__ introuvable");
  const avecListe = sw.replace(liste, "const A_PRECHARGER = " + JSON.stringify(fichiers) + ";");
  const version = createHash("sha256").update(avecListe).digest("hex").slice(0, 12);
  return avecListe.replace("__VERSION__", version);
}

export function appliquer(dossierApp, dist) {
  const appJson = JSON.parse(readFileSync(join(dossierApp, "app.json"), "utf8"));
  deplacerNodeModules(dist);
  const manifeste = construireManifeste(appJson);
  writeFileSync(join(dist, "manifest.json"), JSON.stringify(manifeste, null, 2) + "\n");
  const f = join(dist, "index.html");
  writeFileSync(f, injecterBalises(readFileSync(f, "utf8"), appJson));
  // Vercel lit vercel.json dans le dossier deploye : `vercel deploy dist` ignorerait celui de la racine.
  copyFileSync(join(dossierApp, "vercel.json"), join(dist, "vercel.json"));
  const sw = join(dist, "sw.js");
  writeFileSync(sw, preparerSw(readFileSync(join(dossierApp, "public", "sw.js"), "utf8"), fichiersCoquille(dist)));
  const reste = manques(readFileSync(f, "utf8"), manifeste);
  if (reste.length) throw new Error("PWA incomplete : " + reste.join(", "));
  const nm = restesNodeModules(dist);
  if (nm.length) throw new Error("node_modules encore present (non envoye par Vercel) : " + nm.join(", "));
}

// Ligne de commande : node scripts/pwa.mjs <dossier-dist> (utilisee par build-web.mjs et la CI).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  appliquer(join(fileURLToPath(import.meta.url), "..", ".."), process.argv[2]);
}
