# RESUME v19 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Avant chaque commit : tests partagés à 251/251, contrôle des invariants à 0 erreur. Pour les commits de code, aussi : `tsc` à 0 erreur et parcours navigateur à 222/222.

## Commits

| Commit | Bloc |
|---|---|
| 04366cc | 1 — audit 5 s, deuxième passe : budget, fiche élu, calendrier simplifiés ; options pour le CEO |
| 2036a32 | 3 — FAQ dans l'application (8 questions), lien dans les réglages et sur l'accueil |
| d0805d2 | 2 — méthode de débrief et tableau d'analyse |
| (ce commit) | 4 — RESUME-v19 |

## Audit 5 secondes : où on en est

Lignes visibles dans le premier écran (390 × 844), total puis contenu sans les barres :

| Écran | Total | Contenu |
|---|---|---|
| Accueil | 16 | 12 |
| Aujourd'hui | 25 | 20 |
| Budget | 22 | 17 |
| Fiche élu | 23 | 20 |
| Calendrier | 22 | 18 |
| Actualités | 24 | 19 |

**L'objectif « 6 lignes » n'est pas atteint.** Trois règles testées l'empêchent : trois réponses dans le premier écran, calcul annoncé sans ouvrir de feuille, date en tête. Les options sont dans `docs/audit-5s.md` : une réponse en tête (environ 8 lignes de contenu, mais il faut assouplir la règle 1), la date en pied d'écran, ou tester d'abord avec 5 testeurs (recommandé).

## Ce qui reste pour V20, après les retours testeurs

1. **Trancher l'audit 5 s** avec les réponses à la question 4 du kit : ce que les testeurs ont retenu en 5 secondes. Puis appliquer, ou non, l'option A.
2. **Corriger les « rouges »** du débrief (`docs/template-debrief.md`) avant d'élargir à 20-30 testeurs.
3. **Collecte en CI** : lire la couverture des photos et des sites de mairies (`gh workflow run collecte.yml --ref test/sdk58-expo-go`). Corriger les champs DILA si le journal les liste.
4. **Photos** : décision après l'avis du juriste (`docs/juridique/droit-image-elus.md`).
5. **Fusion sur `main`** : sans elle, la production n'a ni agrégats régionaux, ni sites, ni photos.
6. **Réponses de la FAQ** à revoir si la couverture ou la politique change (par exemple « toute la France » le jour où une date est décidée).

## Observations

- La FAQ ne promet aucune date et n'affiche une adresse de contact que si elle est configurée. Sans contact, « Comment signaler un bug ? » renvoie à la personne qui a invité le testeur.
- `docs/tableau-debrief.csv` est vide à dessein : le remplir maintenant reviendrait à inventer des retours.
