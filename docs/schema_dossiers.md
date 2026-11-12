# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **11082**
- Fichiers ouverts pour le tirage : **3000** (pas de 3)
- Fichiers decrits : **3000** — tous ceux qui ont ete ouverts
- Cles distinctes trouvees : **480**
- Fichier montre en entier plus bas : `json/dossierParlementaire/DLR5L16N47509.json` (le plus riche de l'echantillon)

## Arborescence des cles

`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un
nombre de fichiers : une cle situee dans une liste est comptee une fois par
element. Une cle vue beaucoup moins souvent que les autres est un cas
particulier, et l'ingestion doit la traiter comme facultative. Les cles vues
une seule fois sont reprises a part, plus bas.

| chemin | type | vu | exemples |
|---|---|---|---|
| `document.@xmlns` | texte | 2553 | http://schemas.assemblee-nationale.fr/referentiel |
| `document.@xmlns:xsi` | texte | 2553 | http://www.w3.org/2001/XMLSchema-instance |
| `document.@xsi:type` | texte | 2553 | accordInternational_Type · avisConseilEtat_Type |
| `document.uid` | texte | 2553 | ACINANR5L16B2159 · ACINANR5L16B2628 |
| `document.legislature` | texte/vide | 2552 | 16 · 17 |
| `document.cycleDeVie.chrono.dateCreation` | texte/vide | 2552 | 2024-02-07T00:00:00.000+01:00 · 2024-05-16T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.dateDepot` | texte/vide | 2552 | 2024-02-07T00:00:00.000+01:00 · 2024-05-16T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.datePublication` | texte/vide | 2552 | 2024-04-10T00:00:00.000+02:00 · 2024-05-29T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.datePublicationWeb` | texte/vide | 2552 | 2024-02-09T14:56:00.000+01:00 · 2024-05-22T11:40:00.000+02:00 |
| `document.denominationStructurelle` | texte | 2552 | Projet de loi · Proposition de loi |
| `document.provenance` | texte | 2541 | Texte Déposé · Commission |
| `document.titres.titrePrincipal` | texte | 2552 | Accord international sur le projet de loi autorisant l’approbation de l’accord entre le... · Accord international sur le projet de loi autorisant la ratification de l’accord se rap... |
| `document.titres.titrePrincipalCourt` | texte | 2552 | accord Papouasie Nouvelle Guinée défense · Convention des Nations unies sur le droit de la mer et conservation et utilisation dura... |
| `document.divisions` | vide | 2438 |  |
| `document.dossierRef` | texte | 2552 | DLR5L16N49392 · DLR5L16N49957 |
| `document.redacteur` | vide | 2552 |  |
| `document.classification.famille.depot.code` | texte | 2552 | INITDEP · INITNAV |
| `document.classification.famille.depot.libelle` | texte | 2552 | Initiative en 1er Dépôt · Initiative en Navette |
| `document.classification.famille.classe.code` | texte | 2552 | PRJLOI · PIONLOI |
| `document.classification.famille.classe.libelle` | texte | 2552 | Projet de loi · Proposition de loi |
| `document.classification.famille.espece.code` | texte | 537 | AUTRATCONV · ORG |
| `document.classification.famille.espece.libelle` | texte | 537 | autorisant la ratification d'une convention · organique |
| `document.classification.type.code` | texte | 2552 | ACIN · AVCE |
| `document.classification.type.libelle` | texte | 2552 | Accord international · Avis du Conseil d'Etat |
| `document.classification.sousType.code` | texte | 537 | AUTRATCONV · ORG |
| `document.classification.sousType.libelle` | texte | 525 | autorisant la ratification d'une convention · organique |
| `document.classification.sousType.libelleEdition` | texte | 273 | autorisant la ratification d'une convention · organique |
| `document.classification.statutAdoption` | texte/vide | 2552 | ADOPTSEANCE · ADOPTCOM |
| `document.auteurs.auteur.acteur.acteurRef` | texte | 966 | PA722190 · PA368 |
| `document.auteurs.auteur.acteur.qualite` | texte | 966 | auteur · rapporteur |
| `document.correction` | vide | 2521 |  |
| `document.notice.numNotice` | texte | 2541 | 2159 · 2628 |
| `document.notice.formule` | texte | 2541 | autorisant l’approbation de l’accord entre le Gouvernement de la République française e... · autorisant la ratification de l’accord se rapportant à la convention des Nations unies ... |
| `document.notice.adoptionConforme` | texte | 2552 | false |
| `document.indexation` | vide | 2533 |  |
| `document.imprimerie.ISSN` | texte/vide | 2552 | 77/2025 |
| `document.imprimerie.ISBN` | vide | 2552 |  |
| `document.imprimerie.DIAN` | texte/vide | 2552 | 75/2024 · 77/2024 |
| `document.imprimerie.nbPage` | texte/vide | 2552 | 0 · 3 |
| `document.imprimerie.prix` | texte/vide | 2552 | 2.0 · 3.299999952316284 |
| `document.auteurs.auteur.organe.organeRef` | texte | 715 | PO838901 · PO230434 |
| `document.classification.sousType` | vide | 2015 |  |
| `document.auteurs.auteur[]` | liste | 871 | de 2 a 192 entrees |
| `document.auteurs.auteur[].acteur.acteurRef` | texte | 2814 | PA720704 · PA266797 |
| `document.auteurs.auteur[].acteur.qualite` | texte | 2814 | auteur · rapporteur pour avis |
| `document.auteurs.auteur[].organe.organeRef` | texte | 768 | PO59048 · PO419865 |
| `document.organesReferents.organeRef` | texte | 1816 | PO420120 · PO59048 |
| `document.coSignataires` | vide | 1488 |  |
| `document.depotAmendements` | vide | 121 |  |
| `document.divisions.division[]` | liste | 20 | de 2 a 10 entrees |
| `document.divisions.division[].@xsi:type` | texte | 79 | texteLoi_Type · rapportParlementaire_Type |
| `document.divisions.division[].uid` | texte | 79 | AVISANR5L17B0471-tI · AVISANR5L17B0471-tII |
| `document.divisions.division[].legislature` | texte | 79 | 17 · 16 |
| `document.divisions.division[].cycleDeVie.chrono.dateCreation` | texte | 79 | 2024-10-23T00:00:00.000+02:00 · 2024-10-25T00:00:00.000+02:00 |
| `document.divisions.division[].cycleDeVie.chrono.dateDepot` | texte | 79 | 2024-10-23T00:00:00.000+02:00 · 2024-10-25T00:00:00.000+02:00 |
| `document.divisions.division[].cycleDeVie.chrono.datePublication` | texte/vide | 79 | 2024-11-18T00:00:00.000+01:00 · 2024-11-13T00:00:00.000+01:00 |
| `document.divisions.division[].cycleDeVie.chrono.datePublicationWeb` | texte/vide | 79 | 2024-11-13T18:00:00.000+01:00 · 2024-11-13T20:40:00.000+01:00 |
| `document.divisions.division[].denominationStructurelle` | texte | 79 | Tome I · Tome II |
| `document.divisions.division[].titres.titrePrincipal` | texte | 79 | Administration générale et territoriale de l'État : Administration générale et territor... · Sécurités : Sécurité |
| `document.divisions.division[].titres.titrePrincipalCourt` | texte | 79 | Administration générale et territoriale de l'État : Administration générale et territor... · Sécurités : Sécurité |
| `document.divisions.division[].divisions` | vide | 79 |  |
| `document.divisions.division[].dossierRef` | texte | 79 | DLR5L17N50198 · DLR5L17N52428 |
| `document.divisions.division[].redacteur` | vide | 79 |  |
| `document.divisions.division[].classification.famille` | vide | 79 |  |
| `document.divisions.division[].classification.type.code` | texte | 79 | AVIS · RAPP |
| `document.divisions.division[].classification.type.libelle` | texte | 79 | Avis · Rapport |
| `document.divisions.division[].classification.sousType` | vide | 61 |  |
| `document.divisions.division[].classification.statutAdoption` | texte/vide | 79 | ADOPTCOM |
| `document.divisions.division[].auteurs.auteur[]` | liste | 79 | de 2 a 10 entrees |
| `document.divisions.division[].auteurs.auteur[].acteur.acteurRef` | texte | 155 | PA267780 · PA718784 |
| `document.divisions.division[].auteurs.auteur[].acteur.qualite` | texte | 155 | rapporteur pour avis · rapporteur |
| `document.divisions.division[].auteurs.auteur[].organe.organeRef` | texte | 79 | PO59051 · PO419865 |
| `document.divisions.division[].organesReferents.organeRef` | texte | 39 | PO59048 |
| `document.divisions.division[].correction` | vide | 70 |  |
| `document.divisions.division[].notice.numNotice` | texte | 79 | 471 · 486 |
| `document.divisions.division[].notice.formule` | texte | 79 | sur le projet de loi de finances pour 2025 (n°324). · sur le projet de loi de finances pour 2026 (n°1906). |
| `document.divisions.division[].notice.adoptionConforme` | texte | 79 | false |
| `document.divisions.division[].indexation` | vide | 79 |  |
| `document.divisions.division[].imprimerie.ISSN` | vide | 79 |  |
| `document.divisions.division[].imprimerie.ISBN` | vide | 79 |  |
| `document.divisions.division[].imprimerie.DIAN` | texte/vide | 79 | 117/2025 · 53 / 2026 |
| `document.divisions.division[].imprimerie.nbPage` | texte/vide | 79 | 0 · 84 |
| `document.divisions.division[].imprimerie.prix` | texte/vide | 79 | 1.5 · 2.0 |
| `document.divisions.division[].coSignataires` | vide | 41 |  |
| `document.divisions.division[].depotAmendements` | vide | 41 |  |
| `document.indexation.themes.@niveau` | texte | 19 | 1 |
| `document.indexation.themes.theme.libelleTheme` | texte | 19 | LOIS DE FINANCES RECTIFICATIVES · SANTE PUBLIQUE |
| `document.organesReferents` | vide | 291 |  |
| `document.coSignataires.coSignataire[]` | liste | 603 | de 2 a 271 entrees |
| `document.coSignataires.coSignataire[].acteur.acteurRef` | texte | 20638 | PA305 · PA885 |
| `document.coSignataires.coSignataire[].dateCosignature` | texte | 20639 | 1999-12-23+01:00 · 2010-05-03+02:00 |
| `document.coSignataires.coSignataire[].dateRetraitCosignature` | texte/vide | 20639 | 2025-02-17+01:00 · 2025-03-13+01:00 |
| `document.coSignataires.coSignataire[].edite` | texte | 20639 | false · true |
| `document.depotAmendements.amendementsSeance.amendable` | texte | 2019 | false · true |
| `document.depotAmendements.amendementsSeance.dateLimiteDepot` | vide | 2019 |  |
| `document.depotAmendements.amendementsCommission.commission.organeRef` | texte | 1163 | PO59051 · PO59048 |
| `document.depotAmendements.amendementsCommission.commission.amendable` | texte | 1163 | true |
| `document.depotAmendements.amendementsCommission.commission.dateLimiteDepot` | vide | 1163 |  |
| `document.correction.typeCorrection` | texte | 31 | Rectifié |
| `document.correction.niveauCorrection` | texte | 31 | 1 · 2 |
| `document.coSignataires.coSignataire.acteur.acteurRef` | texte | 46 | PA330008 · PA795330 |
| `document.coSignataires.coSignataire.dateCosignature` | texte | 49 | 2024-11-19+01:00 · 2024-10-29+01:00 |
| `document.coSignataires.coSignataire.dateRetraitCosignature` | vide | 49 |  |
| `document.coSignataires.coSignataire.edite` | texte | 49 | false · true |
| `document.depotAmendements.amendementsCommission.commission[]` | liste | 30 | de 2 a 8 entrees |
| `document.depotAmendements.amendementsCommission.commission[].organeRef` | texte | 76 | PO419865 · PO419610 |
| `document.depotAmendements.amendementsCommission.commission[].amendable` | texte | 76 | true |
| `document.depotAmendements.amendementsCommission.commission[].dateLimiteDepot` | vide | 76 |  |
| `document.coSignataires.coSignataire[].organe.organeRef` | texte | 1 | PO77714 |
| `document.coSignataires.coSignataire[].organe.etApparentes` | texte | 1 | false |
| `document.coSignataires.coSignataire.organe.organeRef` | texte | 3 | PO77710 |
| `document.coSignataires.coSignataire.organe.etApparentes` | texte | 3 | true · false |
| `document.metadatas.dateSuppression` | texte | 1 | 2026-11-11T06:06:39.511217 |
| `document.rapportPublie` | texte | 384 | false · true |
| `document.divisions.division.@xsi:type` | texte | 94 | rapportParlementaire_Type · texteLoi_Type |
| `document.divisions.division.uid` | texte | 94 | RAPPANR5L15B3881-COMPA · RAPPANR5L15B4994-COMPA |
| `document.divisions.division.legislature` | texte | 94 | 15 · 16 |
| `document.divisions.division.cycleDeVie.chrono.dateCreation` | texte | 94 | 2021-02-11T00:00:00.000+01:00 · 2022-02-03T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.dateDepot` | texte | 94 | 2021-02-11T00:00:00.000+01:00 · 2022-02-03T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.datePublication` | texte/vide | 94 | 2024-03-08T00:00:00.000+01:00 · 2024-12-04T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.datePublicationWeb` | texte | 94 | 2021-02-11T14:16:00.000+01:00 · 2022-02-03T20:50:00.000+01:00 |
| `document.divisions.division.denominationStructurelle` | texte | 94 | Annexe Texte comparatif COMPA · Tome 2 |
| `document.divisions.division.titres.titrePrincipal` | texte | 94 | Texte comparatif · Comptes rendus des auditions |
| `document.divisions.division.titres.titrePrincipalCourt` | texte | 94 | Texte comparatif · Création de l’homicide routier et visant à lutter contre la violence routière |
| `document.divisions.division.divisions` | vide | 94 |  |
| `document.divisions.division.dossierRef` | texte | 94 | DLR5L15N41215 · DLR5L15N41449 |
| `document.divisions.division.redacteur` | vide | 94 |  |
| `document.divisions.division.classification.famille` | vide | 94 |  |
| `document.divisions.division.classification.type.code` | texte | 94 | RAPP · RINF |
| `document.divisions.division.classification.type.libelle` | texte | 94 | Rapport · Rapport d'information |
| `document.divisions.division.classification.sousType.code` | texte | 93 | COMPA · ENQU |
| `document.divisions.division.classification.sousType.libelle` | texte | 92 | Texte comparatif · d'enquête |
| `document.divisions.division.classification.statutAdoption` | texte/vide | 94 | ADOPTCOM |
| `document.divisions.division.auteurs.auteur[]` | liste | 94 | de 2 a 5 entrees |
| `document.divisions.division.auteurs.auteur[].acteur.acteurRef` | texte | 115 | PA720170 · PA720480 |
| `document.divisions.division.auteurs.auteur[].acteur.qualite` | texte | 115 | rapporteur |
| `document.divisions.division.auteurs.auteur[].organe.organeRef` | texte | 94 | PO420120 · PO419604 |
| `document.divisions.division.correction` | vide | 91 |  |
| `document.divisions.division.notice.numNotice` | texte | 94 | 3881 · 4994 |
| `document.divisions.division.notice.formule` | texte | 94 | sur la proposition de loi, après engagement de la procédure accélérée, de Mmes Charlott... · , en nouvelle lecture, sur la proposition de loi, modifiée par le Sénat, visant à démoc... |
| `document.divisions.division.notice.adoptionConforme` | texte | 94 | false |
| `document.divisions.division.indexation` | vide | 94 |  |
| `document.divisions.division.imprimerie.ISSN` | vide | 94 |  |
| `document.divisions.division.imprimerie.ISBN` | vide | 94 |  |
| `document.divisions.division.imprimerie.DIAN` | vide | 94 |  |
| `document.divisions.division.imprimerie.nbPage` | texte | 94 | 0 |
| `document.divisions.division.imprimerie.prix` | texte/vide | 94 | 0.75 · 1.0 |
| `document.divisions.division.rapportPublie` | texte | 93 | false |
| `document.divisions.division[].classification.sousType.code` | texte | 18 | COMPA · ENQU |
| `document.divisions.division[].classification.sousType.libelle` | texte | 18 | Texte comparatif · d'enquête |
| `document.divisions.division[].correction.typeCorrection` | texte | 9 | Rectifié |
| `document.divisions.division[].correction.niveauCorrection` | texte | 9 | 1 · 2 |
| `document.divisions.division[].rapportPublie` | texte | 38 | false · true |
| `document.divisions.division.correction.typeCorrection` | texte | 3 | Rectifié |
| `document.divisions.division.correction.niveauCorrection` | texte | 3 | 1 · 2 |
| `document.divisions.division.classification.sousType.libelleEdition` | texte | 1 | d'enquête |
| `document.divisions.division[].classification.sousType.libelleEdition` | texte | 10 | d'enquête |
| `document.divisions.division.classification.sousType` | vide | 1 |  |
| `document.organesReferents.organeRef[]` | liste/texte | 99 | 2 entree(s) · PO59047 · PO849911 |
| `document.divisions.division.organesReferents.organeRef` | texte | 1 | PO420120 |
| `document.divisions.division.coSignataires` | vide | 1 |  |
| `document.divisions.division.depotAmendements` | vide | 1 |  |
| `document.divisions.division[].organesReferents` | vide | 2 |  |
| `dossierParlementaire.@xmlns` | texte | 447 | http://schemas.assemblee-nationale.fr/referentiel |
| `dossierParlementaire.@xmlns:xsi` | texte | 447 | http://www.w3.org/2001/XMLSchema-instance |
| `dossierParlementaire.@xsi:type` | texte | 447 | DossierLegislatif_Type · DossierResolutionAN |
| `dossierParlementaire.uid` | texte | 447 | DLR5L11N19503 · DLR5L11N19541 |
| `dossierParlementaire.legislature` | texte | 447 | 11 · 12 |
| `dossierParlementaire.titreDossier.titre` | texte | 447 | Droit de vote et éligibilité des étrangers aux élections · Contrôle sur la transposition des directives communautaires |
| `dossierParlementaire.titreDossier.titreChemin` | texte/vide | 447 | 992063 · 0101830001 |
| `dossierParlementaire.titreDossier.senatChemin` | texte/vide | 447 | http://www.senat.fr/dossier-legislatif/ppl99-329.html · http://www.senat.fr/dossier-legislatif/ppl00-183.html |
| `dossierParlementaire.procedureParlementaire.code` | texte | 447 | 7 · 2 |
| `dossierParlementaire.procedureParlementaire.libelle` | texte | 447 | Projet ou proposition de loi constitutionnelle · Proposition de loi ordinaire |
| `dossierParlementaire.initiateur.acteurs.acteur.acteurRef` | texte | 374 | PA294 · PA1597 |
| `dossierParlementaire.initiateur.acteurs.acteur.mandatRef` | texte | 374 | PM58570 · PM88798 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[]` | liste | 98 | de 2 a 8 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 368 | Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].uid` | texte | 368 | L11-AN1-19503 · L11-SN1-19503 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].codeActe` | texte | 368 | AN1 · SN1 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 368 | 1ère lecture (1ère assemblée saisie) · 1ère lecture (2ème assemblée saisie) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 368 | 1ère lecture · 2ème lecture |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].organeRef` | texte | 368 | PO44313 · PO78718 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].dateActe` | vide | 368 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 340 | de 2 a 6 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 882 | DepotInitiative_Type · Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 882 | L11-VD115850DI · L11-AN1-COM-19503 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 882 | AN1-DEPOT · AN1-COM |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 882 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 882 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 882 | PO44313 · PO78718 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 882 | 1999-12-23T00:00:00.000+01:00 · 2000-05-04T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 393 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 336 | PIONANR5L11B2063 · PIONSNR5S169B0329 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 369 | Etape_Type · Decision_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 369 | L11-VD115851CF · L11-VD115859CF |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 369 | AN1-COM-FOND · SN1-COM-FOND |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 369 | Travaux de la commission saisie au fond · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 369 | Travaux de la commission saisie au fond · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 369 | PO59051 · PO211495 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 369 | 2001-06-14T00:00:00.000+02:00 · 2019-01-31T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 148 | de 2 a 12 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 580 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 580 | L11-VD115851CFS · L11-VD115854 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 580 | AN1-COM-FOND-SAISIE · AN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 580 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 580 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 580 | PO59051 · PO211495 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 580 | 1999-12-23T00:00:00.000+01:00 · 2000-03-29T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 580 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 130 | PA2045 · PA429891 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 130 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 140 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunionRef` | texte | 148 | RUANR5L11S2000IDC215039 · RUANR5L11S2000IDC215149 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].odjRef` | texte | 148 | RUANR5L11S2000IDC215039PT9180 · RUANR5L11S2000IDC215149PT9181 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 144 | RAPPANR5L11B2340 · RAPPSNR5S198B0142 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 144 | PIONSNR5S198BTC0143 · PIONANR5L17BTC2428 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 120 | de 2 a 20 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 308 | DiscussionSeancePublique_Type · MotionProcedure_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 308 | L11-VD115857S15211 · L11-VD130173S17332 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 308 | AN1-DEBATS-SEANCE · AN1-DEBATS-MOTION |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 308 | Discussion en séance publique · Motion de procédure |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 308 | Discussion en séance publique · Motion de procédure |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 308 | PO44313 · PO78718 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 308 | 2000-05-02T00:00:00.000+02:00 · 2000-05-03T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 300 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte/vide | 275 | RUANR5L11S2000IDS9667 · RUANR5L11S2000IDS9670 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 168 | RUANR5L11S2000IDS9667PT15211 · RUANR5L11S2000IDS9670PT17332 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeMotion.fam_code` | texte | 2 | TMP03 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeMotion.libelle` | texte | 2 | Motions de renvoi en commission |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateRetrait` | vide | 2 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 71 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 107 | TSORTF01 · TSORTF05 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 107 | adoptée · modifiée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.typeTexte` | texte | 63 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.refTexteAssocie` | texte | 63 | PIONANR5L11BTA0505 · PIONSNR5S198BTA0021 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].provenance` | texte | 231 | PO44313 · PO78718 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].depotInitialLectureDefinitiveRef` | texte/vide | 231 | PIONANR5L17B1698 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 174 | SaisieComFond_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 174 | L13-VD155435CFS · L14-VD158604CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 174 | AN2-COM-FOND-SAISIE · AN1-COM-FOND-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 174 | Renvoi en commission au fond |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 174 | Renvoi en commission au fond |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 174 | PO59051 · PO59048 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte | 174 | 2011-12-09T00:00:00.000+01:00 · 2012-07-02T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 174 |  |
| `dossierParlementaire.fusionDossier` | vide | 446 |  |
| `dossierParlementaire.initiateur.organes.organe.organeRef.uid` | texte | 134 | PO78718 · PO847969 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 47 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.fam_code` | texte | 44 | TSORTF03 · TSORTF01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.libelle` | texte | 44 | adoptée sans modification · adoptée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.reunionRef` | texte/vide | 47 | RUANR5L15S2019IDS21473 · RUANR5L17S2025IDS28969 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs` | vide | 43 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.typeTexte` | texte | 42 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.refTexteAssocie` | texte | 42 | PIONSNR5S170BTA0104 · PIONSNR5S339BTA0048 |
| `dossierParlementaire.indexation.themes.@niveau` | texte | 2 | 1 |
| `dossierParlementaire.indexation.themes.theme.libelleTheme` | texte | 2 | AUDIOVISUEL · SANTE PUBLIQUE |
| `dossierParlementaire.initiateur.acteurs.acteur[]` | liste | 47 | de 2 a 68 entrees |
| `dossierParlementaire.initiateur.acteurs.acteur[].acteurRef` | texte | 755 | PA227024 · PA304082 |
| `dossierParlementaire.initiateur.acteurs.acteur[].mandatRef` | texte | 755 | PM430029 · PM430056 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].auteurMotion` | texte | 1 | PA1886 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odjRef` | texte | 3 | RUANR5L15S2019IDS21473PT36804 · RUANR5L17S2025IDS28969PT48933 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 8 | de 3 a 13 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 42 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 42 | L15-VD185744CFS · L15-VD185745 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 42 | SN1-COM-FOND-SAISIE · SN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 42 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 42 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 42 | PO211494 · PO211493 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 42 | 2018-03-07T00:00:00.000+01:00 · 2018-05-30T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 42 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 8 | PA736211 · PA267081 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 8 | rapporteur · rapporteur pour avis |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 8 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 4 | RAPPSNR5S299B0515 · AVISSNR5S299B0514 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 4 | PIONSNR5S299BTC0516 · PRJLANR5L16BTC1234 |
| `dossierParlementaire.fusionDossier.cause` | texte | 1 | Examen commun |
| `dossierParlementaire.fusionDossier.dossierAbsorbantRef` | texte | 1 | DLR5L15N37121 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 10 | de 2 a 3 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 23 | PA721976 · PA605745 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 23 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs.voteRef` | texte | 38 | VTANR5L16V3332 · VTANR5L16V3128 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[]` | liste | 43 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].typeTexte` | texte | 86 | BTA · TAP |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].refTexteAssocie` | texte | 86 | PIONANR5L16BTA0236 · PIONANR5L16TAP0236 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateur.acteurs.acteur.acteurRef` | texte | 8 | PA368 · PA717161 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateur.acteurs.acteur.mandatRef` | texte | 8 | PM847741 · PM791583 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 8 | de 2 a 4 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 21 | PA720022 · PA795794 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 21 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 8 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 15 | RAPPSNR5S419B0456 · RAPPANR5L16B2389 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 15 | PIONSNR5S419BTC0457 · PIONANR5L16BTC2389 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 15 | TCCMP01 · TCD02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 15 | Accord · Partiellement conforme |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | vide | 8 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 8 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 1 | VTANR5L17V692 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie[]` | liste | 2 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie[].typeTexte` | texte | 4 | BTA · TAP |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie[].refTexteAssocie` | texte | 4 | PIONANR5L17BTA0041 · PIONANR5L17TAP0041 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 28 | Promulgation_Type · DepotRapport_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 28 | L17-VD224097PL · L16-VD215069PL |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 28 | PROM-PUB · AN-APPLI-RAPPORT |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 28 | Promulgation d'une loi · Rapport sur l'application des lois |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 28 | Promulgation d'une loi · Rapport sur l'application des lois |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 28 | PO717136 · PO59046 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte | 28 | 2025-02-24T00:00:00.000+01:00 · 2023-08-01T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 28 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteLoiRef` | texte | 24 | PIONSNR5S459BTA0054 · PRJLSNR5S399BTA0162 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.typeJO` | texte | 27 | JO_LOI_DECRET |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.dateJO` | texte | 27 | 2025-02-25+01:00 · 2023-08-02+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.pageJO` | vide | 27 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.numJO` | texte | 27 | 47 · 177 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.urlLegifrance` | texte | 27 | http://www.legifrance.gouv.fr/WAspad/UnTexteDeJorf?numjo=TSSX2330943L · http://www.legifrance.gouv.fr/WAspad/UnTexteDeJorf?numjo=ARMD2305491L |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.referenceNOR` | texte | 27 | TSSX2330943L · ARMD2305491L |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.urlEcheancierLoi` | vide | 27 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeLoi` | texte | 27 | 2025-175 · 2023-703 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.titreLoi` | texte | 27 | visant à interdire les dispositifs électroniques de vapotage à usage unique · relative à la programmation militaire pour les années 2024 à 2030 et portant diverses d... |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].contributionInternaute.dateOuverture` | texte | 1 | 2023-04-06+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].contributionInternaute.dateFermeture` | texte | 1 | 2023-05-22+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte | 22 | RUANR5L16S2023IDC447838 · RUANR5L16S2023IDC448175 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 22 | RUANR5L16S2023IDC447838PT32377 · RUANR5L16S2023IDC448175PT32435 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].casSaisine.fam_code` | texte | 11 | TSCCONT05 · TSCCONT07 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].casSaisine.libelle` | texte | 11 | Soixante députés au moins · De droit (article 61 alinéa 1 de la Constitution) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateurs` | vide | 10 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].motif` | texte | 11 | En application de l'article 61§2 de la Constitution |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].urlConclusion` | texte | 7 | http://www.conseil-constitutionnel.fr/decision/2023/2023854DC.htm · http://www.conseil-constitutionnel.fr/decision/2026/2026903DC.htm |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].numDecision` | texte | 7 | 854 · 903 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].anneeDecision` | texte | 7 | 2023 · 2026 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie` | texte | 1 | RINFANR5L17B1890 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAdopte` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 349 | Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.uid` | texte | 349 | L16-SN1-50006 · L16-SN1-50095 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.codeActe` | texte | 349 | SN1 · AN21 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 349 | 1ère lecture (1ère assemblée saisie) · Débat |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 266 | 1ère lecture · Débat |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.organeRef` | texte | 349 | PO78718 · PO838901 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.dateActe` | vide | 349 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 303 | de 2 a 4 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 631 | DepotInitiative_Type · Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 631 | L16-VD219797DI · L16-SN1-COM-50006 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 631 | SN1-DEPOT · SN1-COM |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 631 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 631 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 631 | PO78718 · PO838901 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 631 | 2024-05-22T00:00:00.000+02:00 · 2024-06-06T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 314 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 316 | PIONSNR5S419B0628 · PIONSNR5S419B0682 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 299 | Etape_Type · DiscussionSeancePublique_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 299 | L16-VD219798CF · L16-VD220118CF |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 299 | SN1-COM-FOND · AN1-COM-FOND |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 299 | Travaux de la commission saisie au fond · Discussion en séance publique |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 299 | Travaux de la commission saisie au fond · Discussion en séance publique |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 299 | PO211494 · PO516753 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 299 | 2025-01-23T00:00:00.000+01:00 · 2025-01-18T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 26 | de 2 a 6 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 117 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 117 | L16-VD219798CFS · L17-VD222065 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 117 | SN1-COM-FOND-SAISIE · SN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 117 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 117 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 117 | PO211494 · PO420120 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 117 | 2024-05-22T00:00:00.000+02:00 · 2024-11-06T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 117 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 26 | PA703514 · PA775176 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 26 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 26 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 23 | RAPPSNR5S459B0120 · RAPPSNR5S459B0022 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 23 | PIONSNR5S459BTC0121 · PIONSNR5S459BTC0023 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 46 | DepotRapport_Type · DepotInitiative_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 46 | L17-VD220213 · L17-VD220721DI |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 46 | AN21-APAN · ANLUNI-DEPOT |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 46 | Allocution du Président de l'Assemblée nationale · 1er dépôt d'une initiative. |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 46 | Allocution du Président de l'Assemblée nationale · 1er dépôt d'une initiative. |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 46 | PO838901 · PO847969 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 46 | 2024-07-18T00:00:00.000+02:00 · 2024-08-29T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 37 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.texteAssocie` | texte | 37 | ALCNANR5L17B0001 · PNREANR5L17B0171 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.texteAdopte` | vide | 16 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 262 | SaisieComFond_Type · RenvoiPrealable_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 262 | L17-VD220219CFS · L17-VD220229CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 262 | SN1-COM-FOND-SAISIE · AN1-COM-FOND-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 262 | Renvoi en commission au fond · Renvoi préalable |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 262 | Renvoi en commission au fond · Renvoi préalable |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 262 | PO516753 · PO211495 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte | 262 | 2024-07-03T00:00:00.000+02:00 · 2024-07-10T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 262 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunionRef` | texte | 42 | RUANR5L17S2025IDC453371 · RUANR5L17S2025IDC453486 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].odjRef` | texte | 42 | RUANR5L17S2025IDC453371PT34355 · RUANR5L17S2025IDC453486PT34375 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 18 | de 2 a 4 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 43 | DiscussionSeancePublique_Type · Decision_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 43 | L17-VD221098S48101 · L17-VD221207DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 43 | ANLUNI-DEBATS-SEANCE · ANLUNI-DEBATS-DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 43 | Discussion en séance publique · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 43 | Discussion en séance publique · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 43 | PO838901 · PO415287 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 43 | 2024-10-09T00:00:00.000+02:00 · 2024-10-31T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 25 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte | 25 | RUANR5L17S2025IDS28579 · RUANR5L17S2025IDS28617 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 18 | RUANR5L17S2025IDS28579PT48101 · RUANR5L17S2025IDS28617PT48134 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 7 | TSORTF01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 7 | adoptée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs.voteRef` | texte | 6 | VTANR5L17V3 · VTANR5L17V947 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[]` | liste | 5 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].typeTexte` | texte | 10 | BTA · TAP |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].refTexteAssocie` | texte | 10 | RIONANR5L17BTA0002 · RIONANR5L17TAP0002 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.typeTexte` | texte | 2 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.refTexteAssocie` | texte | 2 | RIONANR5L17BTA0067 · RIONANR5L17BTA0038 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 9 | de 2 a 3 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 21 | CreationOrganeTemporaire_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 21 | L17-VD221060 · L17-VD227979 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 21 | AN20-MISINF-CREA · AN20-MISINF-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 21 | Création d'une mission d'information · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 21 | Création d'une mission d'information · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 21 | PO847969 · PO850110 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte | 21 | 2024-09-26T00:00:00.000+02:00 · 2024-09-25T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 21 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].initiateurs.organeRef` | texte | 5 | PO847969 · PO850110 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 5 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 10 | PA719890 · PA794870 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 10 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 8 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 11 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.reunionRef` | texte/vide | 10 | RUANR5L17S2025IDS28914 · RUANR5L17S2025IDS28973 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odjRef` | texte | 5 | RUANR5L17S2025IDS28914PT48915 · RUANR5L17S2025IDS28973PT48791 |
| `dossierParlementaire.initiateur` | vide | 21 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 14 | de 4 a 7 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 66 | RenvoiPrealable_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 66 | L17-VD222116RPS · L17-VD222336 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 66 | ANLUNI-COM-CAE-SAISIE · ANLUNI-COM-CAE-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 66 | Renvoi préalable · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 66 | Renvoi préalable · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 66 | PO415287 · PO59051 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte | 66 | 2024-11-08T00:00:00.000+01:00 · 2024-11-13T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 66 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 11 | PA719822 · PA793992 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 11 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 14 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte/vide | 25 | RUANR5L17S2025IDC453647 · RUANR5L17S2025IDC453979 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 24 | RUANR5L17S2025IDC453647PT34595 · RUANR5L17S2025IDC453979PT34719 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 13 | RAPPANR5L17B0634 · RAPPANR5L17B0716 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 13 | PNREANR5L17BTC0634 · PNREANR5L17BTC0716 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 4 | SaisieComFond_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 4 | L17-VD222486CFS · L17-VD222750CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 4 | ANLUNI-COM-FOND-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 4 | Renvoi en commission au fond |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 4 | Renvoi en commission au fond |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 4 | PO419610 · PO59047 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte | 4 | 2024-11-27T00:00:00.000+01:00 · 2024-12-11T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 4 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.fam_code` | texte | 5 | TSORTF19 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.libelle` | texte | 5 | considérée comme définitive en application de l'article 151-7 du Règlement |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs` | vide | 5 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.typeTexte` | texte | 5 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.refTexteAssocie` | texte | 5 | RIONANR5L17BTA0022 · RIONANR5L17BTA0036 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 3 | PA795240 · PA721486 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 3 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 4 | RAPPANR5L17B1558 · RAPPANR5L17B1671 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | vide | 4 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateurs.acteurRef` | texte | 1 | PA643210 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 1 | VTANR5L17V694 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 1 | TSORTMOT02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.libelle` | texte | 1 | Motion rejetée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie` | texte | 1 | MIONANR5L17B0622-N6 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateRetrait` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].typeDeclaration.fam_code` | texte | 1 | Art.49.3 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].typeDeclaration.libelle` | texte | 1 | Déclaration engageant la responsabilité du Gouvernement devant l'Assemblée nationale su... |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 1 | VTANR5L17V842 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 1 | TSORTMOT02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.libelle` | texte | 1 | Motion rejetée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateRetrait` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 3 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 6 | PA335054 · PA720552 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 6 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 1 | TMRC01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 1 | rejet du texte par la commission préalable |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 1 |  |

