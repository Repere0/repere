# Le Repère du jour — concept, règles, limites

Première carte de « Chez vous » après les trois réponses. Trois faits par jour pour la
commune choisie, tirés des données déjà publiées dans le dépôt. Code : `mono/packages/core/src/repere-du-jour.js`
(logique partagée site et application), `mono/apps/mobile/src/ui/carte-repere-du-jour.tsx` (affichage).

## Ce que la carte montre

- **Deux faits de budget** (chiffres par habitant publiés, ou calculs annoncés comme tels ; à partir de deux exercices publiés, l'évolution d'un exercice à l'autre, écrite comme un calcul : « entre 2024 et 2025 ») et **un fait élu ou vote**
  (circonscription, maire, dernier scrutin du député). Ordre affiché : budget, élu, budget.
- Chaque fait porte **sa source** (producteur, date). Un calcul s'annonce comme calcul (`calcul: true`).
- Un fait sans source affichable n'est pas montré. Sans aucun fait, la carte ne s'affiche pas.
- Le bouton **Partager** envoie le texte du fait, son lien et sa source.

## Règles

- **Même commune, même jour : mêmes faits.** La sélection ne dépend que de la commune, de la date
  (calendrier local, sans effet de fuseau) et de l'ordre fixe des modèles.
- **Jour suivant : un autre fait.** Chaque emplacement change chaque jour dès que la catégorie compte au moins trois modèles.
- **Aucune mémoire.** Aucune clé de stockage n'est ajoutée (invariant 2 : deux clés seulement).
- **Réglage « Ma rue »** : les faits nationaux (vote, circonscription) sont écartés avant la sélection.
  Les trois faits viennent alors des modèles locaux.
- Aucun classement, aucun score, aucune série, aucun point (invariants 3 et 6).

## Rotation sans mémoire

Pour une commune, les modèles disponibles d'une catégorie forment une liste ordonnée (ordre fixe).
Un pas premier avec la longueur de la liste la parcourt sans répéter avant d'avoir tout vu.
Le jour fixe la position. Mesure sur la fixture de test, sans deux exercices publiés (12 modèles budget, 2 par jour ; 6 modèles élus, 1 par jour) :
un même fait revient au plus tôt **6 jours** plus tard, à chaque emplacement.

## Limites, dites telles quelles

- **Pas de non-répétition sur 30 jours.** Elle demanderait 30 modèles par catégorie, ou une mémoire locale (interdite).
  Le cycle réel dépend du nombre de modèles disponibles pour la commune : `floor(n / 2)` jours pour le budget, `n` jours pour les élus.
- **22 modèles, pas 30 (décision D142).** Quinze budget, dont trois évolutions entre deux exercices (V52), et sept élus. Les élus sont limités à ce que le dépôt publie par commune
  (maire, circonscription, vote du député, nombre de circonscriptions). Aucun modèle n'est écrit pour atteindre un nombre.
- **Pas de faits « histoire ».** Mérimée et Wikidata ne répondent pas depuis la session de build : aucune donnée historique n'est affichée.
- **Pas de groupes politiques** dans les faits : la donnée n'est pas publiée dans le dépôt (voir BLOCAGES).
- **Pas de sénateurs** (décision D135).

## Ajouter un modèle

1. Écrire la fonction `texte(c)` dans `BUDGET` ou `ELUS` (`repere-du-jour.js`). Elle renvoie `null` si la donnée manque.
2. Lui donner une `source` existante (`comptes`, `comptes-calcul`, `elus`, `scrutin`) et un `id` unique.
3. Renseigner l'échelon dans `echelonDe` si le fait est national.
4. Relancer `node --test tests/repere-du-jour.test.mjs` : les contrôles de répétition et de « Ma rue » doivent rester verts.
