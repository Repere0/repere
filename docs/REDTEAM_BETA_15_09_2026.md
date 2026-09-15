# REPÈRE — RED TEAM SUR LA BÊTA, 15 SEPTEMBRE 2026
**Rapport brut d'une mission adversariale.** La synthèse et les arbitrages sont dans
`repere_product_engineering_review.md` ; ici, l'attaque complète.

**Cinq des accusations les plus graves ont été revérifiées à la main avant d'être retenues.**
Quatre sont exactes au caractère près — `QuiDecide.jsx:366` mutile bien 72 maires,
`OuVaArgent.jsx:11` détruit bien un zéro publié, Mulcent (78439) est bien passée de
200 000 € de dette à 0, le cache n'a bien aucune péremption. **Une est rejetée** : la
recommandation d'un collecteur quotidien des élus, la source RNE étant trimestrielle
(publications observées en 2026 : 05/05 puis 11/08). L'arbitrage est rendu au § M du rapport
de synthèse.

---

Note: claude-sonnet-5[1m] (the safety classifier) was unavailable (timed out) when reviewing this subagent's work. Please carefully verify the subagent's actions and output before acting on them.Vérifications faites sur `/home/claude/depot` : code des quatre écrans, `lib/votes.jsx`, `client.js`, `store.js`, `sw.js`, `pipeline.sh`, `projets_etat.py`, `extract-html.js`, les 104 fichiers `data/departments/`, `scrutins.json`, `deputes.json`, les 104 `scrutins/`, `noms-communes.json` (COG), et le build en ligne `app_repere_v18_20.html`.

---

# A. LA DONNÉE PÉRIMÉE

**ATTAQUE : le gel définitif par IndexedDB**

SCÉNARIO : Marc installe Repère le 2 décembre à Bagnolet. Il consulte. Le 20 janvier il rouvre l'application : « Ministère de l'Intérieur · mise à jour du 11 août 2026 », « relevé le 26 août 2026 », les huit mêmes lois du 20-21 juillet. Il conclut que rien n'a été publié depuis. En réalité son appareil n'ira **plus jamais** chercher quoi que ce soit.

POURQUOI C'EST FAUX OU DANGEREUX : `client.js` lit le magasin **avant** le réseau, sans aucune durée de vie :
```js
const enCache = await magasin.lire(cle);
if (enCache) return { etat: ETATS.SERVI, donnees: enCache, depuis: "cache" };
```
`store.js` ne porte ni horodatage, ni version, ni expiration — et son seul effaceur est commenté « Vider est un geste explicite du lecteur, jamais automatique » ; `magasin.vider()` n'est **appelé nulle part** dans le produit (vérifié par recherche sur tout le dépôt). Pendant ce temps `sw.js` fait un *stale-while-revalidate* impeccable sur `/data/` et écrit la version fraîche dans son cache `DONNEES` — **que personne ne relit jamais**, puisque la couche IndexedDB court-circuite avant. Les deux caches se neutralisent : le service worker rafraîchit pour rien, et `netlify.toml` pose `must-revalidate` sur `/data/*` pour rien. La collecte peut repartir le 1ᵉʳ décembre : les dix testeurs ne verront jamais la différence.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : dans `chargerSocle` et `chargerDepartement`, servir le cache **et** lancer la requête réseau ; si la réponse diffère, réécrire le magasin et remonter l'état. Une ligne de plus : refuser le cache au-delà de N jours et retomber sur le réseau.

---

**ATTAQUE : 128 contrôles qui vérifient la forme d'une date, jamais sa valeur**

SCÉNARIO : la chaîne passe au vert le 3 décembre. Elle publierait exactement le même vert avec des relevés de 2019.

POURQUOI C'EST FAUX OU DANGEREUX : tous les contrôles de fraîcheur du dépôt sont des contrôles de **format** :
```js
assert.match(f.source.releve_le, /^\d{4}-\d{2}-\d{2}$/, "la date de releve n'est pas une date");
```
(`invariants.test.mjs` l. 276, 774 ; idem 437, 771, 1053). Le seul contrôle de **valeur** est un `console.warn("::warning::")` dans `extract-html.js` l. 586 — qui part dans le journal d'un build, exactement ce que `PANNE_COLLECTE` identifie comme la faute d'origine. Et pour les projets, le seuil porte sur `mis_a_jour_le` (publication DGCL) et non sur `releve_le` : avec `mis_a_jour_le = 2026-07-24`, le premier avertissement tomberait **en septembre 2027**. En décembre 2026, une collecte de projets morte depuis trois mois ne produit pas même une ligne de journal. Le produit écrit « Un principe sans contrôle est une intention » ; la fraîcheur en a zéro.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : un contrôle statique qui échoue si `releve_le` de `deputes`, `scrutins` ou `projets` dépasse un seuil écrit (7 jours, 7 jours, 45 jours). Le banc dit non, pas un journal.

---

**ATTAQUE : la chaîne verte sur toutes ses sources mortes**

SCÉNARIO : le 10 décembre, la DGCL, l'Assemblée et Etalab ont tous changé quelque chose. GitHub Actions affiche une pastille verte. Le site publie. Personne ne sait rien.

POURQUOI C'EST FAUX OU DANGEREUX : dans `outils/pipeline.sh`, **chaque** collecteur est démoté en avertissement :
```
python3 outils/mono_donnees.py --test && python3 outils/mono_donnees.py . \
  || echo "::warning::les releves du monorepo n'ont pas ete rafraichis"
python3 outils/projets_etat.py --test && python3 outils/projets_etat.py . \
  || echo "::warning::les projets finances par l'Etat n'ont pas ete rafraichis"
python3 outils/noms_communes.py . || echo "::warning::..."
python3 outils/scrutins_an.py ... || echo "::warning::..."
```
`set -euo pipefail` est posé en tête l. 18 et désarmé par chaque `||`. Le commentaire l. 55-59 le justifie explicitement et promet de remettre `set -e` « quand ils seront éprouvés » — ils ne l'ont jamais été, puisque la collecte est rouge depuis dix-neuf jours. Le « verrou de l'automatisation » (l. 203) ne vérifie que le **rendu** du fichier mono-HTML reconstruit : il ne sait pas que les données qu'il affiche sont celles d'hier.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : garder les `||` mais compter les avertissements et **échouer l'étape finale** si l'un des relevés n'a pas été réécrit aujourd'hui. Le pipeline sait déjà écrire `::error::`.

---

**ATTAQUE : le maire ne peut pas être rafraîchi, par construction**

SCÉNARIO : le maire d'Épinay-sous-Sénart démissionne le 4 décembre. Un habitant ouvre Repère le 15 janvier : son nom est encore là, sous l'étiquette « Donnée officielle » et la ligne « Ministère de l'Intérieur · ODbL 1.0 · mise à jour du 11 août 2026 ».

POURQUOI C'EST FAUX OU DANGEREUX : `extract-html.js` l. 173-246 lit les maires, les adjoints, les comptes et les circonscriptions **dans le fichier mono-HTML**, pas au réseau :
```js
const BLOCS = ["REPERE_RNE", "REPERE_OFGL", "REPERE_CIRCOS"];
```
`mono_donnees.py` ne rafraîchit que `deputes.json` et `scrutins.json` (son propre en-tête le dit : « les deux relevés »). Donc **rien dans la chaîne quotidienne ne touche aux maires** : pour corriger un nom, il faut qu'un humain régénère et commite un fichier HTML de 17,3 Mo, que `netlify.toml` sélectionne par `ls … | sort -V | tail -1`. `index.json` déclare `elus.maj = 2026-08-11` — 34 jours au 14/09, et il n'y a aucun mécanisme pour que ce chiffre bouge.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : un collecteur RNE dans `pipeline.sh` écrivant `mono/scripts/elus.json`, sur le modèle exact de `mono_donnees.py`. À défaut : afficher à l'écran « relevé du 11 août 2026 — le Répertoire publie chaque trimestre » plutôt qu'une date seule.

