# RESUME V54 — 03/11/2026

Branche : `test/sdk58-expo-go`. Détail, mesures et choix : `BLOCAGES.md` §58.

## Ce qui est livré

- **Bandeau « Repère du jour »** en tête de « Chez vous », au-dessus des trois réponses. Zone tactile 44 px, fond visible 32 px, un geste ouvre `/repere-du-jour`. Vérifié en clair et en sombre.
- **Page complète** `/repere-du-jour` : trois faits, sources, partage, et pied « Sources : … · Publication du … ».
- **Trois infographies** en React Native pur, palette existante, aucune dépendance :
  1. Puce de tendance « ↑ 1,4 % par rapport à 2024 · calcul Repère » sur la fiche budget (neutre, jamais vert ni rouge).
  2. Liste de barres « Où vont 100 € » (triée, libellé, montant, barre).
  3. Graphique de vote : déjà en place (`Repartition`), non dupliqué.
- Templates : 22 (inchangé depuis V52).

## Positions à 390 x 844 (R1 / R2 / R3)

**411 / 613 / 843 px** : les trois réponses tiennent dans le premier écran (règle 844 px respectée, test non modifié). Cible 838 non atteinte (1 px de marge).

## Ce qui n'est pas fait, ou pas comme prévu

1. **La ligne « Publication Repère du … » reste sur « Chez vous »** (D147 demandait de la retirer). Raison : invariant 9 (fraîcheur visible à l'écran) et test de parcours ligne 225. La date est aussi en pied de la page complète. **Décision à prendre.**
2. **Bandeau non placé dans `index.tsx`** (« Où habitez-vous ? ») : cet écran n'a pas de commune choisie. Il est dans « Chez vous », où sont les réponses.
3. **Puce de tendance non posée sur « Chez vous »** : elle ferait sortir R3 du premier écran.
4. **Liste de barres** : montants en « € » sur 100 € (et non en « % ») ; libellé « Autres (non détaillés) ».
5. **Templates : 22 sur 30** (D142). Inchangé.
6. **Groupes politiques, sénateurs, photos** : skip (D150, proxy bloqué).

## Vérifications

- `tsc --noEmit` : 0 erreur.
- Suite de la CI (liste de `mobile.yml`) : **294 / 294**. Invariants : **61 / 61**.
- `parcours-web` : 225 OK. `zoom`, `commune`, `recherche`, `elections`, `partage-texte`, `onboarding`, `mode` : 0 échec. `meme-verite` : 107 faits, 0 échec.
- CI GitHub : à lire après le push (`gh api`, branche `test/sdk58-expo-go`).
