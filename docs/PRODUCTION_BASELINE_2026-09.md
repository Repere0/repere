# Repère — baseline de production, verrouillée avant toute nouvelle décision

*Écrit le 22 septembre 2026, ~14h00 UTC. Chaque ligne vient d'une commande
`gh`/`git` exécutée aujourd'hui (tracée ci-dessous), aucune n'est supposée.
Ce document est le point de comparaison de toute la Phase 2 — s'il devient
faux, il se corrige, il ne se remplace pas silencieusement.*

---

## 0. Conclusion d'abord : la prod N'EST PAS stabilisée

**Aucun run réel n'a encore validé le push d'aujourd'hui (`7c7ceac`).** Le
run le plus récent (voir §2) a été déclenché et exécuté avant que la
correction ne puisse être vue par le mécanisme de planification de GitHub —
pas après. La "première validation réelle post-push" annoncée dans
`PRODUCTION_RUNBOOK.md` reste devant nous, pas derrière.

## 1. Ce qui est réellement en ligne, maintenant

| | valeur | preuve |
|---|---|---|
| Dernier run avec un **succès réel** (build + banc + publication) | `f07ddba` — **26 août 2026, 01:32 UTC** | `gh run list --workflow=collecte.yml --limit 60 --json conclusion,...` filtré sur `conclusion=="success"` : 10 succès trouvés dans les 60 derniers runs, le plus récent est celui-ci |
| Retard du site public sur `origin/main` | **15 commits**, 27 jours | `git rev-list --count f07ddba..7c7ceac` = 15 |
| Poids du document HTML servi | **16 286 093 o décodés / ~6,02 Mo transférés** | mesuré aujourd'hui via `performance.getEntriesByType("navigation")` sur `repereapp.netlify.app/?verif=20260922b` (voir `PERFORMANCE_AUDIT_2026-09.md`) |
| `window.REPERE_CIRCOS`, `window.REPERE_*_URL` | **absents** (`undefined`) | même mesure — cohérent avec un déploiement antérieur à l'injection de ces blocs |
| Bandeau "Maquette", retrait "RÉEL"/phrase IA (correctif v9) | **pas encore visible en ligne** | ce correctif est le commit `7c7ceac` lui-même, jamais déployé |

**Le site public correspond au commit `f07ddba` (26/08/2026), pas à
`origin/main` (`7c7ceac`, 22/09/2026).** C'est la définition exacte du "17,3
Mo gelé depuis 27 jours" évoqué dans les sessions précédentes — cette fois
avec le commit exact et la date exacte, pas une fourchette.

## 2. Le run le plus récent — tracé ligne par ligne, pas résumé

| élément | valeur | commande |
|---|---|---|
| `databaseId` | `35715559562` | `gh run list --workflow=collecte.yml --limit 5 --json ...` |
| déclenché à (nominal, cron) | **05:47 UTC** | `cron: "47 5 * * *"` dans `.github/workflows/collecte.yml`, ligne 25 |
| `createdAt` réel | **10:21:51 UTC** — 4h34 plus tard | `gh run view 35715559562 --json createdAt` |
| `headSha` réellement fetché par le runner | `8ad19aec...` — commit du **13 septembre 2026** | log du run : `* [new ref] 8ad19aec343d34c4ae1167fa98251623721c8202 -> origin/main` |
| étape en échec | `Executer la chaine` | `gh run view --json jobs` → `steps[].conclusion=="failure"` |
| cause exacte | `AssertionError: le repli des mentions legales est introuvable` | `gh run view --job <id> --log`, ligne du traceback Python |
| conclusion | **failure** | idem |

**Ce que ça prouve, et ce que ça ne prouve pas** :

- Ça **prouve** que le run a échoué sur le bug déjà connu et déjà corrigé
  (`ancre_legal`), pas sur un bug nouveau. Cohérent, rien d'inquiétant en soi.
- Ça **prouve** que ce run n'a **jamais vu** le correctif d'aujourd'hui : son
  `headSha` (`8ad19aec`, 13/09) précède le push (`7c7ceac`, 22/09 09:13 UTC)
  de 9 jours et de 2 commits.
- **Pourquoi**, alors que le run s'est exécuté à 10h21 UTC — après le push de
  09h13 UTC ? Parce que pour un déclenchement `schedule`, GitHub fixe le
  commit associé au run **au moment où la condition cron est évaluée**
  (~05h47 UTC), pas au moment où le runner démarre réellement. Le push
  d'aujourd'hui (09h13 UTC) est arrivé **après** cette évaluation (05h47 UTC)
  — le run d'aujourd'hui ne pouvait donc pas le voir, quelle que soit l'heure
  à laquelle il s'est ensuite exécuté.

