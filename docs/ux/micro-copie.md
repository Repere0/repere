# Micro-copie : ce qui a changé, ce qui ne change pas

Date : 30/10/2026 (bloc 3 du sprint V8).

## Changé (application seulement)

| Où | Avant | Après | Pourquoi |
|---|---|---|---|
| Actualités, sous-titre | « Ce qui a été publié par les sources officielles. » | « Ce que les sources officielles ont publié. » | Voix active, sans tournure passive. |
| Actualités, vide | « Aucune actualité nationale publiée pour le moment. » | « Pas encore d'actualité nationale dans nos données. » | Dit ce qui manque, sans affirmer que rien n'existe au-delà de nos données. |
| Aujourd'hui, source des comptes | « ⓘ Comptes » | « ⓘ Budget » | Mot courant à la place du terme comptable. |
| Scrutins, échec | « Les scrutins ne sont pas disponibles. » | « On n'a pas encore les scrutins. » | Dit l'état sans jargon ni affirmation sur la source. |

## Non changé, et pourquoi

- **« Mis à jour hier » / « Calendrier actualisé hier »** (exemples du brief). **Conflit avec l'invariant 9** (`CLAUDE.md`) : une donnée gardée sur l'appareil ne doit jamais être présentée comme actuelle si elle ne l'est pas. Une formule relative (« hier ») affirme une fraîcheur que l'application ne peut pas garantir hors ligne. Le code parle donc de « Publication Repère du … » et de « relevé le … ». Décision à prendre par le porteur, pas par l'interface.
- **« En savoir plus »** (calendrier) : même libellé sur le site (`apps/web/src/routes/Calendrier.jsx`). Gardé pour ne pas créer un écart entre les deux.
- **Phrases d'état** (chargement, échec, hors ligne, introuvable) : dans `@repere/data-utils`, partagées avec le site, testées par `tests/donnees.test.mjs`. Non réécrites ici.
- **Phrases de `@repere/core`** (`phrases.js`, `votesVides.js`, libellés d'onglets, `LIBELLES`) : partagées avec le site, vérifiées par `tests/meme-verite.mjs`. Non réécrites ici.
- **« dépensés par habitant en 2025 · source : OFGL »** (accueil) : l'acronyme est expliqué par la pastille de source à côté (« Observatoire des finances et de la gestion publique locales »). Gardé.
- **« Voir plus »** : aucune occurrence dans l'application. Rien à changer sur ce point.

## Règles appliquées

- Une phrase dit ce qu'on sait, et ce qui manque, sans deviner.
- Un bouton dit ce qu'il fait (« Retenir Meaux sur ce téléphone », « Où va cet argent ? »).
- Pas de jargon administratif sans source ou explication à côté.
