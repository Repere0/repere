# Repère — reprise du 16/09/2026 (soir)

**Ce qu'est ce document.** Une reprise automatique après la levée de la limite d'utilisation.
Il rend compte de trois choses, dans cet ordre : ce que la session précédente a **réellement
laissé dans l'arbre de travail** (et qui n'est écrit nulle part), ce que j'ai **mesuré
moi-même** ce soir, et la seule section du cadrage que **aucun document du dépôt ne couvre** —
l'hébergement.

**Ce document ne refait pas la stratégie.** Le dépôt porte déjà onze documents d'arbitrage, dont
`docs/repere_citizen_product_vision.md` (1 818 lignes), `docs/repere_product_engineering_review.md`
et `Claude outputs/release_candidate_idf.md`. Vision, parcours, aha moment, piliers, liste de
fonctionnalités, roadmap P0/P1/P2, métriques bêta : **tout cela existe déjà, mesuré, et est bon.**
En réécrire une douzième version serait le contraire d'un service rendu. Le projet n'a pas un
déficit de doctrine ; il a un déficit d'exécution et de traçabilité. Ce document sert donc de
**bordereau d'état**, avec renvois, et il n'ajoute du contenu neuf que là où il en manquait.

**Limite de cet environnement, dite d'emblée.** Cette session n'a **aucun moyen d'exécution** :
pas de shell, pas de `git`, pas de `node`, pas de `python`, pas de Playwright. Elle peut lire,
chercher et écrire des fichiers, et rien d'autre. **Aucun contrôle n'a donc été rejoué ce soir,
aucun build, aucun test, aucun commit, aucune publication.** Tout ce qui suit est soit une lecture
de fichier, soit un comptage, soit une recherche publique — jamais une exécution. C'est exactement
le cas prévu par la règle du projet : *« quand tu ne peux pas vérifier, écris-le au lieu de
l'arrondir. »*

---

## 1 · FAIT, et non documenté : la session précédente est allée plus loin que son propre rapport

`Claude outputs/MESURES_16_09_2026.md` se termine sur « dis-moi par lequel commencer ». **Deux
des points qu'elle présentait comme en attente de ton accord sont en réalité déjà écrits dans
l'arbre de travail.** Je les ai trouvés en lisant les fichiers, pas en les supposant.

### 1.1 · Le verrou de publication est levé dans le code — `outils/build_pwa_reconstruit.py`

La panne de 19 jours venait d'une ancre supposée unique qui ne l'était plus (`abo-note`,
4 occurrences). Le fichier porte désormais, lignes 104-120, un correctif **daté du 16/09/2026**
qui change la nature de l'ancre : il n'ancre plus sur un **style CSS** mais sur l'**écran**.

```python
assert html.count('id="s-sources"') == 1, "l'ecran Sources n'est pas trouve, ou n'est plus unique"
depart = html.index('id="s-sources"')
ancre_legal = '<p class="abo-note" style="text-align:left;margin-top:10px;">'
pos = html.index(ancre_legal, depart)
prochain_ecran = html.find('<div class="screen" id="', depart + 1)
assert prochain_ecran == -1 or pos < prochain_ecran, (
    "le paragraphe trouve n'est plus dans l'ecran Sources : l'ancre a glisse")
```

**Jugement.** Le correctif est bon, et meilleur que celui que j'aurais écrit : il remplace une
coïncidence typographique par une garde sur la structure, et il ajoute une seconde assertion qui
tire si l'ancre glisse hors de l'écran Sources. C'est la leçon du §9 du `CONTEXTE_PROJET.md`
appliquée correctement.

**Deux réserves, qui sont à toi.**

1. **Il n'a pas été exécuté.** Ce poste n'a pas de Python (mesuré par la session précédente) et
   la présente session n'a pas de shell du tout. Le script porte une clause `PREUVE_SRC` qui
   régénère `app_repere_v18_9.html.bak` et compare le md5 au fichier de référence : **si la
   transformation a changé de comportement, c'est cette preuve qui tirera, et personne ne l'a vue
   tirer ni passer.** Tant qu'elle n'a pas tourné, la panne est *réputée corrigée*, pas corrigée.
