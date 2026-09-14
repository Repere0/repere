# REPÈRE — REVUE PRODUIT N° 1
**14 septembre 2026. Écrite en réponse à une seule question :**

> *« Est-ce que la version que nous sommes en train de construire est réellement la
> meilleure expérience possible pour un citoyen francilien ? »*

**La réponse est non.** Ce document dit pourquoi, avec des mesures, et ce qu'il faut
changer. Il ouvre trois décisions déjà prises (D-01, D-03, D-08) parce que la preuve
existe maintenant de les rouvrir.

Tous les chiffres qui suivent ont été mesurés le 14/09/2026 sur le dépôt réel, un
clone vierge, un navigateur réel. Ce qui n'a pas pu être vérifié est écrit
« non vérifié ».

---

## A. ÉTAT TECHNIQUE

### Ce qui est solide, et mesuré

| | mesure |
|---|---|
| contrôles statiques | **49 / 49** |
| contrôles navigateur | **79 / 79**, sept écrans, thème clair et sombre, hors ligne |
| poids du parcours complet | **110,1 Ko** compressés, puis aucune requête |
| couverture Île-de-France | maire 100 %, circonscription 100 %, député 100 %, votes 99,6 %, comptes 100 %, sur 1 262 communes |
| libellés de communes | 9 198 redressés, appariement 100 % avec le Code officiel géographique |
| installable | Android **et** iOS (métas iOS présentes) |
| chaîne rejouable de zéro | oui — clone vierge + paquet → tout passe, vérifié deux fois |

### Ce qui n'est pas solide

**Rien n'est publié.** Le monorepo n'a pas d'URL. Aucune tâche planifiée ne tourne :
GitHub ne les exécute que sur la branche par défaut, et le travail vit sur
`audit-finalisation-repere`. **Donc la collecte des projets financés n'a jamais
tourné une seule fois** — l'écran construit hier affiche, en test, une fixture.

**Deux blocages humains, et deux seulement.** Vérifié : `public/data/deputes.json`
n'existe plus, et la version corrigée de `build-publish.yml` est déjà en place. Il
reste la fusion dans `main` et les trois secrets Cloudflare.

### Trois défauts techniques trouvés aujourd'hui, dont deux armés

**A-1. Les positions de vote sont appariées par RANG, pas par identifiant.**
`pos.positions[acteurRef][i]` où `i` est l'indice dans le catalogue. Aucune garde :
ni `suite.length === cat.scrutins.length`, ni appariement par numéro de scrutin, ni
comparaison des deux `releve_le`. Or **D-12 prévoit explicitement** qu'un relevé
manquant soit remplacé par celui de la veille. Le jour où le catalogue gagne un
scrutin et où le fichier de positions échoue, **toutes les positions affichées
glissent d'un rang** — « Pour » sur un texte rejeté, sur un élu nommé, sans aucun
signal. Aujourd'hui les deux dates coïncident (26/08/2026) et les positions sont
justes : le défaut est **armé, pas déclenché**. Il concerne les deux écrans de votes,
pas seulement le nouveau.

**A-2. Le patronyme seul est affiché, alors que le prénom est dans le fichier.**
`qui: d.nom`. Conséquence mesurée : le maire de Paris dans nos données est
**Emmanuel GRÉGOIRE** ; la députée de la 12ᵉ de Paris est **Olivia Grégoire**. Sur
l'écran de Paris, « Grégoire a voté Contre » est lu comme une position du maire. Deux
personnes, deux familles politiques. **15 patronymes sont partagés par plusieurs
députés** au national (`Rousseau` → Sandrine 75-9 et Aurélien 78-7 ; `Cazeneuve` →
Jean-René 32-1 et Pierre 92-7). Imputer publiquement à une personne identifiée une
position qu'elle n'a pas prise, c'est le terrain de la diffamation, et le fichier
permettait de l'éviter en une ligne.

**A-3. Le comptage de faits est faux dès qu'une commune a plusieurs députés.**
Le fil boucle sur toutes les circonscriptions : **Paris annonce 144 « faits » de vote
pour 8 textes**. 118 communes en France, dont 2 dans le 93, sont concernées.

### Une contradiction de gouvernance à trancher

`collecte.yml` fait `git add -A`, `git commit`, `git push` **et tourne sur la branche
par défaut**, donc sur `main`, tous les matins. `main` ne peut donc pas être à la fois
« protégée contre les scripts automatiques » et la branche qu'une tâche automatique
commite chaque jour. **Avertissement** : activer naïvement la protection de branche
côté GitHub **casserait la collecte quotidienne en silence** — il faut soit excepter
le robot d'Actions, soit faire commiter la collecte sur une branche de données.
Ce n'est pas un détail d'infrastructure, c'est le seul automatisme vivant du produit.

### Ce qui est désormais prouvé sur `main`

`pousser.bat` v7 refusait de commiter sur `main`, mais c'est un script : `git commit`
tapé à la main le contournait. Les gardes vivent maintenant dans git
(`outils/gardes/`, branchées par `core.hooksPath`, versionné). **Six propriétés
éprouvées en cassant, sur un clone neuf :**

| test | attendu | obtenu |
|---|---|---|
| commit sur `main` sans la variable | refus, aucun commit créé | ✅ code 1, `HEAD` inchangé |
| le même commit avec `REPERE_FUSION=1` | accepté | ✅ |
| commit sur une branche de travail | accepté | ✅ |
| push vers `refs/heads/main` | refus, référence non créée | ✅ code 1 |
| push vers une branche de travail | accepté | ✅ |
| push vers `main` avec la variable | accepté | ✅ |

Un contrôle du banc vérifie en outre **qu'aucun script du dépôt ne pose
`REPERE_FUSION`** : la sortie doit rester un geste humain, sinon le premier
automatisme désarme la garde — qui est exactement la faute d'origine.

