# CONTRAT DE DONNÉES — `outils/decouper.py` → `site_engendre/donnees/`

Mesuré le 2026-08-25 sur `app_repere_v18_20.html` (16 994 801 o), en exécutant réellement `decouper.py` (4,3 s, sortie dans un scratchpad, aucun fichier du dépôt modifié).

---

## 0. Résumé exécutable

| | |
|---|---|
| Entrée | l'application autonome `app_repere_v18_*.html` (la plus récente par `sort -V`, `.bak` exclus) |
| Ce qui est lu | deux seules structures : `window.REPERE_RNE` et `window.REPERE_OFGL`, extraites par comptage d'accolades (`extraire()`), pas par regex de contenu |
| Sortie | 209 fichiers JSON, 7,32 Mo cumulés, en 3 niveaux |
| Servi sous | `donnees/` à la racine du site (`https://…/donnees/rne/07.json`) |
| État | **produit mais jamais consommé** : `app_repere_v18_20.html` ne contient aucune occurrence de `donnees/rne`, `REPERE_DONNEES`, ni d'URL de département. Seules `REPERE_AGENDA_URL` (3×) et `REPERE_EVENEMENTS_URL` (2×) existent. |

**Défaut majeur mesuré : tous les fichiers `ofgl/<dept>.json` sont vides.** Détail au § 6.1.

---

## 1. Arborescence exacte produite

```
<SORTIE>/                          (argv[2] ; pipeline passe "site_donnees")
├── manifeste.json                 2 594 o
├── rne/
│   ├── socle.json               173 297 o
│   ├── 01.json … 95.json
│   ├── 2A.json  2B.json
│   ├── 971.json … 976.json
│   └── 98.json                   (103 fichiers de département)
└── ofgl/
    ├── socle.json               168 987 o
    └── 01.json … 98.json         (103 fichiers, 23–24 o chacun)
```

- 103 départements, dérivés de `sorted({departement(c) for c in RNE["com"]})`.
- Règle de nom de département (`departement(insee)`) : **`insee[:3]` si `insee[:2] == "97"`, sinon `insee[:2]`**. La Corse tombe donc naturellement sur `2A`/`2B` (les codes INSEE portent déjà la lettre). `98` (Monaco/TAAF selon la source) et `975` sont présents.
- Aucun fichier n'est nommé par commune — l'invariant du banc (« aucune adresse réseau ne porte un code de commune », `test_repere.mjs:397`) est respecté par construction : les noms sont de 2 ou 3 caractères, ou `2A`/`2B`, jamais 5 chiffres.
- **Aucun nettoyage du dossier de sortie** : `os.makedirs(..., exist_ok=True)` seulement. Un département disparu de la source laisse son ancien fichier en place, et il sera publié.

---

## 2. `manifeste.json`

```json
{
  "v": 1,
  "departements": ["01","02",…,"2A","2B",…,"971",…,"98"],   // 103, triés
  "rne":  { "socle": 173297, "dep": { "01": 78775, "07": 69985, … } },
  "ofgl": { "socle": 168987, "dep": { "01": 23, "07": 23, … } }
}
```

Les tailles sont en **octets UTF-8 du JSON**, mesurées après sérialisation (`len(brut.encode())`), pas les tailles disque. Aucune empreinte, aucune date, aucune version de données : le manifeste ne permet pas d'invalider un cache. `v` vaut `1`.

Mesures RNE par département : min 518 o (`975`), médiane 69 985 o (`07`), max 177 746 o (`62`).

---

## 3. `rne/socle.json` — le socle commun (173 297 o)

Clés retenues, dans l'ordre de la liste `SOCLE` du script :

