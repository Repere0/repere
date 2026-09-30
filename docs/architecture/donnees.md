# Les données — d'où elles viennent, comment elles arrivent

*29/09/2026.*

## Le chemin

1. `outils/pipeline.sh` (GitHub Actions, `collecte.yml`, chaque jour) télécharge les
   sources publiques — le conteneur de travail de Claude **ne peut pas** les joindre (403).
2. `mono/scripts/extract-html.js` écrit `mono/data/` : `index.json`, un fichier par
   département (`departments/NN.json`), et des socles nationaux (députés, scrutins, agenda).
3. Le banc tourne ; s'il est vert, `data/` est publié tel quel sur Netlify.
4. Web et mobile lisent ces fichiers via `@repere/data-utils` (`chargerDepartement`, …).

Ajouter une source : skill `ingerer-une-source` ; décrire d'abord le schéma sur le runner
(`outils/echantillon_*.py`), jamais le deviner.

## Option retenue : A — fichiers statiques + CDN

| option | ce qu'elle apporte | ce qu'elle coûte | verdict |
|---|---|---|---|
| **A. fichiers statiques** | gratuit, hors ligne possible, aucun journal d'accès, déjà en production | publication quotidienne, pas de requête arbitraire | **retenue** |
| B. API Node | requêtes à la demande | serveur à payer, journaux = adresses IP (donnée personnelle), une panne de plus | refusée tant qu'aucun besoin ci-dessous n'existe |
| C. API + base | recherche plein texte, historique long | tout B, plus une base à sauvegarder | idem |

## Quand une API deviendrait nécessaire

Un seul de ces cas suffirait à rouvrir la question, avec mesure à l'appui :

- un fichier départemental dépasse ~1 Mo compressé (mesuré le 26/08/2026 : 186 Ko,
  70 Ko compressés, pour le département de référence du monorepo) ;
- une fonction exige une donnée **propre au lecteur** côté serveur — ce que les
  invariants interdisent de toute façon ;
- une recherche porte sur un volume que le téléphone ne peut pas charger (ex. tous les
  scrutins de la législature par texte).

Même alors, la première réponse à essayer est un **index statique de plus**, pas un serveur.
