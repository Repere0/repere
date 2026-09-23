# Repère — audit de migration ancien site → `mono/`

*Écrit le 22 septembre 2026. Chaque ligne vient d'une lecture de code réelle
(`app_repere_v18_20.html`, `mono/apps/web/src/`) ou d'une mesure (build,
tests, tailles de fichiers). Aucune ligne ne conclut "mono/ est meilleur"
sans dire aussi ce qu'il ne fait pas encore — la parité fonctionnelle est
vérifiée avant tout jugement de qualité, comme demandé.*

---

## 1. Architecture de `mono/`, telle qu'elle est aujourd'hui

| élément | réalité mesurée |
|---|---|
| point d'entrée | `apps/web/src/main.jsx` → `App.jsx`, Preact via alias (`vite.config.js`), pas de framework de routage — un seul composant, état local |
| extraction | `scripts/extract-html.js` lit les blocs `window.REPERE_*` du mono-HTML par expression régulière (pas de DOM/jsdom), découpe par département, fusionne les noms de territoires et les députés depuis 2 fichiers versionnés (`noms-territoires.json`, `deputes.json`) |
| socle de rendu | Preact/compat, alias sur React — **20,52 Ko / 8,18 Ko gzip** mesuré à l'instant (`vite build`, 22/09/2026) |
| bundle applicatif principal | `index-CvNyhUzJ.js`, **29,11 Ko / 10,32 Ko gzip** |
| écrans chargés à la demande | 6 modules séparés (`lazy()`), 0,45 à 12,21 Ko chacun — voir §3 |
| build | `vite build` : **339 ms** (mesuré maintenant), + copie de `data/` (216 fichiers) + empreinte du service worker ≈ 1,5 s au total |
| tests | **100 contrôles statiques + 56 contrôles navigateur, tous verts** — ré-exécutés à l'instant (`pnpm test`, 22/09/2026), pas repris d'une mesure antérieure |
| compatibilité avec le pipeline actuel | **aucune** : `outils/pipeline.sh` sur `main` appelle toujours `build_pwa_reconstruit.py`, jamais `mono/` (confirmé dans `PRODUCTION_RUNBOOK.md`) |
| collecte | `mono/` ne collecte rien lui-même : il lit le mono-HTML déjà produit par la chaîne existante (`outils/collecte.py` + `pipeline.sh`), plus deux fichiers versionnés à la main (`deputes.json`, `noms-territoires.json`, `calendrier-senat.json` via `scripts/calendrier-senat.mjs`) |

## 2. Ce que le lecteur voit dans `mono/`, exactement (6 onglets)

| onglet | fichier | ce qu'il affiche réellement | donnée consommée |
|---|---|---|---|
| Où j'habite (avant les onglets) | `App.jsx` (`Entree`/`ChoixDepartement`/`ChoixCommune`) | recherche unifiée commune/département, 104 territoires repliés, doctrine du vide pour les communes absentes du RNE | `index.json`, `communes-beta.json` |
| Qui décide | `QuiDecide.jsx` | maire + nombre d'adjoints (commune), circonscription(s), député(s) élu(s) avec vote solennel dépliable ; **dit explicitement** qu'agglo/département/région ne sont pas encore publiés | `paquet.communes[commune]`, `data/deputes.json`, `data/scrutins.json`, `data/scrutins/{dep}.json` |
| Ce qui a été décidé | `CeQuiADecide.jsx` | fil daté : projets DGCL financés + votes solennels du/des député(s), fusionnés par date, doctrine du vide à 4 branches (aucun/projets seuls/votes seuls/ni l'un ni l'autre) | `data/projets/{dep}.json`, `data/deputes.json`, `data/scrutins*.json` |
| Où va l'argent | `OuVaArgent.jsx` | 6 montants OFGL de la **commune seule** + 5 ratios traduits (dette en mois de recettes, etc.), doctrine zéro/absence | `paquet.communes[commune].comptes`, `index.json.agregats` |
| Ce qui se passe (Calendrier) | `Calendrier.jsx` | agenda du **Sénat uniquement**, licence non confirmée affichée honnêtement | `data/calendrier-senat.json` |
| Sources | `Sources.jsx` | liste des producteurs/licences par jeu de données + les 8 invariants + contact | `index.json.sources`, `packages/data-utils/invariants.js` |
| Aujourd'hui (prototype, lien secondaire) | `Aujourdhui.jsx` | même contenu que "Ce qui a été décidé" + "Où va l'argent", condensé en format question/réponse | mêmes chargeurs, via `lib/useAujourdhui.js` |

## 3. Poids réel par écran (mesuré, pas estimé)

| chunk | brut | gzip |
|---|---:|---:|
| socle (Preact) | 20 516 o | 8 178 o |
| App principal | 29 390 o | 10 323 o |
| CSS | 13 899 o | 3 644 o |
| Sources | 3 159 o | 1 285 o |
| Calendrier | 2 673 o | 1 319 o |
| Où va l'argent | 3 392 o | 1 495 o |
| Aujourd'hui | 3 911 o | 1 879 o |
| Ce qui a été décidé | 7 105 o | 2 676 o |
| Qui décide | 12 413 o | 4 121 o |

