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

*PRESENT = repris et testé. PARTIAL = repris mais avec une couverture ou un
contenu réduit, précisé. ABSENT = pas repris, avec la raison connue.
NON APPLICABLE = ne s'applique pas à l'architecture cible. Aucune case n'est
mise à PRESENT sur une supposition — chacune cite le fichier ou le test.*

| Fonction | Ancien site (`app_repere_v18_20.html`) | `mono/` | Statut | Différence / Risque |
|---|---|---|---|---|
| Recherche commune | `s-qui`/plusieurs écrans, pas de champ unifié commune+département avant le 13/09 sur aucune version | `Entree` (`App.jsx`), un seul champ, commune OU département | **PRESENT, amélioré** | Aucun risque connu ; testé sur Ville-d'Avray (commune absente du RNE) |
| Identification commune | implicite dans chaque écran | idem, doctrine du vide propre (`paquet.manquantes`) | **PRESENT** | — |
| Maire | `s-qui` (ligne 2645), `s-elus` (doublon, ligne 2833) — `window.REPERE_RNE` | `QuiDecide.jsx` — `paquet.communes[c].maire` | **PRESENT** | `s-elus` (recherche libre de tout élu) n'est pas repris ; l'agent l'a identifié comme doublon fonctionnel de `s-qui`, pas une fonction distincte perdue |
| Circonscription | `s-qui` | `QuiDecide.jsx`, `phraseCirco()` | **PRESENT, amélioré** | mono gère explicitement les communes à cheval sur plusieurs circonscriptions (Paris, 18) ; rien n'indique que l'ancien site le faisait |
| Député | `s-qui` (nom seul, pas de source d'attribution circonscription→député documentée dans l'audit) | `QuiDecide.jsx` → `Depute()`, `data/deputes.json` avec producteur/licence/législature | **PRESENT, amélioré** | mono ajoute la source du lien circonscription→député (absente du RNE, expliqué dans `mono/README.md`) |
| Comptes | `s-argent` (ligne 2866) — **ville ET département ET région**, `window.REPERE_OFGL` | `OuVaArgent.jsx` — **commune seule** | **PARTIAL** | **Risque réel et confirmé** : `data/departments/*.json` ne porte aucun champ de comptes départementaux/régionaux (`Object.keys(communes[x])` = `nom, maire, adjoints, circo, comptes` — `comptes` est celui de la commune). L'ancien site couvrait 101 départements + 17 régions (voir `CONTEXTE_PROJET.md` §7) ; ce n'est pas encore extrait dans `mono/` |
| Votes | `s-vote` (ligne 2853) — **une seule commune résolue en dur (Fontainebleau/77186)** | `QuiDecide.jsx`/`CeQuiADecide.jsx` — toutes communes, tous députés, filtré aux scrutins solennels | **PRESENT, largement amélioré** | L'ancien écran ne fonctionnait réellement que pour une commune ; mono fonctionne pour les 1 262+ communes de la bêta |
| Sources | `s-sources` (ligne 3119) — charte de neutralité, fraîcheur/couverture, **journal des corrections**, financement (« aucun revenu ») | `Sources.jsx` — liste des producteurs/licences, 8 invariants, contact | **PARTIAL** | Manquent : la charte de neutralité en texte, le bloc fraîcheur/couverture chiffré, le journal des corrections, la déclaration de financement |
| Aujourd'hui | n'existait pas sous ce nom (`s-fil` en est l'ancêtre le plus proche) | `Aujourdhui.jsx`, prototype, lien secondaire non par défaut | **PRESENT (prototype)** | Décision produit déjà écrite dans `App.jsx` : reste un lien, pas un onglet, jusqu'à arbitrage |
| Ce qui a été décidé | `s-fil` (ligne 2454) — `window.REPERE_DATA` (faits éditoriaux validés à la main) + événements | `CeQuiADecide.jsx` — **projets DGCL + votes AN uniquement, aucun fait éditorial** | **PARTIAL** | **Risque réel** : le travail éditorial quotidien (`data/evenements/*.md` → faits validés, décrit comme le trou n°1 du projet dans `CONTEXTE_PROJET.md` §12) n'a aucun point d'entrée dans `mono/` aujourd'hui. Porter `evenements.json` vers `mono/` reste à faire |
| Où va mon argent | voir "Comptes" ci-dessus | voir ci-dessus | **PARTIAL** | même risque |
| Calendrier | `s-agenda` (ligne 2554, calendrier général figé) + `s-an` (ligne 3443, agenda AN, async réel) | `Calendrier.jsx` — **Sénat seul** | **PARTIAL** | Assemblée nationale non portée ; c'est un choix déjà écrit (pilote Sénat, 17/09/2026), pas un oubli |
| Navigation / retour arrière | non audité en détail par l'agent (hors périmètre de sa recherche) | `historique.js` (`entrer()`/`revenir()`), testé : "le retour du téléphone replie les votes", "un second retour ramène à l'écran d'entrée" | **PRESENT, testé** | 2 contrôles navigateur dédiés, verts aujourd'hui |
| Accessibilité | non chiffré par l'agent pour l'ancien site (hors périmètre) | 44 px cibles tactiles, contraste 3:1 en thème sombre, zoom 200 %, focus visible — **5 contrôles dédiés**, verts | **PRESENT, testé** | Comparaison chiffrée avec l'ancien site non faite ici (nécessiterait un audit WCAG séparé de `app_repere_v18_20.html`, hors périmètre de cette session) |
| Mobile | non chiffré par l'agent pour l'ancien site | testé à 390 px (viewport du banc), zoom 200 % sans défilement horizontal | **PRESENT, testé** | idem — pas de comparaison chiffrée avec l'ancien |
| États de données absentes | doctrine du vide déjà en place sur plusieurs écrans (mesuré dans des sessions antérieures) | doctrine du vide sur **chaque** chargeur (`ETATS`/`PHRASES` dans `client.js`), avec distinction "chez nous" vs "la source ne le porte pas" — 6 contrôles dédiés au fil seul | **PRESENT, amélioré, testé** | mono formalise la distinction en code partagé (`ETATS`), l'ancien site la portait cas par cas |
| Mentions légales | `s-moi` (ligne 3001, repliées) + `s-sources` (repliées) | **aucune occurrence** dans `mono/apps/web/src`, `index.html`, ni `public/` (`grep` exécuté, zéro résultat) | **ABSENT** | **Bloquant pour une publication réelle** : c'est l'exact correctif poussé aujourd'hui sur l'ancien site (`f55d0f5`). Publier `mono/` en l'état publierait sans mentions légales |
| Bandeau maquette | présent sur l'ancien site (retiré/reformulé par le correctif v9 du jour) | **aucune occurrence** trouvée | **ABSENT** | Si `mono/` sert du contenu de démonstration un jour, rien ne l'annonce. À vérifier : `mono/` semble n'utiliser que des données réelles (RNE/OFGL/AN/Sénat), donc ce bandeau n'est peut-être pas nécessaire — **à trancher, pas à supposer** |
| Provenance | `Source`-like mentions par écran, incohérentes (l'agent note des doublons entre `s-influence` et `s-sources`) | composant `Source` unique, obligatoire par carte chiffrée, invariant 4 testé explicitement | **PRESENT, amélioré, testé** | — |

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
| `data/departments/{dep}.json` (maire, adjoints, circo, comptes commune — 108 à 194 Ko selon le département) | **B** | `chargerDepartement(dep)`, uniquement après le choix d'un département ou d'une commune |
| `data/deputes.json` (54 Ko, toute la France) | **C** | `chargerDeputes()`, appelé seulement par `QuiDecide.jsx` → `Depute()`, donc seulement si une commune est choisie et affichée |
| `data/scrutins.json` (catalogue, 3,4 Ko) + `data/scrutins/{dep}.json` (positions, <2 Ko) | **C** | `chargerCatalogueScrutins()`/`chargerVotes()`, seulement au clic sur "Comment X a voté" (`Votes` dans `QuiDecide.jsx`, ou directement dans `CeQuiADecide.jsx`) |
| `data/projets/{dep}.json` (DGCL) | **C** | `chargerProjets()`, seulement dans l'onglet "Ce qui a été décidé" |
| `data/calendrier-senat.json` | **C** | `chargerCalendrierSenat()`, seulement dans l'onglet "Calendrier" |
| RNE brut (France entière), OFGL brut (France entière) | **D** | jamais servis au navigateur : `scripts/extract-html.js` les lit une fois au build et les découpe ; seule leur part par département existe côté client (catégorie B) |
| `noms-territoires.json`, métadonnées sources | **D** | fondues dans `index.json` au build, jamais redemandées séparément |

**Ce que cette répartition confirme** : aucune donnée volumineuse n'entre
dans le bundle initial (catégorie A ne contient que 16-22 Ko). C'est
exactement l'inverse de l'ancien site, où RNE et OFGL France entière (15,2 Mo
des 16,29 Mo) sont dans la catégorie A par construction — l'invariant 1
(fonctionner hors ligne) est tenu en embarquant tout, faute d'alternative
avant `mono/`.

## 7. Ce que cet audit NE permet PAS de conclure

- **"mono/ est prêt à remplacer le site actuel"** — faux : deux fonctions
  PARTIAL touchent directement des invariants du produit (comptes dept/région,
  fil éditorial), et une fonction est carrément ABSENTE et bloquante (mentions
  légales).
- **"mono/ est plus léger, donc supérieur"** — le poids est mesuré et réel
  (voir `PERFORMANCE_BASELINE.md`), mais un site plus léger qui ne peut pas
  légalement être publié n'est pas un candidat à la bascule en l'état.
- **Comparaison chiffrée d'accessibilité ancien/mono** — non faite : l'ancien
  site n'a pas été audité WCAG dans cette session (l'agent a listé les
  écrans, pas mesuré leur accessibilité). Ne pas présenter mono comme
  "plus accessible" sans cette mesure côté ancien.
