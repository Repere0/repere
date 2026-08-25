# CONCEPTION — chargeur asynchrone par département

Mesuré le 2026-08-25 sur `/home/claude/repere/app_repere_v18_20.html` (16 994 801 o) et `/home/claude/repere/site_v18_20/index.html` (16 318 989 o). Aucun fichier modifié. Scripts de mesure conservés dans `/tmp/claude-0/-home-claude/4308483e-90d9-5053-bcb6-33eae98f4b9c/scratchpad/mes/`.

---

## 0. Le budget réel, mesuré (gzip, parce que c'est ce qui passe sur le réseau)

| | brut | gzip -9 |
|---|---|---|
| `site_v18_20/index.html` **aujourd'hui** | 16 318 989 | **6 138 147** |
| index.html **privé des deux blocs** (excision réelle entre marqueurs) | 706 911 | **217 190** |
| `donnees/communes.json` (index national, forme proposée § 1.2) | 589 547 | 253 647 |
| `donnees/rne/socle.json` | 173 297 | 60 682 |
| `donnees/rne/<D>.json` | — | min 347 · **médiane 25 718** · max 60 451 |
| `donnees/ofgl/socle.json` | 168 987 | 78 691 |
| `donnees/ofgl/<D>.json` (chemin corrigé) | — | min 43 · **médiane 33 808** · max 92 766 |

**Premier mot lisible : 217 190 o gzip** (28× moins qu'aujourd'hui).
**Parcours d'arrivée complet** (coquille + index + RNE socle + RNE département médian) : **557 237 o**, soit 544 Ko.
**Lecteur qui va jusqu'à « Mon argent »** : + 112 499 o → **669 736 o**, soit 654 Ko, 9,2× moins qu'aujourd'hui.

Le plancher n'est pas la coquille (212 Ko), c'est **l'index des 34 637 communes (248 Ko gzip)**. Il ne compresse pas mieux : j'ai mesuré quatre encodages (dictionnaire JSON 278 086 ; chaîne plate 269 452 ; deux tableaux parallèles 265 005 ; groupé par département 253 559). L'écart entre le meilleur et le pire est de 9 % — la forme n'est pas le levier. **Le levier est le moment**, et c'est ce qui décide de la conception : cet index n'est pas nécessaire au premier écran, il est nécessaire à la première frappe.

---

## 1. La séquence

### 1.1 Ce qui reste embarqué dans LES DEUX versions

Tout ce qui n'est pas `REPERE_RNE` / `REPERE_OFGL` — soit 706 911 o bruts : CSS, balisage, les 6 000 lignes de code applicatif, `REPERE_DATA` (9 772 o), `DEPTS`, `REGIONS`, `DICO`, `COMMUNES_FALLBACK` (49 communes), `ELUS`, `FEED`, `ESSENTIEL`, `ARGENT`, `COMPETENCES`, `CIRCOS`, `SCRUTINS`.

