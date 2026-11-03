# RESUME v14 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé. Après chaque bloc : `tsc` à 0 erreur, tests partagés à 249/249 (+1 : moyenne régionale), parcours navigateur à 222/222, contrôle des invariants (`outils/derive_contexte.mjs`) à 0 erreur.

| Commit | Bloc |
|---|---|
| a6da51b | 0 — invariants 3 et 7 amendés (D23, D24), sceau régénéré, ADR 0002 et 0003 |
| 1bc6b40 | 1 — comparaisons Île-de-France sur le budget |
| fccb575 | 2 — couleurs des votes et pictogrammes |
| (ce commit) | RESUME-v14 |

## Bloc 0

- `CLAUDE.md` et `AGENTS.md` (copie exacte) : invariant 3 amendé et invariant 7 complété. Le texte a été resserré pour que `CLAUDE.md` reste sous le plafond de 120 lignes : il en fait 117.
- `.claude/invariants.sha256` régénéré par `outils/derive_contexte.mjs --sceller`.
- `palette.ts` : `COULEURS_VOTE { votePour, voteContre, voteAbstention }`.
- Test d'invariant 7 : il accepte ces trois couleurs, dans `palette.ts` seulement, et vérifie leurs valeurs.
- `docs/ux/systeme-visuel-2026.md` : mis à jour (répartition de vote, section Votes).
- `docs/adr/0002-comparaisons-territoriales.md`, `docs/adr/0003-couleurs-votes.md` : créés.

## Bloc 1 — Moyenne d'Île-de-France

- Calcul dans `@repere/core` (`moyenneParHabitant`, testé) : moyenne simple des dépenses par habitant publiées par l'OFGL, pour le même exercice. Elle n'est pas rendue si moins de 80 % des communes publient le montant. Dans ce cas, l'accueil garde la comparaison avec l'année précédente.
- **Île-de-France 2025 : 1 606 € par habitant, sur 1 258 communes sur 1 262.**
- Accueil (Melun, exemple) : « Melun : 889 € de plus que la moyenne de la région Île-de-France. » Budget de Meaux : « 517 € de plus ». Vérifié contre les données brutes.
- Conséquence : « Dont 1 130 € pour vos agents (salaires) et 777 € pour vos équipements (investissement). »
- Coût : l'application télécharge une fois par session les 8 fichiers départementaux d'Île-de-France, environ 840 Ko, mis ensuite en cache.

## Bloc 2 — Couleurs et pictogrammes

- Barres de vote en vert, rouge et gris : Aujourd'hui, écran du vote, fiche élu, feuille « Comprendre ce vote », carte vote de l'accueil.
- Fiche élu : signes ✓ ✕ ○ colorés.
- Accueil : un rond de couleur avant la position écrite.
- Pictogrammes, un par carte, après l'étiquette, masqués au lecteur d'écran : 📊 budget, 🗳️ vote, 🏛️ Parlement.

## Observations

1. **La moyenne simple surpondère les petites communes.** En Île-de-France, de nombreux villages tirent la moyenne vers 1 606 €, alors que Paris et les grandes villes dépensent plus par habitant. Presque toutes les villes moyennes seront donc « au-dessus de la moyenne ». C'est exact et c'est écrit (« chaque commune compte pour une »), mais cela peut se lire comme un reproche. Une médiane, ou une moyenne par strate de taille, serait plus parlante : c'est une décision à prendre.
2. **Le vert `#2DA44E` est faible sur fond clair** (2,88:1 sur le sol, 3,22:1 sur carte blanche). J'ai placé toutes les barres sur des cartes. Un vert un peu plus sombre (par exemple `#1F883D`, environ 4,5:1 sur blanc) serait plus sûr. C'est une valeur que D24 a fixée, donc je ne l'ai pas changée.
3. **Daltonisme** : le rouge et le vert se confondent pour environ 8 % des hommes. La position est toujours écrite en toutes lettres, et les signes ✓ ✕ ○ diffèrent par la forme.
4. **« moyenne nationale » reste un mot interdit** dans le code (`MOTS_CLASSEMENT`) : D23 ne cite que l'Île-de-France et la région.
5. **La carte budget de l'accueil devient longue** : chiffre, écart, moyenne, année précédente, conséquence, barre, source. Sept lignes. Ça tient, mais on n'est plus vraiment dans les « 5 secondes ».

## Top 5 à tester (sur téléphone, avec Expo Go)

1. Accueil sans commune : carte « L'argent de Melun ». La phrase d'écart apparaît après le chargement des 8 départements : mesurer le délai sur 4G.
2. Budget d'une grande commune (Paris) et d'un petit village : la phrase « de plus » ou « de moins » est-elle comprise sans être lue comme un jugement ?
3. Fiche élu : couleurs ✓ ✕ ○ en plein soleil et en mode sombre.
4. VoiceOver : les pictogrammes 🏛️ 📊 🗳️ ne doivent pas être lus.
5. « Comprendre ce vote » : barre colorée et légende, avec un vote contre (aucun dans les 3 derniers votes de Meaux : en chercher un sur une autre circonscription).
