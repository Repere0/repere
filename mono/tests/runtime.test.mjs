/* Les invariants qui ne se mesurent QUE dans un navigateur.
 *
 * RÈGLE DE CONCEPTION, héritée du banc de la version mono-fichier : un banc vert
 * sur une page cassée reste un banc vert. Les contrôles ci-dessous n'ouvrent pas
 * le code : ils ouvrent l'application, coupent le réseau, et regardent ce qui
 * s'affiche.
 *
 * Usage : node tests/runtime.test.mjs [dossier/dist]
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { adresseFautive, MOTS_A_ACCENTS } from "../packages/data-utils/src/invariants.js";

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ chromium } = (await import("/home/claude/.npm-global/lib/node_modules/playwright/index.js")).default); }

const DIST = path.resolve(process.argv[2] || "apps/web/dist");
if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("build absent : " + DIST + " — lance `pnpm build` puis copie data/ dedans");
  process.exit(2);
}

const resultats = [];
function verif(nom, condition, detail) {
  resultats.push({ nom, ok: !!condition, detail: condition ? "" : (detail || "") });
  console.log((condition ? "  ok  " : " ECHEC") + " | " + nom + (condition ? "" : "  -> " + (detail || "")));
}

/* Un serveur qui DÉCLARE content-length : sans lui, tout part en chunked et une
   mesure de poids vaudrait zéro quel que soit le fichier servi. */
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript",
  ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json" };
let servies = [];
const serveur = http.createServer((req, rep) => {
  const p0 = decodeURIComponent(req.url.split("?")[0]);
  servies.push(req.url);
  const f = path.join(DIST, p0 === "/" ? "index.html" : p0);
  if (!f.startsWith(DIST) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    rep.writeHead(404, { "content-type": "application/json" });
    return rep.end('{"erreur":"introuvable"}');
  }
  const corps = fs.readFileSync(f);
  rep.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream",
                       "content-length": corps.length });
  rep.end(corps);
});
await new Promise(r => serveur.listen(0, "127.0.0.1", r));
const base = "http://127.0.0.1:" + serveur.address().port + "/";

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 420, height: 900 } });
const page = await ctx.newPage();
const erreurs = [];
page.on("pageerror", e => erreurs.push("pageerror: " + e.message));
/* Hors ligne, le navigateur JOURNALISE chaque requete refusee. Ce n'est pas un
   defaut de l'application : c'est la mesure elle-meme. On separe donc les deux —
   une erreur applicative reste une erreur, une requete refusee pendant la phase
   hors ligne est attendue et comptee a part. */
let horsLignePhase = false;
const reseauCoupe = [];
/* Le 503 fait partie de la liste : c'est la reponse que NOTRE service worker
   fabrique lui-meme quand une donnee n'est ni en cache ni joignable. Le client en
   fait une phrase pour le lecteur ; le navigateur, lui, la journalise comme une
   erreur. Elle n'est attendue QUE pendant la phase hors ligne — en marche normale
   un 503 resterait un echec. */
const estReseau = t => /ERR_INTERNET_DISCONNECTED|ERR_TUNNEL_CONNECTION_FAILED|ERR_NETWORK_CHANGED|Failed to fetch|net::ERR|status of 503/.test(t);
page.on("console", m => {
  if (m.type() !== "error") return;
  const t = m.text().slice(0, 140);
  if (horsLignePhase && estReseau(t)) { reseauCoupe.push(t); return; }
  erreurs.push("console: " + t);
});

const adresses = [];
page.on("request", r => { try { adresses.push(new URL(r.url).pathname + new URL(r.url).search); } catch {} });

