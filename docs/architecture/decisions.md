# Décisions d'architecture

*Tranché = ne pas reproposer sans argument neuf. En attente = ne pas trancher à la place du porteur.*

## Tranché

| n° | date | décision | pourquoi |
|---|---|---|---|
| D-M1 | 29/09/2026 | Mobile en **Expo / React Native**, pas un habillage web (TWA) | demande du porteur : une vraie application sur les deux magasins ; la logique est partagée via `core`, pas dupliquée |
| D-M2 | 29/09/2026 | Le web **reste** et reste en production pendant toute la migration | référencement, liens partagés, banc ; aucune fonction retirée |
| D-M4 | 29/09/2026 | `apps/mobile` **hors** de l'espace de travail pnpm | la publication quotidienne ne doit pas dépendre de React Native |
| D-M5 | 29/09/2026 | Pas d'API ni de base (option A, voir [donnees.md](donnees.md)) | rien d'affiché n'est propre au lecteur |
| D-M6 | 29/09/2026 | La commune choisie ne va jamais dans une adresse d'écran | invariant 2, sur la version web de l'app |

## En attente du porteur

| n° | question | ce qui en dépend |
|---|---|---|
| D-M3 | Se souvenir de la commune d'une ouverture à l'autre (sur l'appareil seulement) ? **Préparé dans la PR « mémoire de la commune », non fusionné** : sur demande explicite du lecteur, deux codes publics dans le cache (exclu des sauvegardes), « Oublier » d'un geste. À valider : le principe, et la phrase de confidentialité de l'app (le texte du site dit qu'on ne garde que le département). | étape 9 du parcours de décembre |
| D-M7 | Identifiant d'application définitif (le dossier Play Store du 25/08 proposait `fr.repere.app`) | ne change **plus jamais** après la première publication ; laissé vide dans `app.json` |
| D-M8 | Publier sur l'App Store : 99 €/an | **contredit l'arbitrage du 25/08** (Play Store 25 € + PWA sur iOS, Apple jugé trop cher et incertain) ; ~40 % du budget total chaque année ; exige un éditeur identifié |
| D-M9 | Structure juridique de l'éditeur | les deux magasins affichent un éditeur ; prérequis de la phase 8 |
