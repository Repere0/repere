---
name: valider-un-fait
description: Préparer un fait du fil éditorial (data/evenements/*.md) à partir d'un brouillon de data/auto/, pour que le porteur n'ait plus qu'à valider. Ne jamais passer valide: true soi-même.
---

# Préparer un fait du fil

Le fil est la seule couche éditoriale de Repère, et sa promesse est « relu par un
humain ». **Seul le porteur passe un fait à `valide: true`.** L'agent prépare.

## Format (voir `data/evenements/scrutin-2026-07-21-8431.md`)
En-tête : `titre`, `date`, `echelon`, `source`, `source_nom`, et si le fait décrit
le contenu d'un texte : `axes_source`, `axes_source_nom`. Puis `confiance`, `valide`.
Corps : le résultat officiel (scrutin, date, décompte), puis « Ce que ça change ».

## Règles d'écriture
1. **Séparer le fait officiel de l'explication.** Le scrutin a sa source (AN) ;
   les grands axes ont la leur (Sénat « La loi en clair », dossier législatif).
2. **Chaque axe cité se retrouve mot pour mot dans le texte source.** Lire le texte
   **en entier** : l'outil de lecture web tronque (le texte n° 911 du Sénat
   s'arrêtait à l'article 5). Un axe introuvable est retiré, pas reformulé.
3. **Décrire la portée exacte, jamais la qualifier.** Aucun adjectif de jugement ;
   ne pas résumer une liste d'articles par ce qu'on croit qu'elle recouvre.
4. **Ce qui a été voté ≠ ce qui est en vigueur.** Si le Conseil constitutionnel a
   censuré, le dire avec la décision citée ; ce qui n'a pas été vérifié s'écrit
   comme non vérifié.
5. Promesse ≠ position ≠ vote ≠ action : ne jamais présenter un vote comme une
   action réalisée.
6. Aucun texte de presse repris ; aucune « analyse d'impact » écrite par un modèle.

## Livrer
- Fichier dans `data/evenements/` avec `valide: false`, sur une branche `data/…`.
- Dans la PR : la liste des axes avec, pour chacun, l'article du texte source ;
  ce qui a été retiré et pourquoi. Le porteur tranche.
