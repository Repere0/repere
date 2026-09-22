# Repère — le pont vers mono/ : préparé, testé, PAS activé

*Écrit le 22 septembre 2026, mission phase 3.2. Ce document répond à une
question précise : « si on activait la bascule, qu'est-ce qui serait
réellement publié ? » — pas en théorie, en l'ayant construit et mesuré.
**Rien n'est publié par ce document. Rien n'est poussé vers `main`.***

---

## 1. Découverte préalable : le pont existe déjà, à moitié

Avant de construire quoi que ce soit, la cartographie du pipeline réel a
révélé un fait qui change le cadre de cette phase : **`outils/pipeline.sh`,
sur la branche de travail `audit-finalisation-repere`, construit déjà
`site_engendre` depuis `mono/` — pas depuis `build_pwa_reconstruit.py`.**

C'est le commit `b4737ff` (18/09/2026, message : *« pipeline : bascule
preparee vers mono/ pour la publication, PAS ENCORE ACTIVE »*), jamais
fusionné dans `main`. `origin/main` construit toujours l'ancien build
(vérifié aujourd'hui par lecture directe du blob distant — voir
`PRODUCTION_RUNBOOK.md`).

**Ce que ça change pour cette phase** : le travail n'est pas de *créer* le
pont, mais de **le valider pour la première fois de bout en bout**, de
fermer la dette de fraîcheur qu'il n'avait pas encore, et de documenter
avec quoi il n'a jamais été éprouvé (le runner GitHub réel, en particulier).

## 2. Le pipeline actuel, tracé — pas supposé

```
SOURCES OFFICIELLES (Assemblée nationale, RNE, OFGL, Sénat...)
        |  outils/collecte.py  (AN uniquement — agenda, organes, scrutins, circos)
        v  continue-on-error : une source indisponible n'arrete rien
data/*.zip, data/journal_collecte.json
        |  outils/pipeline.sh, 6 etapes, set -euo pipefail
        |    1. depiler les zips
        |    2. normaliser l'agenda AN (bloquant)
        |    3-3septies. decrire, circonscriptions, scrutins, projets, editorial
        |       (tous "avertit, ne bloque pas" — decision deja actee)
        |    4. verifier l'agenda ecrit (bloquant, assertions Python)
        |    5. RECONSTRUIRE LE SITE — voir §3, c'est le pont
        v    6. EPROUVER — deux bancs, voir §4
site_engendre/  (l'artefact — ce qui serait publie)
        |  (dans collecte.yml, hors pipeline.sh)
        v  netlify-cli deploy --dir=site_engendre --prod --no-build
repereapp.netlify.app
```

**Déclencheur** : `.github/workflows/collecte.yml`, cron `47 5 * * *` UTC +
`workflow_dispatch`. **`.github/workflows/` est protégé en écriture** :
toute la logique modifiable vit dans `outils/pipeline.sh`, exprès.

**Ce que ce document NE PEUT PAS vérifier depuis ce poste** : les étapes
1 à 4 sont en Python, et **aucun interpréteur Python n'est disponible sur
cette machine** (contrainte connue, §13 de `CONTEXTE_PROJET.md`). Ce
pipeline bridge document valide l'étape 5 (le pont lui-même) et l'étape 6
(le banc mono/), en réutilisant le fichier `app_repere_v18_20.html` déjà
présent sur disque comme substitut de "ce que les étapes 1-4 auraient
produit" — exactement ce que fait le vrai pipeline, sauf qu'il vient de le
regénérer juste avant.

## 3. Étape 5 — le pont lui-même, ligne par ligne

```bash
(
  cd mono
  corepack enable pnpm 2>/dev/null || true
  node scripts/extract-html.js "../$APP" ./data
  node scripts/calendrier-senat.mjs ./data || echo "::warning::..."
  pnpm install --frozen-lockfile
  pnpm build
)
cp -r mono/apps/web/dist site_engendre
```

Zéro appel à `build_pwa_reconstruit.py`. Le fichier autonome ($APP)
continue d'être construit et éprouvé par ailleurs, inchangé — deux
livrables distincts, l'un ne dépend pas de l'autre.

## 4. Carte ANCIEN → MONO, étape par étape

