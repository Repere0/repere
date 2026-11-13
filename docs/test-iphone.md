# Test sur un vrai iPhone : les marges de sécurité

Date : 13/11/2026. Les marges ont été corrigées et mesurées dans Chromium avec une marge émulée de 34 px
(`mono/apps/mobile/tests/marges-ios-web.mjs`). Ce n'est pas un iPhone : ce guide sert à le confirmer. Dix minutes.

## Avant de commencer

1. Ouvrir l'adresse de l'application dans **Safari** (pas Chrome).
2. Choisir une commune (par exemple Melun).
3. Faire les trois contrôles une première fois dans Safari.
4. Puis : bouton Partager de Safari → « Sur l'écran d'accueil ». Ouvrir l'application depuis son icône et refaire les
   trois contrôles. C'est dans ce mode, sans la barre de Safari, que la barre d'accueil de l'iPhone gêne le plus.

Pour chaque ligne, noter OUI ou NON. Un NON : une capture d'écran suffit, avec le modèle d'iPhone et « Safari » ou
« icône ».

## 1. La barre du bas (les quatre onglets)

| à vérifier | attendu |
|---|---|
| Les libellés « Aujourd'hui », « Qui décide », « Finances », « Le calendrier » | entiers, au-dessus du trait de la barre d'accueil, jamais dessous |
| Le fond de la barre | descend jusqu'au bord bas de l'écran, sans bande d'une autre couleur |
| Toucher chaque onglet | il s'ouvre du premier coup, sans déclencher le geste « retour à l'accueil » |
| Faire défiler une page jusqu'en bas, puis remonter | la barre ne bouge pas, ne saute pas |
| Tourner le téléphone à l'horizontale, puis revenir | la barre reprend sa place |

## 2. Finances

| à vérifier | attendu |
|---|---|
| L'en-tête | le titre « Où va l'argent » entier, l'icône de partage à droite, rien qui se chevauche |
| Le sélecteur « 100 € citoyen / Évolution / Recettes » | une hauteur normale (environ un doigt), pas un bloc deux fois plus haut |
| Faire défiler jusqu'en bas | le dernier bouton (« Copier le lien ») reste au-dessus de la barre du bas |
| Ouvrir « Détails du calcul », puis le refermer | le contenu ne passe pas sous la barre du bas |

## 3. L'accueil (« Aujourd'hui », la page de la commune)

| à vérifier | attendu |
|---|---|
| Le haut de la page | le nom de la commune n'est pas sous l'heure ni sous l'encoche |
| La première carte (le budget) | son bouton « Où va cet argent ? » visible sans défiler. Si ce n'est pas le cas, le noter : la marge mesurée n'est que de 20 px (issue ouverte) |
| La bulle « Repère du jour » | le fait entier, sur deux lignes au plus |
| Faire défiler jusqu'en bas | la dernière ligne (« Signaler une erreur ») reste au-dessus de la barre du bas |
| Paris : choisir un arrondissement | la rangée d'arrondissements défile du doigt, la carte se met à jour |

## Deux contrôles en plus, si tu as deux minutes

- **Élus** et **Bienvenue** (écrans sans barre du bas) : en bas de page, le dernier texte ne passe pas sous la barre
  d'accueil de l'iPhone.
- **Hors ligne** : mode avion, rouvrir l'application depuis son icône. Elle s'ouvre et dit que la publication n'a pas
  pu être vérifiée.

## Si un contrôle échoue

Le dire avec la capture. Le test automatique sera corrigé en premier, pour qu'il échoue lui aussi : sinon le défaut
reviendra.