**Ce qui reste non vérifié, et je ne l'arrondis pas : la protection de branche côté
GitHub.** L'API GitHub est refusée à cette session (`403 : repository not in this
session's authorized set`). À vérifier à la main, en trois clics :
*Settings → Branches → Add rule* sur `main`, puis relire l'onglet Actions le lendemain
matin pour confirmer que la collecte passe toujours.

---

## B. ÉTAT UX

### L'inventaire réel, écran par écran

#### 1. ÉCRAN D'ENTRÉE
**Objectif** — obtenir la commune, et rien d'autre.
**Cible** — tout le monde.
**Question** — « Où habitez-vous ? »
**Action principale** — taper les premières lettres d'une commune.
**Données** — `communes-beta.json` (1 262 communes, 10 Ko gz) et `index.json` (104 départements).
**Source** — Code officiel géographique (Etalab/DINUM) pour les libellés.
**Problèmes UX** — aucun majeur. **C'est le meilleur écran du produit** : une
question, deux cibles cliquables, la phrase de confidentialité au bon endroit. Un
seul défaut : le texte d'exemple du champ propose *« Ustaritz, Bayonne »* — deux
communes du Pays basque dans une application dont la bêta est l'Île-de-France.

#### 2. « CE QUI A ÉTÉ DÉCIDÉ » (construit le 14/09)
**Objectif** — donner une raison de rouvrir l'application.
**Cible** — visée : l'habitant qui ne suit pas la politique.
**Question** — « Qu'est-ce qui a été décidé chez moi ? »
**Action principale** — lire. Aucune autre.
**Données** — `projets/{dep}.json` (DGCL) + `scrutins.json` + `scrutins/{dep}.json` + `deputes.json`.
**Source** — DGCL (LOv2, publication du 24/07/2026) et Assemblée nationale (relevé du 26/08/2026).
**Problèmes UX** — voir section suivante. **C'est l'écran le plus défaillant du produit.**

#### 3. « QUI DÉCIDE »
**Objectif** — nommer les élus et dire ce que chaque échelon décide.
**Cible** — tout le monde.
**Question** — « Qui décide chez moi, et de quoi ? »
**Action principale** — déplier « Comment X a voté à l'Assemblée ».
**Données** — maire et adjoints (`departments/{dep}.json`), circonscription, député, 80 scrutins.
**Source** — Répertoire national des élus, Ministère de l'Intérieur (découpage 2010), Assemblée nationale.
**Problèmes UX** — les six phrases de compétence sont la meilleure écriture du
produit (« le département décide des collèges, des routes et des aides sociales »).
Deux défauts : la profondeur des votes est bonne mais la position du député est
affichée dans une colonne de droite qui se lit comme un verdict (voir C) ;
et **« Position non portée » concerne 17,0 % des positions solennelles**
(781 sur 4 592) et **68,3 % des députés** — c'est la ligne la plus fréquente du
produit après les titres de loi, et rien n'explique qu'elle ne veut pas dire « absent ».

#### 4. « OÙ VA L'ARGENT »
**Objectif** — dire ce que la commune encaisse, dépense et doit.
**Cible** — tout le monde.
**Question** — « Combien, et pour quoi ? »
**Action principale** — lire, et déplier « Ce que ces chiffres veulent dire ».
**Données** — six agrégats par exercice : *Ce qu'elle encaisse · dépense · doit · investit · paie en salaires · lève en impôts*.
**Source** — Observatoire des finances et de la gestion publique locales, LOv2, mise à jour du 29/07/2026.
**Problèmes UX** — **c'est le meilleur écran du produit, et de loin.** Les six libellés
sont en langue citoyenne, les barres ne comparent que la commune à elle-même, et la
phrase le dit à l'écran (« Repère ne compare jamais deux communes »). Un seul reproche :
six montants à sept chiffres d'affilée sans aucun repère de grandeur — un habitant ne
sait pas si 172 millions pour 89 662 habitants est beaucoup, et **il n'a pas le droit
de le savoir** sans franchir une des trois portes de P16. C'est une limite assumée, pas
un défaut.

#### 5. « SOURCES »
**Objectif** — porter la doctrine et la provenance de chaque jeu.
**Cible** — le lecteur méfiant, le journaliste, l'élu.
**Question** — « D'où vient cette information ? »
**Action principale** — suivre un lien vers la source.
**Données** — sept sources déclarées : élus, comptes, circonscriptions, territoires, communes, députés, scrutins (+ projets quand la collecte a tourné).
**Problèmes UX** — un écran de doctrine occupe 25 % de la navigation permanente.
D-04 avait décidé sa rétrogradation ; elle n'a pas été faite.

### Les parcours

| parcours | étapes | mesuré |
|---|---|---|
| trouver son maire | ouvrir → taper → choisir → lire | **4**, 103,5 Ko |
| savoir comment son député a voté | + onglet + déplier | **6**, 107,0 Ko |
| voir les comptes | + onglet | **5**, 106,6 Ko |
| tout le parcours | — | **110,1 Ko** |

### Les états vides et d'erreur

**17 occurrences du composant `Vide`**, chacune avec une phrase distincte, et six
états nommés (`absent`, `en cours`, `servi`, `échec`, `hors ligne`, `introuvable`).
C'est un point fort réel : « pas encore arrivé sur cet appareil » ne dit pas la même
chose que « la source ne le porte pas ». **Un trou, majeur** : la doctrine du vide
n'est honorée que pour l'absence **totale**. Sur « Ce qui a été décidé », si les
projets manquent mais que les votes arrivent, **aucune phrase ne dit que l'État n'a
rien financé** — le lecteur ne peut pas distinguer « rien » de « pas su ».

### LE DÉFAUT UX N° 1 DU PRODUIT, ET IL EST SUR TOUS LES ÉCRANS