---

**ATTAQUE : « sur la période relevée » couvre six jours**

SCÉNARIO : Nadia déplie « Comment Sylvain Maillard a voté à l'Assemblée ». Elle lit *« Les 8 lois votées »*, *« Les 72 votes de détail »*, et en bas *« sur 8434 publiés à la date du relevé »*. Elle conclut : voilà son bilan de vote.

POURQUOI C'EST FAUX OU DANGEREUX : mesuré sur `scrutins.json`, les 80 scrutins se répartissent ainsi — **17/07 : 58 · 20/07 : 10 · 21/07 : 7 · 16/07 : 5**. Quatre jours de séance, dont un qui porte 72 % du corpus. Les 8 votes solennels sont tous des 20 et 21 juillet, et tous « adopté » : le produit ne montre pas un seul texte rejeté en vote solennel. La phrase « Sur la période relevée » apparaît trois fois à l'écran et **ne nomme jamais la période**. Un lecteur ne peut pas savoir qu'il regarde une fenêtre de six jours sur 8 434 scrutins, et les 17,0 % de « position non portée » (781 sur 4 592, mesurés) prennent alors le sens d'un absentéisme, sur quatre jours où le député pouvait être en commission.

GRAVITÉ : **grave**

CORRECTION MINIMALE : la période, en toutes lettres, dans l'en-tête du dépliant : « Les scrutins du 16 au 21 juillet 2026 — 80 des 8 434 scrutins de la législature. »

---

# B. LE RATTACHEMENT TERRITORIAL

**ATTAQUE : quatre communes d'Île-de-France n'existent pas, et le taux de couverture est 100 %**

SCÉNARIO : une habitante de **Ville-d'Avray** (92, ~11 000 hab.) tape « ville d'avray » sur le premier écran. Elle lit : *« Rien ne correspond à « ville d'avray ». Tapez le début du nom de votre commune. **Hors d'Île-de-France, cherchez d'abord votre département.** »* Le produit vient de lui dire, en Île-de-France, qu'elle n'y est pas.

POURQUOI C'EST FAUX OU DANGEREUX : comparaison du COG embarqué par le produit (`mono/scripts/noms-communes.json`, 34 969 communes, sa propre source déclarée) aux 104 fichiers départementaux (34 637) :

| dép. | COG | produit | écart |
|---|---|---|---|
| 77 | 507 | 505 | −2 |
| 92 | 36 | 35 | −1 |
| 94 | 47 | 46 | −1 |
| **total IDF** | **1 266** | **1 262** | **−4** |

Les quatre nommées : **77021 Barbey, 77253 Lissy, 92077 Ville-d'Avray, 94075 Villecresnes**. Nationalement : **332 communes du COG absentes du produit**. Et `BETA_READINESS.md` annonce « commune reconnue **100,0 %** » sur 1 262 — le taux est calculé sur un dénominateur qui exclut les trous. Toute la colonne de couverture du document est circulaire. Pire : `ChoixCommune` affiche « **35** communes dans ce département » pour le 92 — une affirmation chiffrée, fausse.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : recalculer chaque taux sur le COG et non sur `communes-beta.json`, et faire échouer un contrôle si `data/departments/*.json` ne couvre pas 100 % du COG des huit départements. Les quatre noms sont déjà dans le dépôt.

---

**ATTAQUE : « les transports » attribués à l'intercommunalité — faux pour les 1 262 communes de la bêta**

SCÉNARIO : Karim, à Aulnay-sous-Bois, cherche à qui se plaindre de sa ligne de bus. La carte « Qui d'autre décide pour vous » lui dit : *« Votre intercommunalité — **Les transports**, les déchets, l'eau, et souvent les piscines et les médiathèques. »* Puis, trois lignes plus bas : *« Votre région — les lycées, **les trains du quotidien**… »* Puis : *« Ce qu'ils décident, en revanche, ne dépend d'aucune donnée — **c'est la loi qui le fixe**. »*

POURQUOI C'EST FAUX OU DANGEREUX : `QuiDecide.jsx` code les compétences en dur dans `COMPETENCES`. En Île-de-France, l'autorité organisatrice des transports est **Île-de-France Mobilités**, établissement public régional présidé par la présidente de Région — pas l'EPCI, sur aucune des 1 262 communes. L'eau de la petite couronne relève très majoritairement du **SEDIF** (syndicat mixte), pas de l'EPCI. Le produit attribue donc « les transports » à deux échelons différents **dans la même carte**, et pose la phrase comme du droit, pas comme de la donnée — ce qui interdit au lecteur de s'en méfier. C'est le seul endroit où Repère parle sans source, et c'est celui où il se trompe sur toute sa bêta.

GRAVITÉ : **grave**

CORRECTION MINIMALE : retirer « les transports » de `COMPETENCES.agglo` et écrire, pour les huit départements, « les transports sont organisés à l'échelle de la région par Île-de-France Mobilités ». Zéro donnée nouvelle.

---

**ATTAQUE : l'EPT du Grand Paris, absent du fichier, et c'est lui qui décide**

SCÉNARIO : à Pantin, quelqu'un cherche qui décide de la collecte des poubelles et du PLU. Quand K-6 sera livré, l'écran dira « Votre intercommunalité : **Métropole du Grand Paris** ».

POURQUOI C'EST FAUX OU DANGEREUX : `DATA_EXPLORATION` § 7 le mesure : `insee=93048` renvoie la Métropole, **l'EPT Est Ensemble est absent de BANATIC**. Or les déchets et l'urbanisme sont exercés par l'EPT, et le même document mesure que le PLUi de Pantin est **porté par Est Ensemble** (approuvé le 23/02/2026) tandis que `partition=DU_93055` renvoie vide. Afficher « Métropole du Grand Paris » à ~130 communes est juridiquement exact et opérationnellement trompeur : le lecteur écrira à la mauvaise institution. Et le piège `dept` vs `dep_com` (BANATIC porte `75` sur les communes du 93 parce que la MGP y a son siège) garantit qu'un branchement naïf enverra des Séquano-Dionysiens dans le 75.

GRAVITÉ : **à corriger** (avant K-6, pas après)

CORRECTION MINIMALE : ne pas livrer K-6 en petite couronne sans la phrase « Dans le Grand Paris, un établissement public territorial exerce les déchets et l'urbanisme ; les fichiers nationaux ne le publient pas encore, et Repère ne le nomme donc pas. » C'est ce que D-20 exige.

---

**ATTAQUE : à Paris, la maille départementale EST la commune**

SCÉNARIO : un Parisien ouvre Repère. Le navigateur demande `/data/departments/75.json`, `/data/scrutins/75.json`, `/data/projets/75.json`. Le serveur apprend, exactement, que ce lecteur consulte Paris.

POURQUOI C'EST FAUX OU DANGEREUX : `invariants.js` porte la garde la plus explicite du produit —
```js
const CODE_COMMUNE = /[/=](\d{5}|2[AB]\d{3})(\.json|\/|$|&)/;
```
— parce qu'« une adresse réseau ne doit JAMAIS porter un code de commune : cela révélerait au serveur la commune de son lecteur. La maille est le département. » Mesuré : `data/departments/75.json` contient **1 commune**. Pour 2,1 millions d'habitants — la commune la plus peuplée de la bêta — le code département est une identification parfaite, et la garde ne voit rien parce qu'elle compte des chiffres. Même mécanique, plus faible, pour 975 (2 communes) et 987/988 (32 et 33). L'écran d'accueil promet pourtant : « Repère ne demande jamais votre adresse : le nom de votre commune suffit, et il ne quitte pas cet appareil. »

GRAVITÉ : **à corriger**