| clé | type | n mesuré | signification |
|---|---|---|---|
| `v` | int | `1` | version de format |
| `meta` | objet | 24 champs | licence ODbL 1.0, producteur Ministère de l'Intérieur, `source`, `maj` = `2026-08-11`, `maj_statut` = `etablie`, `communes_couvertes` = 34637, `communes_total` = 34875, `perimetre`, `sans_etiquette` = true… **C'est le porteur de l'invariant 4 (source + date).** |
| `f` | liste[str] | 104 | table GLOBALE des fonctions (« Maire », « 2ème adjoint au Maire »…). **Volontairement non réindexée** : 2 Ko, dupliquer coûte moins que réindexer (commentaire de `personne()`). |
| `e` | liste[str] | 1 241 | noms d'EPCI. Indexée par `ecc[0]`. |
| `cn` | liste[str] | 2 066 | noms de cantons. Indexée par `ccan` et `depcan`. |
| `d` | liste[str] | 254 | dates de mandat ISO (`"2026-03-15"`). Indexée par `dcom`, `dadj`, `ddep`, `dreg`, `dnat`, `dcsp`. |
| `reg` | objet | 14 | conseillers régionaux, clé = code région → `[[p,n,f], …]` |
| `nat` | objet | 109 | parlementaires, clé = code dép./circo → `[[p,n,f,ch], …]` (4ᵉ champ = chambre, 0/1) |
| `csp` | objet | 10 | collectivités à statut particulier → `[[p,n,f], …]` |
| `csplib` | objet | 10 | libellés des CSP (`"975" → "Saint-Pierre-Et-Miquelon"`, `"69M" → "Métropole De Lyon"`) |
| `dreg`,`dnat`,`dcsp` | objet→liste[int] | 14 / 109 / 10 | dates de mandat, index dans `d`, **parallèles rang par rang** à `reg`/`nat`/`csp` |
| `arr` | objet | 3 | maires d'arrondissement, clé = INSEE de la ville-centre (`13055`, `69123`, `75056`) → `[[p,n,f], …]` |
| `p` | liste[str] | **915** | prénoms LOCAUX au socle (réindexés depuis les 7 821 globaux) |
| `n` | liste[str] | **2 815** | noms LOCAUX au socle (réindexés depuis les 74 728 globaux) |

⚠️ `arr` est indexé par un **code INSEE de commune**. Il vit dans le socle, donc il est servi à tout le monde : aucune fuite (il ne révèle pas la commune du lecteur), mais c'est la seule clé « par commune » hors des fichiers de département.

---

## 4. `rne/<dept>.json` — un département (exemple `07`, 69 985 o)

```json
{
  "d": "07",
  "com":    { "07001": [0,0,0] },                      // le maire : [p, n, f]
  "adj":    { "07001": [[28,223,3],[117,307,1]] },     // les adjoints : [[p,n,f], …]
  "ecc":    { "07002": [70, 3, [[1,1,82]]] },          // [idx_epci, ?, [[p,n,f], …]]
  "ccan":   { "07001": 125 },                          // index dans socle.cn
  "cl":     { "07001": "Accons" },                     // libellé de la commune
  "dcom":   { "07001": 0 },                            // index dans socle.d (date du maire)
  "dadj":   { "07001": 0 },                            // index dans socle.d (date des adjoints)
  "dep":    [[176,1263,38], …],                        // conseil départemental, 34 élus
  "depcan": [120,120,121, …],                          // index dans socle.cn, rang par rang
  "ddep":   [12,12,12, …],                             // index dans socle.d, rang par rang
  "p":      ["Annie","Stéphanie", …],                  // 454 prénoms LOCAUX
  "n":      ["MERCIER","CREVOULIN", …]                 // 1 270 noms LOCAUX
}
```

Répartition des clés, telle qu'écrite dans le script :

```python
PAR_COMMUNE = ["com", "adj", "ecc", "ccan", "cl", "dcom", "dadj"]
PAR_DEPT    = ["dep", "depcan", "ddep"]
SOCLE       = ["v","meta","f","e","cn","d","reg","nat","csp","csplib",
               "dreg","dnat","dcsp","arr"]
PERSONNES   = {"com","adj","ecc","dep","reg","nat","csp","arr"}
```

`PAR_COMMUNE` : sous-dictionnaire filtré sur les communes du département ; **la clé est omise si le sous-dictionnaire est vide** (`if sous: paquet[k] = sous`). `PAR_DEPT` : valeur unique, présente seulement si `d in RNE[k]`. Un lecteur doit donc traiter toute clé comme optionnelle, `d` exceptée.

---

## 5. Le dictionnaire `FORME` et la réindexation

### 5.1 `FORME` — la forme déclarée, clé par clé

```python
FORME = {"com": "une",   "adj": "liste", "ecc": "ecc",
         "dep": "liste", "reg": "liste", "nat": "liste",
         "csp": "liste", "arr": "liste"}
```

Trois formes seulement, appliquées par `personnes(t_p, t_n, v, forme)` :