**Le sélecteur de commune reste entièrement déplié au-dessus de chaque écran, après
le choix.** Mesuré sur la capture d'Aubervilliers : le sélecteur de département, le
champ de recherche et **39 pastilles de communes** occupent ~2 hauteurs d'écran avant
le premier contenu, sur **les quatre onglets**. Le produit a mesuré et célébré
« 106 cibles → 2 » à l'ouverture ; il les a laissées revenir dès le deuxième écran.
C'est la correction la moins chère et la plus rentable du document, et elle bénéficie
aux quatre écrans à la fois.

---

## C. ÉTAT UI

**Ce qui tient.** Plancher typographique 13 px sur sept écrans, zéro cible sous
44 px, contraste ≥ 3:1 en thème sombre, `prefers-reduced-motion` respecté sans
JavaScript, palette d'échelons gelée, aucune police distante.

**Ce qui ne tient pas.**

**C-1. La colonne de droite est un rail de verdicts.** Sur chaque vote, la position
(« Pour », « Contre », « Abstention ») est poussée à droite, en gras, `white-space:
nowrap`, ce qui casse la phrase de gauche en deux. Résultat mesuré à l'œil : on lit
« Texte adopté le 21 juillet 2026 · » puis, isolé, **« Abstention »**, puis « 378 pour,
7 contre, 173 abstentions » juste en dessous. **Un lecteur non politisé lit
« Abstention » comme le résultat du scrutin**, pas comme la position de son député.
Le seul chiffre qui compte sur l'écran est aussi le plus ambigu. Et huit verdicts
alignés dans une colonne scannable forment une capture d'écran prête à l'emploi.

**C-2. Le code couleur ment sur un écran.** Chaque fait porte un `echelon` calculé
(`ville` pour un projet, `france` pour un vote) — **et il n'est jamais lu.** La carte
entière est peinte `echelon="ville"`, filet bleu compris, y compris sur huit lois
nationales. `QuiDecide.jsx` peint correctement sa carte nationale en `france`. Le
seul signal visuel capable de dire « ceci est chez vous, cela est partout » est
produit puis jeté.

**C-3. P12 est appliqué au-delà de son domaine.** Le principe interdit de
hiérarchiser deux objets **de même nature**. Il a été appliqué à un gymnase rénové à
400 mètres et à une loi qui s'applique à 68 millions de personnes, au motif que ce
sont « deux faits datés ». Égaliser leur typographie impose une équivalence fausse.
**Distinguer une échelle n'est pas porter un jugement** ; c'est la seule information
dont le lecteur a besoin pour savoir laquelle des deux le concerne.

**C-4. Le badge « 12 FAITS » est un score comparable entre communes.** Aubervilliers
« 12 FAITS », Bagnolet « 8 FAITS ». Le nombre de votes est une constante nationale :
le total est donc une fonction directe du nombre de projets. C'est un chiffre unique,
mis en exergue dans un badge, qui classe les communes — **exactement ce que D-13
interdit**. La garde de l'invariant 3 cherche des mots dans le code ; elle ne peut pas
voir ça.

**C-5. Quatre onglets débordent sur deux lignes** à 390 px. Un cinquième est
impossible.

---

## D. ARCHITECTURE DE NAVIGATION ACTUELLE

```
[ Ce qui a été décidé ]  [ Qui décide ]      ← ligne 1
[ Où va l'argent ]       [ Sources ]         ← ligne 2 (déborde)
```

Quatre onglets, dont un (« Sources ») est un écran de doctrine que D-04 avait décidé
de rétrograder, et un (« Ce qui a été décidé ») dont 73 % de la hauteur est une donnée
nationale identique à toute la circonscription.

**Ce que la navigation actuelle promet et ne tient pas :** quatre questions de rang
égal, alors qu'il n'y en a que trois qui aient une donnée derrière elles.

---

## E. ARCHITECTURE DE NAVIGATION RECOMMANDÉE

### Les quatre propositions, notées

Barème : ✅ tient · 🟠 fragile · ❌ ne tient pas.

| critère | **A** Accueil / Près de vous / Qui décide / Agenda / Moi | **B** Accueil / Décisions / Élus / Agenda / Moi | **C** Près de vous / Qui décide / Décisions / Suivi / Moi | **D** Chez vous / Qui décide / Où va l'argent |
|---|---|---|---|---|
| compréhension au premier regard | 🟠 « Accueil » ne dit rien | 🟠 « Élus » est un annuaire | 🟠 « Suivi » suggère un compte | ✅ trois questions, trois réponses |
| pertinence pour un non-politique | 🟠 | ❌ « Décisions » et « Élus » sont du vocabulaire d'initié | 🟠 | ✅ |
| fréquence d'utilisation | ❌ « Agenda » vide | ❌ « Agenda » vide | 🟠 | 🟠 assumée : voir F |
| profondeur possible | ✅ | ✅ | ✅ | ✅ |
| charge cognitive | ❌ 5 onglets ⇒ 3 lignes à 390 px | ❌ idem | ❌ idem | ✅ 3 onglets, une ligne |
| cohérence avec la mission | ❌ « Moi » | ❌ « Moi » | ❌ « Moi » + « Suivi » | ✅ |

**« Moi » est éliminatoire, dans les trois propositions.** Repère n'a **aucun compte,
aucun courriel, et rien ne quitte l'appareil** — c'est écrit sur son premier écran et
gardé par l'invariant 2. Un onglet « Moi » promet un profil qui ne peut pas exister.
Il occuperait 20 % de la navigation pour démentir la promesse fondatrice.

**« Agenda » est éliminatoire aussi, et c'est une promesse impossible déjà
documentée.** Vérifié : il n'existe **aucune consolidation nationale des dates de
conseils municipaux** — 46 jeux de délibérations pour 34 875 communes, soit 0,13 %, et
le mode de publication légal (PDF sur le site de chaque commune) en interdit la
constitution. Un onglet « Agenda » afficherait un écran vide pour 99,9 % des communes.
C'est exactement le piège que D-20 existe pour éviter.

