# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **9066**
- Fichiers ouverts pour le tirage : **3000** (pas de 3)
- Fichiers decrits : **3000** — tous ceux qui ont ete ouverts
- Cles distinctes trouvees : **158**
- Fichier montre en entier plus bas : `json/VTANR5L17V3415.json` (le plus riche de l'echantillon)

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
| `scrutin.uid` | texte | 3000 | VTANR5L17V1 · VTANR5L17V1000 |
| `scrutin.numero` | texte | 3000 | 1 · 1000 |
| `scrutin.organeRef` | texte | 3000 | PO838901 |
| `scrutin.legislature` | texte | 3000 | 17 |
| `scrutin.sessionRef` | texte | 3000 | SCR5A2025O1 · SCR5A2025E1 |
| `scrutin.seanceRef` | texte | 3000 | RUANR5L17S2025IDS28596 · RUANR5L17S2025IDS29165 |
| `scrutin.dateScrutin` | texte | 3000 | 2024-10-08 · 2025-03-13 |
| `scrutin.quantiemeJourSeance` | texte | 3000 | 1 · 2 |
| `scrutin.typeVote.codeTypeVote` | texte | 3000 | MOC · SPO |
| `scrutin.typeVote.libelleTypeVote` | texte | 3000 | motion de censure · scrutin public ordinaire |
| `scrutin.typeVote.typeMajorite` | texte | 3000 | Majorité requise pour une motion de censure · Majorité absolue des suffrages exprimés |
| `scrutin.sort.code` | texte | 3000 | rejeté · adopté |
| `scrutin.sort.libelle` | texte | 3000 | L'Assemblée nationale n'a pas adopté · l'Assemblée nationale a adopté |
| `scrutin.titre` | texte | 3000 | la motion de censure déposée en application de l'article 49, alinéa 2, de la Constituti... · l'amendement n° 29 de Mme Pirès Beaune à l'article 2 de la proposition de loi visant à ... |
| `scrutin.demandeur.texte` | texte/vide | 3000 | Président du groupe "Socialistes et apparentés" · Présidente du groupe "Rassemblement National" |
| `scrutin.demandeur.referenceLegislative` | vide | 3000 |  |
| `scrutin.objet.libelle` | texte | 3000 | la motion de censure déposée en application de l'article 49, alinéa 2, de la Constituti... · l'amendement n° 29 de Mme Pirès Beaune à l'article 2 de la proposition de loi visant à ... |
| `scrutin.objet.dossierLegislatif` | vide | 1922 |  |
| `scrutin.objet.referenceLegislative` | vide | 3000 |  |
| `scrutin.modePublicationDesVotes` | texte | 3000 | DecompteNominatif |
| `scrutin.syntheseVote.nombreVotants` | texte | 3000 | 197 · 41 |
| `scrutin.syntheseVote.suffragesExprimes` | texte | 3000 | 197 · 40 |
| `scrutin.syntheseVote.nbrSuffragesRequis` | texte | 3000 | 289 · 21 |
| `scrutin.syntheseVote.annonce` | texte | 3000 | L'Assemblée nationale n'a pas adopté · l'Assemblée nationale a adopté |
| `scrutin.syntheseVote.decompte.nonVotants` | texte | 3000 | 10 · 2 |
| `scrutin.syntheseVote.decompte.pour` | texte | 3000 | 197 · 26 |
| `scrutin.syntheseVote.decompte.contre` | texte | 3000 | 0 · 14 |
| `scrutin.syntheseVote.decompte.abstentions` | texte | 3000 | 0 · 1 |
| `scrutin.syntheseVote.decompte.nonVotantsVolontaires` | texte | 3000 | 0 |
| `scrutin.ventilationVotes.organe.organeRef` | texte | 3000 | PO838901 |
| `scrutin.ventilationVotes.organe.groupes.groupe[]` | liste | 3000 | 12 entree(s) |
| `scrutin.ventilationVotes.organe.groupes.groupe[].organeRef` | texte | 36000 | PO845401 · PO845407 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].nombreMembresGroupe` | texte | 36000 | 125 · 95 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.positionMajoritaire` | texte | 36000 | pour · contre |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.nonVotants` | texte | 36000 | 0 · 10 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.pour` | texte | 36000 | 0 · 72 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.contre` | texte | 36000 | 0 · 7 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.abstentions` | texte | 36000 | 0 · 1 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.nonVotantsVolontaires` | texte | 36000 | 0 · 1 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants` | vide | 30481 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours` | vide | 19384 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres` | vide | 16670 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions` | vide | 31035 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[]` | liste | 1146 | de 2 a 10 entrees |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].acteurRef` | texte | 3697 | PA795050 · PA795958 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].mandatRef` | texte | 3697 | PM843272 · PM843422 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].parDelegation` | texte | 3697 | false |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].numPlace` | texte/vide | 3697 | 322 · 323 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant[].causePositionVote` | texte | 3697 | MG · PSE |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[]` | liste | 13535 | de 2 a 123 entrees |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].acteurRef` | texte | 180267 | PA794906 · PA796070 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].mandatRef` | texte | 180267 | PM843284 · PM843746 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].parDelegation` | texte | 180267 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].numPlace` | texte/vide | 180267 | 544 · 638 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.acteurRef` | texte | 4373 | PA227089 · PA721908 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.mandatRef` | texte | 4373 | PM843131 · PM843467 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.parDelegation` | texte | 4373 | false |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.numPlace` | texte/vide | 4373 | 395 · 402 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants.votant.causePositionVote` | texte | 4373 | MG · PAN |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.acteurRef` | texte | 3081 | PA793796 · PA720728 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.mandatRef` | texte | 3081 | PM842723 · PM843257 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.parDelegation` | texte | 3081 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.numPlace` | texte | 3081 | 485 · 339 |
| `scrutin.miseAuPoint.nonVotants[]` | liste/vide | 8861 | 2 entree(s) |
| `scrutin.miseAuPoint.pours` | vide | 2768 |  |
| `scrutin.miseAuPoint.abstentions[]` | liste/vide | 8946 | 2 entree(s) |
| `scrutin.miseAuPoint.nonVotantsVolontaires[]` | liste/vide | 9000 | 2 entree(s) |
| `scrutin.miseAuPoint.contres` | vide | 2751 |  |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotants` | vide | 3000 |  |
| `scrutin.miseAuPoint.dysfonctionnement.pour` | vide | 2973 |  |
| `scrutin.miseAuPoint.dysfonctionnement.contre` | vide | 2980 |  |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions` | vide | 2999 |  |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires` | vide | 2994 |  |
| `scrutin.lieuVote` | texte | 3000 | Salons · Hémicycle |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[]` | liste | 16482 | de 2 a 125 entrees |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].acteurRef` | texte | 205198 | PA795950 · PA794798 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].mandatRef` | texte | 205198 | PM843419 · PM843188 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].parDelegation` | texte | 205198 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].numPlace` | texte/vide | 205198 | 259 · 365 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant.acteurRef` | texte | 2414 | PA721202 · PA841515 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant.mandatRef` | texte | 2414 | PM840435 · PM843089 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant.parDelegation` | texte | 2414 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant.numPlace` | texte | 2414 | 549 · 594 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant.acteurRef` | texte | 2848 | PA346782 · PA840171 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant.mandatRef` | texte | 2848 | PM840426 · PM840360 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant.parDelegation` | texte | 2848 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant.numPlace` | texte | 2848 | 172 · 419 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[]` | liste | 2551 | de 2 a 96 entrees |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].acteurRef` | texte | 21748 | PA841515 · PA795516 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].mandatRef` | texte | 21748 | PM843089 · PM843452 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].parDelegation` | texte | 21748 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].numPlace` | texte | 21748 | 594 · 596 |
| `scrutin.miseAuPoint.abstentions[].votant.acteurRef` | texte | 32 | PA719822 · PA794778 |
| `scrutin.miseAuPoint.abstentions[].votant.mandatRef` | texte | 32 | PM842762 · PM843239 |
| `scrutin.miseAuPoint.abstentions[].votant.parDelegation` | texte | 32 | false |
| `scrutin.miseAuPoint.abstentions[].votant.numPlace` | texte | 32 | 334 · 501 |
| `scrutin.miseAuPoint.contres.votant.acteurRef` | texte | 181 | PA841981 · PA719930 |
| `scrutin.miseAuPoint.contres.votant.mandatRef` | texte | 181 | PM843533 · PM842870 |
| `scrutin.miseAuPoint.contres.votant.parDelegation` | texte | 181 | false |
| `scrutin.miseAuPoint.contres.votant.numPlace` | texte | 181 | 041 · 427 |
| `scrutin.miseAuPoint.pours.votant[]` | liste | 93 | de 2 a 8 entrees |
| `scrutin.miseAuPoint.pours.votant[].acteurRef` | texte | 263 | PA794570 · PA794582 |
| `scrutin.miseAuPoint.pours.votant[].mandatRef` | texte | 263 | PM843137 · PM840300 |
| `scrutin.miseAuPoint.pours.votant[].parDelegation` | texte | 263 | false |
| `scrutin.miseAuPoint.pours.votant[].numPlace` | texte | 263 | 083 · 101 |
| `scrutin.miseAuPoint.pours.votant.acteurRef` | texte | 139 | PA342384 · PA793780 |
| `scrutin.miseAuPoint.pours.votant.mandatRef` | texte | 139 | PM842771 · PM842714 |
| `scrutin.miseAuPoint.pours.votant.parDelegation` | texte | 139 | false |
| `scrutin.miseAuPoint.pours.votant.numPlace` | texte | 139 | 637 · 517 |
| `scrutin.miseAuPoint.nonVotants[].votant.acteurRef` | texte | 131 | PA793102 · PA722150 |
| `scrutin.miseAuPoint.nonVotants[].votant.mandatRef` | texte | 131 | PM842330 · PM843590 |
| `scrutin.miseAuPoint.nonVotants[].votant.parDelegation` | texte | 131 | false |
| `scrutin.miseAuPoint.nonVotants[].votant.numPlace` | texte | 131 | 153 · 486 |
| `scrutin.miseAuPoint.contres.votant[]` | liste | 68 | de 2 a 48 entrees |
| `scrutin.miseAuPoint.contres.votant[].acteurRef` | texte | 251 | PA794094 · PA840765 |
| `scrutin.miseAuPoint.contres.votant[].mandatRef` | texte | 251 | PM840291 · PM842447 |
| `scrutin.miseAuPoint.contres.votant[].parDelegation` | texte | 251 | false |
| `scrutin.miseAuPoint.contres.votant[].numPlace` | texte | 251 | 436 · 445 |
| `scrutin.miseAuPoint.nonVotants[].votant[]` | liste | 8 | de 2 a 3 entrees |
| `scrutin.miseAuPoint.nonVotants[].votant[].acteurRef` | texte | 19 | PA794702 · PA719338 |
| `scrutin.miseAuPoint.nonVotants[].votant[].mandatRef` | texte | 19 | PM843248 · PM842654 |
| `scrutin.miseAuPoint.nonVotants[].votant[].parDelegation` | texte | 19 | false |
| `scrutin.miseAuPoint.nonVotants[].votant[].numPlace` | texte | 19 | 340 · 387 |
| `scrutin.miseAuPoint.abstentions[].votant[]` | liste | 22 | de 2 a 5 entrees |
| `scrutin.miseAuPoint.abstentions[].votant[].acteurRef` | texte | 55 | PA793980 · PA795454 |
| `scrutin.miseAuPoint.abstentions[].votant[].mandatRef` | texte | 55 | PM842750 · PM843821 |
| `scrutin.miseAuPoint.abstentions[].votant[].parDelegation` | texte | 55 | false |
| `scrutin.miseAuPoint.abstentions[].votant[].numPlace` | texte | 55 | 530 · 542 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant.acteurRef` | texte | 19 | PA342384 · PA795278 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant.mandatRef` | texte | 19 | PM842771 · PM843539 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant.parDelegation` | texte | 19 | false |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant.numPlace` | texte | 19 | 637 · 219 |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires.votant.acteurRef` | texte | 6 | PA793342 · PA721816 |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires.votant.mandatRef` | texte | 6 | PM842345 · PM843551 |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires.votant.parDelegation` | texte | 6 | false |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires.votant.numPlace` | texte | 6 | 204 · 180 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant[]` | liste | 1 | 2 entree(s) |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant[].acteurRef` | texte | 2 | PA608264 · PA774958 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant[].mandatRef` | texte | 2 | PM843179 · PM843389 |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant[].parDelegation` | texte | 2 | false |
| `scrutin.miseAuPoint.dysfonctionnement.contre.votant[].numPlace` | texte | 2 | 475 · 415 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[]` | liste | 1 | 2 entree(s) |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[].acteurRef` | texte | 2 | PA608264 · PA774958 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[].mandatRef` | texte | 2 | PM843179 · PM843389 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[].parDelegation` | texte | 2 | false |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant[].numPlace` | texte | 2 | 475 · 415 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant.acteurRef` | texte | 26 | PA840869 · PA2960 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant.mandatRef` | texte | 26 | PM842522 · PM843140 |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant.parDelegation` | texte | 26 | false |
| `scrutin.miseAuPoint.dysfonctionnement.pour.votant.numPlace` | texte | 26 | 047 · 250 |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.acteurRef` | texte | 1 | PA840869 |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.mandatRef` | texte | 1 | PM842522 |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.parDelegation` | texte | 1 | false |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.numPlace` | texte | 1 | 047 |
| `scrutin.objet.dossierLegislatif.libelle` | texte | 1078 | Simplifier la sortie de l’indivision successorale · Renforcer la place des agriculteurs dans l’aménagement du territoire et à sécuriser l’e... |
| `scrutin.objet.dossierLegislatif.dossierRef` | texte | 1078 | DLR5L17N51329 · DLR5L17N53715 |

