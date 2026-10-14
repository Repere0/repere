# Politique de la boucle Repère — v1

Cette politique est une barrière de sécurité, pas une simple consigne destinée aux modèles.

## Mode initial

- Déclenchement manuel uniquement.
- Une seule tâche par exécution ; aucune boucle infinie ni relance automatique.
- Seules les tâches classées `green` peuvent être exécutées.
- Zone de modification autorisée : `mono/apps/mobile/`.
- Le résultat reste une branche et une pull request ; aucune fusion automatique.
- Plafond local : 0,75 USD estimé par tâche, 3 tours maximum côté Claude.
- Toute erreur, sortie invalide, dépassement de limite ou doute arrête le cycle.

## Blocages absolus

La boucle ne doit jamais modifier ou exécuter une action qui :

- fusionne une PR, pousse sur `main`, publie ou déploie ;
- change un secret, un compte, un traceur, la collecte ou la chaîne de publication ;
- modifie les invariants, `CLAUDE.md`, `AGENTS.md`, les skills, les règles de l'orchestrateur ou un workflow GitHub ;
- modifie les données éditoriales validées, les sources, les licences ou la méthode de calcul ;
- change la neutralité, les règles de gouvernance, le modèle de monétisation ou les engagements de confidentialité ;
- supprime un fichier ou ajoute une dépendance.

Ces actions exigent une décision explicite du porteur et une PR séparée. La v1 ne possède volontairement aucun outil capable de les exécuter.

## Invariants Repère

Respecter strictement `CLAUDE.md`, `AGENTS.md` et les décisions produit déjà enregistrées : neutralité, source et date identifiables, doctrine du vide, pas de classement politique, pas de gamification du vote, pas de compte ni de traceur, et aucune donnée manquante présentée comme une absence d'événement.

## Autorité

Le modèle peut proposer un niveau de risque, mais le validateur impose les limites. Un modèle ne peut pas modifier cette politique, le validateur, le workflow ou les permissions qui le contrôlent.
