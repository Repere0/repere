## RAPPORT — cartographie du chargement des données
`/home/claude/repere/app_repere_v18_20.html` — 16 994 801 octets, 16 214 lignes, 7 blocs `<script>`.

---

### 1. Les grandes tables embarquées

Répartition mesurée du fichier (octets réels, lignes comptées) :

| bloc | lignes | octets | part |
|---|---|---|---|
| en-tête + CSS + balisage + script « bandeau tronqué » | 1–3652 | 105 143 (script) + ~1,1 Mo balisage/CSS | ~7 % |
| **`window.REPERE_DATA`** | **3655** (une seule ligne) | **9 772** | 0,06 % |
| **`window.REPERE_RNE`** | **3675** (une seule ligne) | **6 778 276** | **39,9 %** |
| **`window.REPERE_OFGL`** | **3693** (une seule ligne) | **8 832 703** | **52,0 %** |
| script applicatif principal | 3696–9705 | 416 665 | 2,5 % |
| script agenda + reste | 9706–15994 | 671 868 | 4,0 % |
| **`window.REPERE_AGENDA_AN`** | **9712–15993** (multi-lignes, ferme par `]};` L15993) | **~625 000** (dont 31 227 pour la seule L9712 : `org` + début de `r`) | 3,7 % |
| `window.REPERE_COMPLET = true` | 15996 | 49 | — |
| script final (agenda AN, arrivée, landing) | 15998–16214 | 10 527 | 0,06 % |

**Le bloc `<script>` L3657–3695 pèse à lui seul 15 613 199 octets, soit 91,9 % du fichier.** Deux lignes. Tout le reste — code, CSS, balisage, agenda — tient dans 1,38 Mo.

Structure interne mesurée (JSON reparsé) :

**`REPERE_RNE`** (L3675, marqueurs `/* REPERE_RNE_DEBUT */` L3665 et `/* REPERE_RNE_FIN */` L3676) :
- tables **partagées, non découpables par département** : `p` (7 821 prénoms, 103 180 o), `n` (74 728 noms, 899 011 o), `f` (104 fonctions, 3 940 o), `e` (1 241, 34 897 o), `cn` (2 066, 33 502 o), `d` (254 dates, 3 556 o) → **991 878 o à eux seuls**. Les fiches sont encodées en **index** vers `p`/`n`/`f` (`rneFicheDe`, L6268-6272 : `R.p[ligne[0]]`, `R.n[ligne[1]]`, `R.f[ligne[2]]`).
- tables **clés par code INSEE de commune** : `com` 34 637 (855 627 o), `adj` 34 580 (2 267 930 o — la plus lourde), `ecc` 20 028 (1 331 073 o), `ccan` 34 450 (500 194 o), `cl` 34 637 libellés (865 999 o), `dcom` (415 644 o), `dadj` (415 226 o).
- tables **clés par département** : `dep` 95 (69 858 o), `depcan` (22 776 o), `nat` 109 (19 653 o), `ddep`, `dnat`.
- `reg` 14 (30 222 o), `csp` 10 (10 589 o), `arr` 3, `meta` 24 clés (856 o).

**`REPERE_OFGL`** (L3693, marqueurs L3685/L3694) : `v`, `meta` (691 o), `ech` avec trois sous-arbres `{terr, exercices, source}` :
- `ech.commune` : **10 196 640 o reparsés** — `terr` clé par code INSEE, valeurs `{ex:{"2025":[13 nombres], …}}` ;
- `ech.departement` : 162 567 o ; `ech.region` : 28 803 o.
Le communal représente **98,1 % d'OFGL**.

Tables JS ordinaires (non `window.*`), toutes petites et toutes nationales : `DEPTS` (L3729, généré depuis une chaîne), `REGIONS` (L3723), `DICO` (L4133), `COMMUNES_FALLBACK` (L4509, repli de recherche), `ELUS` (L5974), `FEED` (L7167), `CAL_EVENTS` (L7421), `ESSENTIEL` (L6997), `ARGENT` (L7918), `COMPETENCES` (L7831), `CIRCOS` (L7614), `SCRUTINS` (L5628). `RNE_FICHES` (L6228) et `RNE_PLUS` (L6431) naissent vides et se remplissent à l'usage.

