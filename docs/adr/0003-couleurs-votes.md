# ADR 0003 — Couleurs du sens d'un vote

- **Date :** 30/10/2026
- **Statut :** appliqué le 30/10/2026, sur décision formelle du CEO (D24), en complément de l'invariant 7 (voir ADR 0001). Scellé dans `.claude/invariants.sha256`.
- **Porte la décision :** le porteur.

## Contexte

Jusqu'ici, un vote s'affichait en trois gris (`GRIS_VOTE` : encre, sourd, trait), et `palette.ts` refusait toute couleur de vote. Le texte de l'invariant 7 du 30/10 disait pourtant « les votes restent vert/rouge/gris » : le code et la règle se contredisaient. D24 tranche en faveur des couleurs.

## Décision

| Position | Couleur | Jeton (`palette.ts`, `COULEURS_VOTE`) |
|---|---|---|
| Pour | vert `#1F883D` (A2 ; `#2DA44E` dans D24) | `votePour` |
| Contre | rouge `#CF222E` | `voteContre` |
| Abstention | gris `#6E7781` | `voteAbstention` |

- Ces couleurs codent un FAIT, le sens du vote, et jamais un jugement.
- La position est toujours écrite en toutes lettres à côté : la couleur ne porte jamais seule l'information. C'est nécessaire pour les personnes daltoniennes, qui distinguent mal le rouge du vert.
- Les couleurs de groupes restent limitées aux badges d'identification (ADR 0001).
- Le test d'invariant 7 (`mono/tests/invariants.test.mjs`) accepte ces trois valeurs, dans `palette.ts` seulement.

## Amendement A2 (30/10/2026) — conformité WCAG AA

Décision du CEO : le vert passe de `#2DA44E` à `#1F883D`. Le rouge `#CF222E` reste : il fait 5,36:1 sur blanc, au-dessus de 4,5:1. La valeur de repli `#A40E26`, prévue s'il était sous 4,5:1, n'a pas servi. Le gris `#6E7781` reste aussi (4,55:1 sur blanc).

| Couleur | Carte claire `#FFFFFF` | Sol clair `#F5F2EC` | Carte sombre `#1F1D1A` |
|---|---|---|---|
| `#1F883D` (pour) | **4,52** | 4,04 | 3,72 |
| `#CF222E` (contre) | **5,36** | 4,79 | 3,14 |
| `#6E7781` (abstention) | **4,55** | 4,07 | 3,70 |

Test automatique (`mono/apps/mobile/tests/theme.test.mjs`) :
- au moins 4,5:1 sur la carte claire, là où toutes les barres de vote sont posées ;
- au moins 3:1 sur la carte sombre (seuil WCAG 1.4.11 des éléments graphiques).

Sur la carte sombre, les trois couleurs restent sous 4,5:1 : elles ne servent jamais pour du texte. Sur le sol clair, le vert et le gris restent sous 4,5:1 : aucune barre n'y est posée directement.

## Contrastes mesurés pour D24 (historique, avant A2)

| Couleur | Sur blanc | Sur sol clair `#F5F2EC` | Sur carte sombre `#1F1D1A` | Sur sol sombre `#161513` |
|---|---|---|---|---|
| `#2DA44E` | 3,22 | **2,88** | 5,23 | 5,68 |
| `#CF222E` | 5,36 | 4,79 | 3,14 | 3,41 |
| `#6E7781` | 4,55 | 4,07 | 3,70 | 4,01 |

**Point faible :** le vert sur le sol clair fait 2,88:1, sous le seuil de 3:1 des éléments graphiques (WCAG 1.4.11). Les barres de vote sont posées sur des cartes blanches (3,22:1), jamais directement sur le sol. Ces couleurs ne servent jamais pour du texte.

## Amendement D56 (30/10/2026, V29 bloc 3) — variante daltonienne

Réglage « mode daltonien » du profil (`repere.profil`, ADR 0006). Les écrans de l'application (accueil, chez-vous, fiche élu, vote) lisent la palette du réglage ; les cartes de partage gardent leur palette figée (D5).

| Sens | Mode normal (A2, inchangé) | Mode daltonien (D56) | Sur carte blanche | Sur carte sombre |
|---|---|---|---|---|
| Pour | vert `#1F883D` | bleu `#0072B2` (Okabe-Ito) | 5,19:1 | 3,24:1 |
| Contre | rouge `#CF222E` | vermillion assombri `#B35900` | 4,83:1 | 3,48:1 |
| Abstention | gris `#6E7781` | gris `#6E7781` | 4,55:1 | 3,70:1 |

Écarts ΔE76 (CIELAB) sous simulation (Machado 2009, sévérité 1,0), pour/contre : protanopie 88, deutéranopie 102. Le test `tests/daltonisme.test.mjs` exige 20 au minimum pour les trois paires ; mode normal : 22 (protanopie) et 17 (deutéranopie), mesuré et non testé.

Écarts au brief V29, décidés ici et à valider par le porteur :
- le rouge du mode normal reste `#CF222E` : A2 le garde (5,36:1 sur blanc). Le brief le voulait en `#A40E26`, mais cette valeur tombe à 2,14:1 sur carte sombre, sous le seuil de 3:1 du test (7,87:1 sur blanc, donc inutile pour l'AA) ;
- l'orange Okabe-Ito `#E69F00` fait 2,25:1 sur blanc : il échoue le seuil de 4,5:1 des cartes claires. Remplacé par `#B35900`, même famille ;
- le gris `#999999` du brief fait 2,85:1 sur blanc : il est remplacé par le gris du mode normal `#6E7781`, déjà mesuré.
