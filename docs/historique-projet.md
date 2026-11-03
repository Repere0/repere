# Historique du projet Repère (V36, bloc 0)

Relevé le 31/10/2026 à partir de `git log` sur la branche `test/sdk58-expo-go`. Les dates sont celles des commits (fuseau du commit), pas celles des décisions.

## Chiffres

| Donnée | Valeur | Source |
|---|---|---|
| Premier commit | 13/08/2026 01:43 (+0200), « Repère v18.13 - app, générateur PWA, banc de test, documents » | `git log --reverse` |
| Commits sur la branche de test (HEAD) | 664 | `git rev-list --count HEAD` |
| Commits sur `main` | 437 | `git rev-list --count origin/main` |
| Fichiers suivis (HEAD) | 752 | `git ls-files` |
| Commits par mois (HEAD) | août 54, septembre 128, octobre 482 | `git log --format=%ad` |
| Premier commit Expo | 29/09/2026, « mobile : première tranche verticale Expo, sur les vraies données » (expo ~57.0.26) | `git log -- mono/apps/mobile/package.json` |

Répartition des fichiers suivis : `mono` 234, `site_donnees` 213, `docs` 132, `outils` 60, `data` 38, `site` 9, `.claude` 7, `.github` 4.

## Évolution de la version Expo (`mono/apps/mobile/package.json`)

| Date | Commit | Expo |
|---|---|---|
| 29/09/2026 | 266299b première tranche verticale | ~57.0.26 |
| 29/09 → 29/10 | durcissement, mémoire de la commune, refonte, partage, expo-system-ui | ~57.0.26 |
| 30/10/2026 | 78b797d « repasse l'application au SDK 54 » (branche de test) | ~54.0.38 |
| 30/10/2026 | 03e3b8f « passe l'application au SDK 58 » (branche de test) | ~58.0.21 |
| 30/10/2026 | 2f19446 régression commune gardée (branche de test) | ~58.0.21 |

Sur `main`, Expo reste en ~57.0.26. Le SDK 58 n'existe que sur la branche de test (PR #174, non fusionnable en l'état).

## Chronologie des versions (V1 → V36)

Les numéros « V » sont les sprints de travail. Ils ne sont pas tous datés dans l'historique : seuls les numéros cités dans les messages de commit ou les rapports ont une date.

| Version | Date | Repère dans l'historique |
|---|---|---|
| Repère v18.x (PWA, première version du site) | 13/08 → 19/08/2026 | commits « v18.13 », « v18.18 », « Collecte quotidienne » |
| V1 | 23/09/2026 | « docs: REPERE -- PRODUCT MAP V1 » |
| V2 → V6 | fin septembre (non datée précisément) | pas de marque datée dans l'historique |
| Première tranche Expo | 29/09/2026 | 266299b |
| V7, V8 | 30/10/2026 (rapport de sprint) | mentions dans `docs/` |
| V15, V18 à V23 | 30/10/2026 | « fix(audit) : régressions V15/V20 », rapports RESUME |
| V26 | 30/10/2026 | profil de lecture (ADR 0006) |
| V28 à V32 | 30/10/2026 | rapports RESUME-v28 à v32, SDK 54 puis 58 sur la branche de test |
| V34 | 31/10/2026 | correction crash Élus, refonte UI (`RESUME-v34.md`) |
| V35 | 31/10/2026 | mode sombre persisté, densité calendrier, graisse, personas (`RESUME-v35.md`) |
| V36 | 31/10/2026 | ce document, audit complet |

Les dates du 30/10 regroupent plusieurs sprints : les rapports ont été réécrits ou regroupés ce jour-là. Pour V2 à V6, V9 à V14, V16, V17, V24, V25, V27 et V33, l'historique ne donne pas de date fiable.

## Ce que cet historique ne donne pas

- La date de chaque sprint V2 à V33 : seulement une partie est datée dans les messages de commit.
- Les dates de décision CEO (D-numéros) : elles sont dans `BLOCAGES.md` et les ADR, pas toujours datées par commit.
