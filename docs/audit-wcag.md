# Audit WCAG 2.2 AA par écran (V36, bloc 4)

Date : 31/10/2026. Branche `test/sdk58-expo-go`. Build web exporté depuis le code courant, servi sur `localhost:8811`, profil gardé (commune Melun 77288, texte 16, contraste normal, mode « auto » ou « clair » selon l'écran). Mesures : sonde `probe-core.js` (ux-ui-audit), 390 × 844 pour les écrans mobiles, 1280 × 900 pour le parcours clavier. Données brutes : `scratchpad/v36/wcag/*.json`.

## Ce que ces mesures couvrent, et ce qu'elles ne couvrent pas

- **Couvert** : contraste du texte (calcul de ratio sur le rendu web), taille des cibles tactiles (SC 2.5.8, 24 × 24, et seuil Apple 44 pt), noms accessibles (libellé présent sur chaque contrôle), titres, débordement horizontal, erreurs JavaScript, indicateur de focus (SC 1.4.11) sur quelques écrans.
- **Non couvert** : VoiceOver et TalkBack réels (aucun appareil dans la session). Les noms mesurés sont ceux du navigateur, pas ce qu'un lecteur d'écran annonce. Les images et graphiques ne sont pas mesurés. Les écrans `/elu`, `/vote`, `/annuaire-fiche` et `/partager` ont besoin d'un paramètre d'URL et n'ont pas été mesurés.

## Résultat par écran (19 mesurés)

| Écran | Contraste texte | Cibles < 24 px | Sans nom accessible | Erreurs JS | Verdict |
|---|---|---|---|---|---|
| Accueil `/` | 40 mesurés, **1 échec réel** (2,83:1), 2 faux positifs (émojis) | 0 / 17 | 0 | 0 | **FAIL** (contraste) |
| Qui décide | 47 / 47, 0 échec | 0 / 18 | 0 | 0 | PASS |
| Calendrier `/a-venir` | 21 / 21 | 0 / 11 | 0 | 0 | PASS |
| Chez vous | 43 / 43 | 0 / 25 | 0 | 0 | PASS |
| Élus | 135 / 135 | 0 / 47 | 0 | 0 | PASS |
| Mes élus | 22 / 22 | 0 / 4 | 0 | 0 | PASS |
| Actus | 88 / 88 | 0 / 19 | 0 | 0 | PASS |
| Budget `/argent` | 293 / 293 | 0 / 42 | 0 | 0 | PASS |
| Bienvenue | 32 / 32 | 0 / 18 | 0 | 0 | PASS |
| Confidentialité | 22 / 22 | 0 / 0 | 0 | 0 | PASS |
| Confort de lecture | 29 / 29 | 0 / 14 | 0 | 0 | PASS |
| Dictionnaire | 186 / 186 | 0 / 22 | 0 | 0 | PASS |
| FAQ | 27 / 27 | 0 / 3 | 0 | 0 | PASS |
| Pour vous | 51 / 51 | 0 / 12 | 0 | 0 | PASS |
| Procédure | 11 / 11 | 0 / 10 | 0 | 0 | PASS |
| Scrutins | 8 / 8 | 0 / 3 | 0 | 0 | PASS |
| Sources | 48 / 48 | 0 / 8 | 0 | 0 | PASS |
| Voter | 27 / 27 | 0 / 2 | 0 | 0 | PASS |
| À propos | 7 / 7 | 0 / 1 | 0 | 0 | PASS |

Non mesurés : `/elu`, `/vote`, `/annuaire-fiche`, `/partager` (paramètres d'URL requis).

## Détail des échecs

1. **Accueil, date de publication** (« Données Repère publiées le 30 octobre 2026. ») : texte 13 px, couleur `rgb(98, 94, 87)` sur `rgb(22, 21, 19)`, **2,83:1**. SC 1.4.3 exige 4,5:1. Cause : l'accueil est toujours sombre (`index.tsx`, « quel que soit le choix d'affichage ») et lit la couleur « sourd » de la palette sombre.
2. **Accueil, émojis** (📊, 🗳️) : 1,25:1 mesuré. **Faux positif** : ce sont des glyphes en couleur, pas du texte. Noté dans `audit-final-visuel.md`.
3. **Accueil, anneau de focus clavier** : contour `auto` de 1 px, couleur `rgb(16, 16, 16)` sur `rgb(22, 21, 19)`, **1,04:1**. SC 1.4.11 exige 3:1. Un utilisateur au clavier sur le web ne voit pas où il se trouve sur l'accueil. Sur les écrans clairs, le même anneau fait **17,03:1** : PASS.

## Clavier (web, 1280 × 900)

- Accueil : 18 éléments distincts atteints en 40 appuis sur Tab. Qui décide : 19. Pas d'exhaustivité prouvée : c'est un échantillon.
- Anneau de focus : PASS sur Qui décide et Calendrier (17,03:1), FAIL sur l'accueil (1,04:1).
- Ordre : l'accueil passe d'abord par « Vue : La France · Changer » puis par les liens de la page. Pas de piège au clavier observé.

## Étiquettes manquantes

Aucune mesurée : 0 contrôle sans nom accessible sur les 19 écrans. **Aucun libellé n'a été ajouté** : rien à corriger d'après la mesure. VoiceOver reste à vérifier sur iPhone.

## Points structurels à ne pas confondre avec des échecs

- La sonde compte 31 titres de niveau 1 sur `/argent` et 10 sur `/actus`. Cela vient de `accessibilityRole="header"`, rendu en `h1` par react-native-web. Sur iOS, un titre VoiceOver n'est pas un `h1`. **Défaut web, à traiter si le site est jugé à part.**
- `/scrutins` n'a aucun `h1` : le titre n'est pas balisé comme titre sur le web.

## Constat produit (hors WCAG, signalé)

- L'accueil ignore le choix « Clair » (décision de direction artistique du 30/10). Le réglage D67 existe, mais il ne s'applique pas à cet écran. À trancher par le CEO.

## Corrections proposées, non faites

- Accueil : relever la couleur du texte secondaire et la couleur du focus sur le fond sombre. Changer une couleur de palette touche tous les écrans sombres : décision de direction, pas un correctif de libellé.
- Titres web : passer le rôle `header` en `h2` là où un titre n'est pas le premier de l'écran. Non fait : touche la structure de tous les écrans.
