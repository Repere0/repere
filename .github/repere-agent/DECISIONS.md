# Registre des décisions — boucle Repère

Ce fichier décrit le protocole ; il ne remplace pas une approbation technique GitHub.

## États autorisés

- `proposed` : un agent a proposé une action, aucune exécution sensible autorisée.
- `approved` : le porteur a approuvé explicitement cette décision précise.
- `rejected` : action interdite ; aucune reprise automatique.
- `revise` : l'agent doit présenter un plan différent, sans exécuter l'action initiale.
- `expired` : décision dépassée ou devenue sans objet.

## Règles

1. Une approbation porte sur un identifiant de décision, une action, un périmètre et une version du plan.
2. Une approbation n'est jamais réutilisable pour une autre tâche.
3. Une décision expirée, ambiguë ou émise par un autre compte est refusée.
4. Une modification de workflow, une fusion, une publication, une dépense ou une modification d'invariant ne sont jamais autorisées par une simple classification d'agent.
5. La v1 n'automatise pas encore la reprise après commentaire : une décision orange/rouge produit une demande à examiner, puis le porteur relance manuellement un nouveau cycle avec une tâche révisée.

## Journal

Les décisions effectives sont conservées dans les issues GitHub associées au cycle, avec le lien vers la PR et le plan. Ne pas enregistrer de clé API, de secret, de données personnelles ou de contenu non nécessaire.
