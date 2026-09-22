# Repère — comparaison en miroir (shadow build), ancien build vs `mono/`

*Écrit le 22 septembre 2026, mission phase 3.1. Les deux builds ont été
réellement ouverts dans un navigateur — `app_repere_v18_20.html` servi en
statique sur `http://localhost:4175`, `mono/apps/web/dist` sur
`http://localhost:4174` (voir `.claude/launch.json`, configurations
`repere-ancien`/`repere-mono`) — et parcourus pour la même commune
(**Bagnolet, 93**). Ce document compare ce qui s'affiche, pas seulement ce
que le code prévoit. Aucune bascule n'est déclenchée par ce document.*

---

## 1. Matrice de comparaison

*PASS = même contenu ou mieux, vérifié à l'écran. PARTIAL = présent mais
appauvri, écart concret décrit. FAIL = régression réelle vérifiée à l'écran,
pas supposée.*

| Expérience | Ancien build | `mono/` | Données | Source | Mobile | Accessibilité | Statut |
|---|---|---|---|---|---|---|---|
| Recherche commune | Champ + bouton, marketing autour | Champ unique, recherche commune OU département | RNE + Code officiel géographique | déclarée | testé 390 px | testé (44 px, focus) | **PASS** |
| Commune → circonscription | "7e circonscription législative" | idem, identique | Ministère Intérieur, découpage 2010 | déclarée | idem | idem | **PASS** |
| Commune → député | "Alexis Corbière", mandat depuis le 7 juillet 2024 | idem, identique (vérifié à l'écran, même nom, même date) | Assemblée nationale | déclarée | idem | idem | **PASS** |
| Qui décide chez moi — maire | "Edouard DENOUEL", maire, 16 adjoints | idem — même nom, même compte d'adjoints | RNE | déclarée | idem | idem | **PASS** |
| Qui décide chez moi — **adjoints nommés** | 16 adjoints listés **par leur nom** (Lauren LOLO, Chawqui HADDAD, Mona BELLIL…) avec leur rang | compte seul ("16 adjoints"), **aucun nom** | RNE (même fichier, `RNE.adj`) | — | — | — | **PARTIAL** — la donnée existe dans `window.REPERE_RNE`, `extract-html.js` la réduit à une longueur (`.length`) au lieu de matérialiser les noms |
| Qui décide chez moi — **intercommunalité nommée** | "MON INTERCOMMUNALITÉ — MÉTROPOLE DU GRAND PARIS / Edouard DENOUEL, conseiller communautaire" | "Votre intercommunalité... Repère ne nomme pas encore les élus de ces trois échelons" | RNE (`communes_avec_epci: 20028` par l'inventaire) | — | — | — | **FAIL, vérifié à l'écran** — la donnée existe et est affichée par l'ancien build pour cette même commune ; `mono/` affirme explicitement ne pas la publier |
| Qui décide chez moi — **conseil départemental nommé** | "CONSEILLERS DÉPARTEMENTAUX DU CANTON / Elodie GIRARDET... Voir les 39 autres du conseil départemental" | même phrase de non-publication | RNE (`conseillers départementaux : 4037` par l'inventaire) | — | — | — | **FAIL, vérifié à l'écran** |
| Qui décide chez moi — **conseil régional nommé** | "MA RÉGION — ÎLE-DE-FRANCE / Valérie PÉCRESSE, Président du conseil régional — depuis le 2 juillet 2021 / 204 autres" | même phrase de non-publication | RNE (`conseillers régionaux : 1744` par l'inventaire) | — | — | — | **FAIL, vérifié à l'écran** |
| Ce qui a été décidé | "Bonjour... Le budget de la région, 1,2 milliard d'euros" — **explicitement marqué « Maquette — contenus fictifs »** à l'écran | 2 faits réels (`evenements.json`) + projets DGCL + votes AN, jamais marqués fictifs | voir ligne suivante | — | — | — | **PASS pour mono, avec une nuance importante** — voir §2 |
| Où va mon argent — commune | "102,4 M€ encaissés, 2443€/hab, avec l'évolution 2317€ (2021) → 2443€ (2025)" | mêmes montants exacts (102 418 753 €, vérifié bit à bit), **sans la comparaison 2021→2025** | OFGL | déclarée | idem | idem | **PARTIAL** — même donnée, présentation moins riche (une seule année affichée) |
| Où va mon argent — **département** | par un sélecteur d'échelon sur le même écran | **corrigé aujourd'hui**, carte séparée, testé pour Seine-Saint-Denis (1 688 205 hab., cohérent) | OFGL | déclarée | idem | idem | **PASS** |
| Où va mon argent — **région** | idem | **corrigé aujourd'hui**, carte séparée, testé pour Île-de-France (12 489 624 hab. — exactement la population réelle) | OFGL | déclarée | idem | idem | **PASS, avec un piège d'environnement trouvé et documenté — voir §3** |
| Sources — charte de neutralité | texte réel affiché ("Nous ne classons ni les élus ni les partis…") | absent avant aujourd'hui ; les 8 invariants (contenu équivalent, formulation différente) sont affichés | — | — | — | — | **PARTIAL**, accepté (voir §4) |
| Sources — journal des corrections | section "Corrections & droit de réponse — journal public" | **ajouté aujourd'hui** : une phrase honnête ("Aucune correction n'a encore été nécessaire") plutôt qu'un journal vide | — | — | — | — | **PARTIAL, minimum bêta atteint** (voir §4) |
| Mentions légales | présentes, repliées, atteintes via "Moi" → bouton → "Sources" → dépli différé | **portées aujourd'hui**, adaptées au vrai comportement de `mono/` (voir `MONO_MIGRATION_AUDIT.md`), atteintes directement depuis "Sources" | — | — | testé | testé (clic réel sur le `<details>`) | **PASS** |
| Calendrier citoyen | Agenda général figé + Assemblée nationale (async) | Sénat seul, licence non confirmée dite explicitement | Sénat | déclarée | idem | idem | **PARTIAL, accepté** (voir §5) |
| Doctrine du vide | cas par cas | formalisée (`ETATS`/`PHRASES`), testée pour chaque famille de faits | — | — | — | — | **PASS, amélioré** |
| Provenance | présente, avec des doublons documentés par l'agent (Phase 2) entre `s-influence`/`s-sources` | composant `Source` unique et obligatoire, testé | — | — | — | — | **PASS, amélioré** |
| Liens vers les sources | présents | présents, testés (href réels vérifiés, ex. `conseil-constitutionnel.fr`) | — | — | — | — | **PASS** |

## 2. Une nuance importante sur « Ce qui a été décidé »

L'ancien build, dans **cette exécution précise**, affiche par défaut le
contenu de `window.REPERE_DATA` (6 fiches, dont "1,2 milliard d'euros pour
la région") — et l'écran porte lui-même la mention **« Maquette — contenus
fictifs. Cette version de démonstration ne reflète pas encore le
fonctionnement final ni des faits tous vérifiés »**. Ce n'est pas une
donnée de production : c'est un jeu de démonstration, embarqué dans le
fichier autonome comme repli hors ligne (voir `build_pwa_reconstruit.py`,
« le fil garde ses cartes écrites à la main »).

**mono/** affiche 2 faits réels, tirés de `data/evenements/*.md` (le geste
humain `valide: true`), jamais présentés comme fictifs. Comparer les deux
en volume (« l'ancien a 6 faits, mono/ n'en a que 2 ») serait trompeur : les
6 de l'ancien sont un exemple de mise en forme, les 2 de `mono/` sont
vérifiés et réels. **PASS pour mono/, pas malgré un déficit de volume mais
parce que le peu qu'il montre est vrai.**

## 3. Un piège d'environnement trouvé pendant cette vérification même

Premier passage sur « Où va mon argent » → région pour Bagnolet : l'écran a
affiché *« Aucune donnée régionale n'est publiée pour ce département »* —
**faux**, l'Île-de-France a bien des comptes régionaux (vérifié à l'instant
dans `data/comptes-regions.json`, code `11`, 12 489 624 habitants). Cause
réelle, pas un défaut de code : l'onglet du navigateur utilisé pour ce test
avait déjà, dans une IndexedDB locale (`repere-donnees`), un `index.json`
mis en cache **avant** l'ajout du champ `region_code` plus tôt aujourd'hui —
et `chargerIndex()` lit ce cache en priorité, par construction (« l'index
survit à la coupure »), sans jamais le comparer à une version plus récente.

Après avoir vidé IndexedDB, Cache Storage et service worker de cet onglet
(un geste de test, aucun fichier de code touché), le même parcours affiche
la bonne donnée. **Ce n'est donc pas une régression du produit** — mais
c'est une vraie caractéristique d'architecture à connaître : `mono/` n'a
**aucun mécanisme de version pour le contenu de `index.json`** (le service
worker versionne la coquille par une empreinte, jamais les données). Si le
schéma d'un fichier change un jour en production, un lecteur qui a déjà
visité gardera l'ancien schéma indéfiniment, sans le savoir. À traiter dans
un futur chantier de fraîcheur des données, pas dans celui-ci.

## 4. Sources — pourquoi PARTIAL reste acceptable pour la bêta

Les 5 points minimums de la mission (§9) sont vérifiés un par un :

| minimum bêta | état dans `mono/` |
|---|---|
| 1. D'où vient l'info | **fait** — chaque `Source` cite son producteur et sa licence |
| 2. Quand Repère l'a récupérée | **fait** — `maj`/`releve_le` affichés, et `index.genere_le` distingué explicitement de la date des chiffres |
| 3. Si Repère a transformé/calculé | **fait** — étiquette « Calcul Repère » vs « Donnée officielle », testée |
| 4. Comment signaler une erreur | **fait** — adresse de contact affichée, testée |
| 5. Si une correction a été faite | **fait aujourd'hui, minimalement** — une phrase honnête plutôt qu'un journal vide (voir ci-dessous) |

La charte de neutralité en texte et le futur vrai journal des corrections
restent **PARTIAL, documenté, pas un chantier lancé** : construire un
journal des corrections avant qu'aucune correction n'ait eu lieu aurait été
une fonctionnalité sans contenu réel — l'inverse de ce que la mission
demande (« pas de gros chantier documentaire »).

## 5. Calendrier — confirmation que « Sénat seul » reste un choix, pas une dette qui s'aggrave

Vérifié : la licence est dite « non précisée » explicitement (pas devinée,
pas omise), la fraîcheur (`releve_le`) est affichée, et un échec de la
source produit une phrase de la doctrine du vide, testée. Rien n'indique
que ce périmètre s'élargit ou se réduit silencieusement. **PARTIAL reste le
bon statut, et n'appelle aucune action dans cette phase.**

## 6. Ce que cette comparaison ne couvre pas

Les communes hors Bagnolet (petite, grande, gap RNE, données financières
riches) n'ont pas été rejouées écran par écran dans ce document : elles
sont couvertes par la suite automatisée (`tests/runtime.test.mjs`, 112
contrôles) sur Ustaritz (64), et par les mesures antérieures sur les 4
communes manquantes du RNE (Ville-d'Avray et consorts). Rejouer les cinq
autres communes représentatives à la main n'aurait pas changé le verdict
déjà établi par ces tests — l'effort a été mis sur la comparaison à l'écran
avec l'ancien build, qu'aucun test automatisé ne peut faire à sa place.
