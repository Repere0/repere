# Boucle de travail Repère — OpenAI + Claude

## État

Cette PR prépare la v1 ; elle **n'active pas** encore de workflow. Le dépôt protège explicitement `.github/workflows/` contre les modifications distantes. Le fichier à installer manuellement est fourni ici : `docs/agent-loop/agent-cycle.yml.example`.

## Comportement v1

1. Lancement manuel dans GitHub Actions, depuis un téléphone ou un navigateur.
2. OpenAI transforme la demande en plan JSON structuré.
3. Un verrou déterministe force la revue humaine pour les demandes/plans mentionnant les sujets sensibles (neutralité, vote, sources, calculs, données, confidentialité, collecte, dépendances, déploiement, etc.), indépendamment du classement OpenAI. Le validateur n'accepte ensuite que le niveau `green`, un coût estimé inférieur ou égal à 0,75 USD et au plus 3 tours. Le coût estimé par OpenAI n'est pas un plafond de facture.
4. Claude Code reçoit une tâche limitée à `mono/apps/mobile/`, travaille dans une branche dédiée et propose une PR.
5. Si le plan n'est pas green ou échoue aux contrôles, le workflow ouvre une issue de décision et n'exécute pas Claude.
6. Aucune fusion, publication, modification de la collecte ou de la configuration de sécurité n'est autorisée.

La v1 ne reprend pas automatiquement après un commentaire d'approbation. Le porteur examine la demande sur téléphone, puis relance manuellement un nouveau cycle avec une tâche explicitement limitée. La reprise automatique ne sera ajoutée qu'après avoir testé l'identité de l'approbateur, l'expiration et l'usage unique d'une décision.

## Installation après revue de cette PR

1. Vérifier que le dépôt est toujours public ou privé comme prévu et que GitHub Actions est autorisé.
2. Installer l'application GitHub officielle Claude sur le dépôt : https://github.com/apps/claude. Le workflow utilise son jeton de courte durée pour créer la branche/PR et permettre aux contrôles PR de se déclencher.
3. Ajouter le secret de dépôt `OPENAI_API_KEY`.
4. Ajouter le secret de dépôt `ANTHROPIC_API_KEY`.
5. Ajouter la variable de dépôt `OPENAI_MODEL` avec un identifiant de modèle disponible sur le compte API. Le modèle n'est pas codé en dur.
6. Vérifier que le dépôt autorise GitHub Actions et les permissions minimales déclarées dans le workflow.
7. Depuis GitHub sur ordinateur, copier `docs/agent-loop/agent-cycle.yml.example` vers `.github/workflows/agent-cycle.yml`. Cette étape est volontairement manuelle pour respecter la règle du dépôt.
8. Vérifier que le workflow ne reçoit que les permissions déclarées dans le modèle et qu'aucun secret de production n'est ajouté.
9. Lancer d'abord une demande de lecture/analyse ou une petite correction mobile réversible.
10. Activer les notifications push GitHub Mobile pour les mentions et les issues assignées (leur affichage dépend des réglages du téléphone).
11. Vérifier la PR, les contrôles mobiles et les coûts réels avant de relancer.

**Confidentialité :** les issues et PR d'un dépôt public sont publiques. Ne jamais saisir de secret, de donnée personnelle ni de contenu confidentiel dans la tâche. L'issue de décision ne reproduit pas le texte initial, mais le titre et le résumé du plan peuvent révéler une partie de la demande.

Ne pas réutiliser `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`, `COLLECTE_APP_KEY` ni aucun secret de production.

## Coût et limites

Claude Code est lancé avec un plafond CLI de 0,75 USD par cycle et au plus 3 tours ; cette protection doit être vérifiée sur la première exécution. Le planificateur OpenAI utilise une réponse plafonnée à 1 600 jetons de sortie, mais cela ne constitue pas un plafond monétaire strict. Le coût estimé par le modèle est informatif ; les plafonds et alertes du fournisseur doivent être configurés séparément. Les appels OpenAI et Anthropic sont facturés séparément des abonnements ChatGPT et Claude.

## Commandes de test

Depuis la racine du dépôt :

```bash
python -m unittest discover -s outils/agent-loop -v
python outils/agent-loop/policy_check.py plan /chemin/vers/un-plan.json
```

Le contrôle du diff nécessite une branche avec `origin/main` récupérée :

```bash
python outils/agent-loop/policy_check.py diff --base main --head HEAD --plan /chemin/vers/un-plan-green.json
```

## Garde-fous non négociables

- Aucune écriture sur `main`, aucune fusion et aucun déploiement.
- Aucun déclenchement sur `pull_request_target`, commentaire public ou fork.
- Aucun agent n'a le droit de modifier les règles, le validateur ou les workflows.
- Toute PR reste à examiner humainement ; les tests CI et le test sur vrai iPhone restent nécessaires.
- Si un test, un contrôle de périmètre ou un appel API échoue, le cycle s'arrête.