---

### 2. Séquence de démarrage

Tout est **synchrone, en flux, dans l'ordre du document**. Deux seuls points d'accroche asynchrones dans tout le fichier (`grep DOMContentLoaded|onload|readyState`) : L2304-2305 et L16193-16194.

1. **L2264–2310** — IIFE « bandeau tronqué ». Pose un écouteur `load` → `verdict()` et un dernier recours `setTimeout(verdict, 12000)`. `verdict()` teste `window.REPERE_COMPLET === true` ; sinon affiche le bandeau, puis réessaie 20 fois toutes les 250 ms (L2298-2301).
2. **L3655** — `REPERE_DATA` parsé (9,7 Ko).
3. **L3675 puis L3693** — `REPERE_RNE` puis `REPERE_OFGL` parsés. **C'est ici que passent les 15,6 Mo** ; le commentaire L2253-2256 mesure 2 562 ms sur un chromium de bureau pour l'analyse complète du fichier.
4. **L3696–9705** — script principal. Définitions, puis appels de haut niveau (colonne 0) dans cet ordre :
   - L4481-4485 : écouteurs globaux ; L6835 : câblage des onglets ; L6836 **`appliquerVeille()`** ; L7147 `appbar.classList.add("home")` ; L7312/L7339 : construction des puces ;
   - L8648/L8655/L8667 : écouteurs document ;
   - **L9238 `renderEss()` → L9239 `renderFeed()` → L9240 `majFraicheur()` → L9241 `serieMaj()` → L9253 `renderMoiHead()` → L9254 `renderCarnetMoi()` → L9255 `renderSujets()` → L9256 `wireRowsToSwitches()` → L9257 `wireClickables()` → L9258 `wireScrollHints()`** ;
   - L9264 : IIFE qui rend `#shell` inerte et pose le focus dans l'onboarding ;
   - **L9689 `renderCarteDepts()`**.
5. **L9712–15993** — `REPERE_AGENDA_AN` parsé (~625 Ko).
6. **L15996 — `window.REPERE_COMPLET = true;`**, dans un bloc `<script>` de 49 octets à lui seul (L15995–15997). C'est le **dernier script avant le script final** : le drapeau atteste que les 16 Mo ont été analysés, rien d'autre. Aucune fonction ne le pose ; c'est une affectation nue.
7. **L15998–16212** — agenda AN (`AN_ETAT`, `anCharger`, `anRendre`) et **`repereArrivee()`** (L16175), branché L16193-16194 sur `load` (ou immédiat si `readyState === "complete"`).

**Rien au démarrage ne lit `REPERE_RNE` ni `REPERE_OFGL`.** Vérifié : `renderEss`, `renderFeed` (L9059), `majFraicheur` (L7364, lit `FEED`), `serieMaj`, `renderMoiHead` (L9242, lit `terr()`), `renderSujets` (L9223, lit `FEED`), `renderCarteDepts` (L9611, lit `DEPTS`/`REGION_POL`) — aucune n'y touche. Le coût des 15,6 Mo au démarrage est **entièrement du parsing JSON**, pas de la lecture applicative.

---

### 3. Fonctions qui lisent les tables

**Lecteurs de `REPERE_RNE`** — aucun n'est appelé au démarrage :

