# Présidentielle 2027 : les fichiers publiés et leur collecte

Quatre fichiers lus par l'application (`candidats.json`, `debats.json`, `meetings.json`, `meta.json`),
schéma dans `mono/packages/core/src/types/elections.ts`. Un fichier vide est un état normal :
l'application dit alors l'absence. `sources.json` n'est jamais publié.

## Décisions du porteur, 10 novembre 2026

> **Exception du 12/11/2026 (porteur)** : `candidats.json` porte des **candidatures déclarées** (`statut: "declare"`),
> relevées dans la presse le 11/11/2026, chacune avec **deux sources** datées (règle dans `@repere/core`,
> `candidatValide`). Ordre alphabétique, aucun classement. Photos (ADR 0008) : produites par la chaîne dans `photos.json`, jamais saisies ici ; jamais de couleur de parti. À remplacer par la liste officielle en mars 2027.

1. **Candidats : aucune collecte automatique.** Saisie à la main dans `candidats.json` en mars 2027,
   quand le Conseil constitutionnel aura publié la liste. Mettre à jour `meta.json` (date, source) dans
   le même commit.
2. **Débats et réunions publiques : flux RSS autorisés, toujours au brouillon.** Chaque source est
   déclarée avec `"publier": false`. Les entrées lues vont dans `data/auto/presidentielle-brouillon.md` ;
   le porteur relit chaque entrée contre sa page, puis la recopie à la main dans `debats.json` ou
   `meetings.json`, avec `sourceUrl`.
3. **Presse généraliste : refusée** (`CONTEXTE_PROJET.md` § 10, maintenu). Seuls des producteurs
   officiels : institutions, chaînes pour leurs propres débats, sites de campagne pour leurs réunions.

Le script applique ces décisions : par défaut il n'écrit aucun fichier publié et ignore toute source
de type `candidats` (contrôle dans `mono/tests/collecte-presidentielle.test.mjs`).

## Brancher un flux

1. Lire la vraie réponse du flux (skill `ingerer-une-source`). Aucune adresse n'est devinée.
2. Recopier le bloc `exemple_non_lu` de `sources.json` dans la liste `sources`, avec la vraie adresse
   (https), le nom du producteur et le type (`debats` ou `meetings`).
3. La collecte quotidienne (`outils/pipeline.sh`) le lit dès le lendemain. Une source en échec ne casse
   rien : elle est nommée dans le brouillon.

Essai sans réseau, sans écriture, depuis `mono/` :
`node scripts/collecte-presidentielle.mjs --collecter --dry-run --fixtures tests/fixtures/presidentielle`
