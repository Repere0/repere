# Netlify — pourquoi la publication échoue (21 octobre 2026)

Investigation sans aucune modification de configuration et sans dépense.
**Faits vérifiés** et **hypothèses** sont séparés, volontairement.

---

## Faits vérifiés

**1. La publication échoue réellement.** Ce n'est pas un artefact d'affichage.

L'API des runs annonce `conclusion: success` pour l'étape « Publier sur
Netlify », ce qui est trompeur : l'étape porte `continue-on-error: true`, qui
force `conclusion` à `success` tout en gardant `outcome: failure`. La preuve que
l'`outcome` vaut bien `failure` est que l'étape 13 s'est exécutée, et sa
condition est exactement :

```yaml
- name: Mettre le job au rouge si quelque chose a echoue
  if: steps.deploy.outcome == 'failure' || steps.commit.outcome == 'failure'
```

`steps.commit` est en succès (annotation « Dépôt à jour »). Donc
`steps.deploy.outcome == 'failure'`.

**2. Ce n'est ni le jeton, ni l'identifiant du site.** La sonde préalable
interroge l'API Netlify et publie son code HTTP. Annotation du run
`39585904143` (21/10, 10 h 37 UTC), mot pour mot :

> Jeton valide et site trouvé. Si la publication échoue malgré tout, la cause
> n'est ni le jeton ni l'identifiant.

Autrement dit HTTP 200. **Ne pas régénérer `NETLIFY_AUTH_TOKEN` ni changer
`NETLIFY_SITE_ID`** : ce serait du temps perdu, et le workflow le dit lui-même.

**3. La chaîne, elle, fonctionne.** Étapes « Télécharger les sources »,
« Exécuter la chaîne » et « Committer ce qui a changé » en succès. Les données
construites localement portent `genere_le: 2026-10-21`. Le problème est
strictement à la publication.

**4. La raison détaillée n'est pas lisible depuis le conteneur de l'agent.**
Le workflow prévoit pourtant de la remonter :

```yaml
echo "::error title=Netlify refuse la publication::${HTTP:-code $CODE_DEPLOI} ${RAISON:-...}"
```

Cette annotation **n'apparaît pas** dans l'API des annotations du run (relevé :
3 annotations de niveau `failure`, aucune portant ce titre). Et le journal
complet est inaccessible : il est servi depuis
`productionresultssa4.blob.core.windows.net`, que le proxy du conteneur refuse.
Mesuré, pas supposé.

**5. L'issue d'état de santé n'existe pas.** `outils/sante_publique.sh` doit
tenir « une seule issue GitHub, toujours ouverte, dont le TITRE seul dit
l'état ». Parmi les **100 issues les plus récentes** du dépôt, aucune ne porte un
titre `[OK]` ou `[ECHEC]`, ni ne contient « collecte quotidienne ». L'étape qui
l'appelle porte `continue-on-error: true` : si le script échoue, personne ne le
voit. Le signal de santé sur lequel le porteur compte **n'est donc pas en
service** — c'est un second problème, indépendant de Netlify.

## Hypothèse, clairement étiquetée comme telle

Le workflow garde en commentaire, daté du 08/10/2026, le récit d'un échec
**identique** — sonde à 200, publication refusée :

> Le 07/10, la publication a échoué avec une sonde à 200 ; la cause
> (« Account credit usage exceeded - new deploys are blocked until credits are
> added ») n'était QUE dans le journal.

Si c'est à nouveau cela, **c'est une décision de dépense, donc du porteur**, et
le workflow est déjà écrit pour le dire en clair :

```
::error title=Netlify::Le compte Netlify n'a plus de credits : aucune publication
ne passera avant l'ajout de credits ou un changement d'hebergeur.
```

**Cette hypothèse n'est pas vérifiée.** Elle est plausible parce qu'elle colle à
la signature observée (sonde 200 + refus), pas parce qu'on l'a lue.

## Comment trancher, en dix secondes

Ouvrir la page du run `39585904143`, déplier « Publier sur Netlify », et lire ce
que `netlify-cli` a imprimé après la ligne « sonde Netlify ». Deux cas :

- le message contient `credit usage exceeded` → hypothèse confirmée, décision de
  dépense ou bascule d'hébergeur ;
- autre message → le coller ici, le diagnostic reprend sur du solide.

## Ce que cela coûte aujourd'hui

L'application mobile lit `https://repereapp.netlify.app/data`
(`mono/apps/mobile/src/lib/donnees.ts`). Tant que la publication ne passe pas,
le téléphone affiche la dernière publication réussie. **La fraîcheur affichée
reste honnête** : l'invariant 9 et ses trois états sont tenus, et le parcours le
vérifie. Le lecteur n'est pas trompé — il est seulement en retard.

## Deux corrections possibles, non appliquées

Aucune n'a été faite : elles touchent `.github/workflows/`, protégé en écriture
contre les outils distants, et aucune n'est urgente.

1. **Faire remonter la raison hors du journal.** Écrire le message de
   `netlify-cli` dans le résumé de job (`$GITHUB_STEP_SUMMARY`) en plus de
   l'annotation : le résumé est lisible depuis un téléphone et depuis l'API.
2. **Rendre l'échec de l'issue de santé visible.** Retirer le
   `continue-on-error: true` de cette étape, ou lui faire émettre un
   `::warning::` quand le script sort en erreur — sinon le signal reste muet
   sans que personne l'apprenne.
