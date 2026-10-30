# RESUME v21 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Avant chaque commit : tests partagés à 251/251, contrôle des invariants à 0 erreur. Pour le code, aussi : `tsc` à 0 erreur, parcours navigateur à 222/222, cartes de partage sans aucun échec.

## Commits

| Commit | Bloc |
|---|---|
| 2b461ab | 1 — stratégie éditoriale : D29, D30, D31 tranchées, format JSON, procédure du dimanche |
| 2d4606c | 2 — libellé du groupe unifié, carte « Cette semaine à [Commune] » et sa carte de partage, test à 5 cartes |
| (ce commit) | 3a — gabarit `data/actus-hebdo.json` (3 communes pilotes), copie dans la chaîne de publication ; BLOCAGES section 22 ; RESUME-v21 |

## Ce qui est prêt

- **`data/actus-hebdo.json`** : Melun 77288, Meaux 77284 et Versailles 78646 (vérifiées dans les communes de la bêta), entrées vides prêtes à remplir. Semaine 2026-W45, publication le lundi 2 novembre.
- **Application** : sur Aujourd'hui, sous les trois réponses, « Cette semaine à [Commune] » pour les 3 pilotes seulement. Vérifié dans le navigateur avec le gabarit vide : Meaux affiche « Repère publie chaque lundi. Aucune actu cette semaine pour Meaux. », et Paris n'affiche rien. Une actualité remplie s'affiche avec sa source et un bouton de partage (carte « Actualité locale »), vérifiée avec des données d'essai.
- **Chaîne** : `outils/pipeline.sh` copie le fichier dans les données publiées, sans le transformer.

## Écarts avec la brief

1. `date_publication` : 2026-11-02 (lundi) au lieu de 2026-11-03 (mardi).
2. `source_nom` ajouté aux entrées (invariant 4).
3. « Groupe politique : non publié », sans « (source AN) ».

## Brief tronqué

Le message s'arrête au milieu du JSON du bloc 3. La suite de la « préparation distribution réelle » n'est pas arrivée. La checklist existante reste `docs/checklist-distribution.md`.

## Pour le CEO

1. **Dimanche soir** : remplir `data/actus-hebdo.json` (titre, deux phrases, source `https://` et `source_nom`), commiter, ouvrir une pull request vers `main`.
2. **Fusionner avant lundi 05 h 47 UTC** pour une publication le lundi.
3. Envoyer la suite du message V21 si d'autres points étaient prévus.
