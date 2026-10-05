# Audit produit — 29 septembre 2026

Données locales du dépôt, extraites comme sur le runner (seul le calendrier du
Sénat manque : le conteneur ne joint pas senat.fr). Mesures faites dans un vrai
navigateur, à 360, 390 et 1280 px. Tout est rejouable :

```bash
cd mono && node scripts/serveur-statique.mjs apps/web/dist 4174 &
node scripts/audit-premier-ecran.mjs      # les six questions au premier écran, 15 communes
node scripts/parcours-decembre.mjs        # le parcours testeur, 9 étapes
```

## 1. La collecte

- Dernier échec : run 36451203180 (28/09, 16 h 27 UTC, commit `aff801c`), étape
  « Exécuter la chaîne ». Un seul contrôle, ajouté le même jour par #30,
  mesurait une hauteur d'écran (9 836 px sur le runner) : il mesurait donc le
  volume du calendrier, pas le comportement de l'écran. Il a été corrigé par #31
  (fusionnée le 28/09 à 19 h 29 UTC). Rien de faux n'a été publié.
- `main` est éprouvée verte le 29/09 (run 36551920677, données du jour).
- Défaut de fond : la cause n'était lisible que dans le journal complet. Corrigé
  par #40 : tout échec remonte en annotation.
- Piège constaté : la concurrence « une épreuve à la fois » annule les épreuves
  **en attente** quand une nouvelle arrive (GitHub ne garde qu'une attente par
  groupe). Si plusieurs PR sont ouvertes en même temps, certaines épreuves sont
  « cancelled » et doivent être relancées.
- La collecte planifiée (`47 5 * * *`) part en pratique entre 10 h et 12 h UTC.

## 2. Ce que voit un nouveau venu

**Premier écran** (390 × 844) : une promesse, un seul champ « Où habitez-vous ? ».
C'est clair et ça tient en vingt secondes.

**Une fois la commune choisie**, l'écran ouvert par défaut est désormais « Aujourd'hui » (PR #79).

| entrée après le choix de la commune | questions répondues sans défiler (sur 6) |
|---|---|
| « Aujourd'hui » (défaut, PR #79) | **4,8** — 6/6 pour les communes sans projet local |
| « Qui décide » | approfondissement des élus et du territoire |

Sur 15 communes (dans chaque département de la bêta, une avec projet financé,
une sans). « Qu'est-ce qui se passe chez moi » : 0/15 par défaut, 15/15 sur
« Aujourd'hui ».

**Parcours testeur de décembre** (Aubervilliers, vraies données) : 8 étapes sur
9 aboutissent, en 4 gestes. Celle qui échoue est la 9 : au retour, seul le
département est rappelé, et la commune doit être choisie à nouveau.

## 3. Problèmes, classés

| | problème mesuré | état |
|---|---|---|
| P0 | un échec de la collecte ne se lit que dans le journal complet | #40 |
| P1 | trois lignes disent où l'on est ; premier contenu à 544 px sur 800 | #41 (428 px) |
| P1 | « Aujourd'hui » : 3 lignes de source sur 4 sans lien ; « Où va l'argent » : 3 sur 4 | #42 (4/4) |
| P1 | l'écran par défaut répondait à 2 questions sur 6 ; « Aujourd'hui » en couvre 4 à 5 | **corrigé par #79** |
| P1 | au retour, la commune n'était pas rappelée | **corrigé par #79, session locale** |
| P2 | la barre des 5 écrans prend 3 lignes à 360 et 390 px (≈ 150 px) | non touché : le défilement horizontal a déjà été écarté (on ne voyait pas qu'il y avait une suite) ; seule piste restante, des libellés plus courts, qui sont une décision de formulation |
| P2 | « Ce qui a été décidé » fait 10 hauteurs d'écran à 360 px ; « Ce qui se passe », 8 | à faire |
| P2 | « Aujourd'hui », commune avec projet : le « à venir » passe sous la ligne de flottaison | à faire |
| P3 | les intitulés de projets sans accents (« Renovation ») : recopiés tels quels, c'est voulu | — |

## 4. « Aujourd'hui » : argumentaire

- **Rôle actuel** : l'écran ouvert après le choix de la commune. Il répond d'abord à
  « qu'est-ce qui se passe chez moi ? », puis laisse approfondir vers les autres écrans.
- **Ce qu'il fait bien, mesuré** : il répond à « qu'est-ce qui se passe chez
  moi » pour 15 communes sur 15 (vote du député de la circonscription, projet
  financé dans la commune), avec une source visible, et à « qu'est-ce qui
  arrive » pour les communes sans projet. Il dit « rien de nouveau depuis votre
  visite » quand c'est le cas.
- **Ses limites, mesurées** : aucun fait local de moins de 30 jours n'existe
  aujourd'hui (le dernier vote solennel date du 21 juillet). La « nouveauté »
  dépend du rythme du Parlement et du fil éditorial, pas de la technique.
- **Proposition** : ouvrir « Aujourd'hui » après le choix de la commune, et
  garder la barre des écrans pour approfondir. Confiance : **moyenne-haute**
  sur la compréhension (mesure à 15 communes) ; **faible** sur le retour, qui
  ne se mesurera qu'avec les testeurs.

## 5. Le parcours de décembre (2 minutes)

1. « Où habitez-vous ? » → la commune.
2. Qui décide : maire, adjoints, ce que décide la commune.
3. Aujourd'hui : ce qui s'est décidé près de chez vous.
4. Un projet concret, avec son montant et son exercice.
5. Le député élu dans la circonscription, et ce qu'il a voté.
6. Un vote : résultat, lien vers le scrutin.
7. Ce qui arrive cette semaine.
8. La source, cliquable.
9. Le retour navigateur : **la commune choisie est conservée pendant la session.**

`scripts/parcours-decembre.mjs` joue ces neuf étapes et échoue tant qu'une
seule ne tient pas.
