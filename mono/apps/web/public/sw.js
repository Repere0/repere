/* Service worker de Repère — hors ligne d'abord.
 *
 * DEUX CACHES, ET C'EST LA DÉCISION QUI COMPTE :
 *   COQUILLE  version de l'application. Effacée à chaque déploiement.
 *   DONNEES   fichiers départementaux. SURVIT aux déploiements.
 *
 * Pourquoi les séparer : la chaîne publie tous les jours, donc l'empreinte de
 * l'application change tous les jours. Un cache unique versionné par cette
 * empreinte effacerait le département de chaque lecteur chaque matin — et la
 * PWA installée, celle que les gens croient avoir « sur leur téléphone »,
 * cesserait de marcher hors ligne sans que rien ne le dise. C'est le défaut
 * exact qu'une revue a trouvé sur la version mono-fichier.
 *
 * CE QU'IL NE FAIT PAS : intercepter une autre origine, mettre en cache une
 * réponse qui n'est pas ce qu'elle prétend être, ou stocker quoi que ce soit
 * qui concerne le lecteur.
 */
const VERSION = "__VERSION__";                 /* réécrite au build */
const COQUILLE = "repere-coquille-" + VERSION;
const DONNEES = "repere-donnees-v1";           /* volontairement non versionné */
const DOC = "/index.html";

/* LISTE REECRITE AU BUILD par scripts/empreinte-sw.mjs.
 *
 * POURQUOI ELLE NE PEUT PAS ETRE ECRITE A LA MAIN. Le service worker s'enregistre
 * apres le premier rendu : les fichiers de l'application ont donc DEJA ete
 * telecharges par le navigateur sans passer par lui, et ne sont jamais entres
 * dans son cache. Mesure du 25/08/2026, serveur reellement eteint : la page ne
 * s'ouvrait pas du tout hors ligne — coquille vide, corps vide. Le defaut ne se
 * voyait pas tant que la coupure etait simulee, parce que les requetes du service
 * worker echappent a la coupure simulee et repartaient chercher au serveur.
 *
 * Le build connait les noms empreintes des fichiers produits : c'est lui qui les
 * inscrit ici, et le prechargement les prend au reseau des l'installation. */
const A_PRECHARGER = ["/", "/index.html", "/manifest.webmanifest", "/data/index.json"];

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(COQUILLE);
    /* cache: "reload" : on prend la coquille au réseau, jamais au cache HTTP du
       navigateur — sinon un déploiement peut installer une version déjà périmée. */
    await Promise.allSettled(
      A_PRECHARGER.map(u => c.add(new Request(u, { cache: "reload" }))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms.map(n => {
      if (n === COQUILLE || n === DONNEES) return null;
      /* On n'efface que les anciennes coquilles. Un cache de données inconnu
         n'est pas effacé : on ne détruit pas ce qu'on ne comprend pas. */
      return n.startsWith("repere-coquille-") ? caches.delete(n) : null;
    }));
    await self.clients.claim();
  })());
});

function estBonne(rep) {
  return rep && rep.ok && rep.status === 200 && rep.type === "basic";
}
/* Un document EST du HTML. Sans ce contrôle, naviguer vers /sw.js rangeait le
   code du service worker sous "/index.html", et le site servait ensuite ce
   fichier à la place de l'application. C'est arrivé pour de vrai. */
function estDocument(rep) {
  return (rep.headers.get("content-type") || "").indexOf("text/html") >= 0;
}
function estDonnees(rep) {
  return (rep.headers.get("content-type") || "").indexOf("json") >= 0;
}

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (url.origin !== self.location.origin) return;

  /* 1. Navigation : le cache d'abord, revalidation en fond. */
  if (r.mode === "navigate") {
    e.respondWith((async () => {
      const cache = await caches.open(COQUILLE);
      const enCache = await cache.match(DOC);
      const reseau = fetch(r).then(rep => {
        if (estBonne(rep) && estDocument(rep)) cache.put(DOC, rep.clone());
        return rep;
      });
      if (enCache) { e.waitUntil(reseau.catch(() => {})); return enCache; }
      return reseau.catch(() => Response.error());
    })());
    return;
  }

  /* 2. Données : le cache d'abord, puis rafraîchissement silencieux. Le lecteur
        voit son département tout de suite, même en 3G, même hors ligne. */
  if (url.pathname.startsWith("/data/")) {
    e.respondWith((async () => {
      const cache = await caches.open(DONNEES);
      const enCache = await cache.match(r);
      const reseau = fetch(r).then(rep => {
        if (estBonne(rep) && estDonnees(rep)) cache.put(r, rep.clone());
        return rep;
      });
      if (enCache) { e.waitUntil(reseau.catch(() => {})); return enCache; }
      return reseau.catch(() => new Response(
        JSON.stringify({ erreur: "hors ligne", chemin: url.pathname }),
        { status: 503, headers: { "content-type": "application/json" } }));
    })());
    return;
  }

  /* 3. Le reste — JS, CSS, polices, icônes : immuables, empreintés par le build. */
  e.respondWith((async () => {
    const cache = await caches.open(COQUILLE);
    const enCache = await cache.match(r);
    if (enCache) return enCache;
    try {
      const rep = await fetch(r);
      if (estBonne(rep)) cache.put(r, rep.clone());
      return rep;
    } catch { return Response.error(); }
  })());
});
