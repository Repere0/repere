# Repère

Repère est une application civique française et neutre. Elle répond à deux questions pour une commune : qui décide chez moi, et où va mon argent.
Chaque information renvoie à sa source officielle, avec sa date, et rien n'est donné sans source.
Pas de compte, pas de publicité, pas de traceur : après le premier chargement, l'application fonctionne hors ligne.
La bêta couvre les communes d'Île-de-France, soit 1 262 communes à ce jour.
Le projet est en cours de test : l'application n'est pas encore publiée sur les magasins.

![Budget d'une commune, carte partageable](docs/partage-story/story-budget.png)
![Vote d'un député, carte partageable](docs/partage-story/story-vote.png)
![Annuaire des élus, carte partageable](docs/partage-story/story-annuaire.png)

## Lancer en local

Il faut Node.js et npm. Vérifié dans la session de rédaction : la vérification de types (`npm run verifier`, équivalent de `tsc --noEmit`) et l'export web. Non rejoué dans cette session : `npm ci` (les dépendances étaient déjà installées), le lancement interactif (`npm run start`) et la version web (`npm run web`).

1. Cloner le dépôt :
   `git clone https://github.com/Repere0/repere.git && cd repere/mono/apps/mobile`
2. Installer les dépendances de l'application (elle a son propre `package-lock.json`, hors du workspace pnpm) :
   `npm ci`
3. Lancer Expo :
   `npm run start`, puis scanner le QR code avec **Expo Go** (App Store ou Google Play).
4. Ou lancer la version navigateur :
   `npm run web`
5. Vérifier les types :
   `npm run verifier`

Par défaut, l'application lit ses données publiées sur `https://repereapp.netlify.app/data`. Elle a donc besoin du réseau au premier chargement, puis garde les fichiers dans le cache de l'application.

Les tests du monorepo se lancent depuis `mono/` : `npx pnpm@8.15.9 install --frozen-lockfile`, puis `npm test`. Certains tests demandent un navigateur Playwright.

## Architecture

| Dossier | Contenu |
|---|---|
| `mono/apps/mobile` | L'application Expo (React Native). Les écrans sont dans `src/app`, les composants dans `src/ui`, la logique dans `src/lib`. |
| `mono/packages/core` | Logique partagée (dates, formats, calculs). Paquet `@repere/core`. |
| `mono/packages/data-utils` | Chargement, cache et contrôles des fichiers publics. |
| `mono/packages/ui` | Composants partagés. |
| `mono/apps/web`, `mono/apps/api` | Présents dans le monorepo ; leur rôle n'est pas détaillé ici. |
| `data/` | Données publiées, brouillons générés (`data/auto/`), fiches de contenu (`data/contenu/`). |
| `outils/` | La chaîne de collecte (`pipeline.sh`), lancée chaque nuit par `.github/workflows/collecte.yml`. |
| `docs/` | Décisions (ADR), stratégie éditoriale, guides, audits. |
| `BLOCAGES.md` | Ce qui n'est pas fait, pas vérifié, ou attend une décision. |

Les décisions d'architecture et de contenu sont dans `docs/adr/` et `docs/strategie-editoriale.md`. Les règles qui ne bougent pas sont dans `CLAUDE.md`.

## Licence

Le code est prévu sous licence **AGPL-3.0**. Ce choix est une décision du porteur du projet, et **le fichier `LICENSE` n'est pas encore dans le dépôt** : tant qu'il n'y est pas, aucune licence n'est accordée explicitement. Voir `BLOCAGES.md` §49.

Les données affichées sont publiques. Chaque information indique son producteur, sa licence et sa date.

## Contact

Pour une erreur, une question ou un retour de test : **repere0@protonmail.com** (décision D71, voir `docs/contact-email.md`).

Pour contribuer, lire [CONTRIBUTING.md](CONTRIBUTING.md).
