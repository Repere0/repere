# Schema reel du fichier des scrutins de l'Assemblee nationale

Produit par `outils/echantillon_scrutins.py` a partir du fichier telecharge
par la collecte quotidienne. **Ce document est engendre : ne le modifie pas a la main.**

- Fichiers dans l'archive : **3175**
- Fichiers ouverts pour le tirage : **3000** (pas de 1)
- Fichiers decrits : **3000** — tous ceux qui ont ete ouverts
- Cles distinctes trouvees : **147**
- Fichier montre en entier plus bas : `PA793146.json` (le plus riche de l'echantillon)

## Arborescence des cles

`vu` = nombre d'OCCURRENCES de la cle, tous fichiers confondus — pas un
nombre de fichiers : une cle situee dans une liste est comptee une fois par
element. Une cle vue beaucoup moins souvent que les autres est un cas
particulier, et l'ingestion doit la traiter comme facultative. Les cles vues
une seule fois sont reprises a part, plus bas.

| chemin | type | vu | exemples |
|---|---|---|---|
| `acteur.@xmlns` | texte | 3000 | http://schemas.assemblee-nationale.fr/referentiel |
| `acteur.uid.@xmlns:xsi` | texte | 3000 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.uid.@xsi:type` | texte | 3000 | IdActeur_type |
| `acteur.uid.#text` | texte | 3000 | PA1001 · PA1002 |
| `acteur.etatCivil.ident.civ` | texte | 3000 | M. · Mme |
| `acteur.etatCivil.ident.prenom` | texte | 3000 | Marc-Philippe · Yves |
| `acteur.etatCivil.ident.nom` | texte | 3000 | Daubresse · Dauge |
| `acteur.etatCivil.ident.alpha` | texte | 3000 | Daubresse · Dauge |
| `acteur.etatCivil.ident.trigramme.@xmlns:xsi` | texte | 2474 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.ident.trigramme.@xsi:nil` | texte | 2474 | true |
| `acteur.etatCivil.infoNaissance.dateNais` | texte | 2983 | 1953-08-01 · 1935-01-26 |
| `acteur.etatCivil.infoNaissance.villeNais` | texte | 2155 | Lille · Fontevraud-l'Abbaye |
| `acteur.etatCivil.infoNaissance.depNais` | texte | 2001 | Nord · Maine-et-Loire |
| `acteur.etatCivil.infoNaissance.paysNais` | texte | 1790 | France · Maroc |
| `acteur.etatCivil.dateDeces.@xmlns:xsi` | texte | 2731 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.dateDeces.@xsi:nil` | texte | 2731 | true |
| `acteur.profession.libelleCourant` | texte | 2082 | Ancien directeur d'une société de recrutement · Inspecteur général de l'équipement |
| `acteur.profession.socProcINSEE.catSocPro` | texte | 2103 | Anciens artisans, commerçants, chefs d'entreprise · Cadres de la fonction publique, professions intellectuelles et  artistiques |
| `acteur.profession.socProcINSEE.famSocPro` | texte | 2103 | Retraités · Cadres et professions intellectuelles supérieures |
| `acteur.uri_hatvp.@xmlns:xsi` | texte | 2475 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.uri_hatvp.@xsi:nil` | texte | 2475 | true |
| `acteur.adresses.adresse[]` | liste | 2084 | de 2 a 11 entrees |
| `acteur.adresses.adresse[].@xmlns:xsi` | texte | 9011 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.adresses.adresse[].@xsi:type` | texte | 9011 | AdressePostale_Type · AdresseTelephonique_Type |
| `acteur.adresses.adresse[].uid` | texte | 9011 | AD386857 · AD395657 |
| `acteur.adresses.adresse[].type` | texte | 9011 | 0 · 11 |
| `acteur.adresses.adresse[].typeLibelle` | texte | 9011 | Adresse officielle · Téléphone |
| `acteur.adresses.adresse[].poids` | texte/vide | 9011 | 1 · 22 |
| `acteur.adresses.adresse[].adresseDeRattachement` | texte/vide | 9011 | AD386857 · AD726542 |
| `acteur.adresses.adresse[].intitule` | texte/vide | 2805 | Assemblée nationale, · Casier de la Poste, |
| `acteur.adresses.adresse[].numeroRue` | texte/vide | 2805 | 126 · 7 |
| `acteur.adresses.adresse[].nomRue` | texte/vide | 2805 | Rue de l'Université, · Avenue Roger Schwob |
| `acteur.adresses.adresse[].complementAdresse` | texte/vide | 2805 | Palais Bourbon, · BP 49 |
| `acteur.adresses.adresse[].codePostal` | texte/vide | 2805 | 75355 · 33150 |
| `acteur.adresses.adresse[].ville` | texte/vide | 2805 | Paris 07 SP · Cenon |
| `acteur.adresses.adresse[].valElec` | texte/vide | 6206 | 01 40 63 75 53 · 01 40 63 79 37 |
| `acteur.mandats.mandat[]` | liste | 2995 | de 2 a 814 entrees |
| `acteur.mandats.mandat[].@xmlns:xsi` | texte | 98070 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.mandats.mandat[].@xsi:type` | texte | 98070 | MandatSimple_Type · MandatMission_Type |
| `acteur.mandats.mandat[].uid` | texte | 98070 | PM391145 · PM15423365 |
| `acteur.mandats.mandat[].acteurRef` | texte | 98070 | PA1001 · PA1002 |
| `acteur.mandats.mandat[].legislature` | texte/vide | 98070 | 13 · 14 |
| `acteur.mandats.mandat[].typeOrgane` | texte | 98070 | DELEGBUREAU · GOUVERNEMENT |
| `acteur.mandats.mandat[].dateDebut` | texte | 98070 | 2007-06-28 · 2010-03-22 |
| `acteur.mandats.mandat[].datePublication` | texte/vide | 98070 | 2010-03-23 · 2012-06-27 |
| `acteur.mandats.mandat[].dateFin` | texte/vide | 98070 | 2008-10-08 · 2010-11-13 |
| `acteur.mandats.mandat[].preseance` | texte/vide | 98070 | 24 · 50 |
| `acteur.mandats.mandat[].nominPrincipale` | texte | 98070 | 0 · 1 |
| `acteur.mandats.mandat[].infosQualite.codeQualite` | texte/vide | 98070 | Membre · membre |
| `acteur.mandats.mandat[].infosQualite.libQualite` | texte | 98070 | Membre · membre |
| `acteur.mandats.mandat[].infosQualite.libQualiteSex` | texte/vide | 98070 | Membre · membre |
| `acteur.mandats.mandat[].organes.organeRef` | texte | 97950 | PO391141 · PO384206 |
| `acteur.mandats.mandat[].libelle` | texte/vide | 6028 | Mise en place du plan de relance · L'avenir des trains d'équilibre du territoire |
| `acteur.mandats.mandat[].missionSuivanteRef` | texte/vide | 6028 | PM773756 · PM789978 |
| `acteur.mandats.mandat[].missionPrecedenteRef` | texte/vide | 6028 | PM769451 · PM786854 |
| `acteur.mandats.mandat[].suppleants` | vide | 4894 |  |
| `acteur.mandats.mandat[].chambre` | vide | 3208 |  |
| `acteur.mandats.mandat[].election.lieu.region` | texte/vide | 3378 | Auvergne-Rhône-Alpes · Hauts-de-France |
| `acteur.mandats.mandat[].election.lieu.regionType` | texte/vide | 3378 | Métropolitain · Collectivités d'outre-mer et Nouvelle-Calédonie |
| `acteur.mandats.mandat[].election.lieu.departement` | texte/vide | 3378 | Rhône · Nord |
| `acteur.mandats.mandat[].election.lieu.numDepartement` | texte/vide | 3378 | 59 · 37 |
| `acteur.mandats.mandat[].election.lieu.numCirco` | texte/vide | 3378 | 13 · 23 |
| `acteur.mandats.mandat[].election.causeMandat` | texte/vide | 3378 | élections générales · élection partielle, suite à l'annulation de l'élection d'un député |
| `acteur.mandats.mandat[].mandature.datePriseFonction` | texte/vide | 3378 | 2002-06-19 · 2002-12-16 |
| `acteur.mandats.mandat[].mandature.causeFin` | texte/vide | 3378 | Fin de législature · Annulation de l'élection sur décision du Conseil constitutionnel |
| `acteur.mandats.mandat[].mandature.premiereElection` | texte | 3378 | 0 · 1 |
| `acteur.mandats.mandat[].mandature.placeHemicycle` | texte/vide | 3378 | 424 · 178 |
| `acteur.mandats.mandat[].mandature.mandatRemplaceRef` | texte/vide | 3378 | PM267876 · PM386168 |
| `acteur.mandats.mandat[].collaborateurs` | vide | 3241 |  |
| `acteur.etatCivil.infoNaissance.paysNais.@xmlns:xsi` | texte | 1210 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.paysNais.@xsi:nil` | texte | 1210 | true |
| `acteur.etatCivil.ident.trigramme` | texte | 526 | ADA · JGD |
| `acteur.uri_hatvp` | texte | 525 | https://www.hatvp.fr/pages_nominatives/david-alain · https://www.hatvp.fr/pages_nominatives/guedj-jerome |
| `acteur.etatCivil.dateDeces` | texte | 269 | 2025-02-16 · 2022-01-01 |
| `acteur.mandats.mandat[].suppleants.suppleant.dateDebut` | texte | 1041 | 2002-06-19 · 2002-12-15 |
| `acteur.mandats.mandat[].suppleants.suppleant.dateFin` | texte/vide | 1041 | 2007-06-19 · 2012-06-19 |
| `acteur.mandats.mandat[].suppleants.suppleant.suppleantRef` | texte | 1041 | PA267501 · PA333972 |
| `acteur.mandats.mandat[].election.refCirconscription` | texte | 1296 | PO230806 · PO230733 |
| `acteur.etatCivil.infoNaissance.villeNais.@xmlns:xsi` | texte | 845 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.villeNais.@xsi:nil` | texte | 845 | true |
| `acteur.etatCivil.infoNaissance.depNais.@xmlns:xsi` | texte | 999 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.depNais.@xsi:nil` | texte | 999 | true |
| `acteur.profession.libelleCourant.@xmlns:xsi` | texte | 918 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.libelleCourant.@xsi:nil` | texte | 918 | true |
| `acteur.adresses.adresse.@xmlns:xsi` | texte | 839 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.adresses.adresse.@xsi:type` | texte | 839 | AdresseSiteWeb_Type · AdressePostale_Type |
| `acteur.adresses.adresse.uid` | texte | 839 | AD317085 · AD317633 |
| `acteur.adresses.adresse.type` | texte | 839 | 23 · 0 |
| `acteur.adresses.adresse.typeLibelle` | texte | 839 | Url sénateur · Adresse officielle |
| `acteur.adresses.adresse.poids` | texte/vide | 839 | 1 |
| `acteur.adresses.adresse.adresseDeRattachement` | vide | 839 |  |
| `acteur.adresses.adresse.valElec` | texte | 808 | https://www.senat.fr/senateur/debre_isabelle04081k.html · https://www.senat.fr/senateur/del_picchia_robert98018t.html |
| `acteur.profession.socProcINSEE.catSocPro.@xmlns:xsi` | texte | 897 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.socProcINSEE.catSocPro.@xsi:nil` | texte | 897 | true |
| `acteur.profession.socProcINSEE.famSocPro.@xmlns:xsi` | texte | 897 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.profession.socProcINSEE.famSocPro.@xsi:nil` | texte | 897 | true |
| `acteur.adresses.adresse.intitule` | texte | 31 | Casier de la Poste, · Assemblée nationale, |
| `acteur.adresses.adresse.numeroRue` | texte/vide | 31 | 126 |
| `acteur.adresses.adresse.nomRue` | texte/vide | 31 | Rue de l'Université, · Rue de l'université, |
| `acteur.adresses.adresse.complementAdresse` | texte/vide | 31 | Palais Bourbon, |
| `acteur.adresses.adresse.codePostal` | texte | 31 | 75355 |
| `acteur.adresses.adresse.ville` | texte | 31 | Paris 07 SP |
| `acteur.mandats.mandat[].organes.organeRef[]` | liste/texte | 407 | de 2 a 7 entrees · PO702890 · PO702892 |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[]` | liste | 136 | de 2 a 6 entrees |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].qualite` | texte | 483 | M. · Mme |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].prenom` | texte | 483 | Thomas · Bernard |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].nom` | texte | 483 | Jacquelin · Combes |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].dateDebut` | vide | 483 |  |
| `acteur.mandats.mandat[].collaborateurs.collaborateur[].dateFin` | vide | 483 |  |
| `acteur.adresses.@xmlns:xsi` | texte | 77 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.adresses.@xsi:nil` | texte | 77 | true |
| `acteur.mandats.mandat.@xmlns:xsi` | texte | 5 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.mandats.mandat.@xsi:type` | texte | 5 | MandatMission_Type · MandatParlementaire_type |
| `acteur.mandats.mandat.uid` | texte | 5 | PM287498 · PM774376 |
| `acteur.mandats.mandat.acteurRef` | texte | 5 | PA497 · PA720134 |
| `acteur.mandats.mandat.legislature` | texte/vide | 5 | 12 · 15 |
| `acteur.mandats.mandat.typeOrgane` | texte | 5 | MINISTERE · ASSEMBLEE |
| `acteur.mandats.mandat.dateDebut` | texte | 5 | 2002-12-24 · 2017-06-18 |
| `acteur.mandats.mandat.datePublication` | texte/vide | 5 | 2002-12-26 |
| `acteur.mandats.mandat.dateFin` | texte/vide | 5 | 2020-08-01 · 2020-06-24 |
| `acteur.mandats.mandat.preseance` | texte | 5 | 1 · 50 |
| `acteur.mandats.mandat.nominPrincipale` | texte | 5 | 1 |
| `acteur.mandats.mandat.infosQualite.codeQualite` | texte | 5 | en mission · membre |
| `acteur.mandats.mandat.infosQualite.libQualite` | texte | 5 | en mission · membre |
| `acteur.mandats.mandat.infosQualite.libQualiteSex` | texte | 5 | en mission · membre |
| `acteur.mandats.mandat.organes.organeRef` | texte | 5 | PO268781 · PO717460 |
| `acteur.mandats.mandat.libelle` | texte | 1 | La préparation du débat national sur les énergies |
| `acteur.mandats.mandat.missionSuivanteRef` | vide | 1 |  |
| `acteur.mandats.mandat.missionPrecedenteRef` | vide | 1 |  |
| `acteur.mandats.mandat.suppleants` | vide | 4 |  |
| `acteur.mandats.mandat.chambre` | vide | 4 |  |
| `acteur.mandats.mandat.election.lieu.region` | texte/vide | 4 | Pays de la Loire · Ile-de-France |
| `acteur.mandats.mandat.election.lieu.regionType` | texte/vide | 4 | Métropolitain · Dom |
| `acteur.mandats.mandat.election.lieu.departement` | texte/vide | 4 | Maine-et-Loire · Val-de-Marne |
| `acteur.mandats.mandat.election.lieu.numDepartement` | texte | 4 | 49 · 94 |
| `acteur.mandats.mandat.election.lieu.numCirco` | texte/vide | 4 | 3 · 9 |
| `acteur.mandats.mandat.election.causeMandat` | texte/vide | 4 | remplacement d'un député ayant démissionné pour cause d’incompatibilité prévue aux arti... |
| `acteur.mandats.mandat.election.refCirconscription` | texte | 3 | PO717890 · PO718496 |
| `acteur.mandats.mandat.mandature.datePriseFonction` | texte/vide | 4 | 2020-08-01 · 2020-06-24 |
| `acteur.mandats.mandat.mandature.causeFin` | texte/vide | 4 | Démission · Démission avant entrée en fonction |
| `acteur.mandats.mandat.mandature.premiereElection` | texte | 4 | 0 |
| `acteur.mandats.mandat.mandature.placeHemicycle` | vide | 4 |  |
| `acteur.mandats.mandat.mandature.mandatRemplaceRef` | vide | 4 |  |
| `acteur.mandats.mandat.collaborateurs` | vide | 4 |  |
| `acteur.mandats.mandat[].collaborateurs[]` | liste/vide | 3 | 2 entree(s) |
| `acteur.etatCivil.infoNaissance.dateNais.@xmlns:xsi` | texte | 17 | http://www.w3.org/2001/XMLSchema-instance |
| `acteur.etatCivil.infoNaissance.dateNais.@xsi:nil` | texte | 17 | true |

## Cles vues UNE SEULE FOIS

Ce sont les cas particuliers : elles n'existent que dans certains fichiers.
C'est exactement ce que l'ancien tirage — les soixante premiers par ordre
alphabetique — ratait par construction. Une ingestion doit les traiter
comme facultatives.

- `acteur.mandats.mandat.libelle`
- `acteur.mandats.mandat.missionSuivanteRef`
- `acteur.mandats.mandat.missionPrecedenteRef`

## Un fichier entier, listes tronquees a trois entrees

```json
{
  "acteur": {
    "@xmlns": "http://schemas.assemblee-nationale.fr/referentiel",
    "uid": {
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "@xsi:type": "IdActeur_type",
      "#text": "PA793146"
    },
    "etatCivil": {
      "ident": {
        "civ": "M.",
        "prenom": "Nicolas",
        "nom": "Dragon",
        "alpha": "Dragon",
        "trigramme": "NDR"
      },
      "infoNaissance": {
        "dateNais": "1977-04-19",
        "villeNais": "Laon",
        "depNais": {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:nil": "true"
        },
        "paysNais": "France"
      },
      "dateDeces": {
        "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
        "@xsi:nil": "true"
      }
    },
    "profession": {
      "libelleCourant": "Profession libérale",
      "socProcINSEE": {
        "catSocPro": "Professions libérales",
        "famSocPro": "Cadres et professions intellectuelles supérieures"
      }
    },
    "uri_hatvp": "https://www.hatvp.fr/pages_nominatives/dragon-nicolas-24250",
    "adresses": {
      "adresse": [
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "AdressePostale_Type",
          "uid": "AD793148",
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
          "@xsi:type": "AdresseMail_Type",
          "uid": "AD797878",
          "type": "15",
          "typeLibelle": "Mèl",
          "poids": null,
          "adresseDeRattachement": null,
          "valElec": "nicolas.dragon@assemblee-nationale.fr"
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "AdresseSiteWeb_Type",
          "uid": "AD799625",
          "type": "22",
          "typeLibelle": "Site internet",
          "poids": null,
          "adresseDeRattachement": null,
          "valElec": "www.nicolasdragon.com"
        },
        "... (4 entrees au total, tronque)"
      ]
    },
    "mandats": {
      "mandat": [
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatAvecSuppleant_Type",
          "uid": "PM847287",
          "acteurRef": "PA793146",
          "legislature": "17",
          "typeOrgane": "COMNL",
          "dateDebut": "2024-09-20",
          "datePublication": "2024-09-20",
          "dateFin": "2026-04-09",
          "preseance": "20",
          "nominPrincipale": "1",
          "infosQualite": {
            "codeQualite": "Membre",
            "libQualite": "Membre",
            "libQualiteSex": "Membre"
          },
          "organes": {
            "organeRef": "PO415287"
          },
          "suppleants": null
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatAvecSuppleant_Type",
          "uid": "PM881497",
          "acteurRef": "PA793146",
          "legislature": "17",
          "typeOrgane": "COMNL",
          "dateDebut": "2026-05-06",
          "datePublication": "2026-05-06",
          "dateFin": null,
          "preseance": "20",
          "nominPrincipale": "1",
          "infosQualite": {
            "codeQualite": "Membre",
            "libQualite": "Membre",
            "libQualiteSex": "Membre"
          },
          "organes": {
            "organeRef": "PO415287"
          },
          "suppleants": null
        },
        {
          "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "@xsi:type": "MandatSimple_Type",
          "uid": "PM806614",
          "acteurRef": "PA793146",
          "legislature": null,
          "typeOrgane": "PARPOL",
          "dateDebut": "2022-12-02",
          "datePublication": null,
          "dateFin": "2024-06-09",
          "preseance": "5",
          "nominPrincipale": "1",
          "infosQualite": {
            "codeQualite": "Membre",
            "libQualite": "Membre",
            "libQualiteSex": "Membre"
          },
          "organes": {
            "organeRef": "PO761239"
          }
        },
        "... (47 entrees au total, tronque)"
      ]
    }
  }
}
```