| ligne | fonction | déclenchée par |
|---|---|---|
| 6231 | `rneOk()` | garde, appelée par tous les autres |
| 6235 | `rneMeta()` | mentions de licence, à l'écran |
| 6268 | `rneFicheDe()` | via `renderQui`/`rneElusLocaux` |
| 6288 | `rnePresident()` | via `rneElusLocaux` |
| 6300 | `rneElusLocaux()` | `renderElus` (L6541), écran `s-elus` |
| 6328 | `rneIndex()` | **`rneCherche` → onboarding, AVANT le choix de commune** |
| 6343 | `rneCherche()` | `fallbackSearch` (L4580) et `obValidateTyped` (L4639) |
| 6367 | `rneCommuneNom()` | `renderQui` (L3878), `ofglNom` (L8210) |
| 6377/6385 | `rneDateISO`/`rneDateDe` | via `renderQui` |
| 6398 | `rneFaits()` | fiche d'élu (`openRne`/`openElu`) |
| 6445/6454 | `rneRow`/`rneQuiCarte` | `renderQui` |
| 6503 | `openRne()` | geste utilisateur |
| 6533 | `renderElus()` | écran `s-elus` (L4930) |
| **3868** | **`renderQui()`** | **écran `s-qui` (L4920)** — le gros consommateur : `R.com[insee]`, `R.adj[insee]`, `R.ecc[insee]`, `R.ccan[insee]`, `R.dep`, `R.reg`, `R.nat` |
| 5572 | `mesureCouverture()` | via `renderCoverage` (L5718) ← `renderEngineStats` (L5530) ← écran `s-sources` (L4914) |

**Lecteurs de `REPERE_OFGL`** — aucun au démarrage, tous derrière l'écran `s-argent` (L4932 → `renderArgent` L8436) :
`ofglOk` (8174), `ofglCode` (8194), `ofglNom` (8208), `ofglTerr` (8216), `ofglExercices` (8226), `ofglDernierEchelon` (8232), `ofglVal` (8250), `ofglPop` (8257), `ofglSource` (8270), `ofglMentions` (8275), `ofglVide` (8291), `ofglBloc` (8318). Plus `mesureCouverture` (L5609).

**Lecteurs de `REPERE_DATA`** : `renderEngineStats` (5533) et `mesureCouverture` (5573) — écran `s-sources` seulement.

**Lecteurs de `REPERE_AGENDA_AN`** : `anCode` (16035), `anLibelle` (16039), `anSelection` (16052), `anRendre` (16100) — écran `s-an`, ouvert par `show("s-an")` qui fait un `setTimeout(…, 0)` explicite (L6806-6809) « 6 280 lignes ne se rendent pas au chargement ».

---

### 4. Le parcours d'arrivée et le moment où l'INSEE devient connu

- **`#ob-input`** : L2375-2377. `oninput="obSuggest(this.value)"`, `onkeydown` Entrée → `obValidateTyped()`. Bouton L2380 `onclick="obValidateTyped()"`. L2418 : `<button onclick="finishOnboard()">C'est parti</button>`.
- **`obSuggest(v)`** L4620 : debounce 120 ms → `renderSugList(fallbackSearch(q))` → `fallbackSearch` L4579 → **`rneCherche(q, 7)`** → **`rneIndex()`** L6328, qui construit en une fois un tableau de 34 637 entrées normalisées et triées à partir de `R.cl`. `renderSugList` L4553 écrit `obPick('nom','dept','code')` dans chaque bouton.
- **`obValidateTyped()`** L4631 : `rneCherche(raw,7)`, correspondance exacte normalisée, sinon 1er résultat, sinon `COMMUNES_FALLBACK`, sinon `obDemanderDept(nom)` (L4657) qui conserve département/région et laisse l'INSEE vide.
- **`obPick(nom, dept, insee)`** L4727 : **`STATE.insee = (insee === undefined) ? null : (insee || null);` — ligne 4733. C'est le moment exact et unique où le code INSEE de la commune devient connu.** Suivi immédiatement de `terr()` (L4734), `coverage()` (L4744), `syncLieuLabels()` (L4751), puis passage à l'étape 2.
- **`finishOnboard()`** L4769 : lève l'inertage, cache l'onboarding, fixe `activeChip`, puis **`renderEss(); renderFeed();`** (L4792) + `renderSujets()` + `renderMoiHead()`. Aucun de ces quatre ne lit RNE ou OFGL.
- **`repereArrivee()`** L16175 : lit `?c=` / `#c=`, remplit `#ob-input`, efface la commune de l'URL par `history.replaceState` (L16186-16189), puis appelle `updateValidateState()` et `obValidateTyped()`. `ldGo(id)` L16196 fait la même chose depuis la landing avec un `setTimeout(…, 420)`.

