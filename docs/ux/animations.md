# Animations et micro-interactions

Date : 30/10/2026. Bloc 4 de la mission v8. Fichiers : `mono/apps/mobile/src/ui/entree.tsx`, `src/app/(onglets)/_layout.tsx`, `src/app/(onglets)/elus.tsx`, `src/app/_layout.tsx`.

## Règles

- Aucune durée au-dessus de 300 ms (test `conformite.test.mjs` : 100 à 300 ms dans `entree.tsx`).
- `Animated` de React Native, aucune dépendance ajoutée.
- Le mouvement réduit (Réglages > Accessibilité, `useMouvementReduit`) supprime toutes les animations de `Entree`.
- Une animation répond à une action du lecteur ou accompagne une arrivée de contenu. Rien ne bouge en boucle.

## Ce qui est en place

| Moment | Effet | Réglage |
|---|---|---|
| Arrivée d'un écran de détail | fondu + remontée de 12 px | 280 ms, `Entree` |
| Cascade sur la liste des élus | les 8 premières fiches arrivent une par une | 280 ms, décalage 40 ms par fiche (`delai={index * 40}`) |
| Appui sur une fiche d'élu | opacité 0,7 | au press |
| Appui sur un onglet de segment (Calendrier, Dictionnaire, Procédure, Fiche élu) | opacité 0,7 | au press |
| Appui sur une lettre du dictionnaire | opacité 0,7 | au press |
| Changement d'onglet de la barre basse | fondu | `animation: "fade"` sur `Tabs` (natif) |
| Ouverture de « Partager » | remontée depuis le bas | `animation: "slide_from_bottom"` sur la pile |
| Transitions entre écrans de la pile | glissement natif de la plateforme | défaut d'expo-router |

## Limites connues

- La cascade des élus se joue au montage de chaque fiche. Les fiches au-delà de la huitième n'ont aucune animation, pour qu'un défilement ne fasse pas clignoter la liste.
- Le délai total de la huitième fiche est de 280 ms de décalage plus 280 ms d'animation, soit 560 ms avant qu'elle soit pleinement visible. Le plafond de 300 ms porte sur chaque animation, pas sur la cascade.
- Le fondu des onglets et le glissement de « Partager » sont des options natives : leur rendu n'a pas été vu sur appareil. Aucun contrôle iPhone ou Android dans cette session.
- Le press à 0,7 ne touche que les éléments du bloc 4. Les autres `Pressable` de l'application n'ont pas été revus dans ce bloc : leur opacité au press reste celle d'origine.
