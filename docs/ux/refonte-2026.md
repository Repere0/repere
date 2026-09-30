# Repère mobile — la refonte de l'expérience (30/09/2026)

*Première itération, construite et testée sur les vraies données (Meaux, Paris,
Boulogne-Billancourt, Amponville, Sartrouville). Branche `feat/mobile-ux-revolution`.
Captures avant / après dans [`captures/`](captures/).*

## 1. Audit : pourquoi l'expérience d'avant était mauvaise

Mesuré sur l'écran commune de #52 (Meaux, 390 × 844) : **3,2 écrans à faire défiler,
557 mots, 4 lignes de source complètes, aucune image, un seul niveau de lecture.**

| problème | où | effet |
|---|---|---|
| **La donnée avant la question** | chaque carte commence par une étiquette technique puis un bloc de texte | le lecteur doit deviner pourquoi on lui montre ça |
| **Un seul niveau** | tout est déplié : chiffres, avertissements, sources | charge cognitive maximale dès la première seconde |
| **Le fait le plus récent sous le pli** | le vote du député arrive après le maire et un projet | l'écran dit « ce qui se passe » et montre d'abord ce qui ne change pas |
| **Les sources comme appendice** | 4 lignes grises + 4 liens identiques « Voir à la source » | la preuve pèse un quart de chaque carte et ne se lit pas |
| **Langage administratif** | « encours de dette », « exercice », « dispositif » sans explication au moment utile | un lecteur peu politisé décroche |
| **Aucun visuel** | 726 800 €, 378 pour / 7 contre, 47 € sur 100 : tout en phrases | les proportions, qui se voient en un coup d'œil, se lisent laborieusement |
| **Aucune suite** | l'écran s'arrête ; rien ne propose d'approfondir | pas de sensation d'avancer |
| **Pas d'identité** | police système, filets de couleur, cartes plates | Repère ne se reconnaît pas |

Ce qui était bon et a été gardé : la neutralité, une phrase pour chaque absence, la source
sur chaque chiffre, les données réelles.

## 2. Patterns retenus (sur 16 étudiés)

| pattern | vu chez | ce que Repère en fait |
|---|---|---|
| valeur avant l'inscription | Duolingo (une leçon avant tout compte) | une commune → l'écran « Chez vous », sans compte, sans e-mail, jamais |
| une question par écran | services publics numériques récents | 4 écrans, chacun ouvert par sa question en grand |
| divulgation progressive | NN/g, apps de finance | niveau 1 sur l'accueil, niveaux 2–3 dans le détail, niveau 4 dans la feuille de source |
| la réponse d'abord, en grand | apps météo | « L'État apporte 726 800 € », « Béatrice Roullaud a voté pour » |
| cartes-résumé qui s'ouvrent | Revolut, Citymapper | 5 cartes-questions, chacune avec un seul geste « Comprendre » |
| chiffre qui se révèle | fintech | le montant par jour se compte à l'apparition (coupé si mouvement réduit) |
| proportion en barre | visualisation de données | parts de 100 €, financement d'un projet, répartition d'un vote |
| frise temporelle | Citymapper (étapes), apps de colis | parcours d'une loi, séances à venir |
| chaîne de niveaux | orientation, fil d'Ariane | commune → interco → département → région → Assemblée |
| provenance discrète mais accessible | presse de données | pastille « ⓘ OFGL · 2026 » → feuille complète |
| pédagogie au moment utile | Duolingo (astuce contextuelle) | « Où en est ce texte ? », « Qu'est-ce que la DSIL ? », « Ce que ça ne veut pas dire » |
| texte alternatif des graphiques | USWDS, guides d'accessibilité | chaque visuel se lit aussi en une phrase au lecteur d'écran |
| mouvement réduit respecté | iOS, Android | toutes les animations passent par un seul crochet qui s'efface |
| identité par la typographie | apps éditoriales | Bricolage Grotesque embarquée pour les questions et les chiffres |
| **refusés** : points, séries, classements, notifications, pression | Duolingo | contraires aux invariants 3, 6 et 2 |

