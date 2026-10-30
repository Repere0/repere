# ADR 0001 — Couleurs de groupes politiques sur les badges d'identification

- **Date :** 30/10/2026
- **Statut :** proposé. **Non appliqué.** Ni le bloc des invariants de `CLAUDE.md`,
  ni `.claude/invariants.sha256`, ni `mono/apps/mobile/src/lib/palette.ts` ne sont modifiés.
- **Porte la décision :** le porteur. Un agent ne modifie pas un invariant de sa propre initiative
  (`CLAUDE.md`, section « Les invariants — lecture seule »).

## Contexte

La règle actuelle, invariant 7 de `CLAUDE.md` :

> Cinq couleurs d'échelon gelées ; aucune autre couleur ne dépasse une amplitude de 24 sur les canaux RGB.

Elle est reprise dans `docs/ux/systeme-visuel-2026.md` : « trois gris, jamais une couleur de groupe »
pour la répartition de vote, et dans `mono/scripts/scrutins-details.mjs` (palette d'identité grise,
« usage descriptif uniquement »).

Le porteur a choisi d'amender cette règle pour les badges d'identification d'un élu.

## Décision proposée

1. **Autorisé :** une couleur de groupe politique sur le **badge d'identification** d'un élu, et seulement là.
2. **Interdit, sans changement :**
   - toute couleur de groupe pour coder un **vote** (qui reste en trois gris),
   - pour un **score**, un **jugement** ou une **note**,
   - pour un élu comparé à un autre.
3. **Fallback :** si le groupe n'est pas connu, le badge est gris et affiche « Groupe : Inconnu ».
   Jamais un faux groupe.

### Codes proposés (fournis par la mission du 30/10/2026, non vérifiés contre une source officielle)

| Groupe | Code |
|---|---|
| LFI-NFP | `#C9462C` |
| RN | `#0D378A` |
| EPR (Renaissance) | `#FFA500` |
| LÉ (Écologiste) | `#33A02C` |
| LR | `#0066CC` |
| SOC | `#FF8080` |
| HOR | `#00A0C6` |
| DEM | `#F7B32B` |
| LIOT | `#6B7280` |
| GDR | `#B91C1C` |
| NI | `#9CA3AF` |
| Inconnu | `#6B7280` |

**Points d'attention, à trancher avant application :**
- `docs/ux/systeme-visuel-2026.md` refuse le vert, le rose et le bleu ardoise parce qu'ils sont
  « proches de codes de partis ». Ces codes sont précisément ceux-là.
- Le groupe d'un député n'est **pas** dans les données publiées de Repère. Voir
  `docs/data/groupes-politiques.md`. Sans ce lien, le badge affiche « Inconnu » et aucune couleur de groupe.
- Les codes ci-dessus n'ont pas été comparés à une charte officielle de chaque groupe.

## Texte d'amendement proposé pour l'invariant 7

À reporter dans le bloc `INVARIANTS` de `CLAUDE.md`, **seulement après décision explicite du porteur** :

> 7. **Cinq couleurs d'échelon gelées** ; aucune autre couleur ne dépasse une amplitude de 24 sur
>    les canaux RGB. **Exception (ADR 0001) :** une couleur de groupe politique peut servir au
>    badge d'identification d'un élu. Elle ne code jamais un vote, un score, un jugement ni une
>    comparaison.

## Procédure d'application (à exécuter seulement après décision explicite)

1. Modifier le bloc `INVARIANTS:DEBUT … INVARIANTS:FIN` de `CLAUDE.md` avec le texte ci-dessus.
2. Recopier `CLAUDE.md` à l'identique dans `AGENTS.md` (exigence E2 de `outils/derive_contexte.mjs`).
3. Lancer `node outils/derive_contexte.mjs --sceller` : cela réécrit `.claude/invariants.sha256`.
4. Dire dans la PR que l'invariant a changé et sur quelle décision.
5. Ajouter les codes à `mono/apps/mobile/src/lib/palette.ts` (seul fichier autorisé à porter des couleurs),
   puis faire passer `theme.test.mjs`.

## Conséquences

- Tant que la procédure n'est pas exécutée, le badge reste gris et affiche « Groupe : Inconnu ».
- Aucun test ne doit être affaibli pour faire passer l'application de cette décision.