## 4. La matrice de parité — fonctions minimales, statut vérifié

*Mise à jour le 22 septembre 2026, phase 3 de la mission (« parité de
production avant bascule »). PASS = repris, accessible, fonctionne avec les
données attendues, conserve sa provenance, testé (règle de parité, §7 de la
mission). PARTIAL = repris mais couverture réduite, précisée. MISSING /
BLOCKED = pas repris ou empêché, avec la raison réelle. NOT_TESTED = présent
mais jamais vérifié. NON APPLICABLE = ne s'applique pas à l'architecture
cible. Aucune case n'est mise à PASS sans preuve — chacune cite un fichier ou
un test réel, exécuté aujourd'hui sauf mention contraire.*

| Fonction | Ancien | Mono | Statut | Régression ? | Source | Test | Action |
|---|---|---|---|---|---|---|---|
| Recherche commune | `s-qui`/plusieurs écrans, pas de champ unifié avant le 13/09 | `Entree` (`App.jsx`), un seul champ, commune OU département | **PASS** | Non — amélioration | RNE + Code officiel géographique | `runtime.test.mjs`, Ville-d'Avray | aucune |
| Identification commune | implicite | doctrine du vide propre (`paquet.manquantes`) | **PASS** | Non | idem | idem | aucune |
| Maire | `s-qui`, `s-elus` (doublon) | `QuiDecide.jsx` — `paquet.communes[c].maire` | **PASS** | Non — `s-elus` était un doublon, pas une fonction perdue | RNE | tests runtime "Qui décide" | aucune |
| **Adjoints, nommés** | `s-qui` — chaque adjoint listé par son nom et son rang (vérifié à l'écran sur Bagnolet : Lauren LOLO, Chawqui HADDAD…) | `QuiDecide.jsx` — **le compte seul** (`adjoints: (...).length`), aucun nom | **PARTIAL, vérifié à l'écran le 22/09 (phase 3.1)** | Oui, réel | RNE (`RNE.adj`, déjà dans le pipeline) | aucun test dédié aux noms | matérialiser les noms dans `extract-html.js` si jugé utile pour la bêta — non fait, décision produit |
| **Intercommunalité, nommée** | `s-qui` — délégués QUE LA COMMUNE envoie, nommés (Metropole Du Grand Paris, Edouard DENOUEL, vérifié sur Bagnolet) | **PORTÉ le 22/09/2026 (phase 3.1, option A)** — `QuiDecide.jsx` → `Agglo()`, identique : "Bagnolet envoie 1 élu au conseil de Metropole Du Grand Paris. Conseiller communautaire — Edouard DENOUEL" | **PASS, régression fermée, vérifié à l'écran** | Non — fermée | RNE (`RNE.ecc`), doctrine du vide si absente (~32% des communes IDF) | `runtime.test.mjs` : Ustaritz (présence) + Amillis (absence honnête) | aucune |
| **Conseil départemental, nommé** | `s-qui` — le mieux classé PARMI LES CONSEILLERS DU CANTON de la commune (pas forcément le président), nommé | **PORTÉ le 22/09/2026** — `QuiDecide.jsx` → `ConseilDepartemental()`, même filtre canton, même tri par rang. Vérifié à l'identique sur Bagnolet : Daniel GUIRAUD (1er vice-président, le mieux classé du canton) en tête, Elodie GIRARDET en second — **ma première lecture visuelle de l'ancien site avait inversé les deux, corrigé en relisant les données RNE brutes** | **PASS, régression fermée, vérifié à l'écran** | Non — fermée | RNE (`RNE.dep`/`depcan`/`ccan`) | `runtime.test.mjs` : Ustaritz (canton Ustaritz-Vallées de Nive et Nivelle) | aucune |
| **Conseil régional, nommé** | `s-qui` — le mieux classé de tout le conseil (en pratique le président, par le rang de fonction) | **PORTÉ le 22/09/2026** — `QuiDecide.jsx` → `ConseilRegional()`, un fichier par région (`elus-regions/{code}.json`, jamais la France entière — 148 Ko pour 14 régions avant la scission, 17 Ko pour la seule Île-de-France après). Vérifié : Valérie PÉCRESSE (IDF, région 11) et Alain ROUSSET (Nouvelle-Aquitaine, région 75, testé sur Ustaritz) | **PASS, régression fermée, vérifié à l'écran** | Non — fermée | RNE (`RNE.reg`) | `runtime.test.mjs` : Ustaritz | aucune |
| Circonscription | `s-qui` | `QuiDecide.jsx`, `phraseCirco()` | **PASS** | Non — amélioration (communes multi-circo gérées) | Ministère de l'Intérieur, découpage 2010 | idem | aucune |
| Député | `s-qui` (attribution non documentée) | `QuiDecide.jsx` → `Depute()`, `data/deputes.json` | **PASS** | Non — amélioration (source déclarée) | Assemblée nationale | idem | aucune |
| **Comptes commune** | `s-argent` — ville | `OuVaArgent.jsx` — `paquet.communes[c].comptes` | **PASS** | Non | OFGL | tests runtime "l'argent" | aucune |
| **Comptes département** | `s-argent` — département | **CORRIGÉ AUJOURD'HUI** : `paquet.comptes_departement`, fondu dans chaque paquet départemental (0 requête de plus) | **PASS** | **Régression fermée** — était MISSING ce matin | OFGL, `OFGL.ech.departement.terr` | `runtime.test.mjs` : "comptes — le département de la commune choisie est nommé et traduit" | aucune |
| **Comptes région** | `s-argent` — région | **CORRIGÉ AUJOURD'HUI** : `data/comptes-regions.json`, 17 régions, 25,2 Ko | **PASS** | **Régression fermée** — était MISSING ce matin | OFGL, `OFGL.ech.region.terr`, lien département→région vérifié par recoupement de population dans `extract-html.js` | `runtime.test.mjs` : "comptes — la région de ce département est nommée et traduite" | aucune |
| Votes | `s-vote` — une seule commune en dur (Fontainebleau) | `QuiDecide.jsx`/`CeQuiADecide.jsx` — toutes communes | **PASS** | Non — largement amélioré | Assemblée nationale, scrutins solennels | tests existants | aucune |
| Sources | `s-sources` — charte, fraîcheur/couverture, journal des corrections, financement | `Sources.jsx` — producteurs/licences, 8 invariants, contact | **PARTIAL** | Non, mais incomplet | — | tests existants (liste des producteurs) | manquent : charte de neutralité en texte, bloc fraîcheur/couverture chiffré, journal des corrections, déclaration de financement — aucun n'est bloquant pour une bêta fermée |
| Aujourd'hui | `s-fil` en est l'ancêtre | `Aujourdhui.jsx`, prototype, lien secondaire | **PASS (prototype)** | Non | — | tests existants | décision produit déjà écrite : reste un lien tant que non arbitré |
| **Ce qui a été décidé** | `s-fil` — `window.REPERE_DATA` + événements | `CeQuiADecide.jsx` — projets DGCL + votes AN **+ fil éditorial** (`evenements.json`, corrigé aujourd'hui) | **PASS** | **Régression fermée** — le fil éditorial était MISSING ce matin | `data/evenements/*.md` → `outils/evenements.py` → `evenements.json`, chaque fait avec sa propre source officielle | `runtime.test.mjs` : 4 contrôles dédiés ("fil editorial — ...") | aucune |
| **Fil éditorial (détail)** | `data/evenements/*.md`, `valide: true` humain | idem, lu tel quel, jamais régénéré (pas de Python sur ce poste) | **PASS** | Régression fermée | rédaction Repère + source propre à chaque fait | mention "relu et validé par la rédaction" testée explicitement — jamais présentée comme automatique | aucune |
| Où va mon argent | voir comptes ci-dessus | voir ci-dessus | **PASS** | Régression fermée | — | — | aucune |
| Calendrier | `s-agenda` (figé) + `s-an` (AN, async) | `Calendrier.jsx` — Sénat seul | **PARTIAL** | Non — choix déjà écrit (pilote Sénat, 17/09) | Sénat | tests existants | AN à porter quand sa source sera aussi vérifiée |
| Navigation / retour arrière | non audité côté ancien | `historique.js` (`entrer()`/`revenir()`) | **PASS** | Non | — | 2 contrôles dédiés | aucune |
| Accessibilité | non chiffré côté ancien | 44 px cibles, contraste 3:1 thème sombre, zoom 200 %, focus visible | **PASS** | Non | — | 5 contrôles dédiés | comparaison chiffrée avec l'ancien site non faite (hors périmètre) |
| Mobile | non chiffré côté ancien | testé à 390 px, zoom 200 % sans défilement horizontal | **PASS** | Non | — | tests existants | idem |
| États de données absentes | doctrine du vide déjà en place, cas par cas | doctrine du vide formalisée (`ETATS`/`PHRASES`), 3 familles symétriques dans "Ce qui a été décidé" depuis aujourd'hui | **PASS** | Non — amélioration | — | contrôles dédiés par famille | aucune |
| **Mentions légales** | `s-moi` + `s-sources`, repliées | **CORRIGÉ AUJOURD'HUI** : `Sources.jsx` → `MentionsLegales()`, adapté (pas recopié — 3 affirmations fausses pour mono corrigées, voir extract-html.js) | **PASS** | **Régression fermée** — était ABSENT (bloquant) ce matin | contenu adapté du bloc validé de l'ancien site | `runtime.test.mjs` : 4 contrôles, dont un clic réel sur le `<details>` | aucune |
| Bandeau maquette / bêta | présent sur l'ancien (reformulé par le correctif v9 du jour) | **toujours ABSENT** | **MISSING** | Non — mono n'utilise que des données réelles (RNE/OFGL/AN/Sénat), donc aucun contenu fictif à annoncer | — | — | **décision humaine à trancher** : un bandeau "bêta, 8 départements" reste utile même sans contenu fictif (couverture réelle incomplète) — non fait, pas oublié par erreur |
| Absence de labels « RÉEL » | retirés de l'ancien site par le correctif v9 du jour | jamais présents (`grep` : zéro résultat) | **PASS** | Non | — | `grep` exécuté aujourd'hui | aucune |
| Absence de phrase IA non justifiée | retirée de l'ancien site par le correctif v9 du jour | jamais présente (`grep` : zéro résultat) | **PASS** | Non | — | idem | aucune |
| Provenance | incohérente côté ancien (doublons `s-influence`/`s-sources`) | composant `Source` unique, obligatoire, invariant 4 testé | **PASS** | Non — amélioration | — | tests existants | aucune |

**Régressions bloquantes fermées aujourd'hui (les trois de la baseline du
matin) : mentions légales, comptes département/région, fil éditorial — les
trois désormais PASS, avec preuve et test.**

**Trois régressions trouvées cet après-midi (phase 3.1, shadow build),
vérifiées à l'écran sur Bagnolet, et fermées le même jour (décision produit
option A) : intercommunalité, département et région sont désormais nommés
dans `mono/`, à partir du même mécanisme RNE que l'ancien build — porté,
pas réinventé (`rangFonction`, filtre par canton pour le département,
extraction dans `extract-html.js`).** Vérifié une seconde fois à l'écran
après le portage : les mêmes personnes, dans le même ordre, pour la même
commune. Aucune régression bloquante ne reste ouverte. Les PARTIAL restants
(adjoints non nommés — le compte seul, un choix de densité d'écran plutôt
qu'un manque de donnée —, Sources, Calendrier) sont des manques déjà
documentés et non bloquants pour une bêta fermée.

## 5. Écrans de l'ancien site sans équivalent dans `mono/` — chacun avec sa raison réelle

| écran | statut dans `mono/` | raison observée (pas supposée) |
|---|---|---|
| `s-jeu` (quiz quotidien) | ABSENT | Un quiz avec carnet de série personnel touche à la frontière de l'invariant 6 (gamification) même sans score public affiché ; son absence est cohérente avec l'invariant, mais **aucune décision écrite** ne dit qu'il a été retiré pour cette raison plutôt qu'oublié |
| `s-partis` (hémicycle, composition AN) | ABSENT | Fonction non risquée en soi (composition, pas classement), simplement pas encore portée |
| `s-debats` (débats présidentiels 2027) | ABSENT | Contenu déjà vide dans l'ancien site (aucun débat n'a eu lieu) — NON APPLICABLE pour l'instant, redevient pertinent avant avril 2027 |
| `s-elus` (recherche libre de tout élu) | ABSENT | Doublon fonctionnel de `s-qui`/`QuiDecide`, confirmé par l'agent |
| `s-influence` (HATVP, lobbying, financement partis) | ABSENT | Contient déjà un bloc marqué `data-veille="demo"` avec un tag `À RECROISER` dans l'ancien site — donnée déjà reconnue comme non fiable avant même la migration |
| `s-suivis` (suivi de loi, alertes Premium) | ABSENT | Cohérent avec la décision déjà prise de garder le freemium en veille (`CLAUDE.md` §10) |
| `s-moi` (profil) | ABSENT | Cohérent avec l'invariant 2 (aucun compte) ; **mais portait aussi les mentions légales**, voir §4 |
| `s-carte` (carte de France, mode "couleur politique des exécutifs régionaux") | ABSENT | Son mode politique s'approche de l'invariant 7 (palette gelée) et de l'invariant 3 (pas de comparaison visuelle de territoires) — absence probablement saine, **à confirmer explicitement plutôt qu'à supposer** |
| `s-2027` (présidentielle 2027) | ABSENT | Vide par construction aujourd'hui (aucun candidat officiel) ; à réintroduire avant avril 2027, c'est un enjeu stratégique du projet, pas un détail |
| `s-an` (agenda Assemblée nationale) | ABSENT | Choix déjà écrit : pilote Sénat seul jusqu'à vérification d'une source AN aussi fiable |
| `s-dico` (dictionnaire autonome) | PRESENT sous une autre forme | `DefinitionProvider`/`<Mot>` (glossaire contextuel au clic sur un terme), pas un écran de recherche séparé — fonction équivalente, présentation différente |
| `s-agenda` (calendrier général figé) | Absorbé partiellement par `Calendrier.jsx` | L'ancien utilisait des données figées en dur (`CAL_EVENTS`) ; `Calendrier.jsx` utilise une vraie source (Sénat), en couverture plus étroite |
| `s-fil` (fil éditorial validé à la main) | **Pas absorbé** | Voir §4, "Ce qui a été décidé" — c'est le trou le plus important de cette matrice |