Sources consultées : [Duolingo onboarding (Appcues GoodUX)](https://goodux.appcues.com/blog/duolingo-user-onboarding),
[Progressive disclosure (NN/g)](https://www.nngroup.com/videos/progressive-disclosure/),
[Data visualizations (USWDS)](https://designsystem.digital.gov/components/data-visualizations/),
[Rich screen reader experiences for data vis (MIT)](https://vis.csail.mit.edu/pubs/rich-screen-reader-vis-experiences/).

## 3. Trois directions, une synthèse

| | A. service citoyen ultra-simple | B. magazine citoyen interactif | C. apprentissage civique visuel |
|---|---|---|---|
| idée | une réponse par écran, zéro décor | un fil de « unes » locales, grandes typographies | des schémas qui expliquent les institutions |
| force | vitesse, confiance, accessibilité | envie de lire, hiérarchie forte | pédagogie, mémoire |
| risque | froid, rien ne donne envie de continuer | tentation d'éditorialiser, dépend d'un contenu qu'on n'a pas | dérive vers le cours magistral |
| données actuelles | suffisent | 7 faits rédactionnels seulement | suffisent pour institutions et procédure |

**Direction retenue (hybride)** : la **structure de A** (une question, une réponse, un
geste), la **voix de B** (grandes questions en Bricolage Grotesque, cartes aérées, une
« une » par sujet), la **pédagogie de C** mais **seulement là où elle sert** (frise de la
loi dans l'écran du vote, chaîne des niveaux dans « Qui décide », sens d'un sigle au
moment où il apparaît).

## 4. Architecture de l'information et navigation

```
Où habitez-vous ?  ──►  CHEZ VOUS (le sommaire vivant)
                         ├─ Ce qui se passe près de chez vous  → Où va l'argent de Meaux ?
                         ├─ Ce qu'a voté votre député          → Qu'a voté votre député ?
                         ├─ Où va l'argent de la commune       → Où va l'argent de Meaux ?
                         ├─ Qui décide pour vous               → Qui décide pour Meaux ?
                         └─ Ce qui arrive au Parlement         (frise, sur place)
                        + chaque ⓘ → feuille « D'où vient cette information ? »
```

Une pile, pas d'onglets : quatre écrans excellents plutôt que huit rubriques. Retour par
le geste natif ou le bouton en haut à gauche (48 px). Un seul chargement par commune,
partagé par les quatre écrans.

## 5. Système de design

- **Couleurs** : les cinq couleurs d'échelon (gelées, invariant 7) marquent *qui* parle ;
  tout le reste est neutre. Un vote est dessiné en **trois gris** : aucune position n'a
  de couleur « bonne » ou « mauvaise ».
- **Typographie** : Bricolage Grotesque (OFL, 2 graisses, 182 Ko, embarquée) pour les
  questions, les noms de lieu et les grands nombres ; police système pour le texte, qui
  suit la taille choisie par le lecteur.
- **Échelle** : affiche 40, question 30, réponse 22, corps 17, note 15, micro 13.
- **Formes** : cartes 22 px d'arrondi et ombre légère, blocs 14, pastilles rondes ;
  espacement sur une grille de 4.
- **États** : chargement, panne (« pas arrivé », avec Réessayer) et absence (« la source ne
  porte rien ») ont chacun leur phrase.
- **Mouvement** : barres qui se remplissent (0,7 s), montant qui se révèle (0,5 s),
  feuille de source qui glisse ; tout est coupé si le téléphone demande de réduire les
  animations.

## 6. Bibliothèque de primitives (`mono/apps/mobile/src/ui/`)

| primitive | montre | garde-fou |
|---|---|---|
| `BarrePart` | une part de 100 € | libellé et valeur écrits ; deux parts ne sont jamais empilées |
| `Financement` | subvention / coût d'un projet | le reste est « non détaillé par la source » |
| `Mois` | la dette en mois de recettes | « une case = un mois » écrit |
| `Repartition` | pour / contre / abstention | dénominateur dit (« députés ayant pris part au vote ») |
| `DeuxAnnees` | un montant sur deux exercices | chaque paire a sa propre échelle, et c'est écrit |
| `Frise` | des étapes ou des dates | l'étape surlignée vient de l'intitulé officiel, sinon aucune |
| `Chaine` | les cinq niveaux de décision | « ordre de distance, pas d'importance » |
| `Compteur` | un grand montant | le lecteur d'écran lit la valeur finale |
| `Depli` | l'explication (« ce que ça ne veut pas dire ») | état ouvert/fermé annoncé |
| `PastilleSource` + `FeuilleSource` | la provenance | nom court, date, méthode si calcul, lien officiel |

Les nombres dessinés viennent de `packages/core/src/visuels.js` (testés) : le site pourra
dessiner les mêmes objets sans recalculer.

## 7. Avant / après (mesuré, Meaux, 390 × 844)

| | avant (#52) | après |
|---|---:|---:|
| mots sur l'écran commune | 557 | 383 |
| visuels | 0 | 6 |
| niveaux de lecture | 1 | 4 |
| sources | 4 lignes pleines | 5 pastilles + feuille ; lignes complètes dans chaque détail |
| écrans | 1 long | 1 sommaire + 3 réponses |
| contrôles du parcours mobile (3 largeurs, 4 écrans, pannes, mémoire, mouvement réduit) | — | 111 |

**Non vérifié** : un vrai téléphone (la police, les animations, le geste retour, la feuille
de source en mode « pageSheet » d'iOS), VoiceOver et TalkBack réels, les grandes tailles
de texte. **Pas encore mesuré** : le test des 20 secondes avec des personnes réelles.
