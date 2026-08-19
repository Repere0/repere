# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **8434**
- Scrutins analyses pour l'arborescence : **60**
- Premier fichier : `json/VTANR5L17V1.json`

## Arborescence des cles

`vu` = sur combien des 60 scrutins analyses la cle est presente. Une cle vue
moins de 60 fois est optionnelle, et l'ingestion doit la traiter comme telle.

| chemin | type | vu | exemples |
|---|---|---|---|
| `scrutin.@xmlns` | texte | 60 | http://schemas.assemblee-nationale.fr/referentiel |
| `scrutin.@xmlns:xsi` | texte | 60 | http://www.w3.org/2001/XMLSchema-instance |
| `scrutin.uid` | texte | 60 | VTANR5L17V1 · VTANR5L17V10 |
| `scrutin.numero` | texte | 60 | 1 · 10 |
| `scrutin.organeRef` | texte | 60 | PO838901 |
| `scrutin.legislature` | texte | 60 | 17 |
| `scrutin.sessionRef` | texte | 60 | SCR5A2025O1 |
| `scrutin.seanceRef` | texte | 60 | RUANR5L17S2025IDS28596 · RUANR5L17S2025IDS28586 |
| `scrutin.dateScrutin` | texte | 60 | 2024-10-08 · 2024-10-22 |
| `scrutin.quantiemeJourSeance` | texte | 60 | 1 · 2 |
| `scrutin.typeVote.codeTypeVote` | texte | 60 | MOC · SPO |
| `scrutin.typeVote.libelleTypeVote` | texte | 60 | motion de censure · scrutin public ordinaire |
| `scrutin.typeVote.typeMajorite` | texte | 60 | Majorité requise pour une motion de censure · Majorité absolue des suffrages exprimés |
| `scrutin.sort.code` | texte | 60 | rejeté · adopté |
| `scrutin.sort.libelle` | texte | 60 | L'Assemblée nationale n'a pas adopté · l'Assemblée nationale a adopté |
| `scrutin.titre` | texte | 60 | la motion de censure déposée en application de l'article 49, alinéa 2, de la Constituti... · l'amendement n° 1762 de M. Le Coq et l'amendement identique suivant à l'article 2 du pr... |
| `scrutin.demandeur.texte` | texte/vide | 60 | Présidente du groupe "La France insoumise - Nouveau Front Populaire" · Présidente du groupe "Rassemblement National" |
| `scrutin.demandeur.referenceLegislative` | vide | 60 |  |
| `scrutin.objet.libelle` | texte | 60 | la motion de censure déposée en application de l'article 49, alinéa 2, de la Constituti... · l'amendement n° 1762 de M. Le Coq et l'amendement identique suivant à l'article 2 du pr... |
| `scrutin.objet.dossierLegislatif` | vide | 60 |  |
| `scrutin.objet.referenceLegislative` | vide | 60 |  |
| `scrutin.modePublicationDesVotes` | texte | 60 | DecompteNominatif |
| `scrutin.syntheseVote.nombreVotants` | texte | 60 | 197 · 187 |
| `scrutin.syntheseVote.suffragesExprimes` | texte | 60 | 197 · 183 |
| `scrutin.syntheseVote.nbrSuffragesRequis` | texte | 60 | 289 · 92 |
| `scrutin.syntheseVote.annonce` | texte | 60 | L'Assemblée nationale n'a pas adopté · l'Assemblée nationale a adopté |
| `scrutin.syntheseVote.decompte.nonVotants` | texte | 60 | 10 · 4 |
| `scrutin.syntheseVote.decompte.pour` | texte | 60 | 197 · 77 |
| `scrutin.syntheseVote.decompte.contre` | texte | 60 | 0 · 106 |
| `scrutin.syntheseVote.decompte.abstentions` | texte | 60 | 0 · 4 |
| `scrutin.syntheseVote.decompte.nonVotantsVolontaires` | texte | 60 | 0 |
| `scrutin.ventilationVotes.organe.organeRef` | texte | 60 | PO838901 |
| `scrutin.ventilationVotes.organe.groupes.groupe[]` | liste (12) | 60 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].organeRef` | texte | 60 | PO845401 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].nombreMembresGroupe` | texte | 60 | 125 · 123 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.positionMajoritaire` | texte | 60 | pour · contre |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.nonVotants` | texte | 60 | 0 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.pour` | texte | 60 | 0 · 78 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.contre` | texte | 60 | 0 · 56 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.abstentions` | texte | 60 | 0 · 43 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteVoix.nonVotantsVolontaires` | texte | 60 | 0 · 43 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.nonVotants` | vide | 60 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours` | vide | 24 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres` | vide | 39 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions` | vide | 54 |  |
| `scrutin.miseAuPoint.nonVotants[]` | liste (2)/vide | 120 |  |
| `scrutin.miseAuPoint.pours` | vide | 56 |  |
| `scrutin.miseAuPoint.abstentions[]` | liste (2)/vide | 120 |  |
| `scrutin.miseAuPoint.nonVotantsVolontaires[]` | liste (2)/vide | 120 |  |
| `scrutin.miseAuPoint.contres` | vide | 56 |  |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotants` | vide | 60 |  |
| `scrutin.miseAuPoint.dysfonctionnement.pour` | vide | 60 |  |
| `scrutin.miseAuPoint.dysfonctionnement.contre` | vide | 60 |  |
| `scrutin.miseAuPoint.dysfonctionnement.abstentions` | vide | 60 |  |
| `scrutin.miseAuPoint.dysfonctionnement.nonVotantsVolontaires` | vide | 60 |  |
| `scrutin.lieuVote` | texte | 60 | Salons · Hémicycle |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[]` | liste (11)/liste (2)/liste (21)/liste (45)/liste (49)/liste (50)/liste (51)/liste (52)/liste (56)/liste (60)/liste (70)/liste (75)/liste (76)/liste (81)/liste (82)/liste (83) | 21 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].acteurRef` | texte | 21 | PA793362 · PA793238 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].mandatRef` | texte | 21 | PM842465 · PM842426 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].parDelegation` | texte | 21 | false |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.contres.votant[].numPlace` | texte | 21 | 001 · 073 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[]` | liste (10)/liste (104)/liste (16)/liste (18)/liste (2)/liste (24)/liste (27)/liste (44)/liste (47)/liste (48)/liste (50)/liste (51)/liste (52)/liste (56)/liste (59)/liste (6)/liste (67)/liste (7)/liste (78)/liste (86)/liste (89) | 35 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].acteurRef` | texte | 35 | PA841621 · PA793238 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].mandatRef` | texte | 35 | PM843173 · PM842426 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].parDelegation` | texte | 35 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant[].numPlace` | texte | 35 | 143 · 073 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[]` | liste (26)/liste (43)/liste (44)/liste (48)/liste (83) | 6 |  |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].acteurRef` | texte | 6 | PA841451 · PA841495 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].mandatRef` | texte | 6 | PM843035 · PM843065 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].parDelegation` | texte | 6 | false · true |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.abstentions.votant[].numPlace` | texte | 6 | 005 · 010 |
| `scrutin.miseAuPoint.pours.votant.acteurRef` | texte | 3 | PA841947 · PA795164 |
| `scrutin.miseAuPoint.pours.votant.mandatRef` | texte | 3 | PM843503 · PM840444 |
| `scrutin.miseAuPoint.pours.votant.parDelegation` | texte | 3 | false |
| `scrutin.miseAuPoint.pours.votant.numPlace` | texte | 3 | 559 · 618 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.acteurRef` | texte | 1 | PA841981 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.mandatRef` | texte | 1 | PM843533 |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.parDelegation` | texte | 1 | false |
| `scrutin.ventilationVotes.organe.groupes.groupe[].vote.decompteNominatif.pours.votant.numPlace` | texte | 1 | 041 |
| `scrutin.miseAuPoint.contres.votant.acteurRef` | texte | 3 | PA841981 · PA342384 |
| `scrutin.miseAuPoint.contres.votant.mandatRef` | texte | 3 | PM843533 · PM842771 |
| `scrutin.miseAuPoint.contres.votant.parDelegation` | texte | 3 | false |
| `scrutin.miseAuPoint.contres.votant.numPlace` | texte | 3 | 041 · 637 |
| `scrutin.miseAuPoint.contres.votant[]` | liste (3) | 1 |  |
| `scrutin.miseAuPoint.contres.votant[].acteurRef` | texte | 1 | PA795864 |
| `scrutin.miseAuPoint.contres.votant[].mandatRef` | texte | 1 | PM840429 |
| `scrutin.miseAuPoint.contres.votant[].parDelegation` | texte | 1 | false |
| `scrutin.miseAuPoint.contres.votant[].numPlace` | texte | 1 | 277 |
| `scrutin.miseAuPoint.pours.votant[]` | liste (8) | 1 |  |
| `scrutin.miseAuPoint.pours.votant[].acteurRef` | texte | 1 | PA794570 |
| `scrutin.miseAuPoint.pours.votant[].mandatRef` | texte | 1 | PM843137 |
| `scrutin.miseAuPoint.pours.votant[].parDelegation` | texte | 1 | false |
| `scrutin.miseAuPoint.pours.votant[].numPlace` | texte | 1 | 083 |

## Un scrutin entier, listes tronquees a trois entrees

```json
{
  "scrutin": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "uid": "VTANR5L17V1",
    "numero": "1",
    "organeRef": "PO838901",
    "legislature": "17",
    "sessionRef": "SCR5A2025O1",
    "seanceRef": "RUANR5L17S2025IDS28596",
    "dateScrutin": "2024-10-08",
    "quantiemeJourSeance": "1",
    "typeVote": {
      "codeTypeVote": "MOC",
      "libelleTypeVote": "motion de censure",
      "typeMajorite": "Majorité requise pour une motion de censure"
    },
    "sort": {
      "code": "rejeté",
      "libelle": "L'Assemblée nationale n'a pas adopté"
    },
    "titre": "la motion de censure déposée en application de l'article 49, alinéa 2, de la Constitution par M. Boris Vallaud, Mme Mathilde Panot, Mme Cyrielle Chatelain, M. André Chassaigne et 188 de leurs collègues.",
    "demandeur": {
      "texte": null,
      "referenceLegislative": null
    },
    "objet": {
      "libelle": "la motion de censure déposée en application de l'article 49, alinéa 2, de la Constitution par M. Boris Vallaud, Mme Mathilde Panot, Mme Cyrielle Chatelain, M. André Chassaigne et 188 de leurs collègues.",
      "dossierLegislatif": null,
      "referenceLegislative": null
    },
    "modePublicationDesVotes": "DecompteNominatif",
    "syntheseVote": {
      "nombreVotants": "197",
      "suffragesExprimes": "197",
      "nbrSuffragesRequis": "289",
      "annonce": "L'Assemblée nationale n'a pas adopté",
      "decompte": {
        "nonVotants": "10",
        "pour": "197",
        "contre": "0",
        "abstentions": "0",
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
              "nombreMembresGroupe": "125",
              "vote": {
                "positionMajoritaire": "pour",
                "decompteVoix": {
                  "nonVotants": "0",
                  "pour": "0",
                  "contre": "0",
                  "abstentions": "0",
                  "nonVotantsVolontaires": "0"
                },
                "decompteNominatif": {
                  "nonVotants": null,
                  "pours": null,
                  "contres": null,
                  "abstentions": null
                }
              }
            },
            {
              "organeRef": "PO845407",
              "nombreMembresGroupe": "95",
              "vote": {
                "positionMajoritaire": "pour",
                "decompteVoix": {
                  "nonVotants": "10",
                  "pour": "0",
                  "contre": "0",
                  "abstentions": "0",
                  "nonVotantsVolontaires": "0"
                },
                "decompteNominatif": {
                  "nonVotants": {
                    "votant": [
                      {
                        "acteurRef": "PA795050",
                        "mandatRef": "PM843272",
                        "parDelegation": "false",
                        "numPlace": "322",
                        "causePositionVote": "MG"
                      },
                      {
                        "acteurRef": "PA795958",
                        "mandatRef": "PM843422",
                        "parDelegation": "false",
                        "numPlace": "323",
                        "causePositionVote": "MG"
                      },
                      {
                        "acteurRef": "PA795144",
                        "mandatRef": "PM843359",
                        "parDelegation": "false",
                        "numPlace": "325",
                        "causePositionVote": "MG"
                      },
                      "... (10 entrees au total, tronque)"
                    ]
                  },
                  "pours": null,
                  "contres": null,
                  "abstentions": null
                }
              }
            },
            {
              "organeRef": "PO845413",
              "nombreMembresGroupe": "72",
              "vote": {
                "positionMajoritaire": "pour",
                "decompteVoix": {
                  "nonVotants": "0",
                  "pour": "72",
                  "contre": "0",
                  "abstentions": "0",
                  "nonVotantsVolontaires": "0"
                },
                "decompteNominatif": {
                  "nonVotants": null,
                  "pours": {
                    "votant": [
                      {
                        "acteurRef": "PA794906",
                        "mandatRef": "PM843284",
                        "parDelegation": "false",
                        "numPlace": "544"
                      },
                      {
                        "acteurRef": "PA796070",
                        "mandatRef": "PM843746",
                        "parDelegation": "false",
                        "numPlace": "638"
                      },
                      {
                        "acteurRef": "PA842187",
                        "mandatRef": "PM843704",
                        "parDelegation": "false",
                        "numPlace": "595"
                      },
                      "... (72 entrees au total, tronque)"
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
        null
      ],
      "pours": null,
      "abstentions": [
        null,
        null
      ],
      "nonVotantsVolontaires": [
        null,
        null
      ],
      "contres": null,
      "dysfonctionnement": {
        "nonVotants": null,
        "pour": null,
        "contre": null,
        "abstentions": null,
        "nonVotantsVolontaires": null
      }
    },
    "lieuVote": "Salons"
  }
}
```
