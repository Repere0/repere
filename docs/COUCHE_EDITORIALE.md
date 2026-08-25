# AUTO → RELU → PUBLIÉ

Repris du document **DATA BRAIN**, adapté aux sources officielles.

| Dossier | Qui écrit | Vu par l'utilisateur |
|---|---|---|
| `data/auto/` | la chaîne, chaque matin | **jamais** |
| `data/evenements/` | toi, après relecture | oui, c'est le fil |

## Le geste, une fois par jour, trois minutes

1. Ouvre `data/auto/`, choisis un candidat.
2. Relis-le contre sa source. Corrige le titre s'il est illisible.
3. Complète **« Ce que ça change »** — c'est la seule ligne que la machine ne
   remplira jamais, et c'est celle qui a de la valeur.
4. Passe `valide: false` à `valide: true`.
5. Déplace le fichier dans `data/evenements/`.

`pousser.bat` l'emmène, la chaîne le publie le lendemain matin.

## Ce que la chaîne refuse de publier, et pourquoi

- **sans `source`** — l'invariant 4 exige la source officielle. Sans elle, ce n'est pas
  un événement incomplet, c'est une affirmation.
- **une source de presse** — republier le titre et le chapeau d'un journal est une
  reproduction d'œuvre protégée, et un produit qui promet « sources officielles
  uniquement » ne peut pas hériter de la ligne éditoriale d'un journal.
- **une date floue** (« été 2026 ») — un fait daté ou rien.
- **`valide: false`** — un candidat reste en salle d'attente.

Ajouter un domaine à la liste `DOMAINES` de `outils/evenements.py` est une **décision**,
pas une correction : elle engage la promesse du produit.

## Le rythme

Un événement par jour suffit. Trente secondes de lecture pour celui qui te lit,
trois minutes d'écriture pour toi. À ce rythme, le fil a **30 faits datés** dans un mois,
contre 13 aujourd'hui dont le plus récent a deux mois.
