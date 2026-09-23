# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **8434**
- Fichiers ouverts pour le tirage : **3000** (pas de 2)
- Fichiers decrits : **3000** — tous ceux qui ont ete ouverts
- Cles distinctes trouvees : **157**
- Fichier montre en entier plus bas : `json/VTANR5L17V3421.json` (le plus riche de l'echantillon)

## Arborescence des cles

`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un
nombre de fichiers : une cle situee dans une liste est comptee une fois par
element. Une cle vue beaucoup moins souvent que les autres est un cas
particulier, et l'ingestion doit la traiter comme facultative. Les cles vues
une seule fois sont reprises a part, plus bas.

| chemin | type | vu | exemples |
|---|---|---|---|
| `scrutin.@xmlns` | texte | 3000 | http://schemas.assemblee-nationale.fr/referentiel |
| `scrutin.@xmlns:xsi` | texte | 3000 | http://www.w3.org/2001/XMLSchema-instance |
| `scrutin.uid` | texte | 3000 | VTANR5L17V1 · VTANR5L17V100 |
| `scrutin.numero` | texte | 3000 | 1 · 100 |
| `scrutin.organeRef` | texte | 3000 | PO838901 |
| `scrutin.legislature` | texte | 3000 | 17 |
| `scrutin.sessionRef` | texte | 3000 | SCR5A2025O1 · SCR5A2025E1 |
| `scrutin.seanceRef` | texte | 3000 | RUANR5L17S2025IDS28596 · RUANR5L17S2025IDS28593 |
| `scrutin.dateScrutin` | texte | 3000 | 2024-10-08 · 2024-10-25 |
| `scrutin.quantiemeJourSeance` | texte | 3000 | 1 · 2 |
| `scrutin.typeVote.codeTypeVote` | texte | 3000 | MOC · SPO |
| `scrutin.typeVote.libelleTypeVote` | texte | 3000 | motion de censure · scrutin public ordinaire |
| `scrutin.typeVote.typeMajorite` | texte | 3000 | Majorité requise pour une motion de censure · Majorité absolue des suffrages exprimés |
| `scrutin.sort.code` | texte | 3000 | rejeté · adopté |
| `scrutin.sort.libelle` | texte | 3000 | L'Assemblée nationale n'a pas adopté · l'Assemblée nationale a adopté |
| `scrutin.titre` | texte | 3000 | la motion de censure déposée en application de l'article 49, alinéa 2, de la Constituti... · l'amendement de suppression n° 828 de M. Jean-Philippe Tanguy et l'amendement identique... |
| `scrutin.demandeur.texte` | texte/vide | 3000 | Présidente du groupe "Rassemblement National" · Présidente de séance |
| `scrutin.demandeur.referenceLegislative` | vide | 3000 |  |
| `scrutin.objet.libelle` | texte | 3000 | la motion de censure déposée en application de l'article 49, alinéa 2, de la Constituti... · l'amendement de suppression n° 828 de M. Jean-Philippe Tanguy et l'amendement identique... |
| `scrutin.objet.dossierLegislatif` | vide | 2713 |  |
| `scrutin.objet.referenceLegislative` | vide | 3000 |  |
| `scrutin.modePublicationDesVotes` | texte | 3000 | DecompteNominatif |
| `scrutin.syntheseVote.nombreVotants` | texte | 3000 | 197 · 205 |
| `scrutin.syntheseVote.suffragesExprimes` | texte | 3000 | 197 · 202 |
| `scrutin.syntheseVote.nbrSuffragesRequis` | texte | 3000 | 289 · 102 |
| `scrutin.syntheseVote.annonce` | texte | 3000 | L'Assemblée nationale n'a pas adopté · l'Assemblée nationale a adopté |
| `scrutin.syntheseVote.decompte.nonVotants` | texte | 3000 | 10 · 4 |
| `scrutin.syntheseVote.decompte.pour` | texte | 3000 | 197 · 162 |
| `scrutin.syntheseVote.decompte.contre` | texte | 3000 | 0 · 40 |
| `scrutin.syntheseVote.decompte.abstentions` | texte | 3000 | 0 · 3 |
| `scrutin.syntheseVote.decompte.nonVotantsVolontaires` | texte | 3000 | 0 |
| `scrutin.ventilationVotes.organe.organeRef` | texte | 3000 | PO838901 |
| `scrutin.ventilationVotes.organe.groupes.groupe[]` | liste | 3000 | 12 entree(s) |
| `scrutin.ventilationVotes.organe.groupes.groupe[].organeRef` | texte | 36000 | PO845401 · PO845407 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].nombreMembresGroupe` | texte | 36000 | 125 · 95 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.positionMajoritaire` | texte | 36000 | pour · contre |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.nonVotants` | texte | 36000 | 0 · 10 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.pour` | texte | 36000 | 0 · 72 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.contre` | texte | 36000 | 0 · 21 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.abstentions` | texte | 36000 | 0 · 1 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.nonVotantsVolontaires` | texte | 36000 | 0 · 1 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants` | vide | 29873 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours` | vide | 19065 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres` | vide | 16206 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions` | vide | 30609 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[]` | liste | 1688 | de 2 a 10 entrees |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].acteurRef` | texte | 5485 | PA795050 · PA795958 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].mandatRef` | texte | 5485 | PM843272 · PM843422 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].parDelegation` | texte | 5485 | false |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].numPlace` | texte | 5485 | 322 · 323 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].causePositionVote` | texte | 5485 | MG · PSE |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[]` | liste | 13924 | de 2 a 123 entrees |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].acteurRef` | texte | 197633 | PA794906 · PA796070 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].mandatRef` | texte | 197633 | PM843284 · PM843746 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].parDelegation` | texte | 197633 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].numPlace` | texte/vide | 197633 | 544 · 638 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.acteurRef` | texte | 4439 | PA227089 · PA721908 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.mandatRef` | texte | 4439 | PM843131 · PM843467 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.parDelegation` | texte | 4439 | false |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.numPlace` | texte/vide | 4439 | 395 · 402 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.causePositionVote` | texte | 4439 | MG · PAN |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.acteurRef` | texte | 3011 | PA793796 · PA346782 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.mandatRef` | texte | 3011 | PM842723 · PM840426 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.parDelegation` | texte | 3011 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.numPlace` | texte | 3011 | 485 · 172 |
| `scrutin.miseAuPoint.nonVotants[]` | liste/vide | 8864 | 2 entree(s) |
| `scrutin.miseAuPoint.pours` | vide | 2746 |  |
| `scrutin.miseAuPoint.abstentions[]` | liste/vide | 8932 | 2 entree(s) |
| `scrutin.miseAuPoint.nonVotantsVolontaires[]` | liste/vide | 8999 | 2 entree(s) |
| `scrutin.miseAuPoint.contres` | vide | 2744 |  |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotants` | vide | 3000 |  |
| `scrutin.miseAuPoint.dysfonctionnement.pour` | vide | 2976 |  |
| `scrutin.miseAuPoint.dysfonctionnement.contre` | vide | 2975 |  |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions` | vide | 2998 |  |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires` | vide | 2992 |  |
| `scrutin.lieuVote` | texte | 3000 | Salons · Hémicycle |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[]` | liste | 16886 | de 2 a 125 entrees |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].acteurRef` | texte | 220419 | PA2960 · PA719388 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].mandatRef` | texte | 220419 | PM843140 · PM842642 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].parDelegation` | texte | 220419 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].numPlace` | texte/vide | 220419 | 250 · 254 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant.acteurRef` | texte | 2555 | PA826635 · PA841515 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant.mandatRef` | texte | 2555 | PM843473 · PM843089 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant.parDelegation` | texte | 2555 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant.numPlace` | texte | 2555 | 425 · 594 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant.acteurRef` | texte | 2908 | PA841701 · PA841769 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant.mandatRef` | texte | 2908 | PM843269 · PM843323 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant.parDelegation` | texte | 2908 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant.numPlace` | texte | 2908 | 523 · 096 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[]` | liste | 2836 | de 2 a 109 entrees |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].acteurRef` | texte | 24557 | PA793708 · PA796018 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].mandatRef` | texte | 24557 | PM842525 · PM843425 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].parDelegation` | texte | 24557 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].numPlace` | texte | 24557 | 491 · 502 |
| `scrutin.miseAuPoint.abstentions[].votant.acteurRef` | texte | 47 | PA719822 · PA794778 |
| `scrutin.miseAuPoint.abstentions[].votant.mandatRef` | texte | 47 | PM842762 · PM843239 |
| `scrutin.miseAuPoint.abstentions[].votant.parDelegation` | texte | 47 | false |
| `scrutin.miseAuPoint.abstentions[].votant.numPlace` | texte | 47 | 334 · 501 |
| `scrutin.miseAuPoint.nonVotants[].votant.acteurRef` | texte | 126 | PA795982 · PA793102 |
| `scrutin.miseAuPoint.nonVotants[].votant.mandatRef` | texte | 126 | PM840432 · PM842330 |
| `scrutin.miseAuPoint.nonVotants[].votant.parDelegation` | texte | 126 | false |
| `scrutin.miseAuPoint.nonVotants[].votant.numPlace` | texte | 126 | 558 · 153 |
| `scrutin.miseAuPoint.pours.votant.acteurRef` | texte | 163 | PA841947 · PA795026 |
| `scrutin.miseAuPoint.pours.votant.mandatRef` | texte | 163 | PM843503 · PM843368 |
| `scrutin.miseAuPoint.pours.votant.parDelegation` | texte | 163 | false |
| `scrutin.miseAuPoint.pours.votant.numPlace` | texte | 163 | 559 · 224 |
| `scrutin.miseAuPoint.contres.votant.acteurRef` | texte | 186 | PA841981 · PA342384 |
| `scrutin.miseAuPoint.contres.votant.mandatRef` | texte | 186 | PM843533 · PM842771 |
| `scrutin.miseAuPoint.contres.votant.parDelegation` | texte | 186 | false |
| `scrutin.miseAuPoint.contres.votant.numPlace` | texte | 186 | 041 · 637 |
| `scrutin.miseAuPoint.pours.votant[]` | liste | 91 | de 2 a 19 entrees |
| `scrutin.miseAuPoint.pours.votant[].acteurRef` | texte | 295 | PA794570 · PA794582 |
| `scrutin.miseAuPoint.pours.votant[].mandatRef` | texte | 295 | PM843137 · PM840300 |
| `scrutin.miseAuPoint.pours.votant[].parDelegation` | texte | 295 | false |
| `scrutin.miseAuPoint.pours.votant[].numPlace` | texte | 295 | 083 · 101 |
| `scrutin.miseAuPoint.contres.votant[]` | liste | 70 | de 2 a 14 entrees |
| `scrutin.miseAuPoint.contres.votant[].acteurRef` | texte | 200 | PA793362 · PA793158 |
| `scrutin.miseAuPoint.contres.votant[].mandatRef` | texte | 200 | PM842465 · PM840258 |
| `scrutin.miseAuPoint.contres.votant[].parDelegation` | texte | 200 | false |
| `scrutin.miseAuPoint.contres.votant[].numPlace` | texte | 200 | 003 · 075 |
| `scrutin.miseAuPoint.abstentions[].votant[]` | liste | 21 | de 2 a 25 entrees |
| `scrutin.miseAuPoint.abstentions[].votant[].acteurRef` | texte | 69 | PA841223 · PA841351 |
| `scrutin.miseAuPoint.abstentions[].votant[].mandatRef` | texte | 69 | PM842804 · PM842936 |
| `scrutin.miseAuPoint.abstentions[].votant[].parDelegation` | texte | 69 | false |
| `scrutin.miseAuPoint.abstentions[].votant[].numPlace` | texte | 69 | 525 · 543 |
| `scrutin.miseAuPoint.nonVotants[].votant[]` | liste | 10 | de 2 a 3 entrees |
| `scrutin.miseAuPoint.nonVotants[].votant[].acteurRef` | texte | 21 | PA793322 · PA722150 |
| `scrutin.miseAuPoint.nonVotants[].votant[].mandatRef` | texte | 21 | PM840246 · PM843590 |
| `scrutin.miseAuPoint.nonVotants[].votant[].parDelegation` | texte | 21 | false |
| `scrutin.miseAuPoint.nonVotants[].votant[].numPlace` | texte | 21 | 093 · 486 |
| `scrutin.objet.dossierLegislatif.libelle` | texte | 287 | Proposition de loi organique visant à harmoniser le mode de scrutin aux élections munic... · Création du cadre d'emploi des personnels de santé des services d’incendie et de secours |
| `scrutin.objet.dossierLegislatif.dossierRef` | texte | 287 | DLR5L17N50579 · DLR5L17N51346 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant.acteurRef` | texte | 25 | PA342384 · PA795278 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant.mandatRef` | texte | 25 | PM842771 · PM843539 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant.parDelegation` | texte | 25 | false |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant.numPlace` | texte | 25 | 637 · 219 |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires.votant.acteurRef` | texte | 8 | PA793342 · PA721816 |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires.votant.mandatRef` | texte | 8 | PM842345 · PM843551 |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires.votant.parDelegation` | texte | 8 | false |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires.votant.numPlace` | texte | 8 | 204 · 180 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant.acteurRef` | texte | 22 | PA342384 · PA840869 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant.mandatRef` | texte | 22 | PM842771 · PM842522 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant.parDelegation` | texte | 22 | false |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant.numPlace` | texte | 22 | 637 · 047 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[]` | liste | 2 | 2 entree(s) |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[].acteurRef` | texte | 4 | PA608264 · PA774958 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[].mandatRef` | texte | 4 | PM843179 · PM843389 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[].parDelegation` | texte | 4 | false |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[].numPlace` | texte | 4 | 475 · 415 |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.acteurRef` | texte | 2 | PA840869 |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.mandatRef` | texte | 2 | PM842522 |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.parDelegation` | texte | 2 | false |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.numPlace` | texte | 2 | 047 |
| `scrutin.miseAuPoint.nonVotantsVolontaires[].votant.acteurRef` | texte | 1 | PA794894 |
| `scrutin.miseAuPoint.nonVotantsVolontaires[].votant.mandatRef` | texte | 1 | PM840351 |
| `scrutin.miseAuPoint.nonVotantsVolontaires[].votant.parDelegation` | texte | 1 | false |
| `scrutin.miseAuPoint.nonVotantsVolontaires[].votant.numPlace` | texte | 1 | 138 |