| forme | disposition | traitement |
|---|---|---|
| `"une"` | `[p, n, f]` — **une** personne | `personne()` sur la valeur elle-même |
| `"liste"` | `[[p, n, f, …], …]` | `personne()` sur chaque élément |
| `"ecc"` | `[epci, x, [[p,n,f], …]]` — la liste est au **troisième rang** | copie superficielle, puis `personne()` sur chaque élément de `out[2]` |

Le commentaire du script explique pourquoi la forme est déclarée et non devinée : une heuristique « si c'est une liste de listes » plantait sur `ecc`, dont le premier élément est un entier. Toute clé absente de `FORME` mais présente dans `PERSONNES` lèverait un `KeyError` — les deux ensembles coïncident aujourd'hui exactement.

Toute autre forme retourne `v` inchangé (`return v` final), et les clés hors `PERSONNES` (`ccan`, `cl`, `dcom`, `dadj`, `depcan`, `ddep`, `csplib`, `d`…) sont recopiées telles quelles : ce sont des libellés, des index de canton ou de date.

### 5.2 `personne()` — ce qui est réindexé et ce qui ne l'est pas

```python
def personne(t_p, t_n, e):
    if not isinstance(e, list) or len(e) < 2: return e
    return [t_p(e[0]), t_n(e[1])] + list(e[2:])
```

**Seuls les rangs 0 et 1 sont réindexés.** Tous les champs suivants — la fonction `f`, le champ chambre de `nat` — restent des index dans les tables **globales du socle**. Un élément de moins de 2 rangs est retourné inchangé (garde silencieuse).

### 5.3 `Table` — réindexation paresseuse, dans l'ordre d'arrivée

```python
class Table:
    def __call__(self, i):
        if i is None: return None
        if i not in self.idx:
            self.idx[i] = len(self.vals)
            self.vals.append(self.source[i])
        return self.idx[i]
```

- Une paire `Table(RNE["p"]), Table(RNE["n"])` **neuve par département**, et une paire distincte pour le socle. Les index locaux ne sont donc **jamais** comparables d'un fichier à l'autre.
- L'ordre est celui de la première rencontre, qui suit l'ordre d'itération de `PAR_COMMUNE` puis `PAR_DEPT`, communes triées. Reproductible, mais non alphabétique.
- Gain mesuré : 7 821 prénoms → 915 (socle) / 454 (Ardèche) ; 74 728 noms → 2 815 / 1 270.

**Règle de lecture, pour un développeur** : `prenom = paquet.p[e[0]]`, `nom = paquet.n[e[1]]`, `fonction = socle.f[e[2]]` — les deux premiers dans le fichier courant, le troisième dans le socle. Ne jamais résoudre un `p`/`n` d'un fichier avec la table d'un autre.

### 5.4 Contrôle interne du script

`decouper.py` se relit sans confiance, lignes 165-173 :
1. il rouvre `rne/<premier dept>.json`, prend la première commune triée, résout `p[i_p]`/`n[i_n]` et compare au couple obtenu depuis les tables globales — assertion si la réindexation a cassé un nom ;
2. il relit les 103 fichiers et vérifie que `Σ len(com) == len(RNE["com"])` = 34 637.

**Aucun contrôle équivalent n'existe côté OFGL.** C'est ce qui laisse passer le défaut du § 6.1.

---

## 6. OFGL

### 6.1 ⛔ DÉFAUT MESURÉ — tous les `ofgl/<dept>.json` sont vides

Contenu réel de **chacun** des 103 fichiers :

```
$ cat ofgl/07.json
{"d":"07","commune":{}}          (23 octets)
```

Cause, ligne 149 :

```python
com_ofgl = OFGL["ech"].get("commune", {})
...
sous = {c: v for c, v in com_ofgl.items() if departement(c) == d}
```

`OFGL["ech"]["commune"]` **n'est pas** un dictionnaire INSEE → données. C'est un enveloppe à trois clés :

```
OFGL.ech.commune = { "terr": {…34 875 communes…}, "exercices": ["2021","2024","2025"], "source": "https://…" }
```

Les seules clés itérées sont donc `"terr"`, `"exercices"`, `"source"`, dont `departement()` tire `"te"`, `"ex"`, `"so"` — qui ne valent jamais un code de département. Le filtre est vide 103 fois sur 103. **Le bon chemin est `OFGL["ech"]["commune"]["terr"]`.**

