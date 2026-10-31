# Fusion dans main : état mesuré et plan (V41, 31/10/2026)

Aucune fusion n'a été faite. Ce document décrit ce qu'une fusion ferait, ce qui a été mesuré, et ce qui reste à décider.

## Constats mesurés (31/10/2026)

- **Divergence** : `origin/main` est à `70f591f`. La branche `test/sdk58-expo-go` compte **257 commits** absents de `origin/main`, et `origin/main` en compte **4** absents de la branche (commits de collecte quotidiens). `main` n'est pas un ancêtre de la branche : il faut une fusion, pas un avancement rapide.
- **Conflits textuels** : aucun (`git merge-tree`). Cela ne dit rien de l'effet sur l'application.
- **Version d'Expo** : `main` est en `expo ~57.0.26` et `react-native 0.86.3`. La branche est en `expo ~58.0.21` et `react-native 0.88.1`. **Fusionner la branche fait passer l'application en production au SDK 58.** La PR #174 le dit elle-même : « non fusionnable en l'état ».
- **Commits qui touchent le SDK** : 4 modifient `apps/mobile/package.json` (dont `03e3b8f`, passage au SDK 58). Les commits de SDK touchent aussi du code (par exemple `76c4f2b`, thème de navigation pour SDK 58).
- **Taille** : 273 fichiers modifiés, +16 448 / −2 884 par rapport à `origin/main`.
- **Dépôt public**. La collecte pousse sur `main` chaque jour à 05 h 47 UTC, et une poussée sur `main` relance la publication du site.
- **CI** : « Même vérité » est rouge sur la branche (BLOCAGES §43).

## Ce qu'une fusion publierait

1. Le site complet de la branche, à la collecte suivante (publication automatique sur `main`).
2. L'application au SDK 58, sans relecture (décision à prendre, voir plus bas).
3. Les 257 commits, dont une partie (V15 à V36) n'a jamais été fusionnée et n'a pas été relue en PR.

## Changements V37 à V41 (dans la branche)

| Commit | Lot |
|---|---|
| `0615320` | Adresse de contact en production (D71) |
| `d5af156` | Non-régression de la commune gardée |
| `09f8718` | Recherche globale (communes, élus, scrutins) |
| `119ee2f` | Rappel de la prochaine élection |
| `a818578` | Partage sur les écrans de contexte |
| `0de2656` | Invariant 4 amendé (ADR 0007, D81), rescellé |
| `c57dfdd` | Collecte RSS des mairies, sans HTML |
| `6017abc` | Étape de collecte dans la chaîne quotidienne |
| `f2bef45` | Affichage des actus de flux (désactivé par défaut) |
| `9f2fcd1` | Mode brouillon, publication manuelle par défaut (D82) |
| `7f15a8e` | Lien vers le site de la mairie, masqué si flux publié (D84) |

Non faits : V37 blocs 4 et 5 (« Mes suivis », « Nouveau »), bloqués par l'invariant 2 (BLOCAGES §42) ; résumé par IA (BLOCAGES §45).

## Risques, par ordre d'importance

1. **Version d'Expo en production** : SDK 57 → 58 (voir ci-dessus).
2. **Publication immédiate** : tout ce qui est fusionné part sur le site à la collecte suivante.
3. **Brouillon d'actus dans un dépôt public** : `data/auto/actus-brouillon.md` (texte de flux de mairies) serait commité par le bot et lisible par tous, avant tout avis juridique. Le fichier n'est pas publié sur le site, mais il est public sur GitHub. C'est une décision du CEO (voir ci-dessous).
4. **Collecte quotidienne sur `main`** : elle a déjà avancé de 4 commits. Il faudra fusionner `main` dans la branche juste avant, et la relancer ensuite.
5. **« Même vérité » rouge** (§43).

## Retour arrière

- Fusionner avec `--no-ff`, pour qu'un seul commit de fusion puisse être défait : `git revert -m 1 <sha>`. Ne pas défaire des commits un par un.
- Après un retour arrière, relancer la collecte : elle pousse sur `main` et relance la publication.
- Côté Netlify : republier le déploiement précédent depuis le tableau de bord. **Procédure non testée depuis cette session.**

## Plan proposé (non exécuté)

1. Décider du SDK 58 : soit `main` reste en SDK 57 et les commits de SDK sont exclus (liste à établir), soit le passage au SDK 58 est une décision séparée, après essai Expo Go et build EAS.
2. Décider de l'emplacement du brouillon (voir risque 3).
3. Créer une branche depuis `origin/main` et y reporter les commits de fonctionnalités retenus. Vérifier la CI, « Même vérité » compris.
4. Ouvrir une PR relue, fusionner avec `--no-ff`, puis surveiller la collecte et la publication.
5. Garder `REPERE_PUBLICATION_ACTUS` sur `false`.

## Décisions demandées au CEO

- SDK 58 : maintenant, plus tard, ou jamais.
- Brouillon d'actus : dans le dépôt public (lisible par tous, relecture facile), ou hors dépôt (artefact d'exécution, relecture moins simple).
- Mode de fusion : `--no-ff` obligatoire.
- Avis juridique (ADR 0007) : requis avant toute publication automatique, pas avant la fusion en mode brouillon.
