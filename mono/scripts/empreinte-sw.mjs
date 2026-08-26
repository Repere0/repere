/* Pose l'empreinte du build dans le service worker.
 *
 * Le cache de la COQUILLE est versionné par cette empreinte ; le cache des
 * DONNÉES ne l'est pas, et c'est la décision qui fait tenir l'invariant 1 pour
 * la PWA installée : la chaîne publie tous les jours, un cache unique effacerait
 * le département de chaque lecteur chaque matin.
 */
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const dossier = process.argv[2] || "public";
const fichier = path.join(dossier === "public" ? "public" : dossier, "sw.js");
if (!fs.existsSync(fichier)) { console.log("sw.js absent de " + dossier + " — rien a faire"); process.exit(0); }

let sw = fs.readFileSync(fichier, "utf8");

/* Precachage des fichiers empreintes produits par le build. Sans cette etape, le
   service worker s'installe apres que le navigateur a deja telecharge le JS et
   le CSS : ils n'entrent jamais dans son cache, et l'application ne s'ouvre pas
   hors ligne. Mesure a l'appui, serveur eteint. */
const assets = fs.existsSync(path.join(dossier, "assets"))
  ? fs.readdirSync(path.join(dossier, "assets"))
      .filter(f => /\.(js|css|woff2?)$/.test(f))
      .map(f => "/assets/" + f)
  : [];
const aPrecharger = ["/", "/index.html", "/manifest.webmanifest", "/data/index.json", ...assets];
const motif = /const A_PRECHARGER = \[[^\]]*\];/;
if (!motif.test(sw)) { console.error("A_PRECHARGER introuvable dans " + fichier); process.exit(1); }
sw = sw.replace(motif, "const A_PRECHARGER = " + JSON.stringify(aPrecharger) + ";");
/* L'empreinte porte sur le service worker ET sur l'application : sans le
   premier, corriger un defaut du service worker sans toucher a l'application
   laisserait le nom du cache inchange, et le cache fautif survivrait au
   correctif cense le vider. */
const source = sw.replace(/const VERSION = "[^"]*";/, "");
const index = fs.existsSync(path.join(dossier, "index.html"))
  ? fs.readFileSync(path.join(dossier, "index.html"), "utf8") : "";
const empreinte = crypto.createHash("sha256").update(source + index).digest("hex").slice(0, 12);

sw = sw.replace(/const VERSION = "[^"]*";/, `const VERSION = "${empreinte}";`);
fs.writeFileSync(fichier, sw);
console.log("sw.js : VERSION " + empreinte + " — " + aPrecharger.length + " fichier(s) precharges  (" + fichier + ")");
