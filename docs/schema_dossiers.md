# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **11033**
- Fichiers ouverts pour le tirage : **3000** (pas de 3)
- Fichiers decrits : **3000** — tous ceux qui ont ete ouverts
- Cles distinctes trouvees : **520**
- Fichier montre en entier plus bas : `json/dossierParlementaire/DLR5L17N50198.json` (le plus riche de l'echantillon)

## Arborescence des cles

`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un
nombre de fichiers : une cle situee dans une liste est comptee une fois par
element. Une cle vue beaucoup moins souvent que les autres est un cas
particulier, et l'ingestion doit la traiter comme facultative. Les cles vues
une seule fois sont reprises a part, plus bas.

| chemin | type | vu | exemples |
|---|---|---|---|
| `document.@xmlns` | texte | 2544 | http://schemas.assemblee-nationale.fr/referentiel |
| `document.@xmlns:xsi` | texte | 2544 | http://www.w3.org/2001/XMLSchema-instance |
| `document.@xsi:type` | texte | 2544 | accordInternational_Type · avisConseilEtat_Type |
| `document.uid` | texte | 2544 | ACINANR5L16B2159 · ACINANR5L16B2628 |
| `document.legislature` | texte/vide | 2543 | 16 · 17 |
| `document.cycleDeVie.chrono.dateCreation` | texte/vide | 2543 | 2024-02-07T00:00:00.000+01:00 · 2024-05-16T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.dateDepot` | texte/vide | 2543 | 2024-02-07T00:00:00.000+01:00 · 2024-05-16T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.datePublication` | texte/vide | 2543 | 2024-04-10T00:00:00.000+02:00 · 2024-05-29T00:00:00.000+02:00 |
| `document.cycleDeVie.chrono.datePublicationWeb` | texte/vide | 2543 | 2024-02-09T14:56:00.000+01:00 · 2024-05-22T11:40:00.000+02:00 |
| `document.denominationStructurelle` | texte | 2543 | Projet de loi · Proposition de loi |
| `document.provenance` | texte | 2532 | Texte Déposé · Commission |
| `document.titres.titrePrincipal` | texte | 2543 | Accord international sur le projet de loi autorisant l’approbation de l’accord entre le... · Accord international sur le projet de loi autorisant la ratification de l’accord se rap... |
| `document.titres.titrePrincipalCourt` | texte | 2543 | accord Papouasie Nouvelle Guinée défense · Convention des Nations unies sur le droit de la mer et conservation et utilisation dura... |
| `document.divisions` | vide | 2431 |  |
| `document.dossierRef` | texte | 2543 | DLR5L16N49392 · DLR5L16N49957 |
| `document.redacteur` | vide | 2543 |  |
| `document.classification.famille.depot.code` | texte | 2543 | INITDEP · INITNAV |
| `document.classification.famille.depot.libelle` | texte | 2543 | Initiative en 1er Dépôt · Initiative en Navette |
| `document.classification.famille.classe.code` | texte | 2543 | PRJLOI · PIONLOI |
| `document.classification.famille.classe.libelle` | texte | 2543 | Projet de loi · Proposition de loi |
| `document.classification.famille.espece.code` | texte | 527 | AUTRATCONV · ORG |
| `document.classification.famille.espece.libelle` | texte | 527 | autorisant la ratification d'une convention · organique |
| `document.classification.type.code` | texte | 2543 | ACIN · AVCE |
| `document.classification.type.libelle` | texte | 2543 | Accord international · Avis du Conseil d'Etat |
| `document.classification.sousType.code` | texte | 527 | AUTRATCONV · ORG |
| `document.classification.sousType.libelle` | texte | 518 | autorisant la ratification d'une convention · organique |
| `document.classification.sousType.libelleEdition` | texte | 263 | autorisant la ratification d'une convention · organique |
| `document.classification.statutAdoption` | texte/vide | 2543 | ADOPTSEANCE · ADOPTCOM |
| `document.auteurs.auteur.acteur.acteurRef` | texte | 959 | PA722190 · PA368 |
| `document.auteurs.auteur.acteur.qualite` | texte | 959 | auteur · rapporteur |
| `document.correction` | vide | 2516 |  |
| `document.notice.numNotice` | texte | 2532 | 2159 · 2628 |
| `document.notice.formule` | texte | 2532 | autorisant l’approbation de l’accord entre le Gouvernement de la République française e... · autorisant la ratification de l’accord se rapportant à la convention des Nations unies ... |
| `document.notice.adoptionConforme` | texte | 2543 | false |
| `document.indexation` | vide | 2527 |  |
| `document.imprimerie.ISSN` | vide | 2543 |  |
| `document.imprimerie.ISBN` | vide | 2543 |  |
| `document.imprimerie.DIAN` | texte/vide | 2543 | 82/2024 · 5/2025 |
| `document.imprimerie.nbPage` | texte/vide | 2543 | 0 · 6 |
| `document.imprimerie.prix` | texte/vide | 2543 | 2.0 · 3.299999952316284 |
| `document.auteurs.auteur.organe.organeRef` | texte | 715 | PO838901 · PO230434 |
| `document.classification.sousType` | vide | 2016 |  |
| `document.auteurs.auteur[]` | liste | 869 | de 2 a 192 entrees |
| `document.auteurs.auteur[].acteur.acteurRef` | texte | 2933 | PA720704 · PA266797 |
| `document.auteurs.auteur[].acteur.qualite` | texte | 2933 | auteur · rapporteur pour avis |
| `document.auteurs.auteur[].organe.organeRef` | texte | 762 | PO59048 · PO419865 |
| `document.organesReferents.organeRef` | texte | 1802 | PO420120 · PO59048 |
| `document.coSignataires` | vide | 1492 |  |
| `document.depotAmendements` | vide | 121 |  |
| `document.divisions.division[]` | liste | 19 | de 2 a 10 entrees |
| `document.divisions.division[].@xsi:type` | texte | 77 | texteLoi_Type · rapportParlementaire_Type |
| `document.divisions.division[].uid` | texte | 77 | AVISANR5L17B0471-tI · AVISANR5L17B0471-tII |
| `document.divisions.division[].legislature` | texte | 77 | 17 · 16 |
| `document.divisions.division[].cycleDeVie.chrono.dateCreation` | texte | 77 | 2024-10-23T00:00:00.000+02:00 · 2024-10-25T00:00:00.000+02:00 |
| `document.divisions.division[].cycleDeVie.chrono.dateDepot` | texte | 77 | 2024-10-23T00:00:00.000+02:00 · 2024-10-25T00:00:00.000+02:00 |
| `document.divisions.division[].cycleDeVie.chrono.datePublication` | texte/vide | 77 | 2024-11-18T00:00:00.000+01:00 · 2024-11-13T00:00:00.000+01:00 |
| `document.divisions.division[].cycleDeVie.chrono.datePublicationWeb` | texte/vide | 77 | 2024-11-13T18:00:00.000+01:00 · 2024-11-13T20:40:00.000+01:00 |
| `document.divisions.division[].denominationStructurelle` | texte | 77 | Tome I · Tome II |
| `document.divisions.division[].titres.titrePrincipal` | texte | 77 | Administration générale et territoriale de l'État : Administration générale et territor... · Sécurités : Sécurité |
| `document.divisions.division[].titres.titrePrincipalCourt` | texte | 77 | Administration générale et territoriale de l'État : Administration générale et territor... · Sécurités : Sécurité |
| `document.divisions.division[].divisions` | vide | 77 |  |
| `document.divisions.division[].dossierRef` | texte | 77 | DLR5L17N50198 · DLR5L17N52428 |
| `document.divisions.division[].redacteur` | vide | 77 |  |
| `document.divisions.division[].classification.famille` | vide | 77 |  |
| `document.divisions.division[].classification.type.code` | texte | 77 | AVIS · RAPP |
| `document.divisions.division[].classification.type.libelle` | texte | 77 | Avis · Rapport |
| `document.divisions.division[].classification.sousType` | vide | 61 |  |
| `document.divisions.division[].classification.statutAdoption` | texte/vide | 77 | ADOPTCOM |
| `document.divisions.division[].auteurs.auteur[]` | liste | 77 | de 2 a 10 entrees |
| `document.divisions.division[].auteurs.auteur[].acteur.acteurRef` | texte | 153 | PA267780 · PA718784 |
| `document.divisions.division[].auteurs.auteur[].acteur.qualite` | texte | 153 | rapporteur pour avis · rapporteur |
| `document.divisions.division[].auteurs.auteur[].organe.organeRef` | texte | 77 | PO59051 · PO419865 |
| `document.divisions.division[].organesReferents.organeRef` | texte | 39 | PO59048 |
| `document.divisions.division[].correction` | vide | 68 |  |
| `document.divisions.division[].notice.numNotice` | texte | 77 | 471 · 486 |
| `document.divisions.division[].notice.formule` | texte | 77 | sur le projet de loi de finances pour 2025 (n°324). · sur le projet de loi de finances pour 2026 (n°1906). |
| `document.divisions.division[].notice.adoptionConforme` | texte | 77 | false |
| `document.divisions.division[].indexation` | vide | 77 |  |
| `document.divisions.division[].imprimerie.ISSN` | vide | 77 |  |
| `document.divisions.division[].imprimerie.ISBN` | vide | 77 |  |
| `document.divisions.division[].imprimerie.DIAN` | texte/vide | 77 | 117/2025 · 53 / 2026 |
| `document.divisions.division[].imprimerie.nbPage` | texte/vide | 77 | 0 · 84 |
| `document.divisions.division[].imprimerie.prix` | texte/vide | 77 | 1.5 · 2.0 |
| `document.divisions.division[].coSignataires` | vide | 39 |  |
| `document.divisions.division[].depotAmendements` | vide | 39 |  |
| `document.indexation.themes.@niveau` | texte | 16 | 1 |
| `document.indexation.themes.theme.libelleTheme` | texte | 16 | LOIS DE FINANCES RECTIFICATIVES · SANTE PUBLIQUE |
| `document.organesReferents` | vide | 304 |  |
| `document.coSignataires.coSignataire[]` | liste | 593 | de 2 a 271 entrees |
| `document.coSignataires.coSignataire[].acteur.acteurRef` | texte | 20165 | PA305 · PA885 |
| `document.coSignataires.coSignataire[].dateCosignature` | texte | 20168 | 1999-12-23+01:00 · 2010-05-03+02:00 |
| `document.coSignataires.coSignataire[].dateRetraitCosignature` | texte/vide | 20168 | 2025-02-17+01:00 · 2025-03-13+01:00 |
| `document.coSignataires.coSignataire[].edite` | texte | 20168 | false · true |
| `document.depotAmendements.amendementsSeance.amendable` | texte | 2011 | false · true |
| `document.depotAmendements.amendementsSeance.dateLimiteDepot` | vide | 2011 |  |
| `document.depotAmendements.amendementsCommission.commission.organeRef` | texte | 1160 | PO59051 · PO59048 |
| `document.depotAmendements.amendementsCommission.commission.amendable` | texte | 1160 | true |
| `document.depotAmendements.amendementsCommission.commission.dateLimiteDepot` | vide | 1160 |  |
| `document.correction.typeCorrection` | texte | 27 | Rectifié |
| `document.correction.niveauCorrection` | texte | 27 | 1 · 2 |
| `document.coSignataires.coSignataire.acteur.acteurRef` | texte | 44 | PA330008 · PA795330 |
| `document.coSignataires.coSignataire.dateCosignature` | texte | 47 | 2024-11-19+01:00 · 2024-10-29+01:00 |
| `document.coSignataires.coSignataire.dateRetraitCosignature` | vide | 47 |  |
| `document.coSignataires.coSignataire.edite` | texte | 47 | false · true |
| `document.depotAmendements.amendementsCommission.commission[]` | liste | 28 | de 2 a 8 entrees |
| `document.depotAmendements.amendementsCommission.commission[].organeRef` | texte | 72 | PO419865 · PO419610 |
| `document.depotAmendements.amendementsCommission.commission[].amendable` | texte | 72 | true |
| `document.depotAmendements.amendementsCommission.commission[].dateLimiteDepot` | vide | 72 |  |
| `document.coSignataires.coSignataire.organe.organeRef` | texte | 3 | PO77710 · PO77707 |
| `document.coSignataires.coSignataire.organe.etApparentes` | texte | 3 | false |
| `document.coSignataires.coSignataire[].organe.organeRef` | texte | 3 | PO309463 · PO77710 |
| `document.coSignataires.coSignataire[].organe.etApparentes` | texte | 3 | false · true |
| `document.metadatas.dateSuppression` | texte | 1 | 2026-11-06T06:07:10.421862 |
| `document.rapportPublie` | texte | 383 | false · true |
| `document.divisions.division.@xsi:type` | texte | 93 | rapportParlementaire_Type |
| `document.divisions.division.uid` | texte | 93 | RAPPANR5L15B3881-COMPA · RAPPANR5L15B4994-COMPA |
| `document.divisions.division.legislature` | texte | 93 | 15 · 16 |
| `document.divisions.division.cycleDeVie.chrono.dateCreation` | texte | 93 | 2021-02-11T00:00:00.000+01:00 · 2022-02-03T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.dateDepot` | texte | 93 | 2021-02-11T00:00:00.000+01:00 · 2022-02-03T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.datePublication` | texte/vide | 93 | 2024-03-08T00:00:00.000+01:00 · 2024-12-04T00:00:00.000+01:00 |
| `document.divisions.division.cycleDeVie.chrono.datePublicationWeb` | texte | 93 | 2021-02-11T14:16:00.000+01:00 · 2022-02-03T20:50:00.000+01:00 |
| `document.divisions.division.denominationStructurelle` | texte | 93 | Annexe Texte comparatif COMPA · Tome 2 |
| `document.divisions.division.titres.titrePrincipal` | texte | 93 | Texte comparatif · Comptes rendus des auditions |
| `document.divisions.division.titres.titrePrincipalCourt` | texte | 93 | Texte comparatif · Création de l’homicide routier et visant à lutter contre la violence routière |
| `document.divisions.division.divisions` | vide | 93 |  |
| `document.divisions.division.dossierRef` | texte | 93 | DLR5L15N41215 · DLR5L15N41449 |
| `document.divisions.division.redacteur` | vide | 93 |  |
| `document.divisions.division.classification.famille` | vide | 93 |  |
| `document.divisions.division.classification.type.code` | texte | 93 | RAPP |
| `document.divisions.division.classification.type.libelle` | texte | 93 | Rapport |
| `document.divisions.division.classification.sousType.code` | texte | 92 | COMPA · ENQU |
| `document.divisions.division.classification.sousType.libelle` | texte | 92 | Texte comparatif · d'enquête |
| `document.divisions.division.classification.statutAdoption` | texte/vide | 93 | ADOPTCOM |
| `document.divisions.division.auteurs.auteur[]` | liste | 93 | de 2 a 5 entrees |
| `document.divisions.division.auteurs.auteur[].acteur.acteurRef` | texte | 113 | PA720170 · PA720480 |
| `document.divisions.division.auteurs.auteur[].acteur.qualite` | texte | 113 | rapporteur |
| `document.divisions.division.auteurs.auteur[].organe.organeRef` | texte | 93 | PO420120 · PO419604 |
| `document.divisions.division.correction` | vide | 90 |  |
| `document.divisions.division.notice.numNotice` | texte | 93 | 3881 · 4994 |
| `document.divisions.division.notice.formule` | texte | 93 | sur la proposition de loi, après engagement de la procédure accélérée, de Mmes Charlott... · , en nouvelle lecture, sur la proposition de loi, modifiée par le Sénat, visant à démoc... |
| `document.divisions.division.notice.adoptionConforme` | texte | 93 | false |
| `document.divisions.division.indexation` | vide | 93 |  |
| `document.divisions.division.imprimerie.ISSN` | vide | 93 |  |
| `document.divisions.division.imprimerie.ISBN` | vide | 93 |  |
| `document.divisions.division.imprimerie.DIAN` | vide | 93 |  |
| `document.divisions.division.imprimerie.nbPage` | texte | 93 | 0 |
| `document.divisions.division.imprimerie.prix` | texte/vide | 93 | 0.75 · 1.0 |
| `document.divisions.division.rapportPublie` | texte | 93 | false |
| `document.divisions.division[].classification.sousType.code` | texte | 16 | COMPA · ENQU |
| `document.divisions.division[].classification.sousType.libelle` | texte | 16 | Texte comparatif · d'enquête |
| `document.divisions.division[].correction.typeCorrection` | texte | 9 | Rectifié |
| `document.divisions.division[].correction.niveauCorrection` | texte | 9 | 1 · 2 |
| `document.divisions.division[].rapportPublie` | texte | 38 | false · true |
| `document.divisions.division.correction.typeCorrection` | texte | 3 | Rectifié |
| `document.divisions.division.correction.niveauCorrection` | texte | 3 | 1 · 2 |
| `document.divisions.division.classification.sousType.libelleEdition` | texte | 1 | d'enquête |
| `document.divisions.division[].classification.sousType.libelleEdition` | texte | 10 | d'enquête |
| `document.divisions.division.classification.sousType` | vide | 1 |  |
| `document.organesReferents.organeRef[]` | liste/texte | 78 | 2 entree(s) · PO420120 · PO846868 |
| `dossierParlementaire.@xmlns` | texte | 456 | http://schemas.assemblee-nationale.fr/referentiel |
| `dossierParlementaire.@xmlns:xsi` | texte | 455 | http://www.w3.org/2001/XMLSchema-instance |
| `dossierParlementaire.@xsi:type` | texte | 455 | DossierLegislatif_Type · DossierResolutionAN |
| `dossierParlementaire.uid` | texte | 456 | DLR5L11N19508 · DLR5L12N22585 |
| `dossierParlementaire.legislature` | texte | 456 | 11 · 12 |
| `dossierParlementaire.titreDossier.titre` | texte | 456 | Inscription automatique de la transposition des directives à l'ordre du jour · Déductibilité de la pension alimentaire |
| `dossierParlementaire.titreDossier.titreChemin` | texte/vide | 456 | 0000740001 · pension_alimentaire_divorce |
| `dossierParlementaire.titreDossier.senatChemin` | texte/vide | 456 | http://www.senat.fr/dossierleg/ppl00-074.html · http://www.senat.fr/dossierleg/ppl04-331.html |
| `dossierParlementaire.procedureParlementaire.code` | texte | 456 | 7 · 2 |
| `dossierParlementaire.procedureParlementaire.libelle` | texte | 456 | Projet ou proposition de loi constitutionnelle · Proposition de loi ordinaire |
| `dossierParlementaire.initiateur.acteurs.acteur.acteurRef` | texte | 368 | PA2227 · PA228 |
| `dossierParlementaire.initiateur.acteurs.acteur.mandatRef` | texte | 368 | PM89545 · PM303901 |
| `dossierParlementaire.initiateur.organes.organe.organeRef.uid` | texte | 111 | PO78718 · PO846868 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[]` | liste | 104 | de 2 a 10 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 393 | Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].uid` | texte | 393 | L11-SN1-19508 · L11-AN1-19508 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].codeActe` | texte | 393 | SN1 · AN1 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 393 | 1ère lecture (1ère assemblée saisie) · 1ère lecture (2ème assemblée saisie) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 392 | 1ère lecture · 2ème lecture |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].organeRef` | texte | 393 | PO78718 · PO44313 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].dateActe` | vide | 393 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 358 | de 2 a 8 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 988 | DepotInitiative_Type · Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 988 | L11-VD115898DI · L11-SN1-COM-19508 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 988 | SN1-DEPOT · SN1-COM |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 988 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 988 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 988 | PO78718 · PO44313 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 988 | 2000-11-14T00:00:00.000+01:00 · 2001-06-14T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 448 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 360 | PIONSNR5S170B0074 · PIONANR5L11B3145 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 385 | Etape_Type · Decision_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 385 | L11-VD115899CF · L11-VD115900DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 385 | SN1-COM-FOND · SN1-DEBATS-DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 385 | Travaux de la commission saisie au fond · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 385 | Travaux de la commission saisie au fond · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 385 | PO211495 · PO78718 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 385 | 2001-06-14T00:00:00.000+02:00 · 2020-02-06T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 164 | de 2 a 29 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 650 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 650 | L11-VD115899CFS · L11-VD115902 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 650 | SN1-COM-FOND-SAISIE · SN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 650 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 650 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 650 | PO211495 · PO211494 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 650 | 2000-11-14T00:00:00.000+01:00 · 2001-06-06T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 650 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 135 | PA1824 · PA2081 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 135 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 153 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 159 | RAPPSNR5S170B0360 · RAPPSNR5S190B0162 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 159 | PIONSNR5S194BTC0330 · PIONANR5L13BTC2566 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 58 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.fam_code` | texte | 54 | TSORTF03 · TSORTF01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.libelle` | texte | 54 | adoptée sans modification · adoptée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.reunionRef` | texte/vide | 58 | RUSNR5L17S2025IDS28725 · RUANR5L17S2025IDS28628 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs` | vide | 53 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.typeTexte` | texte | 53 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.refTexteAssocie` | texte | 53 | PIONSNR5S170BTA0103 · PIONSNR5S339BTA0059 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].provenance` | texte | 239 | PO78718 · PO44313 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].depotInitialLectureDefinitiveRef` | texte/vide | 239 | PIONANR5L15B5050 · PIONANR5L17B3059 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 163 | SaisieComFond_Type · DecisionMotionCensure_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 163 | L11-VD134040CFS · L12-VD115904CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 163 | AN1-COM-FOND-SAISIE · AN2-COM-FOND-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 163 | Renvoi en commission au fond · Décision sur une motion de censure |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 163 | Renvoi en commission au fond · Décision sur une motion de censure |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 163 | PO59051 · PO59048 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte | 163 | 2001-06-14T00:00:00.000+02:00 · 2002-07-17T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 163 |  |
| `dossierParlementaire.fusionDossier` | vide | 454 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 155 | de 2 a 24 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 464 | DiscussionSeancePublique_Type · Decision_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 464 | L12-VD131963S17941 · L12-VD132047DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 464 | SN1-DEBATS-SEANCE · SN1-DEBATS-DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 464 | Discussion en séance publique · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 464 | Discussion en séance publique · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 464 | PO78718 · PO384266 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 464 | 2006-01-24T00:00:00.000+01:00 · 2009-05-06T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 443 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte/vide | 398 | RUSNR5L12S2006IDS12977 · RUSNR5L13S2009IDS14593 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 265 | RUSNR5L12S2006IDS12977PT17941 · RUSNR5L13S2009IDS14593PT21323 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 133 | TSORTF01 · TSORTF05 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 133 | adoptée · modifiée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 81 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.typeTexte` | texte | 77 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.refTexteAssocie` | texte | 77 | PIONSNR5S190BTA0054 · PIONSNR5S194BTA0079 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunionRef` | texte | 174 | RUANR5L13S2010IDC410902 · RUANR5L13S2010IDC410903 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].odjRef` | texte | 174 | RUANR5L13S2010IDC410902PT14148 · RUANR5L13S2010IDC410903PT14149 |
| `dossierParlementaire.indexation.themes.@niveau` | texte | 1 | 1 |
| `dossierParlementaire.indexation.themes.theme.libelleTheme` | texte | 1 | LOGEMENT ET HABITAT |
| `dossierParlementaire.initiateur.acteurs.acteur[]` | liste | 60 | de 2 a 95 entrees |
| `dossierParlementaire.initiateur.acteurs.acteur[].acteurRef` | texte | 808 | PA227076 · PA2774 |
| `dossierParlementaire.initiateur.acteurs.acteur[].mandatRef` | texte | 808 | PM429906 · PM429910 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 21 | de 3 a 20 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 132 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 132 | L14-VD169665CFS · L14-VD169990 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 132 | SN1-COM-FOND-SAISIE · SN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 132 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 132 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 132 | PO211495 · PO516754 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 132 | 2013-12-03T00:00:00.000+01:00 · 2014-05-21T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 132 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 16 | PA1447 · PA528 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 16 | rapporteur · rapporteur pour avis |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 28 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 15 | RAPPSNR5S219B0547 · AVISSNR5S219B0532 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 15 | PIONSNR5S219BTC0548 · PRJLANR5L16BTC2600 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeMotion.fam_code` | texte | 1 | TMP03 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeMotion.libelle` | texte | 1 | Motions de renvoi en commission |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].auteurMotion` | texte | 1 | PA606171 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateRetrait` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 18 | de 2 a 49 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 134 | PA703490 · PA303997 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 134 | rapporteur |
| `dossierParlementaire.fusionDossier.cause` | texte | 2 | Dossier absorbé |
| `dossierParlementaire.fusionDossier.dossierAbsorbantRef` | texte | 2 | DLR5L15N36017 · DLR5L15N40250 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs.voteRef` | texte | 53 | VTANR5L15V3506 · VTANR5L15V4417 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[]` | liste | 55 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].typeTexte` | texte | 110 | BTA · TAP |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].refTexteAssocie` | texte | 110 | PIONANR5L15BTA0584 · PIONANR5L15TAP0584 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateur.acteurs.acteur.acteurRef` | texte | 17 | PA773441 · PA643210 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateur.acteurs.acteur.mandatRef` | texte | 17 | PM773491 · PM873637 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 15 | de 2 a 4 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 37 | PA721750 · PA429874 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 37 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 15 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 29 | RAPPSNR5S379B0420 · RAPPANR5L15B4977 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 29 | PIONSNR5S379BTC0421 · PIONSNR5S479BTC0280 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 26 | TCCMP02 · TCCMP01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 26 | Désaccord · Accord |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | vide | 17 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 17 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 35 | Promulgation_Type · DepotRapport_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 35 | L15-VD207148PL · L17-VD230434 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 35 | PROM-PUB · AN-APPLI-RAPPORT |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 35 | Promulgation d'une loi · Rapport sur l'application des lois |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 35 | Promulgation d'une loi · Rapport sur l'application des lois |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 35 | PO717136 · PO419604 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte | 35 | 2022-03-02T00:00:00.000+01:00 · 2026-02-11T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 35 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteLoiRef` | texte | 22 | PIONANR5L15BTA0816 · PIONANR5L17BTA0027 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.typeJO` | texte | 34 | JO_LOI_DECRET |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.dateJO` | texte | 34 | 2022-03-03+01:00 · 2025-01-30+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.pageJO` | vide | 34 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.numJO` | texte | 34 | 52 · 25 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.urlLegifrance` | texte | 34 | http://www.legifrance.gouv.fr/WAspad/UnTexteDeJorf?numjo=MENX2105502L · http://www.legifrance.gouv.fr/WAspad/UnTexteDeJorf?numjo=TSSS2303466L |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.infoJO.referenceNOR` | texte | 34 | MENX2105502L · TSSS2303466L |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.urlEcheancierLoi` | texte/vide | 34 | https://www.legifrance.gouv.fr/dossierlegislatif/JORFDOLE000043272782/?detailType=ECHEA... |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeLoi` | texte | 34 | 2022-296 · 2025-74 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.titreLoi` | texte | 34 | visant à démocratiser le sport en France · relative à l’instauration d’un nombre minimum de soignants par patient hospitalisé |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie` | texte | 1 | RINFANR5L17B2465 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAdopte` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie[]` | liste | 1 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie[].typeTexte` | texte | 2 | BTA · TAP |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie[].refTexteAssocie` | texte | 2 | PIONANR5L17BTA0007 · PIONANR5L17TAP0007 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odjRef` | texte | 4 | RUSNR5L17S2025IDS28725PT48311 · RUANR5L17S2025IDS28628PT48214 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 1 | VTSNR5L17V2215 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].casSaisine.fam_code` | texte | 14 | TSCCONT05 · TSCCONT07 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].casSaisine.libelle` | texte | 14 | Soixante députés au moins · De droit (article 61 alinéa 1 de la Constitution) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateurs` | vide | 12 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].motif` | texte | 14 | En application de l'article 61§2 de la Constitution |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].urlConclusion` | texte | 9 | http://www.conseil-constitutionnel.fr/decision/2025/2025878DC.htm · http://www.conseil-constitutionnel.fr/decision/2025/2025876DC.htm |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].numDecision` | texte | 9 | 878 · 876 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].anneeDecision` | texte | 9 | 2025 · 2026 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].contributionInternaute.dateOuverture` | texte | 6 | 2024-02-10+01:00 · 2024-04-04+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].contributionInternaute.dateFermeture` | texte | 6 | 2024-04-10+02:00 · 2024-05-14+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 12 | de 2 a 53 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 115 | PA719664 · PA720222 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 115 | rapporteur · rapporteur pour avis |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte | 68 | RUANR5L16S2024IDC451806 · RUANR5L16S2024IDC452723 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 68 | RUANR5L16S2024IDC451806PT34007 · RUANR5L16S2024IDC452723PT34059 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 352 | Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.uid` | texte | 352 | L17-SN1-50135 · L17-SN1-50158 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.codeActe` | texte | 352 | SN1 · ANLUNI |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 352 | 1ère lecture (1ère assemblée saisie) · Lecture unique |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 268 | 1ère lecture · Débat |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.organeRef` | texte | 352 | PO78718 · PO838901 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.dateActe` | vide | 352 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 305 | de 2 a 4 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 640 | DepotInitiative_Type · Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 640 | L17-VD220153DI · L17-SN1-COM-50135 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 640 | SN1-DEPOT · SN1-COM |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 640 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 640 | 1er dépôt d'une initiative. · Travaux des commissions |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 640 | PO78718 · PO838901 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 640 | 2024-06-13T00:00:00.000+02:00 · 2024-06-27T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 319 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 322 | PIONSNR5S419B0691 · PIONSNR5S419B0711 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 306 | Etape_Type · DecisionMotionCensure_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 306 | L17-VD220154CF · L17-VD220217CF |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 306 | SN1-COM-FOND · ANLUNI-COM-FOND |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 306 | Travaux de la commission saisie au fond · Renvoi préalable à la CAE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 306 | Travaux de la commission saisie au fond · Renvoi préalable à la CAE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 306 | PO211495 · PO211493 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 306 | 2024-10-08T00:00:00.000+02:00 · 2025-02-20T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 25 | de 2 a 7 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 119 | SaisieComFond_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 119 | L17-VD220154CFS · L17-VD225604 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 119 | SN1-COM-FOND-SAISIE · SN1-COM-FOND-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 119 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 119 | Renvoi en commission au fond · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 119 | PO211495 · PO419604 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 119 | 2024-06-13T00:00:00.000+02:00 · 2025-05-07T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 119 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 23 | PA775170 · PA719558 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 23 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 24 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 24 | RAPPSNR5S459B0597 · RAPPANR5L17B0308 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | texte/vide | 24 | PIONSNR5S459BTC0598 · PNREANR5L17BTC0308 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 270 | SaisieComFond_Type · RenvoiPrealable_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 270 | L17-VD220217CFS · L17-VD220227CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 270 | SN1-COM-FOND-SAISIE · ANLUNI-COM-CAE-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 270 | Renvoi en commission au fond · Renvoi préalable |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 270 | Renvoi en commission au fond · Renvoi préalable |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 270 | PO211493 · PO211495 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte | 270 | 2024-06-27T00:00:00.000+02:00 · 2024-07-10T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 270 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 47 | DepotInitiative_Type · Etape_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 47 | L17-VD220273DI · L17-AN20-MISINF-50203 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 47 | ANLUNI-DEPOT · AN20-MISINF |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 47 | 1er dépôt d'une initiative. · Mission d'information |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 47 | 1er dépôt d'une initiative. · Mission d'information |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 47 | PO838901 · PO846868 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte/vide | 47 | 2024-07-22T00:00:00.000+02:00 · 2024-07-30T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 41 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.texteAssocie` | texte | 41 | PNREANR5L17B0006 · PNREANR5L17B0163 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].etudePLFRef` | texte | 57 | ETDR5L17PLF2025N6299 · ETDR5L17PLF2025N6301 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.etudePLFRef` | texte | 3 | ETDR5L17PLF2025N6312 · ETDR5L17PLF2025N6324 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 1 | VTANR5L17V693 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 1 | TSORTMOT02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.libelle` | texte | 1 | Motion rejetée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie` | texte | 1 | MIONANR5L17B0873-N5 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateRetrait` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeDeclaration.fam_code` | texte | 1 | Art.49.3 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeDeclaration.libelle` | texte | 1 | Déclaration engageant la responsabilité du Gouvernement devant l'Assemblée nationale su... |
| `dossierParlementaire.PLF.EtudePLF[]` | liste | 1 | 60 entree(s) |
| `dossierParlementaire.PLF.EtudePLF[].uid` | texte | 50 | ETDR5L17PLF2025N6299 · ETDR5L17PLF2025N6301 |
| `dossierParlementaire.PLF.EtudePLF[].organeRef` | texte | 50 | PO420120 · PO419604 |
| `dossierParlementaire.PLF.EtudePLF[].texteAssocie` | texte | 50 | AVISANR5L17B0524-tI · AVISANR5L17B0524-tII |
| `dossierParlementaire.PLF.EtudePLF[].rapporteur.acteurRef` | texte | 49 | PA842279 · PA719756 |
| `dossierParlementaire.PLF.EtudePLF[].rapporteur.typeRapporteur` | texte | 49 | rapporteur pour avis |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.typeMission` | texte | 50 | mission principale |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.codeMission` | texte | 49 | SA · SE |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.libelleLong` | texte | 50 | Santé · Solidarité, insertion et égalité des chances |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.libelleCourt` | texte | 50 | Santé · Solidarité, insertion et égalité des chances |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.typeBudget` | texte | 50 | Budget général |
| `dossierParlementaire.PLF.EtudePLF[].ordreDIQS` | texte | 50 | 42 · 45 |
| `dossierParlementaire.PLF.EtudePLF[].ordreCommission` | texte | 50 | 1 · 2 |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.missions.mission.typeMission` | texte | 36 | mission secondaire · partie de mission |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.missions.mission.codeMission` | texte | 36 | YD · CB |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.missions.mission.libelleLong` | texte | 36 | Pensions · Création, transmission des savoirs et démocratisation de la culture |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.missions.mission.libelleCourt` | texte | 36 | Pensions · Création, transmission des savoirs et démocratisation de la culture |
| `dossierParlementaire.PLF.EtudePLF[].missionMinefi.missions.mission.typeBudget` | texte | 36 | Compte spécial · Budget général |
| `dossierParlementaire.PLF.EtudePLF[].rapporteur[]` | liste | 1 | 2 entree(s) |
| `dossierParlementaire.PLF.EtudePLF[].rapporteur[].acteurRef` | texte | 2 | PA608826 · PA719272 |
| `dossierParlementaire.PLF.EtudePLF[].rapporteur[].typeRapporteur` | texte | 2 | rapporteur pour avis |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type` | texte | 1 | CreationOrganeTemporaire_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid` | texte | 1 | L17-VD220618 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe` | texte | 1 | AN20-MISINF-CREA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 1 | Création d'une mission d'information |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 1 | Création d'une mission d'information |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef` | texte | 1 | PO846868 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe` | texte | 1 | 2024-07-25T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.initiateurs.organeRef` | texte | 1 | PO846868 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunionRef` | texte | 46 | RUANR5L17S2025IDC453409 · RUANR5L17S2024IDC453350 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].odjRef` | texte | 46 | RUANR5L17S2025IDC453409PT34335 · RUANR5L17S2024IDC453350PT34336 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 15 | de 2 a 3 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 35 | DiscussionSeancePublique_Type · Decision_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 35 | L17-VD221097S48100 · L17-VD221206DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 35 | ANLUNI-DEBATS-SEANCE · ANLUNI-DEBATS-DEC |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 35 | Discussion en séance publique · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 35 | Discussion en séance publique · Décision |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 35 | PO838901 · PO415287 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte/vide | 35 | 2024-10-09T00:00:00.000+02:00 · 2024-10-31T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 25 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte/vide | 25 | RUANR5L17S2025IDS28579 · RUANR5L17S2025IDS28617 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 18 | RUANR5L17S2025IDS28579PT48100 · RUANR5L17S2025IDS28617PT48135 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.fam_code` | texte | 7 | TSORTF01 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].statutConclusion.libelle` | texte | 7 | adoptée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs.voteRef` | texte | 4 | VTANR5L17V2 · VTANR5L17V1192 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.typeTexte` | texte | 4 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie.refTexteAssocie` | texte | 4 | RIONANR5L17BTA0001 · RIONANR5L17BTA0081 |
| `dossierParlementaire.initiateur` | vide | 23 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.texteAdopte` | vide | 19 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[]` | liste | 5 | de 2 a 3 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 12 | CreationOrganeTemporaire_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].uid` | texte | 12 | L17-VD220995 · L17-VD233837 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].codeActe` | texte | 12 | AN20-MISINF-CREA · AN20-MISINF-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 12 | Création d'une mission d'information · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 12 | Création d'une mission d'information · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].organeRef` | texte | 12 | PO847238 · PO848279 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateActe` | texte | 12 | 2024-09-19T00:00:00.000+02:00 · 2026-09-29T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 12 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].initiateurs.organeRef` | texte | 3 | PO847238 · PO848279 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 3 | de 2 a 3 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 7 | PA642847 · PA1567 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 7 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].reunion` | vide | 4 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 3 | RINFANR5L17B3199 · RAPPANR5L17B1200 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].texteAdopte` | vide | 3 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[]` | liste | 9 | de 3 a 7 entrees |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].@xsi:type` | texte | 41 | RenvoiPrealable_Type · NominRapporteurs_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].uid` | texte | 41 | L17-VD221016RPS · L17-VD221629 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].codeActe` | texte | 41 | ANLUNI-COM-CAE-SAISIE · ANLUNI-COM-CAE-NOMIN |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.nomCanonique` | texte | 41 | Renvoi préalable · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].libelleActe.libelleCourt` | texte | 41 | Renvoi préalable · Nomination de rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].organeRef` | texte | 41 | PO415287 · PO419610 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateActe` | texte | 41 | 2024-09-24T00:00:00.000+02:00 · 2024-10-16T00:00:00.000+02:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs` | vide | 41 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 7 | PA607553 · PA793816 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 7 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunion` | vide | 9 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].reunionRef` | texte | 15 | RUANR5L17S2025IDC453525 · RUANR5L17S2025IDC453603 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].odjRef` | texte | 15 | RUANR5L17S2025IDC453525PT34386 · RUANR5L17S2025IDC453525PT34517 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAssocie` | texte | 8 | RAPPANR5L17B0533 · RAPPANR5L17B0627 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].texteAdopte` | texte | 8 | PNREANR5L17BTC0533 · PNREANR5L17BTC0627 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].voteRefs` | vide | 3 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[]` | liste | 3 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].typeTexte` | texte | 6 | BTA · TAP |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].textesAssocies.texteAssocie[].refTexteAssocie` | texte | 6 | RIONANR5L17BTA0039 · RIONANR5L17TAP0039 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 11 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 2 | VTANR5L17V1 · VTANR5L17V526 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 2 | TSORTMOT02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.decision.libelle` | texte | 2 | Motion rejetée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 2 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].dateRetrait` | vide | 2 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.reunionRef` | texte/vide | 9 | RUANR5L17S2025IDS28596 · RUANR5L17S2025IDS29066 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.odjRef` | texte | 7 | RUANR5L17S2025IDS28596PT48139 · RUANR5L17S2025IDS29066PT48959 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef` | texte | 1 | PA774960 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur` | texte | 1 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 2 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 4 | PA720552 · PA335054 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 4 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.fam_code` | texte | 2 | TSORTF19 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.statutConclusion.libelle` | texte | 2 | considérée comme définitive en application de l'article 151-7 du Règlement |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs` | vide | 2 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.typeTexte` | texte | 2 | BTA |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie.refTexteAssocie` | texte | 2 | RIONANR5L17BTA0019 · RIONANR5L17BTA0200 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]` | liste | 1 | 2 entree(s) |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].acteurRef` | texte | 2 | PA794854 · PA795730 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[].typeRapporteur` | texte | 2 | rapporteur |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.voteRefs.voteRef` | texte | 2 | VTANR5L17V739 · VTANR5L17V791 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.fam_code` | texte | 2 | TSORTMOT02 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.libelle` | texte | 2 | Motion rejetée |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.odSeancejRef` | vide | 2 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie` | texte | 2 | MIONANR5L17B0622-N7 · MIONANR5L17B0622-N8 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateRetrait` | vide | 2 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].typeDeclaration.fam_code` | texte | 2 | Art.49.3 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].typeDeclaration.libelle` | texte | 2 | Déclaration engageant la responsabilité du Gouvernement devant l'Assemblée nationale su... |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].initiateurs.acteurRef` | texte | 2 | PA1828 · PA643210 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type` | texte | 1 | SaisieComFond_Type |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid` | texte | 1 | L17-VD228505CFS |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe` | texte | 1 | ANLUNI-COM-FOND-SAISIE |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique` | texte | 1 | Renvoi en commission au fond |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt` | texte | 1 | Renvoi en commission au fond |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef` | texte | 1 | PO419865 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe` | texte | 1 | 2025-10-29T00:00:00.000+01:00 |
| `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs` | vide | 1 |  |
| `dossierParlementaire.actesLegislatifs.acteLegislatif[].@xmlns:xsi` | texte | 2 | http://www.w3.org/2001/XMLSchema-instance |

## Cles vues UNE SEULE FOIS

Ce sont les cas particuliers : elles n'existent que dans certains fichiers.
C'est exactement ce que l'ancien tirage — les soixante premiers par ordre
alphabetique — ratait par construction. Une ingestion doit les traiter
comme facultatives.

- `document.metadatas.dateSuppression`
- `document.divisions.division.classification.sousType.libelleEdition`
- `document.divisions.division.classification.sousType`
- `dossierParlementaire.indexation.themes.@niveau`
- `dossierParlementaire.indexation.themes.theme.libelleTheme`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeMotion.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeMotion.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].auteurMotion`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].dateRetrait`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAdopte`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.textesAssocies.texteAssocie[]`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.voteRefs.voteRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.voteRefs.voteRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.decision.libelle`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.odSeancejRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.texteAssocie`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateRetrait`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeDeclaration.fam_code`
- `dossierParlementaire.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].typeDeclaration.libelle`
- `dossierParlementaire.PLF.EtudePLF[]`
- `dossierParlementaire.PLF.EtudePLF[].rapporteur[]`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.@xsi:type`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.uid`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.codeActe`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.nomCanonique`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.libelleActe.libelleCourt`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.organeRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.dateActe`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.initiateurs.organeRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.acteurRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur.typeRapporteur`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].rapporteurs.rapporteur[]`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.@xsi:type`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.uid`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.codeActe`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.nomCanonique`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.libelleActe.libelleCourt`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.organeRef`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.dateActe`
- `dossierParlementaire.actesLegislatifs.acteLegislatif.actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif[].actesLegislatifs.acteLegislatif.actesLegislatifs`

