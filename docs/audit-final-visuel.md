# Audit visuel final : sombre, daltonien, taille 26

Date : 30/10/2026. Branche `test/sdk58-expo-go`. Build de contrôle exporté avec `EXPO_PUBLIC_CONTACT_EMAIL=test@test.com` : il n'est pas destiné à la publication.

## Réglages appliqués

- Profil gardé dans le stockage : mode daltonien activé, taille du texte 26, contraste normal, commune retenue Melun (77288).
- Mode sombre : appliqué par la préférence système de l'appareil (`colorScheme: dark`). Le choix clair/sombre de l'application vit en mémoire et n'est pas gardé sur l'appareil (invariant 2 : deux clés seulement). Le brief parlait d'un profil pré-rempli incluant le thème sombre : ce n'est pas possible sans changer l'invariant 2. Non fait.
- Viewport 390 × 2600 pour que chaque écran tienne en une capture (le défilement est interne à l'application).

## Écrans contrôlés

| Écran | Débordement horizontal | Contraste WCAG (texte, mesuré) | Constat |
|---|---|---|---|
| Accueil | 0 px après correction | 3 éléments sous 4,5:1 : le point du logotype « Repère. » (3,41:1, logo exempté) et deux émojis mesurés à tort (📊, 🗳️) | **Corrigé** : la pastille « Chercher une commune » sortait de la marge à taille 26 |
| Mes élus | 0 px | 0 sous 4,5:1 sur 24 éléments | Conforme |
| Fiche élu (maire) | 0 px | 0 sous 4,5:1 sur 50 éléments | Conforme |
| Budget (/argent) | 0 px | 0 sous 4,5:1 sur 319 éléments | Conforme |
| Vote (/vote) | 0 px | 0 sous 4,5:1 sur 71 éléments | Conforme ; en mode daltonien, Pour est en bleu, Contre en orange, Abstention en gris |

Aucune erreur JavaScript sur les cinq écrans.

## Correction appliquée

- `app/index.tsx`, style `haut` : la ligne « logo + Chercher une commune » passe à la ligne (`flexWrap: "wrap"`) au lieu de dépasser la marge de 16 px. Constaté à taille 26 sur un écran de 390 px.

## Limites

- Les captures ont été regardées une par une, à l'œil, sur le rendu Chromium à 390 px. Elles n'ont pas été vues sur iPhone réel.
- Le contraste a été mesuré sur les éléments à texte direct. Les images et les éléments graphiques (barres, puces, liens) ne sont pas mesurés.
- Les émojis sont des glyphes colorés : leur mesure de contraste n'a pas de sens, elle est écartée.
- Le logotype « Repère. » (point teal, 3,41:1) est exempté : c'est une marque, pas un texte à lire.
- Les écrans « Qui décide », « Chez vous », « Pour vous », « Voter » et « Confort de lecture » n'ont pas été passés en revue visuelle dans ce contrôle.
