# CONTEXTE_PROJET.md

## Projet
Repère — monorepo startup.

## Objectif
Rendre le produit viable pour un banc de test en décembre 2026.

## Structure
- apps/ : applications
- packages/ : packages partagés
- data/ : données
- scripts/ : scripts
- tests/ : tests
- orchestrator/ : orchestration locale Codex/Claude
- turbo.json : orchestration du monorepo
- pnpm-workspace.yaml : workspace pnpm
- package.json : configuration racine

## Règles de travail
1. Inspecter l'existant avant toute modification.
2. Mesurer avant de conclure.
3. Préserver les fonctionnalités existantes.
4. Ne jamais effectuer de modification destructive.
5. Prioriser la viabilité du banc de test décembre 2026.
6. Priorités :
   - architecture
   - données
   - code
   - UX/UI
   - tests
   - qualité
   - sécurité
   - performance
   - déploiement
   - préparation startup
7. Toute décision d'architecture, de schéma de données, d'API externe, de sécurité ou de déploiement production doit être signalée.
8. Après modification :
   - lancer les tests pertinents ;
   - lancer le build ;
   - documenter les changements.
9. Ne pas considérer une tâche comme terminée uniquement parce qu'une commande s'est terminée avec le code 0.
10. Vérifier réellement le résultat.

## Mode autonome
Les agents peuvent corriger directement les problèmes locaux à faible risque.
Les changements critiques doivent être signalés avant application.

## Critère de succès
Le projet doit être progressivement amené vers un état :
- démontrable ;
- testable ;
- reproductible ;
- déployable ;
- maintenable ;
- cohérent côté UX/UI ;
- exploitable avec des données réalistes ;
- prêt pour un banc de test en décembre 2026.
