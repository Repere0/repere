# « Cette semaine » : ce qui existe, ce qui n'a pas été construit

Date : 30/10/2026. Bloc 5 de la mission v8. Décision : **pas de seconde carte.**

## Ce qui existe déjà

- **La carte « Au Parlement cette semaine »** : `mono/apps/mobile/src/ui/semaine.tsx` (composant `SemaineParlement`, `testID="semaine-parlement"`), posée sur l'onglet « Aujourd'hui » (`src/app/(onglets)/chez-vous.tsx`).
- Sa donnée : `semaineParlement` dans l'index publié, dérivée comme sur le site (`@repere/core`, sept jours à partir d'aujourd'hui).
- Son état vide honnête existe déjà : « Le calendrier n'est arrivé jusqu'à cet appareil pour aucune institution. Il est republié chaque jour par Repère ; il n'a pas pu être chargé cette fois-ci. » (`AGENDA_PAS_ARRIVE`, `src/lib/absences.ts`).
- Le « chiffre du jour » existe, sur l'écran d'accueil de la commune (`src/app/index.tsx`).

## Pourquoi je n'ai pas ajouté une seconde carte

1. **Doublon.** La brief demande une carte « Cette semaine » en premier sur l'accueil. La carte existante fait déjà ce travail, avec des données réelles quand elles arrivent.
2. **Règle produit.** Le 30/09 et le 07/10, la décision a été de ne pas placer l'agenda national parmi les réponses sur la commune, et de le mettre sous elles, en disant qu'il parle de tout le pays. Une carte « Cette semaine à [commune] » en tête contredit cette règle.
3. **Promesse non vérifiée.** « Il sera disponible chaque lundi » ne correspond à aucune publication connue du dépôt : aucun calendrier de publication n'est écrit dans le code ni dans `docs/`. Je ne l'ai pas écrite.
4. **Pas de données locales.** `data/evenements/` ne contient que des fichiers Markdown (scrutins de juillet 2026 et une note), aucun `evenements.json`, aucun événement à Melun, aucune semaine résumée. Rien n'a été inventé pour remplir la carte.

## Ce qui devrait être décidé par le CEO

- Garder la carte existante telle quelle (recommandation : oui), ou la déplacer en tête de l'onglet « Aujourd'hui ». Le second choix casse la règle de la section 2.
- Si une semaine résumée par commune est voulue : il faut une source et une fréquence de publication vérifiées, avant d'écrire la phrase « chaque lundi ».

## Format de référence pour un futur résumé par commune

Non créé. Si la décision va dans ce sens, la forme la plus proche des données existantes est une entrée par événement, avec une date, une source officielle (`source_url`) et une commune. Sans source, l'entrée n'est pas publiée. Voir `docs/data/evenements-format.md`.