## Un fichier entier, listes tronquees a trois entrees

```json
{
  "dossierParlementaire": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "@xsi:type": "DossierLegislatif_Type",
    "uid": "DLR5L17N50198",
    "legislature": "17",
    "titreDossier": {
      "titre": "Projet de loi de finances pour 2025",
      "titreChemin": "PLF2025",
      "senatChemin": "http://www.senat.fr/dossier-legislatif/pjlf2025.html"
    },
    "procedureParlementaire": {
      "code": "3",
      "libelle": "Projet de loi de finances de l'année"
    },
    "initiateur": {
      "acteurs": {
        "acteur": [
          {
            "acteurRef": "PA368",
            "mandatRef": "PM847741"
          },
          {
            "acteurRef": "PA795144",
            "mandatRef": "PM847769"
          },
          {
            "acteurRef": "PA720878",
            "mandatRef": "PM847701"
          }
        ]
      }
    },
    "actesLegislatifs": {
      "acteLegislatif": [
        {
          "@xsi:type": "Etape_Type",
          "uid": "L17-AN1-50198",
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
                "uid": "L17-VD221231DI",
                "codeActe": "AN1-DEPOT",
                "libelleActe": {
                  "nomCanonique": "1er dépôt d'une initiative.",
                  "libelleCourt": "1er dépôt d'une initiative."
                },
                "organeRef": "PO838901",
                "dateActe": "2024-10-10T00:00:00.000+02:00",
                "actesLegislatifs": null,
                "texteAssocie": "PRJLANR5L17B0324"
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-AN1-COM-50198",
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
                      "uid": "L17-VD221232CF",
                      "codeActe": "AN1-COM-FOND",
                      "libelleActe": {
                        "nomCanonique": "Travaux de la commission saisie au fond",
                        "libelleCourt": "Travaux de la commission saisie au fond"
                      },
                      "organeRef": "PO59048",
                      "dateActe": null,
                      "actesLegislatifs": {
                        "acteLegislatif": [
                          {
                            "@xsi:type": "SaisieComFond_Type",
                            "uid": "L17-VD221232CFS",
                            "codeActe": "AN1-COM-FOND-SAISIE",
                            "libelleActe": {
                              "nomCanonique": "Renvoi en commission au fond",
                              "libelleCourt": "Renvoi en commission au fond"
                            },
                            "organeRef": "PO59048",
                            "dateActe": "2024-10-10T00:00:00.000+02:00",
                            "actesLegislatifs": null
                          },
                          {
                            "@xsi:type": "NominRapporteurs_Type",
                            "uid": "L17-VD220278",
                            "codeActe": "AN1-COM-FOND-NOMIN",
                            "libelleActe": {
                              "nomCanonique": "Nomination de rapporteur",
                              "libelleCourt": "Nomination de rapporteur"
                            },
                            "organeRef": "PO59048",
                            "dateActe": "2024-07-20T00:00:00.000+02:00",
                            "actesLegislatifs": null,
                            "rapporteurs": {
                              "rapporteur": {
                                "acteurRef": "PA942",
                                "typeRapporteur": "rapporteur général"
                              }
                            },
                            "reunion": null
                          },
                          {
                            "@xsi:type": "NominRapporteurs_Type",
                            "uid": "L17-VD221261",
                            "codeActe": "AN1-COM-FOND-NOMIN",
                            "libelleActe": {
                              "nomCanonique": "Nomination de rapporteur budgétaire",
                              "libelleCourt": "Nomination de rapporteur budgétaire"
                            },
                            "organeRef": "PO59048",
                            "dateActe": "2024-07-29T00:00:00.000+02:00",
                            "actesLegislatifs": null,
                            "rapporteurs": {
                              "rapporteur": [
                                {
                                  "acteurRef": "PA795454",
                                  "typeRapporteur": "rapporteur spécial"
                                },
                                {
                                  "acteurRef": "PA267763",
                                  "typeRapporteur": "rapporteur spécial"
                                },
                                {
                                  "acteurRef": "PA840685",
                                  "typeRapporteur": "rapporteur spécial"
                                },
                                "... (53 entrees au total, tronque)"
                              ]
                            },
                            "reunion": null
                          },
                          "... (16 entrees au total, tronque)"
                        ]
                      }
                    },
                    {
                      "@xsi:type": "Etape_Type",
                      "uid": "L17-VD220279CA",
                      "codeActe": "AN1-COM-AVIS",
                      "libelleActe": {
                        "nomCanonique": "Travaux d'une commission saisie pour avis",
                        "libelleCourt": "Travaux d'une commission saisie pour avis"
                      },
                      "organeRef": "PO420120",
                      "dateActe": null,
                      "actesLegislatifs": {
                        "acteLegislatif": [
                          {
                            "@xsi:type": "SaisieComAvis_Type",
                            "uid": "L17-VD220279CAS",
                            "codeActe": "AN1-COM-AVIS-SAISIE",
                            "libelleActe": {
                              "nomCanonique": "Saisine pour avis d'une commission",
                              "libelleCourt": "Saisine pour avis d'une commission"
                            },
                            "organeRef": "PO420120",
                            "dateActe": "2024-07-23T00:00:00.000+02:00",
                            "actesLegislatifs": null
                          },
                          {
                            "@xsi:type": "NominRapporteurs_Type",
                            "uid": "L17-VD221750",
                            "codeActe": "AN1-COM-AVIS-NOMIN",
                            "libelleActe": {
                              "nomCanonique": "Nomination de rapporteur budgétaire",
                              "libelleCourt": "Nomination de rapporteur budgétaire"
                            },
                            "organeRef": "PO420120",
                            "dateActe": "2024-07-24T00:00:00.000+02:00",
                            "actesLegislatifs": null,
                            "rapporteurs": {
                              "rapporteur": [
                                {
                                  "acteurRef": "PA842279",
                                  "typeRapporteur": "rapporteur pour avis",
                                  "etudePLFRef": "ETDR5L17PLF2025N6299"
                                },
                                {
                                  "acteurRef": "PA719756",
                                  "typeRapporteur": "rapporteur pour avis",
                                  "etudePLFRef": "ETDR5L17PLF2025N6301"
                                },
                                {
                                  "acteurRef": "PA719404",
                                  "typeRapporteur": "rapporteur pour avis",
                                  "etudePLFRef": "ETDR5L17PLF2025N6300"
                                },
                                "... (4 entrees au total, tronque)"
                              ]
                            },
                            "reunion": null
                          },
                          {
                            "@xsi:type": "DiscussionCommission_Type",
                            "uid": "L17-VD220627R34405",
                            "codeActe": "AN1-COM-AVIS-REUNION",
                            "libelleActe": {
                              "nomCanonique": "Réunion de commission",
                              "libelleCourt": "Réunion de commission"
                            },
                            "organeRef": "PO420120",
                            "dateActe": "2024-07-24T09:30:00.000+02:00",
                            "actesLegislatifs": null,
                            "reunionRef": "RUANR5L17S2024IDC453234",
                            "odjRef": "RUANR5L17S2024IDC453234PT34405"
                          },
                          "... (7 entrees au total, tronque)"
                        ]
                      }
                    },
                    {
                      "@xsi:type": "Etape_Type",
                      "uid": "L17-VD220280CA",
                      "codeActe": "AN1-COM-AVIS",
                      "libelleActe": {
                        "nomCanonique": "Travaux d'une commission saisie pour avis",
                        "libelleCourt": "Travaux d'une commission saisie pour avis"
                      },
                      "organeRef": "PO419604",
                      "dateActe": null,
                      "actesLegislatifs": {
                        "acteLegislatif": [
                          {
                            "@xsi:type": "SaisieComAvis_Type",
                            "uid": "L17-VD220280CAS",
                            "codeActe": "AN1-COM-AVIS-SAISIE",
                            "libelleActe": {
                              "nomCanonique": "Saisine pour avis d'une commission",
                              "libelleCourt": "Saisine pour avis d'une commission"
                            },
                            "organeRef": "PO419604",
                            "dateActe": "2024-07-23T00:00:00.000+02:00",
                            "actesLegislatifs": null
                          },
                          {
                            "@xsi:type": "NominRapporteurs_Type",
                            "uid": "L17-VD220986",
                            "codeActe": "AN1-COM-AVIS-NOMIN",
                            "libelleActe": {
                              "nomCanonique": "Nomination de rapporteur budgétaire",
                              "libelleCourt": "Nomination de rapporteur budgétaire"
                            },
                            "organeRef": "PO419604",
                            "dateActe": "2024-09-18T00:00:00.000+02:00",
                            "actesLegislatifs": null,
                            "rapporteurs": {
                              "rapporteur": [
                                {
                                  "acteurRef": "PA841813",
                                  "typeRapporteur": "rapporteur pour avis",
                                  "etudePLFRef": "ETDR5L17PLF2025N6305"
                                },
                                {
                                  "acteurRef": "PA793398",
                                  "typeRapporteur": "rapporteur pour avis",
                                  "etudePLFRef": "ETDR5L17PLF2025N6303"
                                },
                                {
                                  "acteurRef": "PA720190",
                                  "typeRapporteur": "rapporteur pour avis",
                                  "etudePLFRef": "ETDR5L17PLF2025N6304"
                                },
                                "... (8 entrees au total, tronque)"
                              ]
                            },
                            "reunion": null
                          },
                          {
                            "@xsi:type": "NominRapporteurs_Type",
                            "uid": "L17-VD221040",
                            "codeActe": "AN1-COM-AVIS-NOMIN",
                            "libelleActe": {
                              "nomCanonique": "Nomination de rapporteur budgétaire",
                              "libelleCourt": "Nomination de rapporteur budgétaire"
                            },
                            "organeRef": "PO419604",
                            "dateActe": "2024-09-25T00:00:00.000+02:00",
                            "actesLegislatifs": null,
                            "rapporteurs": {
                              "rapporteur": [
                                {
                                  "acteurRef": "PA719272",
                                  "typeRapporteur": "rapporteur pour avis",
                                  "etudePLFRef": "ETDR5L17PLF2025N6307"
                                },
                                {
                                  "acteurRef": "PA608826",
                                  "typeRapporteur": "rapporteur pour avis",
                                  "etudePLFRef": "ETDR5L17PLF2025N6307"
                                }
                              ]
                            },
                            "reunion": null
                          },
                          "... (11 entrees au total, tronque)"
                        ]
                      }
                    },
                    "... (8 entrees au total, tronque)"
                  ]
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-AN1-DEBATS-50198",
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
                      "uid": "L17-VD221326S48108",
                      "codeActe": "AN1-DEBATS-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-10-21T00:00:00.000+02:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUANR5L17S2025IDS28585",
                      "odjRef": "RUANR5L17S2025IDS28585PT48108"
                    },
                    {
                      "@xsi:type": "DiscussionSeancePublique_Type",
                      "uid": "L17-VD221326S48110",
                      "codeActe": "AN1-DEBATS-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-10-22T00:00:00.000+02:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUANR5L17S2025IDS28586",
                      "odjRef": "RUANR5L17S2025IDS28586PT48110"
                    },
                    {
                      "@xsi:type": "DiscussionSeancePublique_Type",
                      "uid": "L17-VD221326S48111",
                      "codeActe": "AN1-DEBATS-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2024-10-22T00:00:00.000+02:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUANR5L17S2025IDS28587",
                      "odjRef": "RUANR5L17S2025IDS28587PT48111"
                    },
                    "... (24 entrees au total, tronque)"
                  ]
                }
              }
            ]
          }
        },
        {
          "@xsi:type": "Etape_Type",
          "uid": "L17-SN1-50198",
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
                "uid": "L17-VD222358DIN",
                "codeActe": "SN1-DEPOT",
                "libelleActe": {
                  "nomCanonique": "Dépôt d'une initiative en navette",
                  "libelleCourt": "Dépôt d'une initiative en navette"
                },
                "organeRef": "PO78718",
                "dateActe": "2024-11-21T00:00:00.000+01:00",
                "actesLegislatifs": null,
                "texteAssocie": "PRJLSNR5S459B0143",
                "provenance": "PO838901",
                "depotInitialLectureDefinitiveRef": null
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-SN1-COM-50198",
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
                    "uid": "L17-VD222359CF",
                    "codeActe": "SN1-COM-FOND",
                    "libelleActe": {
                      "nomCanonique": "Travaux de la commission saisie au fond",
                      "libelleCourt": "Travaux de la commission saisie au fond"
                    },
                    "organeRef": "PO211494",
                    "dateActe": null,
                    "actesLegislatifs": {
                      "acteLegislatif": [
                        {
                          "@xsi:type": "SaisieComFond_Type",
                          "uid": "L17-VD222359CFS",
                          "codeActe": "SN1-COM-FOND-SAISIE",
                          "libelleActe": {
                            "nomCanonique": "Renvoi en commission au fond",
                            "libelleCourt": "Renvoi en commission au fond"
                          },
                          "organeRef": "PO211494",
                          "dateActe": "2024-11-21T00:00:00.000+01:00",
                          "actesLegislatifs": null
                        },
                        {
                          "@xsi:type": "NominRapporteurs_Type",
                          "uid": "L17-VD222371",
                          "codeActe": "SN1-COM-FOND-NOMIN",
                          "libelleActe": {
                            "nomCanonique": "Nomination de rapporteur",
                            "libelleCourt": "Nomination de rapporteur"
                          },
                          "organeRef": "PO211494",
                          "dateActe": null,
                          "actesLegislatifs": null,
                          "rapporteurs": {
                            "rapporteur": [
                              {
                                "acteurRef": "PA429875",
                                "typeRapporteur": "rapporteur"
                              },
                              {
                                "acteurRef": "PA736204",
                                "typeRapporteur": "rapporteur"
                              },
                              {
                                "acteurRef": "PA382672",
                                "typeRapporteur": "rapporteur"
                              },
                              "... (49 entrees au total, tronque)"
                            ]
                          },
                          "reunion": null
                        },
                        {
                          "@xsi:type": "DepotRapport_Type",
                          "uid": "L17-VD222420",
                          "codeActe": "SN1-COM-FOND-RAPPORT",
                          "libelleActe": {
                            "nomCanonique": "Dépôt de rapport",
                            "libelleCourt": "Dépôt de rapport"
                          },
                          "organeRef": "PO211494",
                          "dateActe": "2024-11-21T00:00:00.000+01:00",
                          "actesLegislatifs": null,
                          "texteAssocie": "RAPPSNR5S459B0144",
                          "texteAdopte": null
                        }
                      ]
                    }
                  }
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-SN1-DEBATS-50198",
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
                      "uid": "L17-VD223349S48913",
                      "codeActe": "SN1-DEBATS-SEANCE",
                      "libelleActe": {
                        "nomCanonique": "Discussion en séance publique",
                        "libelleCourt": "Discussion en séance publique"
                      },
                      "organeRef": "PO78718",
                      "dateActe": "2025-01-23T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "reunionRef": "RUSNR5L17S2025IDS29037",
                      "odjRef": "RUSNR5L17S2025IDS29037PT48913"
                    },
                    {
                      "@xsi:type": "Decision_Type",
                      "uid": "L17-VD223350DEC",
                      "codeActe": "SN1-DEBATS-DEC",
                      "libelleActe": {
                        "nomCanonique": "Décision",
                        "libelleCourt": "Décision"
                      },
                      "organeRef": "PO78718",
                      "dateActe": "2025-01-23T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "statutConclusion": {
                        "fam_code": "TSORTF05",
                        "libelle": "modifié"
                      },
                      "reunionRef": "RUSNR5L17S2025IDS29037",
                      "voteRefs": null,
                      "textesAssocies": {
                        "texteAssocie": {
                          "typeTexte": "BTA",
                          "refTexteAssocie": "PRJLSNR5S459BTA0039"
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
          "uid": "L17-CMP-50198",
          "codeActe": "CMP",
          "libelleActe": {
            "nomCanonique": "Commission Mixte Paritaire",
            "libelleCourt": "Commission Mixte Paritaire"
          },
          "organeRef": "PO858713",
          "dateActe": null,
          "actesLegislatifs": {
            "acteLegislatif": [
              {
                "@xsi:type": "DepotInitiativeNavette_Type",
                "uid": "L17-VD223360DIN",
                "codeActe": "CMP-DEPOT",
                "libelleActe": {
                  "nomCanonique": "Dépôt d'un projet de loi",
                  "libelleCourt": "Dépôt d'un projet de loi"
                },
                "organeRef": "PO858713",
                "dateActe": "2025-01-24T00:00:00.000+01:00",
                "actesLegislatifs": null,
                "texteAssocie": "PRJLANR5L17B0851",
                "provenance": "PO78718",
                "depotInitialLectureDefinitiveRef": null
              },
              {
                "@xsi:type": "RenvoiCMP_Type",
                "uid": "L17-VD223362CMPS",
                "codeActe": "CMP-SAISIE",
                "libelleActe": {
                  "nomCanonique": "Convocation d'une CMP",
                  "libelleCourt": "Convocation d'une CMP"
                },
                "organeRef": "PO858713",
                "dateActe": "2025-01-23T00:00:00.000+01:00",
                "actesLegislatifs": null,
                "initiateur": {
                  "acteurs": {
                    "acteur": {
                      "acteurRef": "PA410",
                      "mandatRef": "PM855580"
                    }
                  }
                }
              },
              {
                "@xsi:type": "Etape_Type",
                "uid": "L17-VD223362COM",
                "codeActe": "CMP-COM",
                "libelleActe": {
                  "nomCanonique": "Commission Mixte Paritaire",
                  "libelleCourt": "Commission Mixte Paritaire"
                },
                "organeRef": "PO858713",
                "dateActe": null,
                "actesLegislatifs": {
                  "acteLegislatif": [
                    {
                      "@xsi:type": "NominRapporteurs_Type",
                      "uid": "L17-VD223485",
                      "codeActe": "CMP-COM-NOMIN",
                      "libelleActe": {
                        "nomCanonique": "Nomination de rapporteur",
                        "libelleCourt": "Nomination de rapporteur"
                      },
                      "organeRef": "PO858713",
                      "dateActe": "2025-01-30T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "rapporteurs": {
                        "rapporteur": [
                          {
                            "acteurRef": "PA795950",
                            "typeRapporteur": "rapporteur"
                          },
                          {
                            "acteurRef": "PA429875",
                            "typeRapporteur": "rapporteur"
                          }
                        ]
                      },
                      "reunion": null
                    },
                    {
                      "@xsi:type": "DepotRapport_Type",
                      "uid": "L17-VD223507",
                      "codeActe": "CMP-COM-RAPPORT-AN",
                      "libelleActe": {
                        "nomCanonique": "Dépôt du rapport d'une CMP",
                        "libelleCourt": "Dépôt du rapport d'une CMP"
                      },
                      "organeRef": "PO838901",
                      "dateActe": "2025-01-31T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "texteAssocie": "RAPPANR5L17B0873",
                      "texteAdopte": "PRJLANR5L17BTC0873"
                    },
                    {
                      "@xsi:type": "DepotRapport_Type",
                      "uid": "L17-VD223996",
                      "codeActe": "CMP-COM-RAPPORT-SN",
                      "libelleActe": {
                        "nomCanonique": "Dépôt du rapport d'une CMP",
                        "libelleCourt": "Dépôt du rapport d'une CMP"
                      },
                      "organeRef": "PO78718",
                      "dateActe": "2025-01-31T00:00:00.000+01:00",
                      "actesLegislatifs": null,
                      "texteAssocie": "RAPPSNR5S459B0296",
                      "texteAdopte": null
                    }
                  ]
                }
              },
              "... (8 entrees au total, tronque)"
            ]
          }
        },
        "... (5 entrees au total, tronque)"
      ]
    },
    "fusionDossier": null,
    "PLF": {
      "EtudePLF": [
        {
          "uid": "ETDR5L17PLF2025N6299",
          "organeRef": "PO420120",
          "texteAssocie": "AVISANR5L17B0524-tI",
          "rapporteur": {
            "acteurRef": "PA842279",
            "typeRapporteur": "rapporteur pour avis"
          },
          "missionMinefi": {
            "typeMission": "mission principale",
            "codeMission": "SA",
            "libelleLong": "Santé",
            "libelleCourt": "Santé",
            "typeBudget": "Budget général"
          },
          "ordreDIQS": "42",
          "ordreCommission": "1"
        },
        {
          "uid": "ETDR5L17PLF2025N6301",
          "organeRef": "PO420120",
          "texteAssocie": "AVISANR5L17B0524-tII",
          "rapporteur": {
            "acteurRef": "PA719756",
            "typeRapporteur": "rapporteur pour avis"
          },
          "missionMinefi": {
            "typeMission": "mission principale",
            "codeMission": "SE",
            "libelleLong": "Solidarité, insertion et égalité des chances",
            "libelleCourt": "Solidarité, insertion et égalité des chances",
            "typeBudget": "Budget général"
          },
          "ordreDIQS": "45",
          "ordreCommission": "2"
        },
        {
          "uid": "ETDR5L17PLF2025N6300",
          "organeRef": "PO420120",
          "texteAssocie": "AVISANR5L17B0524-tIII",
          "rapporteur": {
            "acteurRef": "PA719404",
            "typeRapporteur": "rapporteur pour avis"
          },
          "missionMinefi": {
            "typeMission": "mission principale",
            "codeMission": "TB",
            "libelleLong": "Travail, emploi et administration des ministères sociaux",
            "libelleCourt": "Travail, emploi et administration des ministères sociaux",
            "typeBudget": "Budget général"
          },
          "ordreDIQS": "49",
          "ordreCommission": "3"
        },
        "... (60 entrees au total, tronque)"
      ]
    }
  }
}
```
