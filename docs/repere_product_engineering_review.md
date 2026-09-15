# REPÈRE — REVUE D'INGÉNIERIE PRODUIT
**15 septembre 2026.** Écrite après inspection du produit public dans un navigateur, lecture
du dépôt, d'un clone vierge de `main`, des journaux publics de GitHub Actions, et quatre
missions d'agents spécialisés — architecture de données, red team, exploration de données,
recherche de sources.

**Toute affirmation porte son mode d'obtention : mesuré, déduit, simulé, ou non vérifié.**
Deux de mes agents se contredisent sur un chiffre : je le dis à l'endroit où ça compte
plutôt que de trancher sans preuve.

---

## LE RÉSUMÉ QUE JE DÉFENDS, EN SEPT LIGNES

1. **Il y a deux produits Repère**, et le public voit celui de juin. Ce n'est pas un retard de
   déploiement : c'est un fixture de build servi comme un produit.
2. **La chaîne de collecte est morte depuis le 26 août** — dix-neuf exécutions rouges — et rien
   dans le produit ne le dit.
3. **Le aha moment ne demande aucune donnée nouvelle.** Mesuré : 94,0 % des communes de la bêta
   ont une dette qui a changé entre 2021 et 2025. C'est déjà dans le dépôt, et une ligne de code
   le détruit.
4. **Trois affirmations fausses sont affichées aujourd'hui** : une dette remboursée présentée comme
   inconnue, 72 maires nommés de travers, et une couverture annoncée à 100 % sur un univers
   incomplet.
5. **Le cache ne périme jamais.** Un testeur de décembre ne verra jamais une donnée rafraîchie,
   même si la collecte repart.
6. **La géolocalisation en production envoie quatorze chiffres de position** à un tiers, alors que
   l'invariant 2 refuse cinq chiffres de code INSEE à notre propre serveur.
7. **Aucune nouvelle fonctionnalité n'est justifiée avant que ces six points soient traités.**

---

# A. RÉALITÉ DU PRODUIT PUBLIC

Mesuré le 14/09 sur `https://repereapp.netlify.app/?verif=…`, dans un navigateur, avec un
paramètre neuf — la règle du dépôt (`CONTEXTE_PROJET` § 2.4) qu'aucun audit n'avait appliquée.

| | mesuré |
|---|---|
| document servi | **16 292 552 octets** — c'est le fichier mono-HTML |
| `window.REPERE_CIRCOS` | **undefined** → build **antérieur au 25 août** |
| `data-veille`, `BETA_RESTREINTE`, `EN_VEILLE` | **absents** → antérieur au mécanisme de mise en veille |
| date affichée | « Décision la plus récente : **29 juin 2026** » |
| écrans dans le DOM | **21**, dont `s-abo`, `s-paiement`, `s-compte-login`, `s-compte-creer`, `s-notifs` |
| navigation | **Fil · Agenda · Qui dirige · Jouer · Moi** |
| service worker | enregistré sur `/` |

**Identification de la source, faite par recoupement :** `site/index.html` sur `main` pèse
16 276 284 octets, a été modifié pour la dernière fois le **19 août 2026**, contient la date
`2026-06-29` et douze occurrences des marqueurs observés dans le navigateur, et ne contient ni
`REPERE_CIRCOS`, ni `data-veille`. **Le site public est `site/`** — que `CONTEXTE_PROJET` § 5
décrit comme « site de RÉFÉRENCE v18.9 — sert de preuve au générateur ». Un fixture de build.

**Ce que le public peut atteindre, et qui contredit les invariants du dépôt :**
- un compteur *« 1 jour d'affilée »* en page d'accueil — gamification, interdite par l'invariant 6 ;
- un onglet **Jouer** ;
- un onglet **Moi** donnant accès à `s-compte-creer` et `s-compte-login` ;
- l'écran **Offres** atteignable par quatre boutons (`show('s-abo','Offres')`), prix **9,99 €** et
  **4,99 €**, Stripe mentionné. **Ce qui limite l'exposition** : la page écrit elle-même
  *« Maquette : simulation, aucun paiement réel »*, et des mentions légales existent dans le
  document. Ce n'est pas une vente déguisée ;
- **« Utiliser ma position »** : `navigator.geolocation` → `geo.api.gouv.fr/communes?lat=…&lon=…`
  en chaîne de requête GET, coordonnées brutes, sans `maximumAge`.
- deux onglets **vides** : *« Aucun rendez-vous n'est publié pour l'instant »* et
  *« Prochain conseil municipal : non disponible »*.

---

# B. RÉALITÉ DU DÉPÔT

`audit-finalisation-repere` à `c435294` (mesuré, identique au distant). Le monorepo,
reconstruit depuis un clone vierge :

| | mesuré |
|---|---|
| contrôles statiques | **53 / 53** |
| contrôles navigateur | **81 / 81**, sept écrans, thème sombre, hors ligne |
| parcours complet | **111,0 Ko** compressés — *mais voir D-2* |
| premier écran | 91,2 Ko |
| couverture annoncée | maire 100 %, circo 100 %, député 100 %, votes 99,6 %, comptes 100 % — *mais voir C-3* |
| navigation | Ce qui a été décidé · Qui décide · Où va l'argent · Sources |
| publié | **non** |

---

# C. DIVERGENCE

### C-1. Trois chemins de publication visent la même URL, aucun n'est la source de vérité

| chemin | ce qu'il publie | état mesuré |
|---|---|---|
| **`site/`** dans le dépôt | un fixture v18.x gelé le 19/08 | **c'est ce que le public voit** |
| `collecte.yml` → `netlify-cli deploy --dir=site_engendre` | le mono-HTML reconstruit du jour | **mort depuis le 26/08** |
| `netlify.toml` → build git de Netlify | **le monorepo** (`base=mono`, `publish=apps/web/dist`) | **jamais effectif** |

**La cause du troisième est nommable** : `netlify.toml` a été ajouté le 29/08 et **n'existe que sur
la branche de travail**. Vérifié sur les cinq branches distantes : absent de `main`, de
`reprise-idf`, de `startup/bench-dec-2026`, de `codex/ci-pr-hardening`. Netlify construit la
branche de production — `main` — où il n'y a aucune instruction de build.

**Ironie mesurable** : `netlify.toml` porte le bon ordre (extraire → construire → éprouver) et son
commentaire dit noir sur blanc que `build-publish.yml` a l'ordre inverse et « n'a jamais tourné,
sinon on l'aurait vu ». Le fichier qui documente le défaut est aussi celui qui ne s'applique pas.

### C-2. Les deux chaînes GitHub sont rouges, et pour deux causes distinctes