**« Suivi »** implique de suivre, donc des notifications, donc un compte : même
contradiction que « Moi ».

### La recommandation : **trois onglets, une seule ligne**

```
[ Chez vous ]   [ Qui décide ]   [ Où va l'argent ]
```

et **« Repère »** — sources, doctrine, question du jour, mentions légales — en lien
discret dans l'en-tête, **pas en onglet**. C'est D-04 enfin appliquée.

**Pourquoi trois et pas quatre.** Parce que trois questions seulement ont une donnée
solide derrière elles, et parce que quatre onglets débordent déjà. Une navigation est
une promesse sur ce qu'est le produit : un onglet à moitié vide dit que le produit
est à moitié vide.

**Ce que chacun devient :**

- **« Chez vous »** absorbe « Ce qui a été décidé » **et** le remplace. Les faits
  locaux, et eux seuls : projets financés par l'État, permis de construire accordés,
  conformité de l'eau, objectif SRU, équipements. Un seul critère d'admission : **le
  fait doit être propre à la commune.**
- **« Qui décide »** récupère les votes du député, qui y sont déjà, mieux cadrés,
  sous un titre qui dit leur portée nationale.
- **« Où va l'argent »** ne change pas. C'est le meilleur écran du produit.

**Ce que cela coûte :** rouvrir D-01 et D-03. La preuve qui l'autorise est mesurée —
73 % de contenu national sous un titre communal, premier fait local au quatrième
écran de défilement, et l'écran de Bagnolet identique à 94 % à celui d'Aubervilliers.

---

## F. LE « AHA MOMENT » RECOMMANDÉ

### Ce qu'il n'est pas

Ce n'est pas « voir des données sur ma commune ». Ce n'est pas non plus le fil daté :
un fil suppose qu'il se passe quelque chose de nouveau, et **la donnée publique locale
ne bouge pas à la semaine**. La surface datée d'aujourd'hui affichera en décembre, mot
pour mot, l'écran de septembre : huit lois des 20 et 21 juillet, des projets des
exercices 2024-2025. Une surface datée n'est pas une surface vivante.

### L'expérience, en une phrase

> **« Cette chose que je connais physiquement a été décidée par quelqu'un que je peux
> nommer, et je viens de l'apprendre en dix secondes. »**

C'est le seul pont que personne d'autre ne construit : entre **un lieu que l'habitant
connaît** et **une institution qu'il peut nommer**. Les données ne sont pas la valeur ;
elles sont le matériau de ce pont.

### Les dix premières secondes, concrètement

L'habitant a tapé sa commune. Il voit **deux blocs, et rien d'autre** :

**1. La phrase de pouvoir** — universelle, disponible pour les 1 262 communes, zéro
trou de données :

> **À Aubervilliers, ce sont les élus de votre conseil municipal qui décident de
> l'école primaire, de la cantine, des permis de construire et de la voirie.**

**2. Le fait de preuve** — un seul, le plus proche possible de lui :

> **Et voici une chose qu'ils ont décidée :** l'État a mis **533 466 €** pour rénover
> la halle du Montfort, sur un chantier de 1 333 667 € hors taxes. Exercice 2025.
> *D'où vient ce chiffre ? Publié par l'État le 24 juillet 2026. Vérifier ↗*

Puis, seulement en dessous : le reste, et les autres échelons.

### Ce qui rend ce moment universel : la cascade

Le fait de preuve ne peut pas dépendre d'une donnée qui manque pour la moitié des
communes. Il se choisit donc par **cascade d'availabilité**, dans cet ordre, et le
produit descend jusqu'à ce qu'il trouve :

1. **un projet financé par l'État** — le plus concret ; ~887 projets en IDF pour
   l'exercice 2025, donc **absent pour une majorité de communes** ;
2. **un permis de construire accordé récemment** — Sitadel, série **mensuelle
   communale de 2013 à juillet 2026**, couverture nationale ;
3. **la conformité de l'eau du robinet** — Hub'Eau, verdict réglementaire écrit par le
   producteur, **23 communes testées sur 23 codes valides**, mensuel ;
4. **l'objectif légal de logements sociaux** — SRU, **427 communes IDF dans le champ
   légal**, et pour les 835 autres « la loi ne vous impose pas d'objectif », ce qui est
   déjà une réponse ;
5. **ce que la commune a dépensé cette année** — comptes OFGL, **100 % de couverture**.

**Le cinquième niveau ne peut jamais manquer.** La cascade est ce qui transforme une
belle idée en promesse tenable pour 1 262 communes. Et chaque niveau porte sa
provenance et sa date, sans exception.

---

## G. MODÈLE MENTAL DE L'UTILISATEUR

**Ce que le produit croit aujourd'hui :** l'habitant arrive avec une question
d'institution (« qui décide ? ») ou de budget (« où va l'argent ? »).

**Ce qu'il a réellement en tête :** un **lieu**, et une **irritation**.

> « Pourquoi ma rue est-elle barrée depuis trois mois ? »
> « Ils construisent quoi, là, derrière l'école ? »
> « La cantine a augmenté, c'est qui qui décide ça ? »
> « Est-ce que l'eau est bonne ? »
> « À quoi servent mes impôts locaux ? »

Aucune de ces phrases ne commence par une institution. **Toutes commencent par une
chose, et remontent vers un décideur.** Le produit, lui, part du décideur et descend
vers la chose. **C'est l'inversion à opérer**, et c'est exactement le changement de
paradigme demandé :

| ancien modèle | nouveau modèle |
|---|---|
| Repère montre des données politiques | Repère explique ce qui se passe dans ma vie publique locale |
| l'entrée est une institution | l'entrée est un lieu ou un objet du quotidien |
| la donnée est le contenu | la donnée est la preuve d'une phrase |
| l'écran répond « voici les chiffres » | l'écran répond « voici qui a décidé, et ce que ça a coûté » |

