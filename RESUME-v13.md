# RESUME v13 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Après chaque bloc : `tsc` à 0 erreur, tests partagés à 248/248, parcours navigateur à 222/222.

| Commit | Bloc |
|---|---|
| 4ee6fba | A — date et ancienneté visibles |
| 8868079 | B — quatre couches sur le chiffre du budget de l'accueil |
| 4759a2d | C — barres empilées et jauges |
| ce0a2dd | D — dernières publications |
| (ce commit) | RESUME-v13 |

## A — Fraîcheur

Nouveau composant `DateDonnee` : « [Données] du [date] · il y a N jours · Source ». Toute la ligne est un lien de 44 px vers la source. Jamais « à jour ». Au-delà de 30 jours, la ligne passe en gras, avec un nouveau jeton « ancien » : un gris tiré vers le rouge, plafonné à l'amplitude 24 par l'invariant 7. Contraste d'au moins 4,97:1.

| Écran | Ligne affichée (Meaux, le 30/10) |
|---|---|
| Aujourd'hui | Seine-et-Marne · Île-de-France / Publication Repère du 30 octobre 2026 · aujourd'hui |
| Budget | Comptes OFGL du 29 juillet 2026 · il y a 93 jours (en « ancien ») |
| Fiche élu | Relevé des votes du 28 octobre 2026 · il y a 2 jours |
| Calendrier | Relevé de l'agenda du … (remplace « Mis à jour il y a N jours ») |

Actualités : pas de donnée, donc pas de date.

## B — Quatre couches (carte « L'argent de … » de l'accueil)

Chiffre, contexte, conséquence, source. Melun, vérifié contre les données brutes : 2 495 € en 2025 ; « En 2024 : 2 372 € » ; dont 1 130 € de salaires et 777 € d'investissement ; source OFGL.

**Pas de « Moyenne IDF » ni de « 7 communes sur 10 »** : l'invariant 3 interdit de comparer ou classer des territoires. Le contexte reste dans la commune.

Le budget détaillé (`argent.tsx`) avait déjà l'évolution et la part des salaires.

## C — Infographies

- **Budget** : barre empilée « Sur 100 € : 45 € de salaires · 31 € d'investissement · 24 € d'autres dépenses », annoncée « Calcul Repère ».
- **Vote de l'accueil** : barre pour / contre / abstention et décompte du scrutin.
- **Fiche élu** : micro-jauge et décompte sous chaque vote.

Les couleurs sont trois gris : l'invariant 7 réserve les couleurs aux échelons et aux groupes. Pas d'émojis (décision du 30/09). Pas de répartition « écoles / voirie » : elle n'existe pas dans les comptes OFGL publiés.

## D — Dernières publications

Carte faite (`src/ui/dernieres-publications.tsx`) mais **masquée aujourd'hui** : le dernier fait date du 13/10, il y a 17 jours, et la règle demande moins de 7 jours. Elle a été vérifiée en avançant l'horloge du navigateur au 16/10. Aucune date de prochaine publication n'est déductible des données.

## Observations

1. **L'invariant 3 bloque la comparaison que le CEO demande.** Pour l'avoir, il faut amender l'invariant, ce qui est une décision produit. En l'état, « deux fois plus que la moyenne » ne peut pas s'écrire.
2. **L'invariant 7 empêche un vrai rouge** pour l'ancienneté. Le jeton « ancien » est à peine rosé. Le nombre de jours en gras porte le signal.
3. **La rétention dépend du rythme de publication**, pas de l'écran. Avec 12 scrutins solennels et 8 faits de rédaction, dont le plus récent date de 17 jours, la carte « Dernières publications » reste vide.
4. **Les données OFGL ont 93 jours.** Elles s'affichent en « ancien » sur le budget, de façon honnête. Les testeurs le verront.
5. **Doublon apparent mais exact** : les scrutins 8705 et 8706 du 13/10 ont le même décompte (503 pour, 0 contre, 67 abstentions), vérifié sur le site de l'Assemblée.
6. **Contradiction interne relevée** : CLAUDE.md (invariant 7 amendé) dit « les votes restent vert/rouge/gris », mais `palette.ts` et les tests gardent les votes en gris. J'ai suivi le code et les tests. À trancher.