## 3. Anomalie mesurée, non demandée mais réelle : le décalage d'exécution

| date | cron nominal | `createdAt` réel | décalage |
|---|---|---|---|
| 22/09 | 05:47 UTC | 10:21:51 UTC | **+4h35** |
| 21/09 | 05:47 UTC | 11:08:16 UTC | **+5h21** |
| 20/09 | 05:47 UTC | 10:07:37 UTC | **+4h21** |
| 19/09 | 05:47 UTC | 09:44:35 UTC | **+3h58** |
| 18/09 | 05:47 UTC | 10:03:30 UTC | **+4h17** |

Source : `gh run list --workflow=collecte.yml --limit 15 --json createdAt,event`
filtré sur `event=="schedule"`.

**Constat, pas une hypothèse** : le décalage est stable, entre 4h et 5h20,
cinq jours de suite. Ce n'est pas un incident isolé — c'est un comportement
régulier de la file d'attente GitHub Actions pour ce dépôt (connu pour les
dépôts à faible activité : les événements `schedule` ne garantissent aucune
heure de démarrage, seulement une heure de déclenchement). **Conséquence
directe pour demain** : le run "de demain" nominalement à 05h47 UTC le
23/09/2026 démarrera très probablement entre 09h30 et 11h10 UTC. La
checklist de `PRODUCTION_RUNBOOK.md` doit être vérifiée à ce moment-là, pas
à 06h00.

**Bonne nouvelle pour la validation** : puisque `github.sha` est figé à
l'évaluation du cron (05h47 UTC) et que le push d'aujourd'hui (09h13 UTC) est
déjà en place depuis avant-hier soir dans ce référentiel temporel, le run de
demain à 05h47 UTC (23/09) évaluera `origin/main` bien après le push — sauf
nouveau push cette nuit, son `headSha` sera `7c7ceac`. C'est ce run,
peu importe l'heure à laquelle il démarre réellement, qui sera la première
vraie validation.

## 4. Sources, résultats, tailles — pour la baseline actuelle (pas encore pour le correctif)

| élément | valeur mesurée | date de mesure |
|---|---|---|
| taille du document HTML public | 16 286 093 o | 22/09/2026 (site actuel, commit `f07ddba`) |
| taille transférée (gzip) | 6 022 536 – 6 022 724 o | 22/09/2026, 3 mesures stables |
| fraîcheur `an_amo30` / `an_scrutins` | **STALE, 28 jours** | `outils/registre/rapport.mjs`, aujourd'hui |
| build local `mono/` (référence de comparaison) | 100 contrôles statiques + 56 navigateur, verts | 22/09/2026, exécuté localement |
| build local fichier autonome (`test_repere.mjs`) | 55 contrôles | historique — non ré-exécuté aujourd'hui sur le commit `7c7ceac` en isolation (fait dans le cadre de la fusion, voir commit `9b99181`) |
| état des tests du run CI le plus récent | **non atteint** — la chaîne s'est arrêtée avant l'étape banc (voir §2) | 22/09/2026 |

**Ce qui manque et reste `BLOQUÉ` jusqu'au run de demain** : la taille du
build, la taille du site publié, et l'état des tests **pour le contenu
produit par `7c7ceac`** — puisque ce contenu n'a encore jamais été construit
par la chaîne réelle (seulement simulé localement lors de la fusion).

## 5. URL

`https://repereapp.netlify.app/` — sert `f07ddba` (26/08/2026). Sera
re-vérifié avec un paramètre anti-cache neuf après le run de demain
(`?verif=20260923...`), pas avec l'ancien paramètre.

## 6. Anomalies connues, résumées

1. Site public 27 jours / 15 commits en retard sur `origin/main` (§1).
2. Run le plus récent : échec attendu, sur un commit qui précède le
   correctif — pas un nouveau problème (§2).
3. Décalage systématique de 4 à 5h20 entre le cron nominal et l'exécution
   réelle, cinq jours de suite (§3) — nouveau, non documenté avant
   aujourd'hui.
4. Le pipeline sur `main` construit toujours le HTML autonome
   (`build_pwa_reconstruit.py`), pas `mono/` — voir Phase 1/2 de cette
   mission, ne sera pas résolu par le run de demain même s'il réussit.
