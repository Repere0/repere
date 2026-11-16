# Contribuer à Repère

Repère est une application d'information civique. Avant de proposer quoi que ce soit, lisez `CLAUDE.md` : ce fichier énonce les règles qui ne bougent pas. Les contributions qui les contredisent seront refusées, même si elles marchent.

## Proposer une fonctionnalité

Une bonne proposition répond à trois questions :

1. **Quelle question un habitant se pose-t-il**, que Repère ne sait pas encore répondre ?
2. **Quelle source officielle** permettrait d'y répondre, et avec quelle date ? Sans source, pas de fonctionnalité.
3. **Quelle règle de `CLAUDE.md` est touchée** ? Si la réponse est « aucune », dites-le ; si elle est « une », proposez un amendement, en citant la décision (D…) qui le permet.

Ouvrez une issue avec le formulaire « Proposer une fonctionnalité », ou écrivez à **repere0@protonmail.com**.

## Signaler un bug

Utilisez le formulaire « Signaler un bug » des issues. Une faille de sécurité ne s'ouvre pas en issue publique : voir [SECURITY.md](SECURITY.md).

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

1. Forkez le dépôt (ou, si vous y avez accès, partez de `main`) et créez une branche nommée par sa nature : `feat/…`, `fix/…`, `docs/…`, `chore/…`, `data/…`, `ux/…`.
2. Lancez les contrôles avant de pousser :
   - depuis `mono/` : `npx pnpm@8.15.9 install --frozen-lockfile`, puis `npm test` ;
   - depuis `mono/apps/mobile` : `npm ci`, puis `npm run verifier` ;
   - si vous touchez `CLAUDE.md`, `AGENTS.md`, une skill ou `CONTEXTE_PROJET.md` : `node outils/derive_contexte.mjs`.
3. Ouvrez la demande vers `main` et remplissez le modèle (ce qui change, comment c'est vérifié, ce qui ne l'est pas).
4. Une demande qui touche les données, la chaîne de collecte ou un invariant est relue par le porteur avant fusion. Personne ne fusionne directement dans `main`.

### Messages de commit

Le titre suit [Conventional Commits](https://www.conventionalcommits.org/fr/) : `type(portée): résumé`, en français, à l'impératif ou au présent. Types en usage : `feat`, `fix`, `docs`, `test`, `ci`, `chore`, `refactor`, `data`, `ux`.

```
fix(calendrier): les horaires sont à l'heure de Paris
```

Le corps dit ce qui était faux, ce qui a été mesuré, et ce qui ne l'a pas été. Aucun hook n'impose ce format : la relecture s'en charge.

## Licence des contributions

Le code est publié sous [AGPL-3.0](LICENSE). En contribuant, vous acceptez que votre contribution soit publiée sous cette licence.
