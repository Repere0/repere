# DESIGN.md : la charte de l'application mobile, telle qu'elle est dans le code

Écrit le 11 novembre 2026, mis à jour le même jour pour la Variante A, à partir de `mono/apps/mobile/src/lib/palette.ts` et `theme.ts`, et des
décisions du porteur des 9, 10 et 11 novembre. **Le code fait foi** : si ce fichier et `palette.ts`
divergent, c'est ce fichier qui est faux. Les couleurs politiques et de vote relèvent de l'invariant 7
(`CLAUDE.md`), pas d'ici.

## Couleurs d'interface (neutres)

| rôle | clair | sombre |
|---|---|---|
| sol | `#F8FAFC` | `#141311` |
| carte | `#FFFFFF` | `#1F1E1B` |
| texte (encre) | `#0F172A` | `#F5F4F0` |
| texte secondaire (sourd) | `#475569` | `#9C9A92` |
| filet (trait) | `#E8EEF3` | `#2B2A26` |
| pastille, fond discret (voile) | `#EDF4F7` | `#2A2823` |

L'interface est neutre : noir, ivoire, gris. Aucune couleur de vote, de parti ou d'échelon sur un
bouton, un titre ou un texte.

## Typographie (Variante A, décision du porteur du 11/11/2026)

Échelle : **34 / 28 / 22 / 17 / 15 / 13**. Elle remplace « titres de 24 px au plus » (09/11).

| style | police | taille / interligne |
|---|---|---|
| affiche (titre d'écran) | Manrope ExtraBold | 34 / 40 |
| chiffre héros | Manrope ExtraBold, chiffres alignés | 34 / 40 (jusqu'à × 1,75 pour la réponse héros d'un écran) |
| question | Manrope ExtraBold | 28 / 34 |
| stat | Manrope Bold, chiffres alignés | 28 / 34 |
| section | Manrope Bold | 22 / 28 |
| réponse (titre de carte) | Manrope SemiBold | 17 / 24 |
| corps | DM Sans | 15 / 22 |
| note, micro, étiquette | DM Sans | 13 / 18-19 |
| donnée (date ou nombre seuls, petits) | IBM Plex Mono | 13 / 18 |

- Les chiffres héros sont en Manrope. IBM Plex Mono ne sert plus qu'aux petites données. Remplace
  « Plex Mono pour les grands chiffres » (07/11).
- Aucun texte sous 12 px. Les tailles suivent le réglage du lecteur (confort de lecture).
- Une phrase qui contient une date reste en DM Sans. Aucun lien souligné, aucun emoji.

## Espaces, surfaces et formes (Variante A)

- Grille de 8 px. Marge extérieure d'écran : 16 px. Intérieur de carte : 24 px. Entre cartes : 12 px.
- **Trois teintes de surface, sans filet** : sol, carte, voile (tableau des couleurs). Une carte se lit à
  sa teinte. Un filet ne reste que sur un champ de saisie, une pastille de choix et un état « choisi ».
- Rayons : carte 24 (28 pour une réponse), bloc et champ 16, bouton et pastille en pilule.
- Pas d'ombre en sombre. Jamais de filet coloré à gauche d'une carte.
- Cible tactile : 48 px, jamais sous 44.
- **Densité** : au premier écran, une réponse héros entière avec son bouton ; le reste se lit en défilant.

## Composants

- **Réponse héros** (`ui/reponse.tsx`, `heros`) : l'étiquette, le chiffre, son visuel, la phrase, puis le seul
  bouton plein de l'écran et le partage en icône ronde. La source reste écrite sous la phrase.
- **Bouton plein** : en pilule, encre sur clair, ivoire sur sombre. Un seul par écran ; les autres sont des
  pilules discrètes (teinte « voile »).
- **Avatar** : un seul composant (`ui/avatar.tsx`) ; photo libre créditée sur le même écran, sinon initiales.
- **État vide** : `Vide` (icône, phrase vraie, action ou lien). Jamais un zéro ni une forme vide (invariant 5).
- **Chargement** : `SquelettesListe`, partout. Jamais le mot « Chargement » dans une carte.
- **Réglages et informations** : la roue de l'en-tête des onglets, et elle seule.

## Mouvement

- Pile : glissement du système. Recherche et partage : montée depuis le bas. Onglets : fondu court.
- Entrée d'un écran : `ui/entree.tsx`. Toute animation passe par `ui/mouvement.ts`, qui respecte
  « réduire les animations » (système et confort de lecture).

## Gardes

`mono/apps/mobile/tests/audit-ui-web.mjs` (CI mobile) mesure chaque écran : texte sous 12 px, lien
souligné, cible sous 44 px, contraste de texte AA, emoji, bouton sans nom, débordement.
`tests/theme.test.mjs` garde les contrastes et l'usage des couleurs de vote.
