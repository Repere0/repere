# Audit des données contre les sources officielles (V36, bloc 5)

Date : 31/10/2026. Branche `test/sdk58-expo-go`.

## Méthode et limites

- **Disponible** : compté dans le dépôt (`mono/data/`, `mono/scripts/`, `data/`), le 31/10/2026, par script de lecture.
- **Attendu** : le chiffre de référence du brief, ou un chiffre légal, avec sa source.
- **Non vérifié** : les dates de dernière mise à jour *en ligne* (data.assemblee-nationale.fr, OFGL, Répertoire national des élus). Le réseau sortant vers ces sites est restreint depuis la session (voir `BLOCAGES.md` §38) : on ne lit ici que les dates **enregistrées dans les fichiers du dépôt**.
- Chiffre officiel des communes d'Île-de-France : une recherche n'a pas donné de chiffre net. Le 1 262 du brief est celui du catalogue du dépôt (`mono/data/communes-beta.json`) ; il n'est pas confirmé comme officiel.

## Tableau Source / Attendu / Disponible / Écart

| Donnée | Source | Attendu | Disponible | Écart | Date de la source (dans le dépôt) |
|---|---|---|---|---|---|
| Députés en exercice | AMO30, `mono/data/deputes.json` | 577 (Constitution, art. 24) | **574** | −3 | relevé du 28/10/2026 |
| Groupe politique de chaque député | AMO30 (`outils/collecte.py`) | 574 à 577 | **0** : pas de fichier. Le script `collecte-groupes.mjs` est branché dans la chaîne (B2) mais n'a pas tourné | total | — |
| Photos des députés | Wikidata P4123 + Commons | non fixé | **non mesuré** : `mono/data/photos-elus/` absent de cette copie du dépôt ; produit par la chaîne | — | — |
| Communes d'Île-de-France avec budget | OFGL, `mono/data/departments/{75,77,78,91,92,93,94,95}.json` | 1 262 (brief) | **1 262** avec comptes ; **1 258** avec les comptes 2025 | 0 ; **−4** pour 2025 | comptes 2025, relevé OFGL du 29/07/2026 |
| Communes de France avec budget | OFGL, mêmes fichiers | 34 969 (portée de `communes-beta.json`) | **34 570** avec comptes ; **34 474** avec 2025 ; 34 637 communes dans les fichiers | −399 avec comptes ; −495 avec 2025 | idem |
| Maires (répertoire des élus) | RNE, dans `departments/*.json` | toutes les communes | 34 637 communes renseignées | 0 sur les fichiers ; l'écart avec 34 969 reste à expliquer | RNE du 11/08/2026 |
| Régions (élus régionaux) | `mono/data/elus-regions/` | 18 régions | **14** fichiers (manquent les codes 02 Martinique, 03 Guyane, 06 Mayotte, 94 Corse) | −4 | non relevée |
| Sénateurs | Sénat (`calendrier-senat.mjs` ne couvre que l'agenda) | 348 (Constitution, art. 24) | **0** : aucun référentiel de sénateurs dans le dépôt | total | — |
| Scrutins de l'Assemblée | `mono/scripts/scrutins.json` | 9 155 dans la source (`total_source`) | **12** scrutins retenus dans le champ `r` ; **107** fichiers de positions par département (`mono/data/scrutins/`) | à expliquer : le dépôt ne garde pas tous les scrutins | relevé du 28/10/2026 |
| Événements éditoriaux (faits datés) | saisie à la main, `mono/data/evenements.json` | — | **8** | — | maj 28/10/2026 |
| Actualités locales | `data/actus-hebdo.json` | 3 communes pilotes | **0** rempli (fichier vide, voulu) | −3 | semaine 2026-W45 |
| Textes de loi | — | — | **absent** : aucun fichier | total | — |
| Amendements | — | — | **absent** : aucun fichier | total | — |
| Projets financés par l'État | DGCL, `mono/scripts/projets.json` et `mono/data/projets/` (8 départements IDF) | — | présent, 8 fichiers | à compléter pour la France | — |

## Dates de mise à jour (dans le dépôt)

- Index de publication : `mono/data/index.json`, généré le 30/10/2026, commit `03e3b8f`.
- Répertoire national des élus : 11/08/2026. OFGL comptes : 29/07/2026. Circonscriptions : découpage 2010 (table de correspondance). Découpage administratif : 26/08/2026.
- **Dernière publication OFGL et AN en ligne : non vérifiées** (pas d'accès sortant).

## Ce que ces écarts changent

1. Aucun groupe politique n'est affiché. L'écran « Qui décide » ne peut pas dire à quel groupe appartient un député.
2. Les sénateurs et les textes de loi n'existent pas dans l'application.
3. La couverture budgétaire est bonne pour l'Île-de-France (1 262 sur 1 262), mais ne l'est pas pour la France (34 570 sur 34 969, soit 98,9 %).
4. Le nombre de députés (574) est inférieur à 577 : trois sièges absents du relevé. Cause à identifier (sièges vacants ? mandat clos mal filtré ?) avant d'afficher un chiffre.