## Cles vues UNE SEULE FOIS

Ce sont les cas particuliers : elles n'existent que dans certains fichiers.
C'est exactement ce que l'ancien tirage — les soixante premiers par ordre
alphabetique — ratait par construction. Une ingestion doit les traiter
comme facultatives.

- `scrutin.miseAuPoint.dysfonctionnement.contre.votant[]`
- `scrutin.miseAuPoint.dysfonctionnement.pour.votant[]`
- `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.acteurRef`
- `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.mandatRef`
- `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.parDelegation`
- `scrutin.miseAuPoint.dysfonctionnement.abstentions.votant.numPlace`

## Un fichier entier, listes tronquees a trois entrees

```json
{
  "scrutin": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "uid": "VTANR5L17V3415",
    "numero": "3415",
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
      "code": "adopté",
      "libelle": "l'Assemblée nationale a adopté"
    },
    "titre": "l'amendement n° 721 de M. de Courson après l'article 5 du projet de loi de financement de la sécurité sociale pour 2026 (première lecture).",
    "demandeur": {
      "texte": "Président du groupe \"Libertés, Indépendants, Outre-mer et Territoires\"\rPrésident du groupe \"Union des droites pour la République\"",
      "referenceLegislative": null
    },
    "objet": {
      "libelle": "l'amendement n° 721 de M. de Courson après l'article 5 du projet de loi de financement de la sécurité sociale pour 2026 (première lecture).",
      "dossierLegislatif": null,
      "referenceLegislative": null
    },
    "modePublicationDesVotes": "DecompteNominatif",
    "syntheseVote": {
      "nombreVotants": "251",
      "suffragesExprimes": "235",
      "nbrSuffragesRequis": "118",
      "annonce": "l'Assemblée nationale a adopté",
      "decompte": {
        "nonVotants": "15",
        "pour": "131",
        "contre": "104",
        "abstentions": "16",
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
                "positionMajoritaire": "pour",
                "decompteVoix": {
                  "nonVotants": "0",
                  "pour": "66",
                  "contre": "0",
                  "abstentions": "0",
                  "nonVotantsVolontaires": "0"
                },
                "decompteNominatif": {
                  "nonVotants": null,
                  "pours": {
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
                        "acteurRef": "PA842279",
                        "mandatRef": "PM843779",
                        "parDelegation": "false",
                        "numPlace": "026"
                      },
                      "... (66 entrees au total, tronque)"
                    ]
                  },
                  "contres": null,
                  "abstentions": null
                }
              }
            },
            {
              "organeRef": "PO845407",
              "nombreMembresGroupe": "92",
              "vote": {
                "positionMajoritaire": "pour",
                "decompteVoix": {
                  "nonVotants": "7",
                  "pour": "7",
                  "contre": "35",
                  "abstentions": "1",
                  "nonVotantsVolontaires": "1"
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
                    "votant": [
                      {
                        "acteurRef": "PA794330",
                        "mandatRef": "PM842945",
                        "parDelegation": "true",
                        "numPlace": "397"
                      },
                      {
                        "acteurRef": "PA793940",
                        "mandatRef": "PM842726",
                        "parDelegation": "false",
                        "numPlace": "279"
                      },
                      {
                        "acteurRef": "PA722366",
                        "mandatRef": "PM843299",
                        "parDelegation": "false",
                        "numPlace": "294"
                      },
                      "... (7 entrees au total, tronque)"
                    ]
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
                        "acteurRef": "PA642695",
                        "mandatRef": "PM842594",
                        "parDelegation": "true",
                        "numPlace": "286"
                      },
                      {
                        "acteurRef": "PA719890",
                        "mandatRef": "PM842855",
                        "parDelegation": "false",
                        "numPlace": "257"
                      },
                      "... (35 entrees au total, tronque)"
                    ]
                  },
                  "abstentions": {
                    "votant": {
                      "acteurRef": "PA722000",
                      "mandatRef": "PM843542",
                      "parDelegation": "false",
                      "numPlace": "293"
                    }
                  }
                }
              }
            },
            {
              "organeRef": "PO845413",
              "nombreMembresGroupe": "71",
              "vote": {
                "positionMajoritaire": "contre",
                "decompteVoix": {
                  "nonVotants": "0",
                  "pour": "1",
                  "contre": "24",
                  "abstentions": "0",
                  "nonVotantsVolontaires": "0"
                },
                "decompteNominatif": {
                  "nonVotants": null,
                  "pours": {
                    "votant": {
                      "acteurRef": "PA793532",
                      "mandatRef": "PM842591",
                      "parDelegation": "false",
                      "numPlace": "650"
                    }
                  },
                  "contres": {
                    "votant": [
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
                      {
                        "acteurRef": "PA795588",
                        "mandatRef": "PM843557",
                        "parDelegation": "true",
                        "numPlace": "643"
                      },
                      "... (24 entrees au total, tronque)"
                    ]
                  },
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
            "acteurRef": "PA605694",
            "mandatRef": "PM842609",
            "parDelegation": "false",
            "numPlace": "336"
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
            "acteurRef": "PA841091",
            "mandatRef": "PM842705",
            "parDelegation": "false",
            "numPlace": "473"
          }
        ]
      },
      "abstentions": [
        null,
        null
      ],
      "nonVotantsVolontaires": [
        null,
        null
      ],
      "contres": {
        "votant": {
          "acteurRef": "PA793532",
          "mandatRef": "PM842591",
          "parDelegation": "false",
          "numPlace": "650"
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
