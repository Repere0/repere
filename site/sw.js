/* Service worker de Repere — genere par outils/build_pwa.py, ne pas editer a la main.
 *
 * Il ne fait qu'une chose : servir la coquille de l'app hors ligne.
 *   - Il ne met en cache QUE les fichiers listes ci-dessous (HTML, manifeste, icones).
 *   - Il ne stocke AUCUNE donnee d'utilisateur. L'app n'en produit pas de persistante :
 *     pas de localStorage, pas de sessionStorage, pas de cookie, pas d'IndexedDB.
 *   - Il n'intercepte que les GET de sa propre origine. Tout le reste passe au reseau
 *     sans etre touche.
 *
 * La version vaut l'empreinte de index.html : elle bouge quand l'app bouge, et le
 * vieux cache est efface a l'activation. Personne ne reste sur une version perimee.
 */
var VERSION = "repere-e9d1adb6c1ed";
var COQUILLE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./confidentialite.html",
  "./icones/repere-192.png",
  "./icones/repere-512.png",
  "./icones/repere-512-maskable.png",
  "./icones/apple-touch-icon.png",
  "./icones/favicon-32.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(COQUILLE); })
    .then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (noms) {
    return Promise.all(noms.map(function (n) {
      return n === VERSION ? null : caches.delete(n);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  if (new URL(r.url).origin !== self.location.origin) return;
  /* Reseau d'abord pour le document : si une nouvelle version est en ligne, on la
     prend ; sinon on retombe sur le cache et l'app s'ouvre quand meme hors ligne. */
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(function (rep) {
      var copie = rep.clone();
      caches.open(VERSION).then(function (c) { c.put("./index.html", copie); });
      return rep;
    }).catch(function () {
      return caches.match("./index.html").then(function (m) { return m || Response.error(); });
    }));
    return;
  }
  /* Cache d'abord pour le reste : ce sont des fichiers immuables (icones, manifeste). */
  e.respondWith(caches.match(r).then(function (m) { return m || fetch(r); }));
});
