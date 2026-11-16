# RESUME v20 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Avant chaque commit : tests partagés à 251/251, contrôle des invariants à 0 erreur. Pour le code, aussi : `tsc` à 0 erreur et parcours navigateur à 222/222. Nouveau : le contrôle des cartes de partage, sans aucun échec.

## Commits

| Commit | Bloc |
|---|---|
| bc8f6a7 | 1 — option C retenue, décision 5 s reportée aux testeurs |
| 8154fb9 | 2 — premier lancement léger même avant fusion (104 Ko compressés) |
| f29fffc | 3 — 3 cartes de partage vérifiées et capturées, test ajouté à la CI |
| (ce commit) | 4 — stratégie éditoriale, RESUME-v20 |

## Données : avant et après (navigateur)

| | Avant V15 | V15 (avec agrégats) | V20 (sans agrégats, production actuelle) |
|---|---|---|---|
| Premier lancement, accueil | 249 Ko compressés | 105 Ko | **104 Ko** |
| Retour | — | ~4 Ko | ~4 Ko (1 requête) |

Le fichier demandé dans `packages/data-utils/src/` n'a pas été créé : il existe sous `data/agregats-regionaux.json`, refait à chaque publication. Raisons détaillées dans `docs/performance.md`.

## Partage

Budget, vote et fiche de l'annuaire : 1080 × 1920, logo, contraste, source en pied. Les images sont dans `docs/partage-story/`. **Non prouvé : le PNG réel produit sur iPhone** (dans un navigateur, l'application partage le texte seul). Pas de carte calendrier dans les données locales.

## Pour le CEO à minuit

- **Stratégie éditoriale** : `docs/strategie-editoriale.md`. Trois questions à trancher : qui publie, sur combien de communes, à quel rythme. Sans réponse, les testeurs ne verront rien de neuf : le dernier fait date du 14/08/2026.
- **Checklist de distribution** : inchangée, `docs/checklist-distribution.md` (6 étapes), avec `docs/kit-testeur.md`.
- **Collecte en essai** : `gh workflow run collecte.yml --ref test/sdk58-expo-go`, puis vérifier que « Publier sur Netlify » est sautée.

## Ce qui reste pour V21 (après les retours testeurs)

1. **Audit 5 s** : trancher avec la question 4 du kit (option C).
2. **Débrief** : corriger les « rouges » (`docs/template-debrief.md`).
3. **Partage sur iPhone** : vérifier une fois l'image réelle dans la feuille de partage.
4. **Formulations du groupe** : « Groupe : Inconnu » sur la carte vote, « Groupe politique : non publié » sur l'annuaire. À unifier.
5. **Éditorial** : premiers faits selon les réponses aux trois questions.
6. **Fusion sur `main`** : agrégats, sites des mairies, photos (après l'avis du juriste).