| étape | ancien build | mono/ | action |
|---|---|---|---|
| Collecte | `outils/collecte.py` (Python, AN uniquement) | **réutilisée telle quelle** — mono/ ne collecte rien lui-même | réutilisable, aucun risque nouveau |
| Données brutes | blocs `window.REPERE_*` dans `$APP` | **mêmes blocs, même fichier** — `extract-html.js` les lit | réutilisable |
| Transformation | `build_pwa_reconstruit.py` réécrit `$APP` en place | `extract-html.js` (Node) — lit `$APP`, écrit `mono/data/` | remplacée, testée aujourd'hui (117 statiques + 65 node:test) |
| Assemblage JS/CSS | inline dans le HTML transformé | `vite build`, code-splitting par écran | remplacée — c'est la source du gain de poids |
| Index/recherche | listes en dur dans le HTML | `index.json` + `communes-beta.json`, chargés à la demande | remplacée |
| Provenance | `rneMention()` par écran, dispersée | **ajouté aujourd'hui** : `index.json.build` (commit, date, santé des sources) | nouvelle capacité, absente des deux anciens builds |
| Build final | `site_engendre/` (copie du HTML transformé) | `mono/apps/web/dist` copié dans `site_engendre/` | même nom de dossier, même consommateur (Netlify) — **aucun changement requis côté publication** |
| Publication | `netlify-cli deploy --dir=site_engendre` | **identique, aucune ligne changée** | réutilisable à 100 % |
| Test avant publication | `test_repere.mjs` (55 contrôles, sur `$APP`) | `pnpm test` (mono, 120 contrôles inline + 65 node:test, sur `site_engendre`) | les deux tournent déjà, sur deux livrables différents — voir risque au §8 |

**Aucune étape n'a été remplacée par confort** : chaque changement correspond à un
problème mesuré (le poids, l'absence de fraîcheur, l'absence de santé des sources).

## 5. Shadow build — exécuté aujourd'hui, résultat réel

Commande exacte reproduite (voir §3), sans publication :

| mesure | valeur | preuve |
|---|---:|---|
| Fichiers dans `site_engendre` | 252 | `find site_engendre -type f \| wc -l` |
| Poids total (stockage Netlify, jamais téléchargé en un bloc) | 20 Mo | `du -sh site_engendre` |
| Banc mono/, exécuté **sur `site_engendre` lui-même** (pas seulement `dist`) | **120 contrôles inline + 65 node:test, 0 échec** | `node tests/runtime.test.mjs ../site_engendre` |
| Parcours réel (ouverture → Bagnolet → votes → argent → sources), gzip | **140,7 Ko** | `node tests/poids.mjs ../site_engendre` |
| Ratio vs production réelle (6,02 Mo) | **≈ 43×** | calcul |
| `index.json.build.commit_court` présent dans l'artefact | `f8995d7` (dernier commit au moment du build) | `cat site_engendre/data/index.json` |
| `index.json.build.sante` présent | `{elus:true, comptes:true, circonscriptions:true, deputes:true, scrutins:true, projets:false, evenements:true}` | idem |

**« projets: false » n'est pas une anomalie de ce build** : les projets
financés par l'État n'ont jamais été collectés pour de vrai en production
(trou n°1 déjà documenté). Le mécanisme de santé le dit maintenant dans
l'artefact lui-même, au lieu qu'il faille le savoir par ailleurs.

**Note d'environnement, honnête** : `corepack enable pnpm` échoue sur ce
poste Windows (`EPERM`, permissions), rattrapé par le `|| true` déjà écrit
dans le script — sans effet sur le résultat puisque `pnpm` est déjà
installé globalement ici. **Le comportement réel sur `ubuntu-latest` (le
runner GitHub) reste non vérifié** — c'est le risque déjà identifié dans le
commit `b4737ff` du 18/09, toujours vrai aujourd'hui.

## 6. Dette de fraîcheur — fermée, avec preuve par cassure

