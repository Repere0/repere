# Release v1.0 bêta IDF — préparation de la pull request

Préparé le 30/10/2026 (V32, bloc 3). Ce document ne crée ni ne modifie aucune pull request. Le CEO décide à minuit.

## Avant toute chose : trois points à trancher

1. **Une pull request existe déjà pour cette branche.** C'est la PR #174 : ouverte, en brouillon, vers `main`, titrée « test(mobile) : Repère sur Expo Go SDK 58 (branche de test, non fusionnable) ». GitHub n'accepte qu'une PR ouverte par couple branche / base : une nouvelle PR « Release v1.0 » est donc impossible sans fermer la #174. Le plus simple est de réutiliser la #174 (voir la commande plus bas).
2. **Version d'Expo différente de `main`.** `main` porte `expo ~57.0.26`, la branche porte `expo ~58.0.21`. Fusionner changera la version d'Expo de l'application publiée, pas seulement des données. Le titre de la #174 dit justement que la branche « n'est pas fusionnable ». C'est une décision du CEO : garder SDK 58 pour la bêta, ou ramener la branche sur SDK 57 avant fusion.
3. **Intégration continue.** Les jobs « Mobile (application, socle partagé) » ont échoué sur les dernières exécutions. Les causes trouvées et corrigées dans cette session sont décrites plus bas. Les exécutions sur le dernier commit n'étaient pas terminées au moment de la rédaction : **vérifier qu'elles sont vertes avant de fusionner.**

## Ce que contient la release

- **Volume** : 209 commits depuis `origin/main` (le brief annonçait « 30+ »), 223 fichiers modifiés, 13 120 lignes ajoutées et 2 625 supprimées.
- **Application mobile** (Expo) : accueil avec commune gardée, « Qui décide », « Où va l'argent », « Votre député » (vote), « Chez vous », « À venir », « Élus », « Mes élus », « Voter », « Pour vous », fiche élu, dictionnaire, procédure, actualités, FAQ, confort de lecture (taille, contraste, police, daltonien, mouvement), thème sombre suivant le système, partage en image.
- **Site public** : même vérité que l'application, vérifiée sur cinq communes par `tests/meme-verite.mjs`.
- **Données** : budgets communaux et comptes régionaux (OFGL), députés et votes de l'Assemblée, élus régionaux, dates d'élections (en code, dans `lib/elections.ts`), sites des mairies d'Île-de-France.

## Fichiers modifiés, par catégorie

| Catégorie | Fichiers | Contenu |
|---|---|---|
| Écrans et logique de l'application | 75 | `apps/mobile/src/app`, `lib`, `ui` |
| Documentation (ADR, audits, UX, distribution) | 41 | `docs/` |
| Rapports et gouvernance | 26 | `RESUME-v*.md`, `BLOCAGES.md`, `CLAUDE.md`, `AGENTS.md`, `APP_STORE_READINESS.md` |
| Outillage, CI, sceau des invariants | 25 | `.github/`, `.claude/`, `outils/`, `scripts/` |
| Tests | 16 | `apps/mobile/tests/`, `mono/tests/` |
| Configuration de l'application (build, README) | 17 | `apps/mobile/package.json`, `app.json`, `eas.json`, `README.md` |
| Logique partagée (core, data-utils) | 16 | `packages/core`, `packages/data-utils` |
| Design (icônes, logo, écran de démarrage) | 6 | `apps/mobile/assets/` |
| Données publiées | 1 | `data/actus-hebdo.json` (vide, en attente du CEO) |

## Ce qui est fait (vérifié)

- Tests partagés : 263 réussis, 0 échec. Porte web (parcours, zoom, commune gardée, cartes de partage) : verte. Même vérité : 116 contrôles, zéro échec.
- `tsc` : 0 erreur. Invariants : 0 erreur, 3 avertissements (dates de documents de contexte anciennes, à remesurer).
- Chargement à froid de 21 écrans sur Chromium 390 px, sans erreur JavaScript ni débordement horizontal.
- Commune gardée : retrouvée au démarrage sur tous les écrans qui en ont besoin ; un test l'empêche de revenir.
- Mode sombre, daltonien, taille 26 : contrôle visuel de cinq écrans (`docs/audit-final-visuel.md`).

## Ce qui est partiel

