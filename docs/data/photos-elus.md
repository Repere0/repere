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

## Transparence et retrait (V18, 30/10/2026)

- **Crédit cliquable** : la ligne « Photo : [auteur] · [licence] · Wikimedia Commons (recadrée) » ouvre la page de la photo sur Commons. Elle y trouve l'auteur, la licence complète et l'original. Le lien est lu dans le champ `page` de `photos-elus/{dep}.json` (la brief disait `source_page` ; le nom existant est gardé).
- **Mention sous la photo** : « Photo sous licence libre, but informatif. Retrait sur demande : [adresse] ». Elle ne s'affiche que si `EXPO_PUBLIC_CONTACT_EMAIL` est renseigné. Toucher l'adresse ouvre un courriel déjà intitulé « Retrait d'une photo d'élu ».

### Procédure de retrait

Un élu, ou toute personne photographiée, peut demander le retrait de sa photo à l'adresse de contact.

1. Retrouver la clé de la personne : identifiant de l'Assemblée (`PA…`) pour un député, « M » + code INSEE de la commune pour un maire.
2. L'ajouter à `mono/scripts/photos-retirees.json`, dans la liste `retirees`, et commiter. **C'est cette liste qui empêche la photo de revenir** : sans elle, la collecte suivante la recréerait.
3. Relancer la collecte (`collecte.yml`) ou attendre celle du lendemain : la photo disparaît des données publiées et les initiales la remplacent.
4. Répondre à la personne.

**Délai proposé : 48 h**, à confirmer par le porteur. C'est un engagement humain : rien dans le code ne le garantit. Il dépend de la personne qui lit l'adresse de contact.

Vérifié dans le navigateur, avec une image d'essai construite et une adresse de test (`essai@exemple.test`), retirées ensuite : crédit en lien, mention de retrait affichée, aucune requête vers un tiers.

## Vérification V36 (bloc 1, B3) — état au 31/10/2026

- **Le script existe** (`mono/scripts/collecte-photos-elus.mjs`) et **il tourne déjà dans la chaîne** : `outils/pipeline.sh` l'appelle à chaque publication, non bloquant. Il n'a pas été ajouté à `collecte.yml` : ce fichier n'appelle que `pipeline.sh`, et sa propre consigne est de ne rien modifier hors de `pipeline.sh`.
- **Nom du fichier de sortie** : le brief V36 disait `data/photos-elus.json`. Le format réel est un fichier par département, `data/photos-elus/{département}.json` (voir plus haut : le navigateur ne charge jamais une image Wikimedia, et les fichiers par département évitent d'en charger un national). Non modifié.
- **Licences** : le filtre (`LICENCE_OK`) et le rapprochement par nom sont testés hors réseau : `mono/tests/photos-licences.test.mjs` (4 cas, cités dans `package.json` et `mobile.yml`).
- **Couverture** : non mesurée. Wikidata (`query.wikidata.org`) et Commons (`commons.wikimedia.org`) ne répondent pas depuis la session (aucune connexion, code 000, le 31/10/2026). La fourchette « 30 à 50 % des députés » du brief n'est donc pas vérifiée et n'est pas reprise ici. Le premier run CI dira le nombre réel (ligne « photos : N deputes sur M » dans le journal).
- **Propriété P4123** : toujours non confirmée (point ci-dessus). Si elle est fausse, aucun député n'est rapproché, et le compte le montrera.
- **Recréation** : non nécessaire, le script existe. Le registre des retraits (`mono/scripts/photos-retirees.json`) est vide.
