/* Service worker de Repère (PWA) : l'interface s'ouvre sans réseau.
 *
 * CE QU'IL GARDE : la coquille de l'application (HTML, JS, polices, icônes), préchargée à
 * l'installation. La liste et la version sont écrites au build par scripts/pwa.mjs.
 *
 * CE QU'IL NE FAIT PAS, ET C'EST VOULU :
 *   - /data/ n'est jamais intercepté. Les données passent par le magasin de l'application
 *     (store.js, garde unique, invariant 2), qui sait dire « actuelle », « publication
 *     précédente » ou « impossible à vérifier » (invariant 9). Un cache ici servirait un
 *     vieux fichier comme s'il venait d'être téléchargé : la mention de fraîcheur mentirait.
 *   - toucher une autre origine, ou ranger une réponse qui n'est pas ce qu'elle prétend être.
 */
const VERSION = "__VERSION__";
const COQUILLE = "repere-coquille-" + VERSION;
const A_PRECHARGER = ["/", "/index.html"];

self.addEventListener("install", e => {
  /* addAll : tout ou rien. Une coquille incomplète ferait croire à un hors ligne qui n'existe pas. */
  e.waitUntil(caches.open(COQUILLE)
    .then(c => c.addAll(A_PRECHARGER.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) if (n.startsWith("repere-coquille-") && n !== COQUILLE) await caches.delete(n);
    await self.clients.claim();
  })());
});

const estBonne = r => r && r.ok && r.status === 200 && r.type === "basic";
/* Un document EST du HTML : sans ce contrôle, un fichier quelconque pourrait être rangé sous /index.html. */
const estDocument = r => (r.headers.get("content-type") || "").indexOf("text/html") >= 0;

self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/data/")) return;

  if (req.mode === "navigate") {
    /* Réseau d'abord (version à jour), la coquille en secours. Toute adresse interne mène à index.html. */
    e.respondWith(fetch(req).then(r => (estBonne(r) && estDocument(r) ? r : caches.match("/index.html").then(c => c || r)))
      .catch(() => caches.match("/index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(c => c || fetch(req).then(r => {
    if (estBonne(r) && url.pathname !== "/sw.js" && !estDocument(r)) { const copie = r.clone(); caches.open(COQUILLE).then(k => k.put(req, copie)); }
    return r;
  })));
});
