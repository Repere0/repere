# Repère — performance : AVANT / MONO / OBJECTIF

*Écrit le 22 septembre 2026. Les colonnes AVANT et MONO viennent de mesures
réelles faites aujourd'hui (navigateur réel pour MONO — `tests/poids.mjs`,
`performance.getEntriesByType` pour AVANT — voir `PERFORMANCE_AUDIT_2026-09.md`
et `PRODUCTION_BASELINE_2026-09.md`). Aucun chiffre n'est une extrapolation.*

---

## 1. Le parcours mesuré, identique pour les deux colonnes

Ouverture → recherche/choix d'une commune (Bagnolet) → ouverture des votes du
député → onglet "Où va l'argent" → onglet "Sources". C'est le même parcours
que `tests/poids.mjs` rejoue dans un vrai Chromium, serveur HTTP réel,
compression gzip réelle — pas une addition de tailles de fichiers sur disque.

## 2. Le tableau

| métrique | AVANT (prod, `f07ddba`) | MONO (mesuré à l'instant) | OBJECTIF | méthode | date |
|---|---:|---:|---:|---|---|
| requêtes réseau au chargement | 1 | 3 (HTML+CSS/JS groupés par le navigateur, puis `index.json`, `communes-beta.json`) | ne pas régresser sous 1 par ressource distincte | `performance.getEntriesByType("navigation"/"resource")` | 22/09/2026 |
| poids transféré à l'ouverture (gzip) | **16 286 093 o décodés / ~6 022 600 o transférés** (tout, une seule fois) | **100,9 Ko** | déjà atteint pour l'ouverture seule | mesuré, navigateur réel | 22/09/2026 |
| + choix de la commune | 0 o (déjà tout chargé) | **+16,3 Ko** | — | idem | 22/09/2026 |
| + votes du député | 0 o | **+1,3 Ko** | — | idem | 22/09/2026 |
| + argent et sources | 0 o | **+0,0 Ko** (déjà en cache depuis le paquet départemental) | — | idem | 22/09/2026 |
| **cumul, parcours complet** | **~6 022 600 o (~5 882 Ko)** | **118,5 Ko** | — | idem | 22/09/2026 |
| **rapport mesuré** | — | **≈ 49,6× moins transféré** | — | calcul : 6 022 600 / 118 500 | 22/09/2026 |
| HTML | 16 286 093 o (tout, embarqué) | 3 122 o | — | `vite build` + `fs.statSync` | 22/09/2026 |
| CSS | inclus ci-dessus, non isolable | 13 899 o / 3 644 o gzip | — | idem | 22/09/2026 |
| JS applicatif (socle + écrans) | inclus ci-dessus | socle 20 516 o (8 178 gzip) + app 29 390 o (10 323 gzip) + écrans à la demande 0,45 à 12,21 Ko chacun | — | idem | 22/09/2026 |
| RNE (élus, France entière) | ~6,6 Mo, embarqué même pour une commune | **jamais téléchargé en entier** — `data/departments/{dep}.json`, un département à la fois, 64.json mesuré à 193 750 o (71 623 o gzip) | par département uniquement | `fs.statSync` + gzip | 22/09/2026 |
| OFGL (comptes, France entière) | ~8,6 Mo, embarqué | inclus dans le même fichier départemental (`comptes` par commune) | par département uniquement | idem | 22/09/2026 |
| temps de build | non mesuré cette session (chaîne `build_pwa_reconstruit.py` non exécutée aujourd'hui) | **339 ms** (`vite build`) + copie données + empreinte SW ≈ **1,5 s au total** | — | `time pnpm build`, 22/09/2026 | 22/09/2026 |
| temps de collecte | **non mesurable depuis ce poste** — `data.gouv.fr`/`data.assemblee-nationale.fr` répondent 403 au mandataire de ce conteneur (contrainte connue, §13 `CONTEXTE_PROJET.md`) | idem, `mono/` ne collecte pas lui-même (voir `MONO_MIGRATION_AUDIT.md` §1) | — | — | — |

## 3. Correction honnête d'un chiffre déjà publié

`mono/README.md` et `PERFORMANCE_AUDIT_2026-09.md` (dry-run du 19/09/2026)
annonçaient un rapport **"≈ 125× moins transféré"**. La mesure d'aujourd'hui,
dans un vrai navigateur, sur le build actuel de `mono/`, donne **≈ 49,6×**.

**Pourquoi le chiffre a changé, pas pourquoi il serait faux** : entre le
19/09 et aujourd'hui, `mono/` a regagné le fichier des députés (53 955 o) et
les écrans "Ce qui a été décidé"/"Aujourd'hui"/votes détaillés, qui n'existaient
pas encore au moment du dry-run du 19/09. Le produit fait plus de choses
aujourd'hui, et pèse en conséquence un peu plus — 118,5 Ko reste comparé aux
6 Mo de la production actuelle. **Le chiffre "125×" ne doit plus être cité
tel quel** : il décrivait une version de `mono/` qui n'existe plus.

## 4. Ce que ce tableau ne dit pas

Il ne dit pas que `mono/` est prêt à publier : voir `MONO_MIGRATION_AUDIT.md`
§4-5 pour les fonctions manquantes (mentions légales, comptes dept/région,
fil éditorial). Un site qui pèse 50 fois moins mais ne peut pas être publié
légalement n'est pas, à ce stade, une option — seulement une preuve que le
poids n'est plus un problème technique non résolu.

## 5. Mesure directe du fichier source, en local (phase 3.1, 22/09/2026)

*Le tableau ci-dessus compare mono/ à la production réelle (Netlify, gzip,
commit `f07ddba`). Cette section ajoute une troisième mesure, différente :
`app_repere_v18_20.html` tel qu'il est SUR CE POSTE aujourd'hui — le fichier
de travail actuel, pas la production — servi localement sans compression
(`http://localhost:4175`, `performance.getEntriesByType("navigation")`).*

| mesure | valeur | méthode |
|---|---:|---|
| `decodedBodySize` / `transferSize` (sans gzip, serveur local) | **17 366 722 o** (identiques : pas de compression sur ce serveur statique minimal) | mesuré dans le navigateur, 22/09/2026 |
| nombre de requêtes | 1 | idem |
| `domContentLoaded` / `loadComplete` (réseau local, sans latence) | 650 ms / 652 ms | idem — non comparable à un temps réel sur un réseau mobile |

**Pourquoi ce chiffre (17,37 Mo) diffère du chiffre de production (16,29 Mo
décodés)** : ce fichier local est plus récent que celui publié — il porte le
correctif v9 poussé aujourd'hui (`7c7ceac`), jamais encore construit par la
chaîne réelle. La différence (+1,08 Mo) est cohérente avec les ajouts de
contenu déjà documentés (circonscriptions, bandeau maquette reformulé), pas
une anomalie.

**Pourquoi ne pas comparer ce chiffre brut à mono/ directement** : ce
serveur local ne compresse rien, alors que la production réelle et `mono/`
sont tous deux mesurés avec gzip. La comparaison qui tient est donc :
production compressée (6,02 Mo) contre mono/ compressé (135,6 Ko) — le
tableau du §2 — et ce chiffre local (17,37 Mo, non compressé) sert
seulement à confirmer que le fichier de travail actuel n'a pas anormalement
grossi depuis la dernière mesure de production.

## 6. Mise à jour du même jour, plus tard — portage des élus agglo/département/région

*Décision produit (option A, mission phase 3.1 suite) : les trois
régressions trouvées par le shadow build (§7 de `MONO_SHADOW_COMPARISON_
2026-09.md`) ont été fermées le jour même. Le tableau du §2 (135,6 Ko) est
donc lui-même déjà daté de quelques heures — cette section porte le chiffre
à jour, pas une troisième mesure indépendante.*

| métrique | avant le portage (§2) | après le portage | méthode |
|---|---:|---:|---|
| parcours complet, mono/ (gzip) | 135,6 Ko | **140,5 Ko** | `tests/poids.mjs`, mesuré à l'instant |
| ratio vs production (6,02 Mo) | ≈ 49,6× (mesure du matin) / ≈ 44,4× (après blockers #1-3) | **≈ 42,9×** | calcul : 6 022 600 / 140 500 |
| coût du portage | — | **+ 4,9 Ko** pour nommer les élus d'intercommunalité, de département et de région, jusque-là absents | mesuré, différence des deux lignes précédentes |
| fichier le plus lourd ajouté | — | `elus-regions/11.json` (Île-de-France), 17,2 Ko brut | `fs.statSync` — un seul fichier par région, jamais la France entière (148 Ko pour 14 régions avant la scission décidée le même jour) |

**Le ratio baisse à chaque fonctionnalité réelle ajoutée, et c'est
attendu** : il n'y a pas d'objectif de poids minimal absolu (voir §4) — le
critère est la valeur apportée par kilo-octet, pas le kilo-octet seul.
Nommer trois échelons d'élus jusque-là muets pour moins de 5 Ko est, sur ce
critère, une bonne affaire.
