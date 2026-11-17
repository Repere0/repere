// CLOUDFLARE PAGES (12/11/2026, roadmap beta) : prepare dist/ pour Pages, apres `npm run build:web`.
//
// CE QUE PAGES FAIT PAR DEFAUT, et pourquoi on ne s'en contente pas : sans 404.html a la racine, Pages se met en
// mode « application monopage » et repond index.html, code 200, a TOUTE adresse inconnue. Un fichier de donnees
// absent (/data/codes-postaux.json avant sa premiere collecte) repondrait donc une page HTML en 200 : l'application
// ne saurait plus distinguer « absent » de « illisible » (doctrine du vide, invariant 5 ; vercel.json excluait
// /data/ de sa reecriture pour la meme raison).
//
// TROIS FICHIERS, aucun code execute chez Cloudflare (ni Functions ni Worker : rien qui compte dans un quota) :
//   _redirects  une reecriture 200 vers « / » par ECRAN, liste deduite de src/app (expo-router) ;
//   404.html    la copie d'index.html : une adresse inconnue ouvre l'application, avec un vrai code 404 ;
//               un fichier de donnees absent repond donc 404, et l'application dit l'absence ;
//   _headers    securite du navigateur (CSP stricte, cadres interdits, aucun referent), sw.js jamais mis en
//               cache (comme vercel.json), fichiers empreintes en cache long.
// Le « #melun » n'est jamais envoye au serveur : il suffit que /finances reponde l'application.
import { copyFileSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Les adresses des ecrans : src/app/finances.tsx -> /finances ; (onglets)/x.tsx -> /x ; index -> / (deja servi).
export function routes(dossierApp) {
  const out = new Set();
  const parcourir = (d, prefixe) => {
    for (const n of readdirSync(d)) {
      const f = join(d, n);
      if (statSync(f).isDirectory()) { parcourir(f, /^\(.*\)$/.test(n) ? prefixe : `${prefixe}/${n}`); continue; }
      const m = n.match(/^(.+)\.tsx?$/);
      if (!m || m[1].startsWith("_") || m[1].startsWith("+")) continue;
      if (m[1].includes("[")) throw new Error(`route dynamique ${prefixe}/${n} : _redirects ne sait pas la deduire, a ecrire a la main`);
      if (m[1] !== "index") out.add(`${prefixe}/${m[1]}`);
      else if (prefixe) out.add(prefixe);
    }
  };
  parcourir(join(dossierApp, "src", "app"), "");
  return [...out].sort();
}

// MESURE (emulateur « wrangler pages dev » 4.161, 12/11/2026) : la destination « /index.html » repond 308 vers « / »
// (Pages retire l'extension .html) et l'ecran demande est perdu. La destination est donc « / ». Avec et sans
// barre oblique finale : « /finances/ » repondait 404.
export const redirections = liste => liste.flatMap(r => [`${r} / 200`, `${r}/ / 200`]).join("\n") + "\n";

/* SECURITE DU NAVIGATEUR (17/11/2026, sprint « stores »). Une politique de contenu stricte, deduite du build :
   - scripts : seulement ce site, plus l'empreinte sha256 de chaque script ECRIT dans index.html (l'enregistrement du
     service worker, scripts/pwa.mjs). Ni « unsafe-inline » ni « unsafe-eval » pour les scripts ;
   - styles : « unsafe-inline » est necessaire, React Native Web ecrit ses styles dans des balises <style> au vol ;
   - images : ce site et « data: » (les photos libres sont des vignettes integrees aux fichiers publics) ;
   - connexions : ce site seulement. L'application web lit /data/ sur son propre hote (invariant 2 : rien d'autre) ;
   - aucun cadre : ni dans une page d'un autre site (frame-ancestors, X-Frame-Options), ni d'objet, ni de base ;
   - aucun referent transmis aux sites ouverts depuis Repere (invariant 2 : rien n'est transmis). */
export function empreintesScripts(html) {
  return [...String(html).matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .filter(m => m[1].trim()).map(m => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`);
}
export function politique(html) {
  return [
    "default-src 'self'", `script-src 'self' ${empreintesScripts(html).join(" ")}`.trim(), "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:", "font-src 'self' data:", "connect-src 'self'", "manifest-src 'self'", "worker-src 'self'",
    "frame-ancestors 'none'", "frame-src 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'self'",
  ].join("; ");
}
export function entetes(html) {
  return [
    "/*",
    `  Content-Security-Policy: ${politique(html)}`,
    "  X-Frame-Options: DENY",
    "  Referrer-Policy: no-referrer",
    "  X-Content-Type-Options: nosniff",
    "  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    "/sw.js", "  Cache-Control: no-cache, max-age=0, must-revalidate",
    "/", "  Cache-Control: no-cache",
    "/_expo/static/*", "  Cache-Control: public, max-age=31536000, immutable",
    "",
  ].join("\n");
}

export function preparer(dossierApp, dist) {
  const liste = routes(dossierApp);
  writeFileSync(join(dist, "_redirects"), redirections(liste));
  writeFileSync(join(dist, "_headers"), entetes(readFileSync(join(dist, "index.html"), "utf8")));
  copyFileSync(join(dist, "index.html"), join(dist, "404.html"));
  return liste;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const app = join(fileURLToPath(import.meta.url), "..", "..");
  const liste = preparer(app, process.argv[2] || join(app, "dist"));
  console.log(`Cloudflare Pages : ${liste.length} ecrans reecrits vers l'application, 404.html et _headers poses`);
}
