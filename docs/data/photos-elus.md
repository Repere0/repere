# Photos des élus (Wikimedia Commons)

Date : 30/10/2026. Décision D27, ADR 0004.

## Source et règles

- **Images :** Wikimedia Commons. **Rapprochement :** Wikidata (propriété P18, image).
- **Licences acceptées :** CC BY, CC BY-SA, CC0, domaine public, lues dans les métadonnées Commons (`LicenseShortName`). Refusées : NC, ND, GFDL seule, licence absente, auteur absent.
- **Photos de l'Assemblée nationale :** jamais (D1).
- **Rapprochement double, sinon pas de photo :**
  - député : identifiant de l'Assemblée sur Wikidata (P4123) **et** nom de famille identique à celui de l'Assemblée ;
  - maire d'Île-de-France : chef de l'exécutif en cours de la commune (P374 = code INSEE, P6 sans date de fin) **et** nom de famille identique à celui du Répertoire national des élus.
- **Crédit sous la photo :** « Photo : [auteur] · [licence] · Wikimedia Commons (recadrée) ». Il est cliquable vers la page de la photo sur Commons. « Recadrée » signale la modification (avatar rond), comme CC BY-SA le demande.

## Production

- Script : `mono/scripts/collecte-photos-elus.mjs`, appelé par `outils/pipeline.sh` à chaque publication. Il est non bloquant : sans réseau, les initiales restent.
- Sortie : `data/photos-elus/{département}.json`. Chaque entrée porte une vignette de 160 px en data URI (25 Ko au plus), son auteur, sa licence et la page Commons. Clés : identifiant de l'Assemblée pour un député, « M » + code INSEE pour un maire.

## Vie privée : pourquoi les photos ne viennent pas de Wikimedia à l'affichage

Charger `upload.wikimedia.org/...` à l'ouverture d'une fiche dirait à Wikimedia quel élu le lecteur regarde, donc, à une circonscription près, où il habite. L'invariant 2 l'interdit ailleurs (votes servis par département, jamais par député). Les vignettes sont donc intégrées aux fichiers de Repère, **par département**. Vérifié dans le navigateur : l'ouverture d'une fiche avec photo ne fait aucune requête vers un autre hôte.

## Dans l'application

- **Fiche élu** : la photo remplace les initiales quand elle existe, avec le crédit dessous. Sans photo : les initiales, comme avant.
- **Annuaire « Élus »** : toujours les initiales. Afficher une photo par ligne obligerait à charger le fichier de chaque département de France.
- **Garde de l'invariant 4** (`mono/tests/invariants.test.mjs`) : adresse par département autorisée ; chaque photo publiée porte un auteur, une licence libre et une vignette.

## Non vérifié

- **Wikidata et Commons étaient injoignables depuis la session de travail** (proxy). Le script n'a pas tourné sur de vraies données. **La couverture (part des députés et des maires avec photo) est inconnue.**
- **La propriété P4123 n'a pas été confirmée** comme identifiant de l'Assemblée nationale. Si ce n'est pas la bonne, aucun député ne sera rapproché (la double condition l'empêche de rapprocher n'importe qui), et le compte affiché par le script le montrera. Il faudra alors corriger la propriété.
- Les règles du script ont été vérifiées hors ligne : filtre de licences (CC BY-SA 4.0 accepté, CC BY-NC-SA refusé…) et concordance des noms (« Breton » trouvé dans « Xavier Breton », pas dans « Bretonneau » ; « Kadir MEBAREK » → « MEBAREK »).
- Affichage vérifié dans le navigateur avec une image d'essai construite (un carré gris, ce n'est pas une photo), retirée ensuite.
- **Droit à l'image** : une licence libre couvre le droit d'auteur, pas le droit à l'image de la personne. À faire valider (voir l'ADR 0004).
