# « Cette semaine » : ce qui existe, ce qui n'a pas été construit

Date : 30/10/2026. Bloc 5 de la mission v8. Décision : **pas de seconde carte.** Vérifié sur les fichiers de `mono/data/` à la date du jour.

## Ce qui existe déjà

- **La carte « Au Parlement cette semaine »** : `mono/apps/mobile/src/ui/semaine.tsx` (composant `SemaineParlement`, `testID="semaine-parlement"`), posée sur l'onglet « Aujourd'hui » (`src/app/(onglets)/chez-vous.tsx`), sous les trois réponses.
- Sa donnée : `semaineParlement` dans l'index publié, dérivée comme sur le site (`@repere/core`, sept jours à partir d'aujourd'hui, national).
- Son état vide honnête existe déjà : « Le calendrier n'est arrivé jusqu'à cet appareil pour aucune institution. Il est republié chaque jour par Repère ; il n'a pas pu être chargé cette fois-ci. » (`AGENDA_PAS_ARRIVE`, `src/lib/absences.ts`).
- Le « chiffre du jour » existe sur l'écran d'accueil de la commune (`src/app/index.tsx`).

## Ce que contiennent les données d'événements

`mono/data/evenements.json` (version 1, mise à jour du 28/10/2026) : **8 entrées, toutes à portée nationale** (`"e": "france"`), toutes avec une source officielle et `"conf": "verifie"`.

| Date | Contenu |
|---|---|
| 14/08/2026 | Décision du Conseil constitutionnel sur la loi sur l'aide à mourir |
| 20/07/2026 (×3) et 21/07/2026 (×4) | Votes d'ensemble de scrutins publics |

Aucune entrée n'est datée de la semaine en cours (30/10/2026). La plus récente date de plus de deux mois. Aucune entrée n'est propre à une commune : `insee` est vide partout.

Conséquence : une carte « Cette semaine » alimentée par ces données afficherait un état vide, ou des événements de l'été présentés comme ceux de la semaine. Dans les deux cas, elle serait fausse ou inutile. Rien n'a été ajouté.

## Autre fichier, non publié

`mono/data/cette-semaine.json` existe, **non suivi par git** (le dossier `data/` est ignoré) : `semaine: 2026-W45`, `date_publication: 2026-11-03`, `communes: {}`. Sa date de publication est postérieure à aujourd'hui, et il ne contient aucune commune. Il n'est lu par aucun écran de l'application. Je ne l'ai pas commité, et je ne sais pas qui l'a produit ni pourquoi : à vérifier par le porteur.

## Pourquoi je n'ai pas ajouté de seconde carte

1. **Doublon.** La brief demande une carte « Cette semaine » en premier sur l'accueil. La carte existante fait déjà ce travail, avec des données réelles quand elles arrivent.
2. **Règle produit.** Le 30/09 et le 07/10, la décision a été de ne pas placer l'agenda national parmi les réponses sur la commune, et de le mettre sous elles en disant qu'il parle de tout le pays. Une carte « Cette semaine à [commune] » en tête contredit cette règle.
3. **Promesse non vérifiée.** « Il sera disponible chaque lundi » ne correspond à aucune publication connue : aucun calendrier de publication n'est écrit dans le code ni dans `docs/`. Je ne l'ai pas écrite.
4. **Pas de données par commune.** Les événements sont nationaux. Une carte par commune serait une carte vide, ou un texte national présenté comme local.

## Ce qui devrait être décidé par le porteur

- Garder la carte existante telle quelle (recommandation : oui), ou la déplacer en tête de l'onglet « Aujourd'hui ». Le second choix contredit la règle du point 2 ci-dessus.
- Si une semaine résumée par commune est voulue : il faut une source et une fréquence de publication vérifiées, puis une entrée par événement avec `insee`, `source_url` et `date`. Sans source, l'entrée n'est pas publiée.
