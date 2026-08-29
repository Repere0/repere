# Basculer la publication du mono-fichier vers le monorepo

État au 28 août 2026 : le banc du monorepo est vert (29 contrôles statiques,
41 dans un navigateur). `repereapp.netlify.app` sert pourtant encore
l'application mono-fichier, déposée à la main — `site_a_deployer/` est ignoré par
git, donc rien dans le dépôt ne produit ce qui est en ligne.

## 1. Poser le banc dans la chaîne publique

```bat
cd /d C:\Users\APina\repere
git mv mono\ci\banc.yml .github\workflows\banc.yml
git rm mono\apps\web\public\data\deputes.json
git add -A
git commit -m "banc sur deux systemes, deputes sources et affiches"
git push
```

Attendu : sur GitHub → Actions, une exécution « banc » verte **sur Linux et sur
Windows**. Ne pas publier avant. (`mono/apps/web/public/data/deputes.json` est un
doublon mort : `copier-donnees.mjs` l'écrase à chaque build depuis que le fichier
est engendré par `extract-html.js`.)

## 2. `netlify.toml` à la racine du dépôt

```toml
[build]
  base    = "mono"
  command = "pnpm install --frozen-lockfile && node scripts/extract-html.js ../app_repere_v18_20.html ./data && pnpm build"
  publish = "apps/web/dist"

[build.environment]
  NODE_VERSION = "22"

# Le service worker ne doit JAMAIS etre servi depuis un cache long : c'est lui
# qui porte la version de la coquille. /assets/ est empreinte par le build.
[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

Puis Netlify → projet `repereapp` → Site configuration → Build & deploy : relier
le dépôt GitHub, ne rien saisir à la main (`netlify.toml` fait foi).

Si le build échoue sur pnpm : préfixer la commande par `corepack enable && `.

## 3. Publier, puis vérifier trois adresses

| adresse | attendu | aujourd'hui |
|---|---|---|
| `/data/index.json` | du JSON | 404 |
| `/sw.js` | `VERSION` = empreinte du dernier build | `repere-50ef9723bae8` |
| `/` en navigation privée | Ustaritz → Piero ROUGET → 6e circonscription → Peio Dufau, chacun avec sa source | l'ancienne application |

**En navigation privée, vraiment** : sur un navigateur déjà venu, l'ancien
service worker sert la page depuis son cache et ne se remplace qu'au *second*
chargement. On croit la bascule ratée alors qu'elle a réussi.

## 4. Revenir en arrière

Netlify → Deploys → l'avant-dernier → Publish deploy. Garder
`site_a_deployer/` sur le disque jusqu'à ce que la nouvelle version ait tenu une
semaine.

## À trancher AVANT la bascule

`confidentialite.html` et la landing servie sur `/presentation` n'existent pas
dans le monorepo : leurs adresses tomberont en 404, et l'une des deux est une
page légale. Les recopier dans `mono/apps/web/public/`, ou réécrire la page de
confidentialité pour le nouveau produit (clé de stockage et caches différents).
Recopier telle quelle une page légale qui décrit une autre application est la
seule option déconseillée.

## Après la bascule

`mono/scripts/deputes.json` est un instantané du 26 août 2026 et rien ne le
rafraîchit. C'est le chantier suivant — pas avant : un site qui n'est pas publié
n'a pas de problème de fraîcheur.