**Écart entre `obPick` et `finishOnboard` : deux taps utilisateur (étape 2 de confirmation).** C'est la fenêtre exploitable — de l'ordre de la seconde à plusieurs secondes.

**Attention** : `STATE` naît déjà rempli — L3711 `commune:"Fontainebleau", dept:"77", insee:"77186"`. L'app n'a jamais d'état « INSEE inconnu » avant l'onboarding.

---

### 5. Le mécanisme réseau existant

Il existe, il est duplique deux fois, et il est **absent de `app_repere_v18_20.html`** : les deux URL ne sont posées que dans la version servie, par `outils/build_pwa_reconstruit.py` L186 et L205-209 → `site_v18_20/index.html` L9635-9636 :
```
window.REPERE_AGENDA_URL = "donnees/agenda_an.json";
window.REPERE_EVENEMENTS_URL = "donnees/evenements.json";
```

**Chargeur A — agenda AN**, `anCharger()` L16076 :
- `var AN_ETAT = "absent";` L16064. Valeurs déclarées : `"embarque" | "absent" | "en cours" | "servi" | "echec"`.
- Garde de réentrance L16077 ; **absence d'adresse : `if (!window.REPERE_AGENDA_URL) return;`** L16078 — le fichier autonome ne cherche rien.
- `AN_ETAT = "en cours"; anRendre();` **avant** le `fetch` : l'attente est peinte tout de suite (L16107, « Chargement de l'agenda parlementaire... », une phrase, pas un squelette).
- `fetch(url, { credentials: "omit" })` L16081 — **pas de timeout**, pas d'`AbortController`.
- Validation de forme L16089 : `d.v !== 1 || !Array.isArray(d.r) || !Array.isArray(d.org)` → jeté. Le commentaire dit pourquoi : « une page d'erreur renvoyée en 200 par un hébergeur ne doit pas passer pour un agenda ».
- Succès : `window.REPERE_AGENDA_AN = d; AN_MAJ = d.maj || ""; AN_ETAT = "servi"; anRendre();`
- Échec : `.catch(function () { AN_ETAT = "echec"; anRendre(); })` L16097 → `anRendre` L16111-16115 écrit **une phrase et un lien vers la source officielle**, doctrine du vide explicitée en commentaire L16109-16110. Et L16116 : une seule relance, jamais après un `"echec"`.
- Point d'appel : L6806-6809, `show("s-an")`, dans un `setTimeout(…, 0)`.

