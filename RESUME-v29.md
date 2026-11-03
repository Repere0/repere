# RESUME v29 — 30/10/2026

Branche : `test/sdk58-expo-go`. Ordre suivi : 1 → 2 → 3 → 4 → 5 → 6 → 7. Tous les blocs sont faits et poussés. Aucun n'est vérifié sur iPhone réel.

## Commits

| Commit | Bloc | Contenu |
|---|---|---|
| 807c130 | 1 | Trois régressions de l'audit V15/V20 réintégrées : sous-titre du calendrier (« pas seulement votre commune »), « Repère ne sait pas qui vous êtes » au niveau 2 de l'accueil, motif vie privée des photos dans l'ADR 0004 |
| ebe7c7a | 2 | Position de l'exemple de vote lue du relevé de l'Assemblée, plus écrite dans le code. Nom OFGL unifié. INSEE documenté dans BLOCAGES.md (section 26) |
| 60d71ec | 3 | Mode daltonien pour les votes (palette Okabe-Ito), réglage dans « Confort de lecture ». Invariant 7 amendé, sceau régénéré |
| edfc6fa | 4 | Titres-conclusions calculés à partir des données sur la carte budget, la carte vote et la fiche élu |
| df3ac76 | 5 | Bouton « ? » « Pourquoi je vois ça » : source, calcul, pourquoi ici. Appliqué au budget, au vote, à la fiche élu et à la comparaison IDF |
| e8ed88b | 6 | Écran « Pour vous » : fil chronologique filtré par la vue |
| (ce commit) | 7 | Ce rapport |

## Tests

- Tests partagés : 261 réussis, 0 échec. Bilan : 0 erreur, 3 avertissements (inchangés).
- `tsc` : 0 erreur.
- Porte web complète (export, parcours, zoom, cartes de partage) : verte après le bloc 6. Parcours : zéro échec. Zoom : zéro échec. Cartes de partage : zéro échec.
- Tests ajoutés : `daltonisme.test.mjs` (contraste de la palette daltonienne sous simulation).
- Captures vérifiées à l'œil : budget, vote, fiche élu, « Pourquoi je vois ça », fil « Pour vous » (vues France, Région, Ma rue, et Ma rue sans commune).
- Limite : toutes les vérifications sont faites sur Chromium à 390 px. Aucun test sur iPhone réel. La simulation du daltonisme est un calcul (Machado 2009), pas un essai avec des personnes daltoniennes.

## Ce qui a été fait, bloc par bloc

**Bloc 1 — audit.** Les trois cas sont réintégrés. Ce sont des décisions à valider : la phrase « Repère ne sait pas qui vous êtes » est au niveau 2 de l'accueil, avec la phrase d'origine. La FAQ garde sa version réécrite.

**Bloc 2 — corrections de données.**
- L'exemple de vote affiche la position lue du relevé. Si les deux relevés de l'Assemblée ne se correspondent pas, pas de position, et la carte le dit.
- Le nom du producteur est « Observatoire des finances et de la gestion publique locales (OFGL) » partout (6 fichiers).
- La source du nombre d'habitants n'est pas vérifiée (BLOCAGES 26). Rien n'a été écrit à ce sujet.

**Bloc 3 — mode daltonien.**
- Votes en bleu `#0072B2` (pour), orange-vermillion assombri `#B35900` (contre), gris `#6E7781` (abstention). Le réglage est dans « Confort de lecture ».
- Le brief demandait `#E69F00` (orange) et `#999999` (gris). Refusés : `#E69F00` donne 2,25:1 sur blanc, `#999999` donne 2,85:1, sous le seuil du projet. Détail dans BLOCAGES 27 et ADR 0003.
- Le rouge normal reste `#CF222E`. Le brief demandait `#A40E26` pour « corriger le contraste ». Mesure : `#CF222E` fait déjà 5,36:1 sur blanc, et `#A40E26` fait 2,14:1 sur la carte sombre. Le seuil du projet est 3:1. Le rouge n'a pas été changé (décision A2 de l'ADR 0003).
- Invariant 7 amendé dans CLAUDE.md et AGENTS.md (copies identiques), sceau régénéré. **Le texte inscrit diffère des valeurs du brief** : à confirmer par le CEO.

**Bloc 4 — titres-conclusions.** Les titres sont calculés à partir des données, pas écrits en dur. Sur les données actuelles, le brief disait « 889 € de plus » ; le calcul donne « 716 € de plus » dans la vérification sur Chromium. Les autres exemples du brief (« 45 € sur 100 », « 503 pour, aucun contre ») n'ont pas été comparés aux données ; le titre « 503 députés ont voté pour, aucun contre » est bien calculé. Une mention « par habitant » est ajoutée à la comparaison, que le brief omettait.

