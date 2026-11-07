# Proposition : couleurs de LIOT et DEM (07/11/2026)

**Statut : proposition, rien n'est changé dans le code.** `palette.ts` garde ses 12 couleurs tant que
le porteur n'a pas décidé d'amender l'invariant 7 (ce qui met à jour `.claude/invariants.sha256`).

## Le problème, mesuré

Distance entre deux couleurs = distance euclidienne RVB (0 = identiques ; sous 60 environ, deux
points de 6 px se confondent sur l'hémicycle). Calcul fait le 07/11/2026 sur `COULEURS_GROUPES`.

| paire | distance | |
|---|---|---|
| LIOT / Inconnu | **0** | même gris `#6B7280` : impossible à distinguer |
| DEM / EPR | **46** | deux orangés |
| GDR / LFI | **48** | deux rouges (pas demandé, mais même défaut) |
| HOR / LR | **58** | deux bleus (limite) |

En attendant une décision, l'hémicycle met un contour (couleur du texte : blanc en sombre, encre en
clair) sur le second groupe de chaque paire trop proche (`groupesACerner`, `packages/core/src/hemicycle.js`).
Ce sont EPR, LFI, LR et « Non publié » qui reçoivent le contour.

## Ta piste vérifiée

- **LIOT en jaune pâle, si DEM ne bouge pas : non.** `#E3C84B` est à 43 de DEM, ce qui crée une nouvelle confusion.
- **DEM en « orange plus soutenu » : seulement s'il s'écarte d'EPR.** Un orange plus saturé se rapproche
  d'EPR (`#FFA500`). Un orange brûlé `#E07B1A` s'en écarte (58 au lieu de 46).

## Recommandation (option B)

| groupe | actuel | proposé | contraste carte sombre `#1F1E1B` | contraste carte claire `#FFFFFF` |
|---|---|---|---|---|
| DEM | `#F7B32B` | `#E07B1A` (orange brûlé) | 5,57:1 | 2,99:1 |
| LIOT | `#6B7280` | `#E3C84B` (jaune pâle) | 10,03:1 | 1,66:1 |

Avec ces deux couleurs, la paire la plus proche devient GDR / LFI (48), puis LR / HOR (58), puis
EPR / DEM (58). LIOT et « Non publié » ne se confondent plus.

Variante si le jaune pâle est trop clair sur carte claire : LIOT `#B8A13A` (ocre), 6,51:1 en sombre,
2,56:1 en clair, à 67 de DEM actuel.

## Ce qui reste à savoir avant de décider

- **Non vérifié** : si l'Assemblée nationale publie une couleur officielle par groupe. Je n'ai pas pu
  le vérifier dans cette session. Si elle en publie une, c'est elle qu'il faudrait reprendre, pas une
  nuance choisie par Repère.
- Défaut de lisibilité plus grave, constaté pendant la mesure : sur la carte sombre (désormais le mode
  par défaut), **RN `#0D378A` fait 1,53:1**, GDR 2,58:1 et LR 2,99:1. Le seuil pour un objet graphique
  est 3:1 (WCAG 1.4.11). Sur la carte claire, EPR, DEM, SOC et NI sont sous 3:1. Les badges restent
  lisibles (texte choisi par `texteSur`), mais les points de l'hémicycle sont faibles. À traiter dans la
  même décision.
- Changer une couleur de groupe change aussi les cartes de partage déjà publiées (palette figée, D5).
