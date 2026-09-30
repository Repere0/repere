# Hors ligne sur téléphone — étude, pas chantier

*29/09/2026. Rien n'est construit. Décision reportée par le porteur.*

## Ce qui existe

Le **site** fonctionne hors ligne (service worker + IndexedDB, garde de l'invariant 2,
mesuré serveur éteint par le banc). **L'application mobile, non** : ses données vivent en
mémoire le temps d'une ouverture. Sans réseau, elle dit « Repère n'a pas réussi à joindre
le serveur » avec un bouton Réessayer — une phrase vraie, pas un écran vide.

## Ce qu'il faudrait

1. Un magasin sur le téléphone pour les **fichiers publics déjà téléchargés** : un dossier
   de l'application (expo-file-system), un fichier par clé `dep:77`, `socle:IDX`…
2. **Porter la garde** de `store.js` (« rien d'autre qu'un paquet départemental ») et la
   prouver en la cassant, côté téléphone — c'est le risque principal.
3. Un contrôle « mode avion » : le banc du site éteint le serveur ; il faudrait l'équivalent
   sur un vrai téléphone ou un émulateur (non disponible en CI aujourd'hui).

## Ce qui serait stocké, et combien (mesuré sur `mono/data`, 29/09/2026)

| | brut | compressé |
|---|---:|---:|
| socle national (index, communes, députés, scrutins) | 103 Ko | 25 Ko |
| le département du lecteur (fiche + projets + votes), médiane | 185 Ko | 51 Ko |
| **total pour un lecteur, cas médian** | **≈ 290 Ko** | stocké brut |
| le pire département (62) | 476 Ko | |

Aucune donnée personnelle : ce sont les mêmes fichiers pour tous les lecteurs d'un département.

## Fraîcheur

Les fichiers sont republiés chaque jour. Règle proposée : afficher le cache tout de suite,
**dire sa date** (« données du 28 septembre ») et le remplacer dès que le réseau répond.
`index.json` porte `genere_le` : la date affichée viendrait de là, jamais de l'horloge du
téléphone. Le garde-fou existant (`SCHEMA_ATTENDU`) traite un cache d'un ancien schéma
comme absent.

## Risques

- Afficher un vote ou un maire **périmé sans le dire** : la date doit être visible, sinon
  l'invariant 4 tombe.
- Une garde mal portée laisserait écrire autre chose que des fichiers publics.
- Deux mécanismes de cache (site, téléphone) qui divergent : même motif que les phrases,
  la logique de fraîcheur irait dans `core`.

## Est-ce que ça vaut la complexité ?

**Pas avant la bêta.** Le lecteur ouvre Repère pour une question ponctuelle, presque
toujours avec du réseau ; 76 Ko compressés par ouverture passent en 3G. Le gain réel
(métro, zones blanches) ne justifie pas de reporter le parcours et la qualité, qui sont
la priorité. À rouvrir si les testeurs de décembre le demandent.
