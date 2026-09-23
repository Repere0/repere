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

Si le niveau 1 a été utilisé, ou si le problème doit être fermé pour de bon
avant que le cron du lendemain ne republie automatiquement :

```bash
git revert <commit-de-fusion-sur-main> --mainline 1
git push origin main
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
