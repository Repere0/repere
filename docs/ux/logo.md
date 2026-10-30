# Logo de Repère

Date : 30/10/2026. Fichier : `mono/apps/mobile/src/ui/logo.tsx`. Composant : `<Logo size variant c />`.

## Ce que le logo représente

Un repère, c'est une cible et un point d'ancrage : on voit où l'on est sur une carte. Le logo est donc un anneau (la cible), un anneau intermédiaire, et un point au centre (le lieu). Il ne contient ni lettre ni image : c'est une forme posée sur deux cercles.

## Pourquoi pas de bleu-blanc-rouge

- **Pas de dégradé bleu → rouge.** Il rappellerait le drapeau français, et le logo d'une application civique ne doit pas être pris pour un symbole d'État. Le brief demandait la neutralité.
- **Pas de couleur d'accent nouvelle.** La palette (`src/lib/palette.ts`) n'en a pas, et les cinq couleurs d'échelon (ville, agglomération, département, région, France) portent un sens. Les ajouter pour décorer le logo irait contre l'invariant 7.
- Le point central et l'anneau extérieur suivent donc l'encre du thème. L'anneau intermédiaire est gris (`sourd` de la palette). Il n'y a que des gris : le logo reste sobre.

## Variantes

| Variante | Usage | Couleurs |
|---|---|---|
| `mono` (défaut) | en-tête de l'accueil, écran À propos | `couleurs.encre` du thème courant, sans anneau intermédiaire |
| `clair` | fond clair, hors cartes | neutres du mode clair |
| `sombre` | fond sombre, hors cartes | neutres du mode sombre |
| `c={...}` | cartes de partage | palette fixe `PALETTE_CARTE` (décision D5) |

## Usages dans l'application

| Où | Taille | Fichier |
|---|---|---|
| En-tête de l'accueil, à côté de « Repère. » | 48 px | `src/app/index.tsx` |
| Cartes de partage (story), à la place du « R » | 34 px | `src/ui/partage/carte-story.tsx` |
| Page « partager » (deux cartes de vote) | 34 px | `src/app/partager.tsx` |
| Écran « À propos », en grand | 96 px | `src/app/a-propos.tsx` |

Non fait : l'écran d'accueil (onboarding) n'existe pas dans l'application. Le logo n'y est donc pas placé.

## Ce qui n'est pas fait

- **Icône de l'application (1024 × 1024).** Le fichier `assets/icon.png` est inchangé. Un composant React ne produit pas de fichier binaire. Le CEO doit exporter le logo en PNG 1024 × 1024 (voir `BLOCAGES.md`).
- **Tailles.** Vérifiées sur une page de test locale (non commitée) aux tailles 24, 34, 48, 96 et 128 px, en `mono` et `clair` sur fond clair : anneaux et point nets. La variante `sombre` (encre claire) est faite pour les fonds sombres ; sur fond clair elle disparaît, comme prévu. Les cartes de partage sombres l'utilisent en situation réelle (34 px). Pas encore vu sur appareil.
- **Rendu sur appareil.** Aucun contrôle sur iPhone ou Android dans cette session.

## Règles de construction

- Aucune image, aucune bibliothèque SVG : des `View` avec `borderRadius`. Pas de dépendance ajoutée.
- Mise en page en flux : anneaux imbriqués en flexbox, sans `position: absolute` (bloc 11, 30/10/2026). Le logo se place comme un bloc ordinaire, dans un en-tête comme dans une capture pleine page.
- Épaisseur de l'anneau extérieur : `max(2, round(taille × 0,075))` px.
- Point central : 20 % de la taille.
- Accessibilité : le logo est masqué aux lecteurs d'écran (`accessible={false}`). Le nom « Repère » est porté par le texte à côté.
