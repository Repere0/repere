# Audit « 5 secondes » — 30/10/2026 (V15, bloc 5)

## Méthode

Export web, Chromium, 390 × 844 px (Playwright), commune Meaux. On compte les **lignes de texte visibles dans le premier écran** : une ligne, c'est une hauteur de ligne distincte. Deux morceaux de texte posés côte à côte comptent pour une. Les glyphes décoratifs, les emojis seuls et les éléments masqués aux lecteurs d'écran ne comptent pas. La barre haute et la barre d'onglets **comptent**. Script : `lignes.mjs`, dans le dossier de travail de la session (non commité). Pas de mesure sur appareil.

## Résultats

| Écran | Avant | Après | Ce qui a changé |
|---|---|---|---|
| Accueil (première ouverture) | 16 | 16 | Déjà refait en A3 et D15 : logo, phrase, champ, carte budget de 4 lignes |
| Aujourd'hui | 25 | 25 | Rien : la règle « trois réponses dans le premier écran » y est vérifiée par le parcours |
| Budget | 27 | 24 | Ligne de date en double retirée ; explication de la médiane repliée dans « Comment est calculée la médiane ? » |
| Fiche élu | 25 | 24 | Ligne de date en double retirée |
| Calendrier | 24 | 23 | Ligne de date en double retirée |
| Actualités | 26 | 25 | Date en double retirée ; « Mis à jour le… », interdit par D14 et l'invariant 9, remplacé par « Fil de la rédaction du … · il y a N jours · Source » ; sous-titre raccourci |

## Pourquoi pas « 6 lignes au plus »

La cible de la brief (au-delà de 6 lignes, simplifier) ne s'atteint pas sans retirer ce que d'autres règles du produit imposent :

- **Aujourd'hui** doit montrer trois réponses, chacune avec sa phrase, sa preuve et sa source, dans le premier écran. Le test `parcours-web` le vérifie. Cela fait déjà environ 15 lignes.
- La barre haute (retour, nom de la commune, réglages) et la barre d'onglets prennent 3 à 4 lignes sur chaque écran.
- Chaque chiffre porte sa source et sa date (invariant 4). La ligne de fraîcheur (bloc A de V13) en ajoute une.

Ce qui compte pour les 5 secondes, c'est **ce que l'œil lit en premier**. Sur les écrans revus, c'est désormais : la question en titre, puis le chiffre ou la réponse, puis la comparaison. Les explications (« Comment est calculée la médiane ? », « Détails du calcul », « Ce que ça ne veut pas dire ») sont repliées.

## Filtre « un ado de 15 ans comprend ? »

Mots relus sur les écrans audités :

- « médiane » : enseignée au collège ; la phrase dépliée la redit (« la moitié dépense moins, l'autre moitié plus »).
- « relevé » : compréhensible, mais « Relevé des votes du 28 octobre » reste un peu administratif.
- « investissement » : abrégé « invest. » sur l'accueil ; « vos équipements (investissement) » ailleurs.
- « scrutin public solennel » : déjà expliqué là où il apparaît (test `absences`).

## À décider par le porteur

1. Garder ou non la ligne « Données Repère publiées le … » en tête de l'accueil (première ouverture). Elle prend une ligne et ne dit rien d'utile avant le choix d'une commune.
2. Assouplir « trois réponses dans le premier écran » si l'on veut descendre sous 20 lignes sur Aujourd'hui.
3. Faire tester par 3 à 5 testeurs la lecture réelle en 5 secondes : ce compte de lignes ne mesure pas la compréhension.

## Deuxième passe — V19 (30/10/2026)

Nouvelle mesure : on compte aussi les lignes de **contenu**, c'est-à-dire sans la barre haute (100 px) ni la barre d'onglets (80 px du bas). C'est ce que l'œil lit vraiment. Même méthode, même écran (390 × 844, Meaux).

| Écran | Total V15 → V19 | Contenu V19 | Décision V19 |
|---|---|---|---|
| Accueil (première ouverture) | 16 → 16 | 12 | Bloc « Pas de compte, pas d'e-mail » ramené à une ligne et un lien vers la FAQ (bloc 3 de V19) |
| Aujourd'hui | 25 → 25 | 20 | Rien : les règles ci-dessous l'empêchent |
| Budget | 24 → 22 | 17 | Le détail « Dont … pour vos agents, … pour vos équipements » est replié dans « Ce que finance cet argent » ; chiffre et comparaison restent visibles |
| Fiche élu | 24 → 23 | 20 | Étiquette « Assemblée nationale » retirée quand le rôle la dit déjà |
| Calendrier | 23 → 22 | 18 | Sous-titre raccourci : « … et au Sénat : elles concernent tout le pays. » |
| Actualités | 25 → 24 | 19 | Rien de plus |

## Pourquoi l'objectif « 6 lignes » n'est toujours pas atteint

Ce n'est pas un manque de coupes. **Trois règles du produit, toutes vérifiées par des tests, imposent plus de 6 lignes de contenu** :

1. **Trois réponses dans le premier écran d'Aujourd'hui** (`parcours-web`, « les trois réponses tiennent dans le premier écran »). Chaque réponse fait 4 à 6 lignes : phrase, preuve, source.
2. **Un calcul s'annonce sans ouvrir de feuille** (invariant 4 ; `parcours-web`, « un chiffre calculé se dit calculé sans ouvrir la feuille »). La mention « Calcul Repère » ne peut pas aller dans un « Pourquoi ? ».
3. **La date et l'ancienneté en haut de chaque écran** (V13, bloc A) : une à deux lignes.

## Ce que le CEO peut décider pour passer sous 6 lignes

- **Option A — une réponse en tête, les deux autres en dessous.** Aujourd'hui afficherait d'abord une seule réponse (le chiffre et sa comparaison, en grand), puis les deux autres au défilement. Gain estimé : 20 → 8 lignes de contenu. Il faut assouplir la règle 1.
- **Option B — date en pied d'écran.** Gain : 1 à 2 lignes par écran, au prix de la fraîcheur « visible d'un coup d'œil » demandée en V13.
- **Option C — tester avant de couper.** Faire lire Aujourd'hui à 5 testeurs pendant 5 secondes (question 4 du kit testeur) : le nombre de lignes ne mesure pas la compréhension. Recommandé avant A ou B.

## Décision du CEO — option C (30/10/2026, V20)

**Option C retenue par le CEO : le test 5 s sera mesuré sur 5 testeurs réels** (question 4 du kit : « qu'avez-vous retenu en 5 secondes ? »). **Aucune nouvelle coupe avant les retours.** Les 3 règles déjà vérifiées (3 réponses au premier écran, calcul signalé, date en haut) **ne sont pas remises en cause**. Si les retours montrent que c'est trop dense, on tranchera alors.

Pour l'analyse : `docs/template-debrief.md` (thème « Compréhension ») et la colonne « Écran concerné » de `docs/tableau-debrief.csv`.
