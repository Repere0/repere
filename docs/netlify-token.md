# Jeton Netlify : procédure de remplacement et de vérification

Document pour le CEO. Il ne régénère rien : le jeton est remplacé par le CEO, à la main.

## Pourquoi c'est nécessaire

La collecte (`.github/workflows/collecte.yml`) reconstruit le site puis le publie sur Netlify. Quand le jeton est refusé, la publication échoue et le site en ligne garde sa dernière version réussie. Le message de l'étape est explicite :

> Jeton NETLIFY_AUTH_TOKEN refusé (HTTP 401). Il est révoqué, expiré ou mal recopié. Remplace la valeur du secret.

Dernier constat : le run `6bc4f41` sur `main` (31/10/2026, 00:55 UTC) a échoué à l'étape « Publier sur Netlify ». La cause n'a pas pu être relue dans les journaux depuis l'environnement de travail (ils ne sont pas lisibles). Le diagnostic de BLOCAGES.md §37 est un HTTP 401.

## 1. Régénérer le jeton (côté Netlify)

- Page : https://app.netlify.com/user/applications#personal-access-tokens
  (Netlify > User settings > Applications > Personal access tokens).
- Créer un jeton (« New access token »), le copier tout de suite : Netlify ne l'affiche qu'une fois.
- Révoquer l'ancien seulement après avoir vérifié le nouveau (étape 4).

## 2. Mettre le jeton dans GitHub

- Page : https://github.com/Repere0/repere/settings/secrets/actions
  (Settings > Secrets and variables > Actions).
- Modifier `NETLIFY_AUTH_TOKEN` et coller la valeur. Ne pas la coller dans une conversation, un fichier ou un commit.
- Vérifier aussi `NETLIFY_SITE_ID` (Netlify > Site configuration > General > Site information). Le workflow renvoie HTTP 404 si cet identifiant est faux.

## 3. Relancer la collecte

Depuis le terminal, avec la CLI GitHub (`gh`) connectée au dépôt :

```
gh workflow run collecte.yml --repo Repere0/repere --ref main
```

Ou depuis l'interface : onglet Actions > « collecte » > « Run workflow » > branche `main`.

Le workflow tourne aussi chaque jour à 05 h 47 UTC (`cron: "47 5 * * *"`).

## 4. Vérifier que le site est à jour

1. Le run `collecte` sur `main` est vert, et l'étape « Publier sur Netlify » affiche une sonde en HTTP 200.
2. Le site répond : `https://repereapp.netlify.app/` (la date de publication est affichée sur l'accueil : « Publication Repère du … »).
3. Le fichier de l'agenda est à jour : `https://repereapp.netlify.app/data/agenda-an.json` doit contenir des séances dont la date est postérieure à aujourd'hui. Sur un ordinateur, `curl -sI https://repereapp.netlify.app/data/agenda-an.json` doit répondre `200`.

Limites de ces vérifications : le site n'a pas pu être joint depuis l'environnement de travail (HTTP 000 le 31/10). La vérification n'a donc pas été faite côté production.

## En cas d'échec après remplacement

- HTTP 401 : jeton encore refusé (mauvaise copie, ou jeton d'un autre compte).
- HTTP 403 : jeton d'un compte qui n'a pas accès au site.
- HTTP 404 : `NETLIFY_SITE_ID` incorrect.
- Message « credit usage exceeded » : quota Netlify atteint, à régler dans le compte Netlify. Le workflow le signale explicitement.
- La publication peut aussi rester bloquée à une question de netlify-cli : le workflow l'interrompt au bout de 5 minutes et l'indique.
