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
