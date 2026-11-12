# Héberger l'application web sur Cloudflare Pages

Date : 12/11/2026 (roadmap bêta, chantier 2). Remplace Vercel pour l'application (`mono/apps/mobile`, export web).
Le site historique et les données restent publiés sur Netlify par la collecte : ce document n'y touche pas.

**Rien n'est déployé.** Le dépôt est prêt ; créer le projet demande ton compte Cloudflare. Coût : l'offre gratuite
de Pages suffit (aucune fonction exécutée, donc aucun quota de requêtes ; limites de 20 000 fichiers et 25 Mio par
fichier, le build en produit quelques centaines, le plus gros pèse 1,3 Mo). Limites lues dans une recherche web le
12/11/2026, pas sur ton compte : à relire sur la page du projet.

## Ce qui est dans le dépôt

| fichier | rôle |
|---|---|
| `mono/apps/mobile/wrangler.toml` | nom du projet, dossier publié (`dist`) |
| `mono/apps/mobile/scripts/cloudflare.mjs` | écrit `_redirects`, `_headers` et `404.html` dans `dist/` |
| `npm run build:cloudflare` | `build:web` (export, données, PWA) puis `cloudflare.mjs` |

## Créer le projet (une fois, dans le tableau de bord)

1. Workers & Pages → Créer → Pages → Connecter à Git → dépôt `Repere0/repere`, branche de production `main`.
2. Répertoire racine : `mono/apps/mobile`.
3. Commande de build : `npm ci --no-audit --no-fund && npm run build:cloudflare`.
4. Dossier de sortie : `dist` (déjà dans `wrangler.toml`).
5. Variable de build, si tu veux le bouton de contact : `EXPO_PUBLIC_CONTACT_EMAIL`. **Non vérifié** : avec un
   `wrangler.toml`, Cloudflare peut refuser les variables saisies dans le tableau de bord. Si c'est le cas, dis-le-moi :
   la valeur ira dans le script de build.
6. Facultatif : Réglages → Builds → Crochets de déploiement → en créer un, et ranger son adresse dans le secret
   GitHub `CLOUDFLARE_DEPLOY_HOOK`. La collecte reconstruit alors l'application juste après avoir publié les données
   du jour. Sans lui, Pages reconstruit à chaque commit sur `main` (dont celui de la collecte), comme Vercel aujourd'hui.

Déploiement à la main, sans Git : `npm run build:cloudflare`, puis `npx wrangler pages deploy` depuis `mono/apps/mobile`.

## Les règles de routage, et pourquoi

Par défaut, Pages répond `index.html` avec le code 200 à toute adresse inconnue. Un fichier de données absent
répondrait donc une page HTML en 200, et l'application ne saurait plus dire « absent » (doctrine du vide).

- `_redirects` : une réécriture 200 vers `/` par écran (`/finances`, `/qui-decide`…), déduite de `src/app`.
- `404.html` : copie d'`index.html`. Une adresse inconnue ouvre l'application avec un vrai code 404 ; un fichier de
  `/data/` absent répond 404.
- `_headers` : `sw.js` jamais mis en cache.
- `#melun` : le navigateur ne l'envoie jamais au serveur. Il suffit que `/finances` réponde l'application.

## Ce qui a été vérifié, et comment

Avec l'émulateur local de Pages (`wrangler pages dev`, version 4.161), sur le vrai build, le 12/11/2026 :

| demande | réponse |
|---|---|
| `/finances`, `/finances/`, `/elu?nom=…` | 200, l'application |
| `/finances#melun` dans un navigateur | l'écran Finances de Melun |
| `/data/index.json` | 200, JSON |
| `/data/absent.json`, `/_expo/absent.js` | 404 |
| `/inconnu` | 404, l'application s'affiche |
| hors ligne, après une première visite : `/qui-decide` | l'écran s'ouvre depuis le service worker |

Deux pièges mesurés et corrigés :
- la destination `/index.html` dans `_redirects` répond 308 vers `/` et perd l'écran demandé : la destination est `/` ;
- le service worker rangeait la coquille sous `/index.html`, que Pages redirige : hors ligne, plus rien ne s'ouvrait
  (`ERR_FAILED`). Il la lit maintenant sous `/` (`public/sw.js`).

**Non vérifié** : le vrai Cloudflare (l'émulateur n'est pas la production), le build dans leur environnement, et
l'iPhone. Refaire ce tableau sur l'adresse `*.pages.dev` avant de couper Vercel.

## Bascule et retour arrière

1. Laisser Vercel en place. Tester l'adresse `*.pages.dev` (tableau ci-dessus, puis un iPhone).
2. Changer l'adresse donnée aux testeurs. Les raccourcis d'écran d'accueil déjà posés pointent vers Vercel : ils sont à
   refaire, et les réglages de lecture (stockés par adresse) repartent de zéro.
3. Retour arrière : redonner l'adresse Vercel. `vercel.json` reste dans le dépôt tant que la bascule n'est pas confirmée.