## 6. Où vit chaque donnée — A (bundle initial) / B (après commune) / C (à la demande) / D (pipeline seul)

*Lu directement dans `packages/data-utils/src/client.js` : chaque fonction
`chargerX()` dit elle-même quand elle est appelée.*

| donnée | où elle vit | déclencheur réel |
|---|---|---|
| `index.json` (5-11 Ko : départements, sources, agrégats) | **A** | `chargerIndex()`, appelé au montage de `App.jsx`, avant tout choix |
| `communes-beta.json` (11 Ko, recherche IDF) | **A** | même montage, en parallèle — sert à chercher une commune sans connaître son département |
| `data/departments/{dep}.json` (maire, adjoints, circo, comptes commune **+ comptes département depuis aujourd'hui**, +1,4 Ko — 108 à 194 Ko selon le département) | **B** | `chargerDepartement(dep)`, uniquement après le choix d'un département ou d'une commune |
| `data/comptes-regions.json` (17 régions, 25,2 Ko, **nouveau aujourd'hui**) | **C** | `chargerComptesRegions()`, seulement dans l'onglet "Où va l'argent" — **jamais** dans le paquet départemental : une région couvre plusieurs départements, la dupliquer partout coûterait plus cher que ce seul fichier |
| `data/deputes.json` (54 Ko, toute la France) | **C** | `chargerDeputes()`, appelé seulement par `QuiDecide.jsx` → `Depute()`, donc seulement si une commune est choisie et affichée |
| `data/scrutins.json` (catalogue, 3,4 Ko) + `data/scrutins/{dep}.json` (positions, <2 Ko) | **C** | `chargerCatalogueScrutins()`/`chargerVotes()`, seulement au clic sur "Comment X a voté" (`Votes` dans `QuiDecide.jsx`, ou directement dans `CeQuiADecide.jsx`) |
| `data/projets/{dep}.json` (DGCL) | **C** | `chargerProjets()`, seulement dans l'onglet "Ce qui a été décidé" |
| `data/calendrier-senat.json` | **C** | `chargerCalendrierSenat()`, seulement dans l'onglet "Calendrier" |
| `data/evenements.json` (fil éditorial, 1,3 Ko pour 2 faits, **nouveau aujourd'hui**) | **C** | `chargerEvenements()`, seulement dans "Ce qui a été décidé"/"Aujourd'hui" |
| RNE brut (France entière), OFGL brut (France entière) | **D** | jamais servis au navigateur : `scripts/extract-html.js` les lit une fois au build et les découpe ; seule leur part par département existe côté client (catégorie B), ou par région (catégorie C) |
| `noms-territoires.json` (+ lien département→région, ajouté aujourd'hui), métadonnées sources | **D** | fondues dans `index.json` au build, jamais redemandées séparément |
| `outils/evenements.json` (source du fil éditorial, produit par `outils/evenements.py`, Python — jamais exécuté depuis ce poste) | **D côté pipeline, recopié tel quel** | lu par `extract-html.js`, jamais régénéré ici |

**Ce que cette répartition confirme** : aucune donnée volumineuse n'entre
dans le bundle initial (catégorie A ne contient que 16-22 Ko). C'est
exactement l'inverse de l'ancien site, où RNE et OFGL France entière (15,2 Mo
des 16,29 Mo) sont dans la catégorie A par construction — l'invariant 1
(fonctionner hors ligne) est tenu en embarquant tout, faute d'alternative
avant `mono/`.

## 7bis. `s-carte` et `s-jeu` — classement KEEP / DEFER / REMOVE, avec preuve

*Demandé explicitement (mission phase 3, §13) : ne rien supprimer sans
preuve, mais ne pas laisser une absence implicite passer pour une décision.*

| écran | références dans `mono/` (code, nav, tests, doc) | données nécessaires | présent dans le parcours bêta actuel | raison historique | classement |
|---|---|---|---|---|---|
| `s-carte` | **zéro** (`grep` exécuté aujourd'hui sur `apps/`, `packages/`, `tests/`, `scripts/`) | découpage administratif (déjà dans `noms-territoires.json` depuis aujourd'hui) + un mode « couleur politique des exécutifs régionaux » qui n'a pas d'équivalent de données dans mono | Non | Carte de France par département, deux modes (couverture / couleur politique) — voir `MONO_MIGRATION_AUDIT.md` §5 | **DEFER** — pas dans les 5 expériences prioritaires de la bêta (Qui décide / Ce qui a été décidé / Aujourd'hui / Où va l'argent / Ce qui se passe) ; son mode politique s'approche de l'invariant 3 (comparaison visuelle de territoires) et de l'invariant 7 (palette gelée) — à concevoir, pas à recopier |
| `s-jeu` | **zéro** (idem) | questions figées (`JEU_Q`), un carnet de série en `localStorage` — incompatible avec l'invariant 2 de mono (une seule clé, `repere.departement`, jamais un compteur d'usage) | Non | Quiz quotidien « Qui décide quoi ? », carnet de série personnel | **DEFER** — tension réelle avec l'invariant 6 (gamification) même sans score public ; son absence est probablement saine mais n'a jamais été **décidée explicitement**, seulement jamais construite |

**Aucune action irréversible n'est prise ici.** Les deux écrans restent
intacts dans `app_repere_v18_20.html` ; aucun fichier n'est supprimé. DEFER
signifie : ne pas les construire dans mono/ tant que la bêta n'a pas
validé les cinq expériences prioritaires, et trancher explicitement (pas
implicitement) s'ils reviennent un jour.

## 7. Ce que cet audit NE permet PAS de conclure

*Mis à jour le 22/09/2026, phase 3.1 : les blockers cités dans la première
version de cette section (mentions légales, comptes dept/région, fil
éditorial, agglo/département/région sans élu nommé) sont tous fermés
aujourd'hui, avec preuve et test — voir §4. Ce qui suit reste vrai.*

- **"mono/ est prêt pour une bascule en production"** — pas encore : voir
  le Release Gate (§8) — les critères I (le pipeline sait publier mono/) et
  J (validation réelle en ligne) sont à zéro, aucun travail commencé.
- **"mono/ est plus léger, donc supérieur"** — le poids est mesuré et réel
  (voir `PERFORMANCE_BASELINE.md`), mais le poids n'est qu'un des dix
  critères du Release Gate, pas le seul.
- **Comparaison chiffrée d'accessibilité ancien/mono** — non faite : l'ancien
  site n'a pas été audité WCAG dans cette session (l'agent a listé les
  écrans, pas mesuré leur accessibilité). Ne pas présenter mono comme
  "plus accessible" sans cette mesure côté ancien.

## 8. Release Gate — dix critères, aucun escamoté

*Mission phase 3.1, règle explicite : jamais "prêt pour la production" si
une catégorie critique n'est pas démontrée. Mis à jour après le portage des
élus agglo/département/région.*

| critère | état | preuve |
|---|---|---|
*Mis à jour une seconde fois le 22/09/2026, phase 3.2 (pont vers le
pipeline réel). Détail complet des lignes D et I : `MONO_PIPELINE_BRIDGE_2026-09.md`.*

| critère | état | preuve |
|---|---|---|
| A. Fonctionnel (socle bêta) | **PASS** *(re-confirmé)* | 120 inline + 65 `node:test`, verts en local **et sur le runner GitHub réel** (`ubuntu-latest`, run `35799649140`, commit `8a5256d`) — sur `apps/web/dist` **et** sur `site_engendre` réellement copié. |
| B. Données critiques présentes | **PASS** | comptes 3 échelons + élus agglo/dept/région, tous nommés et testés |
| C. Provenance traçable | **PASS** | chaque carte chiffrée ou nominative porte sa source ; l'**artefact lui-même** porte `build.commit`/`build.construit_le` — confirmé sur le runner réel et par téléchargement direct de l'artefact : `{commit_court:"8a5256d", sante:{elus:true,comptes:true,circonscriptions:true,deputes:true,scrutins:true,projets:false,evenements:true}}` |
| D. Fraîcheur (dates de collecte connues) | **PASS** | `index.json` porte un schéma versionné (`v`/`SCHEMA_ATTENDU`) ; un cache dont le schéma diverge est détecté et remplacé, prouvé par un test qui casse le garde-fou à la main |
| E. Performance (gain confirmé sur parcours réel) | **PASS** | 140,7 Ko en local, **140,8 Ko sur l'artefact réellement produit et téléchargé du runner** (252 fichiers, 20 Mo stockés — vérifié indépendamment des logs, pas seulement lu) — écart de 0,1 Ko, négligeable |
| F. Accessibilité (parcours critiques utilisables) | **PASS** *(re-confirmé)* | 44 px, contraste 3:1, focus, **et zoom 200 % — cassé sur le runner réel le 22/09 (55 px), fermé et re-confirmé vert sur le runner réel le 22/09 (0 px), sur `apps/web/dist` et sur `site_engendre`.** Cause identifiée par mesure (pas de police en cause : un badge en `white-space:nowrap` et un `<button>` de glossaire dont `appearance:auto` empêchait le mot de casser), corrigée à la source. Détail : §9bis. |
| G. Parité (aucune fonction critique perdue) | **PASS** | les 3 régressions trouvées par le shadow build sont fermées et re-vérifiées à l'écran |
| H. Réversibilité (retour rapide à l'ancien build) | **PASS** | procédure exacte documentée : un seul commit (`b4737ff`) à `revert`, jamais fusionné, `build_pwa_reconstruit.py` intact |
| I. Production (le pipeline sait produire et publier mono/) | **PASS** *(était PARTIAL)* | **le pont complet, prouvé sur le runner GitHub réel, de bout en bout** : install Node/pnpm/corepack, dépendances, Chromium dédié, extraction, build, assemblage `site_engendre`, banc (statique + navigateur, sur l'artefact réel), mesure de poids, upload d'inspection — **17 étapes vertes, run `35799649140`**, aucune non exécutée. Reste PARTIAL uniquement pour la publication elle-même (J), jamais tentée par choix. |
| J. Validation réelle (site publié inspecté après déploiement) | **FAIL** | mono/ n'est déployé sur aucune adresse publique — **volontairement, cette phase ne l'a pas tenté** |

**Conclusion, après la boucle complète de la Phase 3.3.** Les deux
critères qui avaient reculé (A, F) sont revenus à PASS, pas par
arrondi : par une régression réellement fermée et réellement
re-vérifiée sur le même runner qui l'avait trouvée. I passe à PASS —
c'est la première fois que le pont est prouvé construire ET s'éprouver
sur `ubuntu-latest`, pas seulement sur ce poste. Le gate reste
**incomplet** sur un seul point, J, et par choix explicite de cette
phase : « construire et éprouver le pont, pas encore le publier ».
Rien de tout cela n'a atteint `main` au-delà d'un fichier de workflow
de test sans étape de déploiement — voir §9bis.

## 9bis. Phase 3.3 — le pont éprouvé sur le runner GitHub réel, 22-23/09/2026

*Mission : prouver que le pont fonctionne sur `ubuntu-latest`, sans aucune
publication. Détail complet, logs et chronologie : le rapport de session
correspondant. Ce qui suit est la synthèse qui reste dans ce document.*

**Le run réel** : `gh workflow run test-mono-pipeline.yml --ref
ci-test-mono-pipeline` → run `35796632331`, déclenché manuellement
(`workflow_dispatch`), branche `ci-test-mono-pipeline`, commit `5714be0`.

**Ce qui a fonctionné, pour la première fois sur le vrai runner :**
Node/pnpm/corepack, `pnpm install --frozen-lockfile` dans `mono/`, un
Chromium dédié installé pour le banc de `mono/` (distinct de celui de
`test_repere.mjs` à la racine — risque identifié par audit avant
d'écrire le workflow, pas deviné), `extract-html.js`, `pnpm build`,
assemblage de `site_engendre`. Tout vert, en 39 secondes. La provenance
écrite dans l'artefact a été lue directement sur le runner :
`{"commit_court":"5714be0","sante":{"elus":true,"comptes":true,"circonscriptions":true,"deputes":true,"scrutins":true,"projets":false,"evenements":true}}`
— `projets:false` est **attendu** (doctrine du vide, santé OPTIONAL, pas
une panne).

**Ce qui a cassé, uniquement sur le runner réel :** `pnpm test` →
`tests/runtime.test.mjs`, l'assertion "à 200 % de zoom texte, l'écran Qui
décide ne défile pas horizontalement" → **débordement de 55 px**. Le même
test, sur le même commit, avec la même version de Chromium (1.56.0,
épinglée par `mono/package.json` et confirmée identique sur les deux
environnements), **passe en local** sur ce poste Windows — vérifié en
relançant `node tests/runtime.test.mjs apps/web/dist` directement, pas
supposé.

**Cause la plus probable, mesurée mais pas prouvée à 100 % :** la pile de
polices déclarée dans `packages/ui/src/tokens.css` —
`--t-titre: "Bricolage Grotesque", system-ui, -apple-system, "Segoe UI",
Roboto, sans-serif` — ne contient **aucune police auto-hébergée** (aucun
`@font-face` dans `app.css`, confirmé par recherche) : "Bricolage
Grotesque" n'est jamais réellement chargée, sur aucun des deux
environnements. Sur Windows, la pile retombe sur "Segoe UI", installée.
Sur le runner Ubuntu (`ubuntu-latest` + `playwright install --with-deps`),
aucun des noms de la liste n'est probablement installé, et le navigateur
retombe sur le `sans-serif` générique du système (le plus souvent
DejaVu Sans sous Linux) — mesurablement plus large. Les blocs élus
ajoutés en phase 3.1 (fonctions longues type « 1er Vice-président du
conseil départemental », noms d'EPCI, de cantons) sont les candidats les
plus probables au débordement, mais **je n'ai pas isolé l'élément exact**
sur le runner — l'étape d'upload de l'artefact n'a jamais tourné (elle
suit le banc dans l'ordre du fichier, sans `if: always()`), donc aucun
artefact CI n'existe pour cette exécution et la comparaison au shadow
build local (E) n'a pas pu se refaire sur les mêmes fichiers.

**Correctif minimal proposé, non appliqué :** avant tout correctif CSS,
ajouter une étape de diagnostic (capture d'écran + `getComputedStyle`
sur l'élément qui déborde) au même workflow de test isolé, pour nommer
l'élément précis plutôt que de deviner. Piste de correctif la plus
probable une fois l'élément identifié : `overflow-wrap: break-word` (ou
équivalent) sur `.ligne-h b`/`.ligne-h span`, qui ne dépend d'aucune
police et résiste à n'importe quelle substitution système — préférable à
héberger "Bricolage Grotesque" en local, qui réglerait le symptôme
observé sans garantir qu'aucune autre substitution de police, sur aucun
autre runner, ne recrée le même débordement ailleurs.

**Preuve d'absence de publication, vérifiée point par point :**
- Aucune étape de déploiement dans le fichier (`grep` local + garde-fou
  interne au workflow, les deux verts).
- Le job n'a jamais atteint l'étape d'upload d'artefact (annulée par le
  banc en échec) — rien n'a même été déposé en inspection.
- `main` n'a reçu, via la PR #10 (`73b534e`), que l'ajout du fichier
  `.github/workflows/test-mono-pipeline.yml` — 1 fichier, 149 insertions,
  0 suppression, vérifié par `git show --stat` du commit de fusion.
  `collecte.yml` et `build-publish.yml` (les deux seules chaînes qui
  tournent seules) n'ont pas été touchés.
- Le run lui-même l'annonce explicitement dans ses logs, y compris sur
  l'exécution qui a échoué (l'étape de confirmation a `if: always()`) :
  `PRODUCTION ACTIVEE : NON` / `PUBLICATION : NON` / `MAIN MODIFIEE : NON`.

**Prochaine décision humaine, unique (au moment où ce qui précède a été
écrit) :** ajouter l'étape de diagnostic CSS et relancer un
`workflow_dispatch` pour nommer l'élément précis avant d'écrire le
correctif. C'est la voie qui a été suivie — voici ce qu'elle a trouvé.

### Résolution, même jour — l'hypothèse police était fausse

Le diagnostic DOM (inspection systématique `rect`/`scrollWidth`/
`getComputedStyle`, temporaire, dans le test) a nommé l'élément
responsable sans avoir besoin du runner : **reproductible en local**, en
forçant le diagnostic à s'exécuter même quand le débordement document
reste à 0 — deux causes réelles, mesurées, **aucune liée à une police** :

1. **`.tag { white-space: nowrap }`** — le badge "DONNÉE OFFICIELLE"
   mesure 302 px à 200 % de zoom, pour une carte de 276 px. Présent sur
   4 des 5 cartes de "Qui décide" (26 px de débordement interne
   constant, contenu localement par le flex-wrap déjà en place, jamais
   par hasard). Retiré : la règle de repli sous 480 px (déjà en place)
   protégeait déjà la mise en page voulue, `nowrap` n'ajoutait qu'un
   débordement.
2. **`<Mot>` (le terme de glossaire, ex. "intercommunalité") est un
   `<button>`** : la feuille de style du navigateur pose
   `appearance: auto`, qui prime sur `display: inline` posé dans le
   CSS du projet et empêche le mot de casser au milieu — 46 px de trop,
   mesuré précisément sur le seul titre de carte qui utilise `<Mot>`
   (celui de "Votre intercommunalité", ajouté en phase 3.1 : c'est
   pourquoi cette régression n'existait pas avant). `appearance: none`
   + `overflow-wrap`/`word-break: break-word` corrigent à la source.

Correctif appliqué dans `mono/apps/web/src/styles/app.css`, testé en
local (débordement interne des cartes 48 px/26 px → 0-2 px résiduel de
padding, document 0 px, 120+65 tests verts), puis **confirmé sur le
runner GitHub réel** : run `35799649140`, commit `8a5256d`, **17
étapes vertes, y compris pour la première fois le banc sur l'artefact
`site_engendre` réellement copié, la mesure de poids et l'upload
d'inspection** — aucune étape non exécutée. Artefact téléchargé et
vérifié indépendamment des logs : 252 fichiers, 20 Mo stockés, 140,8 Ko
transférés sur le parcours complet (140,7 Ko en local — écart de 0,1 Ko,
négligeable).

Diagnostic temporaire retiré une fois la cause fermée (commit
`9daf130`) : le comportement reste protégé par l'assertion déjà
existante (débordement document ≤ 1 px à 200 %), qui a mesuré les deux
bugs et détectera tout retour de l'un, de l'autre, ou d'un cas
similaire — pas besoin d'un test dédié à une classe CSS précise.

**Incident annexe, sans consequence :** la tâche planifiée horaire a
auto-commité et poussé un état intermédiaire abandonné pendant
l'exploration (`857df15` : une capture d'écran de travail et une
version antérieure, moins efficace, du correctif) — sur la branche
isolée, jamais sur `main`, rien perdu. Corrigé par-dessus avec les
commits finaux, sans réécriture d'historique.

**Prochaine décision humaine, unique (état actuel) :** décider quand
basculer `outils/pipeline.sh` sur `main` pour publier réellement depuis
`mono/` (critère J du Release Gate, le seul qui reste FAIL, par choix).
Cette phase a délibérément prouvé que le pont construit et s'éprouve
sur le runner réel — elle n'a pas décidé de l'emprunter pour de vrai.