CORRECTION MINIMALE : ou bien retirer la promesse absolue au profit de « le serveur apprend votre département, jamais votre commune — sauf à Paris, où les deux se confondent », ou bien regrouper 75 avec un autre paquet. La première tient en une phrase.

---

**ATTAQUE : « Votre département », « Votre région » — faux sur douze territoires publiés**

SCÉNARIO : un habitant d'Ajaccio choisit le département 2A (`index.json` le publie, type « département », 123 communes). Il lit : *« Votre département décide des collèges, des routes départementales, des aides sociales et de la protection de l'enfance »* et *« Votre région décide des lycées… »*, sous la garantie « c'est la loi qui le fixe ».

POURQUOI C'EST FAUX OU DANGEREUX : les conseils départementaux de Corse-du-Sud et de Haute-Corse **ont été supprimés** au 1ᵉʳ janvier 2018 ; c'est la Collectivité de Corse qui exerce les deux blocs. Même faute pour la **Martinique (972)** et la **Guyane (973)** — assemblée unique, ni département ni région — et pour **Mayotte (976)**. `index.json` étiquette 971/972/973/974/976 « département » sans distinction. Pour la **Polynésie française (987)** et la **Nouvelle-Calédonie (988)**, étiquetées « collectivité d'outre-mer », l'écran affiche quand même les trois cartes, et la ligne « Votre député décide des lois qui s'appliquent partout » ignore le principe de spécialité législative. Enfin le **69** est publié avec 262 communes : les 59 communes de la Métropole de Lyon n'ont pas de conseil départemental non plus.

GRAVITÉ : **grave** (hors bêta IDF, mais publié et atteignable)

CORRECTION MINIMALE : une table de six exceptions lue par `COMPETENCES`, ou — moins cher — ne servir que les huit départements de la bêta et dire pourquoi. Le produit publie 104 territoires qu'il n'a pas relus.

---

# C. LE CHANGEMENT D'ÉLU

**ATTAQUE : le patronyme seul est revenu, et il nomme 72 maires de travers**

SCÉNARIO : à Andrésy (78), l'écran « Qui décide » affiche *« Maire — **Jean-Pierre DOS SANTOS** »*, puis juste en dessous : *« 8 adjoints siègent avec **SANTOS**. Ce sont eux qui votent le budget de la commune. »*

POURQUOI C'EST FAUX OU DANGEREUX : `QuiDecide.jsx` fait encore
```js
`${c.adjoints} adjoint${…} siègent avec ${c.maire.nom.split(" ").slice(-1)[0]}.`
```
La correction M-1 a été appliquée à `CeQuiADecide.jsx` (`nomComplet`) et **pas ici**. Mesuré : **72 maires d'Île-de-France sur 1 262 (5,7 %)**, 1 463 sur 34 637 en France, portent un nom de plus de deux mots et sont donc mal nommés. Échantillon réel : *DE MEULENAERE → « MEULENAERE »*, *VAN LANDEGHEM → « LANDEGHEM »*, *LE MÉE → « MÉE »*, *LE PÊCHEUR → « PÊCHEUR »*, *DE PAIX DE COEUR → « COEUR »*, *CARON DE FROMENTEL → « FROMENTEL »*. Et à Paris la ligne devient : *« 36 adjoints siègent avec **GRÉGOIRE** »*, deux cartes au-dessus de *« Olivia Grégoire »* — l'exact défaut que la red team du 14/09 a fait corriger, survivant sur le même écran. Accessoirement, les 1 262 maires s'affichent en CAPITALES (RNE) et les 577 députés en casse normale : deux conventions typographiques pour le même objet, sur le même écran.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : `${c.maire.nom}` en entier. Un contrôle statique qui échoue sur tout `.split(" ").slice(-1)` appliqué à un nom de personne.

---

**ATTAQUE : la présidente de l'Assemblée nationale présentée comme une élue sans position**

SCÉNARIO : un habitant de **Sartrouville** (52 000 hab.) déplie « Comment Yaël Braun-Pivet a voté à l'Assemblée ». Il lit : *« Le relevé des scrutins ne porte aucune position pour Yaël Braun-Pivet. **Un mandat ouvert après la période relevée, un siège pourvu en cours de législature** : c'est la source qui est muette sur cette période. »*

POURQUOI C'EST FAUX OU DANGEREUX : mesuré — sur 577 députés, **3 n'ont aucune ligne de positions** : Chantal Bouloux (22-2), Emmanuelle Hoffman (75-4) et **Yaël Braun-Pivet (78-5)**. Son mandat est ouvert depuis le 2024-07-07, donc bien **avant** la période relevée : les deux explications proposées par l'écran sont fausses toutes les deux, et la vraie — elle préside la séance — est déjà écrite ailleurs dans le même fichier (`LigneVote` : « une présidence de séance »). Les 5 communes concernées sont nommément **78358 Maisons-Laffitte, 78396 Le Mesnil-le-Roi, 78418 Montesson, 78586 Sartrouville, 78650 Le Vésinet** : c'est *exactement* le « 99,6 % » de `BETA_READINESS`. Le trou de couverture du produit est la quatrième personnalité de l'État, et le produit en donne une explication inventée. L'invariant 8 interdit « toute donnée de présence ou d'absence » ; cet écran en produit une, sur une personne identifiée, par défaut de données.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : ne pas énumérer de causes qu'on ne connaît pas. Une phrase : « Le relevé de l'Assemblée ne porte aucune position pour cette personne. Repère n'en déduit rien — un député peut présider la séance, déléguer son vote, ou ne pas être appelé. » Et comparer `dateDebut` à `sc.d` avant d'écrire quoi que ce soit sur une position manquante : les deux champs sont déjà chargés.

---

**ATTAQUE : 18 députés sur un écran, 17 sur l'autre, sans un mot**

SCÉNARIO : un Parisien lit dans « Qui décide » : *« Cette commune élit **18 députés**, un par circonscription. »* Il passe à « Ce qui a été décidé » : *« 8 textes votés à l'Assemblée par vos **17 députés**. »*

POURQUOI C'EST FAUX OU DANGEREUX : `CeQuiADecide.jsx` fait `if (!suite) continue;` — Emmanuelle Hoffman (75-4) est **silencieusement retirée du fil**, et `nbDeputes = new Set(…).size` donne 17. `QuiDecide.jsx` fait `.filter(e => e.d)` sur `deputes.json`, qui la contient : 18. Deux écrans du même produit, la même commune, deux comptes d'élus, aucune phrase. C'est précisément l'absence partielle que l'invariant 5 existe pour interdire, et que le produit a corrigée pour les projets en oubliant les députés.

GRAVITÉ : **grave**

CORRECTION MINIMALE : remplacer le `continue` par une ligne de vide nommée, et dériver `nbDeputes` de `circos.length` et non des positions trouvées.

---

**ATTAQUE : le délai réel d'un nom faux**

SCÉNARIO : élection municipale partielle en février 2027 dans une commune de Seine-et-Marne. Combien de temps Repère affiche-t-il l'ancien maire ?

POURQUOI C'EST FAUX OU DANGEREUX : additionner ce qui est mesuré — le RNE publie **trimestriellement** (`DATA_EXPLORATION` § 6) ; rien dans `pipeline.sh` ne rafraîchit les élus ; le rafraîchissement exige la régénération manuelle d'un HTML de 17,3 Mo ; l'appareil du lecteur ne rechargera de toute façon jamais (finding A-1) ; et le monorepo n'a **ni « signaler une erreur » par carte, ni journal de corrections** — le mono-HTML en a un (« Ce journal est vide parce qu'il n'y a rien à y écrire »), le monorepo n'a qu'une adresse courriel, sur l'onglet que D-04 veut retirer. Il n'existe donc **aucun mécanisme** capable d'apprendre à Repère qu'un nom est faux, ni de le corriger chez qui l'a déjà lu. La réponse à « combien de temps » est : indéfiniment.