## Cles vues UNE SEULE FOIS

Ce sont les cas particuliers : elles n'existent que dans certains fichiers.
C'est exactement ce que l'ancien tirage — les soixante premiers par ordre
alphabetique — ratait par construction. Une ingestion doit les traiter
comme facultatives.

- `scrutin.miseAuPoint.nonVotantsVolontaires[].votant.acteurRef`
- `scrutin.miseAuPoint.nonVotantsVolontaires[].votant.mandatRef`
- `scrutin.miseAuPoint.nonVotantsVolontaires[].votant.parDelegation`
- `scrutin.miseAuPoint.nonVotantsVolontaires[].votant.numPlace`

## Un fichier entier, listes tronquees a trois entrees

```json
{
  "scrutin": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "uid": "VTANR5L17V3421",
    "numero": "3421",
    "organeRef": "PO838901",
    "legislature": "17",
    "sessionRef": "SCR5A2026O1",
    "seanceRef": "RUANR5L17S2026IDS29864",
    "dateScrutin": "2025-11-05",
    "quantiemeJourSeance": "1",
    "typeVote": {
      "codeTypeVote": "SPO",
      "libelleTypeVote": "scrutin public ordinaire",
      "typeMajorite": "Majorité absolue des suffrages exprimés"
    },
    "sort": {
      "code": "rejeté",
      "libelle": "L'Assemblée nationale n'a pas adopté"
    },
    "titre": "l'amendement n° 15 de Mme Sylvie Bonnet et les amendements identiques suivants après l'article 5 du projet de loi de financement de la sécurité sociale pour 2026 (première lecture).",
    "demandeur": {
      "texte": "Présidente de séance",
      "referenceLegislative": null
    },
    "objet": {
      "libelle": "l'amendement n° 15 de Mme Sylvie Bonnet et les amendements identiques suivants après l'article 5 du projet de loi de financement de la sécurité sociale pour 2026 (première lecture).",
      "dossierLegislatif": null,
      "referenceLegislative": null
    },
    "modePublicationDesVotes": "DecompteNominatif",
    "syntheseVote": {
      "nombreVotants": "237",
      "suffragesExprimes": "223",
      "nbrSuffragesRequis": "112",
      "annonce": "L'Assemblée nationale n'a pas adopté",
      "decompte": {
        "nonVotants": "15",
        "pour": "94",
        "contre": "129",
        "abstentions": "14",
        "nonVotantsVolontaires": "0"
      }
    },
    "ventilationVotes": {
      "organe": {
        "organeRef": "PO838901",
        "groupes": {
          "groupe": [
            {
              "organeRef": "PO845401",
              "nombreMembresGroupe": "123",
              "vote": {
                "positionMajoritaire": "contre",
                "decompteVoix": {
                  "nonVotants": "0",
                  "pour": "1",
                  "contre": "48",
                  "abstentions": "2",
                  "nonVotantsVolontaires": "2"
                },
                "decompteNominatif": {
                  "nonVotants": null,
                  "pours": {
                    "votant": {
                      "acteurRef": "PA841825",
                      "mandatRef": "PM843392",
                      "parDelegation": "false",
                      "numPlace": "155"
                    }
                  },
                  "contres": {
                    "votant": [
                      {
                        "acteurRef": "PA841495",
                        "mandatRef": "PM843065",
                        "parDelegation": "false",
                        "numPlace": "010"
                      },
                      {
                        "acteurRef": "PA794562",
                        "mandatRef": "PM840339",
                        "parDelegation": "false",
                        "numPlace": "094"
                      },
                      {
                        "acteurRef": "PA793238",
                        "mandatRef": "PM842426",
                        "parDelegation": "false",
                        "numPlace": "073"
                      },
                      "... (48 entrees au total, tronque)"
                    ]
                  },
                  "abstentions": {
                    "votant": [
                      {
                        "acteurRef": "PA841645",
                        "mandatRef": "PM843200",
                        "parDelegation": "false",
                        "numPlace": "054"
                      },
                      {
                        "acteurRef": "PA793832",
                        "mandatRef": "PM842678",
                        "parDelegation": "false",
                        "numPlace": "126"
                      }
                    ]
                  }
                }
              }
            },
            {
              "organeRef": "PO845407",
              "nombreMembresGroupe": "92",
              "vote": {
                "positionMajoritaire": "contre",
                "decompteVoix": {
                  "nonVotants": "7",
                  "pour": "1",
                  "contre": "41",
                  "abstentions": "0",
                  "nonVotantsVolontaires": "0"
                },
                "decompteNominatif": {
                  "nonVotants": {
                    "votant": [
                      {
                        "acteurRef": "PA795950",
                        "mandatRef": "PM843419",
                        "parDelegation": "false",
                        "numPlace": "389",
                        "causePositionVote": "MG"
                      },
                      {
                        "acteurRef": "PA721908",
                        "mandatRef": "PM843467",
                        "parDelegation": "false",
                        "numPlace": "402",
                        "causePositionVote": "PAN"
                      },
                      {
                        "acteurRef": "PA795990",
                        "mandatRef": "PM856036",
                        "parDelegation": "false",
                        "numPlace": "322",
                        "causePositionVote": "MG"
                      },
                      "... (7 entrees au total, tronque)"
                    ]
                  },
                  "pours": {
                    "votant": {
                      "acteurRef": "PA719890",
                      "mandatRef": "PM842855",
                      "parDelegation": "false",
                      "numPlace": "257"
                    }
                  },
                  "contres": {
                    "votant": [
                      {
                        "acteurRef": "PA721158",
                        "mandatRef": "PM843806",
                        "parDelegation": "false",
                        "numPlace": "281"
                      },
                      {
                        "acteurRef": "PA722190",
                        "mandatRef": "PM843659",
                        "parDelegation": "false",
                        "numPlace": "267"
                      },
                      {
                        "acteurRef": "PA642695",
                        "mandatRef": "PM842594",
                        "parDelegation": "true",
                        "numPlace": "286"
                      },
                      "... (41 entrees au total, tronque)"
                    ]
                  },
                  "abstentions": null
                }
              }
            },
            {
              "organeRef": "PO845413",
              "nombreMembresGroupe": "71",
              "vote": {
                "positionMajoritaire": "pour",
                "decompteVoix": {
                  "nonVotants": "0",
                  "pour": "25",
                  "contre": "0",
                  "abstentions": "0",
                  "nonVotantsVolontaires": "0"
                },
                "decompteNominatif": {
                  "nonVotants": null,
                  "pours": {
                    "votant": [
                      {
                        "acteurRef": "PA795228",
                        "mandatRef": "PM840447",
                        "parDelegation": "false",
                        "numPlace": "627"
                      },
                      {
                        "acteurRef": "PA793262",
                        "mandatRef": "PM842438",
                        "parDelegation": "false",
                        "numPlace": "571"
                      },
                      {
                        "acteurRef": "PA794906",
                        "mandatRef": "PM843284",
                        "parDelegation": "false",
                        "numPlace": "544"
                      },
                      "... (25 entrees au total, tronque)"
                    ]
                  },
                  "contres": null,
                  "abstentions": null
                }
              }
            },
            "... (12 entrees au total, tronque)"
          ]
        }
      }
    },
    "miseAuPoint": {
      "nonVotants": [
        null,
        {
          "votant": {
            "acteurRef": "PA721296",
            "mandatRef": "PM843698",
            "parDelegation": "false",
            "numPlace": "313"
          }
        }
      ],
      "pours": {
        "votant": [
          {
            "acteurRef": "PA774954",
            "mandatRef": "PM842843",
            "parDelegation": "false",
            "numPlace": "183"
          },
          {
            "acteurRef": "PA721816",
            "mandatRef": "PM843551",
            "parDelegation": "false",
            "numPlace": "176"
          },
          {
            "acteurRef": "PA793394",
            "mandatRef": "PM842486",
            "parDelegation": "false",
            "numPlace": "453"
          },
          "... (5 entrees au total, tronque)"
        ]
      },
      "abstentions": [
        null,
        {
          "votant": [
            {
              "acteurRef": "PA841315",
              "mandatRef": "PM842906",
              "parDelegation": "false",
              "numPlace": "565"
            },
            {
              "acteurRef": "PA841243",
              "mandatRef": "PM842825",
              "parDelegation": "false",
              "numPlace": "566"
            }
          ]
        }
      ],
      "nonVotantsVolontaires": [
        null,
        null
      ],
      "contres": {
        "votant": {
          "acteurRef": "PA795402",
          "mandatRef": "PM873746",
          "parDelegation": "false",
          "numPlace": "312"
        }
      },
      "dysfonctionnement": {
        "nonVotants": null,
        "pour": null,
        "contre": null,
        "abstentions": null,
        "nonVotantsVolontaires": null
      }
    },
    "lieuVote": "Hémicycle"
  }
}
```
