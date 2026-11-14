# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **11093**
- Fichiers ouverts pour le tirage : **3000** (pas de 3)
- Fichiers decrits : **3000** — tous ceux qui ont ete ouverts
- Cles distinctes trouvees : **537**
- Fichier montre en entier plus bas : `json/dossierParlementaire/DLR5L17N50588.json` (le plus riche de l'echantillon)

## Arborescence des cles

`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un
nombre de fichiers : une cle situee dans une liste est comptee une fois par
element. Une cle vue beaucoup moins souvent que les autres est un cas
particulier, et l'ingestion doit la traiter comme facultative. Les cles vues
une seule fois sont reprises a part, plus bas.

| chemin | type | vu | exemples |
|---|---|---|---|
| `document.@xmlns` | texte | 2556 | http://schemas.assemblee-nationale.fr/referentiel |
| `document.@xmlns:xsi` | texte | 2556 | http://www.w3.org/2001/XMLSchema-instance |
| `document.@xsi:type` | texte | 2556 | accordInternational_Type · avisConseilEtat_Type |
| `document.uid` | texte | 2556 | ACINANR5L16B2159 · ACINANR5L16B2628 |
| `document.legislature` | texte/vide | 2556 | 16 · 17 |
| `document.cycleDeVie.chrono.dateCreation` | texte/vide | 2556 | 2024-02-07T00:00:00.000+01:00 · 2024-05-16T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.dateDepot` | texte/vide | 2556 | 2024-02-07T00:00:00.000+01:00 · 2024-05-16T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.datePublication` | texte/vide | 2556 | 2024-04-10T00:00:00.000+02:00 · 2024-05-29T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.datePublicationWeb` | texte/vide | 2556 | 2024-02-09T14:56:00.000+01:00 · 2024-05-22T11:40:00.000+02:00 |
| `document.denominationStructurelle` | texte | 2556 | Projet de loi · Proposition de loi |
| `document.provenance` | texte | 2545 | Texte Déposé · Commission |
| `document.titres.titrePrincipal` | texte | 2556 | Accord international sur le projet de loi autorisant l’approbation de l’accord entre le... · Accord international sur le projet de loi autorisant la ratification de l’accord se rap... |
| `document.titres.titrePrincipalCourt` | texte | 2556 | accord Papouasie Nouvelle Guinée défense · Convention des Nations unies sur le droit de la mer et conservation et utilisation dura... |
| `document.divisions` | vide | 2454 |  |
| `document.dossierRef` | texte | 2556 | DLR5L16N49392 · DLR5L16N49957 |
| `document.redacteur` | vide | 2556 |  |
| `document.classification.famille.depot.code` | texte | 2556 | INITDEP · INITNAV |
| `document.classification.famille.depot.libelle` | texte | 2556 | Initiative en 1er Dépôt · Initiative en Navette |
| `document.classification.famille.classe.code` | texte | 2556 | PRJLOI · PIONLOI |
| `document.classification.famille.classe.libelle` | texte | 2556 | Projet de loi · Proposition de loi |
| `document.classification.famille.espece.code` | texte | 540 | AUTRATCONV · ORG |
| `document.classification.famille.espece.libelle` | texte | 540 | autorisant la ratification d'une convention · organique |
| `document.classification.type.code` | texte | 2556 | ACIN · AVCE |
| `document.classification.type.libelle` | texte | 2556 | Accord international · Avis du Conseil d'Etat |
| `document.classification.sousType.code` | texte | 540 | AUTRATCONV · ORG |
| `document.classification.sousType.libelle` | texte | 528 | autorisant la ratification d'une convention · organique |
| `document.classification.sousType.libelleEdition` | texte | 273 | autorisant la ratification d'une convention · organique |
| `document.classification.statutAdoption` | texte/vide | 2556 | ADOPTSEANCE · ADOPTCOM |
| `document.auteurs.auteur.acteur.acteurRef` | texte | 966 | PA722190 · PA368 |
| `document.auteurs.auteur.acteur.qualite` | texte | 966 | auteur · rapporteur |
| `document.correction` | vide | 2532 |  |
| `document.notice.numNotice` | texte | 2545 | 2159 · 2628 |
| `document.notice.formule` | texte | 2543 | autorisant l’approbation de l’accord entre le Gouvernement de la République française e... · autorisant la ratification de l’accord se rapportant à la convention des Nations unies ... |
| `document.notice.adoptionConforme` | texte | 2556 | false |
| `document.indexation` | vide | 2542 |  |
| `document.imprimerie.ISSN` | vide | 2556 |  |
| `document.imprimerie.ISBN` | vide | 2556 |  |
| `document.imprimerie.DIAN` | texte/vide | 2556 | 40/2025 · 119/2025 |
| `document.imprimerie.nbPage` | texte/vide | 2556 | 0 · 3 |
| `document.imprimerie.prix` | texte/vide | 2556 | 2.0 · 3.299999952316284 |
| `document.auteurs.auteur.organe.organeRef` | texte | 720 | PO838901 · PO230434 |
| `document.classification.sousType` | vide | 2016 |  |
| `document.auteurs.auteur[]` | liste | 870 | de 2 a 192 entrees |
| `document.auteurs.auteur[].acteur.acteurRef` | texte | 2779 | PA720704 · PA266797 |
| `document.auteurs.auteur[].acteur.qualite` | texte | 2779 | auteur · rapporteur pour avis |
| `document.auteurs.auteur[].organe.organeRef` | texte | 765 | PO59048 · PO419865 |
| `document.organesReferents.organeRef` | texte | 1816 | PO420120 · PO59048 |
| `document.coSignataires` | vide | 1492 |  |
| `document.depotAmendements` | vide | 121 |  |
| `document.divisions.division[]` | liste | 17 | de 2 a 10 entrees |
| `document.divisions.division[].@xsi:type` | texte | 69 | texteLoi_Type · rapportParlementaire_Type |
| `document.divisions.division[].uid` | texte | 69 | AVISANR5L17B0471-tI · AVISANR5L17B0471-tII |
| `document.divisions.division[].legislature` | texte | 69 | 17 · 15 |
| `document.divisions.division[].cycleDeVie.chrono.dateCreation` | texte | 69 | 2024-10-23T00:00:00.000+02:00 · 2024-10-25T00:00:00.000+02:00 |
| `document.divisions.division[].cycleDeVie.chrono.dateDepot` | texte | 69 | 2024-10-23T00:00:00.000+02:00 · 2024-10-25T00:00:00.000+02:00 |
| `document.divisions.division[].cycleDeVie.chrono.datePublication` | texte/vide | 69 | 2024-11-18T00:00:00.000+01:00 · 2024-11-13T00:00:00.000+01:00 |
| `document.divisions.division[].cycleDeVie.chrono.datePublicationWeb` | texte/vide | 69 | 2024-11-13T18:00:00.000+01:00 · 2024-11-13T20:40:00.000+01:00 |
| `document.divisions.division[].denominationStructurelle` | texte | 69 | Tome I · Tome II |
| `document.divisions.division[].titres.titrePrincipal` | texte | 69 | Administration générale et territoriale de l'État : Administration générale et territor... · Sécurités : Sécurité |
| `document.divisions.division[].titres.titrePrincipalCourt` | texte | 69 | Administration générale et territoriale de l'État : Administration générale et territor... · Sécurités : Sécurité |
| `document.divisions.division[].divisions` | vide | 65 |  |
| `document.divisions.division[].dossierRef` | texte | 69 | DLR5L17N50198 · DLR5L17N52428 |
| `document.divisions.division[].redacteur` | vide | 69 |  |
| `document.divisions.division[].classification.famille` | vide | 69 |  |
| `document.divisions.division[].classification.type.code` | texte | 69 | AVIS · RAPP |
| `document.divisions.division[].classification.type.libelle` | texte | 69 | Avis · Rapport |
| `document.divisions.division[].classification.sousType` | vide | 51 |  |
| `document.divisions.division[].classification.statutAdoption` | texte/vide | 69 | ADOPTCOM |
| `document.divisions.division[].auteurs.auteur[]` | liste | 69 | de 2 a 10 entrees |
| `document.divisions.division[].auteurs.auteur[].acteur.acteurRef` | texte | 85 | PA267780 · PA718784 |
| `document.divisions.division[].auteurs.auteur[].acteur.qualite` | texte | 85 | rapporteur pour avis · rapporteur |
| `document.divisions.division[].auteurs.auteur[].organe.organeRef` | texte | 69 | PO59051 · PO419865 |
| `document.divisions.division[].organesReferents.organeRef` | texte | 39 | PO59048 |
| `document.divisions.division[].correction` | vide | 63 |  |
| `document.divisions.division[].notice.numNotice` | texte | 69 | 471 · 486 |
| `document.divisions.division[].notice.formule` | texte | 69 | sur le projet de loi de finances pour 2025 (n°324). · sur le projet de loi de finances pour 2026 (n°1906). |
| `document.divisions.division[].notice.adoptionConforme` | texte | 69 | false |
| `document.divisions.division[].indexation` | vide | 69 |  |
| `document.divisions.division[].imprimerie.ISSN` | vide | 69 |  |
| `document.divisions.division[].imprimerie.ISBN` | vide | 69 |  |
| `document.divisions.division[].imprimerie.DIAN` | texte/vide | 69 | 58/2026 |
| `document.divisions.division[].imprimerie.nbPage` | texte/vide | 69 | 0 · 801 |
| `document.divisions.division[].imprimerie.prix` | texte/vide | 69 | 1.5 · 2.0 |
| `document.divisions.division[].coSignataires` | vide | 39 |  |
| `document.divisions.division[].depotAmendements` | vide | 39 |  |
| `document.indexation.themes.@niveau` | texte | 14 | 1 |
| `document.indexation.themes.theme.libelleTheme` | texte | 14 | LOIS DE FINANCES RECTIFICATIVES · SANTE PUBLIQUE |
| `document.organesReferents` | vide | 302 |  |
| `document.coSignataires.coSignataire[]` | liste | 601 | de 2 a 271 entrees |
| `document.coSignataires.coSignataire[].acteur.acteurRef` | texte | 20715 | PA305 · PA885 |
| `document.coSignataires.coSignataire[].dateCosignature` | texte | 20718 | 1999-12-23+01:00 · 2010-05-03+02:00 |
| `document.coSignataires.coSignataire[].dateRetraitCosignature` | texte/vide | 20718 | 2025-02-17+01:00 · 2025-03-13+01:00 |
| `document.coSignataires.coSignataire[].edite` | texte | 20718 | false · true |
| `document.depotAmendements.amendementsSeance.amendable` | texte | 2023 | false · true |
| `document.depotAmendements.amendementsSeance.dateLimiteDepot` | vide | 2023 |  |
| `document.depotAmendements.amendementsCommission.commission.organeRef` | texte | 1162 | PO59051 · PO59048 |
| `document.depotAmendements.amendementsCommission.commission.amendable` | texte | 1162 | true |
| `document.depotAmendements.amendementsCommission.commission.dateLimiteDepot` | vide | 1162 |  |
| `document.correction.typeCorrection` | texte | 24 | Rectifié |
| `document.correction.niveauCorrection` | texte | 24 | 1 · 2 |
| `document.coSignataires.coSignataire.acteur.acteurRef` | texte | 48 | PA330008 · PA795330 |
| `document.coSignataires.coSignataire.dateCosignature` | texte | 51 | 2024-11-19+01:00 · 2024-10-29+01:00 |
| `document.coSignataires.coSignataire.dateRetraitCosignature` | vide | 51 |  |
| `document.coSignataires.coSignataire.edite` | texte | 51 | false · true |
| `document.depotAmendements.amendementsCommission.commission[]` | liste | 28 | de 2 a 8 entrees |
| `document.depotAmendements.amendementsCommission.commission[].organeRef` | texte | 82 | PO419865 · PO419610 |
| `document.depotAmendements.amendementsCommission.commission[].amendable` | texte | 82 | true |
| `document.depotAmendements.amendementsCommission.commission[].dateLimiteDepot` | vide | 82 |  |
| `document.coSignataires.coSignataire.organe.organeRef` | texte | 3 | PO77710 · PO77707 |
| `document.coSignataires.coSignataire.organe.etApparentes` | texte | 3 | false |
| `document.coSignataires.coSignataire[].organe.organeRef` | texte | 3 | PO309463 · PO77710 |
| `document.coSignataires.coSignataire[].organe.etApparentes` | texte | 3 | false · true |
| `document.rapportPublie` | texte | 384 | false · true |
| `document.divisions.division[].classification.sousType.code` | texte | 18 | COMPA · ENQU |
| `document.divisions.division[].classification.sousType.libelle` | texte | 18 | Texte comparatif · d'enquête |
| `document.divisions.division[].rapportPublie` | texte | 30 | false · true |
| `document.divisions.division.@xsi:type` | texte | 85 | rapportParlementaire_Type |
| `document.divisions.division.uid` | texte | 85 | RAPPANR5L16B1022-COMPA · RAPPANR5L16B1928-COMPA |
| `document.divisions.division.legislature` | texte | 85 | 16 · 17 |
| `document.divisions.division.cycleDeVie.chrono.dateCreation` | texte | 85 | 2023-03-29T00:00:00.000+02:00 · 2023-11-29T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.dateDepot` | texte | 85 | 2023-03-29T00:00:00.000+02:00 · 2023-11-29T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.datePublication` | texte/vide | 85 | 2024-12-04T00:00:00.000+01:00 · 2024-11-29T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.datePublicationWeb` | texte | 85 | 2023-03-30T15:00:00.000+02:00 · 2023-11-29T18:55:00.000+01:00 |
| `document.divisions.division.denominationStructurelle` | texte | 85 | Annexe Texte comparatif COMPA · Annexe Texte comparatif 2612 |
| `document.divisions.division.titres.titrePrincipal` | texte | 85 | Texte comparatif |
| `document.divisions.division.titres.titrePrincipalCourt` | texte | 85 | Mieux indemniser les dégâts sur les biens immobiliers causés par le retrait-gonflement ... · remédier aux déséquilibres du marché locatif en zone tendue (1176) |
| `document.divisions.division.divisions` | vide | 85 |  |
| `document.divisions.division.dossierRef` | texte | 85 | DLR5L16N47217 · DLR5L16N47722 |
| `document.divisions.division.redacteur` | vide | 85 |  |
| `document.divisions.division.classification.famille` | vide | 85 |  |
| `document.divisions.division.classification.type.code` | texte | 85 | RAPP |
| `document.divisions.division.classification.type.libelle` | texte | 85 | Rapport |
| `document.divisions.division.classification.sousType.code` | texte | 85 | COMPA |
| `document.divisions.division.classification.sousType.libelle` | texte | 85 | Texte comparatif |
| `document.divisions.division.classification.statutAdoption` | texte | 85 | ADOPTCOM |
| `document.divisions.division.auteurs.auteur[]` | liste | 85 | de 2 a 3 entrees |
| `document.divisions.division.auteurs.auteur[].acteur.acteurRef` | texte | 94 | PA795076 · PA794854 |
| `document.divisions.division.auteurs.auteur[].acteur.qualite` | texte | 94 | rapporteur |
| `document.divisions.division.auteurs.auteur[].organe.organeRef` | texte | 85 | PO59048 · PO419610 |
| `document.divisions.division.correction` | vide | 84 |  |
| `document.divisions.division.notice.numNotice` | texte | 85 | 1022 · 1928 |
| `document.divisions.division.notice.formule` | texte | 85 | sur la proposition de loi de Mme Sandrine Rousseau et plusieurs de ses collègues visant... · sur la proposition de loi, après engagement de la procédure accélérée, de Mme Annaïg Le... |
| `document.divisions.division.notice.adoptionConforme` | texte | 85 | false |
| `document.divisions.division.indexation` | vide | 85 |  |
| `document.divisions.division.imprimerie.ISSN` | vide | 85 |  |
| `document.divisions.division.imprimerie.ISBN` | vide | 85 |  |
| `document.divisions.division.imprimerie.DIAN` | vide | 85 |  |
| `document.divisions.division.imprimerie.nbPage` | texte | 85 | 0 · 6 |
| `document.divisions.division.imprimerie.prix` | texte/vide | 85 | 0.75 |
| `document.divisions.division.rapportPublie` | texte | 85 | false |
| `document.divisions.division[].divisions.division[]` | liste | 4 | de 2 a 47 entrees |
| `document.divisions.division[].divisions.division[].@xsi:type` | texte | 97 | rapportParlementaire_Type |
| `document.divisions.division[].divisions.division[].uid` | texte | 97 | RAPPANR5L17B0468-tII-v1 · RAPPANR5L17B0468-tII-v2 |
| `document.divisions.division[].divisions.division[].legislature` | texte | 97 | 17 |
| `document.divisions.division[].divisions.division[].cycleDeVie.chrono.dateCreation` | texte | 97 | 2024-10-19T00:00:00.000+02:00 · 2026-10-09T00:00:00.000+02:00 |
| `document.divisions.division[].divisions.division[].cycleDeVie.chrono.dateDepot` | texte | 97 | 2024-10-19T00:00:00.000+02:00 · 2026-10-10T00:00:00.000+02:00 |
| `document.divisions.division[].divisions.division[].cycleDeVie.chrono.datePublication` | texte/vide | 97 | 2024-11-04T00:00:00.000+01:00 · 2024-11-12T00:00:00.000+01:00 |
| `document.divisions.division[].divisions.division[].cycleDeVie.chrono.datePublicationWeb` | texte/vide | 97 | 2024-10-20T23:45:00.000+02:00 · 2024-10-30T19:00:00.000+01:00 |
| `document.divisions.division[].divisions.division[].denominationStructurelle` | texte | 97 | Volume 1 · Volume 2 |
| `document.divisions.division[].divisions.division[].titres.titrePrincipal` | texte | 97 | Commentaires d'articles · Examen en commission |
| `document.divisions.division[].divisions.division[].titres.titrePrincipalCourt` | texte | 97 | Commentaires d'articles · Examen en commission |
| `document.divisions.division[].divisions.division[].divisions` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].dossierRef` | texte | 97 | DLR5L17N50198 · DLR5L17N54629 |
| `document.divisions.division[].divisions.division[].redacteur` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].classification.famille` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].classification.type.code` | texte | 97 | RAPP |
| `document.divisions.division[].divisions.division[].classification.type.libelle` | texte | 97 | Rapport |
| `document.divisions.division[].divisions.division[].classification.sousType` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].classification.statutAdoption` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].auteurs.auteur[]` | liste | 97 | de 2 a 3 entrees |
| `document.divisions.division[].divisions.division[].auteurs.auteur[].acteur.acteurRef` | texte | 111 | PA942 · PA795454 |
| `document.divisions.division[].divisions.division[].auteurs.auteur[].acteur.qualite` | texte | 111 | rapporteur général · rapporteur spécial |
| `document.divisions.division[].divisions.division[].auteurs.auteur[].organe.organeRef` | texte | 97 | PO59048 |
| `document.divisions.division[].divisions.division[].correction` | vide | 49 |  |
| `document.divisions.division[].divisions.division[].notice.numNotice` | texte | 97 | 468 · 3291 |
| `document.divisions.division[].divisions.division[].notice.formule` | texte | 97 | sur le projet de loi de finances pour 2025 (n°324). · sur le projet de loi de finances pour 2027 (n°3210). |
| `document.divisions.division[].divisions.division[].notice.adoptionConforme` | texte | 97 | false |
| `document.divisions.division[].divisions.division[].indexation` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].imprimerie.ISSN` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].imprimerie.ISBN` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].imprimerie.DIAN` | vide | 97 |  |
| `document.divisions.division[].divisions.division[].imprimerie.nbPage` | texte/vide | 97 | 0 · 197 |
| `document.divisions.division[].divisions.division[].imprimerie.prix` | texte/vide | 97 | 8.5 · 1.5 |
| `document.divisions.division[].divisions.division[].rapportPublie` | texte | 97 | false |
| `document.divisions.division[].correction.typeCorrection` | texte | 6 | Rectifié |
| `document.divisions.division[].correction.niveauCorrection` | texte | 6 | 1 |
| `document.divisions.division[].classification.sousType.libelleEdition` | texte | 16 | d'enquête · des offices parlementaires |
| `document.divisions.division.correction.typeCorrection` | texte | 1 | Rectifié |
| `document.divisions.division.correction.niveauCorrection` | texte | 1 | 2 |
| `document.divisions.division[].divisions.division[].correction.typeCorrection` | texte | 48 | Rectifié |
| `document.divisions.division[].divisions.division[].correction.niveauCorrection` | texte | 48 | 1 |
| `document.organesReferents.organeRef[]` | liste/texte | 78 | 2 entree(s) · PO420120 · PO846868 |
| `dossierParlementaire.@xmlns` | texte | 444 | http://schemas.assemblee-nationale.fr/referentiel |
| `dossierParlementaire.@xmlns:xsi` | texte | 444 | http://www.w3.org/2001/XMLSchema-instance |
| `dossierParlementaire.@xsi:type` | texte | 444 | DossierLegislatif_Type · DossierResolutionAN |
| `dossierParlementaire.uid` | texte | 444 | DLR5L11N19506 · DLR5L11N19545 |
| `dossierParlementaire.legislature` | texte | 444 | 11 · 13 |
| `dossierParlementaire.titreDossier.titre` | texte | 444 | Conditions d'éligibilité aux mandats électoraux · Journée nationale pour l'abolition de la peine de mort |
| `dossierParlementaire.titreDossier.titreChemin` | texte/vide | 444 | 0000070001 · 0103740001 |
| `dossierParlementaire.titreDossier.senatChemin` | texte/vide | 444 | http://www.senat.fr/dossierleg/ppl00-007.html · http://www.senat.fr/dossier-legislatif/ppl00-374.html |
| `dossierParlementaire.procedureParlementaire.code` | texte | 444 | 2 · 5 |
| `dossierParlementaire.procedureParlementaire.libelle` | texte | 444 | Proposition de loi ordinaire · Projet ou proposition de loi organique |
| `dossierParlementaire.initiateur.acteurs.acteur.acteurRef` | texte | 371 | PA2607 · PA592 |
| `dossierParlementaire.initiateur.acteurs.acteur.mandatRef` | texte | 371 | PM87228 · PM88780 |
| `dossierParlementaire.initiateur.organes.organe.organeRef.uid` | texte | 118 | PO78718 · PO846796 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[]` | liste | 113 | de 2 a 8 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 417 | Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].uid` | texte | 417 | L11-SN1-19506 · L11-AN1-19506 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].codeActe` | texte | 417 | SN1 · AN1 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 417 | 1ère lecture (1ère assemblée saisie) · 1ère lecture (2ème assemblée saisie) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 416 | 1ère lecture · 2ème lecture |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].organeRef` | texte | 417 | PO78718 · PO44313 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].dateActe` | vide | 417 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 377 | de 2 a 7 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 1047 | DepotInitiative_Type · Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 1047 | L11-VD115883DI · L11-SN1-COM-19506 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 1047 | SN1-DEPOT · SN1-COM |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 1047 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 1047 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 1047 | PO78718 · PO44313 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 1047 | 2000-10-04T00:00:00.000+02:00 · 2001-05-17T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 473 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 382 | PIONSNR5S170B0007 · PIONANR5L11B3076 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 399 | Etape_Type · Decision_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 399 | L11-VD115884CF · L11-VD115885DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 399 | SN1-COM-FOND · SN1-DEBATS-DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 399 | Travaux de la commission saisie au fond · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 399 | Travaux de la commission saisie au fond · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 399 | PO211495 · PO78718 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 399 | 2001-05-17T00:00:00.000+02:00 · 2002-02-12T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 176 | de 2 a 29 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 718 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 718 | L11-VD115884CFS · L11-VD115887 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 718 | SN1-COM-FOND-SAISIE · SN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 718 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 718 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 718 | PO211495 · PO59051 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 718 | 2000-10-04T00:00:00.000+02:00 · 2001-05-09T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 718 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 134 | PA1447 · PA592 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 134 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 163 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 171 | RAPPSNR5S170B0310 · RAPPSNR5S171B0214 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 171 | PIONSNR5S196BTC0397 · PIONSNR5S199BTC0276 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 56 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.fam_code` | texte | 55 | TSORTF02 · TSORTF03 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.libelle` | texte | 54 | adoptée avec modifications · adoptée sans modification |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.reunionRef` | texte/vide | 56 | RUANR5L16S2023IDS27179 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs` | vide | 55 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.typeTexte` | texte | 55 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.refTexteAssocie` | texte | 55 | PIONSNR5S170BTA0092 · PIONSNR5S171BTA0061 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].provenance` | texte | 251 | PO78718 · PO44313 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].depotInitialLectureDefinitiveRef` | vide | 251 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 167 | SaisieComFond_Type · DecisionMotionCensure_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 167 | L11-VD134038CFS · L12-VD115889CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 167 | AN1-COM-FOND-SAISIE · AN2-COM-FOND-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 167 | Renvoi en commission au fond · Décision sur une motion de censure |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 167 | Renvoi en commission au fond · Décision sur une motion de censure |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 167 | PO59051 · PO420120 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte | 167 | 2001-05-17T00:00:00.000+02:00 · 2002-07-17T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 167 |  |
| `dossierParlementaire.fusionDossier` | vide | 444 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 29 | de 2 a 47 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 112 | PA99999999 · PA526 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 112 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunionRef` | texte/vide | 208 | RUANR5L11S2002IDC230117 · RUANR5L14S2016IDC424629 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].odjRef` | texte/vide | 208 | RUANR5L11S2002IDC230117PT9199 · RUANR5L14S2016IDC424629PT23099 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 175 | de 2 a 16 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 473 | DiscussionSeancePublique_Type · Decision_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 473 | L13-VD141425S20682 · L13-VD141445DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 473 | SN1-DEBATS-SEANCE · SN1-DEBATS-DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 473 | Discussion en séance publique · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 473 | Discussion en séance publique · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 473 | PO78718 · PO211492 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 473 | 2008-11-04T00:00:00.000+01:00 · 2010-04-29T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 451 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte | 402 | RUSNR5L13S2009IDS14249 · RUSNR5L13S2010IDS15174 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 257 | RUSNR5L13S2009IDS14249PT20682 · RUSNR5L13S2010IDS15174PT22623 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 145 | TSORTF01 · TSORTF05 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 145 | adoptée · modifiée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 86 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.typeTexte` | texte | 84 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.refTexteAssocie` | texte | 84 | PIONSNR5S194BTA0010 · PIONSNR5S196BTA0093 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 19 | de 3 a 18 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 105 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 105 | L13-VD151750CFS · L13-VD151752 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 105 | SN1-COM-FOND-SAISIE · SN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 105 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 105 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 105 | PO211492 · PO211495 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 105 | 2010-12-14T00:00:00.000+01:00 · 2011-04-26T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 105 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 17 | PA2538 · PA415467 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 17 | rapporteur · rapporteur pour avis |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 19 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 14 | RAPPSNR5S197B0454 · AVISSNR5S197B0423 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 14 | PIONSNR5S197BTC0455 · PIONSNR5S299BTC0244 |
| `dossierParlementaire.indexation.themes.@niveau` | texte | 2 | 1 |
| `dossierParlementaire.indexation.themes.theme.libelleTheme` | texte | 2 | LOIS DE FINANCES RECTIFICATIVES · IMPOTS ET TAXES |
| `dossierParlementaire.initiateur.acteurs.acteur[]` | liste | 49 | de 2 a 110 entrees |
| `dossierParlementaire.initiateur.acteurs.acteur[].acteurRef` | texte | 594 | PA415446 · PA736158 |
| `dossierParlementaire.initiateur.acteurs.acteur[].mandatRef` | texte | 594 | PM703678 · PM736414 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs.voteRef` | texte | 59 | VTANR5L15V3432 · VTANR5L15V3946 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[]` | liste | 61 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].typeTexte` | texte | 122 | BTA · TAP |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].refTexteAssocie` | texte | 122 | PIONANR5L15BTA0570 · PIONANR5L15TAP0570 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateur.acteurs.acteur.acteurRef` | texte | 16 | PA773441 · PA722190 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateur.acteurs.acteur.mandatRef` | texte | 16 | PM773491 · PM833697 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 16 | de 2 a 4 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 40 | PA720170 · PA720480 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 40 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 16 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 34 | RAPPANR5L15B4385 · RAPPSNR5S359B0776 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 32 | PIONANR5L15BTC4385 · PIONSNR5S359BTC0777 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 26 | TCCMP01 · TCD01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 26 | Accord · Conforme |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | vide | 15 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 15 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 40 | Promulgation_Type · DepotRapport_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 40 | L15-VD202731PL · L17-VD224000 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 40 | PROM-PUB · AN-APPLI-RAPPORT |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 40 | Promulgation d'une loi · Rapport sur l'application des lois |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 40 | Promulgation d'une loi · Rapport sur l'application des lois |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 40 | PO717136 · PO420120 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte | 40 | 2021-08-02T00:00:00.000+02:00 · 2025-02-19T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 40 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteLoiRef` | texte | 27 | PIONSNR5S359BTA0142 · PIONANR5L17BTA0093 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.typeJO` | texte | 38 | JO_LOI_DECRET |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.dateJO` | texte | 38 | 2021-08-03+02:00 · 2025-05-22+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.pageJO` | vide | 38 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.numJO` | texte | 38 | 178 · 119 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.urlLegifrance` | texte | 38 | http://www.legifrance.gouv.fr/WAspad/UnTexteDeJorf?numjo=SSAX2103845L · http://www.legifrance.gouv.fr/WAspad/UnTexteDeJorf?numjo=INTX2204085L |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.referenceNOR` | texte | 38 | SSAX2103845L · INTX2204085L |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.urlEcheancierLoi` | texte/vide | 38 | https://www.legifrance.gouv.fr/dossierlegislatif/JORFDOLE000043153878/?detailType=ECHEA... |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeLoi` | texte | 38 | 2021-1018 · 2025-444 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.titreLoi` | texte | 38 | LOI n° 2021-1018 du 2 août 2021 pour renforcer la prévention en santé au travail · visant à harmoniser le mode de scrutin aux élections municipales afin de garantir la vi... |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie` | texte | 1 | RINFANR5L17B0997 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAdopte` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].casSaisine.fam_code` | texte | 18 | TSCCONT05 · TSCCONT02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].casSaisine.libelle` | texte | 18 | Soixante députés au moins · Premier Ministre |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateurs` | vide | 17 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].motif` | texte | 18 | En application de l'article 61§2 de la Constitution |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateurs.acteurRef` | texte | 1 | PA410 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].urlConclusion` | texte | 11 | http://www.conseil-constitutionnel.fr/decision/2025/2025883DC.htm · http://www.conseil-constitutionnel.fr/decision/2026/2026900DC.htm |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].numDecision` | texte | 11 | 883 · 900 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].anneeDecision` | texte | 11 | 2025 · 2026 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odjRef` | texte | 1 | RUANR5L16S2023IDS27179PT45827 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 2 | de 2 a 5 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 7 | PA608826 · PA793398 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 7 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte | 53 | RUANR5L17S2025IDC453833 · RUANR5L17S2025IDC455472 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 53 | RUANR5L17S2025IDC453833PT34672 · RUANR5L17S2025IDC455472PT35421 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.casSaisine.fam_code` | texte | 1 | TSCCONT05 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.casSaisine.libelle` | texte | 1 | Soixante députés au moins |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.initiateurs` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.motif` | texte | 1 | En application de l'article 61§2 de la Constitution |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 331 | Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.uid` | texte | 331 | L16-SN1-49686 · L17-AN21-50157 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.codeActe` | texte | 331 | SN1 · AN21 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 331 | 1ère lecture (1ère assemblée saisie) · Débat |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 245 | 1ère lecture · Débat |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.organeRef` | texte | 331 | PO78718 · PO838901 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.dateActe` | vide | 331 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 279 | de 2 a 5 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 591 | DepotInitiative_Type · Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 591 | L16-VD218838DI · L16-SN1-COM-49686 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 591 | SN1-DEPOT · SN1-COM |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 591 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 591 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 591 | PO78718 · PO838901 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 591 | 2024-03-27T00:00:00.000+01:00 · 2024-06-19T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 292 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 292 | PIONSNR5S419B0475 · PIONSNR5S419B0699 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 274 | Etape_Type · Decision_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 274 | L16-VD218839CF · L17-VD220221CF |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 274 | SN1-COM-FOND · AN1-COM-FOND |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 274 | Travaux de la commission saisie au fond · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 274 | Travaux de la commission saisie au fond · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 274 | PO211495 · PO211493 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 274 | 2025-01-18T00:00:00.000+01:00 · 2025-01-01T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 22 | de 3 a 6 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 102 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 102 | L16-VD218839CFS · L17-VD222069 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 102 | SN1-COM-FOND-SAISIE · SN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 102 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 102 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 102 | PO211495 · PO419610 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 102 | 2024-03-27T00:00:00.000+01:00 · 2024-11-06T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 102 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 20 | PA828016 · PA719436 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 20 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 20 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 19 | RAPPSNR5S459B0115 · RAPPANR5L17B0477 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 19 | PIONSNR5S459BTC0116 · PIONANR5L17BTC0475 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 3 | SaisieComFond_Type · SaisieComAvis_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 3 | L17-VD227121CFS · L17-VD227414CAS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 3 | AN2-COM-FOND-SAISIE · AN2-COM-AVIS-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 3 | Renvoi en commission au fond · Saisine pour avis d'une commission |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 3 | Renvoi en commission au fond · Saisine pour avis d'une commission |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 3 | PO419610 · PO419865 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte | 3 | 2025-07-09T00:00:00.000+02:00 · 2025-07-17T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 3 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 52 | DepotRapport_Type · Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 52 | L17-VD220215 · L17-AN20-MISINF-50200 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 52 | AN21-APAN · AN20-MISINF |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 52 | Allocution du Président de l'Assemblée nationale · Mission d'information |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 52 | Allocution du Président de l'Assemblée nationale · Mission d'information |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 52 | PO838901 · PO846796 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 52 | 2024-07-18T00:00:00.000+02:00 · 2024-08-30T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 44 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.texteAssocie` | texte | 44 | ALCNANR5L17B0002 · PNREANR5L17B0175 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.texteAdopte` | vide | 15 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 241 | SaisieComFond_Type · RenvoiPrealable_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 241 | L17-VD220221CFS · L17-VD220231CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 241 | SN1-COM-FOND-SAISIE · AN1-COM-FOND-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 241 | Renvoi en commission au fond · Renvoi préalable |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 241 | Renvoi en commission au fond · Renvoi préalable |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 241 | PO211493 · PO211495 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte | 241 | 2024-06-19T00:00:00.000+02:00 · 2024-07-10T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 241 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 1 | CreationOrganeTemporaire_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 1 | L17-VD220615 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 1 | AN20-MISINF-CREA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 1 | Création d'une mission d'information |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 1 | Création d'une mission d'information |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 1 | PO846796 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte | 1 | 2024-07-25T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.initiateurs.organeRef` | texte | 1 | PO846796 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 25 | de 2 a 4 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 59 | Etape_Type · DiscussionSeancePublique_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 59 | L17-VD220754RP · L17-VD222487CF |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 59 | ANLUNI-COM-CAE · ANLUNI-COM-FOND |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 59 | Renvoi préalable à la CAE · Travaux de la commission saisie au fond |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 59 | Renvoi préalable à la CAE · Travaux de la commission saisie au fond |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 59 | PO415287 · PO59047 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 59 | 2024-10-31T00:00:00.000+01:00 · 2026-12-01T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 18 | de 2 a 6 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 78 | RenvoiPrealable_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 78 | L17-VD220754RPS · L17-VD221926 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 78 | ANLUNI-COM-CAE-SAISIE · ANLUNI-COM-CAE-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 78 | Renvoi préalable · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 78 | Renvoi préalable · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 78 | PO415287 · PO59047 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte | 78 | 2024-09-09T00:00:00.000+02:00 · 2024-10-30T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 78 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 15 | PA721896 · PA794810 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 15 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 16 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte/vide | 29 | RUANR5L17S2025IDC453645 · RUANR5L17S2025IDC453648 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 28 | RUANR5L17S2025IDC453645PT34499 · RUANR5L17S2025IDC453648PT34477 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 15 | RAPPANR5L17B0635 · RAPPANR5L17B0555 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 15 | PNREANR5L17BTC0635 · PNREANR5L17BTC0555 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 9 | SaisieComFond_Type · DecisionMotionCensure_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 9 | L17-VD222487CFS · L17-VD222159CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 9 | ANLUNI-COM-FOND-SAISIE · AN21-MOTION-VOTE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 9 | Renvoi en commission au fond · Décision sur une motion de censure |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 9 | Renvoi en commission au fond · Décision sur une motion de censure |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 9 | PO59047 · PO419610 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte | 9 | 2024-11-27T00:00:00.000+01:00 · 2024-11-13T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 9 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 11 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.fam_code` | texte | 8 | TSORTF19 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.libelle` | texte | 8 | considérée comme définitive en application de l'article 151-7 du Règlement |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.reunionRef` | texte/vide | 11 | RUANR5L17S2025IDS28966 · RUANR5L17S2025IDS29266 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs` | vide | 8 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.typeTexte` | texte | 8 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.refTexteAssocie` | texte | 8 | RIONANR5L17BTA0023 · RIONANR5L17BTA0021 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunionRef` | texte | 41 | RUANR5L17S2025IDC453470 · RUANR5L17S2025IDC453551 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].odjRef` | texte | 41 | RUANR5L17S2025IDC453470PT34381 · RUANR5L17S2025IDC453551PT34388 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 32 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte/vide | 31 | RUANR5L17S2025IDS28617 · RUANR5L17S2025IDS28618 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 24 | RUANR5L17S2025IDS28617PT48136 · RUANR5L17S2025IDS28618PT48144 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 7 | TSORTF07 · TSORTF01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 7 | rejetée · adoptée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs.voteRef` | texte | 3 | VTANR5L17V217 · VTANR5L17V4243 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.typeTexte` | texte | 3 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.refTexteAssocie` | texte | 3 | PIONANR5L17BTA0005 · RIONANR5L17BTA0085 |
| `dossierParlementaire.initiateur` | vide | 18 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 1 | VTANR5L17V519 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 1 | TSORTMOT01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.libelle` | texte | 1 | Motion adoptée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateRetrait` | vide | 2 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeDeclaration.fam_code` | texte | 4 | Art.49.3 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeDeclaration.libelle` | texte | 4 | Déclaration engageant la responsabilité du Gouvernement devant l'Assemblée nationale su... |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 3 | VTANR5L17V694 · VTANR5L17V739 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 3 | TSORTMOT02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.libelle` | texte | 3 | Motion rejetée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 3 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie` | texte | 3 | MIONANR5L17B0622-N6 · MIONANR5L17B0622-N7 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateRetrait` | vide | 3 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 7 | de 2 a 3 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 17 | CreationOrganeTemporaire_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 17 | L17-VD221323 · L17-VD221735 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 17 | AN20-COMENQ-CREA · AN20-COMENQ-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 17 | Création d'une commission d'enquête · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 17 | Création d'une commission d'enquête · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 17 | PO848581 · PO852507 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte | 17 | 2024-10-12T00:00:00.000+02:00 · 2024-10-22T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 17 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 4 | PA719558 · PA795746 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 4 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 7 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 3 | RAPPANR5L17B1248 · RAPPANR5L17B1479 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | vide | 3 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 4 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[]` | liste | 4 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].typeTexte` | texte | 8 | BTA · TAP |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].refTexteAssocie` | texte | 8 | RIONANR5L17BTA0040 · RIONANR5L17TAP0040 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 1 | VTANR5L17V519 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 1 | TSORTMOT01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.libelle` | texte | 1 | Motion adoptée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 2 | MIONANR5L17B0638-N2 · MIONANR5L17B0638-N3 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateRetrait` | vide | 2 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].typeDeclaration.fam_code` | texte | 2 | Art.49.3 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].typeDeclaration.libelle` | texte | 2 | Déclaration engageant la responsabilité du Gouvernement devant l'Assemblée nationale su... |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].initiateurs.organeRef` | texte | 4 | PO854014 · PO862599 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 3 | de 2 a 3 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 7 | PA721234 · PA842279 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 7 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].contributionInternaute.dateOuverture` | texte | 3 | 2025-01-09+01:00 · 2025-03-07+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].contributionInternaute.dateFermeture` | texte | 3 | 2025-01-20+01:00 · 2025-05-22+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 1 | VTANR5L17V693 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 1 | TSORTMOT02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.libelle` | texte | 1 | Motion rejetée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie` | texte | 1 | MIONANR5L17B0873-N5 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateRetrait` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odjRef` | texte | 3 | RUANR5L17S2025IDS28966PT49001 · RUANR5L17S2025IDS29266PT49307 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 1 | TMRC01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 1 | rejet du texte par la commission préalable |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 1 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 2 | PA720162 · PA342415 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 2 | rapporteur |

## Cles vues UNE SEULE FOIS

Ce sont les cas particuliers : elles n'existent que dans certains fichiers.
C'est exactement ce que l'ancien tirage — les soixante premiers par ordre
alphabetique — ratait par construction. Une ingestion doit les traiter
comme facultatives.

- `document.divisions.division.correction.typeCorrection`
- `document.divisions.division.correction.niveauCorrection`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAdopte`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateurs.acteurRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odjRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.casSaisine.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.casSaisine.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.initiateurs`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.motif`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.initiateurs.organeRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odSeancejRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odSeancejRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.voteRefs.voteRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.odSeancejRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateRetrait`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]`