**Chargeur B — événements du fil**, `evCharger()` L8978 :
- `var EV_ETAT = "absent";` L8976, mêmes quatre états (L8975).
- Mêmes gardes (L8979-8980), même `credentials: "omit"`, même validation `d.v !== 1 || !Array.isArray(d.r)` (L8986), **pas de timeout**.
- Succès : `evFusionner(d.r)` L8987 → L9031-9057 rejette toute entrée sans `t`/`d`/`src` (« sans preuve, on n'affiche pas »), trie par date décroissante, `FEED.unshift`. Puis re-rend **seulement si l'onglet courant est `s-fil`** (L8989).
- Échec : `.catch(function () { EV_ETAT = "echec"; })` L8993 — **muet**, « le fil reste ce qu'il etait ». Contrairement à A, aucune phrase à l'écran : le fil embarqué tient lieu d'état.
- Point d'appel : **L9061, première ligne de `renderFeed()`** — donc au démarrage (L9239) et à chaque `finishOnboard()`.

Un troisième appel réseau existe hors de ce cadre : `obUseLocation()` L4687 → `fetchWithTimeout("https://geo.api.gouv.fr/communes?lat=…&lon=…", 3500)` (helper L4540). L'ancienne recherche par nom via geo.api.gouv.fr a été retirée (commentaires L4575-4578 et L4611-4616).

**Le contrôle du banc** : `test_repere.mjs` L394-398 filtre toutes les adresses observées par `/[\/=](\d{5}|2[AB]\d{3})(\.json|\/|$|&)/` ou `/insee=|commune=/i`. Un fichier `donnees/dept-77.json` passe ; `donnees/77186.json` ou `?insee=77186` échoue. La regex n'attrape **pas** un code à 2 ou 3 chiffres — le découpage départemental est explicitement autorisé.

---

## Points d'appel à rendre asynchrones, et difficulté anticipée

Si `RNE.{com,adj,ecc,ccan,cl,dcom,dadj,dep,depcan,nat,ddep,dnat}` et `OFGL.ech.commune.terr` partaient dans un `donnees/dept-XX.json` chargé après `obPick()` :

**Volumes mesurés pour un fichier départemental** (RNE + OFGL communal, JSON compact) : 77 → 221 Ko ; 59 → 291 Ko ; 01 → 160 Ko ; 2A → 50 Ko ; 75 → 2,4 Ko. Ordre de grandeur : **150 à 300 Ko par département**, sur ~15,6 Mo aujourd'hui.

| # | point d'appel | ligne | difficulté |
|---|---|---|---|
| 1 | **`rneIndex()` / `rneCherche()`** | 6328 / 6343 | **La plus dure, et elle est structurelle.** La recherche s'exécute AVANT que le département soit connu : elle ne peut pas attendre le fichier départemental. `R.cl` (866 Ko) doit rester embarqué, sous une forme ou une autre. Réduit à un index nom→(code, dept) sans le reste, c'est le plancher incompressible du démarrage. Corollaire : sans `cl` embarqué, `obValidateTyped` L4639 tombe sur `COMMUNES_FALLBACK` (49 communes) et le parcours d'arrivée se casse silencieusement. |
| 2 | **`R.p` / `R.n` / `R.f`** | 6270-6272 | **1 Mo de dictionnaires partagés** (`n` = 74 728 noms). Ils sont indexés globalement : un fichier départemental qui ne porte que des index est inutilisable sans eux. Deux issues, toutes deux coûteuses : embarquer 1 Mo au démarrage, ou **réécrire l'ingesteur** (`outils/rne_ingerer.py`) pour ré-indexer par département et matérialiser les noms dans chaque tranche — ce qui gonfle chaque tranche et casse `rneFicheDe` L6268-6272, `rnePresident` L6290, `rneFaits`. Ce point commande tout le reste. |
| 3 | **`renderQui()`** | 3868 | Fonction synchrone de ~180 lignes qui lit sept sous-tables. Appelée depuis `activate()` L4920, elle-même synchrone et suivie de `syncLieuLabels()` et `wireClickables(el)` L4934-4937. Il faut soit une garde « pas encore chargé » qui rende une phrase (doctrine du vide, invariant 5 — surtout pas un squelette animé), soit un re-rendu après arrivée, sur le modèle de `anRendre()` L16100-16121. **Piège** : les états « données absentes du RNE pour cette commune » et « fichier pas encore arrivé » doivent produire deux phrases différentes ; les confondre ferait mentir l'app. |
| 4 | **`renderElus()` / `rneElusLocaux()`** | 6533 / 6300 | Plus simple : `rneElusLocaux()` renvoie déjà `[]` quand `rneOk()` est faux (L6301), et `renderElus` concatène avec `ELUS`. Un état de chargement dégrade proprement en « seulement les fiches rédigées ». À surveiller : L6542 `q ? ELUS.concat(rne) : elusLocaux().concat(rne)` — la recherche par nom silencieusement amputée pendant l'attente. |
| 5 | **`renderArgent()` → `ofglTerr()`** | 8436 / 8216 | Le plus facile à découper — OFGL communal est 98 % du blob et strictement clé par INSEE. `ofglVide(k, cas, nom)` L8291 distingue déjà « territoire inconnu » de « territoire absent du fichier » : **il faut lui ajouter un troisième cas**, « pas encore chargé ». Sans quoi l'app affirmera qu'une commune n'a pas de comptes alors qu'elle attend un fichier. |
| 6 | **`mesureCouverture()`** | 5572 | Compte les données réellement embarquées (`REPERE_DATA`, `REPERE_RNE`, `REPERE_OFGL`, L5573-5609) pour produire le chiffre de couverture affiché en `s-sources`. Avec un chargement partiel, **ce chiffre devient faux par construction** : il mesurerait la tranche d'un département, pas le corpus. Il faut soit un compte porté par un `meta` national embarqué, soit un chiffre déclaré non mesurable. Le commentaire L3648-3652 raconte précisément ce qui arrive quand un chiffre mort survit dans le fichier — ne pas refaire l'erreur en sens inverse. |
| 7 | **`obPick()`** | 4733 | Le déclencheur naturel du `fetch` : `STATE.insee` y devient connu, et deux taps le séparent de `finishOnboard()`. À décider : déclencher sur `STATE.dept` (connu aussi par `obDemanderDept` L4657, sans INSEE) plutôt que sur l'INSEE, ce qui couvre les 238 communes sans maire enregistré. **Attention à `obBack()`** L4761 : changer de commune peut changer de département, il faut une clé de cache par département et une annulation de la requête en vol. |
| 8 | **`STATE` initial** | 3711 | `insee:"77186"` par défaut. Sans une remise à null ou un drapeau « département chargé », le nouveau chargeur croira dès le démarrage devoir chercher le 77. |
| 9 | **`fetch` sans timeout** | 8982 / 16081 | Les deux chargeurs existants n'ont ni `AbortController` ni délai maximal ; `fetchWithTimeout` L4540 existe mais n'est utilisé que par la géolocalisation. Un chargeur départemental sur réseau mobile lent restera « en cours » indéfiniment. |
| 10 | **`evCharger()` appelé dans `renderFeed()`** | 9061 | Précédent à ne pas imiter tel quel : `.catch` muet (L8993) et re-rendu conditionné à `currentTab === "s-fil"` (L8989). Pour un chargeur départemental, l'échec doit être visible — le modèle à suivre est `anRendre()` (phrase + lien officiel), pas `evCharger()`. |
| 11 | **`window.REPERE_COMPLET`** | 15996 | Le drapeau atteste que le document a été lu en entier, pas que les données sont là. Avec un chargement différé il reste correct — mais le bandeau L2276-2281 parle de « plus de 15 Mo » : ce texte devra changer en même temps que le poids. |
| 12 | **chaîne de production** | — | Les blobs sont écrits entre marqueurs (`/* REPERE_RNE_DEBUT */` L3665–L3676, `/* REPERE_OFGL_DEBUT */` L3685–L3694) par `outils/rne_inject.py` et `outils/ofgl_inject.py`. Un découpage départemental impose de modifier ces injecteurs **et** `outils/build_pwa_reconstruit.py` (L186, L205-209, qui pose déjà les deux URL par remplacement d'ancre) **et** de produire ~101 fichiers dans `donnees/`. La version autonome hors ligne (invariant 1) doit continuer à recevoir les tables inline : **deux sorties divergentes à partir d'une seule source**, c'est là que le pipeline risque de mentir sans qu'on le voie. |
| 13 | **contrôle du banc** | test_repere.mjs L394-398 | La regex laisse passer `dept-77.json` et rejette tout code à 5 chiffres. Aucun assouplissement nécessaire — mais elle ne vérifie pas que le fichier départemental est bien départemental : un `donnees/idf.json` ou un `?d=77` passerait tout autant. Le contrôle mesure l'absence d'un code commune, pas la présence d'un découpage correct. |