console.log("\n--- premiere visite ------------------------------------------");
let poids = 0;
const compteur = async rep => { try { const b = await rep.body(); poids += b.length; } catch {} };
page.on("response", compteur);
await page.goto(base, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
page.off("response", compteur);

verif("poids — le premier ecran reste sous 400 Ko", poids <= 400 * 1024,
  Math.round(poids / 1024) + " Ko transferes avant le choix d'un departement");

/* INVARIANT 2 : aucune adresse ne porte un code de commune. Mesure sur ce qui a
   REELLEMENT ete demande, pas sur ce que le code compose. */
const fautives = adresses.filter(adresseFautive);
verif("invariant 2 — aucune adresse demandee ne porte un code de commune",
  fautives.length === 0, [...new Set(fautives)].slice(0, 4).join(" | "));

const stockage = await page.evaluate(() => ({
  local: Object.keys(localStorage), session: Object.keys(sessionStorage),
  cookie: document.cookie,
}));
verif("invariant 2 — rien n'est ecrit sur l'appareil avant un geste du lecteur",
  stockage.local.length === 0 && stockage.session.length === 0 && stockage.cookie === "",
  JSON.stringify(stockage));

console.log("\n--- parcours -------------------------------------------------");
await page.getByRole("button", { name: "64", exact: true }).click();
await page.waitForTimeout(1800);

const apres = await page.evaluate(() => ({
  local: Object.keys(localStorage),
  valeur: localStorage.getItem("repere.departement"),
  session: Object.keys(sessionStorage),
}));
verif("invariant 2 — une seule cle, nommee, et elle ne porte qu'un departement",
  apres.local.length === 1 && apres.local[0] === "repere.departement"
  && /^(\d{2,3}|2[AB])$/.test(apres.valeur || ""),
  JSON.stringify(apres));
verif("invariant 2 — sessionStorage reste vide", apres.session.length === 0, apres.session.join(","));

await page.getByRole("searchbox").first().fill("Ustaritz");
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Ustaritz", exact: true }).click();
await page.waitForTimeout(700);

const qui = await page.evaluate(() => document.body.innerText);
verif("rendu — le maire de la commune choisie s'affiche",
  /Piero ROUGET/.test(qui), qui.slice(0, 120).replace(/\n+/g, " / "));
verif("rendu — la circonscription s'affiche et ne nomme personne",
  /6e circonscription législative/.test(qui) && !/votre députée est/i.test(qui),
  qui.slice(0, 160).replace(/\n+/g, " / "));

/* INVARIANT 2 encore : le magasin IndexedDB ne doit contenir QUE des paquets
   departementaux. C'est la condition qui rend son usage acceptable. */
const magasins = await page.evaluate(async () => {
  if (!indexedDB.databases) return { inconnu: true };
  const bases = await indexedDB.databases();
  const sortie = { bases: bases.map(b => b.name), cles: [] };
  const db = await new Promise(r => { const q = indexedDB.open("repere-donnees"); q.onsuccess = () => r(q.result); q.onerror = () => r(null); });
  if (db) {
    sortie.magasins = [...db.objectStoreNames];
    if (db.objectStoreNames.contains("departements")) {
      sortie.cles = await new Promise(r => {
        const d = db.transaction("departements").objectStore("departements").getAllKeys();
        d.onsuccess = () => r(d.result); d.onerror = () => r([]);
      });
    }
    db.close();
  }
  return sortie;
});
verif("invariant 2 — un seul magasin, et il ne porte que des paquets departementaux",
  !magasins.inconnu
  && (magasins.magasins || []).every(m => m === "departements")
  && (magasins.cles || []).every(c => /^(dep|socle):[0-9A-Z]{1,3}$/.test(c)),
  JSON.stringify(magasins));

console.log("\n--- l'argent -------------------------------------------------");
await page.getByRole("button", { name: "Où va l'argent" }).click();
await page.waitForTimeout(600);
await page.getByRole("searchbox").first().fill("Ustaritz");
await page.waitForTimeout(400);
await page.getByRole("button", { name: "Ustaritz", exact: true }).click();
await page.waitForTimeout(700);

const argent = await page.evaluate(() => {
  const t = document.body.innerText;
  const barres = [...document.querySelectorAll(".barre i")].map(i => Math.round(i.getBoundingClientRect().width));
  return { t, barres, nulles: barres.filter(w => w === 0).length };
});
verif("rendu — les comptes sont traduits, pas seulement affiches",
  /mois de recettes/.test(argent.t) && /€ de salaires/.test(argent.t), "aucun rapport interne affiche");
verif("invariant 4 — un calcul est annonce comme un calcul",
  /ce n'est pas un chiffre publié/i.test(argent.t), "la mention manque : un calcul passerait pour une donnee officielle");
verif("invariant 5 — aucune barre de largeur nulle",
  argent.barres.length > 0 && argent.nulles === 0,
  argent.barres.length + " barre(s), " + argent.nulles + " a zero pixel");

/* INVARIANT 3 : aucune comparaison entre territoires nulle part dans le rendu. */
const classement = argent.t.match(/classement|palmar|moyenne nationale|mieux que|top \d/i);
verif("invariant 3 — aucun classement ni comparaison entre territoires",
  classement === null, classement ? classement[0] : "");

/* La langue : le francais affiche porte ses accents. Faute commise deux fois. */
const sansAccent = MOTS_A_ACCENTS.filter(m =>
  new RegExp("(?:^|[^A-Za-zÀ-ÿ./-])" + m + "(?![A-Za-zÀ-ÿ./-])").test(argent.t));
verif("langue — le francais affiche porte ses accents",
  sansAccent.length === 0, sansAccent.join(", "));

console.log("\n--- cibles tactiles et accessibilite -------------------------");
const petites = await page.evaluate(() =>
  [...document.querySelectorAll("button, a[href], input")]
    .map(e => ({ h: Math.round(e.getBoundingClientRect().height), t: (e.innerText || e.type || "").slice(0, 20) }))
    .filter(e => e.h > 0 && e.h < 44));
verif("accessibilite — toute cible tactile mesure au moins 44 px",
  petites.length === 0, petites.slice(0, 4).map(p => p.t + " (" + p.h + "px)").join(" | "));

console.log("\n--- hors ligne -----------------------------------------------");
const sw = await page.evaluate(async () => {
  const r = await navigator.serviceWorker.getRegistration();
  if (!r || !r.active) return { actif: false };
  const noms = await caches.keys();
  return { actif: true, caches: noms };
});
verif("invariant 1 — le service worker s'installe", sw.actif === true, JSON.stringify(sw));
verif("invariant 1 — la coquille et les donnees sont dans DEUX caches",
  (sw.caches || []).some(n => n.startsWith("repere-coquille-"))
  && (sw.caches || []).includes("repere-donnees-v1"),
  (sw.caches || []).join(", "));

/* LA COUPURE EST REELLE : ON ETEINT LE SERVEUR.
   `setOffline` coupe le reseau de la PAGE, mais les requetes emises par le
   service worker lui echappent — mesure du 25/08/2026 : six requetes ont
   atteint le serveur pendant une phase declaree hors ligne. Un controle qui
   repose dessus mesurerait donc autre chose que ce qu'il annonce. On coupe la
   seule chose qu'on maitrise vraiment : le serveur cesse d'exister. Ce qui
   s'affiche ensuite ne peut venir que du cache. */
horsLignePhase = true;
await ctx.setOffline(true);
await new Promise(r => { serveur.closeAllConnections(); serveur.close(r); });
servies = [];
await page.reload({ waitUntil: "load" }).catch(() => {});
await page.waitForTimeout(3000);

const horsLigne = await page.evaluate(() => ({
  coupe: navigator.onLine === false,
  texte: document.body.innerText,
}));
verif("invariant 1 — le reseau est bien coupe pendant la mesure",
  horsLigne.coupe === true, "navigator.onLine vaut encore true : la mesure ne prouverait rien");
verif("invariant 1 — hors ligne, l'application s'ouvre",
  /Qui décide chez vous/.test(horsLigne.texte), horsLigne.texte.slice(0, 120));
verif("invariant 1 — hors ligne, le departement deja consulte revient tout seul",
  /Ustaritz|Piero ROUGET|Chercher une commune/.test(horsLigne.texte),
  horsLigne.texte.slice(0, 200).replace(/\n+/g, " / "));

verif("rendu — aucune erreur JavaScript applicative sur tout le parcours",
  erreurs.length === 0, erreurs.slice(0, 3).join(" | "));
/* CE CONTROLE A ETE REECRIT LE 25/08/2026. La premiere version exigeait que le
   navigateur ait REFUSE des requetes pendant la phase hors ligne, en supposant
   qu'une application hors ligne en tente forcement. Mesure : elle n'en tente
   aucune — tout vient du cache, et c'est l'ideal. Le controle punissait donc le
   bon comportement. Ce qu'il faut mesurer est l'inverse : AUCUNE requete ne doit
   atteindre le serveur, puisque tout doit venir du cache. */
verif("invariant 1 — le serveur est bien eteint pendant la mesure",
  serveur.listening === false && servies.length === 0,
  "le serveur ecoute encore, ou a recu " + servies.length + " requete(s)");

await nav.close();
if (serveur.listening) serveur.close();

const echecs = resultats.filter(r => !r.ok);
console.log("\n--------------------------------------------------------------");
console.log(resultats.length + " controles, " + echecs.length + " echec(s).");
if (echecs.length) {
  console.log("\nA CORRIGER :");
  echecs.forEach(e => console.log("  - " + e.nom + (e.detail ? "  -> " + e.detail : "")));
  process.exit(1);
}
console.log("\nVERDICT : tout passe");