**Corollaire de conception :** chaque écran doit pouvoir se relire comme une phrase de
la forme *« <chose que vous connaissez> a été décidée par <qui>, le <quand>, pour
<combien> — et voici la source »*. Un écran qui ne se relit pas ainsi est à revoir.

---

## H. INVENTAIRE DES DONNÉES DÉJÀ DANS LE PRODUIT

| donnée | producteur | licence | fraîcheur | couverture IDF | rattachement |
|---|---|---|---|---|---|
| maires et adjoints | Répertoire national des élus | LOv2 | 26/08/2026 | **100 %** | code INSEE |
| libellés de communes | Etalab / DINUM (COG) | LOv2 | à jour | 100 %, 9 198 redressés | code INSEE |
| circonscriptions | Ministère de l'Intérieur | Licence Ouverte | découpage **2010** | 100 % | code INSEE |
| députés et mandats | Assemblée nationale (AMO30) | LOv2 | **relevé du 26/08/2026 — 19 jours** | 100 % | circonscription |
| scrutins et positions | Assemblée nationale | LOv2 | **relevé du 26/08/2026 — 19 jours** | 99,6 % | circonscription |
| comptes des communes | OFGL | ODbL | 29/07/2026 | **100 %** | code INSEE |
| projets financés par l'État | DGCL | LOv2 | publication 24/07/2026 | **jamais collecté** | code INSEE |

**Le vieillissement de 19 jours n'est pas une négligence : c'est le blocage de `main`
qui se voit dans la donnée.** Les avertissements de fraîcheur fonctionnent et le
disent à chaque extraction.

---

## I. NOUVELLES DONNÉES DÉCOUVERTES

Vingt domaines explorés le 14/09/2026, **comme des réponses citoyennes et non comme
des fichiers**. Chaque ligne a été vérifiée sur l'API : producteur, licence, date, et
les **vraies colonnes** lues ligne à ligne. Aucune intégration n'a été faite.

### Les onze à retenir, par rapport valeur / coût

| # | question citoyenne | donnée | porte | couverture IDF mesurée | fraîcheur | licence |
|---|---|---|---|---|---|---|
| 1 | « L'eau de mon robinet est-elle potable ? » | Hub'Eau `qualite_eau_potable` | **(b)** + (c) | 23 / 23 codes valides testés, 8 dépts | mensuelle, 01/09/2026 | LOv2 |
| 2 | « Ma commune respecte-t-elle la loi sur le logement social ? » | Inventaire SRU | **(a)** + (b) | **427 communes en champ légal** | annuelle, 11/08/2026 | LOv2 |
| 3 | « L'air est-il respirable aujourd'hui ? » | Indice ATMO quotidien | **(b)** | **1 288 zones communales, 8 / 8 dépts, zéro trou** | **quotidienne** | ODbL |
| 4 | « Qu'est-ce qui est autorisé à se construire chez moi ? » | Sitadel, séries mensuelles communales | (c) | nationale, **2013 → juillet 2026** | mensuelle, 05/09/2026 | Licence Ouverte |
| 5 | « À qui ma mairie a-t-elle donné des contrats ? » | DECP consolidées | fait daté | **102 291 marchés**, jusqu'aux communes de 3 000 hab. | **quotidienne** | LOv2 |
| 6 | « Qui siège au conseil municipal ? » | RNE conseillers | fait daté | **1 264 maires, 27 431 conseillers** | trimestrielle | LOv2 |
| 7 | « Ma commune fait partie de quoi, au-dessus de la mairie ? » | BANATIC périmètre EPCI | fait juridique | **1 266 lignes** | trimestrielle, 03/09/2026 | ODbL / LOv2 |
| 8 | « Mon quartier est-il classé prioritaire ? » | QPV 2024 (ANCT) | **(a)** | **298 couples quartier × commune** | 21/07/2026 | Licence Ouverte |
| 9 | « Quelles écoles, laquelle a une cantine, laquelle est en REP+ ? » | Annuaire de l'éducation | **(a)** sur REP+ | **10 145 établissements** | **quotidienne** | LOv2 |
| 10 | « Suis-je en zone inondable ? Y a-t-il eu des catastrophes ? » | API Géorisques (risques, CATNAT, radon, sismicité) | **(a)** + (c) | Saint-Denis : 11 risques, **17 arrêtés CATNAT** | maj 19/06/2025 | **non vérifiée** |
| 11 | « Combien de gens ont voté ici, et est-ce moins qu'avant ? » | Élections agrégées 1999 → 2026 | (c) | municipales **2026** et législatives 2024 à la maille commune | figée, 07/07/2026 | LOv2 |

**Trois compléments** : le **Fonds Vert** (391 projets IDF 2025, même patron que la
DGCL, coût marginal quasi nul) ; les **équipements sportifs Data ES** (10 098
installations, accessibilité handicap) ; les **arrêts et lignes IDFM** (74 294 couples,
code INSEE natif, quotidien).

### Les écartés, avec la raison — pour ne pas les retenter

