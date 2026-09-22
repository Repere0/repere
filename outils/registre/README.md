# Le registre des sources — doctrine data

Posé le 22 septembre 2026. Objectif : cesser de fonctionner en « une fonctionnalité
→ une source » pour savoir, à tout moment, ce que Repère sait réellement, depuis
quand, et ce qu'il ne sait pas encore.

## Pourquoi en Node, alors que `outils/` est Python partout ailleurs

Ce poste de développement n'a **aucun Python installé** (vérifié : `python`,
`python3`, `py` sont absents, en Bash comme en PowerShell). Une règle du projet
compte plus que la convention de langage : ne jamais écrire un contrôle qu'on n'a
pas vu tourner. Un script Python écrit ici serait resté invisible jusqu'au premier
run sur le runner GitHub — exactement le défaut que ce chantier est chargé de
détecter chez les *autres* sources. Node est déjà présent sur `ubuntu-latest` (le
runner l'embarque, comme le documente `collecte.yml`) et c'est ce que ce poste peut
exécuter et vérifier réellement, tout de suite. Si Python redevient disponible ici,
rien n'empêche une réécriture — mais pas avant de pouvoir la tester.

## Ce qui existe déjà, et que ce chantier ne refait pas

- `outils/collecte.py` porte déjà un embryon de registre (`SOURCES`,
  `SOURCES_LOURDES`) et un journal de collecte (`data/journal_collecte.json`)
  pour les flux de l'Assemblée nationale. Ce registre-ci ne le remplace pas : il
  couvre l'ensemble des sources (RNE, OFGL, DGCL, Sénat, circonscriptions...),
  y compris celles que `collecte.py` ne connaît pas.
- La doctrine du vide, les invariants, les gardes de test — inchangés.

## Les fichiers

| fichier | rôle | entrée | sortie |
|---|---|---|---|
| `sources.json` | le registre lui-même : une entrée par source, machine-readable | — | — |
| `verifier_sources.mjs` | sonde chaque source (HEAD, jamais un téléchargement complet) | `sources.json` | `data/journal_sante_sources.json` |
| `couverture.mjs` | mesure la couverture IDF réelle à partir de ce qui est déjà extrait | `mono/data/` | `data/couverture_territoriale.json` |
| `rapport.mjs` | assemble les deux en un rapport lisible | les deux fichiers ci-dessus | `data/rapport_couverture.json` + `.md` |
| `tests.test.mjs` | tests déterministes, fixtures locales, aucun réseau | `fixtures/` | — |

## Le cycle d'une source candidate

```
DISCOVERED → VERIFIED → COLLECTED → NORMALIZED → READY_FOR_PRODUCT
```

Les sources déjà actives dans le produit sont à `READY_FOR_PRODUCT` dans
`sources.json`. Les candidates repérées mais non encore intégrées vivent dans
`candidates_non_integres`, chacune avec la date de sa dernière vérification —
jamais silencieusement supposée toujours vraie.

## Ce que le registre distingue, et qu'il ne faut jamais confondre (objectif 4)

- `derniere_maj_connue` : ce que la source annonce (ou le dernier `Last-Modified`
  mesuré).
- `derniere_collecte_repere` : la dernière fois que Repère a réellement récupéré
  cette source.

Un écart entre les deux n'est pas une anomalie en soi (une source annuelle n'a pas
besoin d'une collecte quotidienne) — mais `verifier_sources.mjs` le signale
explicitement pour les sources à cadence quotidienne, parce que c'est exactement le
défaut qui a fait tourner l'Assemblée nationale à vide pendant 27 jours (voir le
livrable de cette session, section A).

## Ce que le registre refuse de faire (objectif 10)

Aucun champ de `sources.json` ou de `rapport_couverture.*` ne compare deux
territoires entre eux. Les taux de couverture mesurent la complétude des données
de Repère, jamais une note donnée à une commune. Le champ `couverture_observee`
d'une source dit « Repère a X sur Y attendues », jamais « la commune Z est moins
bien couverte que la commune W ».

## Lancer

```bash
node outils/registre/verifier_sources.mjs
node outils/registre/couverture.mjs
node outils/registre/rapport.mjs
node --test outils/registre/tests.test.mjs
```

Le prototype GitHub Actions (non activé) est dans
`docs/data_watcher_workflow_v1.yml.txt`.
