# Repère — Audit de la couche de données et plan d'action

*État mesuré le 21 juillet 2026 sur `app_repere_v18.html` (575 332 octets, 7 623 lignes) et sur `repere-data-engine/`. Tous les chiffres de ce document ont été comptés par script ou lus à une ligne précise du fichier. Aucun n'est estimé.*

---

## 1. Le constat qui commande tout le reste

L'app affiche un score de couverture de **96 %**. Ce score est faux — pas au sens où le calcul serait mauvais, mais au sens où il mesure une intention et non une donnée.

Le calcul est exact : `window.REPERE_COVERAGE` (ligne 3119) additionne huit couches pondérées, Σ poids × portée = 96,12. Le problème est ailleurs. **Quarante-neuf des quatre-vingt-seize points proviennent de trois jeux de données qui comptent zéro ligne dans le fichier** : le RNE (22 points, poids 0,22 × portée 100, bloc lignes 3133–3134 — les deux lignes sont adjacentes, le bloc est vide), les marchés publics DECP (15 points, zéro marché), les enquêtes publiques (12 points, exactement une enquête). Une quatrième couche, la couche communale, est surévaluée d'un facteur d'environ trois mille : six communes présentes dans `PILOTE` sont déclarées couvrir 52 % de la population française.

En retirant ce qui n'existe pas, le score défendable est d'environ **33 %**. Et sur ces 33 points, 13 viennent de `officialLinks()` (ligne 6847), qui fabrique trois URL de recherche par concaténation de chaînes — une fonctionnalité qui ne consomme aucune donnée et qui marcherait tout aussi bien sur une commune inventée.

L'enjeu n'est pas cosmétique. Ce score est la boussole du projet. Tant qu'il affiche 96, il dit que le travail data est presque fini. Il en reste les deux tiers. La consigne « 95 % minimum sur les données publiques récupérées » n'est pas atteinte : elle n'a pas commencé à être mesurée.

---

## 2. Ce que l'app contient réellement

### 2.1 Les constantes vides

Onze coquilles structurelles, déclarées, référencées par du code de rendu, et vides :

| Constante | Ligne | Contenu réel | Ce qui devrait s'y trouver |
|---|---|---|---|
| `RNE_FICHES` | 5195 | `{}` | 500 000+ élus locaux |
| `VILLES` | 4825 | `[]` | Les communes couvertes |
| `QUI_CACHE` | 3287 | `{}` | Le cache « qui dirige » |
| `ARGENT_CMP` | 6714 | `{}` | Comparatifs budgétaires |
| `ARGENT_SERIE` | 6716 | `[]` | Séries pluriannuelles |
| `AIDE_2025` | 6805 | `[]` | Aides publiques |
| `REGION_BARS` | 6825 | `[]` | Barres régionales |
| `PARTIS_ATTENDUS`, `EV_PARTIS` | 6049-50 | vides | Événements par parti |
| `ARGENT_LOCAL` | 6619 | 3 rubriques, toutes `lignes:[]` | Le budget local |
| `CIRCOS` | 6252 | 1 entrée | 577 circonscriptions |
| `ELUS` | 4968 | 6 entrées, **aucune en 77** | Les élus du territoire |

À quoi s'ajoutent `SCRUTINS` (ligne 6266) : quatre scrutins, dont trois marqués « non confirmé » et un « sans vote » — soit **zéro vote nominatif publiable**. Et `DEPT_STATUS` (7348) : 4 départements sur 101. Et `PLACES` (7350) : une seule clé, `"77"`.

### 2.2 Le contrat rompu entre le pipeline et l'écran

`window.REPERE_DATA` (ligne 3123) contient 11 entrées, toutes marquées `demo:false` / `verifie:true`, issues d'une ingestion unique datée du 23 juillet 2026. Cette constante n'est lue **qu'une seule fois dans tout le fichier**, ligne 4718, pour incrémenter un compteur affiché à l'écran.

Le fil d'actualité, lui, rend `FEED` (ligne 5831) : **treize cartes écrites à la main**.

Autrement dit : le moteur de données ne nourrit aucun écran. Il nourrit un nombre. Six fichiers de sortie Île-de-France produits par `repere-data-engine/pipeline/` n'ont aucun chemin d'injection vers l'app. Et `coverage_idf.py`, le seul script qui calcule un score *mesuré* plutôt que déclaré, est orphelin et plante.