Conséquences :
- **aucune donnée financière communale n'est publiée** par le découpage ;
- le manifeste annonce sereinement `"ofgl": {"dep": {"01": 23, …}}` — 23 octets, sans que rien ne s'en alarme ;
- le chiffre imprimé par le script, `ce qu'un lecteur telecharge : 403 Ko`, **est faux**. Une fois le chemin corrigé, j'ai mesuré la vraie médiane : **480 Ko** (socle RNE 169 Ko + socle OFGL 165 Ko + RNE dép. 68 Ko + OFGL commune dép. 78 Ko), soit un rapport de 35× et non 41×. Le total OFGL communal à répartir pèse 8,26 Mo.
- `975` et `98` n'ont de toute façon aucune commune côté OFGL (2 des 103 départements resteront légitimement vides — la doctrine du vide, invariant 5, devra produire une phrase pour eux).

Le même défaut de chemin frappe `ofgl/socle.json`, mais **à l'envers** : `OFGL["ech"].get("departement")` et `.get("region")` renvoient l'enveloppe complète, `terr` compris. Le socle embarque donc les 101 départements et 17 régions en entier (168 987 o) — ce qui est correct par accident, puisque ces échelons sont peu nombreux et servis à tous.

### 6.2 `ofgl/socle.json` — structure réellement produite

```json
{
  "v": 1,
  "meta": { "licence": "Licence Ouverte 2.0", "producteur": "Observatoire des finances…",
            "source": "https://www.data.gouv.fr/datasets/comptes-des-regions-2012-2025/",
            "maj": "2026-07-29", "maj_statut": "etablie",
            "budget": "Budget principal seulement (budgets annexes exclus)",
            "agregats": [["Recettes totales","Ce qu'elle encaisse"], …] },
  "departement": { "terr": { "13": { "ex": { "2025": [ … ] } } }, "exercices": [...], "source": "…" },
  "region":      { "terr": { "76": { … } },                        "exercices": [...], "source": "…" }
}
```

`meta.agregats` porte 6 paires `[libellé officiel, traduction]` : Recettes totales / Dépenses totales / Encours de dette / Dépenses d'investissement / Frais de personnel / Impôts et taxes.

**Forme d'un vecteur `ex[<année>]`** — 13 entiers, relevés et non devinés :

```
[ population,
  recettes_totales, recettes_par_hab,
  depenses_totales, depenses_par_hab,
  encours_dette,    dette_par_hab,
  investissement,   invest_par_hab,
  frais_personnel,  personnel_par_hab,
  impots_taxes,     impots_par_hab ]
```

Un `0` y apparaît quand l'agrégat manque (`"2021": [408, …, 0, 0, 164273, 403]`). **Point de vigilance invariant 5** : ce zéro n'est pas une valeur, c'est une absence. Le lecteur doit le traduire en phrase, pas en barre nulle.

### 6.3 Contrat cible pour `ofgl/<dept>.json` (une fois corrigé)

```json
{ "d": "07",
  "commune": { "07001": { "ex": { "2025": [13 entiers], "2024": [...], "2021": [...] } } } }
```

Mesures projetées, chemin corrigé : min 365 o, **médiane 79 464 o**, max 220 428 o, 101 départements peuplés sur 103.

---

## 7. `pipeline.sh` — où les fichiers atterrissent

### Étape 3 sexies (lignes 82-90) — production

```bash
APP_DEC=$(ls -1 app_repere_v18_*.html | grep -v '\.bak$' | sort -V | tail -1)
python3 outils/decouper.py "$APP_DEC" site_donnees \
  || echo "::warning::le decoupage par departement a echoue"
```

Non bloquant, par choix assumé : « tant que l'application ne consomme pas encore ces fichiers ». La sortie va dans **`site_donnees/`** à la racine du dépôt.

### Étape 5 (ligne 131) — reconstruction

```bash
rm -rf site_engendre
python3 outils/build_pwa_reconstruit.py "$APP" site site_engendre
```

`build_pwa_reconstruit.py` crée lui-même `site_engendre/donnees/` et y écrit `agenda_an.json` puis `evenements.json`.

### Étape 5 bis (lignes 143-148) — publication

```bash
if [ -d site_donnees ]; then
  mkdir -p site_engendre/donnees
  cp -r site_donnees/* site_engendre/donnees/ 2>/dev/null || true
  echo "decoupage publie : $(find site_engendre/donnees -name '*.json' | wc -l) fichiers"
fi
```

**Chemins servis, définitifs :**

```
donnees/manifeste.json
donnees/rne/socle.json      donnees/rne/<dept>.json
donnees/ofgl/socle.json     donnees/ofgl/<dept>.json
donnees/agenda_an.json      donnees/evenements.json
```