**Plus une addition obligatoire** : les deux `meta` (809 o pour le RNE, 691 o pour l'OFGL) doivent sortir des blobs et devenir un bloc inline permanent, `window.REPERE_META = { rne: {...}, ofgl: {...} }`. Raison : **l'invariant 4 (chaque chiffre porte sa source et sa date) ne peut pas dépendre du réseau.** Aujourd'hui `rneMention()`, `ofglMentions()` et `mesureCouverture()` lisent `meta` dans le blob. Si `meta` part avec le blob, un échec de chargement produit un écran de sources sans licence ODbL — une faute juridique en plus d'une faute de doctrine. 1,5 Ko inline règle la question définitivement.

### 1.2 Ce que la version SERVIE va chercher, et à quel moment

Trois globales injectées par `build_pwa_reconstruit.py`, sur le modèle exact déjà employé pour l'agenda. **Absentes = rien à chercher** : c'est le mécanisme d'invariant 1, il existe déjà, on ne l'invente pas.

```js
window.REPERE_COMMUNES_URL = "donnees/communes.json";
window.REPERE_RNE_BASE     = "donnees/rne/";
window.REPERE_OFGL_BASE    = "donnees/ofgl/";
```

Ce sont des **préfixes**, pas des adresses complètes : le chargeur y concatène `socle.json` ou `<D>.json`. Un préfixe rend impossible d'écrire par mégarde une adresse par commune ailleurs dans le code — il n'y a qu'un endroit qui compose une URL de donnée.

Forme de `donnees/communes.json`, mesurée :

```json
{"v":1,"n":34637,"maj":"2026-08-11",
 "d":{"01":"001|Abergement-Clémenciat (L'),002|Abergement-de-Varey (L'),…",
      "2A":"004|Afa,…","971":"101|Les Abymes,…"}}
```

Le code du département est la clé, seul le **suffixe** du code INSEE est écrit. Reconstruction côté app : `code = dept + suffixe`. Gain mesuré : 796 726 → 589 547 o bruts pour la même information.

**Les quatre vagues :**

| vague | déclencheur exact | ce qui part | poids gzip médian |
|---|---|---|---|
| **0** | — | rien | 217 190 (la page) |
| **1** | `focus` sur `#ob-input` **ou** `repereArrivee()` détecte `?c=` / `#c=` | `donnees/communes.json` | 253 647 |
| **2** | `obPick()` L4733 et `obValidateDept()` L4682 — le moment où `STATE.dept` devient connu | `rne/socle.json` **et** `rne/<D>.json`, en parallèle, **atomiquement** | 86 400 |
| **3** | premier `activate("s-argent")` (L4932) pour un département donné | `ofgl/socle.json` **et** `ofgl/<D>.json`, en parallèle, atomiquement | 112 499 |

Le déclencheur de la vague 2 est **`STATE.dept`, pas `STATE.insee`**. C'est délibéré : `obDemanderDept()` L4657 fixe le département sans INSEE (238 communes sans maire enregistré, plus toute saisie libre). Déclencher sur l'INSEE priverait ces lecteurs du départemental, du régional et du national, alors que ces trois échelons ne dépendent pas de leur commune exacte — exactement la régression que le commentaire v19 de `obValidateTyped` dit avoir déjà corrigée une fois.

Le déclencheur de la vague 1 est **`focus`, pas `input`**. Il faut 400 ms à 2 s entre le focus d'un champ et la deuxième frappe (le seuil de `obSuggest`, L4626 `q.length < 2`). C'est de la marge gagnée gratuitement.

**La fenêtre exploitable de la vague 2** : `obPick()` → étape 2 de confirmation → `finishOnboard()`, soit deux taps utilisateur. Aucun des quatre rendus de `finishOnboard()` L4792 (`renderEss`, `renderFeed`, `renderSujets`, `renderMoiHead`) ne lit le RNE — vérifié. Le premier écran après l'onboarding est donc peint sans attendre quoi que ce soit. Le RNE n'est requis qu'à l'ouverture de « Qui décide » ou « Vos élus ».

### 1.3 Ce que l'utilisateur voit pendant ce temps

Rien d'inhabituel, dans le cas nominal : la page est peinte, le champ de recherche est actif, l'onboarding se déroule. Le chargement est invisible parce qu'il est en avance sur le geste.

Dans les cas non nominaux, l'écran **parle**. Les phrases exactes sont au § 2.4. Aucune de ces situations ne produit une carte grisée, une barre à zéro, un `—`, ou un squelette animé.

---

## 2. La machine à états

### 2.1 Vocabulaire

Cinq états, **repris littéralement de `AN_ETAT`** (L16064) pour qu'il n'y ait qu'un vocabulaire dans le fichier :

`"embarque"` · `"absent"` · `"en cours"` · `"servi"` · `"echec"`

Trois portées indépendantes, chacune avec son état : `communes`, `rne:<D>`, `ofgl:<D>`.

```js
var CH = { communes:"absent", rne:{}, ofgl:{}, ctrl:{}, deptEnCours:null };
```

### 2.2 Amorçage (une seule fois, au démarrage, avant tout rendu)

```
si window.REPERE_RNE && window.REPERE_RNE.com   -> CH.rne = "embarque" pour TOUT departement
                                                   CH.communes = "embarque"
sinon si window.REPERE_RNE_BASE                 -> "absent" (rien encore demande)
sinon                                           -> "absent" definitif : ni inline, ni servi
idem pour OFGL avec window.REPERE_OFGL && .ech.commune.terr
```

`"embarque"` et `"servi"` sont les deux seuls états où l'on lit la donnée. `"absent"` recouvre deux choses que rien ne distingue à l'écran et qui n'ont pas à l'être : « pas encore demandé » et « ce build ne sert rien ». `"en cours"` et `"echec"` ont chacun leur phrase.

### 2.3 Transitions

```
absent --[declencheur de vague]--> en cours
   fetchWithTimeout(url, 8000)  x2 en Promise.all      <-- ATOMIQUE
   AbortController stocke dans CH.ctrl[portee]

en cours --[les DEUX reponses ok, v===1, forme validee, fusion reussie]--> servi
en cours --[une seule echoue, timeout, JSON invalide, v!==1, fusion en echec]--> echec
en cours --[changement de departement]--> abandon : ctrl.abort(), etat remis a "absent"

echec --[bouton « Reessayer » actionne par l'utilisateur]--> en cours     (une fois)
echec --[quoi que ce soit d'autre]--> echec                               (jamais de relance auto)
servi  --> etat terminal pour ce departement ; mis en cache memoire, retour instantane
```

**Pourquoi `Promise.all` et pas deux chargements séparés.** `decouper.py` réindexe `p` et `n` localement par fichier, mais **laisse les rangs ≥ 2 pointer vers les tables globales du socle** (`personne()` L… : `return [t_p(e[0]), t_n(e[1])] + list(e[2:])`). Le rang 2 d'une ligne de `com` est un index dans `socle.f`. Si le département arrivait sans son socle, `rneFicheDe` L6270-6272 lirait `R.f[3]` dans une table inexistante et écrirait une fonction vide sous un vrai nom de maire. **Une donnée à moitié arrivée est pire qu'une donnée absente : elle ment sans le dire.** D'où : les deux, ou aucun.

**Pourquoi pas de relance automatique.** `anRendre()` L16116 ne relance qu'une fois et jamais après `"echec"` — le motif est bon, on le reprend. Une relance automatique sur réseau mobile intermittent produit une boucle qui consomme la batterie et ne dit jamais rien.

**Pourquoi un timeout.** Ni `anCharger` L16081 ni `evCharger` L8982 n'en ont. `fetchWithTimeout(url, ms)` existe déjà L4540 et n'est utilisé que par la géolocalisation. Sans lui, un chargeur départemental sur un réseau lent reste `"en cours"` indéfiniment et l'écran affiche « en cours de chargement » pour toujours — **un squelette animé qui ne charge jamais, sous une autre forme.** 8 000 ms pour un fichier de 26 Ko, contre 3 500 ms pour la géolocalisation.

**Annulation sur `obBack()` L4761.** Changer de commune peut changer de département. Le chargeur retient `CH.deptEnCours` ; à l'entrée de la vague 2, si le département demandé diffère, `CH.ctrl["rne:<ancien>"].abort()` et l'état de l'ancien retombe à `"absent"`. Sans cela, deux réponses peuvent revenir dans le désordre et le second `rneFusionner` écraserait le bon département par le mauvais.

### 2.4 La fusion — le point où tout peut casser en silence

```js
function rneFusionner(socle, paq) {
  const R = {};                       /* on construit a cote, on n'installe qu'a la fin */
  for (const k in socle) R[k] = socle[k];
  const dp = R.p.length, dn = R.n.length;          /* decalages */
  R.p = R.p.concat(paq.p || []);
  R.n = R.n.concat(paq.n || []);
  const dec = e => (Array.isArray(e) && e.length >= 2)
    ? [e[0] + dp, e[1] + dn].concat(e.slice(2)) : e;
  /* memes trois formes que FORME dans decouper.py — declarees, jamais devinees */
  if (paq.com) { R.com = {}; for (const c in paq.com) R.com[c] = dec(paq.com[c]); }
  if (paq.adj) { R.adj = {}; for (const c in paq.adj) R.adj[c] = paq.adj[c].map(dec); }
  if (paq.ecc) { R.ecc = {}; for (const c in paq.ecc) {
      const v = paq.ecc[c].slice(); v[2] = (v[2] || []).map(dec); R.ecc[c] = v; } }
  R.ccan = paq.ccan || {}; R.cl = paq.cl || {};
  R.dcom = paq.dcom || {}; R.dadj = paq.dadj || {};
  if (paq.dep)    { R.dep    = {}; R.dep[paq.d]    = paq.dep.map(dec); }
  if (paq.depcan) { R.depcan = {}; R.depcan[paq.d] = paq.depcan; }
  if (paq.ddep)   { R.ddep   = {}; R.ddep[paq.d]   = paq.ddep; }
  /* CONTROLE AVANT INSTALLATION : un nom resolu, ou rien. */
  const c0 = Object.keys(R.com || {})[0];
  if (!c0 || !R.p[R.com[c0][0]] || !R.n[R.com[c0][1]] || !R.f[R.com[c0][2]]) return null;
  window.REPERE_RNE = R;
  return R;
}
```

Le contrôle des quatre dernières lignes est le miroir exact de l'assertion de `decouper.py` (lignes 165-171). Il coûte trois lectures de tableau et rend impossible d'installer un jeu dont la réindexation a glissé. S'il échoue, la fusion renvoie `null` → état `"echec"` → phrase à l'écran.

### 2.5 ⛔ DÉFAUT MESURÉ, BLOQUANT, QUE LA FUSION N'ATTRAPERA PAS

`RNE.dep`, `RNE.depcan` et `RNE.ddep` portent **95 clés**, dont une que `decouper.py` n'émettra jamais :

```
dep    cles: 95   ABSENTES du decoupage: ['6AE']
depcan cles: 95   ABSENTES du decoupage: ['6AE']
ddep   cles: 95   ABSENTES du decoupage: ['6AE']
```

`departement(insee)` dérive les codes des codes INSEE de commune et ne produit jamais `6AE`. Or `renderQui()` L3923 fait précisément :

```js
const depRne = (STATE.dept === "67" || STATE.dept === "68") ? "6AE" : STATE.dept;
```

**Conséquence : dans la version servie, les habitants du Bas-Rhin et du Haut-Rhin — environ deux millions de personnes — perdraient le conseil départemental de la Collectivité européenne d'Alsace**, et l'écran leur dirait « le Répertoire ne porte aucun conseiller pour votre département », ce qui est faux : la donnée est là, c'est le découpage qui l'a laissée tomber. C'est exactement la faute que le commentaire L3917-3922 raconte avoir déjà commise une fois.

**Correctif requis dans `decouper.py`, avant tout branchement** : une table d'alias explicite, `ALIAS_DEP = {"67": "6AE", "68": "6AE"}`, appliquée au moment d'écrire `PAR_DEPT` ; et une assertion qui refuse de finir si une clé de `RNE["dep"]` n'a été écrite dans aucun fichier. Les 9 départements sans conseil départemental sont légitimes et mesurés (`2A, 2B, 67, 68, 75, 972, 973, 975, 98`) : les deux derniers cas d'Alsace sont couverts par l'alias, les sept autres sont des collectivités à statut particulier, servies par `csp` depuis le socle.

Côté OFGL le même aliasing existe déjà et fonctionne (`OFGL_DEPT_ALIAS` L4… `{"67":"67A","68":"67A"}`), parce que `ofgl/socle.json` embarque l'échelon `departement` en entier.

### 2.6 Les phrases exactes

Chacune est **vraie dans l'état où elle est écrite**, et aucune ne peut être confondue avec une autre.

**A. Index des communes en cours (vague 1, `#ob-input` focalisé, moins de 2 caractères ou pas de réponse encore).** Sous le champ, à la place de `#ob-typed-hint` :

> « La liste des 34 637 communes est en cours de chargement. Vous pouvez déjà taper : la recherche répondra dès qu'elle sera là. »

**B. Index des communes en échec.** Même emplacement, plus un bouton :

> « La liste des communes n'a pas pu être chargée : la liaison avec le serveur a échoué. Elle n'est pas vide, elle n'est pas là. Choisissez votre département ci-dessous — vous garderez les décisions départementales, régionales et nationales — ou réessayez. »
> [ Réessayer ]

Cette phrase **ne doit pas** être celle de `obDemanderDept()` L4671, qui dit « n'est pas encore dans la liste embarquée de l'app ». Dans ce cas-ci la commune EST dans la liste ; c'est la liste qui n'est pas arrivée. Confondre les deux ferait mentir l'app à quelqu'un dont la commune est parfaitement couverte.

**C. `renderQui()`, bloc `qui-ville` (et par symétrie `qui-agglo`, `qui-dept`, `qui-region`), RNE `"en cours"` :**

> « Les élus de {nom} sont en cours de chargement. Repère les demande au serveur en ce moment : ils ne sont pas absents, ils ne sont pas encore arrivés. »

**D. Même bloc, RNE `"echec"` :**

> « Les élus de {nom} n'ont pas pu être chargés : la liaison avec le serveur a échoué. Ce n'est pas que le Répertoire national des élus ne les porte pas — c'est que Repère n'a pas pu les lire. »
> [ Réessayer ] · [ Le Répertoire national des élus ↗ ]

**E. Même bloc, RNE `"servi"` ou `"embarque"` mais commune absente de la source — c'est la phrase EXISTANTE (L4041), qu'il faut corriger :**

> « Le Répertoire national des élus ne rattache aucun maire à {nom} dans l'édition du {meta.maj en français}. Nous préférons le dire plutôt que d'afficher un nom approchant. »

Le mot **« embarquée »** doit disparaître de cette phrase (et des trois autres blocs de `renderQui`, ainsi que de `ofglVide` cas `"absent"`). Dans la version servie, plus rien n'est embarqué : la phrase deviendrait fausse au sens propre. La date de `meta.maj` la remplace avantageusement — elle dit *quelle* édition, ce qui est plus utile et toujours vrai.

**F. `ofglVide(k, "attente", nom)` — nouveau cas :**

> « Les comptes de {titre} sont en cours de chargement. Repère ne les affiche pas encore parce qu'il ne les a pas encore lus, pas parce qu'ils n'existent pas. »

**G. `ofglVide(k, "echec", nom)` — nouveau cas :**

> « Les comptes de {titre} n'ont pas pu être chargés : la liaison avec le serveur a échoué. Repère préfère le dire plutôt que de laisser croire que ce territoire n'a pas de comptes. Ils sont publics et consultables ci-dessous. »
> [ Réessayer ] · [ consulter les comptes ↗ ]

Le cas `"absent"` existant reste mot pour mot, moins le mot « embarqué ».

**H. `renderElus()`, RNE `"en cours"`, sans recherche :**

> « Vos élus locaux sont en cours de chargement. Cette liste ne montre pour l'instant que les fiches rédigées par Repère. »

**I. `renderElus()`, RNE `"echec"`, avec une recherche en cours** — le piège signalé au § 4 de la reconnaissance (`q ? ELUS.concat(rne) : …` L6542, recherche silencieusement amputée) :

> « La recherche ne porte que sur les fiches rédigées par Repère : le Répertoire national des élus n'a pas pu être chargé. Un nom absent d'ici n'est pas un nom absent du Répertoire. »
> [ Réessayer ]

**J. `mesureCouverture()` / écran Sources.** Le compte de couverture devient faux par construction si on compte ce qui est en mémoire. Il doit compter ce que **`REPERE_META` déclare**, pas ce que la tranche contient :

> RNE : `meta.communes_couvertes` / `meta.communes_total` — déjà écrit par `outils/rne_extract.py`, déjà inline une fois `meta` sorti du blob. Rien à changer que la source de lecture.
> OFGL : le bloc `const ofglCommunes = (() => {…})()` L5609 compte aujourd'hui les clés de `O.ech.commune.terr`. **Ce compte doit passer dans `meta`** (`ofgl_ingerer.py` l'écrit une fois pour toutes) ; sinon il vaudra 0 avant la vague 3 et le pourcentage de couverture chuterait à chaque ouverture de l'app, sans qu'aucune donnée n'ait bougé. Le commentaire L5605-5608 raconte précisément le désastre inverse (score passé de 33 à 71 % sans gagner de donnée) — c'est la même faute, en miroir.

