# Performance

Date : 30/10/2026. Bloc 8 de la mission v8.

## Ce qui est mesuré : rien, dans cette session

Aucune mesure de temps n'a été prise sur un appareil. Aucun chiffre de performance n'est écrit ici. Les nombres de ce document sont des réglages, pas des résultats.

## Ce qui a été fait

- **Liste des élus** (`mono/apps/mobile/src/app/(onglets)/elus.tsx`) : `FlatList` avec `initialNumToRender={20}`, `maxToRenderPerBatch={20}`, `windowSize={10}`.
  - `initialNumToRender` : une première page de 20 fiches, de quoi remplir un écran et demi.
  - `maxToRenderPerBatch` : pas plus de 20 fiches rendues par image pendant le défilement.
  - `windowSize` : dix écrans de hauteur gardés montés. Plus haut, la mémoire augmente sans gain visible ; plus bas, un défilement rapide montre du vide.
  - Ces valeurs sont des réglages de départ : elles n'ont pas été éprouvées sur une liste complète d'élus en appareil. Le nombre de fiches n'a pas été compté dans cette session.
- **Mesure en développement** : `console.time` puis `console.timeEnd` autour du chargement de l'annuaire, sous `__DEV__`. Rien n'est écrit en production.
- **Images** : l'application n'utilise aucun composant `<Image>` (vérifié par recherche dans `src/`). Il n'y a donc pas de chargement paresseux à régler. Les photos ne sont pas publiées dans les données (voir l'annuaire).

## Ce qui n'a pas été fait

- `console.time` sur l'accueil et sur la fiche élu : ces écrans reçoivent leurs données du fournisseur de commune partagé. L'instrumenter demande un point de mesure dans ce fournisseur, pas dans l'écran. Non fait dans ce bloc.
- Aucune mesure du temps de premier affichage sur appareil.

## Pour mesurer plus tard

1. Sur un appareil de développement, lancer l'application en mode développement et ouvrir Élus : la console affiche « annuaire : chargement » avec la durée.
2. Faire défiler la liste complète. Noter si des lignes apparaissent en retard (vide visible) : c'est le signe qu'il faut augmenter `windowSize` ou `maxToRenderPerBatch`.
3. Consigner les valeurs obtenues ici, avec l'appareil et la version, et seulement celles-là.

## Mesures du 30/10/2026 (V15, bloc 4) — dans le navigateur, pas sur appareil

Méthode : export web, serveur local, Chromium (Playwright). On compte les fichiers `/data/` effectivement reçus. Les tailles compressées sont celles d'un gzip niveau 9 des mêmes fichiers. Le serveur de production (Netlify) compresse les réponses JSON ; le niveau exact n'a pas été mesuré.

| Parcours | Avant (8 départements d'IDF) | Après (agrégats pré-calculés) |
|---|---|---|
| Premier lancement, accueil seul | 12 fichiers, 890 Ko bruts, **249 Ko** compressés | 6 fichiers, 369 Ko bruts, **105 Ko** compressés |
| Premier lancement, accueil + budget de Meaux | 16 fichiers, 1 029 Ko bruts, 277 Ko compressés | 10 fichiers, 507 Ko bruts, 132 Ko compressés |
| Retour, même navigateur | — | 1 requête (`index.json`), 17 Ko bruts, ~4 Ko compressés |

- Objectif « moins de 200 Ko au premier lancement » : **atteint en compressé (105 Ko), pas en brut (369 Ko)**. À lui seul, le fichier de la Seine-et-Marne (`departments/77.json`) pèse 298 Ko bruts, 84 Ko compressés. Pour descendre plus bas, il faudrait découper les départements, ce qui touche au format de publication.
- Objectif « moins de 50 Ko au retour » : atteint (environ 4 Ko compressés).
- `agregats-regionaux.json` : 4 180 octets bruts, 1 246 compressés, 17 régions. Il est produit par `mono/scripts/agregats-regionaux.mjs` dans `outils/pipeline.sh`.
- En développement, `console.time` mesure la comparaison régionale (`comparaison <région> <année>`) et le chargement de l'annuaire.