C'est-à-dire, relativement à `index.html`, à côté des deux fichiers déjà consommés par l'application.

---

## 8. `build_pwa_reconstruit.py` — injection des adresses et coquille du service worker

### 8.1 `REPERE_AGENDA_URL` (lignes 152-191)

**Ancre de découpe** : `D_AG = "window.REPERE_AGENDA_AN = "`, fin de bloc repérée par `index.index(";\n</script>", i)`.
Gardes : le bloc doit commencer par `{` et faire plus de 100 000 octets.

Le contenu extrait est écrit dans `site_engendre/donnees/agenda_an.json` — **mais** `outils/agenda_an.json` (le fruit de la collecte du matin) le remplace s'il existe et passe 5 assertions : `v == 1`, `len(r) > 5000`, `org` non vide, tous les `e["o"]` dans la table, aucun `acteurRef` (invariant 8, pas de présence nominative).

**Substitution dans le HTML** (ligne 186) — remplacement par tranches, pas par `replace` :

```python
index = index[:i] + 'window.REPERE_AGENDA_URL = "donnees/agenda_an.json"' + index[j:]
```

Deux assertions ferment : `"REPERE_AGENDA_URL" in index` et `'window.REPERE_AGENDA_AN = {"v":1' not in index`. Le nom `REPERE_AGENDA_AN` subsiste dans `anCharger` — c'est documenté et voulu : ce qui doit disparaître est le bloc de données, pas le nom.

### 8.2 `REPERE_EVENEMENTS_URL` (lignes 197-216)

Conditionné à l'existence de `outils/evenements.json` (validé : `v == 1`, `r` liste).

**Ancre exacte** :

```python
ancre_ev = 'window.REPERE_AGENDA_URL = "donnees/agenda_an.json"'
assert index.count(ancre_ev) == 1, "l'adresse de l'agenda est introuvable"
index = index.replace(
    ancre_ev,
    ancre_ev + ';\nwindow.REPERE_EVENEMENTS_URL = "donnees/evenements.json"', 1)
```

L'adresse des événements s'accroche donc à celle de l'agenda, elle-même posée juste avant : **l'ordre des deux blocs n'est pas interchangeable**. Sans agenda embarqué (`if D_AG in index:`), les événements ne sont pas servis non plus.

### 8.3 Ajouts à la coquille du service worker

**Une seule ancre, employée deux fois**, dans `site/sw.js` :

```python
assert '"./accueil.html",' in sw, "la coquille du service worker a change"
```

1. **Événements** (ligne 213), *à l'intérieur* du bloc `if os.path.exists(ev)` :
```python
sw = sw.replace('"./accueil.html",', '"./accueil.html",\n  "./donnees/evenements.json",', 1)
```
2. **Agenda** (ligne 223), après le bloc événements :
```python
sw = sw.replace('"./accueil.html",', '"./accueil.html",\n  "./donnees/agenda_an.json",', 1)
```

Le commentaire ligne 210 justifie l'ordre : « on s'ancre sur `accueil.html` et non sur l'agenda : à cet endroit du script, la ligne de l'agenda n'a pas encore été posée ». Résultat vérifié par simulation sur `site/sw.js` réel — l'agenda finit **avant** les événements, les deux insertions se faisant au même point :

```js
var COQUILLE = [
  "./index.html",
  "./manifest.webmanifest",
  "./confidentialite.html",
  "./accueil.html",
  "./donnees/agenda_an.json",
  "./donnees/evenements.json",
  "./icones/repere-192.png",
  …
```

**Empreinte de cache** (lignes 235-239) : `VERSION = "repere-" + sha256(index + sw_sans_sa_ligne_VERSION)[:12]`. Le `sw.js` amputé de sa propre ligne de version évite la circularité, et l'inclusion du `sw.js` garantit qu'un correctif du service worker seul change quand même le nom du cache.

---

## 9. INCOHÉRENCES ENTRE CE QUE `decouper.py` PRODUIT ET CE QUE `pipeline.sh` CROIT DÉPLOYER

**① `ofgl/<dept>.json` : 103 fichiers vides, publiés comme s'ils portaient quelque chose.** Chemin `OFGL["ech"]["commune"]` au lieu de `OFGL["ech"]["commune"]["terr"]` (§ 6.1). Le pipeline compte 211 fichiers et n'a rien à redire ; 103 d'entre eux pèsent 23 octets. Aucune donnée financière communale n'atteint le site. **C'est le seul défaut bloquant.**

