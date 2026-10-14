# Boucle de travail Repère — OpenAI + Claude

## État

Cette PR prépare la v1 ; elle **n'active pas** encore de workflow. Le dépôt protège explicitement `.github/workflows/` contre les modifications distantes. Le fichier à installer manuellement est fourni ici : `docs/agent-loop/agent-cycle.yml.example`.

## Comportement v1

1. Lancement manuel dans GitHub Actions, depuis un téléphone ou un navigateur.
2. OpenAI transforme la demande en plan JSON structuré.
3. Le validateur local n'accepte que le niveau `green`, un coût estimé inférieur ou égal à 0,75 USD et au plus 3 tours.
4. Claude Code reçoit une tâche limitée à `mono/apps/mobile/`, travaille dans une branche dédiée et propose une PR.
5. Si le plan n'est pas green ou échoue aux contrôles, le workflow ouvre une issue de décision et n'exécute pas Claude.
6. Aucune fusion, publication, modification de la collecte ou de la configuration de sécurité n'est autorisée.

La v1 ne reprend pas automatiquement après un commentaire d'approbation. Le porteur examine la demande sur téléphone, puis relance manuellement un nouveau cycle avec une tâche explicitement limitée. La reprise automatique ne sera ajoutée qu'après avoir testé l'identité de l'approbateur, l'expiration et l'usage unique d'une décision.

## Installation après revue de cette PR

1. Vérifier que le dépôt est toujours public ou privé comme prévu et que GitHub Actions est autorisé.
2. Ajouter le secret de dépôt `OPENAI_API_KEY`.
3. Ajouter le secret de dépôt `ANTHROPIC_API_KEY`.
4. Ajouter la variable de dépôt `OPENAI_MODEL` avec un identifiant de modèle disponible sur le compte API. Le modèle n'est pas codé en dur.
5. Depuis GitHub sur ordinateur, copier `docs/agent-loop/agent-cycle.yml.example` vers `.github/workflows/agent-cycle.yml`. Cette étape est volontairement manuelle pour respecter la règle du dépôt.
6. Vérifier que le workflow ne reçoit que les permissions déclarées dans le modèle et qu'aucun secret de production n'est ajouté.
7. Lancer d'abord une demande de lecture/analyse ou une petite correction mobile réversible.
8. Vérifier la PR, les contrôles mobiles et les coûts réels avant de relancer.

Ne pas réutiliser `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `COLLECTE_APP_KEY` ni aucun secret de production.

## Coût et limites

Le plafond de 0,75 USD dans le validateur est une limite de tâche déclarative : ce n'est pas un contrôle de facturation fournisseur et ne garantit pas que la facture reste sous ce montant. Les plafonds du fournisseur, s'ils sont disponibles, doivent également être configurés. Les appels OpenAI et Anthropic sont facturés séparément des abonnements ChatGPT et Claude.

## Commandes de test

Depuis la racine du dépôt :

```bash
python -m unittest discover -s outils/agent-loop -v
python outils/agent-loop/policy_check.py plan /chemin/vers/un-plan.json
```

Le contrôle du diff nécessite une branche avec `origin/main` récupérée :

```bash
python outils/agent-loop/policy_check.py diff --base main
```

## Garde-fous non négociables

- Aucune écriture sur `main`, aucune fusion et aucun déploiement.
- Aucun déclenchement sur `pull_request_target`, commentaire public ou fork.
- Aucun agent n'a le droit de modifier les règles, le validateur ou les workflows.
- Toute PR reste à examiner humainement ; les tests CI et le test sur vrai iPhone restent nécessaires.
- Si un test, un contrôle de périmètre ou un appel API échoue, le cycle s'arrête.
