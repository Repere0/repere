# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **3119**
- Scrutins analyses pour l'arborescence : **60**
- Premier fichier : `PA1001.json`

## Arborescence des cles

`vu` = sur combien des 60 scrutins analyses la cle est presente. Une cle vue
moins de 60 fois est optionnelle, et l'ingestion doit la traiter comme telle.

| chemin | type | vu | exemples |
|---|---|---|---|
| `acteur.@xmlns` | texte | 60 | http://schemas.assemblee-nationale.fr/referentiel |
| `acteur.uid.@xmlns:xsi` | texte | 60 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.uid.@xsi:type` | texte | 60 | IdActeur_type |
| `acteur.uid.#text` | texte | 60 | PA1001 · PA1002 |
| `acteur.etatCivil.ident.civ` | texte | 60 | M. · Mme |
| `acteur.etatCivil.ident.prenom` | texte | 60 | Marc-Philippe · Yves |
| `acteur.etatCivil.ident.nom` | texte | 60 | Daubresse · Dauge |
| `acteur.etatCivil.ident.alpha` | texte | 60 | Daubresse · Dauge |
| `acteur.etatCivil.ident.trigramme.@xmlns:xsi` | texte | 59 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.ident.trigramme.@xsi:nil` | texte | 59 | true |
| `acteur.etatCivil.infoNaissance.dateNais` | texte | 60 | 1953-08-01 · 1935-01-26 |
| `acteur.etatCivil.infoNaissance.villeNais` | texte | 45 | Lille · Fontevraud-l'Abbaye |
| `acteur.etatCivil.infoNaissance.depNais` | texte | 42 | Nord · Maine-et-Loire |
| `acteur.etatCivil.infoNaissance.paysNais` | texte | 18 | France · Maroc |
| `acteur.etatCivil.dateDeces.@xmlns:xsi` | texte | 40 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.dateDeces.@xsi:nil` | texte | 40 | true |
| `acteur.profession.libelleCourant` | texte | 45 | Ancien directeur d'une société de recrutement · Inspecteur général de l'équipement |
| `acteur.profession.socProcINSEE.catSocPro` | texte | 45 | Anciens artisans, commerçants, chefs d'entreprise · Cadres de la fonction publique, professions intellectuelles et  artistiques |
| `acteur.profession.socProcINSEE.famSocPro` | texte | 45 | Retraités · Cadres et professions intellectuelles supérieures |
| `acteur.uri_hatvp.@xmlns:xsi` | texte | 59 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.uri_hatvp.@xsi:nil` | texte | 59 | true |
| `acteur.adresses.adresse[]` | liste (2)/liste (3)/liste (4)/liste (5)/liste (7)/liste (8) | 43 |  |
| `acteur.adresses.adresse[].@xmlns:xsi` | texte | 43 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.adresses.adresse[].@xsi:type` | texte | 43 | AdressePostale_Type · AdresseMail_Type |
| `acteur.adresses.adresse[].uid` | texte | 43 | AD386857 · AD45838 |
| `acteur.adresses.adresse[].type` | texte | 43 | 0 · 15 |
| `acteur.adresses.adresse[].typeLibelle` | texte | 43 | Adresse officielle · Mèl |
| `acteur.adresses.adresse[].poids` | texte/vide | 43 | 1 · 21 |
| `acteur.adresses.adresse[].adresseDeRattachement` | vide | 43 |  |
| `acteur.adresses.adresse[].intitule` | texte/vide | 34 | Assemblée nationale, · Casier de la Poste, |
| `acteur.adresses.adresse[].numeroRue` | texte/vide | 34 | 126 · 4 |
| `acteur.adresses.adresse[].nomRue` | texte/vide | 34 | Rue de l'Université, · Rue Chaulan, |
| `acteur.adresses.adresse[].complementAdresse` | texte/vide | 34 | Palais Bourbon, |
| `acteur.adresses.adresse[].codePostal` | texte | 34 | 75355 · 13400 |
| `acteur.adresses.adresse[].ville` | texte | 34 | Paris 07 SP · Aubagne |
| `acteur.mandats.mandat[]` | liste (10)/liste (111)/liste (115)/liste (116)/liste (117)/liste (12)/liste (135)/liste (14)/liste (16)/liste (160)/liste (17)/liste (19)/liste (2)/liste (20)/liste (216)/liste (22)/liste (23)/liste (230)/liste (27)/liste (28)/liste (29)/liste (30)/liste (31)/liste (36)/liste (39)/liste (4)/liste (40)/liste (46)/liste (5)/liste (50)/liste (52)/liste (53)/liste (55)/liste (56)/liste (58)/liste (59)/liste (6)/liste (68)/liste (7)/liste (71)/liste (72)/liste (76)/liste (78)/liste (8)/liste (85)/liste (88)/liste (89)/liste (9)/liste (93) | 60 |  |
| `acteur.mandats.mandat[].@xmlns:xsi` | texte | 60 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.mandats.mandat[].@xsi:type` | texte | 60 | MandatSimple_Type · MandatMission_Type |
| `acteur.mandats.mandat[].uid` | texte | 60 | PM391145 · PM227315 |
| `acteur.mandats.mandat[].acteurRef` | texte | 60 | PA1001 · PA1002 |
| `acteur.mandats.mandat[].legislature` | texte/vide | 60 | 13 · 15 |
| `acteur.mandats.mandat[].typeOrgane` | texte | 60 | DELEGBUREAU · GROUPESENAT |
| `acteur.mandats.mandat[].dateDebut` | texte | 60 | 2007-06-28 · 2001-10-02 |
| `acteur.mandats.mandat[].datePublication` | texte/vide | 60 | 2001-10-03 · 2017-12-07 |
| `acteur.mandats.mandat[].dateFin` | texte/vide | 60 | 2008-10-08 · 2011-09-30 |
| `acteur.mandats.mandat[].preseance` | texte/vide | 60 | 24 · 4 |
| `acteur.mandats.mandat[].nominPrincipale` | texte | 60 | 0 · 1 |
| `acteur.mandats.mandat[].infosQualite.codeQualite` | texte/vide | 60 | Membre · Rapporteur |
| `acteur.mandats.mandat[].infosQualite.libQualite` | texte | 60 | Membre · Membre du |
| `acteur.mandats.mandat[].infosQualite.libQualiteSex` | texte | 60 | Membre · Membre du |
| `acteur.mandats.mandat[].organes.organeRef` | texte | 60 | PO391141 · PO77710 |
| `acteur.etatCivil.infoNaissance.paysNais.@xmlns:xsi` | texte | 42 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.paysNais.@xsi:nil` | texte | 42 | true |
| `acteur.etatCivil.ident.trigramme` | texte | 1 | ADA |
| `acteur.uri_hatvp` | texte | 1 | https://www.hatvp.fr/pages_nominatives/david-alain |
| `acteur.mandats.mandat[].libelle` | vide | 4 |  |
| `acteur.mandats.mandat[].missionSuivanteRef` | vide | 4 |  |
| `acteur.mandats.mandat[].missionPrecedenteRef` | vide | 4 |  |
| `acteur.etatCivil.dateDeces` | texte | 20 | 2025-02-16 · 2022-01-01 |
| `acteur.adresses.adresse[].valElec` | texte | 9 | charlesdelaverpilliere@orange.fr · mdehoux@assemblee-nationale.fr |
| `acteur.etatCivil.infoNaissance.villeNais.@xmlns:xsi` | texte | 15 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.villeNais.@xsi:nil` | texte | 15 | true |
| `acteur.etatCivil.infoNaissance.depNais.@xmlns:xsi` | texte | 18 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.depNais.@xsi:nil` | texte | 18 | true |
| `acteur.profession.libelleCourant.@xmlns:xsi` | texte | 15 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.libelleCourant.@xsi:nil` | texte | 15 | true |
| `acteur.adresses.adresse.@xmlns:xsi` | texte | 17 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.adresses.adresse.@xsi:type` | texte | 17 | AdresseSiteWeb_Type · AdressePostale_Type |
| `acteur.adresses.adresse.uid` | texte | 17 | AD317085 · AD317633 |
| `acteur.adresses.adresse.type` | texte | 17 | 23 · 0 |
| `acteur.adresses.adresse.typeLibelle` | texte | 17 | Url sénateur · Adresse officielle |
| `acteur.adresses.adresse.poids` | texte/vide | 17 | 1 |
| `acteur.adresses.adresse.adresseDeRattachement` | vide | 17 |  |
| `acteur.adresses.adresse.valElec` | texte | 15 | https://www.senat.fr/senateur/debre_isabelle04081k.html · https://www.senat.fr/senateur/del_picchia_robert98018t.html |
| `acteur.mandats.mandat[].suppleants` | vide | 14 |  |
| `acteur.profession.socProcINSEE.catSocPro.@xmlns:xsi` | texte | 15 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.socProcINSEE.catSocPro.@xsi:nil` | texte | 15 | true |
| `acteur.profession.socProcINSEE.famSocPro.@xmlns:xsi` | texte | 15 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.socProcINSEE.famSocPro.@xsi:nil` | texte | 15 | true |
| `acteur.adresses.adresse.intitule` | texte | 2 | Casier de la Poste, |
| `acteur.adresses.adresse.numeroRue` | vide | 2 |  |
| `acteur.adresses.adresse.nomRue` | vide | 2 |  |
| `acteur.adresses.adresse.complementAdresse` | texte | 2 | Palais Bourbon, |
| `acteur.adresses.adresse.codePostal` | texte | 2 | 75355 |
| `acteur.adresses.adresse.ville` | texte | 2 | Paris 07 SP |

