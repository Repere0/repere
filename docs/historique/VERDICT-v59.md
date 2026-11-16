# VERDICT V59 — 03/11/2026

## Réponse

## PRÊT POUR BÊTA IDF ? **NON**

Ce qui manque est donné par la session elle-même, pas par un choix : la plupart des sources P0, P1 et P2 sont sur des hôtes refusés par la politique réseau de cette session (BLOCAGES §60). Je ne les ai pas remplacées par des données inventées, ni par des miroirs tiers.

## Ce qui est VRAIMENT fait et testé

- **Découpage administratif des 8 départements IDF** : 1 266 communes, EPCI, population, région, source et date dans le fichier. Produit depuis le paquet npm officiel `@etalab/decoupage-administratif` 6.0.0. Publication par `extract-html.js` vérifiée sur un dossier de test. Commit `0adf0d0`.
- **Nom de l'intercommunalité** dans « Qui décide », pour les 401 communes dont la fiche n'en porte pas. Source et date affichées. Vérifié dans le navigateur. Commit `1ddfa0f`.
- **Vérification** sur `2b68454` : tsc 0 erreur ; suite partagée 300/300 ; invariants 61/61 ; parcours 225/225 ; R1/R2/R3 = 411/613/843 px ; « même vérité » 107 faits, 0 échec ; export web et natif OK. CI Mobile **succès**.

## Ce qui est PARTIEL

- **Intercommunalité** : le nom oui, le président non (aucune source accessible).
- **91 noms d'intercommunalité** diffèrent par la graphie entre le RNE et le découpage officiel. Pas de SIREN dans les fiches pour recouper : à vérifier par le porteur.
- **Ma commune (4.1)** : écran nouveau non construit ; le découpage est ajouté à « Qui décide ».
- **Contact élu (5.1)** et **squelettes (5.2)** : déjà en place avant V59 ; non refaits. Squelettes non audités écran par écran.
- **Couverture par échelle** : commune, intercommunalité, département, région, circonscription — présents en partie (le découpage et les fichiers existants). Sénat, européen : absents. National : députés sans groupe politique.

## Ce qui N'EST PAS fait

- **P0 data** : groupes politiques (1.2), sénateurs (1.3), scrutins complets (1.4), conseillers départementaux et régionaux (1.5), photos d'élus (1.6).
- **P1 data** : résultats électoraux, marchés publics, subventions, patrimoine, logement social, sécurité, transports, écoles, santé, services publics (2.1 à 2.10).
- **P2 data** : délibérations, associations, lobbying, financement des partis, urbanisme (3.1 à 3.5).
- **Écrans** : Scrutin détaillé (4.2), Élections (4.3), Marchés (4.4).
- **P1 UI** : timeline vote (5.3).

## Tableau de synthèse

| Item | Résultat |
|---|---|
| Données couvertes (commune / interco / département / région / circonscription / sénat / national / européen) | 5 partiels / 8 ; aucune échelle complète |
| Écrans livrés (Ma commune / Scrutin / Élections / Marchés) | 0 / 4 complet ; Ma commune en partie (Qui décide) |
| P1 (timeline / contact / squelettes) | 0 nouveau ; 2 déjà présents, non refaits |
| P2 (délibérations / associations / lobbying / financement / urbanisme) | 0 / 5 |
| CI | Mobile vert sur `2b68454` ; Épreuve en attente |

## Ce qui reste si NON

1. Relancer V59 depuis une session dont le réseau atteint les hôtes listés dans BLOCAGES §60.0 (en particulier `data.assemblee-nationale.fr`, `senat.fr`, `data.gouv.fr`, `elections.interieur.gouv.fr`, `wikidata.org`).
2. Dans cette session, sans réseau : le découpage est fait ; le reste ne se fait pas sans données.
3. Décision du porteur à prendre avant de publier le découpage : confirmer le paquet npm comme source (même jeu qu'unpkg, autre hôte).
4. Publier `decoupage-idf.json` sur le site public via la chaîne quotidienne (il n'est pas encore en production).
5. Vérifier les 91 graphies d'intercommunalité en désaccord.
