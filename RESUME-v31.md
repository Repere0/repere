# RESUME v31 — 30/10/2026

Branche : `test/sdk58-expo-go`. Quatre blocs faits, aucun bloc bloqué. Rien n'a été fusionné dans `main`. La branche est prête pour une fusion, **à valider par le CEO**.

## Commits

| Commit | Bloc | Contenu |
|---|---|---|
| 8c42296 | 1 (D57) | Thèmes d'intérêt : question 4 de l'accueil, « Mes sujets » et filtre dans « Pour vous » ; ADR 0006 et invariant 2 amendés ; sceau régénéré ; BLOCAGES 33 |
| 668b891 | 2 (D58) | Adresse officielle documentée (BLOCAGES 34). Aucun changement de code |
| 4c2183b | 3 | `docs/dimensions-citoyennete.md` : auto-évaluation des six dimensions |
| e1106f2 | 4 | Correction : la commune gardée est choisie dès le démarrage, quel que soit l'écran d'entrée |
| a9c37a1 | 4 | Tests web mis à jour (« Question 2 sur 4 ») ; compte rendu du test final |

## Tests

- `tsc --noEmit` : 0 erreur.
- Porte partagée : 263 réussis, 0 échec (relancée après la correction de la commune).
- Porte web : verte (parcours, zoom, cartes de partage).
- Chargement à froid, Chromium 390 px, commune gardée : accueil, chez-vous, qui-décide, à venir, élus, argent, vote, scrutins, sources, dictionnaire, procédure, actus, bienvenue, confort de lecture, pour vous, mes élus, voter, à propos, confidentialité, FAQ, partager. Aucune erreur JavaScript, aucun débordement horizontal.
- Mode sombre et réglages d'accessibilité (daltonien, taille 22, contraste très élevé, police dyslexie) : tous les écrans chargent sans erreur. **Aucune capture n'a été regardée à l'œil** : le contrôle visuel reste à faire.
- Commune gardée : retrouvée à froid sur « Qui décide », « Élus », « Mes élus », « Chez vous ». Avant la correction, ces écrans répondaient « Aucune commune n'est choisie ».
- Onboarding : les quatre questions s'affichent ; les thèmes choisis sont enregistrés (vérifié dans le stockage du navigateur). Le filtre de « Pour vous » ne montre que le thème choisi ; « Voir tous les sujets » rétablit le fil.

## Ce qui n'est pas fait ou pas vérifié

- **Aucun test sur iPhone réel.** Tout ce qui précède est vérifié dans Chromium à 390 px.
- Les liens de l'accueil ne sont pas des balises `a` : je n'ai pas pu les suivre par un parcours automatique. La présence de chaque écran dans le code a été vérifiée, et chaque écran a été chargé à froid.
- L'écran élu et la fiche annuaire, qui exigent des paramètres, n'ont pas été chargés à froid.
- Sans commune gardée, « Pour vous » s'affiche sans invite au choix : le fil national (scrutins et faits) reste visible, seule la partie budget est absente. À confirmer comme comportement voulu.
- Le rangement des thèmes repose sur les mots-clés du titre. « Sécurité sociale » est rangé en Sécurité (faux positif connu, BLOCAGES 33).
- Le test de non-régression sur la commune gardée n'est pas dans la porte automatique : le défaut est revenu une fois, il faudrait un test qui le surveille.

## Auto-évaluation des six dimensions

Détail et limites dans `docs/dimensions-citoyennete.md`. Échelle : « couvert » = fonctionne pour tout le territoire annoncé, avec ses limites dites à l'écran ; « partiel » = une part identifiable seulement.

| Dimension | État | Principal manque |
|---|---|---|
| 1. Savoir qui décide | partiel | Sénateurs et conseillers régionaux non publiés |
| 2. Où va l'argent | partiel | Budgets communaux seulement en Île-de-France (8 départements) |
| 3. Votes des élus | partiel | Groupes politiques (AMO30) absents du dépôt |
| 4. Impact sur ma vie | partiel | Pas de contenu éditorial expliquant ce que change un vote |
| 5. Agir | partiel | « Contacter » ne donne aucun contact direct ; signalement masqué sans l'adresse de contact |
| 6. Se préparer aux élections | partiel | Deux entrées seulement ; législatives non datées |

Score honnête : **0 couverte sans réserve, 6 partielles**. Le 5/6 du brief n'est pas soutenu par le code.

## Cinq tests à faire sur iPhone à minuit

Profils de RESUME-v28 : une personne âgée peu à l'aise avec le tactile, une personne malvoyante qui règle la taille du texte, une personne qui veut seulement savoir qui la représente. Les profils Marie, Karim et Thomas ne sont définis nulle part dans le dépôt.

1. **Mes élus après redémarrage** (personne qui veut savoir qui la représente) : ouvrir l'application, aller à l'accueil, toucher « Mes élus › ». La commune doit apparaître, sans « Aucune commune n'est choisie ».
2. **Thèmes** (personne qui veut suivre un sujet) : à l'onboarding, cocher « Santé » puis « Terminer ». Dans « Pour vous », seules les publications de ce thème doivent rester ; « Voir tous les sujets » doit tout rétablir.
3. **Taille 22 et accès** (personne malvoyante) : sur l'accueil, « Mes élus », « Voter » et « Pour vous » ne se coupent pas et ne se chevauchent pas. Vérifier aussi le mode daltonien : les couleurs de vote restent distinguables.
4. **Voter** (personne âgée) : le compte à rebours et « Date non fixée » pour les législatives se lisent sans effort ; le lien service-public.fr s'ouvre dans le navigateur.
5. **Fiche du maire** : « Contacter : voir la source officielle » ouvre le Répertoire ; « Contact non publié » ne doit pas apparaître pour un élu qui a une source. Les signalements n'apparaîtront qu'après la définition de `EXPO_PUBLIC_CONTACT_EMAIL`.

## Décisions demandées au CEO

1. **Amendement D57** (thèmes dans le profil, ADR 0006 et invariant 2) : confirmer ou refuser. Le sceau a été régénéré selon le brief.
2. **`EXPO_PUBLIC_CONTACT_EMAIL`** : la définir à minuit avec `repere0@protonmail.com` (BLOCAGES 34). Tant qu'elle ne l'est pas, les signalements et les boutons de contact restent masqués.
3. **Législatives** : confirmer qu'on n'affiche « Date non fixée » tant qu'aucune date n'est publiée (le brief disait juin 2027, non vérifié).
4. **Correction de la commune gardée** : la valider, puisqu'elle change le comportement des écrans après redémarrage.
5. **Contenu éditorial** de la dimension 4 : qui l'écrit, qui le valide.
6. **AMO30** (groupes politiques de l'Assemblée) : toujours absent. Le fichier doit être téléchargé à la main (`outils/collecte.py`, ligne 59).

## Note

La branche `test/sdk58-expo-go` reste prête pour une fusion vers `main`, **à valider par le CEO** après les cinq tests sur iPhone et les décisions ci-dessus.