## Un fichier entier, listes tronquees a trois entrees

```json
{
  "dossierParlementaire": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "@xsi:type": "DossierLegislatif_Type",
    "uid": "DLR5L17N50588",
    "legislature": "17",
    "titreDossier": {
      "titre": "Projet de loi de financement de la sécurité sociale pour 2025",
      "titreChemin": "plfss_pour_2025",
      "senatChemin": "https://www.senat.fr/dossier-legislatif/plfss2025.html"
    },
    "procedureParlementaire": {
      "code": "4",
      "libelle": "Projet de loi de financement de la sécurité sociale"
    },
    "initiateur": {
      "acteurs": {
        "acteur": [
          {
            "acteurRef": "PA368",
            "mandatRef": "PM847741"
          },
          {
            "acteurRef": "PA719914",
            "mandatRef": "PM847681"
          },
          {
            "acteurRef": "PA642868",
            "mandatRef": "PM847683"
          },
          "... (4 entrees au total, tronque)"
        ]
      }
    },
    "actesLegislatifs": {
      "acteLegislatif": [
        {
          "@xsi:type": "Etape_Type",
          "uid": "L17-AN1-50588",
          "codeActe": "AN1",
          "libelleActe": {
            "nomCanonique": "1ère lecture (1ère assemblée saisie)",
            "libelleCourt": "1ère lecture"
          },
          "organeRef": "PO838901",
          "dateActe": null,
          "actesLegislatifs": {
            "acteLegislatif": [
              {
                "@xsi:type": "DepotInitiative_Type",
                "uid": "L17-VD221234DI",
                "codeActe": "AN1-DEPOT",
                "libelleActe": {
                  "nomCanonique": "1er dépôt d'une initiative.",
                  "libelleCourt": "1er dépôt d'une initiative."
                },
                "organeRef": "PO838901",
                "dateActe": "2024-10-10T00:00:00.000+02:00",
                "actesLegislatifs": null,
                "texteAssocie": "PRJLANR5L17B0325"
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-AN1-COM-50588",
                "codeActe": "AN1-COM",
                "libelleActe": {
                  "nomCanonique": "Travaux des commissions",
                  "libelleCourt": "Travaux des commissions"
                },
                "organeRef": "PO838901",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": [
                    {
                      "@xsi:type": "Etape_Type",
                      "uid": "L17-VD221235CF",
                      "codeActe": "AN1-COM-FOND",
                      "libelleActe": {
                        "nomCanonique": "Travaux de la commission saisie au fond",
                        "libelleCourt": "Travaux de la commission saisie au fond"
                      },
                      "organeRef": "PO420120",
                      "dateActe": null,
                      "actesLegislatifs": {
                        "acteLegislatif": [
                          {
                            "@xsi:type": "SaisieComFond_Type",
                            "uid": "L17-VD221235CFS",
                            "codeActe": "AN1-COM-FOND-SAISIE",
                            "libelleActe": {
                              "nomCanonique": "Renvoi en commission au fond",
                              "libelleCourt": "Renvoi en commission au fond"
                            },
                            "organeRef": "PO420120",
                            "dateActe": "2024-10-10T00:00:00.000+02:00",
                            "actesLegislatifs": null
                          },
                          {
                            "@xsi:type": "NominRapporteurs_Type",
                            "uid": "L17-VD221353",
                            "codeActe": "AN1-COM-FOND-NOMIN",
                            "libelleActe": {
                              "nomCanonique": "Nomination de rapporteur",
                              "libelleCourt": "Nomination de rapporteur"
                            },
                            "organeRef": "PO420120",
                            "dateActe": "2024-07-24T00:00:00.000+02:00",
                            "actesLegislatifs": null,
                            "rapporteurs": {
                              "rapporteur": [
                                {
                                  "acteurRef": "PA794038",
                                  "typeRapporteur": "rapporteur"
                                },
                                {
                                  "acteurRef": "PA795318",
                                  "typeRapporteur": "rapporteur"
                                },
                                {
                                  "acteurRef": "PA795076",
                                  "typeRapporteur": "rapporteur"
                                },
                                "... (5 entrees au total, tronque)"
                              ]
                            },
                            "reunion": null
                          },
                          {
                            "@xsi:type": "DiscussionCommission_Type",
                            "uid": "L17-VD221351R34435",
                            "codeActe": "AN1-COM-FOND-REUNION",
                            "libelleActe": {
                              "nomCanonique": "Réunion de commission",
                              "libelleCourt": "Réunion de commission"
                            },
                            "organeRef": "PO420120",
                            "dateActe": "2024-07-24T09:30:00.000+02:00",
                            "actesLegislatifs": null,
                            "reunionRef": "RUANR5L17S2024IDC453234",
                            "odjRef": "RUANR5L17S2024IDC453234PT34435"
                          },
                          "... (18 entrees au total, tronque)"
                        ]
                      }
                    },
                    {
                      "@xsi:type": "Etape_Type",
                      "uid": "L17-VD221238CA",
                      "codeActe": "AN1-COM-AVIS",
                      "libelleActe": {
                        "nomCanonique": "Travaux d'une commission saisie pour avis",
                        "libelleCourt": "Travaux d'une commission saisie pour avis"
                      },
                      "organeRef": "PO59048",
                      "dateActe": null,
                      "actesLegislatifs": {
                        "acteLegislatif": [
                          {
                            "@xsi:type": "SaisieComAvis_Type",
                            "uid": "L17-VD221238CAS",
                            "codeActe": "AN1-COM-AVIS-SAISIE",
                            "libelleActe": {
                              "nomCanonique": "Saisine pour avis d'une commission",
                              "libelleCourt": "Saisine pour avis d'une commission"
                            },
                            "organeRef": "PO59048",
                            "dateActe": "2024-10-10T00:00:00.000+02:00",
                            "actesLegislatifs": null
                          },
                          {
                            "@xsi:type": "NominRapporteurs_Type",
                            "uid": "L17-VD221325",
                            "codeActe": "AN1-COM-AVIS-NOMIN",
                            "libelleActe": {
                              "nomCanonique": "Nomination de rapporteur",
                              "libelleCourt": "Nomination de rapporteur"
                            },
                            "organeRef": "PO59048",
                            "dateActe": "2024-10-09T00:00:00.000+02:00",
                            "actesLegislatifs": null,
                            "rapporteurs": {
                              "rapporteur": {
                                "acteurRef": "PA408578",
                                "typeRapporteur": "rapporteur pour avis"
                              }
                            },
                            "reunion": null
                          },
                          {
                            "@xsi:type": "DepotRapport_Type",
                            "uid": "L17-VD221759",
                            "codeActe": "AN1-COM-AVIS-RAPPORT",
                            "libelleActe": {
                              "nomCanonique": "Dépôt de rapport",
                              "libelleCourt": "Dépôt de rapport"
                            },
                            "organeRef": "PO59048",
                            "dateActe": "2024-10-23T00:00:00.000+02:00",
                            "actesLegislatifs": null,
                            "texteAssocie": "AVISANR5L17B0480",
                            "texteAdopte": null
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-AN1-DEBATS-50588",
                "codeActe": "AN1-DEBATS",
                "libelleActe": {
                  "nomCanonique": "Discussion en séance publique",
                  "libelleCourt": "Discussion en séance publique"
                },
                "organeRef": "PO838901",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": [
                    {
                      "@xsi:type": "DiscussionSeancePublique_Type",
                      "uid": "L17-VD221329S48154",
                      "codeActe": "AN1-DEBATS-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-10-28T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUANR5L17S2025IDS28620",
                      "odjRef": "RUANR5L17S2025IDS28620PT48154"
                    },
                    {
                      "@xsi:type": "DiscussionSeancePublique_Type",
                      "uid": "L17-VD221329S48155",
                      "codeActe": "AN1-DEBATS-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-10-28T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUANR5L17S2025IDS28621",
                      "odjRef": "RUANR5L17S2025IDS28621PT48155"
                    },
                    {
                      "@xsi:type": "DiscussionSeancePublique_Type",
                      "uid": "L17-VD221329S48158",
                      "codeActe": "AN1-DEBATS-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-10-29T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUANR5L17S2025IDS28625",
                      "odjRef": "RUANR5L17S2025IDS28625PT48158"
                    },
                    "... (10 entrees au total, tronque)"
                  ]
                }
              }
            ]
          }
        },
        {
          "@xsi:type": "Etape_Type",
          "uid": "L17-SN1-50588",
          "codeActe": "SN1",
          "libelleActe": {
            "nomCanonique": "1ère lecture (2ème assemblée saisie)",
            "libelleCourt": "1ère lecture"
          },
          "organeRef": "PO78718",
          "dateActe": null,
          "actesLegislatifs": {
            "acteLegislatif": [
              {
                "@xsi:type": "DepotInitiativeNavette_Type",
                "uid": "L17-VD222142DIN",
                "codeActe": "SN1-DEPOT",
                "libelleActe": {
                  "nomCanonique": "Dépôt d'une initiative en navette",
                  "libelleCourt": "Dépôt d'une initiative en navette"
                },
                "organeRef": "PO78718",
                "dateActe": "2024-11-08T00:00:00.000+01:00",
                "actesLegislatifs": null,
                "texteAssocie": "PRJLSNR5S459B0129",
                "provenance": "PO838901",
                "depotInitialLectureDefinitiveRef": null
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-SN1-COM-50588",
                "codeActe": "SN1-COM",
                "libelleActe": {
                  "nomCanonique": "Travaux des commissions",
                  "libelleCourt": "Travaux des commissions"
                },
                "organeRef": "PO78718",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": {
                    "@xsi:type": "Etape_Type",
                    "uid": "L17-VD222143CF",
                    "codeActe": "SN1-COM-FOND",
                    "libelleActe": {
                      "nomCanonique": "Travaux de la commission saisie au fond",
                      "libelleCourt": "Travaux de la commission saisie au fond"
                    },
                    "organeRef": "PO211493",
                    "dateActe": null,
                    "actesLegislatifs": {
                      "acteLegislatif": [
                        {
                          "@xsi:type": "SaisieComFond_Type",
                          "uid": "L17-VD222143CFS",
                          "codeActe": "SN1-COM-FOND-SAISIE",
                          "libelleActe": {
                            "nomCanonique": "Renvoi en commission au fond",
                            "libelleCourt": "Renvoi en commission au fond"
                          },
                          "organeRef": "PO211493",
                          "dateActe": "2024-11-08T00:00:00.000+01:00",
                          "actesLegislatifs": null
                        },
                        {
                          "@xsi:type": "NominRapporteurs_Type",
                          "uid": "L17-VD222163",
                          "codeActe": "SN1-COM-FOND-NOMIN",
                          "libelleActe": {
                            "nomCanonique": "Nomination de rapporteur",
                            "libelleCourt": "Nomination de rapporteur"
                          },
                          "organeRef": "PO211493",
                          "dateActe": null,
                          "actesLegislatifs": null,
                          "rapporteurs": {
                            "rapporteur": [
                              {
                                "acteurRef": "PA703498",
                                "typeRapporteur": "rapporteur"
                              },
                              {
                                "acteurRef": "PA703515",
                                "typeRapporteur": "rapporteur"
                              },
                              {
                                "acteurRef": "PA267081",
                                "typeRapporteur": "rapporteur"
                              },
                              "... (6 entrees au total, tronque)"
                            ]
                          },
                          "reunion": null
                        },
                        {
                          "@xsi:type": "DepotRapport_Type",
                          "uid": "L17-VD222169",
                          "codeActe": "SN1-COM-FOND-RAPPORT",
                          "libelleActe": {
                            "nomCanonique": "Dépôt de rapport",
                            "libelleCourt": "Dépôt de rapport"
                          },
                          "organeRef": "PO211493",
                          "dateActe": "2024-11-13T00:00:00.000+01:00",
                          "actesLegislatifs": null,
                          "texteAssocie": "RAPPSNR5S459B0138",
                          "texteAdopte": null
                        }
                      ]
                    }
                  }
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-SN1-DEBATS-50588",
                "codeActe": "SN1-DEBATS",
                "libelleActe": {
                  "nomCanonique": "Discussion en séance publique",
                  "libelleCourt": "Discussion en séance publique"
                },
                "organeRef": "PO78718",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": [
                    {
                      "@xsi:type": "DiscussionSeancePublique_Type",
                      "uid": "L17-VD222454S48512",
                      "codeActe": "SN1-DEBATS-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO78718",
                      "dateActe": "2024-11-26T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUSNR5L17S2025IDS28817",
                      "odjRef": "RUSNR5L17S2025IDS28817PT48512"
                    },
                    {
                      "@xsi:type": "Decision_Type",
                      "uid": "L17-VD222455DEC",
                      "codeActe": "SN1-DEBATS-DEC",
                      "libelleActe": {
                        "nomCanonique": "Décision",
                        "libelleCourt": "Décision"
                      },
                      "organeRef": "PO78718",
                      "dateActe": "2024-11-26T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "statutConclusion": {
                        "fam_code": "TSORTF05",
                        "libelle": "modifié"
                      },
                      "reunionRef": "RUSNR5L17S2025IDS28817",
                      "voteRefs": null,
                      "textesAssocies": {
                        "texteAssocie": {
                          "typeTexte": "BTA",
                          "refTexteAssocie": "PRJLSNR5S459BTA0029"
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          "@xsi:type": "Etape_Type",
          "uid": "L17-CMP-50588",
          "codeActe": "CMP",
          "libelleActe": {
            "nomCanonique": "Commission Mixte Paritaire",
            "libelleCourt": "Commission Mixte Paritaire"
          },
          "organeRef": "PO851140",
          "dateActe": null,
          "actesLegislatifs": {
            "acteLegislatif": [
              {
                "@xsi:type": "RenvoiCMP_Type",
                "uid": "L17-VD222458CMPS",
                "codeActe": "CMP-SAISIE",
                "libelleActe": {
                  "nomCanonique": "Convocation d'une CMP",
                  "libelleCourt": "Convocation d'une CMP"
                },
                "organeRef": "PO851140",
                "dateActe": "2024-11-26T00:00:00.000+01:00",
                "actesLegislatifs": null,
                "initiateur": {
                  "acteurs": {
                    "acteur": {
                      "acteurRef": "PA368",
                      "mandatRef": "PM847741"
                    }
                  }
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-VD222458COM",
                "codeActe": "CMP-COM",
                "libelleActe": {
                  "nomCanonique": "Commission Mixte Paritaire",
                  "libelleCourt": "Commission Mixte Paritaire"
                },
                "organeRef": "PO851140",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": [
                    {
                      "@xsi:type": "NominRapporteurs_Type",
                      "uid": "L17-VD222479",
                      "codeActe": "CMP-COM-NOMIN",
                      "libelleActe": {
                        "nomCanonique": "Nomination de rapporteur",
                        "libelleCourt": "Nomination de rapporteur"
                      },
                      "organeRef": "PO851140",
                      "dateActe": "2024-11-27T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "rapporteurs": {
                        "rapporteur": [
                          {
                            "acteurRef": "PA703498",
                            "typeRapporteur": "rapporteur"
                          },
                          {
                            "acteurRef": "PA794038",
                            "typeRapporteur": "rapporteur"
                          }
                        ]
                      },
                      "reunion": null
                    },
                    {
                      "@xsi:type": "DepotRapport_Type",
                      "uid": "L17-VD222494",
                      "codeActe": "CMP-COM-RAPPORT-AN",
                      "libelleActe": {
                        "nomCanonique": "Dépôt du rapport d'une CMP",
                        "libelleCourt": "Dépôt du rapport d'une CMP"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-11-27T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "texteAssocie": "RAPPANR5L17B0638",
                      "texteAdopte": "PRJLANR5L17BTC0638"
                    },
                    {
                      "@xsi:type": "DepotRapport_Type",
                      "uid": "L17-VD222495",
                      "codeActe": "CMP-COM-RAPPORT-SN",
                      "libelleActe": {
                        "nomCanonique": "Dépôt du rapport d'une CMP",
                        "libelleCourt": "Dépôt du rapport d'une CMP"
                      },
                      "organeRef": "PO78718",
                      "dateActe": "2024-11-27T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "texteAssocie": "RAPPSNR5S459B0168",
                      "texteAdopte": "PRJLSNR5S459BTC0169"
                    }
                  ]
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-CMP-DEBATS-AN-50975",
                "codeActe": "CMP-DEBATS-AN",
                "libelleActe": {
                  "nomCanonique": "Discussion en séance publique",
                  "libelleCourt": "Discussion en séance publique"
                },
                "organeRef": "PO838901",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": [
                    {
                      "@xsi:type": "DiscussionSeancePublique_Type",
                      "uid": "L17-VD222665S48548",
                      "codeActe": "CMP-DEBATS-AN-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-12-04T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUANR5L17S2025IDS28742",
                      "odjRef": "RUANR5L17S2025IDS28742PT48548"
                    },
                    {
                      "@xsi:type": "DiscussionSeancePublique_Type",
                      "uid": "L17-VD222665S48549",
                      "codeActe": "CMP-DEBATS-AN-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-12-04T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUANR5L17S2025IDS28742",
                      "odjRef": "RUANR5L17S2025IDS28742PT48549"
                    }
                  ]
                }
              },
              "... (7 entrees au total, tronque)"
            ]
          }
        },
        "... (7 entrees au total, tronque)"
      ]
    },
    "fusionDossier": null
  }
}
```
