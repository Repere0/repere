# Héberger l'application web sur Cloudflare Pages

Date : 12/11/2026 (roadmap bêta, chantier 2), complété le 17/11/2026 (déploiement par GitHub Actions). Remplace Vercel pour l'application (`mono/apps/mobile`, export web).
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
| `.github/workflows/cloudflare.yml` | chemin A : construit et déploie depuis GitHub, seulement si les deux secrets existent |

## Deux chemins : en choisir UN seul

| | A. GitHub Actions (recommandé) | B. Intégration Git de Pages |
|---|---|---|
| qui construit | le runner GitHub (`.github/workflows/cloudflare.yml`) | les serveurs de Cloudflare |
| quand | push sur `main` (application) **et** fin de chaque collecte réussie | chaque commit sur `main` |
| données du jour | oui : le build part après la publication sur Netlify | pas garanti : le commit de la collecte précède la publication Netlify (d'où le crochet facultatif plus bas) |
| journal du build | dans GitHub, à côté de la CI | dans le tableau de bord Cloudflare |
| ce qu'il faut faire | 3 gestes, ci-dessous | environ dix minutes, plus bas |

**Ne pas activer les deux** : deux déploiements concurrents du même site. Un projet créé par le chemin A (« envoi
direct ») ne peut pas être converti au chemin B, et inversement : c'est une règle de Cloudflare, relevée dans leur
documentation, non éprouvée ici.

## Chemin A : trois gestes (recommandé)

1. **Créer un jeton** : `dash.cloudflare.com` → icône de profil → **Mon profil** → **Jetons d'API** → **Créer un
   jeton** → **Créer un jeton personnalisé**. Nom : `repere-pages`. Autorisation : **Compte** → **Cloudflare Pages**
   → **Modifier**. Ressources du compte : ton compte. **Continuer**, **Créer le jeton**, copier la valeur (elle ne
   s'affiche qu'une fois).
2. **Copier l'identifiant du compte** : **Workers & Pages** → colonne de droite, « ID de compte » → copier.
3. **Les donner à GitHub** : dépôt `Repere0/repere` → **Settings** → **Secrets and variables** → **Actions** →
   **New repository secret**, deux fois :
   - `CLOUDFLARE_API_TOKEN` = le jeton du geste 1 ;
   - `CLOUDFLARE_ACCOUNT_ID` = l'identifiant du geste 2.

C'est tout. Pour un premier déploiement sans attendre : onglet **Actions** → **Cloudflare Pages (application web)** →
**Run workflow**. Le premier passage crée le projet `repere` (adresse `repere.pages.dev`, ou `repere-xxx.pages.dev`
si le nom est pris : elle s'affiche dans **Workers & Pages**). Ensuite, vérifier l'adresse avec le tableau « Ce qui a
été vérifié » plus bas, puis `docs/test-iphone.md`.

Sans les deux secrets, le workflow s'arrête à sa première étape avec une note, sans échec : il peut rester dans le
dépôt tant que tu n'as pas fait ces trois gestes.

**Non vérifié** : aucun déploiement réel n'a eu lieu (pas de compte). La commande `wrangler pages project create`
puis `wrangler pages deploy` est celle de la documentation de Cloudflare ; le premier passage le dira.

## Chemin B : intégration Git, pas à pas (une fois, environ dix minutes)

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
- **Reconstruire après chaque collecte** (chemin B seulement ; le chemin A le fait déjà) : Paramètres → Builds → Crochets de déploiement → en créer un ; copier son
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
