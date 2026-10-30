# ADR 0002 — Comparaisons factuelles entre communes

- **Date :** 30/10/2026
- **Statut :** appliqué le 30/10/2026, sur décision formelle du CEO (D23). Le bloc des invariants de `CLAUDE.md` et `AGENTS.md` porte l'amendement de l'invariant 3. Il est scellé dans `.claude/invariants.sha256` par `outils/derive_contexte.mjs --sceller`.
- **Porte la décision :** le porteur. Un agent ne modifie pas un invariant de sa propre initiative.

## Contexte

L'invariant 3 interdisait « tout classement, score, ou tri numérique de personnes, de partis ou de territoires ». `docs/ux/systeme-visuel-2026.md` l'appliquait aussi aux comparaisons, par exemple pour refuser la carte choroplèthe. Conséquence : un chiffre comme « 2 495 € par habitant » restait sans repère. Le lecteur ne pouvait pas savoir si c'était beaucoup.

## Décision

1. **Autorisé :** une comparaison FACTUELLE entre communes : moyenne d'Île-de-France ou régionale, « comme X communes sur Y », comparaison avec l'année précédente.
2. **Toujours annoncée comme un calcul de Repère** (invariant 4), avec le nombre de communes prises en compte.
3. **Formulations permises :** « comme », « plus que », « moins que », « X € de plus que ».
4. **Formulations interdites :** « mieux », « pire », « top », « classement », « note », « score ». La liste `MOTS_CLASSEMENT` (`mono/packages/data-utils/src/invariants.js`) les refuse déjà dans le code.
5. **Ne change pas :** pas de rang, pas de liste triée de communes, pas de couleur de jugement sur un écart.

## Conséquences

- La moyenne est une moyenne simple des communes publiées pour un même exercice. Chaque commune pèse autant, quelle que soit sa taille. Il faut le dire à l'écran : en Île-de-France, beaucoup de petites communes tirent cette moyenne.
- Une dépense plus élevée n'est ni bonne ni mauvaise : l'écran ne la qualifie pas.
- `moyenne nationale` reste dans la liste des mots interdits : D23 ne cite que l'Île-de-France et la région. À ouvrir explicitement si besoin.
