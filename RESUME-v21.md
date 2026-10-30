# RESUME v21 — 30/10/2026

Branche : `test/sdk58-expo-go`, sans push forcé.

Avant chaque commit :
- tests partagés à 251/251 et invariants à 0 erreur ;
- pour le code, en plus : `tsc` à 0 erreur, parcours navigateur à 222/222, cartes de partage sans aucun échec.

## Commits

| Commit | Bloc |
|---|---|
| 2b461ab | 1 — décisions CEO D29, D30 et D31, format JSON, procédure du dimanche |
| 2d4606c | 2 — libellé du groupe unifié, bloc « Cette semaine à [Commune] », carte « Actualité locale », test des cartes |
| b454166 | 3a — gabarit `data/actus-hebdo.json` (3 communes pilotes), copie dans la chaîne de publication |
| 884ecab | 3c — checklist finale avant envoi (`docs/checklist-distribution.md`) |
| 643fa53 | 3d — actu Melun non trouvée, fichier laissé vide (BLOCAGES 22 bis) |
| (ce commit) | 4 — ce rapport |

Les blocs 3b et le début de 3c ne sont pas arrivés : les deux messages V21 sont tronqués. Pour 3c, je n'ai que le titre du commit, et j'ai rédigé la checklist d'après les 6 étapes du bloc 4.

## Checklist distribution — 6 étapes pour minuit

1. `gh workflow view collecte.yml` — vérifier la garde : `HORS_MAIN` doit conditionner le jeton du robot, le commit, Netlify et l'issue.
2. `gh workflow run collecte.yml --ref test/sdk58-expo-go` — depuis la branche, la chaîne **ne publie rien**. Elle dépose seulement l'artefact `collectes-essai`.
3. Lire le résumé de l'exécution, section « Bilan des collectes » : couverture des sites de mairies, des photos et des agrégats régionaux.
4. Remplir `data/actus-hebdo.json` pour Melun (77288), avec un texte écrit par le CEO (D29).
5. `git commit` + `git push`, **puis demande de fusion vers `main` et fusion**. ⚠️ Sans la fusion, l'actu n'atteint pas les testeurs : l'application lit les données du site public, qui n'est publié que depuis `main`.
6. Tester l'application sur son iPhone (Melun → « Cette semaine à Melun »), puis envoyer aux 5 premiers testeurs.

**Écart à signaler** : l'étape 5 telle qu'écrite dans la brief (« commit + push ») ne suffit pas. Il faut la fusion sur `main`, puis la collecte planifiée (05 h 47 UTC) ou une collecte lancée à la main depuis `main`. Sinon, ce soir, le bloc reste caché chez les testeurs. Rien de faux ne s'affiche, mais la fonction n'est pas montrée.

## Ce qui reste bloqué

- **Actus hebdo manuelles** : `data/actus-hebdo.json` est vide pour les 3 communes. Aucune actu Melun vérifiable des 7 derniers jours n'a été trouvée : le site de la ville ne date pas ses articles. Le seul élément récent est un avis de décès d'un adjoint au maire, laissé au choix du CEO (BLOCAGES 22 bis).
- **D29 contre la demande du bloc 3d** : D29 exclut l'IA générative pour les actus, alors que le bloc 3d demandait à Claude de rédiger titre et résumé. Je n'ai rien rédigé. À trancher si l'intention a changé.
- **Collecte** : la couverture réelle (sites de mairies, photos) reste inconnue tant que `collecte.yml` n'a pas tourné. `gh` n'est pas authentifié dans cette session, je n'ai donc pu lancer ni l'étape 1 ni l'étape 2.
- **Promesse « Repère publie chaque lundi »** : elle est visible dès que le fichier est publié. Chaque semaine sans actu fusionnée avant lundi matin affichera l'état vide.

## Top 5 à vérifier sur iPhone

1. **Partage d'une carte** (élu, budget, actu) : l'image produite par react-native-view-shot fait-elle bien 1080×1920 et est-elle lisible dans Messages ou Instagram ? Seul le rendu navigateur est prouvé.
2. **« Cette semaine à Melun »** : après fusion et publication, le bloc apparaît-il sous les trois réponses, avec un lien source qui ouvre bien le site de la ville ?
3. **Premier écran d'Aujourd'hui** : les trois réponses tiennent-elles sans défiler sur un petit iPhone (SE ou mini) ? Elles sont mesurées sur le web, pas sur l'appareil.
4. **Photos des élus et crédit** : chargement, mention de licence lisible, aucune photo cassée. La collecte n'a encore jamais tourné.
5. **Mode sombre et taille de texte agrandie** (Réglages iOS → Affichage → Taille du texte) : rien ne déborde, et les couleurs de vote restent lisibles.
