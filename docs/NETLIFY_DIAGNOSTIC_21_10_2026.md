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

**5. ~~L'issue d'état de santé n'existe pas.~~ FAUX — corrigé le 22/10/2026.**

> Ce point affirmait que le signal de santé n'était pas en service. **C'était une
> erreur de ma part, répétée deux fois.** L'issue **#18 « [ECHEC] etat de la
> collecte quotidienne »** existe, est **ouverte**, et a été mise à jour le
> 21/10/2026 à 10 h 45 UTC par le run en échec lui-même — avec le lien du run et
> la dernière prod saine mesurée en direct. `outils/sante_publique.sh` fonctionne
> exactement comme prévu, et l'étape qui l'appelle réussit réellement.
>
> **La cause de mon erreur**, qui vaut d'être connue : `gh api --paginate` suit
> l'en-tête `Link`, que GitHub écrit sous la forme `repositories/{id}/…`, et le
> proxy du conteneur de l'agent refuse les chemins à identifiant numérique. La
> commande rend **la page 1 puis sort en 1**. L'issue #18 est en page 2. Avec un
> `2>/dev/null`, une liste tronquée ressemble à une liste complète. Il faut
> paginer à la main (`&page=N`) — et ne jamais conclure « ça n'existe pas » d'une
> commande dont on n'a pas relevé le code de sortie.
>
> Rien dans ce document ne dépendait de ce point : le diagnostic Netlify (points
> 1 à 4) reste établi.

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

## Corrections — état au 22/10/2026

L'affirmation « `.github/workflows/` est protégé en écriture contre les outils
distants », écrite ici le 21/10, est **fausse** : l'écriture y est possible depuis
le conteneur de l'agent, vérifiée. Elle n'avait simplement jamais été tentée.

1. **Faire remonter la raison hors du journal — APPLIQUÉE le 22/10/2026,**
   avec l'accord du porteur. L'étape de publication écrit désormais dans
   `$GITHUB_STEP_SUMMARY` le code de sortie, le code HTTP, la raison extraite et
   les quarante dernières lignes de `netlify-cli`. Le résumé de job se lit depuis
   un téléphone **et** depuis l'API, contrairement au journal complet. Dès le
   prochain échec, la cause sera donc lisible sans ouvrir le journal.
2. **~~Rendre l'échec de l'issue de santé visible.~~ Sans objet** : l'issue #18
   est tenue correctement (voir le point 5 corrigé ci-dessus). Il n'y avait aucun
   échec à rendre visible. Le `continue-on-error: true` de cette étape reste en
   place, et sa raison d'être tient : une étape qui *rapporte* l'état ne doit pas
   *décider* de la couleur du job.
