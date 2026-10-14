# Politique de la boucle Repère — v1

Cette politique est une barrière de sécurité, pas une simple consigne destinée aux modèles.

## Mode initial

- Déclenchement manuel uniquement.
- Une seule tâche par exécution ; aucune boucle infinie ni relance automatique.
- Seules les tâches classées `green` peuvent être exécutées. Un verrou déterministe dans `plan_task.py` force `orange` si la demande ou le plan touche un sujet sensible (neutralité, vote, source, calcul, données, compte, secret, confidentialité, collecte, dépendances, déploiement, etc.), même si OpenAI propose `green`.
- Zone de modification autorisée : des préfixes de répertoires étroits sous `mono/apps/mobile/` (jamais la racine seule), déclarés dans le plan puis vérifiés contre le diff réel.
- Le résultat reste une branche et une pull request ; aucune fusion automatique.
- Maximum de 3 tours côté Claude et durée totale du workflow de 25 minutes.
- Claude est lancé avec `--max-budget-usd 0.75` par cycle et au plus 3 tours. Le coût déclaré par le modèle reste une estimation non fiable ; le plafond CLI doit être vérifié lors du premier essai. Le planificateur OpenAI est limité à 1 600 jetons de sortie, sans plafond monétaire strict. Suivre les coûts réels et configurer les alertes fournisseur.
- Toute erreur, sortie invalide, dépassement de limite ou doute arrête le cycle.

## Blocages absolus

La boucle ne doit jamais modifier ou exécuter une action qui :

- fusionne une PR, pousse sur `main`, publie ou déploie ;
- change un secret, un compte, un traceur, la collecte ou la chaîne de publication ;
- modifie les invariants, `CLAUDE.md`, `AGENTS.md`, les skills, les règles de l'orchestrateur ou un workflow GitHub ;
- modifie les données éditoriales validées, les sources, les licences ou la méthode de calcul ;
- change la neutralité, les règles de gouvernance, le modèle de monétisation ou les engagements de confidentialité ;
- supprime ou ajoute un fichier, ou ajoute une dépendance.

Ces actions exigent une décision explicite du porteur et une PR séparée. La v1 ne possède volontairement aucun outil capable de les exécuter.

## Invariants Repère

Respecter strictement `CLAUDE.md`, `AGENTS.md` et les décisions produit déjà enregistrées : neutralité, source et date identifiables, doctrine du vide, pas de classement politique, pas de gamification du vote, pas de compte ni de traceur, et aucune donnée manquante présentée comme une absence d'événement.

## Autorité

Le modèle peut proposer un niveau de risque, mais le validateur impose les limites. Un modèle ne peut pas modifier cette politique, le validateur, le workflow ou les permissions qui le contrôlent.
