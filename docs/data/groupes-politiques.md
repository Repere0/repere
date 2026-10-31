# Groupe politique d'un député : source et intégration

Date : 30/10/2026. Statut : **le lien n'est pas publié par Repère.** `groupeDe()` retourne « Inconnu ».

## Ce que le dépôt contient

- `data/deputes.json` : nom, identifiant `acteurRef` (ex. `PA841845`), date de début. **Pas de groupe.**
- `data/scrutins/*.json` : positions par scrutin et par député. **Pas de groupe.**
- `scripts/scrutins-details.mjs` : sait lire les organes de type `GP` (`lireGroupes`) et les blocs de vote
  par groupe (`positionsDuBloc`). Ce script produit les détails des scrutins, pas un lien député → groupe.
- `docs/schema_acteurs.md` : décrit la chaîne `acteur.mandats.mandat[].organes.organeRef`, qui renvoie à un
  organe. Le type `GP` est porté par l'organe.
- Les fichiers bruts (`data/brut_AMO30/`, `data/brut_Scrutins/`) ne sont **pas** dans ce dépôt ni dans
  l'espace de travail : impossible de vérifier le libellé du groupe de Arnaud Saint-Martin.

## Source officielle

- Jeu de données : Assemblée nationale, « Acteurs et organes » (AMO30), sur data.assemblee-nationale.fr.
  **URL exacte à confirmer** avant intégration ; elle n'est pas écrite dans ce dépôt.
- Champ visé : mandat du député → `organeRef` → organe dont `codeType` vaut `GP`, avec son `libelle`.
  Le chemin exact est à vérifier sur le fichier brut, pas seulement sur le schéma.

## Procédure d'intégration (non exécutée)

1. Télécharger AMO30 depuis la source officielle (hors agent, réseau requis).
2. Produire `data/groupes.json` : `{ "PA841845": "<libellé du groupe>", … }` pour les députés en exercice,
   avec la même légende que `scripts/scrutins-details.mjs`.
3. Dans `mono/apps/mobile/src/lib/groupes.ts`, lire ce fichier à la place du retour fixe « Inconnu ».
4. Ne jamais compléter un manquant par une estimation. Un député absent du fichier reste « Inconnu ».

## Décision associée

Les couleurs de groupe ne sont pas appliquées tant que l'ADR 0001 n'est pas tranchée.

## Mise en œuvre (V36, bloc 1 B2) — état au 31/10/2026

**Script écrit et testé ; fichier non produit dans la session.** Voir `BLOCAGES.md` §38.

- Script : `mono/scripts/collecte-groupes.mjs`. Il lit `data/brut_AMO30/json/acteur/` et `organe/` (déjà dépliés par la chaîne), et écrit `mono/data/deputes-groupes.json` :

  ```json
  { "PA722432": { "groupe": "EPR", "nom": "Prénom Nom" } }
  ```

  Clé : `acteurRef`, la même que dans `mono/data/deputes.json`. `groupe` : `libelleAbrege` de l'organe, à défaut `libelle`, ou `"Inconnu"`. Le script ne télécharge rien : `outils/collecte.py` le fait déjà chaque jour.
- Liste des députés couverts : `mono/scripts/deputes.json` (574 mandats ouverts, relevés par `outils/mono_donnees.py`).
- Règle : pour chaque député, les mandats sans `dateFin` dont l'organe a `codeType: "GP"` ; le plus récent (`dateDebut`) l'emporte ; aucun : « Inconnu ». Le code `GP` est le même que celui que lit déjà `scripts/scrutins-details.mjs` (`lireGroupes`).
- Refuser plutôt qu'écraser : si moins de **90 %** des députés ont un groupe, ou si un dossier manque, le script sort en erreur et n'écrit rien. La CI affiche alors `::warning::groupes politiques non collectés`.
- Branchement : `outils/pipeline.sh`, dans le sous-shell `cd mono`, après le relevé du Sénat. Non bloquant.
- Lancer à la main, depuis `mono/`, avec l'archive dépliée :

  ```bash
  node scripts/collecte-groupes.mjs ../data/brut_AMO30/json ./data
  ```

  Sortie attendue : `groupes : N deputes sur 574 rattachés à un groupe ; M en « Inconnu » (K organes lus)`.
- Tests : `mono/tests/collecte-groupes.test.mjs` (8 cas, fixtures inventées), cité dans `mobile.yml`.

**Ce qui n'est pas vérifié** : la forme réelle de l'archive pour les groupes (le champ `libelleAbrege` et `organes.organeRef` en texte sont repris de `outils/agenda_an.py` et `docs/schema_acteurs.md`, pas lus sur une archive réelle). La couverture réelle est inconnue tant que le premier run CI n'a pas eu lieu.

**Écart avec la procédure ci-dessus** : cette procédure prévoyait `data/groupes.json` lu par `groupes.ts`. Le format retenu par le brief V36 est `mono/data/deputes-groupes.json`, clé `acteurRef`, avec le sigle. `lib/groupes.ts` n'existe pas encore : aucun écran ne lit ce fichier. Les couleurs de groupe restent suspendues à l'ADR 0001, comme plus haut.