2. **Corriger la chaîne, c'est rallumer une publication automatique vers la production.** Le
   correctif seul ne publie rien ; mais le premier run réussi de `collecte.yml` publiera, sans
   relecture, `app_repere_v18_20.html` à la place du gel du 19 août — c'est-à-dire exactement le
   changement de contenu public que la session précédente t'a demandé de voir d'abord (§3 de
   MESURES : étiquettes `RÉEL`, « Résumé assisté par IA », écrans de paiement). **DÉCISION : ne
   pas laisser la chaîne repartir avant d'avoir tranché le contenu.** Voir §4.

### 1.2 · Le bug de vérité « Ville-d'Avray » est corrigé, avec sa donnée et son contrôle

Trois fichiers portent la même doctrine datée du 16/09/2026, et les trois se répondent :

| fichier | ce qu'il fait |
|---|---|
| `mono/scripts/extract-html.js:252-276` | pose `paquet.manquantes` : les communes présentes au Code officiel géographique et absentes du RNE |
| `mono/apps/web/src/App.jsx:292-373` | deux phrases distinctes selon la cause de l'absence |
| `mono/tests/runtime.test.mjs:552-568` | **éprouve les deux branches**, pas seulement celle qui a été corrigée |

**Et la donnée est régénérée.** `mono/data/index.json` porte `"genere_le":"2026-09-16"`, et j'ai
lu les paquets eux-mêmes :

```
92.json → "manquantes":{"92077":"Ville-d'Avray"}
77.json → "manquantes":{"77021":"Barbey","77253":"Lissy"}
94.json → "manquantes":{"94075":"Villecresnes"}
75, 78, 91, 93, 95 → "manquantes":{}
```

**Jugement : c'est le meilleur travail du projet depuis le 26 août.** Le contrôle éprouve la
branche *non* corrigée — c'est-à-dire qu'il refuse la régression symétrique, celle où une vraie
faute de frappe se mettrait à afficher la phrase inverse. C'est la règle « un garde-fou se prouve
en le cassant » appliquée sans qu'on la lui demande.

**Réserve, la même :** ces 81 contrôles n'ont pas tourné ce soir. Ils ont tourné le 16/09 au matin
selon MESURES §5 (55/55 statiques, 81/81 navigateur), mais **avant** ce correctif.

---

## 2 · MESURÉ ce soir, et c'est une correction à ton propre cadrage

> **La bêta ne porte pas sur 1 262 communes. L'Île-de-France en compte 1 266, et Repère en sert
> 1 262.** Écrire « la bêta IDF, 1 262 communes » fait disparaître quatre communes du monde.

Comptage, à partir de `mono/data/index.json` (généré le 16/09/2026) et des clés `manquantes`
relevées ci-dessus :

| dept | servies par Repère | manquantes | univers officiel |
|---|---:|---:|---:|
| 75 Paris | 1 | 0 | 1 |
| 77 Seine-et-Marne | 505 | 2 | 507 |
| 78 Yvelines | 259 | 0 | 259 |
| 91 Essonne | 194 | 0 | 194 |
| 92 Hauts-de-Seine | 35 | 1 | 36 |
| 93 Seine-Saint-Denis | 39 | 0 | 39 |
| 94 Val-de-Marne | 46 | 1 | 47 |
| 95 Val-d'Oise | 183 | 0 | 183 |
| **total** | **1 262** | **4** | **1 266** |

Deux vérifications croisées, parce qu'un dénominateur faux est le défaut le plus coûteux d'un
produit de données :

- **39 communes en Seine-Saint-Denis** — je croyais 40, je me trompais, et je l'ai vérifié
  avant d'écrire une fausse alerte. L'Insee donne 39 au 1ᵉʳ janvier 2026. Le fichier de référence
  du dépôt (`mono/scripts/noms-communes.json`, 39 clés `93xxx` comptées) est juste.
