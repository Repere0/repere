# RESUME v32 — 30/10/2026

Branche : `test/sdk58-expo-go`. Trois blocs faits, un point bloquant pour la fusion. Rien n'a été fusionné dans `main` et aucune pull request n'a été créée ni modifiée.

## Commits de la session

| Commit | Bloc | Contenu |
|---|---|---|
| 2f19446 | 1 | Test de non-régression : commune gardée restaurée sur Qui décide, Élus, Mes élus, Chez vous ; sans commune, le message « Aucune commune n'est choisie » |
| f32fbb8 | 2 | Correction visuelle : pastille « Chercher une commune » hors marge à taille 26 |
| 2966a2b | 2 | `docs/audit-final-visuel.md` |
| 93525c2 | CI | Le nouveau test est cité dans `mobile.yml` (garde de la chaîne) |
| c8d5ee6 | CI | Contrôle « même vérité » : passe l'onboarding de première visite |
| 6c669a5 | 3 | `docs/pr-release.md` : préparation de la PR v1.0 |
| (ce commit) | 4 | Ce rapport |

Message du test de régression : « test(régression): commune gardée restaurée partout » (2f19446).

## Ce qui fonctionne (vérifié)

- **Commune gardée** : restaurée au démarrage sur les quatre écrans qui en ont besoin, y compris à partir d'un lien direct. Le test échoue six fois sur le code d'avant la correction (`e1106f2`) et passe sur le code actuel.
- **Porte partagée** : 263 réussis, 0 échec. `tsc` : 0 erreur.
- **Porte web** : parcours, zoom, commune gardée, cartes de partage : verts.
- **Même vérité** (site et application, cinq communes) : 116 contrôles, zéro échec, en local.
- **Chargement à froid** de 21 écrans sur Chromium 390 px : aucune erreur JavaScript, aucun débordement horizontal.
- **Taille 26, mode daltonien, mode sombre** : cinq écrans regardés à l'œil (accueil, Mes élus, fiche élu, budget, vote). Les votes restent distinguables en daltonien : Pour en bleu, Contre en orange, Abstention en gris.
- **Contraste** du texte mesuré à 4,5:1 ou plus sur les cinq écrans. Exceptions : le point du logotype « Repère. » (exempté, c'est une marque) et des émojis mesurés à tort.

## Ce qui fonctionne partiellement

- **Île-de-France seulement** pour les budgets communaux : 1 262 communes sur 8 départements. Hors IDF, la carte budget est vide.
- **Élus** : maire, député et conseillers départementaux du canton, mais pas les sénateurs ni les conseillers régionaux (le texte le dit à l'écran).
- **Contacter** : renvoie vers la source officielle, sans courriel d'élu. Aucun courriel n'est publié dans les données.
- **Signalement d'erreur** : masqué tant que `EXPO_PUBLIC_CONTACT_EMAIL` n'est pas définie.
- **Élections** : présidentielle datée (18 avril et 2 mai 2027). Législatives non datées.
- **Thèmes** : rangement par mots-clés du titre. Approximatif.
- **Pour vous sans commune** : le fil national s'affiche sans invite au choix de commune ; seule la partie budget est absente. À confirmer comme comportement voulu.
- **Navigation** : chaque écran est référencé dans le code et chargé à froid, mais les liens de l'accueil ne sont pas des balises `a`. Je n'ai pas pu les suivre par un parcours automatique.

## Ce qui ne fonctionne pas, ou pas encore

- **AMO30** (groupes politiques de l'Assemblée) : absent du dépôt. Les votes ne sont pas rattachés à un groupe.
- **Actualités locales** : `data/actus-hebdo.json` est vide. L'écran « Actus » ne montre rien de local.
- **Contenu éditorial** sur l'impact des votes : inexistant.
- **Sénat et conseils régionaux** : non publiés.
- **Sur iPhone réel** : rien n'a été vérifié.
- **maprocuration.gouv.fr** : non joignable depuis l'environnement de travail, lien non vérifié.
- **Intégration continue** : le job « Mobile » échouait sur les dernières exécutions de la branche. Trois causes trouvées et corrigées (commune non citée dans le workflow, onboarding bloquant le contrôle « même vérité », tests web en retard sur l'onboarding). Les exécutions sur `6c669a5` étaient en cours au moment de la rédaction. **Non vérifiées vertes.**

## Bloquant pour la fusion

1. **PR existante** : la #174 est ouverte, en brouillon, vers `main`, et son titre dit « non fusionnable ». Une nouvelle PR est impossible pour la même branche : il faut réutiliser la #174.
2. **Version d'Expo différente** : `main` porte `expo ~57.0.26`, la branche `~58.0.21`. La fusion changera la version d'Expo de l'application. C'est une décision du CEO.
3. **CI verte** : à vérifier sur le dernier commit avant toute fusion.

## Score honnête

**0 dimension complète sur 6**, comme écrit en V31 (`docs/dimensions-citoyennete.md`). Les six sont partielles. Le brief annonçait 5 sur 6 en V31 : le code ne le soutient pas.

## Ce que le CEO doit faire (pas le code)

1. **Décider de la version d'Expo** pour la release : garder SDK 58, ou ramener la branche sur SDK 57 avant la fusion.
2. **Décider du sort de la PR #174** : la réutiliser pour la release, ou en ouvrir une autre après l'avoir fermée.
3. **Confirmer l'amendement D57** (thèmes dans le profil, ADR 0006 et invariant 2).
4. **Définir `EXPO_PUBLIC_CONTACT_EMAIL`** avec `repere0@protonmail.com` (BLOCAGES 34). Sans elle, les signalements et contacts restent masqués.
5. **Confirmer « Date non fixée »** pour les législatives.
6. **Valider la correction de la commune gardée** (`e1106f2`).
7. **Décider qui écrit le contenu éditorial** sur l'impact des votes.
8. **Télécharger AMO30** à la main (`outils/collecte.py`, ligne 59).
9. **Remplir `data/actus-hebdo.json`** si l'écran Actus doit montrer quelque chose de local.
10. **Tester sur iPhone** les cinq points ci-dessous, avant toute annonce.

## Checklist pour minuit

- [ ] La CI de `test/sdk58-expo-go` est verte sur le dernier commit (« Mobile » et « Épreuve »).
- [ ] Décision sur la version d'Expo (SDK 58 ou SDK 57) prise et notée.
- [ ] Décision sur la PR #174 prise. Si on la réutilise : `gh pr edit 174 --title "Release v1.0 bêta IDF" --body-file docs/pr-release.md`, puis `gh pr ready 174`.
- [ ] `EXPO_PUBLIC_CONTACT_EMAIL=repere0@protonmail.com` définie pour le build publié.
- [ ] Vérification de la fusion sans conflit (commandes dans `docs/pr-release.md`).
- [ ] Sur iPhone réel, cinq tests :
  1. **Mes élus après redémarrage** : ouvrir l'application, toucher « Mes élus › ». La commune doit apparaître, sans « Aucune commune n'est choisie ».
  2. **Thèmes** : à l'onboarding, cocher « Santé », « Terminer ». Dans « Pour vous », seules les publications de ce thème restent ; « Voir tous les sujets » rétablit le fil.
  3. **Taille 26 et daltonien** : sur l'accueil, la pastille « Chercher une commune » passe sous le logo sans sortir de la marge. Les votes restent distinguables.
  4. **Voter** : le compte à rebours et « Date non fixée » pour les législatives se lisent sans effort ; le lien service-public.fr s'ouvre dans le navigateur.
  5. **Fiche du maire** : « Contacter : voir la source officielle » ouvre le Répertoire ; le signalement n'apparaît que si la variable de contact est définie.
- [ ] Si un test échoue : ne pas fusionner, noter le défaut dans `BLOCAGES.md`.
- [ ] Après fusion : `gh workflow run collecte.yml --ref main` ou attendre 06 h 47 (Paris).
- [ ] Contrôler que le site public sert les données attendues.

## Note

La branche est prête pour une fusion **techniquement vérifiée en local**, mais pas validée sur iPhone, pas verte en CI sur le dernier commit au moment de la rédaction, et en désaccord avec `main` sur la version d'Expo. La fusion relève de la décision du CEO.
