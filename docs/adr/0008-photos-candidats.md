# ADR 0008 — Photos des candidats à la présidentielle, jamais de couleur de parti

- **Date :** 12/11/2026
- **Statut :** appliqué le 12/11/2026, sur décision explicite du porteur (« photos oui, bordures non »).
  Invariant 7 complété dans `CLAUDE.md` et `AGENTS.md`, puis scellé (`node outils/derive_contexte.mjs --sceller`).
- **Porte la décision :** le porteur.

## Contexte

L'invariant 7 réserve les couleurs de groupes politiques à l'identification des **élus** (ADR 0001) et
n'autorise une photo que pour un **élu**, sous licence libre Wikimedia Commons (D27, ADR 0004). Le
carrousel des candidatures déclarées (présidentielle 2027) affichait donc des initiales et une pastille
de parti neutre.

Le porteur a d'abord demandé des photos et une bordure de 2 px à la couleur du parti. Avant exécution,
l'agent a relevé :

- 25 candidatures déclarées, une vingtaine de partis, 5 candidats sans parti. Aucune source officielle
  ne donne la couleur d'un parti ; la palette de Repère ne couvre que les groupes de l'Assemblée.
- Colorer seulement les partis qui ont un groupe à l'Assemblée laisserait les autres en gris :
  un tri visuel entre « gros » et « petits » candidats, contraire à l'invariant 3 et à la neutralité.
- Inventer les autres couleurs serait un choix éditorial sans source (invariant 4).

## Décision

1. **Photos : autorisées pour les candidats**, aux mêmes conditions que pour les élus (ADR 0004) :
   Wikimedia Commons, licence lue dans les métadonnées (CC BY, CC BY-SA, CC0, domaine public),
   crédit affiché (auteur, licence, « Wikimedia Commons (recadrée) »), retrait sur demande
   (`mono/scripts/photos-retirees.json`, clé `C:<id du candidat>`).
2. **Couleurs de parti : interdites pour un candidat**, sans exception. Elles restent limitées aux
   groupes de l'Assemblée nationale, pour identifier un élu. Le parti d'un candidat s'écrit en texte,
   dans une pastille neutre.
3. **Image non modifiée** : aucun fond remplacé, aucun filtre. Seul le recadrage en cercle, déjà
   indiqué dans le crédit (CC BY-SA : modification signalée, même licence).
4. **Jamais chargée chez Wikimedia à l'affichage** : vignettes intégrées dans
   `presidentielle-2027/photos.json`, un fichier national (comme `candidats.json`), produit par la
   chaîne sur le runner GitHub.

## Rapprochement sûr, ou pas de photo

Une candidature déclarée n'a pas d'identifiant officiel (pas d'identifiant de l'Assemblée, pas de code
INSEE). La chaîne retient un item Wikidata seulement si les trois conditions tiennent :

- son libellé français est exactement « Prénom Nom » du fichier des candidats ;
- c'est un être humain (P31 = Q5) de nationalité française (P27 = Q142), avec la profession
  « personnalité politique » (P106 = Q82955) ;
- **il est le seul** à remplir ces conditions. Deux homonymes : pas de photo.

L'identifiant Wikidata retenu est écrit à côté de chaque photo (`wikidata`) : le porteur peut vérifier
chaque visage d'un clic, et retirer une photo par sa clé.

## Conséquences à connaître

- **Inégalité résiduelle** : un candidat sans photo libre, ou que Wikidata ne range pas parmi les
  personnalités politiques, garde ses initiales. L'écran le dit en une phrase (invariant 5). C'est un
  effet de la source, pas un choix de Repère ; il est annoncé, jamais caché.
- **Non vérifié dans la session qui l'a écrit** : Wikidata et Commons sont injoignables depuis le
  conteneur (proxy, refus mesuré le 12/11/2026). La requête n'a jamais tourné contre le vrai Wikidata ;
  le premier passage du runner donnera le compte (bilan de couverture de `collecte.yml`).
- **Droit à l'image** (non juridique : l'agent n'est pas juriste) : comme pour les élus (ADR 0004),
  une licence libre n'efface pas le droit à l'image. Un candidat déclaré n'exerce pas toujours un mandat.
  À faire valider.