---

## 3. Les fonctions à modifier

| # | fonction / ligne | nature de la modification |
|---|---|---|
| 1 | **nouveau bloc, à placer juste après `fetchWithTimeout` L4540** | `CH` (états), `chDept()`, `commCharger()`, `rneCharger(d)`, `ofglCharger(d)`, `rneFusionner()`, `ofglFusionner()`, `chReessayer(portee)`. ~140 lignes. Seul endroit du fichier qui compose une URL de donnée. |
| 2 | `rneOk()` **L6231** | Aujourd'hui `!!(r && r.v===1 && r.p && r.n && r.f && r.com && r.meta)`. `meta` sort du blob → retirer `&& r.meta`. Ajouter `rneEtat()` qui rend l'un des cinq états pour le département courant ; **`rneOk()` reste un booléen strict « la donnée est lisible »**, il ne doit pas devenir tri-état, sinon les 14 appelants changent de sens en silence. |
| 3 | `rneMeta()` **L6235** | lit `window.REPERE_META.rne` au lieu de `window.REPERE_RNE.meta`. Rend les mentions ODbL indépendantes du réseau. |
| 4 | `rneIndex()` **L6328** | source de vérité = `window.REPERE_RNE.cl` si `"embarque"`, sinon l'index national fusionné par `commCharger()`. Invalider `RNE_IDX` quand l'index arrive (il est mémoïsé et serait figé sur le tableau vide). |
| 5 | `rneCommuneNom()` **L6367** | même bascule : `cl` du département si servi, sinon l'index national (qui porte le nom de toutes les communes). Sinon le titre d'une carte serait vide entre la vague 1 et la vague 2. |
| 6 | `fallbackSearch()` **L4579** | inchangée dans sa logique ; ajouter le déclenchement de la vague 1 et **ne pas retomber sur `COMMUNES_FALLBACK` tant que l'état est `"en cours"`** — sinon on sert 49 communes à quelqu'un dont la commune arrive dans 300 ms. |
| 7 | `obSuggest()` **L4620** / `updateValidateState()` L4600 | écrire les phrases A et B sous le champ selon `CH.communes`. |
| 8 | `obValidateTyped()` **L4631** | si `CH.communes === "en cours"`, mettre la saisie en attente et rejouer la validation à l'arrivée, au lieu de tomber sur `obDemanderDept`. Si `"echec"`, `obDemanderDept` **avec la phrase B**, pas la phrase L4671. |
| 9 | `obPick()` **L4727** | après la ligne 4733, appeler `rneCharger(STATE.dept)`. C'est le déclencheur de la vague 2. |
| 10 | `obValidateDept()` **L4682** | idem : c'est l'autre porte d'entrée du département, celle des communes sans INSEE. |
| 11 | `obBack()` **L4761** | annuler les requêtes en vol du département qu'on quitte. |
| 12 | `STATE` **L3711** | `insee:"77186"` / `dept:"77"` — poser un drapeau `deptCharge:false`. **Ne pas remettre à null** : `terr()`, `coverage()` et six rendus supposent un territoire non nul, et les mettre à null casserait le démarrage bien au-delà du chargeur. Le drapeau suffit et ne touche à rien d'autre. |
| 13 | `renderQui()` **L3868** | la seule vraie chirurgie. Chaque bloc de la table L4038-4060 gagne deux champs, `attente` et `echec`, et `rneQuiVide` choisit entre C, D et E. Le corps qui lit `R.com`/`R.adj`/… ne change pas. Re-rendu à l'arrivée : `if (currentTab === "s-qui") renderQui()` dans le `.then` — sur le modèle d'`anRendre()` L16100, pas d'`evCharger()` L8989. |
| 14 | `renderElus()` **L6533** | phrases H et I ; le reste dégrade déjà proprement (`rneElusLocaux()` rend `[]` L6301). |
| 15 | `ofglVide()` **L8291** | deux cas de plus, `"attente"` et `"echec"` ; « embarqué » retiré du cas `"absent"`. |
| 16 | `ofglBloc()` **L8318** | choisir le cas selon `ofglEtat(dept)` avant de choisir entre `"absent"` et `"inconnu"`. |
| 17 | `ofglOk()` **L8174** / `ofglMentions()` L8275 / `ofglSource()` L8270 | `meta` vient de `REPERE_META.ofgl`. |
| 18 | `renderArgent()` **L8436** | déclencher la vague 3 en tête de fonction, comme `renderFeed()` L9061 déclenche `evCharger()`. Re-rendu à l'arrivée si `currentTab === "s-argent"`. |
| 19 | `mesureCouverture()` **L5572** | lire les comptes dans `REPERE_META`, jamais dans la tranche chargée. Voir phrase J. |
| 20 | bandeau tronqué **L2276-2281** | « qui pese plus de 15 Mo » devient faux dans la version servie (707 Ko). `build_pwa_reconstruit.py` doit remplacer cette phrase. Le fichier autonome garde la sienne : elle y reste vraie. |
| 21 | `outils/decouper.py` | **(a)** `OFGL["ech"]["commune"]["terr"]` (défaut ⛔ § 6.1 du contrat) ; **(b)** alias `6AE` (§ 2.5 ci-dessus) ; **(c)** produire `communes.json` ; **(d)** sortir `meta` vers un fichier `meta.json` que le build inline ; **(e)** `assert set(RNE) - couvert == {"p","n"}` ; **(f)** un contrôle OFGL symétrique de celui du RNE ; **(g)** `shutil.rmtree(SORTIE)` avant d'écrire. |
| 22 | `outils/build_pwa_reconstruit.py` | exciser les deux blocs entre marqueurs, injecter les trois URL + `REPERE_META`, réécrire la phrase du bandeau. |
| 23 | `outils/pipeline.sh` | `rm -rf site_donnees` avant l'étape 3 sexies ; rendre l'étape **bloquante** le jour où l'app consomme (sinon le pipeline publie le découpage de la veille en annonçant un succès — incohérence ③) ; retirer `2>/dev/null || true` de la copie. |
| 24 | `site/sw.js` | cache d'exécution (§ 5.3). |

