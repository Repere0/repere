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