| écarté | raison mesurée |
|---|---|
| délibérations municipales | **46 jeux pour 34 875 communes = 0,13 %**, et le mode de publication légal (PDF par commune) interdit la consolidation. Confirmé pour la deuxième fois. |
| budgets primitifs votés | 37 jeux au plus, dont au moins un hors sujet. Le budget **exécuté** (OFGL) reste la seule voie. |
| budgets participatifs | **2 communes IDF sur 1 262**, et l'ODbL de Paris incompatible avec le reste. |
| subventions politique de la ville (ANCT) | le schéma légal du **décret 2017-779 ne contient aucun code INSEE**. Défaut du schéma, pas du producteur. |
| carte des loyers | aucune porte franchie, et **57,3 % des valeurs IDF sont des prédictions de maille** présentées à la commune. |
| licences sportives | un nombre de licenciés n'existe que pour être comparé, et la source mélange des estimations non distinguées. |
| indicateurs d'activité des bibliothèques | 57 266 prêts n'a de sens que contre une autre bibliothèque. **Les champs de service (gratuité, wifi, dimanche) sont en revanche retenus.** |
| gares du Grand Paris Express (SGP) | **dernière mise à jour 19/12/2016**, ZIP, aucun code INSEE, et le producteur décline toute valeur juridique. |
| grands travaux d'été IDFM | licence **CC BY-NC-ND** : pas de dérivé autorisé. Seul jeu à licence bloquante rencontré. |
| gares IDFM par ligne | **aucune colonne commune** ; doublé par « arrêts et lignes » qui, lui, porte le code INSEE. |
| permis de Plaine Commune | 8 communes, ODbL, entièrement doublé par Sitadel national. |
| sénateurs | **réexaminé comme demandé : décision inchangée.** Maille départementale, pas d'élection directe, rattachement impossible sans approximation. |
| taux d'imposition REI | le **bon** chiffre au sens de P16 (la commune contre elle-même), mais enfermé dans 44 ZIP et le miroir OFGL est bloqué. **À creuser, pas écarté.** |
| compétences exercées par l'EPCI | la relation groupement × compétence n'existe que dans **un XLSX multi-onglets**. Les CSV ne portent qu'un compteur (« 3 compétences »), inaffichable. **À creuser.** |

### Quatre conventions de codage à câbler, mesurées et non déduites

1. `beneficiaire_dep` (DGCL) est sur **trois** caractères : `93` → 0 ligne, `093` → 90.
2. `code_departement` (Fonds Vert) et `acheteur_departement_code` (DECP) sont sur **deux**.
3. BANATIC : le département de la commune est `dep_com`, **pas** `dept` — `dept` porte le siège de l'EPCI (`75` pour la Métropole du Grand Paris, y compris sur ses communes du 93).
4. QPV : `insee_com` est écrit **`="01053"`** — protection Excel. Lu brut, tout rapprochement échoue **en silence**.

---

## J. LES QUESTIONS CITOYENNES POSSIBLES

Classées par ce que le produit peut tenir aujourd'hui.

**Tenables tout de suite, porte franchie, couverture mesurée**
1. « L'eau de mon robinet est-elle potable ? » → verdict réglementaire écrit par le producteur.
2. « Ma commune respecte-t-elle son obligation de logements sociaux ? » → taux constaté **contre taux cible légal**.
3. « L'air est-il respirable aujourd'hui ? » → classe ATMO, échelle réglementaire.
4. « Suis-je en zone inondable, et y a-t-il déjà eu une catastrophe reconnue ici ? » → risques + arrêtés CATNAT datés.
5. « Mon quartier est-il classé prioritaire ? » → zonage par arrêté.
6. « Qu'est-ce que l'État a financé chez moi ? » → projet nommé, montant, exercice.
7. « Qui siège au conseil municipal ? » → noms et fonctions légales.
8. « Ma commune fait partie de quelle intercommunalité ? » → fait juridique.
9. « Combien de gens ont voté ici en 2026, et en 2020 ? » → la commune contre elle-même.
10. « Quelles écoles, et lesquelles sont en éducation prioritaire ? » → classement par arrêté.

**Tenables au prix d'un travail réel**
11. « Qu'est-ce qui est autorisé à se construire près de chez moi ? » → Sitadel, ingestion complète, arbitrage vie privée obligatoire.
12. « À qui ma mairie a-t-elle donné des contrats ? » → DECP, deux filtres obligatoires sous peine de compter faux.
13. « Qui ramasse mes poubelles : la mairie ou l'interco ? » → un XLSX de distance.
14. « Ma taxe foncière a-t-elle augmenté ? » → REI, 44 ZIP.

**Impossibles, et il faut cesser de les espérer**
15. « Qu'a voté mon conseil municipal le mois dernier ? » — la donnée n'est pas cachée, **elle n'est pas produite**.
16. Délai d'attente d'un logement social, tarif de cantine, places de crèche, chômage communal, médecins acceptant de nouveaux patients — **inexistants en open data** (déjà dans `DATA_CATALOG.md` § 5).

---

## K. FEATURES CANDIDATES

Notées valeur citoyenne (1-5) × coût (1-5), et tranchées.

| # | feature | valeur | coût | verdict |
|---|---|---|---|---|
| K-1 | **Replier le sélecteur après le choix de commune** | 5 | **1** | **à faire en premier.** Rend ~2 écrans à chacun des 4 onglets. |
| K-2 | **La phrase de pouvoir + le fait de preuve** (§ F) | **5** | 2 | **à faire.** C'est le aha moment, et la cascade est écrite. |
| K-3 | **L'eau du robinet** | **5** | 2 | **à faire.** Porte (b) sans aucune interprétation de notre part. |
| K-4 | **L'objectif SRU** | **5** | 2 | **à faire.** Porte (a) la plus lisible du corpus. |
| K-5 | Les conseillers municipaux (RNE) | 4 | 1 | **à faire.** Meilleur rapport valeur/coût du corpus. |
| K-6 | L'intercommunalité **nommée** | 4 | 2 | **à faire**, en disant que les EPT du Grand Paris manquent. |
| K-7 | Risques et arrêtés CATNAT | 4 | 3 | à faire **après** avoir établi la licence Géorisques. |
| K-8 | Permis de construire | 4 | 4 | **pas avant décembre.** Arbitrage vie privée non tranché. |
| K-9 | Marchés publics | 4 | 4 | **pas avant décembre** (D-19 inchangée). |
| K-10 | Indice ATMO quotidien | 3 | 2 | **à creuser.** Seule donnée vraiment quotidienne — mais est-ce le rôle de Repère ? |
| K-11 | Participation électorale dans le temps | 3 | 2 | à creuser. |
| K-12 | Écoles et REP+ | 3 | 2 | à creuser. |
| K-13 | Reformuler la source en langue citoyenne (P8) | 4 | 1 | **à faire.** Déjà décidé, jamais fait. |
| K-14 | Un H1 par écran, réglage de taille du texte | 3 | 2 | à faire avant le banc. |
| K-15 | **Mentions légales et « signaler une erreur »** | — | **1** | **obligatoire.** Voir M. |

