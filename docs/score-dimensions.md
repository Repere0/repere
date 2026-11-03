# Score par dimension citoyenne (V36, bloc 7)

Date : 31/10/2026. Évaluation de la **branche de test** (`test/sdk58-expo-go`), telle que mesurée dans le dépôt. Ce qui n'est pas en production sur `main` est dit comme tel. Chaque verdict cite sa preuve : fichier, mesure, ou absence constatée. Verdicts : **OUI** (complet pour le périmètre annoncé), **PARTIEL**, **NON**.

Règle de lecture : un verdict OUI demande que la question de la dimension reçoive une réponse complète, pour toutes les communes ou toutes les circonscriptions annoncées. Une couverture de 99 % reste PARTIEL.

---

## 1. Savoir qui décide — **PARTIEL**

| Question | Verdict | Justification et preuve |
|---|---|---|
| Maire, toutes les communes d'Île-de-France ? | **OUI** | 1 262 communes sur 1 262 ont un maire renseigné (`mono/data/departments/{75,77,78,91,92,93,94,95}.json`). |
| Député, toutes les circonscriptions ? | **PARTIEL** | 574 députés sur 577 (`mono/data/deputes.json`, relevé du 28/10). Trois sièges absents, cause non identifiée. |
| Sénateurs ? | **NON** | Aucun référentiel de sénateurs dans le dépôt (`docs/audit-data.md`). |
| Conseillers régionaux ? | **PARTIEL** | 14 régions sur 18 dans `mono/data/elus-regions/` ; manquent 02, 03, 06, 94. |
| Groupes politiques ? | **NON** | Aucun groupe n'est affiché. Le script B2 existe (`1dec22e`), mais `deputes-groupes.json` n'a pas été produit (BLOCAGES §38). |

## 2. Où va l'argent — **PARTIEL**

| Question | Verdict | Justification et preuve |
|---|---|---|
| Budget, toutes les communes d'Île-de-France ? | **OUI** (à 4 près) | 1 262 communes avec comptes ; 1 258 avec les comptes 2025 (`departments/*.json`, OFGL 29/07/2026). 4 communes n'ont que des années antérieures. |
| Comparaison ? | **PARTIEL** | Comparaison à la commune médiane de la région (`apps/mobile/src/lib/moyenne.ts`, `titreEcart`). Pas de classement, conformément à l'invariant 3. |
| Répartition par poste ? | **PARTIEL** | La phrase d'accueil répartit les dépenses (« 45 € vont aux salaires des agents », capture de l'accueil du 31/10). Le détail complet par poste n'a pas été vérifié poste par poste. |
| Détail école par école ? | **NON** | Aucune donnée scolaire par établissement dans le dépôt. |
| Couverture France ? | **PARTIEL** | 34 570 communes avec comptes sur 34 969 (98,9 %), 34 474 avec 2025 (`docs/audit-data.md`). |

## 3. Votes des élus — **PARTIEL**

| Question | Verdict | Justification et preuve |
|---|---|---|
| Votes des députés, toutes les circonscriptions ? | **PARTIEL** | Des fichiers de positions existent par département (`mono/data/scrutins/`, 107 fichiers, relevé du 28/10). Mais l'application ne présente que les scrutins retenus. |
| Scrutins présentés ? | **PARTIEL** | 12 scrutins retenus dans `mono/scripts/scrutins.json` (champ `r`), sur 9 155 dans la source (`total_source`). |
| Votes des sénateurs ? | **NON** | Absents. |
| Résumé officiel du scrutin ? | **OUI** pour les scrutins présentés | « Décompte du scrutin » et titre lisible sur la fiche de vote (`vote.tsx`, `scrutins.tsx`). |
| Impact concret ? | **PARTIEL** | Décrit en phrases pour les 12 scrutins retenus. Pas de champ d'impact dans le code (voir 4). |

## 4. Impact sur ma vie — **PARTIEL**

| Question | Verdict | Justification et preuve |
|---|---|---|
| Champ `impact_citoyen` ? | **NON** | Absent : `grep` sans résultat dans `packages/core/src` et `apps/mobile/src`. |
| Explication en français simple ? | **PARTIEL** | Phrases en français courant sur la fiche (« Décide : l'école primaire, la cantine, les permis de construire… ») ; pas pour tous les écrans. |
| Nombre de scrutins documentés à la main ? | **PARTIEL** | 12 scrutins retenus (`scrutins.json`, champ `r`) et 8 événements éditoriaux (`mono/data/evenements.json`). Ce n'est pas une couverture : 12 scrutins sur 9 155. |

## 5. Agir — **NON**

| Question | Verdict | Justification et preuve |
|---|---|---|
| Contacter un élu, fonctionnel ? | **NON** en production | Le code existe (`ui/contact.tsx`, `faq.tsx`, `avatar.tsx`) mais reste masqué tant que `EXPO_PUBLIC_CONTACT_EMAIL` n'est pas défini, et aucun build ne la passe (BLOCAGES §39). |
| Pétitions ? | **NON** | Aucune fonctionnalité ni donnée. |
| Agenda des conseils ? | **NON** | Absent. Seul l'agenda de l'Assemblée et du Sénat existe (`a-venir.tsx`). |
| Consultations ? | **NON** | Absent. |

## 6. Se préparer aux élections — **PARTIEL**

| Question | Verdict | Justification et preuve |
|---|---|---|
| Élections datées ? | **OUI** | Dates vérifiées sur service-public.gouv.fr le 30/10/2026 (`lib/elections.ts`, `voter.tsx`). |
| Guide pour voter ? | **OUI** | Écran « Voter » (`voter.tsx`) : guide du vote et source. |
| Bureau de vote ? | **NON** | Aucune recherche de bureau dans le dépôt. |
| Candidats ? | **NON** | `outils/candidats.py` existe mais ne produit que des candidats d'événements ; aucun fichier de candidats dans `mono/data/`. |

---

## Score final

**0/6 complètes, 5/6 partielles, 1/6 absente.**

- Complète : aucune. La dimension la plus proche est « Où va l'argent » pour l'Île-de-France seule.
- Absente : « Agir » (la seule dimension où toutes les questions reçoivent NON en production).
- Pour la dimension 6, le score « PARTIEL » vient de l'absence de bureau de vote et de candidats, non des dates.

Ce score décrit ce qui est mesuré. Il ne dit rien de la qualité du design, qui n'a été vérifié que dans Chromium à 390 px, pas sur iPhone (voir `docs/audit-wcag.md`).