**Le défaut réel qui a motivé ce chantier** : trouvé en testant le portage
des élus le 22/09/2026 — un onglet avec un `index.json` déjà en cache
(posé avant l'ajout du champ `region_code`) continuait à l'utiliser
silencieusement. Rien ne comparait jamais la forme du cache à celle que le
code en cours attend.

**Mécanisme choisi, minimal** : `index.json` porte déjà un champ `v` (posé
par `extract-html.js`, jamais exploité jusqu'ici). `SCHEMA_ATTENDU`
(`packages/data-utils/src/client.js`) porte la même valeur, mais **figée
dans le code client** — donc dans le paquet JS construit à un instant
donné. `chargerIndex()` compare les deux ; en cas de divergence, le cache
entier (pas seulement l'index — un département mis en cache la même
semaine appartient à la même génération de schéma) est vidé, et
l'application repart au réseau.

**Deux concepts distincts, comme demandé** :
- `v` / `SCHEMA_ATTENDU` — gouverne l'invalidation du cache. Change
  **rarement**, seulement quand la FORME des données change, et **jamais
  automatiquement** (décision humaine).
- `build.commit` / `build.construit_le` — provenance informative. Change
  **tous les jours**, et ne doit **jamais** déclencher une invalidation —
  sinon la mise en cache perdrait tout son sens.

**Preuve par cassure du garde-fou** (`tests/runtime.test.mjs`) : un cache
falsifié à la main (`v: 999`, un faux département "ZZ" détectable) est posé
directement dans IndexedDB, la page est rechargée, et le contrôle vérifie
que (1) le faux département n'apparaît jamais à l'écran, (2) les vrais
départements s'affichent, (3) le cache est remplacé par un cache à jour —
pas seulement contourné.

## 7. Provenance du build

`index.json.build` = `{ commit, commit_court, construit_le, sante }`,
posé par `extract-html.js` via `git rev-parse HEAD` (jamais inventé — `null`
si git est indisponible, honnête plutôt que deviné). Répond à « qu'est-ce
qui a été réellement publié » sans enquête. **Rien de sensible** : un SHA
et une date sont déjà publics dans l'historique git ; aucun nom d'auteur,
aucun jeton, aucune adresse n'est capturé.

## 8. Health checks — trois classes, pas une seule

| classe | sources | comportement si absente |
|---|---|---|
| **CRITICAL** | élus (RNE), comptes (OFGL) | **le build échoue** (`process.exit(5)`) — sans elles, "Qui décide" et "Où va l'argent" seraient vides pour TOUTES les communes, pas seulement certaines |
| **IMPORTANT** | circonscriptions (CIRCOS) | avertissement fort, marqué dans `build.sante`, **le build continue** — la doctrine du vide déjà testée reste honnête |
| **OPTIONAL** | députés, scrutins, projets, événements | le build continue sans un mot de plus — chacun a déjà sa propre doctrine du vide à l'écran |

**Preuve par cassure, pas seulement la logique** : `tests/sante.test.mjs`
fabrique une copie du **vrai** fichier source, amputée d'une seule ligne
(le bloc OFGL), et vérifie que `node scripts/extract-html.js` **échoue
réellement** avec un code de sortie non nul — pas un avertissement de plus
dans un journal que personne ne relit.

## 9. Réversibilité — la procédure exacte

**Un seul commit est en cause** : `b4737ff` (18/09/2026), qui n'a modifié
QUE `outils/pipeline.sh`, uniquement l'étape "5. reconstruire le site" et
le libellé de l'étape "6. éprouver".

| pour... | faire exactement ceci |
|---|---|
| **Ne jamais activer** (état actuel) | Ne rien faire : `origin/main` n'a jamais reçu ce commit. `outils/build_pwa_reconstruit.py` existe toujours dans le dépôt, intact (dernier commit le 16/09, jamais supprimé) |
| **Revenir en arrière si `main` avait déjà reçu ce commit** | `git revert b4737ff` sur `main` — un seul commit, qui restaure l'appel à `build_pwa_reconstruit.py` et l'étape "5 bis" (copie de `site_donnees/`) à l'identique |
| **Vérifier que le retour marche** | Rejouer §5 de ce document avec l'ancien `outils/pipeline.sh` : `python3 outils/build_pwa_reconstruit.py "$APP" site site_engendre` doit reproduire un `site_engendre` que `node test_repere.mjs "$APP"` valide (55 contrôles) |
| **Temps estimé** | Quelques minutes : un `git revert`, une relecture du diff (72 lignes), un commit |

Le fichier autonome ($APP) n'est concerné par aucun des deux sens du
changement — il continue d'être construit et éprouvé exactement pareil,
avant, pendant et après une bascule ou un retour en arrière.

## 10. Risques restants, honnêtement listés

1. **Jamais exécuté sur le vrai runner `ubuntu-latest`** — `corepack
   enable pnpm`, `pnpm install --frozen-lockfile` en environnement CI
   propre, jamais confirmés. Testé seulement sur ce poste Windows, où pnpm
   est déjà installé globalement par un autre chemin.
2. **`collecte.yml` n'installe aucune dépendance Node pour mono/** au-delà
   de ce que `pipeline.sh` fait lui-même (`pnpm install` inline) — un
   changement de version de Node sur l'image `ubuntu-latest` pourrait
   casser cette étape sans avertissement préalable.
3. **Les deux bancs (fichier autonome, mono/) restent totalement
   indépendants** — une divergence entre les deux ne serait détectée que
   si l'un des deux échoue, jamais comparée explicitement entre eux.
4. **La provenance (`build.commit`) reflète le dernier commit, pas les
   changements non commités** qui ont produit le build — une propriété
   correcte, mais qui suppose de committer avant de publier, pas après.
5. **Poids de `site_engendre` en stockage (20 Mo)**, à ne pas confondre
   avec le poids réellement transféré à un visiteur (140,7 Ko) — Netlify
   héberge le tout, personne ne le télécharge en un bloc, mais le mélange
   des deux chiffres dans une future annonce serait trompeur.
