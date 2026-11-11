# DESIGN.md : la charte de l'application mobile, telle qu'elle est dans le code

Écrit le 11 novembre 2026 à partir de `mono/apps/mobile/src/lib/palette.ts` et `theme.ts`, et des
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

## Typographie

| style | police | taille / interligne |
|---|---|---|
| affiche (titre d'écran) | Manrope SemiBold | 24 / 30 |
| question | Manrope SemiBold | 22 / 28 |
| réponse (titre de carte) | Manrope | 17 / 24 |
| corps | DM Sans | 15 / 24 |
| note | DM Sans | 14 / 22 |
| étiquette (capitales) | DM Sans Medium | 13 / 18 |
| micro | DM Sans | 13 / 18 |
| chiffre, stat | IBM Plex Mono SemiBold | 28 / 34, 26 / 32 |
| donnée (date ou nombre seuls) | IBM Plex Mono | 13 / 18 |

- Aucun texte sous 12 px. Les tailles suivent le réglage du lecteur (confort de lecture).
- IBM Plex Mono : une date ou un nombre seuls. Une phrase qui contient une date reste en DM Sans.
- Aucun lien souligné, aucun emoji.

## Espaces et formes

- Pas de 4 px. Marge extérieure d'écran : 16 px. Intérieur de carte : 20 px. Gouttière : 12 px.
- Rayons : carte 16, bloc et champ 12, pastille en pilule.
- Filet de carte : 1 px, couleur `trait`. Pas de filet coloré à gauche. Le filet en encre est réservé à
  l'état « choisi ». Pas d'ombre en sombre.
- Cible tactile : 48 px, jamais sous 44.

## Composants

- **Bouton plein** : encre sur clair, ivoire sur sombre. Un seul par écran ; les autres sont discrets.
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