---

## 4. Les ancres de patch

Toutes vérifiées par `grep -c -F` sur `/home/claude/repere/app_repere_v18_20.html` (sauf mention). **Compte rendu par grep entre crochets.**

### Dans l'application

| # | texte exact à chercher | grep |
|---|---|---|
| A1 | `function fetchWithTimeout(url, ms) {` | **[1]** — insertion du bloc chargeur juste avant |
| A2 | `  commune:"Fontainebleau", dept:"77", insee:"77186",` | **[1]** — drapeau `deptCharge` |
| A3 | `function rneOk(){` | **[1]** |
| A4 | `function rneIndex(){` | **[1]** |
| A5 | `  const R = (typeof rneOk === "function" && rneOk()) ? window.REPERE_RNE : null;` | **[1]** — tête de `renderQui`, point d'insertion de la lecture d'état |
| A6 | `function renderQui() {` | **[1]** |
| A7 | `function renderElus(` | **[1]** |
| A8 | `function ofglOk() {` | **[1]** |
| A9 | `function ofglVide(k, cas, nom) {` | **[1]** |
| A10 | `function renderArgent(` | **[1]** |
| A11 | `    STATE.insee = (insee === undefined) ? null : (insee || null);` | **[1]** — déclencheur vague 2, insertion juste après |
| A12 | `function obPick(nom, dept, insee) { /* tap 1 → étape 2 */` | **[1]** |
| A13 | `function obValidateDept() {` | **[1]** |
| A14 | `function fallbackSearch(q) {` | **[1]** |
| A15 | `  const rneHits = (typeof rneCherche === "function") ? rneCherche(raw, 7) : [];` | **[1]** — dans `obValidateTyped` |
| A16 | `  const ofglCommunes = (() => {` | **[1]** — dans `mesureCouverture` |
| A17 | `  if (id === "s-qui") { renderQui(); renderCompetences(); }` | **[1]** |
| A18 | `  if (id === "s-argent") renderArgent();` | **[1]** |
| A19 | `/* REPERE_RNE_DEBUT */` | **[1]** — et `/* REPERE_RNE_FIN */` **[1]** |
| A20 | `/* REPERE_OFGL_DEBUT */` | **[1]** — et `/* REPERE_OFGL_FIN */` **[1]** |
| A21 | ` qui pese plus de 15 Mo.` | **[1]** — phrase du bandeau |
| A22 | `function repereArrivee(` | **[1]** — chemin `?c=`, doit attendre la vague 1 |
| A23 | `var EV_ETAT = "absent";` | **[1]** — repère du bloc des chargeurs existants, pour poser le nouveau à côté |

