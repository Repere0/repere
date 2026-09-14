# REPÈRE — REGISTRE DES HYPOTHÈSES

Une hypothèse n'est pas vraie parce qu'elle semble logique. Chacune porte ici la façon dont on
pourrait la faire mentir. **Statut `non testée` est une réponse honnête ; « évidemment vrai » ne
l'est pas.**

---

## H1 — Un citoyen veut d'abord savoir ce qui a été DÉCIDÉ, pas qui décide

**Pourquoi on le croit** : le produit répond aujourd'hui très bien à « qui décide » et personne
ne revient. La question spontanée d'un habitant est « qu'est-ce qui se passe », pas « quel est
l'organigramme ».
**Comment la tester** : dans le banc de décembre, demander aux dix personnes, avant toute
démonstration, d'écrire la première question qu'elles se posent sur leur commune. Ne pas
proposer de liste.
**Signal attendu** : une majorité de questions portant sur un fait ou un projet, pas sur une
personne.
**Signal qui la tue** : une majorité de questions du type « c'est qui mon maire / mon député ».
**Résultat** : non testée.
**Décision** : la surface datée est construite en pariant sur H1, mais « Qui décide » reste en
deuxième onglet et n'est pas dégradé. Le pari est réversible : c'est l'ordre des onglets.

---

## H2 — La vérifiabilité est perçue, pas seulement présente

**Pourquoi on le croit** : c'est la proposition de valeur. Mais la preuve est aujourd'hui écrite
deux à trois crans plus petit que ce qu'elle prouve, en langue de producteur (« ODbL 1.0 »,
« Observatoire des finances et de la gestion publique locales »).
**Comment la tester** : question 3 du banc — « y a-t-il un chiffre que tu ne crois pas ? » ; puis
demander à la personne de prouver un chiffre de son choix, sans aide.
**Signal attendu** : elle trouve le lien et l'ouvre en moins de trente secondes.
**Signal qui la tue** : elle ne voit pas la source, ou la voit et ne comprend pas ce qu'elle dit.
**Résultat** : non testée.
**Décision** : reformuler la source en langue citoyenne (« D'où vient ce chiffre ? Publié par
l'État, le 29 juillet 2026. Vérifier ↗ ») **avant** le banc, pour tester la bonne version.

---

## H3 — Un projet financé nommé vaut mieux qu'un budget agrégé

**Pourquoi on le croit** : « 9,9 M€ de dépenses de fonctionnement » ne se retient pas.
« 180 000 € pour la rénovation de l'école Jean-Moulin » se raconte au dîner.
**Comment la tester** : montrer les deux écrans à cinq personnes, demander le lendemain ce
qu'elles ont retenu.
**Signal attendu** : le projet nommé est cité, le montant agrégé non.
**Signal qui la tue** : personne ne se souvient d'aucun des deux, ou le projet paraît anecdotique
(« et alors ? »).
**Résultat** : non testée.
**Risque identifié** : la source ne porte que l'**année**, pas le jour. Un fait de 2025 affiché en
décembre 2026 peut sembler vieux. À écrire honnêtement : « exercice 2025 ».

---

## H4 — Le bouton Retour d'Android est un point de sortie involontaire

**Pourquoi on le croit** : l'application n'avait pas de gestion d'historique ; en PWA installée,
le geste système le plus courant la fermait.
**Comment la tester** : observer, sans le dire, si un testeur sort de l'application pendant la
session.
**Signal attendu** : zéro sortie involontaire après correction.
**Résultat** : **corrigé et mesuré en banc** (deux niveaux de retour, l'application reste
ouverte). Reste à confirmer sur un vrai téléphone Android.
**Décision** : garder le contrôle navigateur qui le vérifie à chaque exécution.

---

## H5 — Les gens cherchent leur commune, pas leur département

**Pourquoi on le croit** : personne ne pense « j'habite dans le 93 ». Trois étapes du parcours sur
dix n'existaient que par le découpage des fichiers.
**Comment la tester** : chronométrer le temps entre l'ouverture et l'affichage de sa commune.
**Signal attendu** : moins de vingt secondes sans aide.
**Résultat** : **corrigé** — le premier écran pose une seule question, 106 cibles ramenées à 2.
Le temps réel reste **non mesuré sur un humain**.

---

## H6 — Un quiz ne fait pas revenir un citoyen sur un produit civique

**Pourquoi on en doute** : le jeu occupe un onglet sur cinq du produit en ligne, et son libellé a
même pris le nom de la question fondatrice. Mais c'est aussi le seul levier de retour existant,
et la série de jours est bâtie dessus.
**Comment la tester** : en bêta, demander aux testeurs ce qui les ferait rouvrir l'application
dans une semaine — sans suggérer de réponse.
**Signal attendu** : si le jeu n'est jamais cité spontanément, il ne mérite pas une place
permanente.
**Résultat** : non testée.
**Décision provisoire** : sorti de la barre, conservé en carte « La question du jour ». Réversible.

---

## H7 — Une commune sur quatre mal orthographiée décrédibilise le produit

**Pourquoi on le croyait** : le nom de sa commune est la première chose qu'un habitant reconnaît.
9 198 communes sur 34 637 s'écrivaient « Choisy-Le-Roi » ou « Evry-Courcouronnes ».
**Résultat** : **corrigé**, mais l'effet sur la confiance est **non mesuré** — c'est une hypothèse
de bon sens, pas un fait établi. À ne pas citer comme une victoire mesurée.

---

## H8 — La couverture n'est pas ce qui bloque l'adoption

**Pourquoi on le croit** : couverture mesurée en Île-de-France — maire 100 %, circonscription
100 %, député 100 %, votes 99,6 %, comptes 100 %. Et pourtant personne n'utilise le produit.
**Conséquence si vraie** : tout effort supplémentaire de couverture est du temps mal employé
tant que la compréhension et la publication ne sont pas réglées.
**Comment la tester** : le banc de décembre. Si aucun testeur ne bute sur une donnée manquante,
H8 est confirmée.
**Résultat** : non testée, mais **la mesure de couverture, elle, est établie**.
