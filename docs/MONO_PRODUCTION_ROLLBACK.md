# Rollback — bascule production vers mono/

*Écrit le 23/09/2026, avant la fusion de `release/mono-production`. Un plan de
retour en arrière se prépare avant l'incident, jamais pendant.*

---

## Le principe

Cette bascule change **une chose** : `outils/pipeline.sh` reconstruit
`site_engendre` depuis `mono/` au lieu de `outils/build_pwa_reconstruit.py`.
Rien d'autre ne change dans la chaîne : `.github/workflows/collecte.yml` reste
identique, le déclenchement reste identique, la destination Netlify reste
identique. **Revenir en arrière, c'est donc revenir à un seul fichier.**

`outils/build_pwa_reconstruit.py` n'est ni supprimé, ni modifié, ni déplacé.
Il reste dans le dépôt, intact, capable de reconstruire le fichier autonome à
tout moment.

## Deux niveaux de rollback, du plus rapide au plus durable

### Niveau 1 — immédiat, sans toucher au dépôt (quelques secondes)

Si la publication vient d'avoir lieu et sert quelque chose de cassé :

1. Netlify garde l'historique de chaque déploiement (`netlify-cli deploy
   --prod` en crée un nouveau à chaque fois, sans écraser les précédents).
2. Dans l'interface Netlify du site (`repereapp.netlify.app`) → **Deploys** →
   choisir le déploiement précédent (celui qui servait encore le fichier
   autonome) → **Publish deploy**.
3. Effet : le site public revient à l'état d'avant la bascule, immédiatement,
   sans attendre un nouveau run de `collecte.yml`.

C'est le niveau à utiliser en premier si quelque chose est visiblement cassé
en ligne.

### Niveau 2 — durable, dans le dépôt (revert du commit de bascule)

**EXERCE POUR DE VRAI le 23/09/2026, sur une branche locale jamais poussée**
(`_exercice-rollback`, depuis `origin/main`) — voir §« Exercice réel » plus
bas pour ce que cette mise en pratique a changé ci-dessous, par rapport à
ce qui était juste écrit avant de l'essayer.

Si le niveau 1 a été utilisé, ou si le problème doit être fermé pour de bon
avant que le cron du lendemain ne republie automatiquement :

```bash
# Dans cet ordre exact : le plus RECENT d'abord. Chaque commit qui a
# touche mono/ APRES la bascule (les correctifs de code inconnu, etc.)
# doit etre defait avant le commit de bascule lui-meme, sinon le revert
# de ce dernier tombe en conflit "modify/delete" sur les fichiers que ces
# correctifs ont modifies depuis.
git revert --mainline 1 <commit-le-plus-recent-qui-touche-mono>
git revert --mainline 1 <...autres commits mono, du plus recent au plus ancien...>
git revert --mainline 1 <commit-de-fusion-de-la-bascule-elle-meme>
git push origin main
```

**Des conflits sont probables sur les fichiers de données statiques que la
collecte quotidienne rafraîchit** (`mono/scripts/deputes.json`,
`scrutins.json`, `noms-communes.json`) : chaque run les modifie, le revert
veut les supprimer. La résolution est toujours la même — accepter la
suppression, puisque le but est de revenir à un monde où `mono/` n'existe
pas encore :

```bash
git rm mono/scripts/deputes.json mono/scripts/noms-communes.json mono/scripts/scrutins.json
git revert --continue
```

Effet : `outils/pipeline.sh` retrouve son appel à
`outils/build_pwa_reconstruit.py`. Le run de `collecte.yml` suivant (cron ou
`workflow_dispatch`) reconstruit et republie le fichier autonome, exactement
comme avant cette PR. Aucune donnée n'est perdue : les fichiers ajoutés
(`mono/`, les scripts de pont) restent dans l'historique, prêts à être
repris.

**Ce que ce revert ne touche pas**, et c'est voulu : `outils/gardes/*`
(protection de main) et le correctif de `pousser.bat` restent en place même
après un revert de la bascule — ce sont des garde-fous indépendants, pas une
partie du risque à annuler.

## Ce qui ne doit jamais arriver

- Ne jamais faire les deux niveaux dans le mauvais ordre : un rollback Netlify
  (niveau 1) sans revert (niveau 2) tient jusqu'au prochain run de
  `collecte.yml`, qui republierait mono/ de nouveau — le niveau 1 est un
  pansement, pas une décision.
- Ne jamais supprimer `outils/build_pwa_reconstruit.py`, `site/` (référence)
  ou `test_repere.mjs` avant que mono/ n'ait tenu en production plusieurs
  jours. Cette PR ne les touche pas ; aucune PR future ne devrait le faire
  tant que ce délai n'est pas écoulé.

## Ce qui déclenche un rollback (critères, pas une impression)

- Le smoke test de production (`node mono/scripts/smoke-prod.mjs
  https://repereapp.netlify.app`) échoue sur un contrôle qui n'échouait pas
  avant.
- `data/index.json` absent ou `build.sante` montre une source CRITIQUE
  (`elus`, `comptes`) à `false`.
- Poids transféré au premier écran mesuré au-delà de 400 Ko (dix fois la
  mesure attendue) — signe que le mauvais artefact est servi.
- Une erreur JavaScript critique visible sur le parcours principal, absente
  du run CI qui a validé l'artefact.

## Exercice réel, le 23/09/2026 — A → B → problème simulé → retour A → B restauré

*Ce paragraphe existe parce qu'un plan de rollback qui n'a jamais tourné
n'est qu'une hypothèse. Celui-ci a tourné, sur une branche locale
`_exercice-rollback` créée depuis `origin/main`, jamais poussée — `main`
n'a **jamais bougé** pendant tout l'exercice (vérifié par `git log
origin/main` avant et après : même SHA `0151ad0`).*

**Chronologie mesurée, pas estimée :**
- T0 (14:47:03 UTC) : état B confirmé (`pipeline.sh` appelle bien `mono/`).
- Tentative naïve : `git revert -m 1 96b3e7a` seul → **échec immédiat**,
  conflits sur `mono/scripts/extract-html.js` et trois fichiers de données.
  Abandonné proprement (`git revert --abort`), retour à l'état B sans trace.
- Ordre correct trouvé et appliqué : revert de `ca3cbc4`, puis `f2f7007`,
  puis `96b3e7a` — du plus récent au plus ancien. Les deux premiers
  s'appliquent sans conflit. Le troisième conflit encore, mais seulement
  sur 3 fichiers (`deputes.json`, `noms-communes.json`, `scrutins.json` —
  les données statiques que la collecte quotidienne rafraîchit), résolus
  en acceptant leur suppression.
- T1 (14:48:42 UTC) : état A confirmé restauré (`pipeline.sh` appelle de
  nouveau `outils/build_pwa_reconstruit.py`).

**Durée totale des opérations git (3 reverts + résolution) : environ 90
secondes.** Le temps de diagnostic humain (comprendre pourquoi le premier
essai a échoué, trouver le bon ordre) a pris plus longtemps que
l'opération elle-même — c'est justement ce que cet exercice devait
révéler avant un vrai incident, pas pendant.

**Découverte réelle, pas anticipée à l'écriture de ce document : le
revert simple à un seul commit ne suffit plus.** Deux correctifs
(`f2f7007`, `ca3cbc4`) ont été fusionnés sur `main` après la bascule,
tous les deux à l'intérieur de `mono/`. Le document initial ci-dessus
(niveau 2) supposait un seul commit à défaire ; l'exercice a prouvé qu'il
en fallait trois, dans un ordre précis. **Ce nombre grandira à chaque
nouveau correctif fusionné dans `mono/`** — ce paragraphe devra être
réécrit la prochaine fois que quelqu'un exerce vraiment ce rollback,
jamais deviné à l'avance.

**Deuxième découverte, plus sérieuse : `outils/gardes/*` (les crochets
git qui protègent `main`) et le correctif de `pousser.bat` disparaissent
avec le revert.** Ils avaient été ajoutés DANS le commit de bascule
`96b3e7a`, parce que `mono/tests/invariants.test.mjs` les exigeait déjà à
ce moment — un couplage qui avait du sens en écrivant la PR, mais qui
signifie aujourd'hui qu'annuler la bascule (une opération censée réduire
le risque) retire aussi, silencieusement, une protection de `main` qui
n'a rien à voir avec `mono/`. **Recommandation issue de cet exercice, pas
exécutée ici (changer `main` sans y être invité n'est pas dans le mandat
de cet exercice) : sortir `outils/gardes/*` et le correctif de
`pousser.bat` dans leur propre petit commit, indépendant de tout ce qui
touche à `mono/`, pour qu'un futur rollback de la bascule ne les emporte
plus avec elle.**