## Cles vues UNE SEULE FOIS

Ce sont les cas particuliers : elles n'existent que dans certains fichiers.
C'est exactement ce que l'ancien tirage — les soixante premiers par ordre
alphabetique — ratait par construction. Une ingestion doit les traiter
comme facultatives.

- `document.coSignataires.coSignataire[].organe.organeRef`
- `document.coSignataires.coSignataire[].organe.etApparentes`
- `document.metadatas.dateSuppression`
- `document.divisions.division.classification.sousType.libelleEdition`
- `document.divisions.division.classification.sousType`
- `document.divisions.division.organesReferents.organeRef`
- `document.divisions.division.coSignataires`
- `document.divisions.division.depotAmendements`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].auteurMotion`
- `dossierParlementaire.fusionDossier.cause`
- `dossierParlementaire.fusionDossier.dossierAbsorbantRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].contributionInternaute.dateOuverture`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].contributionInternaute.dateFermeture`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAdopte`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateurs.acteurRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.voteRefs.voteRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.odSeancejRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateRetrait`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].typeDeclaration.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].typeDeclaration.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odSeancejRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateRetrait`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs`

## Un fichier entier, listes tronquees a trois entrees

```json
{
  "dossierParlementaire": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "@xsi:type": "DossierLegislatif_Type",
    "uid": "DLR5L16N47509",
    "legislature": "16",
    "titreDossier": {
      "titre": "Programmation militaire pour les années 2024 à 2030 et diverses dispositions intéressant la défense",
      "titreChemin": "programmation_militaire_2024_2030",
      "senatChemin": "http://www.senat.fr/dossier-legislatif/pjl22-712.html"
    },
    "procedureParlementaire": {
      "code": "1",
      "libelle": "Projet de loi ordinaire"
    },
    "initiateur": {
      "acteurs": {
        "acteur": [
          {
            "acteurRef": "PA717161",
            "mandatRef": "PM791583"
          },
          {
            "acteurRef": "PA643210",
            "mandatRef": "PM791690"
          }
        ]
      }
    },
    "actesLegislatifs": {
      "acteLegislatif": [
        {
          "@xsi:type": "Etape_Type",
          "uid": "L16-AN1-47509",
          "codeActe": "AN1",
          "libelleActe": {
            "nomCanonique": "1ère lecture (1ère assemblée saisie)",
            "libelleCourt": "1ère lecture"
          },
          "organeRef": "PO791932",
          "dateActe": null,
          "actesLegislatifs": {
            "acteLegislatif": [
              {
                "@xsi:type": "DepotInitiative_Type",
                "uid": "L16-VD212524DI",
                "codeActe": "AN1-DEPOT",
                "libelleActe": {
                  "nomCanonique": "1er dépôt d'une initiative.",
                  "libelleCourt": "1er dépôt d'une initiative."
                },
                "organeRef": "PO791932",
                "dateActe": "2023-04-04T00:00:00.000+02:00",
                "actesLegislatifs": null,
                "texteAssocie": "PRJLANR5L16B1033"
              },
              {
                "@xsi:type": "EtudeImpact_Type",
                "uid": "L16-VD212524ETI",
                "codeActe": "AN1-ETI",
                "libelleActe": {
                  "nomCanonique": "Etude d'impact",
                  "libelleCourt": "Etude d'impact"
                },
                "organeRef": "PO791932",
                "dateActe": "2023-04-04T00:00:00.000+02:00",
                "actesLegislatifs": null,
                "contributionInternaute": {
                  "dateOuverture": "2023-04-06+02:00",
                  "dateFermeture": "2023-05-22+02:00"
                },
                "texteAssocie": "ETDIANR5L16B1033"
              },
              {
                "@xsi:type": "DepotAvisConseilEtat_Type",
                "uid": "L16-VD212524AVCE",
                "codeActe": "AN1-AVCE",
                "libelleActe": {
                  "nomCanonique": "Avis du Conseil d'Etat",
                  "libelleCourt": "Avis du Conseil d'Etat"
                },
                "organeRef": "PO791932",
                "dateActe": "2023-04-04T00:00:00.000+02:00",
                "actesLegislatifs": null,
                "texteAssocie": "AVCEANR5L16B1033"
              },
              "... (6 entrees au total, tronque)"
            ]
          }
        },
        {
          "@xsi:type": "Etape_Type",
          "uid": "L16-SN1-47509",
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
                "uid": "L16-VD213939DIN",
                "codeActe": "SN1-DEPOT",
                "libelleActe": {
                  "nomCanonique": "Dépôt d'une initiative en navette",
                  "libelleCourt": "Dépôt d'une initiative en navette"
                },
                "organeRef": "PO78718",
                "dateActe": "2023-06-07T00:00:00.000+02:00",
                "actesLegislatifs": null,
                "texteAssocie": "PRJLSNR5S399B0712",
                "provenance": "PO791932",
                "depotInitialLectureDefinitiveRef": null
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L16-SN1-COM-47509",
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
                    "uid": "L16-VD213940CF",
                    "codeActe": "SN1-COM-FOND",
                    "libelleActe": {
                      "nomCanonique": "Travaux de la commission saisie au fond",
                      "libelleCourt": "Travaux de la commission saisie au fond"
                    },
                    "organeRef": "PO211491",
                    "dateActe": null,
                    "actesLegislatifs": {
                      "acteLegislatif": [
                        {
                          "@xsi:type": "SaisieComFond_Type",
                          "uid": "L16-VD213940CFS",
                          "codeActe": "SN1-COM-FOND-SAISIE",
                          "libelleActe": {
                            "nomCanonique": "Renvoi en commission au fond",
                            "libelleCourt": "Renvoi en commission au fond"
                          },
                          "organeRef": "PO211491",
                          "dateActe": "2023-06-07T00:00:00.000+02:00",
                          "actesLegislatifs": null
                        },
                        {
                          "@xsi:type": "NominRapporteurs_Type",
                          "uid": "L16-VD214066",
                          "codeActe": "SN1-COM-FOND-NOMIN",
                          "libelleActe": {
                            "nomCanonique": "Nomination de rapporteur",
                            "libelleCourt": "Nomination de rapporteur"
                          },
                          "organeRef": "PO211491",
                          "dateActe": null,
                          "actesLegislatifs": null,
                          "rapporteurs": {
                            "rapporteur": {
                              "acteurRef": "PA304085",
                              "typeRapporteur": "rapporteur"
                            }
                          },
                          "reunion": null
                        },
                        {
                          "@xsi:type": "DepotRapport_Type",
                          "uid": "L16-VD214067",
                          "codeActe": "SN1-COM-FOND-RAPPORT",
                          "libelleActe": {
                            "nomCanonique": "Dépôt de rapport",
                            "libelleCourt": "Dépôt de rapport"
                          },
                          "organeRef": "PO211491",
                          "dateActe": "2023-06-14T00:00:00.000+02:00",
                          "actesLegislatifs": null,
                          "texteAssocie": "RAPPSNR5S399B0739",
                          "texteAdopte": "PRJLSNR5S399BTC0740"
                        }
                      ]
                    }
                  }
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L16-SN1-DEBATS-47509",
                "codeActe": "SN1-DEBATS",
                "libelleActe": {
                  "nomCanonique": "Discussion en séance publique",
                  "libelleCourt": "Discussion en séance publique"
                },
                "organeRef": "PO78718",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": {
                    "@xsi:type": "Decision_Type",
                    "uid": "L16-VD214486DEC",
                    "codeActe": "SN1-DEBATS-DEC",
                    "libelleActe": {
                      "nomCanonique": "Décision",
                      "libelleCourt": "Décision"
                    },
                    "organeRef": "PO78718",
                    "dateActe": "2023-06-29T00:00:00.000+02:00",
                    "actesLegislatifs": null,
                    "statutConclusion": {
                      "fam_code": "TSORTF05",
                      "libelle": "modifié"
                    },
                    "reunionRef": null,
                    "voteRefs": null,
                    "textesAssocies": {
                      "texteAssocie": {
                        "typeTexte": "BTA",
                        "refTexteAssocie": "PRJLSNR5S399BTA0148"
                      }
                    }
                  }
                }
              }
            ]
          }
        },
        {
          "@xsi:type": "Etape_Type",
          "uid": "L16-CMP-47509",
          "codeActe": "CMP",
          "libelleActe": {
            "nomCanonique": "Commission Mixte Paritaire",
            "libelleCourt": "Commission Mixte Paritaire"
          },
          "organeRef": "PO826014",
          "dateActe": null,
          "actesLegislatifs": {
            "acteLegislatif": [
              {
                "@xsi:type": "DepotInitiativeNavette_Type",
                "uid": "L16-VD214705DIN",
                "codeActe": "CMP-DEPOT",
                "libelleActe": {
                  "nomCanonique": "Dépôt d'un projet de loi",
                  "libelleCourt": "Dépôt d'un projet de loi"
                },
                "organeRef": "PO826014",
                "dateActe": "2023-07-08T00:00:00.000+02:00",
                "actesLegislatifs": null,
                "texteAssocie": "PRJLANR5L16B1516",
                "provenance": "PO78718",
                "depotInitialLectureDefinitiveRef": null
              },
              {
                "@xsi:type": "RenvoiCMP_Type",
                "uid": "L16-VD214707CMPS",
                "codeActe": "CMP-SAISIE",
                "libelleActe": {
                  "nomCanonique": "Convocation d'une CMP",
                  "libelleCourt": "Convocation d'une CMP"
                },
                "organeRef": "PO826014",
                "dateActe": "2023-07-07T00:00:00.000+02:00",
                "actesLegislatifs": null,
                "initiateur": {
                  "acteurs": {
                    "acteur": {
                      "acteurRef": "PA717161",
                      "mandatRef": "PM791583"
                    }
                  }
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L16-VD214707COM",
                "codeActe": "CMP-COM",
                "libelleActe": {
                  "nomCanonique": "Commission Mixte Paritaire",
                  "libelleCourt": "Commission Mixte Paritaire"
                },
                "organeRef": "PO826014",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": [
                    {
                      "@xsi:type": "NominRapporteurs_Type",
                      "uid": "L16-VD214709",
                      "codeActe": "CMP-COM-NOMIN",
                      "libelleActe": {
                        "nomCanonique": "Nomination de rapporteur",
                        "libelleCourt": "Nomination de rapporteur"
                      },
                      "organeRef": "PO826014",
                      "dateActe": "2023-07-10T00:00:00.000+02:00",
                      "actesLegislatifs": null,
                      "rapporteurs": {
                        "rapporteur": [
                          {
                            "acteurRef": "PA720354",
                            "typeRapporteur": "rapporteur"
                          },
                          {
                            "acteurRef": "PA304085",
                            "typeRapporteur": "rapporteur"
                          },
                          {
                            "acteurRef": "PA719822",
                            "typeRapporteur": "rapporteur"
                          }
                        ]
                      },
                      "reunion": null
                    },
                    {
                      "@xsi:type": "DepotRapport_Type",
                      "uid": "L16-VD214721",
                      "codeActe": "CMP-COM-RAPPORT-SN",
                      "libelleActe": {
                        "nomCanonique": "Dépôt du rapport d'une CMP",
                        "libelleCourt": "Dépôt du rapport d'une CMP"
                      },
                      "organeRef": "PO78718",
                      "dateActe": "2023-07-10T00:00:00.000+02:00",
                      "actesLegislatifs": null,
                      "texteAssocie": "RAPPSNR5S399B0864",
                      "texteAdopte": "PRJLSNR5S399BTC0865"
                    },
                    {
                      "@xsi:type": "DepotRapport_Type",
                      "uid": "L16-VD214722",
                      "codeActe": "CMP-COM-RAPPORT-AN",
                      "libelleActe": {
                        "nomCanonique": "Dépôt du rapport d'une CMP",
                        "libelleCourt": "Dépôt du rapport d'une CMP"
                      },
                      "organeRef": "PO791932",
                      "dateActe": "2023-07-10T00:00:00.000+02:00",
                      "actesLegislatifs": null,
                      "texteAssocie": "RAPPANR5L16B1517",
                      "texteAdopte": "PRJLANR5L16BTC1517"
                    }
                  ]
                }
              },
              "... (6 entrees au total, tronque)"
            ]
          }
        },
        "... (6 entrees au total, tronque)"
      ]
    },
    "fusionDossier": null
  }
}
```