## Un scrutin entier, listes tronquees a trois entrees

```json
{
  "acteur": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "uid": {
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "@xsi:type": "IdActeur_type",
      "#text": "PA1001"
    },
    "etatCivil": {
      "ident": {
        "civ": "M.",
        "prenom": "Marc-Philippe",
        "nom": "Daubresse",
        "alpha": "Daubresse",
        "trigramme": {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:nil": "true"
        }
      },
      "infoNaissance": {
        "dateNais": "1953-08-01",
        "villeNais": "Lille",
        "depNais": "Nord",
        "paysNais": "France"
      },
      "dateDeces": {
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xsi:nil": "true"
      }
    },
    "profession": {
      "libelleCourant": "Ancien directeur d'une société de recrutement",
      "socProcINSEE": {
        "catSocPro": "Anciens artisans, commerçants, chefs d'entreprise",
        "famSocPro": "Retraités"
      }
    },
    "uri_hatvp": {
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "@xsi:nil": "true"
    },
    "adresses": {
      "adresse": [
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "AdressePostale_Type",
          "uid": "AD386857",
          "type": "0",
          "typeLibelle": "Adresse officielle",
          "poids": "1",
          "adresseDeRattachement": null,
          "intitule": "Assemblée nationale,",
          "numeroRue": "126",
          "nomRue": "Rue de l'Université,",
          "complementAdresse": null,
          "codePostal": "75355",
          "ville": "Paris 07 SP"
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "AdresseTelephonique_Type",
          "uid": "AD395657",
          "type": "11",
          "typeLibelle": "Téléphone",
          "poids": "1",
          "adresseDeRattachement": "AD386857",
          "valElec": "01 40 63 75 53"
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "AdresseTelephonique_Type",
          "uid": "AD395658",
          "type": "12",
          "typeLibelle": "Télécopie",
          "poids": "1",
          "adresseDeRattachement": "AD386857",
          "valElec": "01 40 63 79 37"
        },
        "... (7 entrees au total, tronque)"
      ]
    },
    "mandats": {
      "mandat": [
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatSimple_Type",
          "uid": "PM391145",
          "acteurRef": "PA1001",
          "legislature": "13",
          "typeOrgane": "DELEGBUREAU",
          "dateDebut": "2007-06-28",
          "datePublication": null,
          "dateFin": "2008-10-08",
          "preseance": "24",
          "nominPrincipale": "0",
          "infosQualite": {
            "codeQualite": "Membre",
            "libQualite": "Membre",
            "libQualiteSex": "Membre"
          },
          "organes": {
            "organeRef": "PO391141"
          }
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatSimple_Type",
          "uid": "PM778068",
          "acteurRef": "PA1001",
          "legislature": null,
          "typeOrgane": "DELEGSENAT",
          "dateDebut": "2020-10-20",
          "datePublication": null,
          "dateFin": null,
          "preseance": "4",
          "nominPrincipale": "1",
          "infosQualite": {
            "codeQualite": "Membre",
            "libQualite": "Membre",
            "libQualiteSex": "Membre"
          },
          "organes": {
            "organeRef": "PO420388"
          }
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatSimple_Type",
          "uid": "PM15423365",
          "acteurRef": "PA1001",
          "legislature": null,
          "typeOrgane": "GOUVERNEMENT",
          "dateDebut": "2010-03-22",
          "datePublication": "2010-03-23",
          "dateFin": "2010-11-13",
          "preseance": "50",
          "nominPrincipale": "1",
          "infosQualite": {
            "codeQualite": "membre",
            "libQualite": "membre",
            "libQualiteSex": "membre"
          },
          "organes": {
            "organeRef": "PO384206"
          }
        },
        "... (72 entrees au total, tronque)"
      ]
    }
  }
}
```