GRAVITÉ : **grave**

CORRECTION MINIMALE : un lien « Signaler une erreur sur cette fiche » sous la carte du maire (mailto préremplie avec le code INSEE, zéro serveur), et le journal de corrections repris du mono-HTML. C'est K-15, déjà déclaré obligatoire et pas fait.

---

# D. LA SOURCE QUI MEURT OU QUI CHANGE

**ATTAQUE : deux exercices écrits en dur, et une ressource reconnue par son titre**

SCÉNARIO : la DGCL publie l'exercice 2026 en juillet 2027 et archive celui de 2024. Ou elle titre sa ressource « Projets DETR-DSIL 2024 et 2025 consolidé ».

POURQUOI C'EST FAUX OU DANGEREUX : `projets_etat.py` fixe `EXERCICES = ("2025", "2024")` et apparie par sous-chaîne de titre :
```python
for ex in EXERCICES:
    if ex in titre and r.get("url"):
```
Un titre portant les deux années est capté deux fois ; un exercice retiré du catalogue déclenche `SystemExit("exercice(s) introuvable(s)")`, que `pipeline.sh` avale en `::warning::`, et `extract-html.js` republie le `projets.json` de la veille avec son `releve_le` inchangé. Or l'écran « Ce qui a été décidé » n'affiche **que** `mis_a_jour_le` :
```jsx
<Source producteur={…} maj={sourceProjets.mis_a_jour_le} mention={"exercices " + …} />
```
`releve_le` n'apparaît **que** sur l'onglet « Sources ». Sur l'écran principal, un lecteur voit « mise à jour du 24 juillet 2026 » et rien d'autre : la seule date qu'il lit est celle de l'État, jamais celle de notre passage. Un an de collecte morte est invisible à l'écran.

GRAVITÉ : **grave**

CORRECTION MINIMALE : afficher `releve_le` à côté de `mis_a_jour_le` sur la carte, comme le fait déjà `Sources.jsx` (le composant sait le faire). Et dériver les exercices des ressources trouvées au lieu de les écrire.

---

**ATTAQUE : deux caractères au lieu de trois, et tout s'arrête en silence**

SCÉNARIO : la DGCL aligne `beneficiaire_dep` sur la convention de ses voisins — le Fonds Vert et les DECP écrivent le département sur **2** caractères, la DGCL sur **3** (mesuré, `DATA_EXPLORATION`, conventions 1 et 2).

POURQUOI C'EST FAUX OU DANGEREUX : `retenir()` teste `if dep not in BETA` avec `BETA = {"075","077",…}`. Un passage à « 93 » fait sortir **toutes** les lignes en « hors bêta : ni retenu ni refusé » — donc sans même incrémenter un compteur de refus. `par_commune` est vide, `len(par_commune) < 100` déclenche `::warning::seulement 0 communes servies : le relevé n'est PAS écrasé`, et le produit republie éternellement le relevé précédent avec sa date d'origine. Le même mécanisme existe déjà sous une autre forme dans le corpus : le QPV écrit `insee_com` en `="01053"`, et le document note que « lu brut, tout rapprochement échoue **en silence** ». Le produit a déjà rencontré ce piège deux fois et n'a aucun détecteur.

GRAVITÉ : **grave**

CORRECTION MINIMALE : compter les lignes **lues** et les lignes **hors bêta** séparément, et échouer (pas avertir) si les deux compteurs valent 0 alors que le fichier a des lignes. Trois lignes de Python.

---

**ATTAQUE : « Vérifier ↗ » mène à une page d'accueil**

SCÉNARIO : une élue conteste le chiffre de dette affiché pour sa commune. Elle clique sur « voir à la source ↗ » sous le montant. Elle arrive sur `https://data.ofgl.fr/` — le portail. Elle ne retrouvera pas la ligne.

POURQUOI C'EST FAUX OU DANGEREUX : inventaire complet des adresses sortantes du monorepo (9, vérifié par recherche) : `data.ofgl.fr/`, `www.data.gouv.fr/`, deux pages de jeux data.gouv, deux pages d'information INSEE, deux pages de portail de l'Assemblée. **Une seule** adresse pointe vers la donnée elle-même : le lien de scrutin, construit en `cat.url_scrutin + sc.n`. Pour tout le reste — maire, adjoints, six agrégats de comptes, circonscription, projet financé — « Vérifier » veut dire « voilà le portail, cherchez ». Le produit joue toute sa crédibilité sur P8 et l'invariant 4 ; le journaliste ou l'élu qui l'éprouve trouvera exactement un chiffre vérifiable sur la vingtaine affichée. Et le lien des noms de communes pointe vers une page INSEE (`information/2560452`) alors que la donnée vient du paquet Etalab : la provenance affichée n'est pas celle utilisée.

GRAVITÉ : **à corriger**

CORRECTION MINIMALE : là où la source n'a pas d'URL profonde, cesser d'écrire « voir à la source » et écrire ce qui est vrai : « publié par l'OFGL — le portail ne permet pas de lier une commune directement ». Une promesse tenue de moins vaut mieux qu'une promesse fausse.

---

# E. LE FAUX SENTIMENT DE PRÉCISION

**ATTAQUE : 71 communes sans dette à qui le produit répond « on ne sait pas »**

SCÉNARIO : à **Mulcent** (78, 121 habitants), un habitant ouvre « Où va l'argent ». Ligne « Ce qu'elle doit » : *« **—** · Non renseigné pour l'exercice 2025. Le fichier ne porte pas cette ligne — **ce n'est pas un montant nul.** »* Il conclut que Repère ignore la dette de sa commune.

POURQUOI C'EST FAUX OU DANGEREUX : la donnée réelle est dans le dépôt. Mulcent : `"2021": [112, …, 200000, 1786, …]` → `"2025": [121, …, 0, 0, …]`. **La commune a remboursé 200 000 € et n'a plus aucune dette.** `OuVaArgent.jsx` détruit l'information :
```js
const mm = typeof m === "number" && m !== 0 ? m : null;
```
Un zéro publié devient une absence, puis l'écran **affirme** le contraire de la vérité. Mesuré sur l'Île-de-France : **71 communes** affichent « — » sur la dette, 5 sur les salaires, 2 sur l'investissement. Pour les 71, c'est la meilleure nouvelle possible, et c'est aussi une porte (c) de P16 en parfait état — la commune contre elle-même dans le temps — jetée par une ligne de code. L'invariant 5 exige que les phrases de vide « disent des choses différentes » ; ici une seule phrase couvre deux réalités opposées et énonce la fausse.

