/* Serveur statique minimal pour previsualiser apps/web/dist comme en
 * production — sans le proxy /data->localhost:3001 de vite.config.js, qui
 * n'existe qu'en developpement (mono/apps/api) et fait echouer `vite preview`
 * sur les fichiers de donnees si ce serveur annexe ne tourne pas.
 *
 * Usage : node scripts/serveur-statique.mjs [dossier] [port]
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.argv[2] || "apps/web/dist");
const PORT = Number(process.argv[3] || 4174);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml",
};

const serveur = http.createServer((req, rep) => {
  const p0 = decodeURIComponent(req.url.split("?")[0]);
  let f = path.join(DIST, p0 === "/" ? "index.html" : p0);
  if (!f.startsWith(DIST)) { rep.writeHead(403); return rep.end(); }
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(DIST, "index.html");
  if (!fs.existsSync(f)) { rep.writeHead(404); return rep.end("introuvable"); }
  const corps = fs.readFileSync(f);
  rep.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream",
    "content-length": corps.length });
  rep.end(corps);
});
serveur.listen(PORT, "127.0.0.1", () => {
  console.log(`repere (statique, comme en production) : http://localhost:${PORT}`);
});
