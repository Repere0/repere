# RESUME V52 — 03/11/2026

Branche : `test/sdk58-expo-go`. Détail, mesures et refus : `BLOCAGES.md` §57.

## Réponse courte

- **Bandeau « Repère du jour » en tête de « Chez vous » : NON, pas livré.** Il a été écrit et mesuré, puis retiré : il casse deux contrôles de la CI (voir ci-dessous). Rien de poussé dans cet état.
- **Page complète du jour** : écrite avec le bandeau, retirée avec lui. Pas de porte d'entrée dans le dépôt aujourd'hui.
- **Templates : 22 sur 30** (15 budget, 7 élus). Écart de 8 : candidats refusés faute de donnée sourcée (liste dans BLOCAGES §57.2).
- **Carte « Repère du jour » : toujours sous les trois réponses** (état V51), avec trois modèles d'évolution en plus.

## Positions des réponses à 390 x 844 (`parcours-web.mjs`)

| État | Réponse 1 | Réponse 2 | Réponse 3 | Règle 844 px |
|---|---|---|---|---|
| Commité (V51 + évolutions) | 363 | 571 | 807 | tenue |
| Bandeau en tête (non poussé) | 415 | 623 | **859** | cassée de 15 px |

Le bandeau mesurait 42 px ; le contrôle exige 44 px pour une cible tactile (échec sur 360, 390, 430 px).

## Commits

- `feat(repere-du-jour)` : évolutions entre deux exercices (dépenses, recettes, dette par habitant), 22 modèles. Test à deux exercices ajouté.
- `docs(v52)` : résumé, verdict, BLOCAGES §57, concept mis à jour.

## Vérifications (sur le commit)

- `tsc --noEmit` : 0 erreur.
- `pnpm build` : OK.
- Suite de la CI (liste de `mobile.yml`) : **294 / 294**.
- Invariants : **61 / 61**. `derive_contexte` : 0 erreur, 3 avertissements (inchangés).
- Navigateur, build web comme la CI : `parcours-web` 225 OK ; `zoom-web` 0 échec ; `commune`, `recherche`, `elections`, `partage-texte`, `onboarding`, `mode` : 0 échec ; `meme-verite` : 107 faits comparés, 0 échec.
- `runtime.test.mjs` : non relancé tel que la CI le lance (sur `../site_engendre`, avec collecte réseau).
- CI GitHub : **à lire après le push** (`gh api` sur le dernier run de la branche).

## Blocages restants

1. **Bandeau en tête (D139)** : décision à prendre. Options :
   - a) assouplir la règle « 844 px » pour ne tenir que la première réponse (changement de règle produit) ;
   - b) déplacer la ligne « Publication Repère » (en-tête) pour gagner ~17 px, puis mesurer ;
   - c) garder la carte sous les réponses (état actuel) : la page complète reste sans entrée.
   Le code du bandeau et de la page est gardé ici, prêt à réappliquer : `scratchpad/bloc1-banniere/` (`chez-vous.patch`, `repere-jour.ts`, `bandeau-repere.tsx`, `repere-du-jour.tsx`).
2. **Templates : 8 de moins que 30 (D142)**. Les candidats manquants n'ont pas de donnée sourcée et exacte dans le dépôt.
3. **Groupes politiques** : données AMO30 absentes ; « Inconnu » partout.
4. **Sénateurs, histoire** : skip (sources injoignables, D135).
5. **Photos** : non faites.
6. **Non-répétition sur 30 jours** : impossible sans mémoire locale (invariant 2 ; D140 : on ne modifie pas l'invariant). Limite de rotation documentée.