**② Le service worker n'a jamais entendu parler du découpage.** `build_pwa_reconstruit.py` ajoute à la `COQUILLE` exactement deux entrées, `agenda_an.json` et `evenements.json`. Ni `manifeste.json`, ni `rne/*`, ni `ofgl/*`. Or `build_pwa_reconstruit.py` tourne à l'étape 5, **avant** l'étape 5 bis qui copie les fichiers : le générateur ne peut structurellement pas les connaître. Le jour où l'application consommera son département, l'application installée le perdra hors ligne — le manque invisible que le commentaire de la ligne 220 dit précisément vouloir éviter. Une coquille figée est de toute façon le mauvais outil pour 207 fichiers dont un seul intéresse chaque lecteur : il faudra un cache d'exécution (`fetch` → `caches.put`) et non une `addAll` au démarrage.

**③ La sortie de `decouper.py` est copiée par-dessus, jamais nettoyée.** `site_donnees/` n'a ni `rm -rf` en amont (contrairement à `site_engendre`), ni entrée dans `gitignore_maj`, et `decouper.py` n'efface rien. Sur un poste réutilisé, un fichier de département obsolète survit et l'étape 5 bis le publie. Et si `decouper.py` échoue (l'étape est non bloquante), `[ -d site_donnees ]` reste vrai : **le pipeline publie alors le découpage de la veille en annonçant un succès.** Le `2>/dev/null || true` de la copie masque en plus toute erreur d'écriture.

**④ La docstring de `decouper.py` contredit l'appel du pipeline.** Ligne 20 : `python3 outils/decouper.py app_repere_v18_19.html site_engendre/donnees`. Le pipeline appelle avec `site_donnees`. Écrire dans `site_engendre/donnees` comme le suggère la docstring serait détruit huit lignes plus loin par le `rm -rf site_engendre` de l'étape 5. La docstring cite aussi une version périmée de l'application (v18_19).

**⑤ Le script affiche des chiffres qu'il n'a pas le droit d'affirmer.** `ce qu'un lecteur telecharge : 403 Ko` et `rapport : 41 fois moins` sont calculés sur un OFGL communal vide. Chiffres réels une fois ② corrigé : **480 Ko médians, 35×**. La méthode du projet — mesurer plutôt que supposer — est ici retournée contre elle-même : le script mesure sincèrement une sortie fausse.

**⑥ `p` et `n` globaux ne sont dans aucune des trois listes.** `PERDUES = RNE.keys() - (SOCLE ∪ PAR_COMMUNE ∪ PAR_DEPT) = {"p", "n"}`. C'est correct et voulu (elles sont reconstruites localement), mais rien dans le script ne le dit ni ne le garde : ajouter demain une clé à `REPERE_RNE` sans toucher aux trois listes la ferait **disparaître silencieusement** du découpage. Un `assert set(RNE) - couvert == {"p","n"}` coûterait une ligne.

**⑦ Le manifeste ne permet pas d'invalider un cache.** Ni `maj`, ni empreinte, ni numéro de build par fichier — seulement des tailles. Un lecteur qui a mis `rne/07.json` en cache n'a aucun moyen de savoir qu'il a changé. À trancher avant d'écrire le chargeur.

**⑧ Hors périmètre mais adjacent** : `build_pwa_reconstruit.py` recopie tout `site/` sauf les noms suspects (`.bak`, `.old`, `.orig`, `.tmp`, `.v18_`, `.`). `site/maires.mjs` — un script de contrôle — passe le filtre et est publié.

---

## 10. Fichiers relus

- `/home/claude/repere/outils/decouper.py` (187 lignes)
- `/home/claude/repere/outils/pipeline.sh` (157 lignes)
- `/home/claude/repere/outils/build_pwa_reconstruit.py` (344 lignes)
- `/home/claude/repere/site/sw.js` (coquille de référence)
- `/home/claude/repere/app_repere_v18_20.html` (structures `REPERE_RNE` / `REPERE_OFGL` extraites par script, jamais ouvert en lecture intégrale)
- `/home/claude/repere/test_repere.mjs` (contrôle ligne 397)

Sortie de la course de mesure, conservée pour vérification : `/tmp/claude-0/-home-claude/4308483e-90d9-5053-bcb6-33eae98f4b9c/scratchpad/site_donnees/`. Aucun fichier du dépôt n'a été modifié.