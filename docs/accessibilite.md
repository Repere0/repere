# Accessibilité

Date : 30/10/2026. Bloc 7 de la mission v8.

## Ce qui a été vérifié, et comment

- **Clavier, sur l'export web** (Chromium, 390 px, Playwright) : la recherche de commune s'ouvre au clavier (Entrée sur « Chercher une commune »), la saisie reçoit le focus, Tab atteint les résultats, Entrée ouvre l'accueil de la commune. Les onglets de la barre basse sont atteints par Tab et portent le rôle `tab` et leur libellé.
- **Trace de focus** : aucun bouton sans nom accessible sur l'accueil de commune (contrôles lus via `aria-label` ou texte).
- **Correctifs faits dans ce bloc** :
  - le défilement horizontal de l'accueil (« Le chiffre du jour », « Dernier vote ») devient une zone de focus clavier sans nom : il porte maintenant un libellé ;
  - le fond des réglages d'affichage est un bouton nommé « Fermer les réglages » ;
  - le panneau des réglages déclare une fenêtre modale (`accessibilityViewIsModal`) et son titre « Affichage » est un en-tête.
- **Déjà en place avant ce bloc** (vérifié dans le code) : bouton retour et « Changer de commune » nommés ; bouton « Réglages de l'affichage » nommé ; boutons « Partager » nommés par leur sujet ; liens vers les sources annonçant « ouvre un site externe » ; choix d'affichage en `radio` avec `checked`.

## Ce qui n'a pas été vérifié

- **Aucun lecteur d'écran n'a été lancé.** Ni VoiceOver (iPhone), ni TalkBack (Android). La checklist ci-dessous est à dérouler sur appareil.
- **Touche Échap** : non testée. Sur le web, la fermeture des réglages par Échap dépend de react-native-web et n'a pas été mesurée.
- **Contrastes** : couverts par `tests/theme.test.mjs` (4,5 : 1 en texte, clair et sombre). Pas de nouvelle mesure dans ce bloc.
- **Tailles de texte du système (Dynamic Type)** : le plafond de l'onglet est une décision (D22, `_layout.tsx`), à valider sur Android.

## Checklist VoiceOver (10 points, à dérouler sur iPhone)

Réglages > Accessibilité > VoiceOver activé. Parcourir l'application de l'accueil à la fiche élu.

1. **Accueil de commune** : le premier élément lu est le nom de la commune ou la question, pas un bouton décoratif.
2. **Onglets** : chaque onglet annonce son nom (« Aujourd'hui », « Qui décide », « Calendrier », « Élus ») et son état « sélectionné ».
3. **Icônes de la barre basse** : les glyphes (◷, ⌂, ▦, ◎) ne sont pas lus ; seul le nom de l'onglet l'est.
4. **Bouton retour** : « Revenir à l'écran Aujourd'hui » (ou le nom de l'écran précédent) ; il ramène bien à l'écran d'origine.
5. **Question en titre** : chaque écran de détail a une question lue comme en-tête, et on peut passer d'en-tête en en-tête.
6. **Sources** : chaque chiffre est suivi d'un élément « D'où vient cette information ? » qui annonce la source et la date.
7. **Liens externes** : annoncent « ouvre un site externe » avant d'ouvrir le navigateur.
8. **Partager** : chaque bouton annonce son sujet (« Partager : … »), pas seulement « Partager ».
9. **Réglages d'affichage** : le panneau est une fenêtre modale ; les trois choix sont des boutons radio, l'option courante est dite « cochée » ; « Fermer les réglages » ferme le panneau.
10. **Défilement horizontal** : le carrousel de l'accueil est nommé « Cartes à faire défiler… » et se parcourt par balayage à un doigt, carte par carte.

## Règles pour les prochains écrans

- Tout `Pressable` a un `accessibilityRole` et, si son texte ne se suffit pas, un `accessibilityLabel` qui dit l'action.
- Une icône décorative porte `accessibilityElementsHidden` et `importantForAccessibility="no"`.
- Un défilement qui peut recevoir le focus clavier porte un `accessibilityLabel`.