---

## L. FEATURES À REJETER

| rejeté | raison |
|---|---|
| **le fil daté unique** | 73 % de contenu national sous un titre communal, et un tri par date qui garantit **en permanence** que le local passe après. Ce n'est pas un réglage, c'est la charpente qui est fausse. |
| **les votes du député dans le fil communal** | identiques pour toute la circonscription, déjà présents et mieux cadrés dans « Qui décide ». Un doublon appauvri. |
| **le badge « n FAITS »** | compte des objets de nature différente et **classe les communes**. |
| **un onglet « Moi »** | Repère n'a ni compte ni courriel. L'onglet démentirait sa promesse fondatrice. |
| **un onglet « Agenda »** | vide pour 99,9 % des communes. Promesse impossible. |
| **un onglet « Suivi »** | implique notifications et compte. |
| **une carte** | aucune des données retenues n'en a besoin, et une carte demande une position — que le produit refuse de connaître. |
| **la comparaison entre communes**, sous toutes ses formes | y compris par habitant, en total, et en compteur de badge. |
| **les délibérations municipales** | non produites. Troisième confirmation. |
| **une réécriture d'architecture** | pas sans mesure préalable. Le monorepo tient 110 Ko et 128 contrôles. |

**Et la question qui doit être tranchée avant décembre** : « Ce qui a été décidé » avait
été justifié par le besoin d'une surface **vivante**. La surface est datée, elle n'est
pas vivante — en décembre elle affichera l'écran de septembre. **Si la raison de
revenir est l'objectif, aucune donnée du corpus ne la fournit** sauf l'indice ATMO
quotidien, qui n'est pas de la vie publique locale. Il faut donc assumer l'un des deux :
soit Repère est un **ouvrage de référence** qu'on ouvre quand on a une question — et la
rétention n'est pas la métrique — soit il vise la fréquence, et il faut le dire et en
payer le prix. **Ma recommandation : l'ouvrage de référence.** C'est ce que la donnée
permet, et c'est déjà un produit que personne d'autre ne fait.

---

## M. RISQUES

### Bloquants — rien ne se montre à un habitant avant

| # | risque | preuve | correction |
|---|---|---|---|
| M-1 | **Diffamation par patronyme** | maire de Paris **Emmanuel GRÉGOIRE** vs députée **Olivia Grégoire** ; 15 patronymes partagés au national | `prenom + nom`, regroupement sur `acteurRef` |
| M-2 | **Positions fausses au premier décalage de collecte** | appariement par rang, aucune garde, et **D-12 prévoit le décalage** | apparier par n° de scrutin, ou refuser d'afficher si les deux `releve_le` diffèrent |
| M-3 | **Aucun éditeur identifié, aucun droit de réponse** | le produit publie des positions politiques nominatives | mentions légales + « signaler une erreur » à un cran |
| M-4 | **Comptage faux sur 118 communes** | Paris annonce **144 lois** pour 8 textes | compter les textes |
| M-5 | **La capture d'écran comme affiche** | 8 verdicts alignés dans une colonne scannable, sous un titre communal, à côté d'argent reçu | détruire la colonne, séparer les deux cartes |

### Graves

- **M-6. L'erreur d'imputation.** « Ce qui a été décidé pour Aubervilliers » contient
  zéro décision prise par un élu que le lecteur a élu. Ni délibération, ni
  intercommunalité. Le titre s'approprie des faits qui ne sont pas ceux de la commune.
- **M-7. Le silence qui accuse.** Une commune sans projet n'affiche **aucune phrase** :
  le lecteur ne peut pas distinguer « l'État n'a rien financé » de « Repère ne sait pas ».
- **M-8. « Position non portée » lu comme de l'absentéisme.** 17,0 % des positions
  solennelles, 68,3 % des députés.
- **M-9. « a engagé » lu comme « a payé », « financé » lu comme « réalisé ».** Un montant
  d'engagement sur un projet peut-être jamais réalisé.
- **M-10. Le mot « lois ».** Les 8 scrutins solennels ne sont pas tous des lois adoptées.
- **M-11. `collecte.yml` commite sur `main` chaque matin** — activer la protection de
  branche sans excepter le robot casse la collecte en silence.

### Structurels

- **M-12.** La donnée ne bouge pas à la semaine. Toute promesse de fraîcheur est une dette.
- **M-13.** Rien n'est publié. Un produit non publié n'a aucune valeur citoyenne, quels
  que soient ses 128 contrôles.
- **M-14.** Un seul mainteneur privé derrière la version exploitable des marchés publics.
- **M-15.** Le découpage des circonscriptions date de **2010**, et il est affiché comme tel.

---

## N. ROADMAP JUSQU'À DÉCEMBRE

### Étape 0 — cette semaine, avant toute autre chose
1. **Fusionner dans `main`** (humain) → les tâches planifiées se déclenchent.
2. **Poser les trois secrets Cloudflare** (humain) → une URL existe.
3. **Activer la protection de branche sur `main` en exceptant le robot d'Actions**, puis relire le journal du lendemain.
4. **Mentions légales et « signaler une erreur »** (M-3).

### Étape 1 — les cinq correctifs P0
M-1 le prénom · M-2 l'appariement des positions · M-4 le comptage · M-5 la colonne de
verdicts · K-1 replier le sélecteur.
*Chaque correctif arrive avec son contrôle, écrit en même temps.*

### Étape 2 — la refonte
« Ce qui a été décidé » devient **« Chez vous »** : faits locaux uniquement, phrase de
pouvoir + fait de preuve, cascade à cinq niveaux, phrase de vide pour l'absence
**partielle**. Les votes retournent dans « Qui décide ». **« Sources » quitte la barre.**
Trois onglets.

