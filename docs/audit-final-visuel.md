# Audit visuel final : sombre, daltonien, taille 26

Date : 30/10/2026. Branche `test/sdk58-expo-go`. Build de contrôle exporté avec `EXPO_PUBLIC_CONTACT_EMAIL=test@test.com` : il n'est pas destiné à la publication.

## Réglages appliqués

- Profil gardé dans le stockage : mode daltonien activé, taille du texte 26, contraste normal, commune retenue Melun (77288).
- Mode sombre : appliqué par la préférence système de l'appareil (`colorScheme: dark`), ou par le choix de la roue des réglages. Depuis V35 (D67), ce choix est gardé dans `repere.profil` (champ `mode` : auto, clair, sombre) : il survit au rechargement, sans nouvelle clé.
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

## Graisse du texte (V35, bloc 3, D69)

Objectif du CEO : ramener la part de texte semi-gras ou plus (poids 600 et plus) à 30 à 40 % au plus par écran, contre 48 à 62 % en V34.

Règle appliquée :
- **700 et 800** : seulement le titre principal de l'écran (question, police « affiche ») et les chiffres dominants (police « chiffre »). Ces deux polices sont des faces Bricolage Grotesque, pas un poids CSS.
- **600** : les intitulés de section et de carte (en-têtes, nom d'élu dans une liste, réponse d'une carte, police « titre »).
- **500** : liens, boutons, libellés d'onglets, badges, mentions de source, étiquettes.
- **400** : le reste (corps de texte).

Mesure (sonde `probe-perception.js`, poids CSS 600 et plus, 390 × 844, mêmes flux qu'en V34). Pas de mesure « avant » à la même date sur le même build : les valeurs V34 viennent de `v34/audit/*.json`.

| Écran | V34 (sonde) | V35 (sonde) | V35 (sonde + polices Bricolage) |
|---|---|---|---|
| Accueil (commune) | 62 % | 0 % | 11 % |
| Fiche élu | 50 % | 27 % | 32 % |
| Budget | 48 % | 17 % | 34 % |
| Calendrier | 61 % | 26 % | 30 % |
| Élus | 62 % | 13 % | 15 % |

Lecture de ces chiffres :
- La sonde ne lit que le poids CSS. Elle ne voit pas les titres en police « titre » ou « affiche », qui sont visuellement gras. La colonne « + polices » compte ces textes : elle est la mesure visuelle honnête, et elle reste sous 40 % sur les cinq écrans.
- Sur l'accueil, la sonde tombe à 0 % : la hiérarchie repose maintenant sur la taille et la police de titre, plus sur le poids des libellés. C'est voulu, mais c'est la limite à regarder sur iPhone.
- Les chiffres V34 n'ont pas été re-mesurés sous la colonne « + polices » : cette colonne n'existe que pour V35.
- Mesures faites sur Chromium 390 px, pas sur iPhone réel.
