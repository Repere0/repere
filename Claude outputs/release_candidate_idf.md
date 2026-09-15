# REPÈRE — RELEASE CANDIDATE ÎLE-DE-FRANCE

**Audit du 15 septembre 2026.** Rien n'a été fusionné, rien n'a été poussé, l'historique n'a
pas été touché. Aucune fonctionnalité n'a été ajoutée. Un seul fichier a été créé :
`outils/audit_rc.py`, l'instrument qui refait tous les chiffres de ce document.

La question à laquelle ce document répond est celle qui a été posée :

> « Si demain un citoyen français découvre Repère, pouvons-nous être fiers de ce qu'il va
> réellement voir ? »

**Réponse : pas encore. Cinq faits affichés aujourd'hui seraient faux.** Ils sont tous
réparables, et aucun ne demande une source nouvelle. La liste tient en §Q.

Classement utilisé, sans note globale : **BLOCKER · HIGH · MEDIUM · LOW · OBSERVATION**.
Règle appliquée sans exception : *un problème qui concerne la vérité d'une donnée affichée est
un BLOCKER*, quel que soit le nombre de lecteurs concernés.

**Comment refaire les chiffres :**

```
python3 outils/audit_rc.py          # sort 1 si un contrôle de vérité échoue
cd mono && node scripts/extract-html.js "$(ls -1 ../app_repere_v18_*.html | grep -v '\.bak$' | sort -V | tail -1)" ./data
cd mono && pnpm build
cd mono && node --test tests/invariants.test.mjs     # 55 contrôles
cd mono && node tests/runtime.test.mjs apps/web/dist # 81 contrôles
```

---

## 0. LE NOUVEAU MODÈLE DE VALEUR — la cause structurelle, et la règle unique

La demande est juste, et elle est la clé de tout l'audit : distinguer **VALUE · ZERO ·
MISSING · UNKNOWN · NOT_APPLICABLE · INVALID**, et ne jamais laisser une absence devenir un
zéro.

**La cause structurelle est identifiée, et elle est unique.** Elle n'est pas dans
l'application : la couche d'affichage est déjà correcte. Elle est dans un seul endroit de la
chaîne.

### 0.1 · Où la distinction se perd, exactement

```
data.ofgl.fr                    (source : 3,9 Go, JAMAIS collectée par le dépôt)
   ↓  transformation INCONNUE — aucun script du dépôt ne l'a produite
app_repere_v18_20.html          (17 Mo versionnés ; window.REPERE_OFGL, 8,83 Mo)
   ↓  mono/scripts/extract-html.js:248   comptes: communesOfgl[insee].ex : null
mono/data/departments/NN.json   (recopie littérale du tableau de 13 cases)
   ↓  OuVaArgent.jsx:25          valeur() — typeof m === "number" → { m, zero: m === 0 }
écran                           « L'Observatoire publie un encours de dette nul : cette
                                  commune ne doit rien. »
```

Deux constats, tous deux vérifiés :

1. **`outils/collecte.py` ne collecte pas l'OFGL.** Le jeu y est listé avec le motif
   `"pourquoi_pas_encore": "Deja embarque sous forme pre-agregee."` La donnée financière — la
   moitié du produit — est un bloc figé dans un fichier HTML de 17 Mo, **dont la dérivation
   depuis la source n'existe nulle part dans le dépôt.**
2. **`extract-html.js:248` recopie le tableau tel quel.** C'est la seule transformation, et
   elle n'en est pas une. Le zéro était déjà dans le bloc ; personne ne peut dire s'il
   signifiait « publié à zéro » ou « colonne absente », parce que le script qui a écrit le
   bloc n'existe pas.

**Conséquence, dite franchement : la distinction demandée ne peut pas être *récupérée*, elle
ne peut qu'être *reconstruite*.** Et elle est reconstructible, sans source nouvelle, par une
règle de vraisemblance de population qui se calcule sur le bloc lui-même.

### 0.2 · La règle unique — une seule, pas 71 corrections

```
RÈGLE V-1 (à écrire dans mono/scripts/extract-html.js, et nulle part ailleurs)

Pour chaque exercice E et chaque poste P du tableau :
  soit n(E,P) le nombre de communes dont la valeur est 0,
  soit t(E,P) le nombre de communes dont la valeur est numérique.

  si n/t ≥ 0,95  →  le poste P de l'exercice E vaut MISSING pour TOUTES les communes.
                    Motif écrit dans le code : « un montant nul sur la quasi-totalité
                    d'une population n'est pas une mesure, c'est une colonne absente. »
  sinon          →  0 vaut ZERO (publié à zéro), tout autre nombre vaut VALUE,
                    l'absence de case vaut MISSING.

Forme écrite dans le paquet : `null` pour MISSING, le nombre pour ZERO et VALUE.
Le tableau garde ses 13 cases ; seule la signification du `null` devient explicite.
Aucune autre couche ne change : `valeur()` lit déjà `typeof m === "number"`.
```

**Pourquoi ce seuil et pas un autre** : il est choisi pour être *indiscutable*, pas pour être
fin. À 100 % il ne prendrait que le cas exact d'aujourd'hui ; à 50 % il effacerait des zéros
réels (4,5 à 4,8 % des communes ont une dette nulle sur chacun des trois exercices, et ces
zéros-là sont vrais). Mesuré : entre 0,6 % et 100 %, **il n'existe aucune valeur intermédiaire
dans les données réelles.** Le seuil de 95 % sépare donc les deux populations sans en couper
aucune.

Les deux autres états demandés se traitent au même endroit, et il faut dire lequel n'a pas
lieu d'être :

