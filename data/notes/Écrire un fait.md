---
titre: Écrire un fait
---

# La forme

## Le titre

Il reprend **l'objet de la décision, dans les termes du document officiel**. Un titre écrit
par toi, à la taille où il s'affiche, devient un éditorial.

- ✅ « Le conseil municipal a voté le budget 2027 »
- ✅ « Le Conseil constitutionnel a déclaré la loi conforme, avec réserves »
- ❌ « Coup dur pour les finances de la ville »
- ❌ « Ce que le vote d'hier va changer pour vous »

## Le corps — deux phrases

Ce qui a été décidé, par qui, quand. Les chiffres avec leur unité. Rien d'autre.

## « Ce que ça change » — une phrase

Concrète, pour quelqu'un qui n'a pas suivi. Elle répond à : *et alors ?*

- ✅ « La taxe foncière communale reste au même taux qu'en 2026. »
- ✅ « Les travaux commenceront rue Grande à partir de mars. »
- ❌ « Cela pourrait avoir des conséquences importantes pour les habitants. »

Si tu ne sais pas quoi écrire, laisse vide. Voir [[Ce qu'on ne publie jamais]].

## Les propriétés

| Propriété | Ce qu'elle vaut |
|---|---|
| `echelon` | `ville` · `agglo` · `departement` · `region` · `france` |
| `insee` | le code de la commune, entre guillemets, si le fait est local |
| `date` | `AAAA-MM-JJ`, la date **du fait**, pas celle où tu l'écris |
| `source` | l'URL du document officiel, jamais celle d'un article |
| `confiance` | `verifie` si tu as lu le document · `a_confirmer` sinon |
| `valide` | `true` seulement quand tu as fait les trois vérifications |

## Les trois vérifications, avant `valide: true`

1. J'ai **ouvert la source** et le fait y figure.
2. Les chiffres du texte sont **ceux du document**, unité comprise.
3. Quelqu'un qui pense l'inverse de moi **trouverait cette phrase exacte**.

Le geste complet : [[Comment publier un fait]].
