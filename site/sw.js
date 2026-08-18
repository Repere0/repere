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
var DOC = "./index.html";
var COQUILLE = [
  "./index.html",
  "./manifest.webmanifest",
  "./confidentialite.html",
  "./accueil.html",
  "./icones/repere-192.png",
  "./icones/repere-512.png",
  "./icones/repere-512-maskable.png",
  "./icones/apple-touch-icon.png",
  "./icones/favicon-32.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) {
    /* cache: "reload" : on prend la coquille au reseau, jamais au cache HTTP du
       navigateur — sinon un deploiement peut installer une version deja perimee. */
    return c.addAll(COQUILLE.map(function (u) {
      return new Request(u, { cache: "reload" });
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (noms) {
    return Promise.all(noms.map(function (n) {
      return n === VERSION ? null : caches.delete(n);
    }));
  }).then(function () { return self.clients.claim(); }));
});

/* Ne met en cache qu'une reponse reellement valide : une 404 ou une page d'erreur de
   l'hebergeur mise en cache rendrait l'app morte hors ligne, silencieusement. */
function estBonne(rep) {
  return rep && rep.ok && rep.status === 200 && rep.type === "basic";
}

/* ET une reponse qui est vraiment un document. C'EST LE CORRECTIF DU 12 AOUT :
   sans lui, taper n'importe quelle adresse du site dans la barre du navigateur —
   /sw.js, /manifest.webmanifest — comptait comme une navigation, la reponse etait
   rangee sous "./index.html", et le cache d'abord servait ensuite CE fichier a la
   place de l'application. C'est arrive pour de vrai : le code du service worker
   s'affichait a la racine du site. Un visiteur curieux suffisait a se casser l'app,
   jusqu'au deploiement suivant, et rien ne le lui disait. */
function estDocument(rep) {
  var t = rep && rep.headers ? (rep.headers.get("content-type") || "") : "";
  return t.indexOf("text/html") >= 0;
}

/* Les seules adresses qui SONT l'application ou la landing. Toute autre navigation
   passe au reseau sans etre mise en cache : elle ne represente aucune des deux. */
function cleDocument(url) {
  var p = new URL(url).pathname.replace(/\/+$/, "/");
  if (p.indexOf("accueil.html") >= 0 || p === "/presentation") return "./accueil.html";
  if (p === "/" || p.indexOf("index.html") >= 0) return DOC;
  return null;
}

self.addEventListener("fetch", function (e) {
  var r = e.request;
  if (r.method !== "GET") return;
  if (new URL(r.url).origin !== self.location.origin) return;
  /* Cache d'abord pour le document, revalidation en fond. */
  if (r.mode === "navigate") {
    var cle = cleDocument(r.url);
    /* Navigation vers autre chose que l'app ou la landing : on ne touche a rien. */
    if (!cle) return;
    e.respondWith(caches.match(cle).then(function (m) {
      var reseau = fetch(r).then(function (rep) {
        if (estBonne(rep) && estDocument(rep)) {
          var copie = rep.clone();
          caches.open(VERSION).then(function (c) { c.put(cle, copie); });
        }
        return rep;
      });
      if (m) {
        /* On sert le cache tout de suite ; la requete reseau continue seule.
           waitUntil la maintient en vie apres la reponse, sans bloquer l'affichage. */
        e.waitUntil(reseau.catch(function () {}));
        return m;
      }
      /* Premiere visite, ou cache vide : il n'y a que le reseau. */
      return reseau.catch(function () { return Response.error(); });
    }));
    return;
  }
  /* Cache d'abord pour le reste : ce sont des fichiers immuables (icones, manifeste). */
  e.respondWith(caches.match(r).then(function (m) { return m || fetch(r); }));
});
