# Actualités locales : format attendu

Statut au 30/10/2026 : **aucune actualité publiée.** Le dossier est vide de données. L'écran « Actus »
n'est pas construit : il n'afficherait que l'état vide. Rien n'a été inventé.

## Format (une entrée par actualité)

```json
{
  "id": "2026-10-30-exemple",
  "titre": "Phrase courte, écrite par un humain",
  "resume": "Une ou deux phrases. Ce que dit la source, sans jugement.",
  "source_nom": "Nom de la source officielle",
  "source_url": "https://…",
  "date_publication": "2026-10-30",
  "infographie_type": "chiffre" | "vote" | "timeline" | "aucune"
}
```

## Règles

- Repère ne résume pas automatiquement un texte : `resume` et `titre` sont écrits par un humain
  (voir `docs/ux/systeme-visuel-2026.md`, « le trou n°1 du projet »).
- Sans `source_url`, l'entrée n'est pas publiée.
- Par commune : une entrée sans commune ne s'affiche pour aucune commune.
- États d'écran prévus : vide → « Aucune actualité publiée pour cette commune » + lien source ;
  partielle → « Données pas encore disponibles dans la bêta » ; pleine → cartes et partage.
