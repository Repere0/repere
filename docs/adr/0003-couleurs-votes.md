# ADR 0003 — Couleurs du sens d'un vote

- **Date :** 30/10/2026
- **Statut :** appliqué le 30/10/2026, sur décision formelle du CEO (D24), en complément de l'invariant 7 (voir ADR 0001). Scellé dans `.claude/invariants.sha256`.
- **Porte la décision :** le porteur.

## Contexte

Jusqu'ici, un vote s'affichait en trois gris (`GRIS_VOTE` : encre, sourd, trait), et `palette.ts` refusait toute couleur de vote. Le texte de l'invariant 7 du 30/10 disait pourtant « les votes restent vert/rouge/gris » : le code et la règle se contredisaient. D24 tranche en faveur des couleurs.

## Décision

| Position | Couleur | Jeton (`palette.ts`, `COULEURS_VOTE`) |
|---|---|---|
| Pour | vert `#2DA44E` | `votePour` |
| Contre | rouge `#CF222E` | `voteContre` |
| Abstention | gris `#6E7781` | `voteAbstention` |

- Ces couleurs codent un FAIT, le sens du vote, et jamais un jugement.
- La position est toujours écrite en toutes lettres à côté : la couleur ne porte jamais seule l'information. C'est nécessaire pour les personnes daltoniennes, qui distinguent mal le rouge du vert.
- Les couleurs de groupes restent limitées aux badges d'identification (ADR 0001).
- Le test d'invariant 7 (`mono/tests/invariants.test.mjs`) accepte ces trois valeurs, dans `palette.ts` seulement.

## Contrastes mesurés (rapport de luminance)

| Couleur | Sur blanc | Sur sol clair `#F5F2EC` | Sur carte sombre `#1F1D1A` | Sur sol sombre `#161513` |
|---|---|---|---|---|
| `#2DA44E` | 3,22 | **2,88** | 5,23 | 5,68 |
| `#CF222E` | 5,36 | 4,79 | 3,14 | 3,41 |
| `#6E7781` | 4,55 | 4,07 | 3,70 | 4,01 |

**Point faible :** le vert sur le sol clair fait 2,88:1, sous le seuil de 3:1 des éléments graphiques (WCAG 1.4.11). Les barres de vote sont posées sur des cartes blanches (3,22:1), jamais directement sur le sol. Ces couleurs ne servent jamais pour du texte.
