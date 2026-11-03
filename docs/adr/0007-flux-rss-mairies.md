# ADR 0007 — Flux RSS officiels des mairies, lisibles ; HTML toujours interdit

- **Date :** 31/10/2026
- **Statut :** décidé par le porteur (D81), appliqué dans `CLAUDE.md` et `AGENTS.md` (invariant 4), puis scellé. Amende l'ADR 0005 sur ce seul point.

## Décision

1. **Interdit (inchangé, ADR 0005) :** lire le HTML d'un site de mairie, en extraire quoi que ce soit, ou faire une requête vers une page qui n'est pas un flux.
2. **Autorisé :** lire un flux RSS (ou Atom) qu'une mairie publie, à une adresse que le site expose ou qu'une des adresses candidates connues renvoie comme flux valide (voir `mono/scripts/collecte-rss-mairies.mjs`).
3. **Ce qui est repris, et seulement cela :** titre, date de publication, lien vers la page d'origine, et au plus deux phrases tirées de la description du flux. Jamais l'article entier.
4. **Garde-fous du script :** le lien doit pointer vers le même domaine que le site de la mairie (sinon l'entrée est écartée) ; une entrée sans date est écartée (invariant 4) ; une réponse qui n'est pas un flux (HTML, 404, erreur) n'est jamais lue au-delà de son type ; trois entrées au plus par commune.
5. **Affichage :** l'application étiquette chaque actualité de ce flux « Automatique · flux RSS officiel », avec sa date et le lien. Elle ne la présente jamais comme une actualité de Repère.

## Base juridique : non vérifiée

Le raisonnement retenu par le porteur (D81) est le suivant : un flux RSS est publié pour être lu, et la réutilisation partielle (titre, résumé court, date, source préservés) est acceptable.

**Ce raisonnement n'est pas établi.** Ce qui a été vérifié dans cette session :
- une recherche web n'a pas confirmé que le CADA « autorise » une réutilisation : la CADA rend des avis sur les demandes d'accès et de réutilisation ; le droit de réutiliser une information publique relève du Livre III du code des relations entre le public et l'administration (articles L321-1 et suivants), que cette session n'a pas pu consulter ;
- la licence d'un flux n'est pas toujours la Licence Ouverte. Une mairie peut publier sous une autre licence, ou sans licence ;
- un titre et un résumé rédigés par un auteur de la mairie peuvent être protégés par le droit d'auteur, et la citation n'est une exception que dans des limites étroites (article L122-5 du code de la propriété intellectuelle).

**Avant la première publication automatique**, il faut : (a) un avis juridique écrit ; (b) pour chaque mairie retenue, la vérification de la licence de son flux, notée dans `data/actuelles-rss.json`. Sans cela, la chaîne ne publie pas d'actualités de flux.

## Conséquences

- L'invariant 4 ne dit plus que le site d'une mairie n'est « jamais lu ». Il dit que le HTML ne l'est jamais.
- La couverture (combien de communes ont un flux) n'est pas mesurée ici : le réseau de cette session refuse les sites des mairies. Elle sera mesurée par la chaîne quotidienne.
- Un flux peut être faux, ancien ou mort. L'application affiche la date de chaque entrée, pour ne pas laisser croire à une fraîcheur qu'elle n'a pas (invariant 9).