Trois désaccords de nom de champ entre producteur et consommateur expliquent l'essentiel :

| Producteur | Écrit | Consommateur | Lit | Effet |
|---|---|---|---|---|
| `scope_idf.py` | `"insee"` | `fetch_circos.py` l.101 | `"code"` | KeyError, arrêt franc |
| `scope_idf.py` | `"insee"` | `coverage_idf.py` l.97 | `"code"` | KeyError, arrêt franc |
| `fetch_elus.py` l.145 | `"commune_insee"` | `coverage_idf.py` l.118 | `"insee"` | **jointure vide silencieuse** |

Le troisième est le plus dangereux : il ne lève aucune erreur. Il produit une jointure vide qui ressemble à une mesure. La couche élus, pondérée 0,30, vaut donc toujours 0 — et personne ne le voit.

`fetch_local.py` est par ailleurs un stub qui ne récupère rien, mais qui compte 100 % dans le score.

### 2.3 Ce que voit un utilisateur, mesuré en navigateur

Deux profils ont été simulés bout en bout dans Chromium.

**Fontainebleau** (commune présente dans `COMMUNES_FALLBACK`) : **3 écrans sur 15** portent une donnée locale. « Vos élus » est vide. « Qui dirige » est vide.

**Thomery** (commune absente de la liste des 49) : **0 écran sur 15** est localisé, et l'utilisateur reçoit 5 cartes au lieu de 8. La cause est à la ligne 3878, dans `obValidateTyped()` : l'appel est `obPick(nom, "")` — sans département, sans code INSEE. L'utilisateur ne perd donc pas seulement l'échelon communal : il perd aussi le départemental **et** le régional, alors que ces deux-là ne dépendent pas de sa commune exacte. C'est le bug le moins coûteux à corriger et le plus visible du lot.

### 2.4 Une horloge arrêtée

`CAL_TODAY` (ligne 6021) vaut `"2026-07-23"` en dur. Le compte à rebours de l'agenda est aujourd'hui faux de treize jours, et se dégrade d'un jour par jour. `CAL_EVENTS` contient 17 événements, **aucun local**.

### 2.5 Ce qui est irréprochable

Il faut le dire, parce que c'est rare et que c'est l'actif principal du projet : **aucune donnée inventée n'a été trouvée dans le fichier.** La doctrine du vide est appliquée avec rigueur par `argVide()`, `argSerie()`, `argComparatif()`, `renderInfluence()` et `quiEmpty()` — quand un chiffre manque, il n'y a ni barre grise, ni pointillé, ni hachure, seulement une phrase et le lien officiel. C'est sur cette honnêteté-là que tout le reste peut se construire ; la seule chose à réparer, c'est le score, qui est la seule affirmation non honnête du fichier.

---

## 3. Les axes d'évolution, classés par rapport valeur/coût

Dix étapes, **18 jours-personne, 0 €**. L'ordre n'est pas négociable : chaque étape rend la suivante moins chère.

| # | Étape | Effort | Ce que ça débloque |
|---|---|---|---|
| 0 | **Rendre vrai ce qui est déjà affiché** | 1 j | Le score cesse de mentir, `CAL_TODAY` devient dynamique, `obPick(nom,"")` est corrigé, les 3 bugs de nom de champ sont réparés. Rien de neuf à l'écran, mais tout le reste devient mesurable. |
| 1 | **Généraliser le patron `rne_extract`/`rne_inject`** | 2 j | Un connecteur type, un chemin d'injection unique. Sans ça, chaque source suivante coûte le double. |
| 2 | **Élus France entière (RNE)** | 2 j | La seule source qui remplit une rubrique entière à l'échelle nationale depuis un seul fichier. « Vos élus » et « Qui dirige » cessent d'être vides partout. |
| 3 | **Annuaire de l'administration** | 1 j | Adresses, horaires, contacts des mairies et préfectures. Peu spectaculaire, très utilisé. |
| 4 | **OFGL — finances locales** | 2 j | « Où va mon argent » devient réel pour les 34 945 communes. |
| 5 | **DECP — marchés publics** | 2,5 j | Les 15 points fantômes du score deviennent une rubrique. |
| 6 | **Scrutins AN + circonscriptions officielles** | 3 j | « Mon député » et les votes nominatifs. L'étape la plus lourde, la plus attendue. |
| 7 | **HATVP — intérêts uniquement** | 1,5 j | Déclarations d'intérêts. **Jamais le patrimoine, ni la moindre statistique dérivée.** |
| 8 | **Fil local reconstitué** | 2 j | Le fil cesse d'être treize cartes écrites à la main. |
| 9 | **Agenda partiel exact** | 1 j | Ce qui est connu est daté ; ce qui ne l'est pas est déclaré inconnu. |

