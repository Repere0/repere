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