### Hors de l'application

| # | fichier | texte exact | grep |
|---|---|---|---|
| B1 | `site/sw.js` | `  "./accueil.html",` | **[1]** |
| B2 | `site/sw.js` | `  e.respondWith(caches.match(r).then(function (m) { return m || fetch(r); }));` | **[1]** — la ligne à remplacer par le cache d'exécution |
| B3 | `outils/build_pwa_reconstruit.py` | `        ancre_ev = 'window.REPERE_AGENDA_URL = "donnees/agenda_an.json"'` | **[1]** — ⚠ l'ancre courte `window.REPERE_AGENDA_URL = "donnees/agenda_an.json"` rend **[2]** (L186 et L205) : ne pas l'employer nue |
| B4 | `outils/pipeline.sh` | `python3 outils/decouper.py` | **[1]** |
| B5 | `outils/pipeline.sh` | `if [ -d site_donnees ]; then` | **[1]** |
| B6 | `test_repere.mjs` | `  const fautives = adresses.filter(u =>` | **[1]** |
| B7 | `outils/decouper.py` | `com_ofgl = OFGL["ech"].get("commune", {})` | **[1]** — le défaut ⛔ |

Toutes les ancres de l'application sont uniques. La seule ambiguïté du lot est B3, et elle est signalée.

