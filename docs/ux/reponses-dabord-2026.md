# « Réponses d'abord » — l'accueil « Chez vous »

**30 septembre 2026.** Spike et prototype sur `feat/mobile-reponses-dabord`, empilé sur
#54. Rien n'est fusionné.

La question posée à l'écran : **« Qu'est-ce que le citoyen apprend en ouvrant Repère ? »**

## 1. Les phrases, vérifiées contre les données

Deux des trois exemples de la consigne disaient plus que la donnée.

| phrase candidate | verdict | ce que dit la donnée |
|---|---|---|
| « Un projet de 726 800 € est financé à 47 % par l'État. » | **faux** | 726 800 € est l'aide de l'État ; le projet coûte 1 533 500 € (47,4 %) |
| « Votre député a participé à ce vote le 21 juillet. » | **à refuser** | « participer » est une donnée de présence, interdite par l'invariant 8 ; la source donne une position |
| « Voici ce qui arrive prochainement au Parlement. » | vrai, mais pas « chez vous » | l'agenda est national |
| « Béatrice Roullaud a voté pour le dernier texte. » | **faux** | le vote affiché (n° 8430) n'est pas le dernier : elle a voté aux n° 8433 et 8434 le même jour |
| « Votre députée » | à éviter | la source ne porte pas la civilité |
| « Votre député, Sylvain Maillard… » (Paris) | **faux pour la plupart des Parisiens** | Paris compte 18 circonscriptions ; défaut présent depuis #53, corrigé |

**Trois dates, jamais mélangées :**

1. La date du fait, dans la phrase.
2. La date de publication de la source, dans la feuille « D'où vient cette
   information ? ».
3. La date de traitement par Repère, en en-tête et dans la feuille.

## 2. Trois concepts

Maquettes avec les chiffres de Meaux : `concepts-chez-vous-2026.html` et
`captures/reponses-concepts.jpg`.

| | A · 3 réponses | B · le fil | C · carte d'identité |
|---|---|---|---|
| Visible sans défiler | 3 réponses entières + 1 lien | 6 entrées, dont 1 nationale | 10 valeurs |
| Visuels | une preuve par réponse | décoratifs | aucun |
| Risque principal | garder trois phrases vraies | dates de natures différentes, moitié nationale, fil local vide | tableau de bord sans explication |

**Retenu : A.** Les raisons, sans notation :

- **Compréhension.** Des phrases entières plutôt que des valeurs nues.
- **Densité.** Trois réponses qui mènent à la suite, pas dix chiffres.
- **Accessibilité.** Une réponse égale une phrase, lue de haut en bas.
- **Retour.** Le fil de B n'aurait rien de local à montrer pour Meaux, semaine
  après semaine.
- **Évolutivité.** A choisit trois réponses dans une liste ordonnée.
- **Simplicité.** A réutilise les primitives existantes.

## 3. Le prototype

Chaque réponse se lit dans cet ordre :

**phrase → preuve visuelle → note courte → source → question suivante**

Aucune rubrique n'est affichée au-dessus. La phrase sert de titre à la carte, y
compris pour le lecteur d'écran.

**Les trois réponses (Meaux) :**

1. **« L'État finance près de la moitié d'un projet de 1,5 M€ à Meaux. »**
   - Preuve : la barre de la part de l'État.
   - Suite : « 5 projets aidés ».
2. **« En 2025, Meaux a dépensé 2 123 € par habitant. »**
   - Note : « Le maire, Jean-François COPE, prépare ce budget ; le conseil
     municipal le vote. »
   - Suite : « Où va cet argent ? ».
3. **« Le 21 juillet 2026, Béatrice Roullaud, qui représente votre
   circonscription, a voté pour. »**
   - Preuve : la répartition en gris.
   - Suite : « Comprendre ce vote ».

**Aller plus loin :**

- qui décide de quoi ;
- ce qui arrive au Parlement, sur un écran neuf qui dit que c'est national ;
- d'où viennent ces informations, un écran neuf qui répond à « Où est-ce que je
  peux vérifier ? ».

**Mesure du premier écran (bas de la 3e réponse) :**

| cas | bas | verdict |
|---|---:|---|
| Meaux, 390 × 844 | 815 px | tient |
| Paris, 390 × 844 | 836 px | tient |
| Amponville, 390 × 844 | 820 px | tient |
| Boulogne-Billancourt, 390 × 844 | 880 px | **déborde de 36 px** (intitulé de projet long) |
| Meaux, 360 × 740 | 905 px | **deux réponses seulement** |

**Contrôle ajouté.** Les trois réponses de Meaux doivent tenir à 390 × 844. La
preuve a été faite en le cassant : il échoue à 390 × 800.

## 4. Palette A contre B

Construite avec `EXPO_PUBLIC_REPERE_PALETTE=b`. Captures :
`captures/reponses-palette-*.jpg`.

**Verdict : B ne sert que sur « Qui décide ? »**, où plusieurs échelons
coexistent. Ailleurs, tout devient bleu sans rien distinguer.

**Coût mesuré.** Sur leur propre teinte, les couleurs d'échelon passent sous le
seuil AA de contraste. En B, les liens passent donc en encre.

**Recommandation : B partiel**, c'est-à-dire des teintes sur la chaîne de décision
seulement. La décision vous revient.

## 5. Résultats

| contrôle | résultat |
|---|---|
| Parcours, palette A | 178 contrôles, 0 échec |
| Parcours, palette B | 178 contrôles, 0 échec |
| Même vérité | 127 faits, 0 échec |
| Statiques | 84 / 84 |
| Poids | JS web +0,53 %, iOS +0,39 %, Android +0,35 %, aucune dépendance |

## 6. Ce qui reste

- Décider de la palette : A, B partiel ou B.
- Petit écran 360 × 740 : deux réponses seulement.
- Tester avec cinq personnes.
- Choisir l'ordre de fusion avec #55 (lexique). Un conflit trivial est attendu sur
  `chez-vous.tsx`.
