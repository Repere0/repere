# Schéma Stitch : intégration et compatibilité (07/11/2026)

`repere_data_schema.ts` est repris **tel quel** dans `mono/packages/core/src/types/schema.ts`, avec un
en-tête qui en fixe le statut : **vocabulaire de référence, pas le contrat des données publiées.**
Aucun écran ni script ne l'importe. Un contrôle (`mono/tests/local-types.test.mjs`) vérifie qu'il
compile en mode strict et qu'aucune application ne l'importe.

## Pourquoi je n'ai pas converti les données à ce schéma

Tu demandais d'adapter nos données si elles n'étaient pas compatibles. Je ne l'ai pas fait : appliqué
tel quel, ce schéma casserait quatre règles du produit, et la conversion de tout le pipeline n'est pas
réalisable proprement en une session.

| écart | règle touchée | ce qu'il faudrait trancher |
|---|---|---|
| Aucune provenance par chiffre. Seul `derniereMiseAJour` existe, au niveau du budget entier. | Invariant 4 (chaque chiffre a sa source et sa date) | Ajouter `Provenance` (déjà définie dans `local.d.ts`) à chaque bloc chiffré. |
| `DeputyProfile.photoUrl` est une adresse distante. | D27, invariant 1 (hors ligne, vignette Commons servie par Repère) | Remplacer par la vignette et son crédit (`PhotoElu`). |
| `nonVotant` dans `GroupVoteBreakdown`, et `vote: 'NonVotant'` par député. | Invariant 8 (jamais de présence ni d'absence) | Retirer ces champs, ou ne jamais les remplir. |
| `medianeStrateRegionale.ecartExplication`, `resumeTexte`, `contenuMarkdown` : du texte rédigé. | « On ne crée aucun résumé » ; invariant 4 | Ne remplir que depuis une source citée, ou retirer. |
| `PoliticalGroupCode` : `DR`, `Dem`, `EcoS`, `UDR`. | `palette.ts` (invariant 7) utilise `LR`, `DEM`, `LÉ`, et n'a pas d'UDR. | Choisir un seul jeu de sigles, et donner une couleur à UDR. |
| `MayorProfile.etiquetteNuance`, `profession` | Donnée politique ou personnelle sur un maire | La source (nuance du ministère, RNE) doit être citée ; la profession n'est pas dans nos sources. |
| `colorHex` dans les catégories de budget | Une couleur de design dans une donnée | Elle doit rester dans `palette.ts`. |

**Compatibilité avec nos types actuels** : `local.d.ts` (conseil municipal, délibérations) et le schéma
Stitch ne se recouvrent presque pas. Stitch n'a ni groupes municipaux ni délibérations, et le seul
point commun est `MayorProfile.nombreElusConseil`. Il n'y a donc pas de conflit, et rien à migrer côté
`local.d.ts`.

**Valeurs d'exemple** : les valeurs « ex: » des commentaires (45 %, 22 projets, la profession et la
nuance du maire, etc.) viennent des maquettes. Elles sont **non vérifiées** et ne doivent jamais être
affichées.

## Le reste de la livraison

- **Jetons « sombre minéral »** (`mono/apps/mobile/src/lib/palette.ts`) : `sol` `#141311`, `carte`
  `#1F1E1B`, `encre` `#F3F0E8`, `trait` `#2C2A26`.
  - Pour `sourd`, j'ai mis **`#928F86` et non `#8E8B82`** : `#8E8B82` ne fait que 4,32:1 sur le voile
    (tuiles, pastilles), sous le seuil AA de 4,5:1. `#928F86` est la nuance la plus proche qui le tient
    (4,55:1).
  - Le fond de l'écran de démarrage suit (`app.json`).
- **Jauge du budget sur l'accueil** : elle sort du « Voir plus », en trois segments (salaires,
  investissements, autres) avec une légende écrite.
  - **Elle est en neutres, pas dans le bleu et le vert Stitch.** `#2B6CB0` et `#9DD3AA` sont des
    couleurs hors des trois familles que permet l'invariant 7 (échelons, groupes, votes), et la garde
    de la palette les refuse.
  - Pour les adopter, il faut une décision explicite d'amender l'invariant 7, avec la mise à jour de
    `.claude/invariants.sha256`.
  - En attendant : encre `#F3F0E8`, gris chaud `#928F86`, et `#34322F` (l'`outline-variant` de
    Stitch, qui est un neutre).
- **Fiche élu** : une pastille de couleur de vote (D24) devant chaque compte « 0 pour · 1 contre ·
  2 abstentions ».
- **Hémicycle** : toucher un groupe l'éclaire, et les autres sièges passent à 20 %. Le lien « Voir les N
  députés » de ce groupe apparaît dessous ; toucher à nouveau le même groupe retire la mise en évidence.
- **Polices** : déjà en place, rien ne change (Manrope pour les titres, DM Sans pour le texte, IBM Plex
  Mono pour les chiffres).