**`build-publish.yml` — cause certaine, reproduite.** Sur `main`, les contrôles statiques passent
**avant** `pnpm build`, or deux d'entre eux lisent `apps/web/dist`. Rejoué localement dans cet
ordre : **51 passent, 2 échouent**, et ce sont exactement ceux-là (« le site publié ne charge aucune
ressource d'un autre hôte », « le service worker précharge exactement ce que le build a produit »).

**`collecte.yml` — dix-neuf échecs consécutifs.** Dernière verte : **#25, le 26 août 2026 à
01h32 UTC**. Runs #26 → #44, tous rouges. Et `releve_le` des mandats et des scrutins dans le
produit vaut **2026-08-26** — au jour près. Les avertissements de fraîcheur disaient la vérité ;
ils partaient dans le journal d'un build que personne ne lit.
Le premier échec sort en **code 9**, le dernier en **code 1** : deux causes, ou la même étape
échouant de deux façons. **Les journaux exigent d'être connecté à GitHub : non vérifié.**
Ce qui est sûr : le banc du fichier autonome **passe** sur l'état exact de `main` (55/55, mesuré),
donc ce n'est pas le produit qui casse la chaîne.

### C-3. L'univers des communes est faux, et le taux de couverture le cache

Trois mesures, par deux agents indépendants, et elles ne concordent pas toutes :

| source | communes en Île-de-France | mode |
|---|---:|---|
| **COG INSEE millésime 2026** (`TYPECOM=COM`, recoupé par `REG=11`) | **1 266** | mesuré, recoupé deux fois |
| ATMO France (`type_zone=commune`) | 1 288 | mesuré — **mais 21 zones pour Paris** : 1 268 + arrondissements |
| BANATIC (périmètre EPCI) | 1 266 | mesuré |
| RNE, maires | **1 264** | mesuré |
| **Repère** | **1 262** | mesuré |

**Le chiffre que je retiens est 1 266**, parce qu'il est recoupé deux fois sur le COG et confirmé
par BANATIC. Le 1 268 déduit d'ATMO reste **non expliqué** et doit être tranché par un contrôle
dans la chaîne, pas par un arbitrage de document.

**Conséquence, et c'est un défaut de catégorie :** les paquets départementaux sont construits sur
le RNE, non sur le COG. **Quatre communes franciliennes sont absentes de tout paquet et de
l'index de recherche : `77021`, `77253`, `92077`, `94075`** (mesuré). Elles ne sont pas « vides » :
elles n'existent pas. Nationalement, **305 communes** sont dans l'OFGL et absentes du RNE.

Et le produit annonce **« couverture maire 100 % »**. C'est 100 % d'un dénominateur qui est
lui-même l'énumération des communes ayant un maire. **Le taux est vrai et l'affirmation est
fausse** : il faut 1 266 au dénominateur, et une phrase pour les deux communes sans maire au RNE.

C'est la seule forme de vide que l'invariant 5 ne couvre pas : **le vide de l'index lui-même.**

---

# D. ARCHITECTURE TECHNIQUE

### D-1. Ce qui est juste, et qu'il faut protéger
Pas de serveur applicatif. Données statiques découpées par département. Une seule fabrique
d'adresses. Deux caches de service worker, l'un versionné, l'autre non. Aucune police distante.
Aucun composant squelette. 134 contrôles dont 81 mesurent un rendu réel.

### D-2. Le budget de poids est mesuré au meilleur endroit possible
**`tests/poids.mjs` mesure un parcours à Bagnolet — dans le 93, l'avant-dernier département
d'Île-de-France par le poids.** Mesuré, gzip -9, sur `data/departments/*.json` :

| dép. | communes | paquet | dont `comptes` | part |
|---|---:|---:|---:|---:|
| 93 | 39 | 6 928 o | 5 447 o | **79 %** |
| 95 | 183 | 26 814 o | 21 405 o | 80 % |
| **77** | **505** | **69 505 o** | 54 772 o | 79 % |
| 62 (le plus lourd de France) | 884 | 115 876 o | 91 847 o | 79 % |

**Le même parcours en Seine-et-Marne pèse 173,6 Ko** (déduit : 111,0 − 6,9 + 69,5), et
**194,9 Ko** dans le Pas-de-Calais. Les 111,0 Ko célébrés sont le meilleur cas du corpus utile.

Et **79 % de ce poids est l'OFGL, téléchargé au premier écran** alors qu'il ne sert qu'à
« Où va l'argent ». Sortir `comptes` du paquet d'entrée libère les quatre cinquièmes du budget :
`territoire/77.json` tombe à **11,2 Ko mesuré**, `territoire/62.json` à **17,2 Ko**.

### D-3. Deux défauts de construction, trouvés en lisant le code

**`store.js` refuse d'écrire les projets.** Le garde `estDonneePublique` accepte
`/^(dep|vote|socle):[0-9A-Z]{1,3}$/` ; `client.js` écrit sous `proj:<dep>`. **Le troisième étage du
client est mort pour cette donnée**, sans qu'aucun contrôle n'échoue. C'est l'illustration exacte de
la règle du dépôt : « un garde-fou se prouve en le cassant ».

**`extract-html.js` dérive le code de département deux fois.** `departementDe()` en tête, dont le
commentaire dit « écrite ici et nulle part ailleurs » — puis à nouveau en ligne dans la boucle des
projets, **sans la branche `98`**. À 1 262 communes, invisible. À 34 875, un 404 silencieux sur le
Pacifique : la panne déjà rencontrée une fois.

### D-4. Le cache ne périme jamais — et c'est le défaut le plus grave du produit

```js
const enCache = await magasin.lire(cle);
if (enCache) return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" };
```

Vérifié : `store.js` ne porte **ni horodatage, ni version, ni expiration** (0 occurrence de
`Date.now`, `expire`, `ttl`) ; `magasin.vider()` n'est appelé **nulle part** dans le produit
(0 occurrence). Pendant ce temps le service worker fait un *stale-while-revalidate* correct sur
`/data/` et écrit la version fraîche dans un cache **que personne ne relit jamais**, puisque
IndexedDB court-circuite avant. `netlify.toml` pose `must-revalidate` sur `/data/*` pour rien.

**Conséquence pour la bêta de décembre :** un testeur qui installe l'application le 2 décembre voit
les données du 26 août. La collecte peut repartir le 1er décembre — **il ne verra jamais la
différence.** Les dix testeurs mesureraient un produit gelé, et nous mesurerions leur réaction à
un instantané de l'été.

### D-5. La fraîcheur n'a aucun contrôle de valeur
Mesuré : sur 134 contrôles, **tous ceux qui portent sur une date en vérifient la forme**
(`assert.match(releve_le, /^\d{4}-\d{2}-\d{2}$/)`, aux lignes 276, 437, 771, 774, 1053).
**Zéro compare une date à un seuil.** Le seul contrôle de valeur est un `console.warn` dans
`extract-html.js`.

Pire, pour les projets le seuil porte sur `mis_a_jour_le` (la publication DGCL) et non sur
`releve_le` : avec `mis_a_jour_le = 2026-07-24`, le premier avertissement tomberait **en septembre
2027**. Le produit écrit « un principe sans contrôle est une intention ». La fraîcheur en a zéro.

### D-6. Chaque collecteur est démoté en avertissement
`pipeline.sh` pose `set -euo pipefail` en tête, puis désarme chaque collecteur par `|| echo
"::warning::"`. Le commentaire promet de remettre `set -e` « quand ils seront éprouvés » — ils ne
l'ont jamais été, la collecte étant rouge depuis dix-neuf jours. **La chaîne peut passer au vert
avec toutes ses sources mortes.**

La règle doit se dédoubler, parce que ce ne sont pas les mêmes objets : un **ingesteur neuf**
avertit et n'arrête rien ; une **source établie** dont le relevé n'a pas été réécrit fait échouer
l'étape. Le premier n'a jamais marché ; le second a cessé de marcher.

---

# E. PIPELINE DATA — CE QU'IL DOIT DEVENIR

**Un seul chemin, déterministe, et rien d'autre ne publie.**

```
SOURCES PUBLIQUES
   ↓  collecte (GitHub Actions — le seul endroit qui a le réseau)
mono/scripts/*.json          relevés versionnés, chacun avec producteur/licence/url/rel/pub
   ↓  extract-html.js + les collecteurs
mono/data/                   fichiers statiques, découpés par département
   ↓  pnpm build
apps/web/dist                la coquille + les données
   ↓  53 contrôles statiques + 81 navigateur     ← LE VERROU
   ↓  netlify.toml, sur main
URL PUBLIQUE
```

**Les cinq décisions qui empêchent deux Repère de coexister :**

1. **`netlify.toml` est sur `main`**, ou il n'a aucun effet. C'est un fichier à déplacer, pas un
   chantier.
2. **`site/` sort du chemin de publication.** Renommé `site_reference/` et documenté comme fixture,
   ou supprimé. Un fixture ne doit pas pouvoir être servi — c'est ce qui s'est produit.
3. **Une seule chaîne publie.** L'étape `netlify-cli deploy --dir=site_engendre` de `collecte.yml`
   est retirée : deux chemins vers la même URL, c'est le dernier qui gagne, et personne ne sait
   lequel a gagné.
4. **La chaîne échoue sur une source périmée.** Voir D-5 et D-6.
5. **Un contrôle compare ce qui est en ligne à ce qui est construit.** Une requête, une empreinte,
   et un échec si elles divergent. C'est le contrôle qui manquait le plus : il aurait crié le
   20 août.

---

# F. MODÈLE DE DONNÉES

Quatre couches au lieu d'un monolithe, et le découpage suit **le moment où le lecteur en a
besoin**, pas la nature administrative de la donnée :

```
data/
  index.json              socle : départements, CATALOGUE DES SOURCES, seuils, rel_min
  noms/{00..ff}.json      256 seaux de hachage : nom de commune → code INSEE
  territoire/{dep}.json   QUI DÉCIDE — part au premier écran
  obligations/{dep}.json  LE CADRE LÉGAL — SRU, QPV, risques, eau
  chronologie/{dep}.json  CE QUI S'EST PASSÉ — faits datés
  finances/{dep}.json     OÙ VA L'ARGENT — à la demande seulement
  competences.json · deputes.json · scrutins.json · scrutins/{dep}.json
```

**Deux segments variables, deux alphabets clos** : `{dep}` vaut `^(\d{2,3}|2[AB])$`,
`{bucket}` vaut `^[0-9a-f]{2}$`. **Aucun des deux ne peut contenir cinq chiffres.** L'invariant 2
cesse d'être gardé par une assertion : il devient inexprimable.

**La provenance par fait coûte un demi-pour-cent.** Mesuré, gzip -9, six faits ajoutés par commune :
un index entier vers un catalogue de sources coûte **+41 o sur le 93** et **+372 o sur le 77**
(+0,5 %) ; la même provenance en texte répété coûte **+981 o** (+13,7 %), soit 27 fois plus.
Le catalogue lui-même pèse **824 o gz** pour douze producteurs, et ne grossit pas avec la France
entière. **C'est ce qui rend la provenance par fait abordable, et c'est une mesure, pas une
intuition.**

**Les deux dates restent distinctes** : `pub` (le producteur a publié) et `rel` (Repère est allé
chercher). L'écran affiche `pub` — c'est l'âge du fait. L'écran Sources montre les deux — c'est
l'âge du produit.

**Le vieillissement est calculé au rendu, jamais écrit par le build.** Un paquet en cache depuis
trois mois qui porterait `"perime": false` mentirait pour toujours. Trois états, trois phrases :

- `age ≤ pmax` → « Relevé le 14 septembre 2026. »
- `pmax < age ≤ 3×pmax` → **« Ce relevé date du 26 août 2026. Il devrait être rafraîchi chaque
  jour ; il ne l'est plus depuis 19 jours. Le retard est de notre côté, pas du producteur. »**
- `age > 3×pmax` → **le chiffre est retiré** : « Repère ne peut plus garantir que ce chiffre est à
  jour. Voici la source officielle. »

La dernière proposition du deuxième état n'est pas du confort. Sans elle, un lecteur conclut que
l'État n'a rien publié depuis trois semaines — et nous lui faisons porter notre retard.
Le troisième état est ce qui fait de ce dispositif une garde et non une étiquette.

**Ce que le format doit rendre inécrivable**, par construction et non par convention :
aucune adresse portant un code de commune ; aucun agrégat inter-communes (le niveau racine d'une
couche est `{d, v, src_champ?, communes}` et n'a **aucun emplacement** pour un total) ; aucun fait
sans source (un fait est un objet portant `s`, ou un champ couvert par `src_champ` — **il n'y a pas
de troisième forme**) ; aucun compteur par personne (un élu est `{nom, fonction}`, deux chaînes,
zéro champ numérique) ; **et aucune fonction décodant un SIREN en code INSEE — pas désactivée,
absente.**

---

# G. GRAPHE TERRITORIAL

```
COMMUNE ↔ EPCI ↔ DÉPARTEMENT ↔ RÉGION
TERRITOIRE → ÉLU → COMPÉTENCE → DÉCISION → PROJET → FINANCEMENT → VOTE → SOURCE
```

### Les arêtes qui tiennent
`COMMUNE→DEPARTEMENT` (préfixe INSEE, un seul dérivateur) · `COMMUNE→EPCI` (BANATIC, par
**`dep_com`** et jamais `dept`, qui porte le siège de l'EPCI) · `COMMUNE→CIRCONSCRIPTION`
(Intérieur, découpage **2010**, 11 communes sans) · `CIRCONSCRIPTION→DEPUTE→VOTE→SOURCE`
(Assemblée) · `COMMUNE→PROJET→FINANCEMENT` (DGCL, Fonds Vert, DECP — code INSEE **fourni par le
producteur**) · `COMMUNE→OBLIGATION` (SRU, QPV, Géorisques, Hub'Eau).

### Les six arêtes impossibles, et il faut les dire au lieu de les combler

| arête | pourquoi |
|---|---|
| `COMMUNE→EPT` | les Établissements publics territoriaux du Grand Paris sont **absents de BANATIC**. `insee=93048` renvoie la Métropole, pas Est Ensemble. Or pour 130 communes de la petite couronne, c'est l'EPT qui exerce déchets et urbanisme |
| `ELU→COMPÉTENCE` | aucune source. Dire « votre maire décide de la voirie » quand l'EPCI l'exerce serait **faux** |
| `EPCI→FINANCEMENT` | l'OFGL embarqué ne porte que `{commune, departement, region}` ; `data.ofgl.fr` est interdit par robots.txt |
| `COMMUNE→DÉCISION` | 46 jeux de délibérations pour 34 875 communes (0,13 %), et la publicité légale se fait en PDF par commune |
| `ELU municipal→DÉCISION` | aucun vote nominatif communal consolidé en France. **La chaîne « qui décide → qu'a-t-il décidé » ne se ferme qu'au niveau national** |
| `COMMUNE→TAUX VOTÉ` | REI/DGFiP, 44 millésimes en ZIP, miroir OFGL bloqué. C'est le seul chiffre budgétaire nativement conforme à P16, et le seul inatteignable |

**`ELU` n'a délibérément aucun identifiant.** Le seul identifiant de personne stable disponible en
France est celui de la HATVP, interdit par l'invariant 8. Un élu n'est donc pas une entité
indexable : c'est un attribut daté d'un territoire. **Cette absence est une garde** — sans
identifiant, aucune fiche nominative indexée, aucun historique d'élu, aucun compteur par élu ne
sont écrivables.

**`ARRONDISSEMENT` doit exister et n'existe pas.** `data/departments/75.json` pèse **510 octets** et
contient **une** commune, alors qu'ATMO publie 21 zones pour Paris et que l'annuaire de l'éducation
et les QPV descendent à l'arrondissement. L'arête `ARRONDISSEMENT→COMMUNE` se fait par **table
explicite**, jamais par troncature.

---

# H. AUDIT UX

L'inventaire écran par écran est dans `repere_product_review_01.md` § B et n'a pas changé. Ce qui
s'y ajoute, mesuré depuis :

**Le meilleur écran du produit affiche cinq chiffres sans aucune référence.** « Où va l'argent »
donne six montants à sept chiffres, en langue citoyenne, avec des barres qui ne comparent que la
commune à elle-même — et la phrase le dit. C'est excellent. Mais un habitant ne sait pas si
172 millions pour 89 662 habitants est beaucoup, et **P16 lui interdit de le savoir** — sauf par
une porte qu'on n'a pas ouverte : *la commune contre elle-même dans le temps.* Voir K.

**« Sur la période relevée » couvre quatre jours de séance.** Mesuré sur `scrutins.json` : les
80 scrutins se répartissent en **17/07 : 58 · 20/07 : 10 · 21/07 : 7 · 16/07 : 5**. Les huit votes
solennels sont tous des 20 et 21 juillet, et **tous « adopté »** : le produit ne montre pas un seul
texte rejeté. La phrase « sur la période relevée » apparaît trois fois et **ne nomme jamais la
période**. Un lecteur croit voir un bilan de vote ; il voit une fenêtre de six jours sur 8 434
scrutins — et les 17,0 % de « position non portée » prennent alors le sens d'un absentéisme, sur
quatre jours où le député pouvait être en commission.

**Le sélecteur déplié est corrigé** : mesuré après correction, l'écran d'Aubervilliers passe de
3 916 à 3 587 px et de ~50 à **16 cibles visibles**.

---

# I. AUDIT UI

Ce qui tient : plancher 13 px sur sept écrans, zéro cible sous 44 px, contraste ≥ 3:1 en thème
sombre, `prefers-reduced-motion` sans JavaScript, palette d'échelons gelée.

**Trois défauts corrigés le 14/09** : la colonne de verdicts (« Abstention » se lisait comme le
résultat du scrutin), la pastille de comptage (« 12 FAITS » contre « 8 FAITS » classait les
communes), le lien d'état vide sans hauteur minimale (41 px — il n'atteignait 44 px que lorsque son
libellé passait à la ligne ; les 17 états vides en bénéficient).

**Deux qui restent.** Le code couleur **mente** sur « Ce qui a été décidé » : chaque fait porte un
`echelon` calculé (`ville` / `france`) qui n'est **jamais lu**, et la carte entière est peinte
`ville`, filet bleu compris, sur huit lois nationales. Et les maires s'affichent en **CAPITALES**
(convention RNE) quand les députés sont en casse normale : deux typographies pour le même objet, sur
le même écran.

---

# J. MODÈLE MENTAL UTILISATEUR

**Ce que le produit croit :** l'habitant arrive avec une question d'institution.
**Ce qu'il a en tête :** un lieu, et une irritation.

> « Pourquoi ma rue est barrée depuis trois mois ? » · « Ils construisent quoi derrière l'école ? »
> « La cantine a augmenté, qui décide ça ? » · « Est-ce que l'eau est bonne ? »
> « À quoi servent mes impôts locaux ? »

Aucune ne commence par une institution. **Toutes commencent par une chose et remontent vers un
décideur.** Le produit part du décideur et descend vers la chose.

Le modèle à retenir est bien celui du brief — `MOI → MA COMMUNE → CE QUI SE PASSE → QUI DÉCIDE →
CE QUI A ÉTÉ DÉCIDÉ → SOURCE` — **avec une correction que la mesure impose** : `CE QUI VA ARRIVER`
n'a **aucune donnée** derrière lui. Ni agenda de conseil municipal, ni enquête publique
consolidée. L'onglet « Agenda » du site public le prouve en production : *« Aucun rendez-vous n'est
publié pour l'instant »*. **Un maillon sans donnée ne se met pas dans un modèle : il se retire, et
on écrit pourquoi.**

---

# K. AHA MOMENT — DÉTERMINÉ EXPÉRIMENTALEMENT, ET CE N'EST PAS CE QUE JE PROPOSAIS

Hier je proposais une cascade à cinq niveaux, dont le premier était un projet financé par l'État
(≈887 projets pour 1 262 communes, donc **absent pour la majorité**). **La mesure dit autre chose.**

Mesuré sur les 1 262 communes de la bêta, exercices 2021, 2024 et 2025 déjà présents dans le dépôt :

| | mesuré |
|---|---:|
| communes avec **au moins deux exercices** | **1 262 — 100,0 %** |
| dont la **dette a changé** | **1 186 — 94,0 %** |
| dont les **dépenses ont bougé de plus de ±10 %** | 998 — 79,1 % |
| dont la **dette est tombée à zéro** | **22** |

**Le fait le plus fort dont dispose Repère n'exige aucune donnée nouvelle, aucune collecte, aucun
risque de source : c'est la commune comparée à elle-même dans le temps, sur l'argent.**
Couverture 100 %, porte (c) de P16 nativement, et c'est une nouvelle pour 94 % des habitants.

### L'expérience, dans les dix premières secondes

> **À Boissise-la-Bertrand, ce sont les élus de votre conseil municipal qui décident de l'école
> primaire, de la cantine, des permis de construire et de la voirie.**
>
> **Et voici ce qui a changé :** votre commune devait **160 000 €** en 2021. En 2025, elle ne doit
> **plus rien**.
> *D'où vient ce chiffre ? Publié par l'État — Observatoire des finances locales, le 29 juillet
> 2026. Vérifier ↗*

Deux phrases. La première est universelle et ne dépend d'aucune donnée. La seconde est un fait
daté, local, sourcé, et **c'est une bonne nouvelle** — ce qui n'arrive jamais dans un produit
civique.

**Et aujourd'hui l'écran affirme le contraire.** `OuVaArgent.jsx:11` fait
`typeof m === "number" && m !== 0 ? m : null` : **un zéro publié devient une absence**, et l'écran
écrit *« Non renseigné pour l'exercice 2025. Le fichier ne porte pas cette ligne — ce n'est pas un
montant nul. »* Mulcent (78439), vérifié dans le dépôt : dette **200 000 € en 2021, 0 en 2024,
0 en 2025**. La commune a remboursé sa dette, et le produit répond qu'il ne sait pas.
**Mesuré : 71 communes franciliennes** sont dans ce cas sur la dette.

**Une ligne de code détruit le meilleur moment produit de Repère, et affirme son contraire.**

### La cascade, réordonnée par la couverture mesurée
1. **l'argent de la commune, contre elle-même dans le temps** — 100 % (mesuré) ;
2. un projet financé par l'État — ≈887 projets IDF pour 2025 ;
3. l'obligation légale de logements sociaux — **427 communes en champ légal** (et « la loi ne vous
   impose pas d'objectif » est une réponse pour les 839 autres) ;
4. la conformité de l'eau du robinet — 23/23 codes valides testés ;
5. un risque naturel reconnu par arrêté — Saint-Denis : 11 risques, 17 arrêtés CATNAT.

Le premier niveau ne peut jamais manquer. **La cascade existe pour la profondeur, pas pour boucher
un trou.**

---

# L. NAVIGATION RECOMMANDÉE

```
[ Chez vous ]   [ Qui décide ]   [ Où va l'argent ]
```

Trois onglets, une seule ligne à 390 px. **« Repère »** — sources, doctrine, mentions légales — en
lien d'en-tête, pas en onglet : c'est D-04, décidée et jamais appliquée.

**Les propositions à cinq onglets sont écartées, et le produit public le démontre au lieu de
l'illustrer** : la navigation en ligne est exactement `Fil · Agenda · Qui dirige · Jouer · Moi`, et
deux de ses onglets affichent qu'ils sont vides. « Moi » promet un compte que les invariants
excluent ; « Agenda » serait vide pour 99,9 % des communes ; « Suivi » implique des notifications ;
« Jouer » est la gamification que l'invariant 6 interdit.

**Ce que devient chaque onglet.** « Chez vous » absorbe et remplace « Ce qui a été décidé » : faits
locaux **uniquement**, un seul critère d'admission — *le fait doit être propre à la commune*. Les
votes du député retournent dans « Qui décide », où ils sont déjà, mieux cadrés. « Où va l'argent »
devient l'écran du aha moment, avec l'évolution dans le temps.

---

# M. DATASETS DISPONIBLES

Onze retenus, vérifiés le 14/09 — producteur, licence, couverture mesurée, pièges lus dans les
vraies lignes. Le détail est dans `DATA_EXPLORATION_14_09_2026.md`. Les cinq qui comptent pour
décembre :

| question citoyenne | source | porte | couverture IDF mesurée | fraîcheur |
|---|---|---|---|---|
| « Ma commune doit-elle encore de l'argent ? » | **OFGL, déjà dans le produit** | **(c)** | **100 %** | 29/07/2026 |
| « L'eau de mon robinet est-elle potable ? » | Hub'Eau | **(b)** | 23/23 codes valides testés | mensuelle |
| « Ma commune respecte-t-elle la loi sur le logement social ? » | Inventaire SRU | **(a)** | 427 communes en champ légal | annuelle |
| « Suis-je en zone inondable ? » | Géorisques | **(a)+(c)** | 11 risques, 17 CATNAT à Saint-Denis | licence **non vérifiée** |
| « Qui siège au conseil municipal ? » | RNE | fait daté | **27 431 conseillers, 1 264 maires** | **trimestrielle** |

**Deux découvertes de la recherche du 15/09 qui changent un arbitrage :**

**Le RNE est trimestriel, pas quotidien.** Publications observées en 2026 : 2026-05-05, puis
2026-08-11. Donc **le « 11 août 2026 » affiché est exact — c'est bien la dernière version du
RNE.** La red team a raison que rien ne l'automatise ; elle a tort sur l'impact. **Construire un
collecteur quotidien des élus ne changerait rien** : la source ne bouge que quatre fois par an.
La bonne correction est une phrase à l'écran — « le Répertoire publie chaque trimestre » — pas un
chantier. *C'est l'arbitrage que je rends contre ma propre red team.*

**`tabular-api.data.gouv.fr` est une vraie API d'interrogation** sur la ressource officielle :
`?Code de la commune__exact=93048&Libellé de la fonction__exact=Maire` renvoie une ligne, ~1 Ko.
Opérateurs confirmés : `__exact`, `__in`, `__contains`. `page_size` max **100**. **Ce n'est pas un
miroir tiers.** Cela ouvre une collecte par commune au lieu d'un téléchargement de **65 Mo**
(conseillers municipaux) ou 4 Mo (maires).

**L'URL officielle de chaque commune existe, et elle est déclarative.** DILA, annuaire de
l'administration, licence `fr-lo`, mise à jour quotidienne, champ `code_insee_commune`. Mais
**aucun champ n'indique une vérification** : ni code HTTP, ni date de contrôle. Couverture
**non vérifiée** exhaustivement (robots.txt bloque l'API) ; sur un échantillon de 12 communes :
**URL 8/12** — 4/8 en Seine-et-Marne rurale, 4/4 dans les Hauts-de-Seine — courriel 11/12,
téléphone 12/12, horaires 12/12. Et la licence DILA impose **quatre mentions** : paternité,
URL longue de téléchargement, nom du fichier, date du fichier.

---

# N. QUESTIONS CITOYENNES

**Tenables tout de suite, sans aucune donnée nouvelle**
1. « Ma commune doit-elle encore de l'argent, et est-ce moins qu'avant ? » — 100 %, porte (c)
2. « Qui décide de l'école, de la cantine, des permis ? » — six phrases de compétence, déjà écrites
3. « Combien ma commune dépense-t-elle, et pour quoi ? » — six agrégats en langue citoyenne
4. « Qui est mon maire, qui est mon député ? »
5. « D'où vient cette information ? »

**Tenables avec une source vérifiée et peu de code**
6. « L'eau de mon robinet est-elle potable ? » — porte (b), verdict écrit par le producteur
7. « Ma commune respecte-t-elle son obligation de logements sociaux ? » — porte (a)
8. « Suis-je en zone inondable, y a-t-il eu une catastrophe reconnue ? » — porte (a) + (c)
9. « Qu'est-ce que l'État a financé chez moi ? » — déjà construit, jamais collecté
10. « Ma commune fait partie de quelle intercommunalité ? » — sous réserve de dire que les EPT manquent

**Impossibles, et il faut cesser de les espérer**
11. « Qu'a voté mon conseil municipal ? » — la donnée n'est pas cachée, **elle n'est pas produite**
12. « Quand est le prochain conseil municipal ? » — aucune consolidation ; l'onglet Agenda du site
    public l'affiche en production
13. Délai d'attente d'un logement social, tarif de cantine, places de crèche, chômage communal

---

# O. FEATURES CANDIDATES

| # | feature | valeur | coût | rang |
|---|---|:---:|:---:|:---:|
| 1 | **Distinguer un zéro publié d'une absence** | 5 | **1** | **P0** |
| 2 | **Le nom complet du maire** (72 maires mutilés) | 5 | **1** | **P0** |
| 3 | **Péremption du cache** — sans elle la bêta mesure un produit gelé | 5 | 2 | **P0** |
| 4 | **Contrôle de fraîcheur en valeur**, qui fait échouer le banc | 5 | 1 | **P0** |
| 5 | **Univers des communes sur le COG** (4 communes absentes en IDF) | 4 | 2 | **P0** |
| 6 | **Un seul chemin de publication** (`netlify.toml` sur `main`, `site/` hors du chemin) | 5 | 1 | **P0** |
| 7 | **L'évolution dans le temps sur « Où va l'argent »** — le aha moment | **5** | 2 | **P0** |
| 8 | Sortir `comptes` du paquet d'entrée (79 % du poids) | 4 | 2 | **P0** |
| 9 | La période nommée sur les votes (« du 16 au 21 juillet, 80 des 8 434 scrutins ») | 4 | 1 | **P0** |
| 10 | Refonte de « Ce qui a été décidé » en « Chez vous », trois onglets | 4 | 3 | P1 |
| 11 | L'eau du robinet | **5** | 2 | P1 |
| 12 | L'objectif SRU | **5** | 2 | P1 |
| 13 | Conseillers municipaux (RNE, `tabular-api`) | 4 | 2 | P1 |
| 14 | L'intercommunalité nommée, avec la réserve EPT | 4 | 2 | P1 |
| 15 | Risques et arrêtés CATNAT | 4 | 3 | P1 |
| 16 | Le lien vers le site officiel de la commune + test de vivacité | 3 | 3 | P2 |
| 17 | Indice ATMO quotidien | 3 | 2 | P2 |
| 18 | Permis de construire (Sitadel) | 4 | 4 | P2 |
| 19 | Marchés publics (DECP) | 4 | 4 | P2 |
| 20 | Compétences réelles de l'EPCI (un XLSX de distance) | **5** | 4 | P2 |

---

# P. FEATURES REJETÉES

| rejeté | motif |
|---|---|
| **le fil daté unique** | 73 % de contenu national sous un titre communal, et un tri par date qui garantit **en permanence** que le local passe après. La charpente est fausse, pas le réglage |
| **les votes du député dans le fil communal** | identiques pour toute la circonscription, doublon appauvri de « Qui décide » |
| **un onglet « Moi »** | ni compte, ni courriel, ni notification. L'onglet démentirait la promesse fondatrice |
| **un onglet « Agenda »** | vide pour 99,9 % des communes. Démontré en production |
| **un onglet « Jouer »** et tout compteur de série | invariant 6 |
| **le suivi de position persistant** (option C) | aucune justification ne le rachète |
| **une carte** | aucune donnée retenue n'en a besoin, et une carte demande une position |
| **toute comparaison entre communes** | y compris par habitant, en total, et en compteur de badge |
| **les délibérations municipales consolidées** | non produites. Troisième confirmation |
| **la carte des loyers** | aucune porte franchie, et 57,3 % des valeurs IDF sont des prédictions de maille |
| **les indicateurs d'activité des bibliothèques, les licences sportives** | n'existent que pour être comparés |
| **les gares du Grand Paris Express (SGP)** | dernière mise à jour 19/12/2016, et le producteur décline toute valeur juridique |
| **les grands travaux d'été IDFM** | licence **CC BY-NC-ND** : aucun dérivé autorisé |
| **un collecteur quotidien des élus** | la source est trimestrielle. Ce serait du bruit, pas de la fraîcheur |
| **une réécriture d'architecture** | pas sans mesure. Le monorepo tient 111 Ko et 134 contrôles |

---

# Q. SÉCURITÉ ET VIE PRIVÉE

### La géolocalisation : je retiens (A), et j'autorise (B) sous quatre conditions

**L'argument décisif est une incohérence de deux ordres de grandeur.** L'invariant 2 interdit
qu'une adresse porte **cinq chiffres** de code INSEE, au motif que « cela révélerait au serveur la
commune de son lecteur ». La version en production envoie **la latitude et la longitude brutes,
toutes décimales, dans une chaîne de requête GET** — une position qui désigne un bâtiment, vers un
tiers, dans l'endroit d'une requête HTTP qui entre le plus sûrement dans un journal d'accès.
**Le produit interdit l'approximation et livre l'exactitude.**

Trois points de plus : les deux contrôles statiques « aucune ressource d'un autre hôte » refusent
cet appel dans le monorepo ; il n'y a pas de `maximumAge`, donc la position peut être **une position
en cache correspondant à un autre lieu**, attribuée comme « votre commune » sans le dire ; et la
finalité — trouver une commune — **ne nécessite pas cette précision**.

**Si (B) est retenue malgré tout** : arrondir à 2 décimales avant l'envoi (≈1 km, suffisant pour une
commune, insuffisant pour un domicile), **le dire à l'écran**, poser `maximumAge: 0`, et reformuler
la promesse — « envoyées au service public de l'État », sans promettre à sa place. Le repli manuel
reste toujours offert.

**Le coût réel de (A), mesuré :** la règle de recherche absorbe accents, apostrophes et traits
d'union, et l'ordre de pertinence est correct. Le coût résiduel est ailleurs — **quatre communes de
la bêta ne peuvent pas être tapées du tout**, et quatre homonymes (Blandy 77/91, Marolles-en-Brie
77/94, Mondreville 77/78, Saint-Martin-des-Champs 77/78) donnent, en cas d'erreur, un écran
**entièrement plausible** sans autre signal qu'une ligne grise. **(A) est défendable à condition de
boucher ces trous** — et de remplacer « Tapez les premières lettres — Ustaritz, Bayonne… » par trois
communes franciliennes.

### Monétisation
Les écrans d'abonnement restent en veille. **La décision est prise depuis des semaines et n'a jamais
atteint le site public** : `s-abo` y est atteignable par quatre boutons. Ce n'est pas une décision à
reprendre, c'est une publication à faire.

### Ce qui manque et qui ne coûte rien
Un ours : éditeur identifié, responsable de publication, et **« signaler une erreur sur ce fait »**
à un cran. Publier des positions politiques nominatives sans droit de réponse est le seul défaut de
cette liste qui n'a aucune excuse technique.

---

# R. ACCESSIBILITÉ

**Acquis et gardé** : plancher 13 px sur sept écrans, cibles ≥ 44 px, contraste ≥ 3:1 en thème
sombre, `prefers-reduced-motion` respecté par le navigateur sans JavaScript.

**Ce qui manque, et le dépôt le dit lui-même.** Le CSS de `.groupe` justifie de ne pas en faire un
titre parce que « le `role="group"` et son `aria-label` s'en chargent ». **Sur « Ce qui a été
décidé », il n'y a ni `role="group"` ni `aria-label`**, et le `<p>` est imbriqué à l'intérieur du
premier fait du groupe. Un utilisateur de lecteur d'écran passe de l'unique `h2` de la carte à douze
faits indifférenciés, sans jamais entendre qu'il change de famille. **La mitigation sur laquelle le
CSS compte n'existe pas.**

Reste aussi : un `h1` par écran, un réglage de taille du texte, et la casse RNE en CAPITALES qui
dégrade la lecture pour tout le monde.

---

# S. PERFORMANCE

| | mesuré |
|---|---:|
| premier écran, Bagnolet (93) | 91,2 Ko |
| parcours complet, Bagnolet | 111,0 Ko |
| **parcours complet, Seine-et-Marne (77)** | **173,6 Ko** (déduit) |
| **parcours complet, Pas-de-Calais (62)** | **194,9 Ko** (déduit) |
| part de l'OFGL dans un paquet départemental | **79 à 80 %** |
| `territoire/{dep}` après découpage, le plus lourd France | **17,2 Ko** (mesuré) |
| `territoire/77` | **11,2 Ko** (mesuré) |
| index de noms national, en un fichier | **278 Ko gz** (mesuré) — **ne passe pas** |
| index de noms, 256 seaux de hachage | **1 930 o au pire** (mesuré) |

**La cible de budget doit changer d'objet** : *premier écran ≤ 100 Ko compressés, mesuré sur le
département le plus lourd du périmètre publié.* Le plafond actuel est un plafond mesuré à l'endroit
le plus favorable.

**Ce qui casse à l'échelle nationale, dans l'ordre** : l'index de noms (278 Ko) ; l'univers des
communes (305 absentes) ; le second dérivateur de code département, sans la branche `98`, pour les
65 communes du Pacifique.

**Le hachage détruit la géographie, et c'est mesuré :** chaque seau de 256 étale ses ~135 communes
sur **57 à 79 départements** (médian 67). Un serveur qui voit passer `noms/a7.json` apprend que la
commune est l'une de 131, sur 70 départements — strictement moins informatif qu'un code de
département, que le produit accepte déjà.

---

# T. TESTS

**L'état** : 53 statiques, 81 navigateur. C'est beaucoup, et c'est bon — mais **la mesure de la
couverture du banc révèle deux angles morts structurels** :

1. **Aucun contrôle ne compare une date à un seuil** (D-5). La fraîcheur, qui est la promesse
   centrale du produit, n'a aucune garde.
2. **Aucun contrôle ne compare ce qui est en ligne à ce qui est construit.** C'est celui qui
   manquait le plus : il aurait crié le 20 août.

**Ce que chaque feature doit apporter**, et le dépôt a déjà la culture pour l'exiger :
donnée (le producteur publie-t-il vraiment ce champ, lu ligne à ligne) · logique · provenance
(le fait porte sa source, et le contrôle échoue sinon) · régression · navigateur, **sur une donnée
qui exerce vraiment le code** — la leçon d'hier : le fil avait été mesuré sur Bagnolet, qui n'a
aucun projet, donc la moitié du code ne s'exécutait pas · cas limite : Paris, les 118 communes
multi-circonscriptions, une commune sans maire, un zéro publié, une source absente.

**Et la règle qui vaut plus que les autres** : quatre défauts sur cinq trouvés le 13/09, et les
trois plus graves du 14/09, ont été trouvés **à l'œil sur capture** ou **en lisant les vraies
lignes d'une source**. Jamais par une assertion. Les assertions gardent ce qu'on sait déjà.

---

# U. RISQUES

### Bloquants — rien ne se montre à un habitant avant
| # | risque | preuve |
|---|---|---|
| U-1 | **Le produit affirme le contraire de la vérité** sur la dette de 71 communes | `OuVaArgent.jsx:11` ; Mulcent 200 000 € → 0 |
| U-2 | **72 maires nommés de travers** | `QuiDecide.jsx:366` ; « Alexandre DE MEULENAERE » → « MEULENAERE » |
| U-3 | **Le cache ne périme jamais** : la bêta mesurerait un produit gelé | `client.js`, `store.js` sans horodatage, `vider()` jamais appelé |
| U-4 | **La fraîcheur n'a aucun contrôle de valeur** | 0 comparaison à un seuil sur 134 contrôles |
| U-5 | **La chaîne peut passer au vert avec toutes ses sources mortes** | chaque collecteur démoté en `\|\| echo "::warning::"` |
| U-6 | **Deux produits coexistent sans que personne le sache** | `netlify.toml` absent de `main` ; `site/` servi |
| U-7 | **Aucun éditeur identifié, aucun droit de réponse**, pour des positions politiques nominatives | mesuré sur le monorepo |

### Graves
U-8 **La capture la plus dangereuse que le produit puisse produire** : « Comment Yaël Braun-Pivet a
voté — le relevé ne porte aucune position ». La présidente de l'Assemblée nationale, présentée comme
une élue sans position, sur un écran qui ne dit pas que la période couvre quatre jours.
U-9 Quatre communes d'Île-de-France n'existent pas, sous un taux de couverture de 100 %.
U-10 « Les transports » attribués à l'intercommunalité par la phrase de compétence, alors que
l'arête `ELU→COMPÉTENCE` est impossible et que les EPT sont absents.
U-11 La géolocalisation en production, quatorze chiffres contre cinq interdits.
U-12 « engagé » lu comme « versé », et un taux calculé entre un montant HT et une subvention.

### Structurels
U-13 La donnée publique locale ne bouge pas à la semaine. **Toute promesse de fraîcheur est une
dette.** U-14 Un seul mainteneur privé derrière la version exploitable des marchés publics.
U-15 Le découpage des circonscriptions date de **2010**. U-16 Présidentielle en avril 2027 : le
produit sera lu politiquement, quoi qu'il fasse.

---

# V. ROADMAP P0 / P1 / P2

### P0 — sans quoi il n'y a pas de bêta. Rien d'autre ne commence avant.

**Bloc 1 — cesser d'affirmer des choses fausses** *(un jour)*
Distinguer un zéro publié d'une absence · le nom complet du maire · la période nommée sur les
votes · l'univers des communes sur le COG, avec une phrase pour les communes sans maire.
*Chaque correctif arrive avec son contrôle, écrit en même temps.*

**Bloc 2 — un seul chemin de la source à l'URL** *(un jour, dont une décision humaine)*
`netlify.toml` sur `main` · `site/` hors du chemin de publication · une seule chaîne qui publie ·
un contrôle qui compare l'en-ligne au construit.

**Bloc 3 — la fraîcheur devient une garde** *(deux jours)*
Péremption du cache, calculée au rendu · trois états, trois phrases · un contrôle statique qui
**fait échouer le banc** sur un relevé périmé · la chaîne échoue sur une source établie non
rafraîchie.

**Bloc 4 — réparer la collecte** *(dépend du journal, non lisible sans être connecté)*

**Bloc 5 — le aha moment** *(deux jours)*
« Où va l'argent » porte l'évolution dans le temps. Deux phrases, une provenance, aucune donnée
nouvelle. **Puis mesurer combien des 1 266 communes ont un fait à montrer.**

**Bloc 6 — l'ours** *(une heure)* Éditeur, responsable de publication, « signaler une erreur ».

### P1 — après validation du P0, dans cet ordre, une par une, cycle complet chacune
Trois onglets et « Chez vous » · l'eau du robinet · l'objectif SRU · les conseillers municipaux ·
l'intercommunalité nommée · les risques et arrêtés CATNAT · sortir `comptes` du paquet d'entrée.

### P2 — expérimentation, pas avant janvier
Le lien vers le site officiel de la commune, avec test de vivacité · l'indice ATMO · les permis de
construire · les marchés publics · les compétences réelles de l'EPCI.

**Rien de P1 ou P2 ne démarre sans avoir écrit, avant : donnée → pipeline → UX → test →
maintenance.**

---

# W. MÉTRIQUES BÊTA

**La métrique cardinale :** *combien des **1 266** communes d'Île-de-France peuvent afficher au
moins un fait local, nommé, daté et sourcé ?* Aujourd'hui : **inconnu**. Objectif décembre :
**100 %**, et la mesure du § K dit que c'est atteignable sans aucune donnée nouvelle.

| métrique | aujourd'hui | objectif décembre |
|---|---|---|
| communes avec ≥ 1 fait local | inconnu | **100 % des 1 266** |
| communes absentes de l'index | **4** (mesuré) | **0** |
| affirmations fausses affichées | **3** (mesuré) | **0** |
| une URL publique sert le produit construit | **non** | oui |
| âge maximal d'un relevé affiché sans avertissement | **19 jours, muet** | ≤ 7 jours, et dit |
| premier écran, département le plus lourd | 159,7 Ko (77, déduit) | **≤ 100 Ko** |
| contrôles comparant une date à un seuil | **0** | ≥ 3 |
| testeurs nommant un fait local en 10 s | non mesuré | **≥ 8 / 10** |
| testeurs imputant un vote national à la mairie | non mesuré | **0 / 10** |
| testeurs distinguant « rien » de « pas su » | non mesuré | **10 / 10** |

**Ce qu'on ne mesurera pas, et c'est délibéré** : aucune visite, aucune session, aucun temps passé,
aucun taux de retour. **Repère ne mesure rien sur ses lecteurs — c'est un invariant, pas une
lacune.** La rétention se déduira du banc et des retours, ou ne se mesurera pas. Un produit qui
installerait un mouchard pour prouver sa valeur aurait perdu la sienne.

---

# X. PLAN DE MIGRATION VERS LE PRODUIT PUBLIC

Le monorepo pèse 164 Ko là où le site public en pèse 16 292 552. La bascule n'est pas une
amélioration : c'est un changement de produit, avec une navigation différente, des fonctionnalités
retirées, et une promesse de confidentialité plus stricte. **Elle se fait en cinq étapes, et chacune
est réversible.**

**1. Arrêter de servir un fixture.** *Aujourd'hui.* Trois options, il faut en choisir une
explicitement : republier le mono-HTML à jour, basculer sur le monorepo, ou poser une page d'attente
honnête. **Laisser un build du 19 août avec des données du 29 juin n'est aucune des trois.**

**2. Une URL de démonstration pour le monorepo, distincte de la production.** `netlify.toml` porte
déjà la bonne recette ; il suffit qu'il soit sur `main`. La production reste inchangée. Aucun
risque, et on peut enfin regarder le monorepo dans un navigateur réel.

**3. Les P0 sur cette URL, et le banc de dix testeurs dessus.** C'est là que les trois affirmations
fausses, le cache et la fraîcheur se prouvent corrigés — sur une URL, pas sur un build local.

**4. La bascule, un jour choisi, avec le retour en arrière préparé.** Netlify garde ses
déploiements : le retour est un clic. Ce qui doit être écrit **avant** : ce qui disparaît pour un
utilisateur du site actuel — l'agenda, le jeu, le compte, la géolocalisation, l'offre payante — et
pourquoi chacun disparaît.

**5. Retirer `site/` du dépôt, ou le renommer `site_reference/`.** Tant qu'un fixture de 16 Mo porte
un nom qui ressemble à une destination de publication, l'accident peut se reproduire.

---

## L'ARBITRAGE QUE JE RENDS, ET CONTRE QUI

Contre ma propre red team : **pas de collecteur quotidien des élus.** La source est trimestrielle,
mesuré ; un job quotidien produirait du bruit et une fausse impression de fraîcheur. La correction
est une phrase.

Contre ma propre revue produit d'hier : **le aha moment n'est pas un projet financé par l'État.**
Mesuré, il ne couvre pas la majorité des communes. Le fait le plus fort est l'argent de la commune
comparé à lui-même dans le temps : 100 % de couverture, zéro donnée nouvelle, et une bonne nouvelle
pour 94 % des habitants.

Contre l'instinct d'ajouter : **aucune des onze sources retenues ne se branche avant que le produit
cesse d'affirmer trois choses fausses.** Une donnée de plus sur un produit qui se contredit
n'augmente pas sa valeur : elle augmente la surface de ce qu'il faut croire.

Et contre moi-même : **j'ai écrit 713 lignes de revue produit sans ouvrir l'URL publique.** La règle
était dans le dépôt depuis le début. Un audit produit commence par ouvrir le produit tel qu'un
citoyen l'atteint.