- **1 266 communes en Île-de-France** — confirmé par les chiffres-clés régionaux 2025-2026.

**Bonne nouvelle : `docs/repere_product_engineering_review.md` (§V, §W) écrit déjà 1 266
partout.** C'est le **cadrage de la tâche planifiée** qui porte 1 262, et il faut corriger la
consigne, pas le dépôt. Sans quoi la métrique cardinale de la bêta (« combien des communes
peuvent afficher au moins un fait local ») serait calculée sur un dénominateur qui exclut
précisément les communes où le produit échoue.

**Conséquence directe : la fonctionnalité n° 5 de la liste O (« univers des communes sur le
COG », P0) est FAITE.** Elle peut sortir du P0. Le blocage « 4 communes absentes » devient
« 4 communes nommées, avec une phrase vraie » — ce qui est l'objectif atteignable, la fiche
d'élu n'existant pas dans la source.

---

## 3 · HÉBERGEMENT — la section que personne n'avait écrite

Le dépôt parle de Netlify et de Cloudflare, mais **nulle part il ne les compare, et nulle part
il ne chiffre ce que coûte le produit tel qu'il est servi.** C'est le seul endroit où ce document
ajoute vraiment quelque chose. Tous les chiffres ci-dessous sont relevés le 16/09/2026 sur les
pages officielles ou, à défaut, signalés comme non vérifiés.

### 3.1 · Le chiffre qui décide de tout : le poids servi

`site/index.html`, ce que sert le site aujourd'hui : **16 276 284 octets**, en un seul fichier,
à chaque première visite. Le monorepo, lui, sert **164 Ko** au premier écran (54 Ko compressés),
mesuré et éprouvé sur le runner GitHub le 26/08.

**Le rapport est de 99 pour 1.** Aucune discussion d'hébergeur n'a de sens avant celle-là : le
même quota de bande passante sert **un lecteur** dans un cas et **quatre-vingt-dix-neuf** dans
l'autre.

### 3.2 · Ce que tiennent les offres gratuites

| | bande passante | déploiements | fichiers par site | usage commercial |
|---|---|---|---|---|
| **Netlify** (compte *legacy*, avant 04/09/2025) | 100 Go/mois, limite dure | 300 min de build/mois | — | autorisé |
| **Netlify** (compte récent, modèle « crédits ») | **300 crédits/mois**, soit ≈ **15 Go** à 20 crédits/Go | **15 crédits par déploiement réussi**, la durée n'est plus comptée | — | autorisé |
| **Cloudflare Pages** | non facturée | **500 builds/mois**, 1 à la fois, 20 min max | **20 000** (100 000 sur offre payante) | autorisé |
| **Vercel Hobby** | 100 Go/mois | — | — | **INTERDIT** — usage personnel non commercial seulement |
| **GitHub Pages** | 100 Go/mois (limite souple) | 10 builds/h (levée si workflow Actions) | site ≤ **1 Go** | déconseillé pour un service |

### 3.3 · Les quatre conséquences, chiffrées

1. **Si le compte Netlify `repere0` est sur le modèle « crédits », l'offre gratuite ne tient
   déjà plus, avant même le premier lecteur.** Une publication quotidienne coûte
   30 × 15 = **450 crédits/mois** pour un plafond de 300. Le site serait suspendu pour le reste
   du mois calendaire. **Le compte a été créé au plus tard en août 2026, donc après le
   04/09/2025 : le modèle « crédits » s'applique très probablement.** Je ne peux pas le vérifier
   — c'est le point resté **BLOQUÉ** au §2 de MESURES, et il l'est toujours : je n'ai aucun accès
   au tableau de bord Netlify et je n'en veux pas.
2. **Et si c'était un compte *legacy* (100 Go), le plafond tomberait quand même sur la bande
   passante : 100 Go ÷ 16,28 Mo ≈ 6 143 premières visites par mois.** Une bêta fermée en IDF
   passe ; un article de presse local ne passe pas. Avec le monorepo à 164 Ko, le même quota
   porte ≈ 610 000 premières visites. **Le poids est le vrai plafond, pas l'hébergeur.**