GRAVITÉ : **bloquant** (c'est une affirmation fausse, pas une lacune)

CORRECTION MINIMALE : distinguer `0` de `absent` dans `valeur()` et écrire « Aucune dette sur cet exercice » quand la source publie zéro. Le fichier porte déjà les deux cas.

---

**ATTAQUE : cinq chiffres sans aucune référence, sur le meilleur écran du produit**

SCÉNARIO : à **La Chapelle-en-Vexin** (95), la tuile la plus visible de « Ce que ces chiffres veulent dire » affiche : *« Sa dette — **47,8 mois de recettes** »*. Un opposant municipal la capture avant les municipales de 2032. Un habitant, lui, se demande simplement si c'est grave.

POURQUOI C'EST FAUX OU DANGEREUX : P16 est catégorique — « **Un chiffre sans aucune de ces trois références ne s'affiche pas.** » Les cinq tuiles calculées n'en franchissent **aucune** : ni obligation légale, ni seuil réglementaire, ni la commune contre elle-même (elles portent un seul exercice). Mesuré sur l'Île-de-France : 1 186 communes affichent les 5 tuiles, et l'étendue va de **0,0 à 47,8 mois de recettes** (La Chapelle-en-Vexin 47,8 · Lassy 45,5 · Vallangoujard 25,8 · Argenteuil 17,3 · 71 communes à zéro, muettes). Même chose pour « 26 209 769 € par jour » à Paris. L'écran s'exonère avec « Repère ne compare jamais deux communes » — vrai de la *barre*, faux de la *tuile* : un ratio sans référence est une invitation à comparer, et D-17 l'a écrit noir sur blanc pour écarter l'indice de position sociale. La garde de l'invariant 3 cherche les mots « classement », « palmarès », « moyenne nationale » ; elle ne peut pas voir 47,8.

GRAVITÉ : **grave**

CORRECTION MINIMALE : ajouter à chaque tuile la **même valeur pour l'exercice précédent** — les comptes de 2021 et 2024 sont déjà dans le paquet, à zéro octet de plus. « 47,8 mois, contre 51,2 mois en 2024 » franchit la porte (c) et cesse d'appeler la comparaison.

---

**ATTAQUE : « engagé » lu comme « versé », et un taux entre HT et TTC**

SCÉNARIO : à Aubervilliers, quelqu'un lit : *« **Rénovation de la halle du Montfort** — L'État a engagé **533 466 €** · exercice 2025 · Dotation politique de la ville · coût total du projet annoncé : **1 333 667 € hors taxes**. »* Il en déduit : l'État a payé 533 466 €, soit 40 % du chantier, et le chantier est fait.

POURQUOI C'EST FAUX OU DANGEREUX : trois erreurs empilées, toutes tenues par le produit. **(1)** Un engagement DGCL n'est pas un versement : la subvention peut être partiellement soldée, ou le projet abandonné — le mot « engagé » est exact et ne se lit pas ainsi. **(2)** L'euro près : 533 466 € sur un engagement pluriannuel donne une précision de comptable à un chiffre qui bougera. **(3)** Le taux que le lecteur calcule mentalement met un montant d'aide au numérateur et un coût **hors taxes** au dénominateur ; le produit affiche « hors taxes » sans dire que la comparaison est donc biaisée — c'est le cas d'école du taux calculé sur un coût HT. Enfin `finDAnnee(p.annee)` place le projet au **31 décembre** de son exercice : le fait est daté d'un jour qui n'existe pas, et le fil trie dessus.

GRAVITÉ : **à corriger**

CORRECTION MINIMALE : une note sous la famille de faits — « Un engagement de l'État n'est pas une somme versée, et le coût annoncé est hors taxes : les deux montants ne se divisent pas. » Et arrondir le montant de l'État au millier, ou dire pourquoi on ne l'arrondit pas.

---

**ATTAQUE : P15 garantit l'inintelligibilité**

SCÉNARIO : le même écran affiche, mot pour mot : *« Renovation thermique de plusieurs **GS** (Jaures, Gemier, Babeuf et Hugo) et batiments communaux (**CTM**, **CCAS**, **CMA** Cyclisme et batiment administratif) »*, précédé de « Les intitulés sont recopiés tels que l'État les publie, sans correction ».

POURQUOI C'EST FAUX OU DANGEREUX : D-22 et P15 interdisent de réécrire un intitulé officiel — décision juste. Mais le « fait de preuve » du § F de la revue produit est censé être *la* chose qu'un habitant reconnaît physiquement. Ici il reçoit quatre sigles administratifs non développés, sans accents, dans une phrase de 180 caractères. Le produit a un mécanisme pour ça — il développe déjà `DISPOSITIFS` (« DPV » → « Dotation politique de la ville ») — et ne l'applique pas aux sigles de l'intitulé. La règle « ne rien réécrire » a été étendue en « ne rien expliquer », et c'est la différence entre la fidélité et l'illisibilité.

GRAVITÉ : **à corriger**

CORRECTION MINIMALE : garder l'intitulé intact **et** ajouter, en note et sans le toucher, le développement des sigles récurrents (GS = groupe scolaire, CTM = centre technique municipal, CCAS = centre communal d'action sociale). Une table, comme `DISPOSITIFS`.

---

**ATTAQUE : un exercice plus vieux, sans un mot**

SCÉNARIO : à Melz-sur-Seine (77), l'écran dit « Les comptes de la commune · **exercice 2024** », et la source dit « mise à jour du 29 juillet 2026 ». Le voisin de La Tombe voit 2024, celui de Bray-sur-Seine voit 2025.

POURQUOI C'EST FAUX OU DANGEREUX : mesuré — **4 communes IDF** (77289 Melz-sur-Seine, 77310 Montigny-le-Guesdier, 77467 La Tombe, 78562 Saint-Léger-en-Yvelines) portent `"2025": null` et retombent sur 2024. Le repli fonctionne, mais aucune phrase ne le dit : l'invariant 5 est honoré pour une ligne absente et pas pour une **année** absente. Le lecteur attribue le décalage à l'OFGL ou à sa mairie.

GRAVITÉ : **mineur**

CORRECTION MINIMALE : « L'exercice 2025 n'est pas encore publié pour cette commune ; voici le dernier disponible. » Une ligne, le fichier porte déjà l'information.

---

# F. « LIER PLUTÔT QU'INGÉRER »

**ATTAQUE : ce n'est pas un lien, c'est un rédacteur**

SCÉNARIO : la revue de site recommande de reprendre l'idée du site en ligne : *« Conseil municipal : 29 décisions votées — vous pouvez lire chaque décision en entier sur fontainebleau.fr »*. Livrée telle quelle, cette carte dit à un habitant de Melun que Repère suit son conseil municipal.

POURQUOI C'EST FAUX OU DANGEREUX : j'ai ouvert le bloc de données du site en ligne. Le « Fil » contient **11 événements**, chacun avec des champs `"verifie": true`, `"verifie_le": "2026-07-22"`, `"ingere_le": "2026-07-23T08:32:19+00:00"` — c'est un fichier **écrit à la main**. La carte Fontainebleau est l'une des trois seules attachées à une commune (`commune_insee: "77186"`). Donc :
- la fraîcheur affichée par le produit public — « Décision la plus récente : 29 juin 2026 » — est **la date à laquelle un humain a lu un PDF**, présentée comme la récence du produit ;
- « 29 délibérations adoptées » est un **comptage de Repère**, non publié, non vérifiable, et non annoncé comme un calcul (P9 le serait pourtant) ;
- **5 des 11 sources portent `"type": "presse_relais"`** (mesuré : `mesinfos.fr`, « Le Moniteur de Seine-et-Marne »). Repère republie donc le résumé d'un journaliste dans le gabarit d'une décision officielle — alors que sa propre charte des refus promet « pendant une campagne : aucune donnée qui ne soit officielle ». Présidentielle : avril 2027.
- ça ne monte pas à 1 262 communes. Douze cartes en trois mois, c'est 0,9 % de couverture au rythme constaté, et chaque carte est un acte éditorial engageant.

GRAVITÉ : **grave** (si repris), **bloquant** si repris tel quel pendant la campagne

CORRECTION MINIMALE : ne pas reprendre le comptage. La seule version tenable est celle qui n'affirme rien : *« Les délibérations de votre conseil municipal sont publiées sur le site de la commune. »* + le lien. Zéro date, zéro nombre, zéro verbe au passé composé.

---

**ATTAQUE : l'URL profonde qui meurt, et la page qui a l'air vivante**

SCÉNARIO : le lien posé est `https://www.fontainebleau.fr/mairie/publication-des-actes-administratifs/deliberations-**828**.html`. En mars, la commune refait son site. Un habitant clique, obtient un 404 — ou pire, une page « Délibérations » qui s'arrête à 2024.