**Bloc 5 — « Pourquoi je vois ça ».** Trois volets : source (producteur, date), calcul (formule en clair), pourquoi ici (ce qui fait afficher ce chiffre à cet endroit).

**Bloc 6 — « Pour vous ».**
- Contenu : scrutins de l'Assemblée, faits publiés par la rédaction, comptes de la commune retenue (dernier exercice publié).
- Filtre : la même règle que le reste de l'application (Ma rue garde le local ; Ma région cache le national ; La France tout).
- « Cette semaine » : entrées datées de moins de 7 jours. Sinon « Rien de nouveau cette semaine. » suivi des plus anciennes.
- Un exercice de comptes n'a pas de date au jour : il n'est jamais « cette semaine ».
- « Pas d'actu locale. » en Ma rue sans donnée locale, avec « Voir la France ».
- Les plus anciennes s'affichent par tranches de 10 avec « Voir plus ». Rien n'est retiré.
- Accès : lien « Pour vous › » sous « Confort de lecture » sur l'accueil. Pas d'onglet ajouté : cela changerait la navigation, ce qui relève d'une décision.

**Bloc 7 — ce rapport.**

## Écarts au brief

1. **Échéances (calendrier) absentes du fil.** Le calendrier publié liste des séances à venir, pas des nouveautés. Les y mettre demande une décision sur ce que « nouveau » veut dire pour une séance future.
2. **« Voir les archives » mène aux Actualités.** Aucune autre destination n'était définie.
3. **Couleurs du daltonisme.** Voir bloc 3 : deux couleurs du brief refusées, une demandée refusée.
4. **Palette normale sous simulation de daltonisme.** La palette normale (vert `#1F883D`, rouge `#CF222E`) donne un écart de 17 en deutéranopie, sous le seuil de 20 fixé pour la palette daltonienne. Non modifiée : c'est le choix A2 du CEO. Information seulement.
5. **Cartes de partage** : non daltoniennes, par choix. L'abstention daltonienne partage le gris de la palette normale.

## Décisions demandées au CEO

1. Réintégrer les trois cas de l'audit (bloc 1), et la phrase de la FAQ.
2. Valider l'invariant 7 : le texte inscrit (bleu `#0072B2`, vermillion `#B35900`, gris `#6E7781`) remplace le brief (`#E69F00`, `#999999`).
3. Confirmer le rouge normal `#CF222E` (ADR 0003, A2).
4. Choisir le nom officiel de l'OFGL.
5. Source du nombre d'habitants (INSEE) : non vérifiée.
6. « Pour vous » : lien sur l'accueil ou onglet dans la barre de navigation ?
7. Échéances dans le fil : oui sous quelle règle, ou non ?
8. Destination de « Voir les archives ».

## Ce qui reste

- **Vague 2** : actualités par flux RSS ; concrétisation des budgets (lecture des montants en pourcentages et en projets concrets).
- **AMO30** : fichier des groupes politiques de l'Assemblée. Il doit être téléchargé à la main (URL dans `outils/collecte.py`, ligne 59). Sans lui, les groupes restent « Inconnu ». Aucune table n'a été écrite de mémoire : ce serait une donnée inventée.
- **Données publiées non versionnées** : l'audit ne peut pas comparer budgets, votes et actualités entre V15 et V20 (voir `docs/audit-progressive-disclosure.md`).

## Top 5 à tester sur iPhone

Les profils Marie, Karim et Thomas ne sont définis nulle part dans le dépôt. Les trois profils de RESUME-v28 sont gardés : une personne âgée peu à l'aise avec le tactile, une personne malvoyante qui règle la taille du texte, une personne qui veut seulement savoir qui la représente.

1. **« Pour vous » en Ma rue** (personne malvoyante, taille 22) : le titre « Pas d'actu locale. » se lit sans coupure, et « Voir la France » change la vue sans perdre la page.
2. **Pourquoi je vois ça** (personne âgée) : le « ? » est assez grand pour être trouvé du pouce, et la feuille se referme sans piège.
3. **Vote, accueil** (personne qui veut savoir qui la représente) : « X a voté pour. » est compris sans lire le décompte ; le décompte se déplie.
4. **Mode daltonien** (réglage dans « Confort de lecture ») : le bleu et l'orange se distinguent sur le téléphone réel. Ce n'est vérifié que par simulation.
5. **Budget, accueil** : « Voir plus » déplie la comparaison ; « Tout voir » ouvre la feuille ; « Fermer » la referme sans perte de position.

## Note

La branche `test/sdk58-expo-go` est prête pour une fusion vers `main` **à valider par le CEO**. Rien n'a été fusionné.