---

## 5. Les nouveaux contrôles du banc

Le banc en compte 43 aujourd'hui (`grep -c 'verif(' test_repere.mjs` → 43). Il sert déjà un répertoire en HTTP quand la cible en est un (`test_repere.mjs` L178-194) : les contrôles ci-dessous se lancent donc sur `site_engendre/` sans nouvelle plomberie.

### 5.1 Le contrôle existant laisse passer un piège — mesuré

J'ai passé les adresses candidates dans la regex du banc (L395-396) :

```
ok      donnees/rne/07.json          ok  donnees/rne/2A.json      ok  donnees/rne/971.json
ok      donnees/rne/975.json         ok  donnees/rne/98.json      ok  donnees/communes.json
FAUTIF  donnees/07186.json           FAUTIF  donnees/rne/2A004.json
FAUTIF  donnees/rne/07.json?v=12345      <-- LE PIEGE
ok      donnees/rne/07.json?v=20260825
```

**Aucun numéro de département français ne peut être confondu avec un code de commune** par ce motif : `\d{5}` ne mord pas sur 2 ou 3 chiffres, et `2[AB]\d{3}` ne mord pas sur `2A`/`2B` nus. La maille départementale est sûre.

**Mais un cache-buster de cinq chiffres exactement — `?v=12345` — fait échouer le banc**, sans qu'aucun code de commune ne soit en jeu. Conséquence de conception : **aucune URL de `donnees/` ne porte de chaîne de requête.** L'invalidation de cache passe par le nom de cache du service worker (§ 5.3), qui change à chaque déploiement. C'est aussi la réponse à l'incohérence ⑦ du contrat de données : le manifeste n'a pas besoin d'empreinte.

### 5.2 Les contrôles à ajouter

| # | contrôle | ce qu'il empêche |
|---|---|---|
| **N1** | *Positif, pas seulement négatif.* Toute adresse observée sous `donnees/` doit se décomposer en `donnees/(manifeste\|communes)\.json` ou `donnees/(rne\|ofgl)/(socle\|\d{2,3}\|2[AB])\.json` ou `donnees/(agenda_an\|evenements)\.json`, **sans chaîne de requête**. | Le contrôle actuel mesure l'absence d'un code de commune, pas la présence d'un découpage correct : `donnees/idf.json` ou `?d=77` passeraient. C'est écrit tel quel dans la reconnaissance (point 13). |
| **N2** | *Poids du premier écran.* Sur `site_engendre/`, additionner le `content-length` de tout ce qui part **avant** le premier `focus` du champ. Échec si > 400 000 o. | La régression silencieuse la plus probable : quelqu'un réembarque une table « juste pour dépanner » et le premier chargement repasse à 6 Mo sans qu'aucun test ne bronche. |
| **N3** | *Fusion correcte.* Ouvrir `s-qui` pour une commune connue (par ex. `07001`) dans la version **servie**, lire le nom du maire à l'écran, et le comparer au nom lu dans la version **autonome** pour la même commune. Égalité stricte. | Le décalage d'index de `rneFusionner`. C'est LE contrôle qui rend impossible la panne silencieuse : un décalage produit un vrai nom de personne, juste pas le bon. Aucune autre vérification ne l'attrape. |
| **N4** | *Alsace.* `s-qui` pour une commune du 67 et une du 68, version servie : le bloc `#qui-dept` doit porter au moins un conseiller. | Le défaut `6AE` du § 2.5. Deux millions d'habitants. |
| **N5** | *Deux phrases, pas une.* Router `**/donnees/rne/*.json` vers un `page.route` qui échoue, ouvrir `s-qui` : l'écran doit contenir « n'a pas pu être chargé » et **ne pas** contenir « ne rattache aucun maire ». Puis servir normalement une commune absente du RNE : l'inverse. | La confusion « absent de la source » / « pas encore arrivé », nommée comme piège au point 3 de la reconnaissance. |
| **N6** | *Rien de vide pendant l'attente.* Pendant l'état `"en cours"` (fetch retardé de 2 s par `page.route`), `#qui` et `#arg-body` ne doivent contenir ni `.bar`, ni `0 €`, ni un nœud vide ; et doivent contenir au moins une phrase de plus de 40 caractères. | Invariant 5. Le squelette animé qui ne charge jamais. |
| **N7** | *Une sortie après l'échec.* Après un échec forcé, un bouton contenant « Réessayer » doit exister et être atteignable au clavier. | Un état d'échec sans issue est un cul-de-sac — la faute que le banc reproche déjà à la recherche vide de `renderElus`. |
| **N8** | *Le fichier autonome ne demande rien.* Ouvrir `app_repere_v18_*.html` en `file://`, faire tout le parcours d'arrivée, ouvrir `s-qui` et `s-argent` : `adresses` ne doit contenir aucune entrée sous `donnees/`. | **Invariant 1.** C'est le contrôle qui garde les deux sorties divergentes du pipeline (incohérence ⑫). |
| **N9** | *Le découpage n'est pas vide.* Hors navigateur, sur `site_engendre/donnees/` : au moins 99 des 103 `ofgl/<D>.json` pèsent plus de 1 000 o, et la somme des `com` des `rne/<D>.json` vaut `REPERE_META.rne.communes_couvertes`. | C'est le contrôle qui aurait attrapé le défaut ⛔ : 103 fichiers de 23 octets publiés comme s'ils portaient quelque chose, avec un manifeste qui ne s'en alarme pas. |
| **N10** | *Le manifeste dit vrai.* Chaque département listé possède ses deux fichiers, et les tailles déclarées valent les tailles réelles. | L'absence de nettoyage de `site_donnees/` (incohérence ③) : un fichier de la veille survit et est publié. |
| **N11** | *Le service worker connaît le découpage.* Après installation, requêter `donnees/rne/07.json`, passer hors ligne, requêter à nouveau : la réponse doit venir du cache. | Le point ② du contrat : le jour où l'app consomme son département, la PWA installée le perd hors ligne, silencieusement. |

N3, N4 et N9 sont les trois qui portent le risque. Les huit autres sont du gardiennage.

### 5.3 Le service worker

L'`addAll` est le mauvais outil pour 207 fichiers dont un seul intéresse chaque lecteur. Il faut un **cache d'exécution**, à écrire en remplacement de la ligne B2 :

```js
  /* Les fichiers de donnees ne sont pas dans la coquille : il y en a 207 et un
     lecteur n'en lit qu'un. On les met en cache A LA LECTURE. Le cache porte le
     nom de VERSION, qui vaut l'empreinte du build : un deploiement cree un
     nouveau cache et « activate » efface l'ancien. C'est l'invalidation, et elle
     ne coute aucune chaine de requete — un ?v= a cinq chiffres ferait echouer le
     controle d'architecture du banc. */
  if (new URL(r.url).pathname.indexOf("/donnees/") >= 0) {
    e.respondWith(caches.match(r).then(function (m) {
      if (m) return m;
      return fetch(r).then(function (rep) {
        if (estBonne(rep)) { var c = rep.clone();
          caches.open(VERSION).then(function (k) { k.put(r, c); }); }
        return rep;
      });
    }));
    return;
  }
```

`estBonne()` existe déjà (L… de `site/sw.js`) et refuse les 404 et les pages d'erreur d'hébergeur — exactement ce qu'il faut ici, pour la raison écrite dans son commentaire : une erreur mise en cache rend l'app morte hors ligne, silencieusement.

---

## 6. Ce qui me paraît risqué, et ce que je n'ai pas pu vérifier

### Risqué

1. **La fusion des index `p`/`n` est le point de rupture silencieuse du projet.** Un décalage n'affiche pas une erreur : il affiche le nom d'une autre personne, correctement orthographié, sous une vraie fonction. C'est la faute la plus grave que cette application puisse commettre, et la moins visible. Le contrôle N3 est **non négociable** — sans lui, je déconseille la bascule.
   L'alternative sans fusion existe et je l'ai mesurée : amorcer les tables départementales de `decouper.py` avec celles du socle, pour que les deux numérotations coïncident. Coût réel : `rne/<D>.json` passe de **25 718 à 40 872 o gzip** à la médiane (+59 %), soit +15 Ko par lecteur. Elle supprime 20 lignes de JS et toute une classe de bug. **Je recommande la fusion en JS + N3, mais un architecte qui préfère payer 15 Ko pour supprimer le risque aurait raison aussi** — c'est un arbitrage, pas une évidence, et la mesure est là pour qu'il se fasse sur des chiffres.

2. **`6AE` (§ 2.5).** Défaut mesuré, bloquant, invisible sans N4.

3. **`ofgl/<dept>.json` vides (défaut ⛔ du contrat de données).** Tant qu'il n'est pas corrigé, brancher le chargeur ferait dire à l'app « les comptes de votre commune ne figurent pas dans le fichier officiel » à **34 875 communes sur 34 875**. La doctrine du vide retournée contre elle-même : une phrase parfaitement écrite qui affirme une contre-vérité. **Corriger `decouper.py` AVANT de toucher à l'application.**

4. **Le pipeline non bloquant qui publie la veille.** `[ -d site_donnees ]` reste vrai après un échec de `decouper.py`. Aujourd'hui c'est sans conséquence (personne ne lit ces fichiers) ; le jour de la bascule, un pipeline « réussi » servira des élus périmés sans que rien ne le dise. À corriger dans le même patch que le branchement, pas après.

5. **La rétention du cache SW.** `VERSION` change à chaque build, donc à chaque déploiement quotidien tous les caches sont effacés et **chaque lecteur retélécharge son département**. C'est correct mais coûteux : un lecteur quotidien paie 544 Ko par jour au lieu de 212 Ko. Un cache de données séparé, versionné par `meta.maj` du RNE plutôt que par l'empreinte du HTML, corrigerait cela — je ne le propose pas dans cette conception parce qu'il ajoute une deuxième dimension d'invalidation, et qu'une deuxième dimension d'invalidation est une deuxième façon de servir une donnée périmée. À instruire séparément.

6. **`renderQui()` est une fonction synchrone de 180 lignes** appelée depuis `activate()` L4920, elle-même synchrone et suivie de `syncLieuLabels()` et `wireClickables(el)` L4934-4937. Le re-rendu à l'arrivée doit repasser par `wireClickables`, sinon les cartes d'élus qui apparaissent après le fetch ne seront ni cliquables au clavier ni annoncées au lecteur d'écran — une régression d'accessibilité, muette, que le banc n'attrape pas aujourd'hui.

### Non vérifié

- **Le temps de fusion dans un navigateur.** La boucle de décalage parcourt environ 6 000 à 7 000 entrées pour le département 62 (le plus lourd). Je n'ai mesuré ni ce temps, ni le temps de `JSON.parse` de `rne/socle.json` + `rne/62.json`. Je les suppose négligeables devant les 2 562 ms actuels ; **c'est une supposition, pas une mesure.** À mesurer avant de conclure quoi que ce soit sur la vitesse ressentie.
- **La forme `ecc` après fusion.** `decouper.py` ne vérifie sa réindexation que sur `com` (assertion L165-171). Je n'ai pas vérifié que `ecc[2]` — la liste au troisième rang — survit correctement pour les 103 départements. À couvrir par une extension de l'assertion existante, pas par confiance.
- **Le temps réseau réel.** Tous mes chiffres sont des tailles gzip, pas des durées. 544 Ko en quatre requêtes sur un réseau mobile français moyen : non mesuré.
- **Le comportement de `repereArrivee()` avec `?c=` sur un réseau lent.** Le chemin d'arrivée depuis la landing (`ldGo(id)` L16196, `setTimeout(…, 420)`) devient une course entre un délai de 420 ms et un fetch de 254 Ko. Je propose de l'attendre explicitement plutôt que de l'estimer, mais je n'ai pas mesuré ce qui se passe si l'utilisateur tape pendant l'attente.
- **`arr`** (maires d'arrondissement, clés `13055`, `69123`, `75056`) reste dans `rne/socle.json`, servi à tout le monde. Le banc ne regarde que les URL, donc aucune fuite — mais je n'ai pas vérifié que `renderQui` sait s'en servir quand le socle est là et le département pas encore.
- **`site/maires.mjs`** est publié par `build_pwa_reconstruit.py` (incohérence ⑧ du contrat). Hors périmètre, non instruit.