POURQUOI C'EST FAUX OU DANGEREUX : `-828.html` est un identifiant de CMS : il ne survit pas à une refonte. Et le produit n'a aucun moyen de le savoir — il ne mesure rien, il n'a ni vérificateur de liens, ni retour utilisateur par carte. Trois issues, toutes mauvaises pour le lecteur : le 404 (Repère a l'air cassé), la page non tenue à jour (Repère a l'air de mentir sur la date), l'absence de site (le produit doit dire quoi ?). Aucune n'est distinguable des autres **par Repère**. Et une commune qui n'a pas de site : les petites communes publient par affichage en mairie, ce que la loi autorise — le produit n'a alors rien à lier, et sa promesse tombe précisément là où il est déjà le plus faible (les petites communes de Seine-et-Marne et des Yvelines, celles où le plan de test veut recruter six testeurs sur dix).

GRAVITÉ : **grave**

CORRECTION MINIMALE : ne lier que la **racine** du site officiel de la commune (`fontainebleau.fr`), jamais une page interne — une racine survit à une refonte. Et un contrôle hebdomadaire de code HTTP sur les 1 262 racines, dans la chaîne, qui retire le lien mort au lieu de le servir.

---

**ATTAQUE : la responsabilité de ce qu'on pointe**

SCÉNARIO : Repère écrit « lire les délibérations sur X.fr ». La page contient une délibération annulée depuis par le tribunal administratif, ou un PDF portant les noms et adresses des pétitionnaires d'un permis.

POURQUOI C'EST FAUX OU DANGEREUX : Repère n'est pas responsable du contenu d'un lien qu'il pose — mais il l'est de **l'affirmation qui l'accompagne**. Dès qu'il écrit « votre conseil municipal a voté le \<date\> », il énonce un fait qu'il n'a pas vérifié, et son propre bloc juridique reconnaît : « C'est un traitement de données, et **l'éditeur en est responsable**. » Or dans le monorepo, aucune mention légale n'existe : `Sources.jsx` ne porte qu'une adresse courriel ; et sur le site public, le bloc légal dit lui-même « L'identité complète de l'éditeur, son statut juridique et son numéro d'immatriculation **seront publiés ici** ». Un produit qui affirme des faits datés sur des institutions nommées, sans éditeur identifié et sans droit de réponse outillé, n'a pas de porte de sortie quand il se trompe. M-3 est ouverte depuis des semaines.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : mentions légales + « signaler une erreur » dans le monorepo avant le premier testeur (K-15, coût 1). Et ne poser un lien qu'avec un verbe neutre : « publiées sur », jamais « a voté le ».

---

# G. LA GÉOLOCALISATION

**ATTAQUE contre (B) : la garde interdit 5 chiffres, la production en envoie quatorze**

SCÉNARIO : Sofia appuie sur « Utiliser ma position ». Elle lit l'annonce honnête : *« Vos coordonnées sont envoyées au service public geo.api.gouv.fr, le temps de trouver la commune. Rien n'est conservé, ni ici ni par Repère. »* Elle accepte.

POURQUOI C'EST FAUX OU DANGEREUX : le code en ligne fait
```js
navigator.geolocation.getCurrentPosition(pos => {
  const lat = pos.coords.latitude, lon = pos.coords.longitude;
  fetchWithTimeout("https://geo.api.gouv.fr/communes?lat=" + lat + "&lon=" + lon + "&fields=nom,code", 3500)
```
— la latitude et la longitude **brutes**, en toutes leurs décimales, concaténées dans une **chaîne de requête GET**. Une chaîne de requête entre dans les journaux d'accès du serveur destinataire. Repère promet « rien n'est conservé **ni ici ni par Repère** » : il ne peut pas promettre pour la DINUM, et une URL GET est le pire endroit pour une coordonnée. Trois points précis :
1. **Contradiction doctrinale mesurable.** `invariants.js` interdit qu'une adresse porte un code de commune à 5 chiffres, « cela révélerait au serveur la commune de son lecteur ». La version en production envoie une position qui désigne un **bâtiment**. Le produit interdit l'approximation et livre l'exactitude.
2. **Le monorepo ne peut pas l'accueillir en l'état** : deux contrôles statiques vérifient que « le site publié ne charge aucune ressource d'un autre hôte » (nommés dans `PANNE_COLLECTE`). Brancher (B) casse l'invariant 2 ou l'oblige à être réécrit.
3. **RGPD** : une position précise est une donnée à caractère personnel ; le consentement du navigateur n'est pas une base juridique documentée, et la finalité (« trouver la commune ») ne nécessite pas cette précision. L'appel n'a pas de `maximumAge`, donc la position renvoyée peut être une position **en cache** correspondant à un autre lieu que celui où se trouve la personne — et le produit l'attribuera comme « votre commune » sans le dire.

GRAVITÉ : **grave**

CORRECTION MINIMALE : si (B) est retenue, arrondir à 2 décimales avant l'envoi (≈1 km — suffisant pour une commune, insuffisant pour un domicile), le dire à l'écran (« arrondie au kilomètre »), et poser `maximumAge: 0`. Et reformuler la promesse : « envoyées au service public de l'État » — sans promettre à sa place.

---

**ATTAQUE contre (A) : le coût de taper, mesuré**

SCÉNARIO : sans géolocalisation, une habitante de **Ville-d'Avray** tape le nom de sa commune. Elle n'existe pas dans l'index. Une habitante d'**Évry-Courcouronnes** tape « Evry ». Une personne âgée à **Chennevières-sur-Marne** tape « chenev ».

POURQUOI C'EST FAUX OU DANGEREUX : le coût de (A) n'est pas théorique, il est déjà payé et mesurable dans le dépôt.
- **Quatre communes de la bêta ne peuvent pas être tapées du tout** (finding B-1) : pour elles, (A) n'a pas de coût, elle a un mur. La géolocalisation les aurait au moins amenées au bon département.
- **Le champ propose encore « Tapez les premières lettres — Ustaritz, Bayonne… »** dans `ChoixCommune`, deux communes du Pays basque dans une bêta francilienne. La revue l'a signalé ; c'est encore là.
- La règle de recherche est bonne (`mots()` + `correspond()` + le rang de D-07, mesurés) : accents, apostrophes et traits d'union sont absorbés. Le vrai coût résiduel est ailleurs — **les 4 homonymes** (Blandy 77/91, Marolles-en-Brie 77/94, Mondreville 77/78, Saint-Martin-des-Champs 77/78) : sur le premier écran le département est affiché à côté du nom, donc c'est désarmé ; mais un lecteur qui se trompe obtient un écran **entièrement plausible** — un maire, des comptes, un député — sans aucun signal d'erreur autre qu'une ligne grise.

GRAVITÉ : **à corriger**

CORRECTION MINIMALE : (A) est défendable — mais alors : boucher les 4 trous, remplacer « Ustaritz, Bayonne » par trois communes franciliennes, et, sur les 4 homonymes, faire porter au bouton le nom **et** le département dans la même cible, en gras.

---

# H. L'INSTRUMENTALISATION

**ATTAQUE : la capture la plus dangereuse que ce produit puisse produire aujourd'hui**

SCÉNARIO : un compte militant publie une capture d'écran de Repère, sur Sartrouville :

> **Comment Yaël Braun-Pivet a voté**
> Le relevé des scrutins ne porte aucune position pour Yaël Braun-Pivet.
> *Un mandat ouvert après la période relevée, un siège pourvu en cours de législature.*

Légende : « Repère, données officielles : zéro position sur 80 scrutins pour la présidente de l'Assemblée. »

POURQUOI C'EST FAUX OU DANGEREUX : la capture est authentique, non retouchée, et produite par le produit. Elle nomme une personne identifiée, la quatrième de l'ordre protocolaire, sur un manque de données ; elle porte l'autorité de « Assemblée nationale · Licence Ouverte 2.0 · relevé le 26 août 2026 » ; et les deux explications qu'elle contient sont **fausses** (mandat ouvert le 07/07/2024, avant la période). Repère ne peut pas se défendre en disant « nous n'affirmions rien » : il a affirmé deux causes inventées. C'est l'exacte configuration de l'invariant 8 — « jamais de donnée de présence ou d'absence » — enfreinte non par une intention mais par une phrase de vide mal écrite. Et à l'échelle : **68,3 % des députés (392 sur 574)** portent au moins une position solennelle non portée, **43 en portent 4 sur 8 ou plus** ; chacun est un candidat à la même capture, sur quatre jours de séance que l'écran ne nomme pas.

GRAVITÉ : **bloquant**

CORRECTION MINIMALE : la même que C-2 — supprimer l'énumération de causes, et nommer la période relevée dans l'en-tête. Deux phrases réécrites désarment la capture.

---

**ATTAQUE : l'écran de Paris comme affiche**

SCÉNARIO : quelqu'un ouvre « Ce qui a été décidé » sur Paris et fait défiler. Simulé sur les données réelles du dépôt : **137 lignes de faits**, **35 en-têtes « À l'Assemblée nationale, X a voté »**, les **8 mêmes textes répétés 17 fois**, chaque député apparaissant **deux fois** (une par journée de scrutin) parce que le tri est par date et non par personne. Il recadre les 17 lignes portant sur *« le projet de loi relatif à la protection des enfants »* et publie : « Les députés de Paris et la protection des enfants ».

POURQUOI C'EST FAUX OU DANGEREUX : `faits.sort((a,b) => a.quand < b.quand ? 1 : …)` n'ordonne que par date, donc entrelace les 17 députés par journée ; la condition d'en-tête `prec.ref !== f.ref` se déclenche à chaque ligne. Le résultat est un tableau de 17 noms × 8 textes sous un titre communal, à côté d'un montant reçu de l'État — et c'est précisément M-5, que la correction de la colonne de verdicts n'a pas résolue : détruire la colonne a changé la *forme* du verdict, pas le fait qu'il y en ait 137 alignés. Le décompte officiel est bien affiché sous chaque ligne (378 pour, 7 contre, 173 abstentions), mais en note grise ; la position est une phrase pleine en corps de texte. Et les 118 communes concernées en France sont les plus peuplées — Paris 18 circonscriptions, puis 13 communes franciliennes à 2.

GRAVITÉ : **grave**

CORRECTION MINIMALE : c'est la recommandation L de la revue, et elle est juste : sortir les votes du fil communal. À défaut immédiat : plafonner à **un député par fil** pour les communes à cheval et renvoyer le reste vers « Qui décide », qui les cadre déjà mieux.

---

**ATTAQUE : faire porter notre retard au ministère**

SCÉNARIO : mars 2027, campagne présidentielle. Un élu sortant capture la fiche de sa commune : le nom du maire, l'étiquette « **Donnée officielle** », et la ligne « Ministère de l'Intérieur · ODbL 1.0 · **mise à jour du 11 août 2026** ». Il affirme : « L'État n'a rien publié sur nous depuis huit mois. »

POURQUOI C'EST FAUX OU DANGEREUX : c'est l'exacte faute que `PANNE_COLLECTE` annonce en conclusion — « faire porter à l'État un retard qui est le nôtre » — et elle est structurelle, pas accidentelle : la ligne `Source` n'affiche **que** `maj`, la date du producteur. Rien à l'écran ne distingue « le ministère n'a rien publié » de « Repère n'est pas allé voir ». Et pour les élus, c'est pire que pour l'État : la carte porte l'étiquette « Donnée officielle » au-dessus d'un nom qui peut être faux depuis des mois, sans aucun canal pour le corriger (C-4).

GRAVITÉ : **grave**

CORRECTION MINIMALE : deux dates sur chaque ligne de source, comme `Sources.jsx` sait déjà le faire : « publié par l'État le 11 août 2026 · relevé par Repère le 14 septembre 2026 ». Et au-delà d'un seuil, la phrase que la panne réclame : « Ce relevé devrait être rafraîchi chaque jour ; il ne l'est plus. »

---

# I. LA BÊTA ELLE-MÊME

**ATTAQUE : la première question du banc échoue par ordre des gestes**

SCÉNARIO : question 1 du protocole — *« Installe Repère sur ton téléphone, puis ouvre-le en mode avion. Que vois-tu ? »* Le testeur installe, met en mode avion, ouvre, tape « Bagnolet ». Il obtient : *« Vous êtes hors ligne, et ce département n'a jamais été téléchargé sur cet appareil. »*

POURQUOI C'EST FAUX OU DANGEREUX : `sw.js` précharge à l'installation `A_PRECHARGER = ["/", "/index.html", "/manifest.webmanifest", "/data/index.json"]` plus les fichiers empreintés du build. **Aucun paquet départemental, aucun `communes-beta.json`, aucun `deputes.json`.** L'invariant 1 est donc vrai — « l'application fonctionne hors ligne » — mais seulement pour un lecteur qui a déjà consulté sa commune **en ligne**. Le protocole ne le dit pas, et `Repere_Banc_Decembre_2026` désigne cette question comme celle qui teste « le seul défaut qui compte ». Sur dix testeurs, ceux qui suivent l'instruction à la lettre échoueront tous, et le journal du banc conclura que le hors-ligne ne marche pas.

GRAVITÉ : **grave**

CORRECTION MINIMALE : réécrire la question — « ouvre-le, cherche ta commune, **puis** passe en mode avion et reviens » — et précharger `communes-beta.json` à l'installation (11 Ko).

---

**ATTAQUE : iOS efface le stockage, et la moitié du banc est sur iPhone**

SCÉNARIO : Léa installe Repère le 3 décembre sur son iPhone, consulte, puis ne l'ouvre plus. Le 14 décembre elle le rouvre dans le métro, sans réseau. Écran vide.

POURQUOI C'EST FAUX OU DANGEREUX : Safari plafonne le stockage inscriptible par script (IndexedDB, Cache Storage) à **sept jours sans interaction** pour les contenus web. Or tout le hors-ligne de Repère repose exactement là : `store.js` (IndexedDB) et `sw.js` (Cache Storage). `Repere_Banc_Decembre_2026` écrit que « la moitié d'un banc de dix personnes est sur iPhone » et que les métas iOS ont été ajoutées — mais `BETA_READINESS` § 4 marque **« installation testée sur un vrai iPhone : ❌ non mesuré »** et **Android aussi**. La promesse « installable Android et iOS ✅ » du ROADMAP repose sur la présence de balises `<meta>`, pas sur une mesure. Le seul invariant qui différencie le produit n'a jamais été éprouvé sur la plateforme de la moitié des testeurs.

GRAVITÉ : **grave**

CORRECTION MINIMALE : un iPhone, une installation, sept jours d'attente, une ouverture en mode avion — avant décembre. Et dans tous les cas, `sw.js` doit répondre autre chose qu'un 503 JSON quand son cache a été vidé : `PHRASES[HORS_LIGNE]` existe, il faut que le client l'obtienne.

---

**ATTAQUE : le seul instrument de mesure du banc est derrière l'onglet qu'on veut supprimer**

SCÉNARIO : question 3 — *« Y a-t-il un chiffre que tu ne crois pas ? »* Le testeur dit oui, oralement. Chez lui, une semaine plus tard, il en trouve un autre. Il n'a aucun moyen de le dire.

POURQUOI C'EST FAUX OU DANGEREUX : l'unique canal de retour du monorepo est un `mailto:repere0@protonmail.com` dans `Sources.jsx` — l'écran que **D-04 a décidé de retirer de la barre** et que la revue produit recommande de sortir des onglets. Il n'y a **aucun** « signaler une erreur » sous une carte, alors que le mono-HTML en a un (« Vous pouvez signaler une erreur sous chaque carte »). Le document du banc dit pourtant : « pour un banc, ce n'est pas une politesse : c'est le seul instrument de mesure. » Appliquer D-04 avant décembre, c'est enterrer l'instrument ; ne pas l'appliquer, c'est garder un onglet de doctrine sur 25 % de la barre pendant le banc.

GRAVITÉ : **à corriger**

CORRECTION MINIMALE : un lien « Signaler une erreur » au pied de chaque `Carte`, en `mailto:` préremplie avec le nom de la commune et l'écran. Aucun serveur, aucun traceur, et D-04 devient applicable.

---

**ATTAQUE : la phrase de refus est en fautes d'orthographe**

SCÉNARIO : au moment le plus délicat — deux relevés désalignés, ce que la panne rend probable — le testeur lit :

> *« Les votes ne sont pas **affiches** : les deux relevés de l'**Assemblee** ne se correspondent pas. Le catalogue des scrutins et les positions des **deputes** ont **ete** **releves** a des dates **differentes**. **Plutot** que d'afficher une position qui pourrait **etre** celle d'un autre scrutin, **Repere** n'affiche rien. »*

POURQUOI C'EST FAUX OU DANGEREUX : `REFUS_APPARIEMENT` dans `lib/votes.jsx` est écrit **sans accents**. `MOTS_A_ACCENTS` contient explicitement `"Repere"`, `"deputes"` et `"donnees"` — la garde existe et ne voit rien, parce que les deux contrôles qui l'utilisent ne lisent que `data/index.json` (libellés de source) et `data/departments/*.json` (noms de communes) : **aucun ne lit les chaînes des .jsx**. Le produit se félicite dans le même fichier d'un contrôle posé après « une faute commise deux fois le 25 août 2026 » ; la faute est revenue dans le texte que le lecteur voit quand le produit lui demande de lui faire confiance.

GRAVITÉ : **à corriger** (5 minutes, et c'est le moment où la crédibilité est la plus fragile)

CORRECTION MINIMALE : accentuer les deux phrases, et étendre le contrôle d'accents aux littéraux de chaîne de `apps/web/src/**` et `packages/ui/src/**`.

---

**ATTAQUE : D-02 est enfreinte sur les quatre écrans et dans la vignette de partage**

SCÉNARIO : chaque écran du produit, sous le mot « Repère », affiche en H1 : *« Qui décide chez vous, et **où va votre argent**. »* Un testeur demande ce que Repère sait de ses impôts.

POURQUOI C'EST FAUX OU DANGEREUX : D-02 est explicite — « **« Où va l'argent », jamais « Mon argent »** : le possessif promet un compte personnel que la donnée ne tient pas ». L'onglet respecte la décision ; le H1, le `<title>`, la `<meta name="description">` et l'`og:description` de `apps/web/index.html` la contredisent tous les quatre. Et l'`og:description` est ce que tout lien partagé affichera. Le produit a tranché la question, l'a écrite, et l'a laissée fausse à l'endroit le plus visible et le plus partageable.

GRAVITÉ : **à corriger**

CORRECTION MINIMALE : « Qui décide chez vous, et où va l'argent de votre commune. » Trois fichiers, un contrôle statique qui échoue sur « votre argent ».

---

# LES TROIS CHOSES QUI DOIVENT ÊTRE VRAIES AVANT QU'UN HABITANT VOIE CE PRODUIT

**1. Le produit doit pouvoir se rafraîchir, et savoir dire qu'il ne l'a pas fait.**
Aujourd'hui trois verrous indépendants l'en empêchent : IndexedDB sans durée de vie annule le service worker (A-1) ; les maires, les comptes et les circonscriptions ne sont rafraîchissables que par la recompilation manuelle d'un HTML de 17,3 Mo (A-4) ; et 128 contrôles vérifient le *format* d'une date de relevé sans jamais en vérifier la *valeur*, pendant que chaque collecteur échoue en `::warning::` (A-2, A-3). Tant que ces trois-là tiennent, la bêta de décembre est un instantané du 26 août distribué sur dix téléphones pour toujours, et les avertissements de fraîcheur continueront de partir dans un journal que personne ne lit.

**2. Aucune phrase du produit ne doit expliquer une absence par une cause qu'il ne connaît pas.**
C'est la faute qui reste après les quatre corrections déjà faites, et c'est la plus dangereuse, parce qu'elle nomme des personnes. La présidente de l'Assemblée nationale est présentée à cinq communes comme une élue dont « un siège a été pourvu en cours de législature » (C-2, H-1) ; 71 communes sans dette lisent « ce n'est pas un montant nul » (E-1) ; 11 communes nouvelles lisent que « la source ne porte aucune position pour leur député » alors qu'elles n'ont pas de circonscription dans le fichier. Trois phrases à réécrire en supprimant les causes inventées. La doctrine du vide est le meilleur outil du produit et elle est armée contre lui : une phrase précise et fausse fait plus de dégâts qu'un vide.

**3. La couverture doit être mesurée contre le droit, pas contre son propre fichier — et un éditeur doit exister.**
1 266 communes existent dans les huit départements ; le produit en sert 1 262 et annonce « 100,0 % ». **Barbey, Lissy, Ville-d'Avray, Villecresnes** — ~21 000 habitants à qui le produit répond « Rien ne correspond », en leur suggérant de chercher hors d'Île-de-France (B-1). 332 communes sont dans le même cas en France. Et 72 maires franciliens sont nommés par un fragment de leur nom (C-1). Tout cela sera vu par dix testeurs sur leurs propres téléphones, sans mentions légales, sans éditeur identifié et sans « signaler une erreur » (F-3, I-3).

---

# LA CHOSE QUE LE PRODUIT DEVRAIT CESSER DE PROMETTRE

**Cesser de promettre que ce qui est affiché est à jour.**

Repère a construit toute sa crédibilité sur une promesse de fraîcheur : un onglet au passé composé pour dire « du vérifiable plutôt que du frais » (D-03), une collecte quotidienne, un objectif de « fraîcheur ≤ 7 jours » dans ses métriques, et une décision (D-12) qui autorise à publier de la donnée de trois semaines **« tant que leur date est affichée »**. Cette dernière clause est l'erreur : elle fait porter au lecteur un calcul qu'il ne fera jamais. `PANNE_COLLECTE` l'a écrit exactement — « personne ne soustrait deux dates de tête » — et le produit n'en a rien tiré : la ligne de source affiche toujours la seule date du producteur, jamais la nôtre, jamais l'écart.

Or la revue produit a déjà mesuré que la fraîcheur n'est pas ce que cette donnée peut offrir : « en décembre elle affichera l'écran de septembre », 8 lois du 20-21 juillet, des exercices 2024-2025, et — je l'ajoute — un corpus de scrutins qui couvre **quatre jours de séance**. Le RNE publie par trimestre, l'OFGL par an, la DGCL par an. La donnée publique locale ne bouge pas à la semaine, et aucune ingénierie ne changera cela.

Il faut donc assumer ce que la revue recommande déjà — **l'ouvrage de référence** — et en tirer la conséquence que la revue n'a pas tirée : **arrêter d'afficher des dates et commencer à afficher des écarts.** Non pas « relevé le 26 août 2026 », mais « relevé le 26 août 2026 — il y a 19 jours, alors qu'il devrait l'être chaque jour ». Non pas « mise à jour du 11 août 2026 », mais « publié par l'État le 11 août, relevé par Repère le 14 septembre ». Une date est une information ; un écart est un aveu. Seul l'aveu tient la promesse « données officielles », et seul l'aveu empêche que le retard de Repère soit lu comme le silence de l'État.agentId: a83f725eb317527e6 (use SendMessage with to: 'a83f725eb317527e6', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 275415
tool_uses: 79
duration_ms: 1468568</usage>