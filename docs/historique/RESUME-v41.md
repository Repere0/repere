# RESUME V41 : mode brouillon, lien sans carte, fusion prudente (D82 à D84)

Date : 31/10/2026. Branche `test/sdk58-expo-go`. **Rien n'est fusionné dans `main`.**

**En une phrase** : les actus de flux des mairies sont désormais off par défaut, avec un brouillon relu par le CEO ; le lien vers le site d'une mairie disparaît quand une actu de flux est publiée ; la fusion n'est pas faite, car elle ferait passer l'application au SDK 58 et publierait le site immédiatement.

## 1. Ce qui est fait

| Bloc | Résultat | Commit |
|---|---|---|
| 1. D82, mode brouillon | Fait. `REPERE_PUBLICATION_ACTUS` vaut `false` sauf texte exact `true`. Sans elle, les données publiées n'ont aucune entrée et `actusFlux` refuse tout fichier sans `publication: true`. Les entrées vont dans `data/auto/actus-brouillon.md`. 13 tests de collecte, dont le script lancé sans la variable. | `9f2fcd1` |
| 2. D84, lien sans carte | Fait. Le lien « Site officiel de la mairie » (il existait déjà dans « Aller plus loin ») disparaît quand la commune a une actu de flux publiée. Pas de carte « Cette semaine » ajoutée. `tsc` vert. BLOCAGES §46. | `7f15a8e` |
| 3. D83, fusion prudente | Fait en documentation seulement. `docs/fusion-main.md` mesure l'écart avec `main` et propose un plan. Description de la PR #174 mise à jour (titre inchangé). Aucune fusion. | `6baba2a` |
| 4. Rapport | Ce fichier. | ce commit |

## 2. Écarts avec le brief, et pourquoi

- **Brouillon en Markdown, pas en JSON** : le bot de collecte n'écrit que dans une liste fermée de chemins (`collecte.yml`). `data/auto/*.md` y figure, `data/actus-brouillon.json` non : le JSON serait refusé.
- **« Copier les 3 meilleures »** : `actus-hebdo.json` n'a qu'un emplacement par commune. Le texte dit « au plus une entrée par commune ». « Meilleures » est aussi un vocabulaire de classement interdit (invariant 3).
- **Activation de D82** : `collecte.yml` ne transmet pas de variable GitHub. Pour activer, il faut une PR : changer le défaut dans `outils/pipeline.sh`, ou ajouter la variable à `collecte.yml` (fichier protégé). Rien n'est activé.
- **Libellé du lien (D84)** : « Voir les actualités sur [site] » non retenu. Le libellé de l'ADR 0005 est gardé. Une page d'accueil de site n'est pas forcément une page d'actualités.
- **Melun et Meaux** : le brief les donnait sans flux. **Non vérifié** : le réseau refuse les sites des mairies. Aucune affirmation n'est faite.
- **Fusion** : non faite. Le brief demandait la mise à jour de la PR, pas la fusion. Ce qui est mesuré est dans `docs/fusion-main.md`.

## 3. Mesures de la fusion (origin/main 70f591f)

- 257 commits à fusionner, 4 commits de `main` absents de la branche. Pas un avancement rapide.
- 0 conflit textuel (`git merge-tree`).
- **Expo SDK 57 → 58** et React Native 0.86.3 → 0.88.1 en production. La PR #174 le disait déjà : « non fusionnable en l'état ».
- Publication automatique du site à la collecte suivante, dès la fusion.
- CI : « Même vérité » rouge (BLOCAGES §43).

## 4. Risque juridique documenté

- **ADR 0007** : la base juridique de la lecture des flux n'est pas vérifiée. Avis écrit requis avant toute publication automatique.
- **Brouillon dans un dépôt public** : une fois fusionné, le bot committera `data/auto/actus-brouillon.md`, c'est-à-dire des titres et résumés de flux de mairies, lisibles par tous sur GitHub, avant tout avis juridique. Le fichier n'est pas publié sur le site. Décision du CEO demandée (voir `docs/fusion-main.md`).
- **Résumé IA** : non fait. D33 impose la relecture ; la transmission de textes de mairie à un tiers n'est pas vérifiée (BLOCAGES §45).

## 5. Checklist avant fusion

1. **SDK 58** : maintenant, plus tard, ou jamais. Bloquant.
2. **Brouillon d'actus** : dans le dépôt public ou hors dépôt. Bloquant.
3. **Avis juridique écrit** (ADR 0007) : requis avant toute publication automatique d'actus de flux, donc avant d'activer D82. Pas bloquant pour la fusion en mode brouillon.
4. **Secrets Netlify** (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`) : **non vérifiable d'ici** (GitHub répond 403). À contrôler dans les paramètres du dépôt.
5. **« Même vérité »** (BLOCAGES §43) : décision produit, à trancher.
6. **Fusion** : `main` d'abord fusionné dans la branche (il a avancé), puis fusion `--no-ff`, pour qu'un seul commit puisse être défait.
7. **Après fusion** : lancer la collecte à la main (`workflow_dispatch`), vérifier la publication et le fichier `actuelles-rss.json` (`"publication": false`, aucune entrée).
8. **`REPERE_PUBLICATION_ACTUS`** : reste à `false`.
9. **Gemini** : pas requis, rien n'est implémenté (BLOCAGES §45).

## 6. Vérifications faites

- `npm test` (mono) : 225/227. L'échec restant, `runtime.test.mjs`, vient du navigateur Playwright absent de la session. Il n'est pas lié à ce lot.
- Collecte RSS : 13/13, dont le script lancé sans la variable.
- `tsc --noEmit` (apps/mobile) : vert après le bloc 2.
- `bash -n outils/pipeline.sh` : syntaxe correcte.

## 7. Top 5 à tester sur iPhone (non joués)

1. **Accueil, commune sans actu de flux** : aucune carte « Actus publiées par la mairie ». « Aller plus loin » montre « Site officiel de la mairie » si l'annuaire donne un site ; le lien ouvre le navigateur.
2. **« Cette semaine à Melun »** : doit dire « Aucune actu cette semaine », sans fausse actualité (actus-hebdo vide).
3. **Loupe, « Melun »** : la commune apparaît avec « Seine-et-Marne », toucher la choisit (V37, bloc 3).
4. **Date du téléphone au 31/10/2026** : la carte « Élections présidentielles, dans 169 jours » apparaît, « Comment voter ? » ouvre l'écran Voter (V37, bloc 6).
5. **« Où va l'argent » → Partager** : le message contient le titre, le lien `repere://argent` et la source (V37, bloc 7).

## 8. Pour tester en local

    cd mono
    node --test --test-concurrency=1 tests/collecte-rss.test.mjs tests/invariants.test.mjs