| état | où il apparaît dans Repère | traitement |
|---|---|---|
| VALUE | un montant, une date, un nom | affiché |
| ZERO | dette nulle (1 569 à 1 654 communes selon l'exercice) | affiché, avec sa phrase propre |
| MISSING | case absente, ou poste effacé par la règle V-1 | phrase d'absence + lien officiel |
| UNKNOWN | **n'existe pas et ne doit pas être créé** : indistinguable de MISSING avec les sources actuelles | replié sur MISSING |
| NOT_APPLICABLE | un seul cas réel : les échelons d'un territoire qui n'en a pas (Paris, commune-département) | phrase propre, déjà écrite |
| INVALID | une valeur numérique impossible (négatif sur un encours, population nulle) | **contrôle à écrire — aujourd'hui absent** ; la publication doit échouer, pas afficher |

---

## A. BUILD — HIGH

| constat | mesure | classe |
|---|---|---|
| la chaîne locale reconstruit la donnée à l'identique | `git diff` vide après ré-extraction complète | **OBSERVATION** (bonne nouvelle : le build est reproductible) |
| `mono/data/` et `mono/apps/web/dist/` sont ignorés par git | `mono/.gitignore:2,4` | **OBSERVATION** — la donnée servie est construite au déploiement, pas versionnée |
| la source de vérité est un fichier HTML de 17 Mo versionné | `app_repere_v18_20.html`, 17 353 600 o | **HIGH** — un fichier binaire de 17 Mo comme source de vérité d'un produit de données |
| `node --test tests/` **échoue** | `tests/poids.mjs` et `tests/beta_idf.mjs` plantent (`path.join(RAC=undefined)`) : ils attendent un argument et le lanceur ne leur en passe pas | **HIGH** — il n'existe aucune commande unique qui lance tous les contrôles |
| la chaîne de publication ne lance que 55 des 138 contrôles | `netlify.toml` → `node --test tests/invariants.test.mjs` seulement | **HIGH** — les 81 contrôles de navigateur ne gardent rien en production |
| le build est rapide et léger | 428 ms, 100 Ko d'`assets` | OBSERVATION |

**Correction A-1** : sortir `poids.mjs` et `beta_idf.mjs` de `tests/` (ce sont des mesures, pas
des tests) ou leur donner un défaut d'argument. Puis une cible unique `pnpm verifier` qui
enchaîne les trois.

---

## B. DONNÉES — BLOCKER

### B.1 · L'audit de tous les zéros

Table demandée, remplie par mesure sur les 104 paquets (34 637 communes servies).
`n/t` = valeurs nulles sur valeurs numériques.

| champ | source | 2021 | 2024 | 2025 | signification du zéro | comportement si absent | comportement si null | affichage aujourd'hui | verdict |
|---|---|---:|---:|---:|---|---|---|---|---|
| **Frais de personnel** | OFGL (bloc figé) | **34 563/34 563 — 100 %** | 200 (0,6 %) | 200 (0,6 %) | **aucune : c'est une colonne absente** | *n'arrive jamais : la case existe toujours* | phrase d'absence | « L'Observatoire publie un montant nul… la source écrit zéro » | **BLOCKER** |
| **Encours de dette** | OFGL | 1 569 (4,5 %) | 1 624 (4,7 %) | 1 654 (4,8 %) | **réelle** : la commune ne doit rien | phrase d'absence | phrase d'absence | « … cette commune ne doit rien » | **HIGH** (phrase juste, fondement fragile — voir B.2) |
| Recettes totales | OFGL | 0 | 0 | 0 | jamais observée | phrase d'absence | phrase d'absence | montant + barre | LOW |
| Dépenses totales | OFGL | 0 | 0 | 0 | jamais observée | phrase d'absence | phrase d'absence | montant + barre | LOW |
| Dépenses d'investissement | OFGL | 142 (0,4 %) | 190 (0,5 %) | 202 (0,6 %) | plausible (année sans chantier) | phrase d'absence | phrase d'absence | « montant nul… la source écrit zéro » | MEDIUM |
| Impôts et taxes | OFGL | 1 (0,003 %) | 0 | 0 | plausible | phrase d'absence | phrase d'absence | idem | LOW |
| Population | OFGL, case 0 | 0 | 0 | 4 communes sans exercice 2025 | — | `population()` rend `null` si `ex[0] <= 0` — **correct** | — | omise du sous-titre | OBSERVATION |
| **Nombre d'adjoints** | RNE | **65 communes à 0**, dont 17 en outre-mer et 10 en Seine-et-Marne | — | — | **juridiquement impossible** : un conseil municipal élit au moins un adjoint | *le champ existe toujours* | — | « Aucun adjoint n'est enregistré… dans le Répertoire national des élus » | **BLOCKER** |
| Subventions, marchés, autres postes | — | **non servis** | | | — | — | — | absents de l'écran | sans objet |
| Positions de vote | AN | `.` = position non portée, jamais 0 | | | l'absence est explicite, pas un zéro | ligne affichée avec sa phrase | — | « Le relevé ne dit pas comment il s'est prononcé » | HIGH (voir M.2) |

**Aucun `|| 0`, `?? 0`, `parseInt` ou `Number()` dangereux n'a été trouvé dans la couche
d'affichage.** Les deux seuls repérés sont bénins et vérifiés :
`OuVaArgent.jsx:88` (`|| 0` dans un `Math.max`, qui ne peut pas gonfler un maximum) et
`composants.jsx:80` (`maximum > 0 ? … : 0`, suivi d'une garde `pc >= 1` qui écrit
« Montant trop faible pour être tracé » au lieu d'une barre nulle — l'invariant 5 est tenu).
**La couche d'affichage n'est pas le problème. La donnée l'est.**

### B.2 · Comparabilité — et le refus qui en découle

La règle posée est appliquée : *si la comparabilité est incertaine, ne pas comparer.*

| paire | comparable ? | preuve |
|---|---|---|
| **2021 → 2025** | **NON** | le poste « frais de personnel » est absent de 2021 ; les exercices ne sont pas consécutifs (3 ans d'écart) ; et le bloc n'a pas de dérivation traçable, donc rien n'établit que les deux millésimes ont la même définition ni le même périmètre |
| **2024 → 2025** | **OUI** | aucun poste cassé sur les deux exercices ; années consécutives ; **34 468 communes comparables sur 34 637** (99,5 %), **1 258 / 1 262 en Île-de-France** |

**Conséquence sur l'aha moment recommandé hier : il change de paire.** Mesuré sur 2024 → 2025,
Île-de-France :

| poste | communes comparables | valeur qui a changé | en baisse | en hausse | soldé | variation médiane |
|---|---:|---:|---:|---:|---:|---:|
| encours de dette | 1 258 | **1 145 (91,0 %)** | 844 | 301 | **10** | 12,1 % |
| dépenses totales | 1 258 | 1 258 (100 %) | 564 | 694 | 0 | 12,5 % |
| frais de personnel | 1 258 | 1 255 (99,8 %) | 375 | 880 | 2 | 3,5 % |

Le fait survit : **91,0 % au lieu de 94,0 %**, sur une paire dont la comparabilité est établie
au lieu d'être supposée. Les 4 communes franciliennes sans exercice 2025 — Melz-sur-Seine,
Montigny-le-Guesdier, La Tombe (77), Saint-Léger-en-Yvelines (78) — reçoivent la phrase
d'absence, pas un gabarit vide.

*Contrôle de vraisemblance, en passant : sur 2024 → 2025, les frais de personnel baissent pour
375 communes et montent pour 880, avec une médiane de 3,5 %. C'est une dérive de masse
salariale plausible. Sur 2021 → 2025, la même mesure donnait « 1 256 hausses, 1 baisse » : la
forme de la distribution suffisait à dénoncer l'artefact, et personne ne l'avait regardée.*

### B.3 · Couverture (Île-de-France)

| fait | couverture | mesure |
|---|---:|---|
| nom de la commune | 1 262 / 1 262 | 100 % |
| maire nommé | 1 262 / 1 262 | 100 % |
| nombre d'adjoints | 1 252 / 1 262 | 99,2 % — les 10 autres à `0`, voir B.1 |
| circonscription | 1 262 / 1 262 | 100 %, dont **14 communes à cheval** sur plusieurs |
| comptes (≥ 1 exercice) | 1 262 / 1 262 | 100 % |
| comptes (paire 2024-2025) | 1 258 / 1 262 | 99,7 % |
| député nommable | 1 262 / 1 262 | 100 % |
| au moins une position sur un vote solennel | 1 257 / 1 262 | 99,6 % — 2 sièges sur 97 sans fichier de positions |
| **projet financé par l'État** | **0 / 1 262** | `index.sources.projets` vaut `null` |
| **délibération municipale** | **0 / 1 262** | aucune source ouverte n'existe |
| communes attendues au code officiel géographique | **1 262 servies pour 1 266** | 77021, 77253, 92077, 94075 absentes de tout paquet |

**Correction B-1 (BLOCKER)** : appliquer la règle V-1 dans `extract-html.js`.
**Correction B-2 (BLOCKER)** : `adjoints` absent du relevé → `null`, et la phrase devient
« Repère n'a pas réussi à lire le nombre d'adjoints pour cette commune. » — une phrase sur
nous, pas sur le Répertoire.
**Correction B-3 (BLOCKER)** : l'écran d'évolution, s'il est construit, utilise 2024 → 2025.
**Correction B-4 (HIGH)** : les 4 communes manquantes du code officiel.

---

## C. PROVENANCE — BLOCKER

| constat | mesure | classe |
|---|---|---|
| chaque chiffre affiché porte producteur, licence et date | vérifié sur les 7 écrans par les 81 contrôles de navigateur | OBSERVATION — le meilleur du produit |
| **la donnée financière n'a aucune dérivation traçable** | `collecte.py` ne collecte pas l'OFGL (« déjà embarqué sous forme pré-agrégée ») ; le bloc de 8,83 Mo vient d'un script qui n'existe pas dans le dépôt | **BLOCKER** |
| **le lien de provenance des circonscriptions renvoie 404** | `outils/circos.json` → `source_url` data.gouv.fr, testé sous trois formes : 404 | **BLOCKER** (un lien de vérification mort sur la donnée la plus structurante) |
| la licence des circonscriptions est écrite trop haut | l'API dit `fr-lo` (Licence Ouverte **1.0**) ; le dépôt dit « 2.0 » | **HIGH** |
| la source des circonscriptions ne porte aucune date de relevé | `audit_rc.py` : « source circonscriptions : ni releve_le ni maj » ; seul `decoupage: 2010` | **HIGH** |
| le découpage des circonscriptions date de 2010, la table de 2017 | seule table nationale officielle, `last_update 2017-04-11`, fréquence déclarée « annuelle » → **9 ans et 5 mois** | **HIGH**, à écrire à l'écran |
| `index.sources.projets` vaut `null` | et l'écran impute l'absence à l'État — voir §M.1 | **BLOCKER** |

**Correction C-1 (BLOCKER)** : écrire `outils/ofgl.py` qui refait la pré-agrégation depuis
data.gouv.fr dans la collecte (le runner GitHub joint la source ; le conteneur non), avec le
journal, l'empreinte et la date. Tant qu'il n'existe pas, la phrase « publiées telles quelles
par l'Observatoire des finances locales » est une affirmation que le dépôt ne peut pas étayer.
**C'est la correction la plus lourde du document, et la plus fondatrice.**

**Correction C-2 (BLOCKER)** : un contrôle qui appelle chaque URL de provenance affichée et
fait échouer la publication sur autre chose qu'un 200.

---

## D. FRAÎCHEUR — BLOCKER

### D.1 · Les cinq dates demandées : deux manquent, deux sont confondues

| date demandée | existe ? | où | valeur au 15/09/2026 |
|---|---|---|---|
| **date du fait** | **oui, partiellement** | exercice comptable (`2025`), date de scrutin (`2026-07-21`), découpage (`2010`) | hétérogène par source |
| **date de publication par la source** | **NON** | — | **absente : `maj` ne distingue pas la publication de la mise à jour** |
| date de mise à jour de la source | oui | `sources.*.maj` | élus 2026-08-11 · comptes 2026-07-29 |
| date de collecte | **oui pour 4 sources sur 7** | `sources.*.releve_le` | députés, scrutins, territoires, communes — **absente pour les élus et les comptes** |
| **date de mise en cache** | **NON** | — | **absente : `store.js` écrit le paquet nu, sans enveloppe** |

**Deux dates sur cinq n'existent pas, et deux sont confondues sous le même nom.**

### D.2 · Ce que les dates de l'index prouvent à elles seules

```
genere_le                : 2026-09-15   (aujourd'hui — l'index est régénéré à chaque build)
sources.deputes.releve_le: 2026-08-26   (20 jours)
sources.scrutins.releve_le:2026-08-26   (20 jours)
sources.elus.maj         : 2026-08-11   (35 jours)
sources.comptes.maj      : 2026-07-29   (48 jours)
```

L'écart entre `genere_le` et `releve_le` **est** la signature de la collecte morte : le build
tourne, la collecte non. `extract-html.js` le dit déjà lui-même, à chaque exécution :

```
::warning::le releve des mandats date du 2026-08-26, soit 21 jours : la collecte
           quotidienne ne le rafraichit plus
::warning::le releve des scrutins date du 2026-08-26, soit 21 jours : …
::warning::projets.json absent : aucun projet finance ne sera publie
```

**Trois avertissements exacts, à chaque build, et la publication passe quand même.** C'est le
défaut de conception le plus coûteux de la chaîne : *tout ce qui est détecté est dégradé en
avertissement.* Le même motif existe dans `pipeline.sh`, où chaque collecteur est suivi de
`|| echo "::warning::"`.

### D.3 · Les seuils, par source

Aucun des 138 contrôles ne compare une date à un seuil. Spécification, avec le motif de chaque
seuil — une donnée annuelle n'est pas périmée en 24 h, une donnée quotidienne ne doit pas
rester trois mois :

| source | cadence réelle | ANCIEN | TROP ANCIEN | motif |
|---|---|---:|---:|---|
| élus (RNE) | mensuelle | 45 j | 120 j | un maire change à tout moment ; deux mois d'écart est déjà une erreur affichable |
| comptes (OFGL) | annuelle | 400 j | 550 j | un exercice paraît l'été suivant ; 550 j signifie qu'un millésime a été manqué |
| députés (AN) | quotidienne | 30 j | 90 j | régénéré chaque jour par la source |
| scrutins (AN) | quotidienne | 30 j | 90 j | idem — **à 20 j aujourd'hui, donc au bord** |
| communes (INSEE) | annuelle | 400 j | 550 j | millésime du code officiel géographique |
| circonscriptions | **figée depuis 2017** | — | — | **jamais « ancienne » : porte sa phrase propre** |

```
Les trois états, calculés AU RENDU (jamais à l'écriture), trois phrases distinctes :

À JOUR      → la date s'affiche, sans mention d'âge
ANCIEN      → « Publié le <date>. La source n'a rien publié depuis. »
TROP ANCIEN → « Ces chiffres datent du <date>. Nous n'avons pas réussi à les
               rafraîchir depuis <n> jours. Voir la source ↗ »

Cas particulier, à écrire et non à cacher — l'Assemblée n'a pas tenu de scrutin
public depuis le 21 juillet 2026 (56 jours) :
  « L'Assemblée nationale n'a pas tenu de scrutin public depuis le 21 juillet
    2026. Ce n'est pas un retard de Repère : la séance est suspendue. »
C'est un fait sur l'institution, pas un défaut du produit, et c'est précisément
pourquoi le seuil doit produire une PHRASE et non un avertissement.
```

**Correction D-1 (BLOCKER)** : les trois avertissements de `extract-html.js` deviennent des
échecs quand le seuil TROP ANCIEN est franchi. Un produit qui sait que sa donnée est morte et
la publie quand même n'est pas honnête sur ses limites.
**Correction D-2 (HIGH)** : ajouter `releve_le` aux élus et aux comptes ; séparer
`publie_le` de `maj`.

---

## E. CACHE — BLOCKER

### E.1 · La cause n'est pas l'absence de purge, c'est l'absence de date

```js
// mono/packages/data-utils/src/store.js:95
try { await transaction("readwrite", st => st.put(valeur, cle)); return true; }
```

Le paquet est écrit **nu**. Aucun horodatage, aucune version de source. **Le cache ne peut
donc pas connaître son propre âge** — il n'y a rien à faire expirer. Et à la lecture
(`client.js:132, 168, 238`) :

```js
const enCache = await magasin.lire(cle);
if (enCache) return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" };
```

Le cache est lu **avant** le réseau et rend `SERVI` sans condition. Un lecteur qui a ouvert
Repère le 26 août verra les données du 26 août en décembre, sans qu'une ligne ne le dise.

### E.2 · Un deuxième défaut, latent et silencieux

```
estDonneePublique() : /^(dep|vote|socle):[0-9A-Z]{1,3}$/
chargerProjets()    : clé « proj:93 »      →  REFUSÉE   (démontré)
chargerScrutins()   : clé « socle:SCR »    →  acceptée
chargerVotes()      : clé « vote:93 »      →  acceptée
```

**La garde du magasin refuse la clé des projets**, et l'écriture est avalée par un
`.catch(() => {})`. Conséquence le jour où les projets reviennent : ils ne seront **jamais**
mis en cache, donc l'écran « Ce qui a été décidé » perdra sa moitié communale hors ligne —
silencieusement. L'invariant 1 serait enfreint sans qu'aucun contrôle ne le voie, puisque les
projets ne sont pas servis aujourd'hui.

### E.3 · Les quatre états demandés

```
Enveloppe à écrire dans store.js — et estDonneePublique() doit l'accepter :
  { ecrit_le: "2026-09-15T...Z", source_maj: "2026-07-29", donnees: {...} }

CACHE FRAIS            (âge < ANCIEN)      → servi, rien à dire
CACHE RÉCENT MAIS LA SOURCE A BOUGÉ        → servi immédiatement, PUIS remplacé quand le
  (source_maj du réseau > source_maj local)   réseau répond ; une ligne le dit :
                                              « Mis à jour à l'instant. »
CACHE EXPIRÉ           (âge > TROP ANCIEN) → servi, MAIS la phrase TROP ANCIEN s'affiche
                                              au-dessus. Jamais d'affirmation silencieuse
                                              d'actualité.
CACHE HORS LIGNE                            → servi, et l'écran porte
                                              « Vous êtes hors ligne. Ces données datent
                                                du <date>. » (aujourd'hui : rien)
```

Et l'ordre de lecture change : **réseau d'abord quand le réseau est là et que le cache est
ANCIEN**, cache d'abord sinon. Aujourd'hui c'est cache d'abord, toujours.

**Correction E-1 (BLOCKER)** : l'enveloppe datée + les trois états au rendu.
**Correction E-2 (HIGH)** : `proj:` dans la garde du magasin, et remplacer
`.catch(() => {})` par un chemin qui compte les refus — une garde qui refuse en silence est
une garde qui mentira un jour.

---

## F. PUBLICATION — BLOCKER

### F.1 · Cartographie réelle, aujourd'hui

```
CHEMIN 1 — celui qui sert le public  (ACTIF)
  origin/main  →  site/index.html        gel du 19 août, données du 29 juin
                  site/confidentialite.html
  publié par : réglage d'hébergeur, pas par un fichier du dépôt
  vérifié : `git show origin/main:netlify.toml` → « exists on disk, but not in origin/main »

CHEMIN 2 — celui qu'on construit  (INACTIF en production)
  travail  →  netlify.toml (base=mono, publish=apps/web/dist)
           →  node scripts/extract-html.js <le plus récent app_repere_v18_*.html> ./data
           →  pnpm build
           →  node --test tests/invariants.test.mjs          (55 contrôles seulement)
  jamais atteint : netlify.toml n'est pas sur main

CHEMIN 3 — GitHub Actions  (ROUGE)
  .github/workflows/build-publish.yml    lance les contrôles statiques AVANT pnpm build,
                                          et deux d'entre eux relisent dist/ → échec
  .github/workflows/collecte.yml         19 exécutions rouges consécutives depuis le 26/08
```

**Trois chemins, une seule URL, et celui qui gagne est celui que personne ne construit.**

### F.2 · La bascule, documentée et NON exécutée

```
ÉTAPES, dans cet ordre. Aucune n'est irréversible avant la 5.

1. (moi) corriger build-publish.yml : extraire → construire → éprouver.
   Deux contrôles relisent dist/ ; lancés avant le build ils échouent sur un
   dossier absent. Reproduit localement : 51 passent, 2 échouent.
2. (moi) ajouter le contrôle EN LIGNE vs CONSTRUIT :
     - lire https://<URL>/data/index.json
     - lire le index.json du dist qu'on vient de construire
     - comparer `genere_le` et l'empreinte des 104 paquets
     - échouer si l'écart dépasse 24 h, avec les deux dates dans le message
   Ce contrôle est ce qui rend l'existence de deux produits IMPOSSIBLE à ignorer.
3. (moi) déplacer site/ hors du chemin de publication, sans le supprimer :
   site/ → archive/site_v18_gel_2026-08-19/, avec un README qui dit ce que c'est.
4. (moi) vérifier que le build passe depuis un clone vierge de main + les 25 commits.
5. (TOI — décision produit irréversible) fusionner les 25 commits dans main.
   À cet instant, et pas avant, l'URL publique change de produit.
6. (TOI — réglage d'hébergeur, je ne peux pas y accéder) vérifier dans Netlify que
   la branche de production est main et que le fichier netlify.toml du dépôt
   prend la main sur tout réglage saisi dans l'interface.
7. (moi) relancer le contrôle de l'étape 2 : il doit être vert.
```

**Les étapes 5 et 6 demandent ton intervention. Les cinq autres sont à moi.**

---

## G. PERFORMANCE — OBSERVATION

Mesuré sur le `dist` construit à l'instant, gzip inclus.

| élément | brut | gzip |
|---|---:|---:|
| `index.html` | 3 122 o | 1 493 o |
| `assets/index-*.js` | 23 954 o | 8 503 o |
| `assets/socle-*.js` | 19 767 o | 7 916 o |
| `assets/index-*.css` | 10 717 o | 3 041 o |
| `data/index.json` | 11 007 o | 2 677 o |
| **total premier écran** | **68 567 o** | **23 630 o** |
| `data/communes-beta.json` (la recherche) | 30 385 o | 11 151 o |
| paquet le plus lourd d'Île-de-France (77) | 181 121 o | 69 941 o |
| paquet le plus léger (75, une commune) | 510 o | 347 o |
| paquet le plus lourd de France | 303 Ko | — |
| `data/` entier (jamais téléchargé en entier) | 13 Mo | — |
| préchargement du service worker | 17 fichiers (coquille + `index.json`), **pas les 215 fichiers de données** | — |

**23,6 Ko gzip pour le premier écran, 70 Ko pour le département le plus lourd.** Sur un réseau
mobile lent (≈ 400 kbit/s utiles), cela met le premier mot lisible à environ 0,5 s et l'écran
complet de Seine-et-Marne à environ 2 s. **La performance est une force du produit, pas un
risque.** Aucun blocage, aucune correction.

Un seul point à surveiller : `communes-beta.json` (11 Ko gzip) est chargé pour la recherche.
Le jour où la bêta sort d'Île-de-France, ce fichier grandit avec le nombre de communes
couvertes. Budget à inscrire : **socle + paquet départemental ≤ 350 Ko brut** (aujourd'hui
68 Ko + 303 Ko au pire = 371 Ko, donc **déjà 21 Ko au-dessus** pour le département le plus
lourd de France — LOW pour l'Île-de-France, HIGH pour l'extension).

---

## H. ACCESSIBILITÉ — BLOCKER

Les 81 contrôles de navigateur couvrent déjà les cibles tactiles (44 px), la taille minimale
du texte (13 px) et le contraste en thème sombre. Trois défauts leur échappent, tous mesurés
ici par le calcul WCAG.

| constat | ratio mesuré | exigence | classe |
|---|---:|---|---|
| **contour de focus de `.depliant` et `.votes-replier` en thème sombre** | **1,02** sur carte, **1,10** sur fond | 3,00 (WCAG 2.4.11) | **BLOCKER** |
| liens (`a { color: var(--e-ville) }`) en thème sombre | **3,21** sur carte | 4,50 pour du texte normal (1.4.3) | **HIGH** |
| `.choix > summary b` (`--e-dept`) en thème sombre | **3,42** sur carte | 4,50 | **HIGH** |
| pastille `--e-region` en thème sombre | **2,42** sur carte | 3,00 (1.4.11) | MEDIUM — décorative, `aria-hidden` |
| texte courant et texte sourd, les deux thèmes | 4,91 à 17,57 | 4,50 | OBSERVATION — conforme |
| `<html lang="fr">` | présent | — | OBSERVATION |
| cibles tactiles ≥ 44 px | `min-height: 44px` explicite, vérifié sur 7 écrans | — | OBSERVATION |

**Le contour de focus est un blocker, et sa cause est une faute de frappe de jeton.**

```css
/* app.css:208 et 216 */
.depliant:focus-visible      { outline: 2px solid var(--e-national, #1d1d1f); }
.votes-replier:focus-visible { outline: 2px solid var(--e-national, #1d1d1f); }
```

**`--e-national` n'existe pas.** Le jeton s'appelle `--e-france`. Le repli `#1d1d1f` s'applique
donc toujours — et en thème sombre, c'est un contour presque noir sur un fond presque noir :
**un lecteur au clavier ne voit pas où il est**, précisément sur les deux commandes qui ouvrent
les votes. Correction : un mot, `--e-france`, qui bascule à `#ede9e0` en thème sombre.

**Et le contrôle qui aurait dû le voir a le mauvais seuil.** Le contrôle de navigateur
s'appelle « en theme sombre, aucun texte sous 3:1 de contraste ». **3:1 est le seuil du grand
texte** ; le texte courant exige 4,5:1. Un lien à 3,21 passe donc un contrôle vert. C'est la
**troisième garde verte sur une propriété fausse** rencontrée dans ce projet — après la liste
de mots de l'invariant 8 et l'absence de contrôle de population sur les zéros.

**Correction H-1 (BLOCKER)** : `--e-france` à la place de `--e-national`.
**Correction H-2 (HIGH)** : seuil du contrôle à 4,5:1 pour le texte courant, 3:1 pour le grand
texte et les éléments d'interface ; et ajouter la mesure du contour de focus.
**Correction H-3 (HIGH)** : les liens et `summary b` en thème sombre. *Attention : l'invariant
7 gèle les cinq couleurs d'échelon. Corriger le contraste des liens demande soit d'ajouter une
variante claire pour le thème sombre (ce qui n'est pas un dégel : c'est le même échelon, de
l'autre côté, exactement ce qui a déjà été fait pour `--e-france`), soit de cesser d'employer
une couleur d'échelon comme couleur de texte. **Je recommande la première, et c'est une
décision, pas un nettoyage** — elle demande ton accord.*

---

## I. UX — AUDIT, PAS REFONTE

Aucun code d'interface n'a été touché. Sept écrans, mesurés sur les captures réelles du
produit public (390 px de large, densité 2).

| écran | objectif | question du lecteur | information principale | action | source | problème mesuré | solution |
|---|---|---|---|---|---|---|---|
| **Entrée** | choisir un lieu | « est-ce que ça parle de chez moi ? » | aucune : un titre-promesse | taper une commune | — | **41 % de la page est du sol vide** ; la phrase sur la vie privée est *sous* le champ, donc sous le clavier ; les exemples proposés sont `Ustaritz, Bayonne…` à un lecteur du 93 | remonter la phrase au-dessus du champ ; exemples issus du département affiché ; replier un alphabet sous le champ |
| **Retour (2ᵉ visite)** | retrouver sa commune | « où j'en étais ? » | **aucun écran d'entrée n'existe** | reparcourir 1 262 communes | — | **la plainte entendue 8 fois sur 8** : « Il faut encore que je repasse toute la liste des communes » | le département est connu (clé unique) : déplier l'alphabet par défaut, une lettre rend 1 à 6 communes |
| **Qui décide** *(ouvert par défaut)* | nommer les décideurs | « qui décide ici ? » | maire, adjoints, député | déplier les échelons | RNE + AN | **moins de 6 % de la hauteur varie d'une commune à l'autre** (135 px sur 2 343) ; la carte « Qui d'autre décide » occupe 518 px pour zéro donnée ; le nom du maire est à 768 px, sous la ligne de flottaison | replier la carte des échelons ; l'en-tête devient le lieu ; supprimer l'étiquette `Donnée officielle` qui repousse le nom du maire |
| **Ce qui a été décidé** | montrer les décisions | « qu'est-ce qui a été décidé chez moi ? » | 8 votes nationaux | déplier les 72 votes de détail | AN | **8 faits sur 8 sont nationaux et identiques pour toute la France** ; 55,5 % du texte est identique entre deux communes ; et l'écran impute à l'État une absence qui est la nôtre (§M.1) | sortir le vote nominatif du fil communal ; corriger la phrase d'absence |
| **L'argent** | montrer les comptes | « ma commune a-t-elle des dettes ? » | 6 montants d'un seul exercice | déplier les rapports | OFGL | un seul exercice affiché, donc **aucune évolution** : c'est là que l'aha moment manque ; 19 lignes de mise en garde pour 4 chiffres, dont 83 % identique partout | ajouter l'évolution 2024 → 2025 (après la correction B-1) ; alléger l'appareil de prudence sans le supprimer |
| **D'où ça vient** | établir la confiance | « est-ce vrai ? » | producteurs, licences, dates | ouvrir les sources | toutes | **des kilo-octets et huit lignes d'anglais technique** (`runtime:`, `statique:`) sur l'écran dont le métier unique est la confiance | supprimer le vocabulaire d'atelier ; une phrase à la place des huit |
| **Jeu** | — | — | — | — | — | hors de la barre depuis la Phase 2 | sans objet pour la bêta |

### I.1 · Audit citoyen — les huit lecteurs demandés

Joués contre les écrans réels, pas contre l'intention.

| # | lecteur | première action | compréhension | blocage | confiance | raison de continuer | raison de quitter |
|---|---|---|---|---|---|---|---|
| 1 | ne s'intéresse pas à la politique | tape sa commune | lit un titre national | « À l'Assemblée nationale » en gros à 60 % de la page | neutre | **aucune aujourd'hui** | rien ne parle de chez lui dans les 30 premières secondes |
| 2 | vote, suit peu | cherche son maire | trouve le maire | « circonscription », « exercice », « mandat ouvert » | bonne | savoir qui est son député | le vocabulaire |
| 3 | curieux | parcourt tout | va au bout | 6 expressions opaques non traduites | bonne | la couche pédagogique — **qui n'existe pas** | plafonne sur ce que le produit ne dit pas |
| 4 | passionné | cherche un classement | comprend vite | il n'y en a pas, et il n'y en aura pas | **méfiance** : il lit le refus comme une timidité | les sources primaires | **non-cible assumée** |
| 5 | âgé, peu à l'aise | cherche sa commune dans la liste | le champ marche | **reparcourt la liste à chaque visite** ; cibles à 44 px, correctes | bonne | son maire, nommé | la 2ᵉ visite |
| 6 | mobile, connexion lente | attend | 23,6 Ko gzip : l'écran arrive | **aucun** — la performance est bonne | bonne | tout fonctionne hors ligne ensuite | **le cache éternel : en décembre il verra août sans le savoir** |
| 7 | veut seulement savoir qui décide | tape, lit | **servi immédiatement et correctement** | aucun | bonne | c'est fait en 20 s | il a sa réponse, il part — **et c'est un succès** |
| 8 | veut vérifier une affirmation | va à « D'où ça vient » | trouve producteur, licence, date, lien | **un des liens renvoie 404** (§C) | **la meilleure du produit, puis entamée par le lien mort** | c'est le seul produit qui lui donne ça | le lien mort |

**Deux enseignements qui commandent la bêta.** Le lecteur 7 est servi et il part : ce n'est pas
un échec, c'est le bon usage du produit. Le lecteur 1 n'a **aucune** raison de continuer
aujourd'hui, et c'est la seule chose que l'écran d'évolution change.

---

## J. UI — MEDIUM

| constat | mesure | classe |
|---|---|---|
| l'étiquette `Donnée officielle` apparaît 2 à 3 fois par écran | et sous 480 px une règle CSS la fait passer seule sur sa ligne, repoussant le nom du maire de 30 px | MEDIUM |
| elle ne distingue rien | 100 % des données affichées sont officielles ; l'exception porte déjà `Calcul Repère` | MEDIUM |
| trois états de thème gérés proprement | `data-theme` explicite + `prefers-color-scheme`, avec un troisième cas (« système ») traité | OBSERVATION |
| polices du système uniquement | aucun hôte tiers ne voit passer un lecteur — cohérent avec l'invariant 2 | OBSERVATION |
| amplitude RGB ≤ 24 sur tous les neutres | gardée par un contrôle statique qui relit les jetons | OBSERVATION |

Aucune refonte esthétique n'est demandée ni faite. La seule correction d'UI recommandée est la
suppression de `Donnée officielle` et le renommage de `Calcul Repère` en
`Notre calcul — pas un chiffre publié`, qui dit le risque au lieu de l'auteur.

---

## K. SÉCURITÉ — LOW

| constat | mesure | classe |
|---|---|---|
| aucun serveur applicatif, aucune authentification, aucune entrée utilisateur envoyée | fichiers statiques + service worker | OBSERVATION |
| `fetch(url, { credentials: "omit" })` | `client.js:116` | OBSERVATION |
| une page d'erreur rendue en 200 par l'hébergeur est refusée | vérification du `content-type`, `client.js:119` | OBSERVATION — bon réflexe |
| le service worker n'est jamais servi depuis un cache long | `netlify.toml` : `Cache-Control: no-cache` sur `/sw.js` | OBSERVATION |
| aucune ressource d'un hôte tiers dans la page publiée | gardé par un contrôle statique qui relit `dist` | OBSERVATION |
| l'unique magasin IndexedDB refuse tout ce qui n'est pas un paquet public | `estDonneePublique()`, démontré | OBSERVATION |
| **les refus d'écriture sont avalés** | `.catch(() => {})` sur les quatre chargements | **MEDIUM** — un refus silencieux masque un défaut (§E.2) |
| pas d'ours, pas de responsable de publication nommé | aucun fichier | **HIGH** — juridique plus que technique : le produit publie des données nominatives sur des personnes publiques |
| pas de moyen de signaler une erreur | — | **HIGH** |

---

## L. VIE PRIVÉE — OBSERVATION

**Rien à corriger. C'est le chapitre le plus solide du produit.**

| propriété | vérification |
|---|---|
| une seule clé de stockage local nommée | contrôle statique + inventaire des clés écrites, en navigateur |
| aucun compte, aucun courriel, aucun cookie, aucun traceur | contrôle statique |
| **aucune adresse réseau ne porte un code de commune** | `adresseFautive()` rejette tout code INSEE et tout paramètre `insee=`/`commune=` ; le serveur reçoit « département 93 » et ne peut pas savoir si le lecteur habite Aubervilliers ou Bagnolet |
| IndexedDB ne contient que de la donnée publique départementale | `estDonneePublique()` |
| polices locales seulement | aucun hôte tiers |
| géolocalisation | refusée, et pour la deuxième et dernière fois |

Un seul point de vigilance, et il est de conception, pas de défaut : **l'enveloppe datée du
cache (§E.3) ajoute un horodatage sur l'appareil.** Il faut que ce soit la date de la
*donnée*, pas la date de la *visite* — `ecrit_le` est une propriété du paquet, jamais un
historique d'usage. `estDonneePublique()` doit refuser toute clé d'enveloppe qui ressemblerait
à une trace de lecteur, comme il le fait déjà pour `derniereVisite`.

---

## M. NEUTRALITÉ — BLOCKER

### M.1 · L'audit des phrases : celles qui transforment une donnée en affirmation

Table demandée. Une phrase doit être **plus prudente que la donnée dont elle est issue, jamais
plus affirmative** — c'est la règle, et voici où elle est enfreinte.

| phrase à l'écran | fait source | transformation | risque d'interprétation | classe |
|---|---|---|---|---|
| « L'Observatoire publie un encours de dette nul pour l'exercice 2025 : **cette commune ne doit rien.** » | `ex[5] === 0` | un 0 devient une affirmation sur la commune | **la donnée ne distingue pas ZERO de MISSING** (§B.1) : la phrase affirme plus que la donnée ne porte | **BLOCKER** |
| « L'Observatoire publie un montant nul pour l'exercice 2025. **Ce n'est pas une donnée manquante : la source écrit zéro.** » | idem | affirme ce que la source a écrit | **faux pour les frais de personnel 2021** : la source n'écrit pas zéro, la colonne est absente | **BLOCKER** |
| « **Aucun adjoint n'est enregistré** pour cette commune dans le Répertoire national des élus. » | `adjoints === 0` | un 0 devient une affirmation sur le contenu du Répertoire | un conseil municipal élit au moins un adjoint : l'affirmation porte sur le Répertoire et rien ne l'établit | **BLOCKER** |
| « Ce n'est pas un retard de Repère : sur la période relevée, **l'État ne publie aucun projet financé dans cette commune** » | `projets === null` — **le fichier n'est pas servi du tout** | une absence chez nous devient une absence chez l'État | **c'est le malentendu observé en étude** : une lectrice en a conclu « il n'y a rien de prévu à Bagnolet » et l'a répété en réunion avec l'autorité d'une source officielle. **Phrase fausse pour les 34 969 communes.** | **BLOCKER** |
| « le fichier de la Direction générale des collectivités locales **ne porte aucune ligne pour cette commune** sur ces exercices » | idem | idem | idem | **BLOCKER** |
| « Le relevé des scrutins ne porte aucune position pour <nom>. » | `suite[i] === "."` | une absence de position devient une phrase nominative | **reconstitue une donnée de présence** (§M.2) ; et pour la 5ᵉ des Yvelines, l'absence a une explication institutionnelle que nous n'affichons pas | **HIGH** |
| « C'est la source qui est muette, et Repère n'invente pas de nom. » | fichier incomplet | — | **exemplaire** : l'affirmation porte sur nous et sur la source, jamais sur le territoire | OBSERVATION |
| « Un montant absent n'est pas un montant nul : Repère n'affiche rien plutôt qu'un zéro qui pourrait être faux. » | — | — | **c'est la phrase la plus juste du produit — et la donnée la contredit** | OBSERVATION |
| « La longueur des barres compare ces six montants entre eux, pour cette commune uniquement. Repère ne compare jamais deux communes. » | — | — | correcte, mais c'est une *interdiction* là où une *raison* convaincrait (§M.3) | MEDIUM |
| « Une part élevée n'est pas un gaspillage » / « une dette qui baisse n'est pas en soi une bonne nouvelle » | calcul annoncé | — | **exemplaire** : chaque rapport porte ce qu'il ne veut pas dire | OBSERVATION |

**Cinq phrases BLOCKER, et elles ont toutes la même forme : une absence de notre côté devient
une affirmation sur la source ou sur le territoire.** C'est la même faute que le zéro
structurel, à l'étage du langage.

**Correction M-1 (BLOCKER)** : les trois phrases de projets deviennent
« **Repère ne publie pas encore les projets financés par l'État.** La source existe et elle est
à jour ; c'est notre chaîne de collecte qui ne la sert plus. Voir la source ↗ » — une phrase
sur nous, et un aveu, pas une imputation.

### M.2 · L'invariant 8 enfreint par la forme de la donnée

Rappel du constat, parce qu'il est un blocker de publication et non un chantier de fond :

```
data/scrutins/NN.json  →  { "positions": { "PA330008": "...........pp.p.....pcppp.ap", ... } }
                           une chaîne PAR DÉPUTÉ, couvrant les 80 scrutins dans l'ordre
```

Mesuré sur nos fichiers : **médiane de 65 positions non portées sur 80 par député**, 486
députés sur 574 en portent 40 ou plus. Un tiers qui veut publier « taux de présence de votre
député » obtient **19 % pour le député médian**, en une ligne de JavaScript, sur des fichiers
signés Repère. Le chiffre serait faux — la plupart des 80 scrutins sont des scrutins ordinaires
à faible participation — et l'erreur nous serait imputée.

La garde de l'invariant 8 cherche des **noms de champs** (`presence`, `assiduite`,
`taux_presence`). Aucun champ ne s'appelle ainsi. **La garde est verte et l'invariant est
enfreint par la forme.**

**Correction M-2 (BLOCKER)** : indexer par scrutin (`{ "8431": { "PA721908": "p" } }`), ne
publier que les 8 scrutins affichés au lieu de 80, retirer de l'écran la ligne des positions
non portées, et écrire le contrôle : *aucun fichier publié ne contient, sous une clé nommant
une personne, une valeur dont la longueur est celle du catalogue.*

### M.3 · Ce qui manque, et qui ne coûte aucune donnée

La phrase la plus importante du produit n'est écrite nulle part :

> « Un vote nominatif n'existe que si quelqu'un a demandé un scrutin public. La plupart des
> décisions de l'Assemblée sont prises à main levée et ne laissent aucune trace par député. Ce
> que vous lisez ici n'est donc pas l'ensemble des votes de votre député, et son absence d'une
> liste ne veut rien dire. »

Et la règle générale, qui vaut partout : **une phrase de raison remplace une phrase
d'interdiction.** « Repère ne compare jamais deux communes » apprend au lecteur à le faire
lui-même ; « ces chiffres ne se comparent pas d'une commune à l'autre, parce que chacune n'a
pas les mêmes compétences et que les budgets annexes ne sont pas comptés ici » l'en dissuade
vraiment.

### M.4 · Partis et groupes — le besoin produit est conservé, la relation artificielle refusée

La demande est juste et elle est déjà la règle du produit : **Repère dit « groupe
parlementaire », jamais « parti »**, parce que l'Assemblée publie des groupes et pas des
partis.

Ce qui est immédiatement faisable, et qui ne coûte rien : le fichier
`liste_deputes_libre_office.csv` de l'Assemblée porte la colonne
`Groupe politique (abrégé)`, vérifiée. Nommer le groupe du député élu ici, **avec la phrase
« un groupe parlementaire n'est pas un parti : il peut en réunir plusieurs, et des députés y
siègent sans appartenir à aucun »**, est une P1 honnête.

Ce qui reste refusé, et le motif n'a pas changé : **aucune source publique française ne publie
la position d'un parti.** La couche PARTI → POSITION → PROPOSITION → VOTE → SOURCE demanderait
que Repère décide lui-même quel groupe correspond à quel parti. Ce serait fabriquer l'étiquette
politique que le produit promet en trois endroits de ne pas fabriquer.

**La seule voie qui pourrait un jour l'ouvrir, et elle n'existe pas encore** : que les partis
eux-mêmes publient leurs positions sous une forme ouverte et datée, ou qu'une autorité
publique le fasse. Ni l'un ni l'autre n'existe. Je continuerai à le vérifier à chaque revue
de données ; je ne l'implémenterai pas sur une correspondance devinée.

---

## N. CAS LIMITES — HIGH

Chaque ligne a été mesurée, et la colonne « ce que voit le lecteur » décrit l'écran réel, pas
l'intention.

| cas limite | population | ce que voit le lecteur aujourd'hui | classe |
|---|---:|---|---|
| **Paris** : commune ET département, **18 circonscriptions pour une commune** | 1 commune, ~2,1 M habitants | 18 députés possibles ; le paquet `75.json` pèse 510 o ; la notion de « votre député » n'a pas de sens sans l'adresse, que le produit ne demandera jamais | **HIGH** — à traiter avant toute extension |
| commune à cheval sur plusieurs circonscriptions | **14 en Île-de-France** (Versailles, Boulogne-Billancourt, Colombes, Courbevoie, Meudon, Bondy, Saint-Denis, Champigny, Créteil, Gentilly, Vitry, Cergy, Sarcelles, + Paris) ; 118 en France | tous les députés sont listés et la commune est dite partagée — **comportement correct** | OBSERVATION |
| **maire homonyme d'un député du même département** | **10 communes en France, 1 en Île-de-France** (La Courneuve) | **deux affirmations qui ne peuvent pas être vraies ensemble** : le cumul maire/député est interdit. Repère affiche les deux et ne peut pas dire laquelle est périmée | **BLOCKER** |
| maire homonyme d'un député d'un **autre** département | 11 communes | homonymie probable (« Philippe BRUN » apparaît maire de deux communes différentes, ce qui est impossible et prouve que la coïncidence de nom suffit) — **ne doit jamais être affiché comme un cumul** | OBSERVATION — et c'est la leçon de méthode : *un nom n'est pas une identité* |
| commune sans exercice 2025 | 4 en Île-de-France (Melz-sur-Seine, Montigny-le-Guesdier, La Tombe, Saint-Léger-en-Yvelines) | l'écran prend le dernier exercice disponible (2024) et le dit | OBSERVATION |
| commune absente de tous les paquets | **4** : 77021, 77253, 92077, 94075 (1 262 servies pour 1 266 au code officiel) | **elle ne trouve pas sa commune, et rien ne lui dit pourquoi** | **HIGH** |
| siège sans fichier de positions | 2 sur 97 en Île-de-France : 4ᵉ de Paris, **5ᵉ des Yvelines** | « Le relevé des scrutins ne porte aucune position pour <nom> » — or pour la 5ᵉ des Yvelines, le siège est celui de la personne qui préside l'Assemblée, laquelle par usage ne prend pas part aux scrutins. **Une absence institutionnelle est présentée comme une absence de relevé** | **HIGH** |
| `adjoints === 0` | 65 en France, 10 en Seine-et-Marne, 17 en outre-mer | « Aucun adjoint n'est enregistré » — voir §M.1 | **BLOCKER** |
| outre-mer | paquets 971 à 976 servis ; **98, 987, 988 pèsent 23 à 33 octets** | un écran quasi vide pour la Nouvelle-Calédonie, la Polynésie, Wallis-et-Futuna | HIGH hors Île-de-France, sans objet pour la bêta |
| hors ligne, département jamais téléchargé | — | phrase explicite, aucun bouton « Réessayer », vérifié par 81 contrôles | OBSERVATION |
| **hors ligne, données périmées** | tous les lecteurs de retour | **rien ne le dit** (§E) | **BLOCKER** |
| l'Assemblée n'a pas voté depuis 56 jours | tous | rien ne le dit ; l'écran a l'air simplement vieux | **HIGH** |
| commune nouvelle / fusion | non mesuré | un code INSEE disparu = un lecteur qui ne trouve plus sa commune ; aucun contrôle ne vérifie que tout code servi existe au millésime courant | HIGH pour l'extension |

---

## O. TESTS — HIGH

| suite | lancement | résultat mesuré | dans la chaîne de publication ? |
|---|---|---|---|
| `tests/invariants.test.mjs` | `node --test` | **55 / 55** | **oui** |
| `tests/runtime.test.mjs` | `node tests/runtime.test.mjs apps/web/dist` | **81 contrôles, 0 échec** | **non** |
| `tests/beta_idf.mjs` | `node tests/beta_idf.mjs <dist>` | **plante sans argument** | non |
| `tests/poids.mjs` | `node tests/poids.mjs <dist>` | **plante sans argument** | non |
| `node --test tests/` (les quatre ensemble) | — | **ÉCHEC** : les deux derniers sont ramassés par le lanceur sans argument | — |
| `outils/audit_rc.py` *(créé aujourd'hui)* | `python3 outils/audit_rc.py` | **14 échecs de vérité, 3 attentions** | non — à ajouter |

**136 contrôles verts, et cinq faits faux à l'écran.** Ce n'est pas une contradiction, c'est le
diagnostic : les contrôles vérifient des propriétés du **code** et des **écrans**, presque
aucune propriété de la **donnée**. Trois gardes vertes sur une propriété fausse ont été
rencontrées dans ce projet :

1. l'invariant 8 gardé par une liste de noms de champs, enfreint par la forme de la donnée ;
2. aucun contrôle ne compare une valeur à sa population — d'où 34 563 zéros publiés ;
3. le contrôle de contraste en thème sombre réglé à 3:1 là où le texte courant exige 4,5:1.

**Correction O-1 (HIGH)** : `outils/audit_rc.py` entre dans la chaîne de publication, avant
`pnpm build`, et son code de sortie fait échouer le déploiement.
**Correction O-2 (HIGH)** : une cible unique qui lance les trois suites plus l'audit.

---

## P. RISQUES

| # | risque | probabilité | ce qui le ferme |
|---|---|---|---|
| 1 | un chiffre faux publié avec une source officielle à côté | **certaine — c'est le cas aujourd'hui** | B-1 |
| 2 | une absence de notre côté lue comme une absence de fait, puis répétée en réunion publique | **observée en étude** | M-1 |
| 3 | un tiers calcule un taux de présence sur nos fichiers et l'erreur nous est imputée | **élevée, les fichiers sont publiés** | M-2 |
| 4 | le produit public n'est pas le produit construit | **certaine — c'est le cas aujourd'hui** | F.2 |
| 5 | des données mortes servies indéfiniment sans qu'une ligne le dise | **certaine** | E-1, D-1 |
| 6 | deux affirmations contradictoires affichées ensemble (maire / député) | **certaine — 10 cas, 1 en Île-de-France** | contrôle de §N |
| 7 | un lecteur au clavier perdu en thème sombre | certaine pour ce lecteur | H-1 |
| 8 | une capture d'écran instrumentalisée contre un élu | élevée dès la première visibilité | §M, et l'interdiction du pourcentage dans la phrase d'évolution |
| 9 | un rattachement deviné : table des circonscriptions figée depuis 2017, découpage de 2010 | présente | l'écrire à l'écran ; dérivation 2024 en contrôle croisé |
| 10 | une garde verte sur une propriété fausse | **démontrée trois fois** | tout nouvel invariant se garde par une **propriété**, jamais par une liste de mots |
| 11 | le produit est vrai, prudent, sourcé, et personne ne revient | 1 non-professionnel sur 8 revient à trois mois | **non fermé** — c'est l'hypothèse à tester en bêta, pas à corriger par du code |
| 12 | épuisement sur des chantiers de correction pendant que la feuille de route promet des fonctionnalités | élevée | assumer que 9 des 11 blockers sont des corrections, et qu'aucune n'est une fonctionnalité |

---

## Q. BLOCKERS

**Onze blockers. Dix concernent la vérité d'une donnée affichée ; un concerne
l'accessibilité au clavier. Aucun ne demande une source nouvelle. Aucun n'est une
fonctionnalité.**

| # | blocker | correction | où | effort |
|---|---|---|---|---|
| **1** | frais de personnel = 0 pour 34 563 communes sur 34 563 en 2021 | **règle V-1** : `null` quand un poste est nul au-delà de 95 % d'une population | `mono/scripts/extract-html.js` | 2 h |
| **2** | la phrase « cette commune ne doit rien » repose sur un 0 dont on ne sait pas s'il est publié | découle de 1 : une fois V-1 appliquée, un 0 signifie ZERO et rien d'autre | — | 0 (découle de 1) |
| **3** | la phrase « la source écrit zéro » est fausse pour le poste cassé | découle de 1 | — | 0 |
| **4** | `adjoints === 0` pour 65 communes ; le zéro est juridiquement impossible | `null` si le relevé ne porte pas d'adjoint ; phrase « Repère n'a pas réussi à lire… » | `extract-html.js` + `QuiDecide.jsx` | 1 h |
| **5** | l'écran impute à l'État une absence qui est la nôtre (3 phrases, 34 969 communes) | **M-1** : « Repère ne publie pas encore les projets financés par l'État » | `CeQuiADecide.jsx` | 1 h |
| **6** | les positions publiées permettent de calculer un taux de présence (invariant 8) | **M-2** : indexer par scrutin, publier 8 scrutins, retirer la ligne des positions non portées, contrôle de forme | `mono_donnees.py`, `votes.jsx`, `invariants.test.mjs` | 4 h |
| **7** | le cache ne peut pas connaître son âge : aucune date n'est écrite avec le paquet | **E-1** : enveloppe `{ ecrit_le, source_maj, donnees }` + trois états au rendu | `store.js`, `client.js` | 4 h |
| **8** | la donnée financière n'a aucune dérivation traçable depuis sa source | **C-1** : `outils/ofgl.py` dans la collecte, avec journal et empreinte | nouveau | 1 j |
| **9** | le lien de provenance des circonscriptions renvoie 404 | **C-2** : corriger l'URL, et un contrôle qui appelle chaque lien affiché | `circos.json` + contrôle | 2 h |
| **10** | 10 communes affichent un maire homonyme d'un député du même département : deux affirmations incompatibles | contrôle bloquant + **arbitrage produit** sur quelle source l'emporte (voir §R.4) | `audit_rc.py` + décision | 2 h + décision |
| **11** | contour de focus invisible en thème sombre (ratio 1,02) sur les deux commandes qui ouvrent les votes | **H-1** : `--e-france` à la place du jeton inexistant `--e-national` | `app.css:208,216` | 5 min |

**Total : environ 2,5 jours de travail, dont 1 pour le blocker 8.** Les blockers 2 et 3 sont
gratuits : ils disparaissent avec le 1.

---

## R. GO / NO-GO TECHNIQUE

### R.1 · Verdict

**NO-GO pour la publication en l'état.** Ce n'est pas un verdict sur la qualité du produit :
la performance est excellente, la vie privée est irréprochable, l'architecture hors ligne
tient, 136 contrôles sont verts et la provenance est déjà meilleure que celle de la plupart des
produits comparables. **C'est un verdict sur cinq phrases qui seraient fausses devant
1 000 citoyens.**

### R.2 · Risques acceptables — publier avec, et les écrire

| risque accepté | pourquoi il est acceptable |
|---|---|
| l'Assemblée n'a pas voté depuis 56 jours | c'est un fait sur l'institution, pas un défaut ; il suffit de l'écrire |
| la table des circonscriptions date de 2017, le découpage de 2010 | la couverture francilienne est de 1 262/1 262 et l'objet n'est pas faux ; il suffit de dire son âge |
| 14 communes partagées entre plusieurs circonscriptions | déjà traité correctement : tous les députés sont nommés et le partage est dit |
| aucun projet financé affiché | acceptable **une fois la phrase corrigée** (blocker 5) : un produit peut ne pas tout servir, il ne peut pas en accuser la source |
| pastille `--e-region` à 2,42 en thème sombre | décorative et `aria-hidden` ; aucune information n'est portée par cette couleur |
| pas d'évolution des comptes à l'écran | l'aha moment manque, mais son absence n'est pas un mensonge |
| 1 lecteur sur 8 revient à trois mois | c'est l'hypothèse que la bêta doit tester ; la corriger avant de l'avoir mesurée serait deviner |

### R.3 · À corriger avant publication

Les onze blockers de §Q, dans cet ordre de dépendance : **11** (5 minutes, et un lecteur au
clavier cesse d'être perdu) → **1** (d'où 2 et 3 tombent) → **4** → **5** → **9** → **7** →
**6** → **10** → **8**.

Puis, et seulement alors, les étapes 1 à 4 de la bascule de publication (§F.2), qui sont à
moi ; les étapes 5 et 6 sont à toi.

### R.4 · Ce qui demande ton arbitrage

Cinq questions. Aucune ne peut être tranchée par une mesure.

1. **Le maire et le député homonymes (blocker 10).** Deux affirmations incompatibles, et je ne
   peux pas dire laquelle est périmée : le conteneur ne joint pas les sources françaises. Les
   municipales de mars 2026 ont eu lieu ; un député élu maire devait choisir dans les trente
   jours. L'hypothèse cohérente est donc que **c'est le fichier des députés qui est en retard**
   pour ces sièges — mais la fiche officielle d'au moins un des dix le donne toujours député en
   exercice. Trois options : (a) n'afficher aucun des deux pour ces 10 communes, avec une phrase
   qui dit que deux sources se contredisent ; (b) afficher les deux avec cette phrase ; (c)
   faire trancher par le runner GitHub, qui joint les deux sources, avant publication.
   **Je recommande (c) puis (a) en repli.** Ton avis est nécessaire parce que (b) revient à
   publier une contradiction assumée.
2. **Le contraste des liens en thème sombre (H-3).** Corriger demande d'ajouter une variante
   claire des couleurs d'échelon pour le thème sombre. Ce n'est pas un dégel de l'invariant 7 —
   c'est exactement ce qui a déjà été fait pour `--e-france` — mais **desserrer une garde
   existante est une décision, pas un nettoyage**, et je ne le ferai pas sans ton accord.
3. **La paire d'exercices de l'aha moment.** Je recommande **2024 → 2025** (91,0 % de dettes qui
   ont changé, comparabilité établie) contre 2021 → 2025 (94,0 %, comparabilité non établie).
   C'est 3 points de « surprise » en moins contre une vérité démontrable. Je tranche pour la
   vérité, mais c'est ton produit.
4. **L'OFGL (blocker 8).** Écrire le collecteur est une journée, et c'est la seule correction
   lourde. L'alternative est de publier en disant « données financières pré-agrégées le
   <date>, dérivation non reproductible » — ce qui est honnête mais faible pour un produit dont
   la promesse est la vérifiabilité. **Je recommande de l'écrire avant la bêta.**
5. **Le périmètre de la bêta.** 4 communes franciliennes sont absentes de tout paquet
   (77021, 77253, 92077, 94075). Publier sans elles, c'est accepter que quatre communes ne
   trouvent pas leur nom. Les réintégrer demande de comprendre pourquoi elles manquent, ce qui
   n'est pas mesuré. **Bloquant ou acceptable : c'est à toi.**

### R.5 · Ce qui est déjà assez solide pour envisager la publication

Il faut le dire aussi, parce que c'est vrai et que rien dans la liste des blockers ne
l'entame :

- **la vie privée** : une seule clé, aucun traceur, et le serveur ne peut structurellement pas
  apprendre quelle commune est lue. Aucun concurrent financé par la publicité ou par un modèle
  de compte ne peut copier cela ;
- **la performance** : 23,6 Ko gzip pour le premier écran, 70 Ko pour le département le plus
  lourd d'Île-de-France ;
- **le hors ligne** : 81 contrôles ouvrent l'application, coupent le réseau et regardent ce qui
  s'affiche ;
- **la couverture** : maire, adjoints, circonscription, comptes et député nommable à 100 % ou
  99,2 % des 1 262 communes ;
- **la doctrine du vide** : sept écrans sans une seule forme grise, et des phrases d'absence
  qui disent des choses différentes selon la cause ;
- **la provenance affichée** : producteur, licence, date et lien sur chaque chiffre ;
- **l'appareil de prudence** : chaque calcul dérivé porte ce qu'il ne veut pas dire. C'est rare,
  et c'est la meilleure chose du produit.

### R.6 · La hiérarchie appliquée

> VÉRITÉ > COMPRÉHENSION > UTILITÉ > PROFONDEUR > BEAUTÉ > ENGAGEMENT

Ce document l'a suivie sans exception : **aucune correction d'apparence n'est recommandée avant
les onze blockers de vérité**, l'aha moment perd 3 points de surprise pour gagner une
comparabilité démontrable, et rien dans ces pages ne cherche à faire revenir le lecteur.

**La réponse à la question posée, en une phrase :** le produit que nous sommes sur le point de
rendre public est déjà honnête dans sa conception et faux dans cinq de ses phrases ; il mérite
de devenir le Repère public **après** les onze blockers, et pas avant.
