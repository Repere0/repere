# RESUME V50-A — 03/11/2026

Branche : `test/sdk58-expo-go`. Détail complet : `BLOCAGES.md` §54.

## Fait

- **Commit `679d4a9`** — « Sur 100 € dépensés » : l'application reprend désormais la phrase de `rapports()` (`@repere/core`), comme le site. Cause de l'échec CI du contrôle « même vérité ». Libellé visible modifié : à relire.
- **Vérifié en local** : `tsc --noEmit` 0 erreur ; socle partagé CI 279/279.
- **Commits précédents de la session** : `1599d45` (test parcours, dev-impact exclu, __DEV__ only), `0eb7482` (BLOCAGES §53).

## En cours

- Run CI sur `679d4a9` (job « Mobile » et « Épreuve ») : résultat non connu au moment de la rédaction.

## Non fait — et pourquoi

- **BLOC 1, groupes politiques (D133) : non fait.** `data/am30.json` n'est pas dans le dépôt (absent de l'arbre et de l'historique). Aucun groupe n'a été inventé. Les badges restent « Inconnu ».
- **BLOC 2, vérification du Repère du jour : non fait.** Le bloc 8 décrit en V49-BIS n'existe pas dans la branche. Il n'y a rien à vérifier. Ce qui existe sous « Aujourd'hui » est une fonctionnalité antérieure.
- **BLOC 3, CI verte : non atteint à la rédaction.** Le run précédent échouait sur « même vérité » ; la correction est poussée, le résultat reste à confirmer.
- **`meme-verite.mjs` et `runtime.test.mjs`** : Chromium indisponible dans cette session. Non exécutés.
- **Index.tsx** : deux phrases « Sur 100 € dépensés » recomposées sur l'accueil, à aligner (non traité, voir BLOCAGES §54.3).

## Blocages restants

1. Données groupes : `am30.json` à déposer, ou run CI réussi de `collecte-groupes.mjs` à confirmer.
2. « Repère du jour » : non livré ; conflit D116 / D127 à trancher.
3. Budget : `comptes-communes.json` absent (catégorie BUDGET du bloc 8).
4. Validation du nouveau libellé « Où va cet argent » par le porteur.
