# « Cette semaine » : structure de `mono/data/cette-semaine.json`

Date : 30/10/2026. Statut : **structure seulement, aucun contenu**.

## Structure

| Champ | Type | Sens |
|---|---|---|
| `semaine` | texte | Semaine ISO de la publication, format `AAAA-Wnn` (ex. `2026-W45`). |
| `date_publication` | texte `AAAA-MM-JJ` | Jour où Repère publie ce fichier. |
| `communes` | objet | Clé : code INSEE de la commune. Valeur : la liste des faits de la semaine pour cette commune. Vide tant qu'il n'y a pas de fait sourcé. |

## Règles

- Chaque fait porte sa source (producteur, licence, date, URL), comme partout dans Repère (invariant 4).
- Une commune sans fait récent n'apparaît pas dans `communes` : on ne publie pas de vide (invariant 5).
- Aucun fait n'est écrit à la main sans source. Les événements de `data/evenements.json` ne concernent que le national : ils ne servent pas d'exemple pour une commune.

## Contenu

Vide au 30/10/2026. Aucun événement de Melun des sept derniers jours n'existe dans `data/evenements.json` (les enregistrements datent du 14/08/2026 au plus récent, et sont nationaux). Le contenu attend la spécification de la carte (voir `BLOCAGES.md`, section 4).