3. **Cloudflare Pages est le seul des cinq dont aucune limite ne gêne le produit d'aujourd'hui** :
   bande passante non facturée, 500 builds/mois pour un besoin de ~30, et 20 000 fichiers pour
   un besoin mesuré de **215 fichiers JSON** dans `mono/data/` plus les assets du build. C'est
   aussi celui pour lequel `.github/workflows/build-publish.yml` est **déjà écrit, déjà testé,
   et bloqué sur trois secrets** (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`,
   `CF_PAGES_PROJECT`) que toi seul peux poser.
4. **La limite de 20 000 fichiers n'est pas théorique : elle tranche une décision d'architecture
   déjà inscrite à la feuille de route.** Le `CONTEXTE_PROJET.md` §12 prévoit « 104 pages
   départementales avant d'en engendrer 34 637 ». **34 637 pages statiques dépassent la limite
   gratuite de Cloudflare Pages par un facteur 1,7**, et la limite payante (100 000) les
   tiendrait. À l'inverse, GitHub Pages tient le nombre de fichiers mais pas le gigaoctet.
   **DÉCISION à prendre avant d'écrire la première page par commune, pas après.**

### 3.4 · Ce que je recommande, et contre quoi

**Recommandation : Cloudflare Pages comme cible, Netlify gelé en l'état, aucune bascule avant
que le contenu public soit tranché.** Motifs, dans l'ordre de force :

- c'est le seul hébergeur dont aucune limite mesurée ne contraint le produit ;
- la chaîne existe déjà et a tourné au vert ; le coût de la bascule est de poser trois secrets ;
- il supprime le risque « suspension en fin de mois » que le modèle à crédits fait peser sur une
  bêta qu'on ne veut pas voir s'éteindre un 28 décembre ;
- il ne coûte rien, et le budget total du projet est de 250 €.

**Contre-argument que je retiens, et qui interdit d'agir ce soir :** basculer d'hébergeur, c'est
changer l'URL publique ou la faire pointer ailleurs. C'est une action publique et irréversible au
sens du cadrage. **Elle n'est pas à faire par une session automatique.** De plus, le §14 du
`CONTEXTE_PROJET.md` pose que deux chaînes ne doivent jamais publier en même temps ; la bascule
suppose donc d'éteindre `collecte.yml` dans le même geste.

**Ce que je ne recommande pas, et pourquoi :** **Vercel est écarté d'office** — l'offre Hobby
est réservée à un usage personnel non commercial, et le projet a un abonnement à 1,99 €/mois
inscrit à ses arbitrages. Utiliser Hobby serait une violation des conditions d'usage, pas une
économie. **GitHub Pages** reste un filet de secours crédible et gratuit (le dépôt y est déjà),
mais son plafond de 1 Go par site et son statut de service « pour des pages de projet » en font
un plan B, pas une cible. **Un backend / Supabase est refusé pour un motif qui n'est pas
économique mais structurel** : le §10 du `CONTEXTE_PROJET.md` a déjà tranché — un serveur, ce
sont des journaux d'accès, donc des adresses IP, donc de la donnée personnelle, donc la
destruction de la seule chose que Repère a en propre. Ce refus ne se rouvre pas pour une
question de commodité.

---

## 4 · DÉCISIONS — ce qui est à toi, et ce que je ne ferai pas sans toi

Présenté comme demandé : contexte → options → conséquences → recommandation factuelle.

### D-1 · Le contenu du site public avant toute republication — **le plus urgent**

**Contexte.** Le correctif §1.1 lève la panne. Le premier run réussi remplacera le gel du 19 août
(données du 29 juin) par `app_repere_v18_20.html`. Or MESURES §3 a mesuré que les étiquettes
`RÉEL` / `RÉELS — sources officielles` et la phrase « Résumé assisté par IA — vérifié par un
humain » sont **dans les deux fichiers**, y compris la source. Le bandeau « maquette, contenus
fictifs » n'y est pas.

**Options.** (a) Préparer le patch numéroté sur `app_repere_v18_20.html` — bandeau + retrait
paiement + retrait des étiquettes `RÉEL` + retrait de la phrase IA — et te le montrer avant
exécution. (b) Laisser la chaîne repartir telle quelle. (c) Geler la chaîne (désarmer le `cron`)
jusqu'à l'arbitrage.

**Conséquences.** (b) publie sans relecture un écran qui affirme « RÉEL » sur des faits
d'exemple : c'est la seule chose que ce produit ne peut pas se permettre. (c) prolonge la panne
mais ne ment à personne.

**Recommandation : (a) puis (c) en attendant.** Une panne de publication est un désagrément ;
une étiquette « RÉEL » sur un contenu de maquette est une atteinte à la seule promesse tenue à
100 % par le produit. Je n'ai préparé aucun patch ce soir : je ne peux pas compter mes ancres
par exécution, et poser un patch non éprouvé sur le fichier source de 17 Mo serait refaire la
faute qui a coûté 19 jours.

### D-2 · Faire tourner les contrôles sur le travail du 16/09

**Contexte.** Deux correctifs de vérité et un correctif de chaîne existent, non éprouvés depuis
leur écriture. **Rien dans ce dépôt ne devrait être considéré comme fait avant que son banc
l'ait dit.**

**Options.** (a) Tu lances `pnpm test` puis `node tests/runtime.test.mjs apps/web/dist` en local
(Playwright et Chromium sont installés sur ce poste, mesuré le 16/09 : `chromium-1194`).
(b) Tu m'autorises à pousser une branche pour déclencher le runner GitHub. (c) On attend.

**Recommandation : (a).** C'est deux commandes, trois minutes, et ça ne demande aucune
autorisation. (b) suppose un `push`, que le cadrage m'interdit.

### D-3 · Les trois secrets Cloudflare — voir §3

**Recommandation :** les poser **maintenant**, parce que l'étape est inoffensive : elle ne touche
pas au site public, elle allume une **seconde** adresse de démonstration, et elle ne s'exécute
qu'après 55 contrôles statiques et 81 contrôles navigateur. C'est le seul moyen de voir le
monorepo tel qu'il sera, sur un vrai navigateur mobile, avant de décider quoi que ce soit
d'autre. **Ne me les donne jamais en conversation** — ils se collent dans
*Settings → Secrets and variables → Actions*.

### D-4 · Reste ouvert depuis le 15/09, non rejoué ici

| # | objet | statut |
|---|---|---|
| RC-1 | zéro publié ≠ colonne absente (34 868 communes, « frais de personnel » 2021) | **P0 non corrigé** — c'est le P0 n° 1 du projet |
| RC-K.1 | l'invariant 8 enfreint par la **forme** de `scrutins/*.json` (une chaîne par député) | **P0 non corrigé** |
| RC-10 | 10 communes où le maire est homonyme d'un député du même département | **décision produit**, trois options posées le 15/09 |
| MESURES-4 | écrire `outils/ofgl.py` | **décision de séquencement**, 1 jour |
| MESURES-6 | délibérations SCDL : 2 communes vivantes sur 1 266 en IDF (0,16 %) | **décision** — la mesure va dans le sens du refus déjà écrit pour les DECP |

---

## 5 · CONTRE-EXPERTISE de ce document

Je l'écris contre moi, parce qu'un document qui se conclut par un résumé flatteur ne sert à rien.

1. **Je n'ai rien exécuté. C'est la faiblesse principale et elle est structurelle.** Tout ce que
   ce document appelle « fait » est du code lu, pas du code éprouvé. Un lecteur pressé lira
   « le verrou est levé » ; la phrase exacte est « le verrou est levé dans le texte du script,
   et personne n'a vu la preuve tirer ».
2. **Je n'ai pas pu lire `git status`.** Je ne sais donc **pas** si les correctifs du 16/09 sont
   commités. Le dernier commit lisible dans `.git/logs` est un dépôt automatique du 16/09 à
   13:38. S'il existe une tâche horaire active, ils le sont ; sinon ils dorment dans l'arbre de
   travail et **une opération git malheureuse les perdrait**. À vérifier en premier.
3. **Ma section hébergement repose sur un point non vérifiable : le modèle de facturation du
   compte Netlify.** Les deux modèles donnent des conclusions différentes en degré, pas en
   nature (le poids reste le plafond), mais le chiffre « 450 crédits pour 300 » est une
   déduction, pas une mesure. Il est explicitement marqué comme tel.
4. **Je me suis trompé une fois ce soir**, en croyant de mémoire que la Seine-Saint-Denis compte
   40 communes. J'ai vérifié avant d'écrire, et la donnée du dépôt était juste. C'est la
   démonstration que la règle du projet fonctionne — et le rappel que la prochaine erreur du même
   type passera si personne ne vérifie.
5. **Ce document ne produit aucune ligne de code**, alors que le cadrage demandait
   « Implémenter → Tester ». C'est délibéré : sans moyen d'exécution, produire du code non
   éprouvé sur un fichier de 17 Mo aggraverait le problème au lieu de le résoudre. Le cadrage dit
   aussi « distingue FAIT / MESURÉ / À FAIRE / BLOQUÉ » : la bonne réponse ici était un
   bordereau, pas un patch à l'aveugle.

---

## 6 · Résumé en une page

| | |
|---|---|
| **FAIT** | ancre de publication réparée dans `build_pwa_reconstruit.py` (ancrée sur l'écran, plus sur un style) ; bug de vérité « absence chez nous ≠ absence dans le monde » corrigé dans l'extraction, l'écran **et** le contrôle ; données régénérées le 16/09 |
| **MESURÉ** | IDF = **1 266** communes, Repère en sert **1 262**, 4 nommées comme manquantes (Ville-d'Avray, Barbey, Lissy, Villecresnes) ; 215 fichiers JSON dans `mono/data` ; `site/index.html` = 16 276 284 o servis par visite ; Cloudflare Pages = 20 000 fichiers / 500 builds, Netlify récent ≈ 15 Go ou ~20 déploiements/mois, Vercel Hobby interdit en usage commercial |
| **À FAIRE** | rejouer les 55 + 81 contrôles sur le travail du 16/09 ; corriger le cadrage « 1 262 » en « 1 262 des 1 266 » ; sortir la fonctionnalité n° 5 du P0 |
| **BLOQUÉ** | coût Netlify réel (accès compte) ; exécution de quoi que ce soit depuis cette session (aucun shell) ; état `git` du travail du 16/09 |
| **DÉCISION** | D-1 contenu public avant republication *(le plus urgent)* · D-2 qui lance les contrôles · D-3 les trois secrets Cloudflare · D-4 les cinq points ouverts du 15/09 |

**Rien n'a été poussé. Rien n'a été fusionné. Aucun réglage Netlify n'a été touché. Aucune
dépense. Un seul fichier créé : celui-ci.**

---

### Sources publiques consultées le 16/09/2026

- [Cloudflare Pages — Limits](https://developers.cloudflare.com/pages/platform/limits/) (page datée du 05/09/2026)
- [Netlify — Introducing Netlify's Free plan](https://www.netlify.com/blog/introducing-netlify-free-plan/) (100 Go / 300 min, modèle historique)
- [Netlify Free Plan Limits 2026 — 300 crédits](https://netli.fyi/blog/netlify-free-plan-limits-2026) *(source secondaire, non officielle — à confirmer sur le tableau de bord)*
- [Vercel — Hobby plan](https://vercel.com/docs/plans/hobby)
- [GitHub Pages — limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Insee — Département de la Seine-Saint-Denis](https://www.insee.fr/fr/metadonnees/geographie/departement/93-seine-saint-denis)
- [Chiffres-clés de la région Île-de-France 2025-2026](https://www.institutparisregion.fr/nos-travaux/publications/chiffres-cles-2025-2026/)
