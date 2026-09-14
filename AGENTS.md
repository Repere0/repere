# Repère

Contexte complet du projet, à lire avant toute action :

@CONTEXTE_PROJET.md

Rappels courts, au cas où l'import ne serait pas suivi :

- Mesurer plutôt que supposer. Un chiffre non mesuré s'écrit comme non mesuré.
- Toute ancre de patch se compte avant d'écrire : `assert src.count(ancre) == 1`.
- Un garde-fou se prouve en le cassant.
- Apostrophe typographique interdite dans le code ; accents obligatoires dans le
  texte affiché.
- Le banc est le verrou :
  `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node test_repere.mjs <cible>`
- Dire ce qui ne va pas plutôt que ce qui arrange.

---

## COMMANDES DESTRUCTIVES — RÈGLE ABSOLUE

**Incident du 14/09/2026 : `git checkout -- .`, tapé pour nettoyer un répertoire de
mesure, a effacé une demi-journée de modifications non enregistrées.** Seuls les
fichiers non suivis ont survécu. Le travail a pu être rejoué de mémoire dans la même
session ; il aurait tout aussi bien pu être perdu.

**Ces quatre commandes ne s'exécutent jamais sans sauvegarde explicite :**

```
git checkout -- .        git checkout .         git restore .
git reset --hard         git clean -fd          git stash (sans nom)
```

**La séquence obligatoire avant TOUTE commande qui peut écraser du travail :**

1. `git status --porcelain` — s'il renvoie quelque chose, on ne détruit pas ;
2. lire la liste des fichiers modifiés, un par un, et dire ce qu'on s'apprête à perdre ;
3. **poser un point de sauvegarde** : `git add -A && git commit -m "wip: point de
   sauvegarde avant <opération>"` — un commit de travail se réécrit, un fichier effacé
   ne se retrouve pas ;
4. seulement alors, et **en nommant le fichier** : `git checkout -- <chemin précis>`,
   jamais `.`

**Commiter tôt et souvent coûte moins cher que rejouer.** Dès qu'un lot de travail
passe le banc, il se commite — même incomplet, même avec un message provisoire.

**Corollaire pour le nettoyage :** un répertoire de mesure (`data/`, `dist/`) se
supprime avec `rm -rf` sur le chemin nommé, pas avec une commande git qui touche à
l'index. Les deux ne font pas la même chose et la seconde emporte le code avec elle.

**Un agent autonome est autonome, pas imprudent.** L'autonomie porte sur les
décisions réversibles ; une destruction n'en est pas une.

---

## LE CYCLE DE DÉVELOPPEMENT — ON NE SAUTE AUCUNE ÉTAPE

```
DISCOVERY → HYPOTHÈSE → UX → PROTOTYPE → RED TEAM → BUILD → QA → MESURE → SHIP
```

**Ce qui est interdit : passer de « on a trouvé une donnée » à « créons un onglet ».**
C'est ce qui s'est produit pour la surface datée : la source était vérifiée, le code
est propre, le banc passe — et personne n'avait encore répondu à « est-ce que ça veut
dire quelque chose pour quelqu'un qui ne suit pas la politique ? ».

Pour chaque étape, ce qui doit exister **par écrit** avant de passer à la suivante :

| étape | ce qu'elle produit |
|---|---|
| DISCOVERY | la source, sa licence, sa couverture, sa fraîcheur, son rattachement à la commune |
| HYPOTHÈSE | la question citoyenne à laquelle elle répond, et comment on saura qu'on s'est trompé |
| UX | l'écran en mots : ce qu'on lit en dix secondes, dans quel ordre, et la phrase de vide |
| PROTOTYPE | la plus petite chose montrable — pas la fonctionnalité entière |
| RED TEAM | l'attaque : ce qu'un lecteur comprend de travers, ce qui ressemble à un jugement |
| BUILD | le code, et le contrôle écrit **en même temps** que la correction |
| QA | le banc, statique et navigateur, sur une donnée qui exerce vraiment le code |
| MESURE | le poids, la couverture, le nombre d'étapes — des chiffres, pas des impressions |
| SHIP | et seulement là |

**LE PRODUIT N'EST NI LE CODE, NI LA DONNÉE, NI L'INTERFACE. C'est la valeur comprise
et utilisable par un citoyen.** Une fonctionnalité techniquement excellente et faible
en produit se supprime, quel qu'ait été le travail investi. Le coût déjà payé n'est
pas un argument.
