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

## Créer le projet, pas à pas (une fois, environ dix minutes)

Tout se fait dans le tableau de bord de Cloudflare, connecté à ton compte. Rien à installer.

1. **Ouvrir** `dash.cloudflare.com`, menu de gauche **Workers & Pages**, bouton **Créer**, onglet **Pages**, puis
   **Se connecter à Git**.
2. **Autoriser GitHub** quand Cloudflare le demande, en limitant l'accès au seul dépôt `Repere0/repere`.
3. **Choisir le dépôt** `Repere0/repere`, puis **Commencer la configuration**.
4. **Remplir exactement** :

   | champ | valeur |
   |---|---|
   | Nom du projet | `repere` (le même que dans `wrangler.toml`, sinon Cloudflare ignore le fichier) |
   | Branche de production | `main` |
   | Préréglage de framework | Aucun |
   | Commande de build | `npm ci --no-audit --no-fund && npm run build:cloudflare` |
   | Répertoire de sortie du build | `dist` |
   | Répertoire racine (dans « Paramètres avancés ») | `mono/apps/mobile` |

5. **Enregistrer et déployer.** Le premier build prend quelques minutes. À la fin, Cloudflare donne une adresse du
   type `repere.pages.dev` (ou `repere-xxx.pages.dev` si le nom est pris).
6. **Vérifier** l'adresse avec le tableau « Ce qui a été vérifié » plus bas, puis `docs/test-iphone.md`.

### Si le build échoue

| message | quoi faire |
|---|---|
| version de Node trop ancienne, ou erreur de syntaxe dans `expo` | Paramètres → Variables et secrets → ajouter `NODE_VERSION` = `22` (type « texte »), puis relancer le déploiement. Le dépôt porte déjà `mono/apps/mobile/.node-version` (22) ; **non vérifié** que Cloudflare le lit dans un sous-dossier |
| `npm ci` ne trouve pas `package-lock.json` | le répertoire racine n'est pas `mono/apps/mobile` : le corriger dans Paramètres → Builds |
| le site s'ouvre mais sans données | le build n'a pas pu copier les données publiées sur Netlify (`miroir-donnees.mjs`) : relancer le déploiement, puis me donner le journal du build |
| Cloudflare refuse une variable saisie dans le tableau de bord | c'est l'effet du `wrangler.toml` : dis-le-moi, la valeur ira dans le fichier |

### Facultatif, plus tard

- **Bouton de contact** : variable de build `EXPO_PUBLIC_CONTACT_EMAIL`.
- **Reconstruire après chaque collecte** : Paramètres → Builds → Crochets de déploiement → en créer un ; copier son
  adresse dans GitHub (dépôt → Settings → Secrets and variables → Actions → nouveau secret `CLOUDFLARE_DEPLOY_HOOK`).
  Sans lui, Pages reconstruit déjà à chaque commit sur `main`, dont celui de la collecte du matin.
- **Nom de domaine** : Pages → Domaines personnalisés. Un nom de domaine se paie chez un bureau d'enregistrement :
  dépense à décider, rien n'est engagé ici.

Déploiement à la main, sans Git : `npm run build:cloudflare`, puis `npx wrangler pages deploy` depuis `mono/apps/mobile`.

### Le fichier `wrangler.toml`

Trois lignes utiles : `name`, `pages_build_output_dir`, `compatibility_date`. L'émulateur de Pages (`wrangler pages
dev`, lancé sans autre argument) l'a lu et a servi `dist/` : sa forme est donc acceptée par l'outil de Cloudflare.
**Non vérifié** : son acceptation par le vrai service au premier build, que seul ton compte peut montrer.

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