- Île-de-France seulement pour les budgets communaux (1 262 communes, 8 départements).
- Sénat et conseils régionaux non publiés : l'application le dit à l'écran.
- « Contacter » renvoie à la source officielle : aucun courriel d'élu n'est publié dans les données.
- Signalement d'erreur et contact : masqués tant que `EXPO_PUBLIC_CONTACT_EMAIL` n'est pas définie. Adresse prévue : `repere0@protonmail.com`.
- Élections : présidentielle datée (18 avril et 2 mai 2027) ; législatives non datées (affichées « Date non fixée »).
- Thèmes du fil « Pour vous » : rangement par mots-clés du titre, approximatif (« sécurité sociale » est rangé en Sécurité).

## Ce qui n'est pas fait

- **Aucun test sur iPhone réel.** Tout est vérifié dans Chromium à 390 px.
- **AMO30** (groupes politiques de l'Assemblée) : absent du dépôt, à télécharger à la main (`outils/collecte.py`, ligne 59). Sans lui, les votes ne sont pas rattachés à un groupe.
- **Contenu éditorial** sur l'impact des votes : aucun, à décider par le CEO.
- **Actualités locales** : `actus-hebdo.json` est vide.
- **maprocuration.gouv.fr** : non joignable depuis l'environnement de travail, lien non vérifié.

## Défauts corrigés pendant la préparation

- Commune gardée non restaurée au démarrage sur les liens directs : corrigé (`e1106f2`), test de non-régression (`2f19446`).
- Onboarding à quatre questions : les tests web attendaient trois questions (`a9c37a1`).
- Garde « chaque script de test est cité par le workflow » : le nouveau test n'était pas cité (`93525c2`).
- Contrôle « même vérité » bloqué par l'onboarding de première visite : il attendait en vain (`c8d5ee6`). Ce contrôle échouait dans la plupart des exécutions CI récentes de la branche.
- Pastille « Chercher une commune » hors marge à taille 26 : corrigé (`f32fbb8`).

## Commande pour mettre la PR à jour

Ne pas utiliser `gh pr create` : une PR existe déjà pour cette branche (#174).

Mettre à jour le titre et la description de la #174, puis la sortir du brouillon. **À faire seulement après la décision du CEO sur les points 1 à 3 ci-dessus.**

```bash
gh pr edit 174 --title "Release v1.0 bêta IDF" --body-file docs/pr-release.md
gh pr ready 174
```

Si `gh` refuse (l'accès GraphQL peut être bloqué depuis certaines sessions), la même opération par l'API REST :

```bash
gh api -X PATCH repos/Repere0/repere/pulls/174 -f title="Release v1.0 bêta IDF" -F body=@docs/pr-release.md
gh api -X POST repos/Repere0/repere/pulls/174/ready_for_review
```

Fusion : « Create a merge commit » (ne pas écraser l'historique, ne pas supprimer la branche).

## Checklist de retour arrière

1. **Site public (environ 1 minute)** : tableau de bord Netlify, *Deploys*, choisir le déploiement d'avant la fusion, *Publish deploy*. Le site et les données redeviennent ceux d'avant. `main` garde la fusion.
2. **Code (environ 10 minutes)** : `git revert -m 1 <commit de fusion>` sur une branche, PR vers `main`, fusion, puis `gh workflow run collecte.yml --ref main`.
3. **Données seules** : vider l'entrée fautive dans `data/actus-hebdo.json`, ou retirer l'entrée dans `apps/mobile/src/lib/mandats-termines.ts`, par PR.
4. **Application déjà installée chez les testeurs** : ne se répare pas depuis le dépôt. Les testeurs gardent la version installée jusqu'à la prochaine publication.
5. **Interdits** : ne jamais pousser en force sur `main`, ne jamais supprimer la branche après fusion.

## Vérifier avant fusion

```bash
git fetch origin
git worktree add --detach ../essai-fusion origin/main
cd ../essai-fusion
git merge --no-commit --no-ff origin/test/sdk58-expo-go   # « Automatic merge went well » attendu
git diff --name-only --diff-filter=U                       # vide attendu
git merge --abort
cd - && git worktree remove ../essai-fusion
```

Vérifier aussi que les deux workflows (« Mobile » et « Épreuve ») sont verts sur le dernier commit, et que la version d'Expo est celle que le CEO a choisie.