### Étape 3 — mesurer ce qu'on ne sait pas
**Combien des 1 262 communes portent au moins un fait local ?** C'est le seul chiffre
qui décide de la suite, et il exige que l'étape 0 soit faite.

### Étape 4 — les quatre données nouvelles, une par une, dans l'ordre
eau (K-3) → SRU (K-4) → conseillers municipaux (K-5) → intercommunalité nommée (K-6).
**Chacune passe le cycle complet** DISCOVERY → HYPOTHÈSE → UX → PROTOTYPE → RED TEAM →
BUILD → QA → MESURE → SHIP. Aucune ne démarre avant que la précédente soit mesurée.

### Étape 5 — le banc de décembre
Dix testeurs, trois questions, sur un vrai téléphone. Puis corrections. **Puis, et
seulement là, de nouvelles données.**

**Ce qui n'est pas au programme avant janvier** : marchés publics, permis de construire,
compétences des EPCI, taux d'imposition. Tous quatre sont bons, tous quatre coûtent
cher, et aucun ne sert si le contenant n'est pas éprouvé.

---

## O. PLAN DE TEST UTILISATEUR

**Dix personnes, recrutées pour ce qu'elles ne savent pas.** Quatre profils :
quelqu'un de 18-25 ans, quelqu'un de 65 ans et plus, quelqu'un qui ne suit jamais la
politique, quelqu'un qui la suit de près. **Au moins six habitent une commune que le
produit sert mal** : petite commune de Seine-et-Marne ou des Yvelines, sans projet
financé — c'est là que le produit est faible, donc c'est là qu'il faut regarder.

**Protocole — 20 minutes, sur leur propre téléphone.**

1. **Les dix secondes.** On donne le téléphone, commune déjà saisie, et on demande :
   *« Qu'est-ce que cet écran vous dit ? »* On chronomètre le silence avant la première
   phrase. **Critère : au moins 8 sur 10 nomment un fait concernant leur commune.**
2. **Trois tâches, sans aide.** « Trouvez qui décide de l'école primaire chez vous. »
   « Trouvez combien votre commune a dépensé. » « Trouvez d'où vient ce chiffre. »
   **Critère : chaque tâche réussie par 8 sur 10 en moins de 60 secondes.**
3. **Le test de l'imputation** — c'est le plus important. On montre l'écran des votes
   et on demande : *« Qui a décidé ça ? »* puis *« est-ce que ça concerne votre
   commune plus qu'une autre ? »* **Critère : 0 sur 10 ne doit attribuer un vote
   national à la mairie, et 0 sur 10 ne doit croire que sa commune est plus concernée.**
   *Un seul échec ici est un échec du produit, pas du testeur.*
4. **Le test de l'absence.** On ouvre une commune sans projet financé. *« Est-ce que
   l'État a financé quelque chose ici ? »* **Critère : 10 sur 10 répondent « non » et
   non « je ne sais pas ».**
5. **La question de sortie, ouverte.** *« Reviendriez-vous, et pour quoi ? »* On note
   les mots exacts. C'est la seule mesure honnête de la raison de revenir.

**Ce qu'on ne fait pas** : aucun questionnaire de satisfaction, aucune note sur 10.
On regarde ce que les gens font et on écoute ce qu'ils disent de travers.

---

## P. MÉTRIQUES DE RÉUSSITE

**La métrique cardinale, et elle n'est pas technique :**

> **Combien des 1 262 communes d'Île-de-France peuvent afficher au moins un fait local,
> nommé, daté et sourcé ?**

Aujourd'hui : **inconnu**, parce que la collecte n'a jamais tourné. Objectif décembre :
**100 %** — c'est ce que la cascade à cinq niveaux garantit par construction, et c'est
ce qu'il faudra prouver commune par commune.

| métrique | aujourd'hui | objectif décembre |
|---|---|---|
| communes avec ≥ 1 fait local | **inconnu** | **100 % des 1 262** |
| communes servies par le 1ᵉʳ niveau (projet État) | inconnu | mesuré et affiché |
| une URL publique existe | **non** | oui |
| fraîcheur de la donnée la plus vieille affichée | **19 jours** | ≤ 7 jours |
| testeurs qui nomment un fait local en 10 s | non mesuré | **≥ 8 / 10** |
| testeurs qui imputent un vote national à la mairie | non mesuré | **0 / 10** |
| testeurs qui distinguent « rien » de « pas su » | non mesuré | **10 / 10** |
| poids du parcours complet | 110,1 Ko | **≤ 150 Ko** |
| contrôles statiques + navigateur | 49 + 79 | ≥ 60 + ≥ 95 |
| écrans notés 🔴 au test des dix secondes | non mesuré | **0** |

**Ce qu'on ne mesurera pas, et c'est délibéré** : aucune visite, aucune session, aucun
temps passé, aucun taux de retour. Repère ne mesure rien sur ses lecteurs — c'est un
invariant, pas une lacune. **La rétention se déduira du banc et des retours, ou elle ne
se mesurera pas.** Un produit qui installerait un mouchard pour prouver sa valeur aurait
perdu la sienne.

---

## LA RÉPONSE À LA QUESTION POSÉE, EN CINQ LIGNES

Non, ce n'est pas encore la meilleure expérience possible pour un Francilien. Le produit
a une base technique excellente et **un écran, « Où va l'argent », qui est déjà ce qu'il
devrait tous être**. Mais il part du décideur pour descendre vers la chose, quand
l'habitant part de la chose pour remonter vers le décideur. Le dernier écran construit
a aggravé cet écart : il porte un titre communal sur 73 % de contenu national, et il
expose l'éditeur à une imputation fausse sur un élu nommé.

**Le code n'est pas le produit. Trois onglets, une phrase de pouvoir, un fait de preuve,
et une URL : voilà le produit.**
