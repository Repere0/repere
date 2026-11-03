# Contribuer à Repère

Repère est une application d'information civique. Avant de proposer quoi que ce soit, lisez `CLAUDE.md` : ce fichier énonce les règles qui ne bougent pas. Les contributions qui les contredisent seront refusées, même si elles marchent.

## Proposer une fonctionnalité

Une bonne proposition répond à trois questions :

1. **Quelle question un habitant se pose-t-il**, que Repère ne sait pas encore répondre ?
2. **Quelle source officielle** permettrait d'y répondre, et avec quelle date ? Sans source, pas de fonctionnalité.
3. **Quelle règle de `CLAUDE.md` est touchée** ? Si la réponse est « aucune », dites-le ; si elle est « une », proposez un amendement, en citant la décision (D…) qui le permet.

Ouvrez une issue sur le dépôt GitHub si les issues y sont activées (non vérifié à ce jour), ou écrivez à **repere0@protonmail.com**.

## Signaler un bug

Indiquez :

- l'écran et ce que vous faisiez juste avant ;
- ce qui s'est passé, et ce que vous attendiez ;
- votre téléphone (ou navigateur), et la version d'Expo Go si vous utilisez Expo Go ;
- une capture d'écran, si elle ne montre aucune donnée personnelle.

Ne joignez pas d'adresse, de numéro de téléphone ou d'opinion. Repère ne vous demande aucune de ces informations, et n'en a pas besoin pour corriger un bug.

## Règles de code

Les règles viennent de `CLAUDE.md` (« INVARIANTS ») et de `docs/adr/`. Les plus souvent violées :

- **Hors ligne, sans serveur applicatif** (invariant 1). Aucun appel réseau ne porte un code de commune ni un réglage.
- **Deux clés de stockage local, nommées, rien d'autre** (invariant 2) : `repere.departement` et `repere.profil`. Ajouter une clé est une décision, pas un détail de code.
- **Aucun classement** (invariant 3). Ne pas écrire « meilleur », « pire », « top », « note » ou « score » pour une personne, un parti ou un territoire. La comparaison factuelle entre communes est permise si elle s'annonce comme un calcul.
- **Chaque chiffre porte sa source et sa date** (invariant 4). Un calcul dérivé s'annonce comme un calcul.
- **Pas de site de mairie lu** : seul un lien externe est affiché (ADR 0005). Le flux RSS officiel d'une mairie est lu seulement dans le cadre de l'ADR 0007.
- **Une absence de donnée produit une phrase vraie et un lien**, jamais un zéro ni une forme vide (invariant 5).
- **Aucune gamification** du vote ou de l'opinion (invariant 6).
- **Les couleurs de vote codent un fait**, jamais un jugement (invariant 7).

Pour l'équipe, quelques points de procédure :

- Un test ajouté à `mono/package.json` doit figurer dans la liste de `npm test`. Un test de l'application (`mono/apps/mobile/tests/`) doit être cité dans `.github/workflows/mobile.yml`.
- `CLAUDE.md` tient en 120 lignes au plus, et `AGENTS.md` en est une copie exacte. `.claude/invariants.sha256` ne se régénère que sur décision explicite.
- Les captures locales de `mono/captures/` ne se commitent pas.
- Une modification de données est relue avant publication (D33 : le porteur relit chaque fait contre sa source).

## Ouvrir une demande de fusion

- Partez de `main`, travaillez sur une branche, et ouvrez une demande de fusion vers `main`.
- Une demande de fusion qui touche les données, la chaîne de collecte ou une règle d'invariant est relue par le porteur avant fusion.
- Ne fusionnez jamais directement dans `main`.

## Licence des contributions

Le code est prévu sous AGPL-3.0. Le fichier `LICENSE` n'est pas encore dans le dépôt (voir `BLOCAGES.md` §49) : en contribuant, vous acceptez que votre contribution soit publiée sous la licence retenue par le porteur, une fois celle-ci fixée.