La rentabilité décroît fortement après l'étape 2. Si le budget-temps devait s'arrêter quelque part, **les étapes 0 à 2 (5 jours) valent à elles seules davantage que les huit suivantes** : elles transforment une démo honnête en produit utilisable partout en France.

---

## 4. Ce qui n'existera jamais

Trois promesses seraient impossibles à tenir, et il vaut mieux le savoir maintenant.

**Les délibérations des conseils municipaux** n'existent pas en open data national. Elles sont publiées commune par commune, en PDF, sans schéma commun. La meilleure approximation légale est le fil reconstitué de l'étape 8 : la décision est signalée, le PDF officiel est lié, et l'app dit ce qu'elle sait et ce qu'elle ne sait pas.

**Les votes individuels des conseillers municipaux et départementaux** ne sont pas produits du tout. Les procès-verbaux mentionnent le plus souvent « adopté à l'unanimité » ou un décompte global. Approximation : le sens du vote de l'assemblée, jamais celui d'une personne — ce qui rejoint la règle de neutralité déjà en vigueur.

**Le calendrier des conseils** n'est pas centralisé. Approximation : les échéances nationales et régionales, exactes, plus le lien vers le site de la commune.

La formule d'Agent B mérite d'être reprise telle quelle à l'écran : *« La donnée n'est pas cachée : elle n'est pas produite. »* Dire cela à l'utilisateur n'est pas un aveu de faiblesse, c'est la démonstration qu'on lui doit la vérité — et c'est exactement ce qui distingue Repère d'une app qui remplirait le trou avec une barre grise.

---

## 5. Les arbitrages qui reviennent au fondateur

**Le poids du RNE embarqué.** Cinq cent mille conseillers ne tiennent pas dans un fichier HTML autonome. Le mode proposé (« mode D ») embarque le maire et les adjoints pour les 34 945 communes, et charge le conseil complet à la demande. C'est le seul compromis qui préserve à la fois l'autonomie du fichier et la couverture nationale — mais il implique d'accepter qu'un écran puisse rester incomplet hors connexion.

**Le scraping des délibérations.** Le poursuivre coûterait plusieurs semaines pour une couverture qui resterait sous les 5 % des communes et se casserait à chaque refonte de site municipal. L'abandonner au profit du fil reconstitué est probablement le bon choix, mais c'est un renoncement explicite à afficher.

**La nuance ministérielle.** Faut-il l'afficher comme la qualification administrative nommée qu'elle est, ou ne rien afficher ? Elle est produite par le ministère de l'Intérieur, elle est donc factuelle — mais elle est aussi contestée par les intéressés eux-mêmes.

**`geo.api.gouv.fr`.** Décision toujours ouverte : c'est la dernière requête réseau réelle de l'app, et elle divulgue la commune saisie. La retirer ramène la couverture communale à la liste de 49 entrées codée en dur — mais l'étape 2 la remplacerait par 34 945.

**Cinq vérifications qui ne peuvent être faites que depuis un poste connecté** (le bac à sable n'a pas d'accès réseau sortant) : l'existence et le format des fichiers plats OFGL ; la licence exacte de NosDéputés ; le nom du champ « type de déclaration » dans l'export HATVP ; l'identifiant du jeu de données Annuaire de l'administration ; et le texte mot pour mot de LO 135-2 sur Légifrance, puisque c'est lui qui porte la peine d'un an d'emprisonnement et 45 000 € d'amende.

---

## 6. En une phrase

L'app est honnête partout sauf sur un chiffre, le moteur produit des données que personne ne lit, et cinq jours de travail suffiraient à corriger les deux — le reste est de l'extension, pas de la réparation.
